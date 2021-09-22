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


compose_path = Path(__file__).absolute().parents[1].joinpath("compose")
demon_path = Path(__file__).absolute().parents[1].joinpath("demon")
tools_path = Path(__file__).absolute().parents[1].joinpath("scratch", "tools")


current_system = platform.system()
current_machine = platform.machine()

client = urllib3.PoolManager()


def setup_miniconda() -> None:
    """Setup miniconda."""
    print("+++++++++++ Miniconda +++++++++++++")
    if os.path.isfile((tools_path / "miniconda" / "bin" / "conda")) is False:
        print("Isolated conda not found!\nInstalling Conda")
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

    # Print the info about Conda
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
        print("Isolated poetry not found!\nInstalling poetry")
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


def install_projects(directory: Path) -> None:
    """Install deps and project using poetry."""
    run(["poetry", "install"], cwd=directory)
    # Calling again as a workaround to ensure project root is installed
    run(["poetry", "install"], cwd=directory)


def setup_traefik() -> None:
    """Setup Traefik."""
    print("+++++++++++ Traefik +++++++++++++")
    if os.path.isfile((tools_path / "traefik" / "traefik")) is False:
        print(f"Creating traefik dir at {(tools_path / 'traefik')}")
        os.makedirs((tools_path / "traefik"), exist_ok=True)

        print("Installing Traefik")
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

        print("Installing MinIO")
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
        f"Using minio at {(tools_path / 'minio')} \n{out_minio.stdout.decode('utf-8')} \n{out_mc}"
    )


def setup_nats() -> None:
    "Setup NATS."
    print("+++++++++++ NATS +++++++++++++")
    if os.path.isfile((tools_path / "nats" / "nats-server")) is False:
        print(f"Creating nats dir at {(tools_path / 'nats')}")
        os.makedirs((tools_path / "nats"), exist_ok=True)

        print("Installing NATS")
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
    print(f"Using minio at {(tools_path / 'minio')} \n{out.stdout.decode('utf-8')}")


def setup_kind() -> None:
    """Setup Kind."""
    print("+++++++++++ Kind +++++++++++++")
    if os.path.isfile((tools_path / "kind" / "kind")) is False:
        print(f"Creating kind dir at {(tools_path / 'kind')}")
        os.makedirs((tools_path / "kind"), exist_ok=True)

        print("Installing Kind")
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
        ["./kind", "-v"],
        capture_output=True,
        cwd=(tools_path / "kind"),
    )
    print(f"Using kind at {(tools_path / 'kind')} \n{out.stdout.decode('utf-8')}")


def setup_tools() -> None:
    """Check if tools are present."""
    print("+++++++++++ Tools +++++++++++++")
    if tools_path.exists() is False:
        print(f"Creating tools dir at {tools_path.absolute()}")
        os.makedirs(tools_path.absolute(), exist_ok=True)
    else:
        print(f"Using tools dir at {tools_path.absolute()}")
        setup_traefik()
        setup_minio()
        setup_nats()


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


if __name__ == "__main__":
    main()
