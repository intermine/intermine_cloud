#! python

"""Setup scripts."""

import argparse
import os
from pathlib import Path
import platform
import re
from shutil import which, unpack_archive
import shutil
from subprocess import run
import sys
import urllib3


def check_docker() -> int:
    """Check if docker is present on the system."""
    print("+++++++++++ Docker +++++++++++++")
    if which("docker") is None:
        print("Docker not found!")
        return 1

    out = run(["docker", "info"], capture_output=True)

    permission_denied = re.search(
        r"permission denied", out.stdout.decode("utf-8"), re.IGNORECASE
    )
    cannot_connect = re.search(
        r"cannot connect", out.stdout.decode("utf-8"), re.IGNORECASE
    )
    if out.returncode != 0:
        if permission_denied:
            print(
                """
You do not have permission to access the docker daemon.

Please run `sudo groupadd docker` followed by
`sudo usermod -aG docker $USER`,
then log out and log back in.
See https://docs.docker.com/install/linux/linux-postinstall/ for more information.
                """
            )
            return 1
        elif cannot_connect:
            print(
                """
You don't seem to have a running docker daemon.

See https://docs.docker.com/install/ for instructions on installing
the Docker Engine. If you're using a Linux distro, you can install docker
with your package manager.
                """
            )
            return 1
        else:
            print(out.stdout.decode("utf-8"))
            return 1
    else:
        print(f"Using Docker at: {which('docker')} \n\n{out.stdout.decode('utf-8')}")
        return 0


project_root = Path(__file__).absolute().parents[1]
compose_path = project_root.joinpath("compose")
demon_path = project_root.joinpath("demon")
tools_path = project_root.joinpath("scratch", "tools")


current_system = platform.system()
current_machine = platform.machine()

client = urllib3.PoolManager()


def setup_miniconda() -> None:
    """Setup miniconda."""
    print("+++++++++++ Miniconda +++++++++++++")
    if os.path.isfile((tools_path / "miniconda" / "bin" / "conda")) is False:
        print("Isolated conda not found!\nInstalling Conda\n")
        if current_system == "Darwin":
            local_system = "MacOSX"
        else:
            local_system = current_system

        # Decide platform architecture
        local_machine = current_machine

        # Build url
        url = f"https://repo.anaconda.com/miniconda/Miniconda3-latest-{local_system}-{local_machine}.sh"

        resp = client.request("GET", url, preload_content=False)

        # Download file
        with open((tools_path.parent / "miniconda.sh"), "wb") as f:
            while True:
                data = resp.read()
                if not data:
                    break
                f.write(data)
        resp.release_conn()
        run(["chmod", "+x", "miniconda.sh"], cwd=tools_path.parent)
        run(
            ["./miniconda.sh", "-b", "-p", f"{(tools_path / 'miniconda')}"],
            cwd=tools_path.parent,
        )
        run(["chmod", "+x", "conda"], cwd=(tools_path / "miniconda" / "bin"))

    # Print the info about Conda
    run(["chmod", "+x", "activate_env.sh"], cwd=(project_root / "scripts"))
    out = run(
        ["./conda", "info"], capture_output=True, cwd=(tools_path / "miniconda" / "bin")
    )
    print(
        f"Using Conda at: {(tools_path / 'miniconda' / 'bin')} \n{out.stdout.decode('utf-8')}"
    )


def setup_poetry() -> None:
    """Setup poetry."""
    print("+++++++++++ Poetry +++++++++++++")
    if os.path.isfile((tools_path / "poetry" / "bin" / "poetry")) is False:
        print("Isolated poetry not found!\nInstalling poetry\n")
        resp = client.request(
            "GET",
            "https://raw.githubusercontent.com/python-poetry/poetry/master/install-poetry.py",
            preload_content=False,
        )

        # Download file
        with open((tools_path.parent / "install-poetry.py"), "wb") as f:
            while True:
                data = resp.read()
                if not data:
                    break
                f.write(data)
        resp.release_conn()
        run(
            ["python", "./install-poetry.py", "-y"],
            cwd=tools_path.parent,
            env={**os.environ, "POETRY_HOME": f"{tools_path / 'poetry'}"},
        )
    # Print the info about poetry
    out = run(
        ["./poetry", "-V"], capture_output=True, cwd=(tools_path / "poetry" / "bin")
    )
    print(
        f"Using Poetry at: {tools_path / 'poetry' / 'bin' / 'poetry'} \n{out.stdout.decode('utf-8')}"
    )


def create_conda_env(env_name: str = "imcloud") -> None:
    """Create conda env."""
    print("+++++++++++ Creating Conda environment +++++++++++++")
    run(
        [
            "./conda",
            "create",
            "-n",
            env_name,
            "python=3.8",
        ],
        cwd=(tools_path / "miniconda" / "bin"),
    )
    print(
        f"Created Conda env \"{env_name}\" at: {(tools_path / 'miniconda' / 'env' / env_name)}\n"
    )


def install_projects(directory: Path) -> None:
    """Install deps and project using poetry."""
    print("+++++++++++ Installing local projects +++++++++++++")

    run(
        ["poetry", "install"],
        cwd=directory,
        env={
            **os.environ,
            "POETRY_HOME": f"{tools_path / 'poetry'}",
            "PATH": f"{(tools_path / 'poetry' / 'bin')}:{os.environ['PATH']}",
        },
    )
    # Calling again as a workaround to ensure project root is installed
    run(
        ["poetry", "install"],
        cwd=directory,
        env={
            **os.environ,
            "POETRY_HOME": f"{tools_path / 'poetry'}",
            "PATH": f"{(tools_path / 'poetry' / 'bin')}:{os.environ['PATH']}",
        },
    )
    out = run(
        ["poetry", "env", "info", "--path"],
        cwd=directory,
        capture_output=True,
        env={
            **os.environ,
            "POETRY_HOME": f"{tools_path / 'poetry'}",
            "PATH": f"{(tools_path / 'poetry' / 'bin')}:{os.environ['PATH']}",
        },
    )
    print(f"Using Virtual env at {out.stdout.decode('utf-8')}")


def setup_traefik() -> None:
    """Setup Traefik."""
    print("\n\n++++++++++ Traefik +++++++++++++")
    if os.path.isfile((tools_path / "traefik" / "traefik")) is False:
        print(f"Creating traefik dir at {(tools_path / 'traefik')}")
        os.makedirs((tools_path / "traefik"), exist_ok=True)

        print("Installing Traefik\n")
        local_system = current_system.lower()

        # Decide download extension
        if local_system == "linux" or local_system == "darwin":
            local_ext = "tar.gz"
        elif local_system == "windows":
            local_ext = "zip"

        # Decide platform architecture
        if current_machine == "x86_64":
            local_machine = "amd64"
        elif current_machine == "aarch64":
            local_machine = "arm64"
        else:
            raise "Machine not supported"

        # Build url
        url = f"https://github.com/traefik/traefik/releases/download/v2.5.2/traefik_v2.5.2_{local_system}_{local_machine}.{local_ext}"

        # Download file
        resp = client.request("GET", url, preload_content=False)
        with open(
            (
                tools_path
                / "traefik"
                / f"traefik_v2.5.2_{local_system}_{local_machine}.{local_ext}"
            ),
            "wb",
        ) as f:
            while True:
                data = resp.read()
                if not data:
                    break
                f.write(data)
        resp.release_conn()

        # extract compressed file
        unpack_archive(
            (
                tools_path
                / "traefik"
                / f"traefik_v2.5.2_{local_system}_{local_machine}.{local_ext}"
            ),
            (tools_path / "traefik"),
        )

        # make binary executable
        if local_system != "windows":
            run(["chmod", "+x", "traefik"], cwd=(tools_path / "traefik"))
        else:
            # !TODO: Check equivalent in windows
            pass

    # Print the info about traefik
    out = run(
        ["./traefik", "version"], capture_output=True, cwd=(tools_path / "traefik")
    )
    print(f"Using traefik at {(tools_path / 'traefik')} \n{out.stdout.decode('utf-8')}")


def setup_minio() -> None:
    """Setup MinIO."""
    print("+++++++++++ MinIO +++++++++++++")
    if os.path.isfile((tools_path / "minio" / "minio")) is False:
        print(f"Creating minio dir at {(tools_path / 'minio')}")
        os.makedirs((tools_path / "minio"), exist_ok=True)

        print("Installing MinIO\n")
        local_system = current_system.lower()

        # Decide platform architecture
        if current_machine == "x86_64":
            local_machine = "amd64"
        elif current_machine == "aarch64":
            local_machine = "arm64"
        else:
            raise "Machine not supported"

        # Decide download extension
        if local_system == "linux" or local_system == "darwin":
            local_ext = ""
        elif local_system == "windows":
            local_ext = ".exe"

        # Build url
        url = f"https://dl.min.io/server/minio/release/{local_system}-{local_machine}/minio{local_ext}"

        # Download minio server
        resp = client.request("GET", url, preload_content=False)
        with open((tools_path / "minio" / f"minio{local_ext}"), "wb") as f:
            while True:
                data = resp.read()
                if not data:
                    break
                f.write(data)
        resp.release_conn()

        url = f"https://dl.min.io/client/mc/release/{local_system}-{local_machine}/mc{local_ext}"

        # Download minio client
        resp = client.request("GET", url, preload_content=False)
        with open((tools_path / "minio" / f"mc{local_ext}"), "wb") as f:
            while True:
                data = resp.read()
                if not data:
                    break
                f.write(data)
        resp.release_conn()

        # make binary executable
        if local_system != "windows":
            run(["chmod", "+x", "minio"], cwd=(tools_path / "minio"))
            run(["chmod", "+x", "mc"], cwd=(tools_path / "minio"))
        else:
            # !TODO: Check equivalent in windows
            pass

    # Print the info about minio server and client
    out_minio = run(
        ["./minio", "-v"],
        capture_output=True,
        cwd=(tools_path / "minio"),
    )
    out_mc = run(["./mc", "-v"], capture_output=True, cwd=(tools_path / "minio"))
    print(
        f"Using minio at {(tools_path / 'minio')} \n{out_minio.stdout.decode('utf-8')} \n{out_mc.stdout.decode('utf-8')}"
    )


def setup_nats() -> None:
    "Setup NATS."
    print("\n\n+++++++++++ NATS +++++++++++++")
    if os.path.isfile((tools_path / "nats" / "nats-server")) is False:
        print(f"Creating nats dir at {(tools_path / 'nats')}")
        os.makedirs((tools_path / "nats"), exist_ok=True)

        print("Installing NATS\n")
        local_system = current_system.lower()

        # Decide platform architecture
        if current_machine == "x86_64":
            local_machine = "amd64"
        elif current_machine == "aarch64":
            local_machine = "arm64"
        else:
            raise "Machine not supported"

        # Decide download extension
        if local_system == "linux" or local_system == "darwin":
            local_ext = "tar.gz"
        elif local_system == "windows":
            local_ext = "zip"

        # Build url
        url = f"https://github.com/nats-io/nats-server/releases/download/v2.5.0/nats-server-v2.5.0-{local_system}-{local_machine}.{local_ext}"

        # Download nats server
        resp = client.request("GET", url, preload_content=False)
        with open((tools_path / "nats" / f"nats.{local_ext}"), "wb") as f:
            while True:
                data = resp.read()
                if not data:
                    break
                f.write(data)
        resp.release_conn()

        # extract compressed file
        unpack_archive(
            (tools_path / "nats" / f"nats.{local_ext}"),
            (tools_path / "nats"),
        )

        # copy nats-server binary
        shutil.copy(
            (
                tools_path
                / "nats"
                / f"nats-server-v2.5.0-{local_system}-{local_machine}"
                / "nats-server"
            ),
            (tools_path / "nats" / "nats-server"),
        )

        # make binary executable
        if local_system != "windows":
            run(["chmod", "+x", "nats-server"], cwd=(tools_path / "nats"))
        else:
            # !TODO: Check equivalent in windows
            pass

    # Print the info about nats server
    out = run(
        ["./nats-server", "-v"],
        capture_output=True,
        cwd=(tools_path / "nats"),
    )
    print(f"Using Nats at {(tools_path / 'minio')} \n{out.stdout.decode('utf-8')}")


def setup_kind() -> None:
    """Setup Kind."""
    print("\n\n+++++++++++ Kind +++++++++++++")
    if os.path.isfile((tools_path / "kind" / "kind")) is False:
        print(f"Creating kind dir at {(tools_path / 'kind')}")
        os.makedirs((tools_path / "kind"), exist_ok=True)

        print("Installing Kind\n")
        local_system = current_system.lower()

        # Decide platform architecture
        if current_machine == "x86_64":
            local_machine = "amd64"
        elif current_machine == "aarch64":
            local_machine = "arm64"
        else:
            raise "Machine not supported"

        # Build url
        url = f"https://github.com/kubernetes-sigs/kind/releases/download/v0.11.1/kind-{local_system}-{local_machine}"

        # Download kind
        resp = client.request("GET", url, preload_content=False)
        with open((tools_path / "kind" / "kind"), "wb") as f:
            while True:
                data = resp.read()
                if not data:
                    break
                f.write(data)
        resp.release_conn()

        # make binary executable
        if local_system != "windows":
            run(["chmod", "+x", "kind"], cwd=(tools_path / "kind"))
        else:
            # !TODO: Check equivalent in windows
            pass

    # Print the info about kind
    out = run(
        ["./kind", "--version"],
        capture_output=True,
        cwd=(tools_path / "kind"),
    )
    print(f"Using kind at {(tools_path / 'kind')} \n{out.stdout.decode('utf-8')}")


def setup_kubectl() -> None:
    """Setup kubectl."""
    print("\n\n+++++++++++ Kubectl +++++++++++++")
    if os.path.isfile((tools_path / "kubectl" / "kubectl")) is False:
        print(f"Creating kubectl dir at {(tools_path / 'kubectl')}")
        os.makedirs((tools_path / "kubectl"), exist_ok=True)

        print("Installing Kubectl\n")
        local_system = current_system.lower()

        # Decide platform architecture
        if current_machine == "x86_64":
            local_machine = "amd64"
        elif current_machine == "aarch64":
            local_machine = "arm64"
        else:
            raise "Machine not supported"

        # Build url
        url = f"https://dl.k8s.io/release/v1.22.0/bin/{local_system}/{local_machine}/kubectl"

        # Download kubectl
        resp = client.request("GET", url, preload_content=False)
        with open((tools_path / "kubectl" / "kubectl"), "wb") as f:
            while True:
                data = resp.read()
                if not data:
                    break
                f.write(data)
        resp.release_conn()

        # make binary executable
        if local_system != "windows":
            run(["chmod", "+x", "kubectl"], cwd=(tools_path / "kubectl"))
        else:
            # !TODO: Check equivalent in windows
            pass

    # Print the info about kubectl
    out = run(
        ["./kubectl", "version", "--client", "--short"],
        capture_output=True,
        cwd=(tools_path / "kubectl"),
    )
    print(f"Using kubectl at {(tools_path / 'kubectl')} \n{out.stdout.decode('utf-8')}")


def setup_kustomize() -> None:
    """Setup Kustomize."""
    print("\n\n+++++++++++ Kustomize +++++++++++++")
    if os.path.isfile((tools_path / "kustomize" / "kustomize")) is False:
        print(f"Creating kustomize dir at {(tools_path / 'kustomize')}")
        os.makedirs((tools_path / "kustomize"), exist_ok=True)

        print("Installing Kustomize\n")
        local_system = current_system.lower()

        # Decide platform architecture
        if current_machine == "x86_64":
            local_machine = "amd64"
        elif current_machine == "aarch64":
            local_machine = "arm64"
        else:
            raise "Machine not supported"

        # Build url
        url = f"https://github.com/kubernetes-sigs/kustomize/releases/download/kustomize%2Fv4.3.0/kustomize_v4.3.0_{local_system}_{local_machine}.tar.gz"

        # Download kustomize
        resp = client.request("GET", url, preload_content=False)
        with open((tools_path / "kustomize" / "kustomize.tar.gz"), "wb") as f:
            while True:
                data = resp.read()
                if not data:
                    break
                f.write(data)
        resp.release_conn()

        # extract compressed file
        unpack_archive(
            (tools_path / "kustomize" / f"kustomize.tar.gz"),
            (tools_path / "kustomize"),
        )

        # make binary executable
        if local_system != "windows":
            run(["chmod", "+x", "kustomize"], cwd=(tools_path / "kustomize"))
        else:
            # !TODO: Check equivalent in windows
            pass

    # Print the info about kustomize
    out = run(
        ["./kustomize", "version"],
        capture_output=True,
        cwd=(tools_path / "kustomize"),
    )
    print(
        f"Using kustomize at {(tools_path / 'kustomize')} \n{out.stdout.decode('utf-8')}"
    )


def setup_helm() -> None:
    """Setup Helm."""
    print("\n\n+++++++++++ Helm +++++++++++++")
    if os.path.isfile((tools_path / "helm" / "helm")) is False:
        print(f"Creating helm dir at {(tools_path / 'helm')}")
        os.makedirs((tools_path / "helm"), exist_ok=True)

        print("Installing Helm\n")
        local_system = current_system.lower()

        # Decide platform architecture
        if current_machine == "x86_64":
            local_machine = "amd64"
        elif current_machine == "aarch64":
            local_machine = "arm64"
        else:
            raise "Machine not supported"

        # Build url
        url = f"https://get.helm.sh/helm-v3.7.0-{local_system}-{local_machine}.tar.gz"

        # Download helm
        resp = client.request("GET", url, preload_content=False)
        with open((tools_path / "helm" / "helm.tar.gz"), "wb") as f:
            while True:
                data = resp.read()
                if not data:
                    break
                f.write(data)
        resp.release_conn()

        # extract compressed file
        unpack_archive(
            (tools_path / "helm" / f"helm.tar.gz"),
            (tools_path / "helm"),
        )

        # copy helm binary
        shutil.copy(
            (tools_path / "helm" / f"{local_system}-{local_machine}" / "helm"),
            (tools_path / "helm" / "helm"),
        )

        # make binary executable
        if local_system != "windows":
            run(["chmod", "+x", "helm"], cwd=(tools_path / "helm"))
        else:
            # !TODO: Check equivalent in windows
            pass

    # Print the info about helm
    out = run(
        ["./helm", "version", "--short"],
        capture_output=True,
        cwd=(tools_path / "helm"),
    )
    print(f"Using helm at {(tools_path / 'helm')} \n{out.stdout.decode('utf-8')}")


def setup_terraform() -> None:
    """Setup Terraform."""
    print("\n\n+++++++++++ Terraform +++++++++++++")
    if os.path.isfile((tools_path / "terraform" / "terraform")) is False:
        print(f"Creating terraform dir at {(tools_path / 'terraform')}")
        os.makedirs((tools_path / "terraform"), exist_ok=True)

        print("Installing Terraform\n")
        local_system = current_system.lower()

        # Decide platform architecture
        if current_machine == "x86_64":
            local_machine = "amd64"
        elif current_machine == "aarch64":
            local_machine = "arm64"
        else:
            raise "Machine not supported"

        # Build url
        url = f"https://releases.hashicorp.com/terraform/1.0.7/terraform_1.0.7_{local_system}_{local_machine}.zip"

        # Download terraform
        resp = client.request("GET", url, preload_content=False)
        with open((tools_path / "terraform" / "terraform.zip"), "wb") as f:
            while True:
                data = resp.read()
                if not data:
                    break
                f.write(data)
        resp.release_conn()

        # extract compressed file
        unpack_archive(
            (tools_path / "terraform" / f"terraform.zip"),
            (tools_path / "terraform"),
        )

        # make binary executable
        if local_system != "windows":
            run(["chmod", "+x", "terraform"], cwd=(tools_path / "terraform"))
        else:
            # !TODO: Check equivalent in windows
            pass

    # Print the info about terraform
    out = run(
        ["./terraform", "version"],
        capture_output=True,
        cwd=(tools_path / "terraform"),
    )
    print(
        f"Using terraform at {(tools_path / 'terraform')} \n{out.stdout.decode('utf-8')}"
    )


def setup_fluxcd() -> None:
    """Setup fluxcd."""
    print("+++++++++++ FluxCD +++++++++++++")
    if os.path.isfile((tools_path / "fluxcd" / "flux")) is False:
        print(f"Creating fluxcd dir at {(tools_path / 'fluxcd')}")
        os.makedirs((tools_path / "fluxcd"), exist_ok=True)

        print("Installing Flux\n")

        # Build url
        url = f"https://fluxcd.io/install.sh"

        resp = client.request("GET", url, preload_content=False)

        # Download file
        with open((tools_path / "fluxcd" / "flux.sh"), "wb") as f:
            while True:
                data = resp.read()
                if not data:
                    break
                f.write(data)
        resp.release_conn()
        run(["chmod", "+x", "flux.sh"], cwd=(tools_path / "fluxcd"))
        run(
            ["./flux.sh", f"{(tools_path / 'fluxcd')}"],
            cwd=(tools_path / "fluxcd"),
        )

    # Print the info about FluxCD
    out = run(["./flux", "--version"], capture_output=True, cwd=(tools_path / "fluxcd"))
    print(
        f"Using FluxCD at: {(tools_path / 'fluxcd' / 'flux')} \n{out.stdout.decode('utf-8')}"
    )


def setup_gitea() -> None:
    """Setup Gitea."""
    print("\n\n+++++++++++ Gitea +++++++++++++")
    if os.path.isfile((tools_path / "gitea" / "gitea")) is False:
        print(f"Creating gitea dir at {(tools_path / 'gitea')}")
        os.makedirs((tools_path / "gitea"), exist_ok=True)

        print("Installing Gitea\n")
        local_system = current_system.lower()

        if local_system == "darwin":
            local_system_ver = "-10.12"
        elif local_system == "windows":
            local_system_ver = "-4.0"
        else:
            local_system_ver = ""

        # Decide platform architecture
        if current_machine == "x86_64":
            local_machine = "amd64"
        elif current_machine == "aarch64":
            local_machine = "arm64"
        else:
            raise "Machine not supported"

        # Build url
        url = f"https://dl.gitea.io/gitea/1.15.3/gitea-1.15.3-{local_system}{local_system_ver}-{local_machine}"

        # Download gitea
        resp = client.request("GET", url, preload_content=False)
        with open((tools_path / "gitea" / "gitea"), "wb") as f:
            while True:
                data = resp.read()
                if not data:
                    break
                f.write(data)
        resp.release_conn()

        # make binary executable
        if local_system != "windows":
            run(["chmod", "+x", "gitea"], cwd=(tools_path / "gitea"))
        else:
            # !TODO: Check equivalent in windows
            pass

    # Print the info about gitea
    out = run(
        ["./gitea", "--version"],
        capture_output=True,
        cwd=(tools_path / "gitea"),
    )
    print(f"Using Gitea at {(tools_path / 'gitea')} \n{out.stdout.decode('utf-8')}")


def setup_tools() -> None:
    """Check if tools are present."""
    print("\n\n+++++++++++ Tools +++++++++++++")
    if tools_path.exists() is False:
        print(f"Creating tools dir at {tools_path.absolute()}")
        os.makedirs(tools_path.absolute(), exist_ok=True)
    else:
        print(f"Using tools dir at {tools_path.absolute()}")
        setup_traefik()
        setup_minio()
        setup_nats()
        setup_kind()
        setup_kubectl()
        setup_kustomize()
        setup_helm()
        setup_terraform()
        setup_fluxcd()
        setup_gitea()


def write_env() -> None:
    """Write .env in project root."""
    print("\n\n+++++++++++ Env File +++++++++++++\n")
    data = f"""
CONDA_SHELL_PATH={(tools_path / 'miniconda' / 'etc' / 'profile.d' / 'conda.sh')}
CONDA_ENV_PATH={(tools_path / 'miniconda' / 'envs' / 'imcloud')}
PATH={(tools_path / 'miniconda' / 'envs' / 'imcloud' / 'bin')}:{(tools_path / 'miniconda' / 'condabin')}:${{PATH}}
_CE_M=
_CE_CONDA=
CONDA_EXE={(tools_path / 'miniconda' / 'bin' / 'conda')}
CONDA_PYTHON_EXE={(tools_path / 'miniconda' / 'bin' / 'conda' / "python")}
CONDA_SHLVL=2
CONDA_PREFIX={(tools_path / 'miniconda' / 'envs' / 'imcloud')}
CONDA_DEFAULT_ENV=imcloud
CONDA_PROMPT_MODIFIER=(imcloud)
CONDA_PREFIX_1={(tools_path / 'miniconda')}
    """
    with open((project_root / ".setup.env"), "w") as f:
        f.write(data)

    # Print message
    RED = "\033[0;31m"
    GREEN = "\033[0;33m"
    NC = "\033[0m"  # No Color
    print(
        f"""
Add CONDA_SHELL_PATH using following command:
{GREEN}export $(cat .setup.env | xargs){NC}
        """
    )


def main() -> None:
    """Setup runner."""
    parser = argparse.ArgumentParser(description="Setup dev environment")

    parser.add_argument(
        "--skip-docker",
        help="skip docker check",
        dest="skip_docker",
        action="store_true",
        default=False,
    )

    args = parser.parse_args()

    if args.skip_docker is False:
        if check_docker() != 0:
            sys.exit(1)
    setup_miniconda()
    setup_poetry()
    setup_tools()
    create_conda_env()
    install_projects(compose_path)
    write_env()


if __name__ == "__main__":
    main()
