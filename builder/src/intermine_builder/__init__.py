import os
from pathlib import Path
from typing import Any, ByteString, Dict, List, Optional, TypedDict

import docker

from intermine_builder.properties import create_properties, write_properties
from intermine_builder import project_xml
from intermine_builder.types import DataSource

DOCKER_NETWORK_NAME = "builder_default"


class MineBuilder:
    """A mine to run build commands on.

    Constructor takes a config to initialise and verify environment. Each
    method starts a docker container in which a command is run, then exits with
    only changes to volumes persisting.
    """

    def __init__(self, mine: str,
            build_image: bool = False,
            data_path: Optional[os.PathLike] = None,
            volumes: Optional[Dict] = None):
        self.user = str(os.getuid()) + ":" + str(os.getgid())
        self.mine = mine

        self.data_path = Path(data_path) if data_path else (Path.cwd() / "data")
        self.mine_path = self.data_path / "mine"

        # TODO centrally define all these paths, to make it easy to change and robust
        self.volumes = {
            self.mine_path / "dump": {"bind": "/home/intermine/intermine/dump", "mode": "rw"},
            self.mine_path / "configs": {"bind": "/home/intermine/intermine/configs", "mode": "rw"},
            self.mine_path / "packages": {"bind": "/home/intermine/.m2", "mode": "rw"},
            self.mine_path / "intermine": {"bind": "/home/intermine/.intermine", "mode": "rw"},
            self.mine_path / self.mine: {
                "bind": "/home/intermine/intermine/" + self.mine,
                "mode": "rw",
            },
        }
        if volumes:
            self.volumes.update(volumes)


        self.client = docker.from_env()

        if build_image:
            self.image = self.client.images.build(path=".")[0]
        else:
            try:
                self.image = self.client.images.get("intermine/builder")
            except docker.errors.ImageNotFound:
                self.image = self.client.images.pull("intermine/builder")

        try:
            if (
                self.client.containers.get("intermine-postgres").status != "running"
                or self.client.containers.get("intermine-solr").status != "running"
            ):
                raise RuntimeError("postgres and solr containers need to be running")
        except docker.errors.NotFound as exc:
            raise RuntimeError(
                "postgres and solr containers need to be running"
            ) from exc

        try:
            self.client.networks.get(DOCKER_NETWORK_NAME)
        except docker.errors.NotFound as exc:
            raise RuntimeError(
                "Missing docker network: " + DOCKER_NETWORK_NAME
            ) from exc

    def __run(self, command):
        res = self.client.containers.run(
            image=self.image,
            name="intermine-builder",
            user=self.user,
            volumes=self.volumes,
            network=DOCKER_NETWORK_NAME,
            command=command,
            remove=True,
            stdout=True,
            stderr=True,
            working_dir="/home/intermine/intermine/" + self.mine,
        )

        return res

    # Changes to filesystem

    def create_properties_file(self, overrides: Dict[str, str]):
        properties = create_properties(overrides=overrides)
        write_properties(
            self.mine_path / "intermine" / (self.mine + ".properties"), properties
        )

    def add_data_source(self, source: DataSource):
        project_xml.append_source(self.mine_path / self.mine / "project.xml", source)

    # Gradle commands

    def __gradle(self, args: List[str], **kwargs):
        command = ["./gradlew"] + args
        try:
            if kwargs["stacktrace"]:
                command += ["--stacktrace"]
            if kwargs["info"]:
                command += ["--info"]
            if kwargs["debug"]:
                command += ["--debug"]
            if kwargs["scan"]:
                command += ["--scan"]
        except KeyError:
            pass
        return self.__run(command)

    def clean(self, **kwargs):
        args = ["clean"]
        return self.__gradle(args, **kwargs)

    def integrate(self, source: str, action: Optional[str] = None, **kwargs):
        args = ["integrate", "-Psource=" + source]
        if action:
            args += ["-Paction=" + action]
        return self.__gradle(args, **kwargs)

    def post_process(self, process: str, **kwargs):
        args = ["postProcess", "-Pprocess=" + process]
        return self.__gradle(args, **kwargs)

    def build_db(self, **kwargs):
        args = ["buildDB"]
        return self.__gradle(args, **kwargs)

    def build_user_db(self, **kwargs):
        args = ["buildUserDB"]
        return self.__gradle(args, **kwargs)

    def deploy(self, **kwargs):
        args = ["cargoDeployRemote"]
        return self.__gradle(args, **kwargs)

    def redeploy(self, **kwargs):
        args = ["cargoRedeployRemote"]
        return self.__gradle(args, **kwargs)

    # Other commands

    def project_build(self):
        # TODO tailor project_build args to this use case
        # allow specifying all flags passed through optional argument?
        return self.__run(
            [
                "./project_build",
                "-b",
                "-T",
                "localhost",
                "/home/intermine/intermine/dump/dump",
            ]
        )
