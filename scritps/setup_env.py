#! python

"""Setup scripts."""

import os
from pathlib import Path
import platform
import re
from shutil import which, unpack_archive
from subprocess import run
import sys
import urllib3


def check_docker() -> int:
    """Check if docker is present on the system."""
    print("+++++++++++ Docker +++++++++++++")
    if which("docker") is None:
        print("Poetry not found!")
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
        print(f"Using Docker at: {which('docker')} \n\n {out.stdout}")
        return 0


compose_path = Path(__file__).absolute().parents[1].joinpath("compose")
demon_path = Path(__file__).absolute().parents[1].joinpath("demon")
tools_path = Path(__file__).absolute().parents[1].joinpath("scratch", "tools")

current_system = platform.system()
current_machine = platform.machine()

client = urllib3.PoolManager()


def setup_poetry() -> None:
    """Setup poetry."""
    print("+++++++++++ Poetry +++++++++++++")
    if which("poetry") is None:
        print("Poetry not found!\nInstalling poetry")
        r = client.request(
            "GET",
            "https://raw.githubusercontent.com/python-poetry/poetry/master/install-poetry.py",
        )
        exec(r.data.decode("utf-8"))
    else:
        out = run(["poetry", "-V"], capture_output=True)
        print(f"Using Poetry at: {which('poetry')} \n{out.stdout.decode('utf-8')}")


def install_projects(directory: Path) -> None:
    """Install deps and project using poetry."""
    run(["poetry", "install"], cwd=directory)
    # Calling again as a workaround to ensure project root is installed
    run(["poetry", "install"], cwd=directory)


def setup_traefik() -> None:
    """Setup Traefik"""
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
        run(["chmod", "+x", "traefik"], cwd=(tools_path / "traefik"))

    # Print the info about traefik
    out = run(
        ["./traefik", "version"], capture_output=True, cwd=(tools_path / "traefik")
    )
    print(f"Using traefik at {(tools_path / 'traefik')} \n{out.stdout.decode('utf-8')}")


def setup_tools() -> None:
    """Check if tools are present."""
    print("+++++++++++ Tools +++++++++++++")
    if tools_path.exists() is False:
        print(f"Creating tools dir at {tools_path.absolute()}")
        os.makedirs(tools_path.absolute(), exist_ok=True)
    else:
        print(f"Using tools dir at {tools_path.absolute()}")
        setup_traefik()


def main() -> None:
    """Setup runner."""
    if check_docker() != 0:
        sys.exit(1)
    setup_poetry()
    setup_tools()


if __name__ == "__main__":
    main()
