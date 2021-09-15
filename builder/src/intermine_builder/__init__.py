import os
from pathlib import Path
from typing import Any, List, Optional

import docker

from intermine_builder.properties import create_properties, write_properties
from intermine_builder import project_xml

DOCKER_NETWORK_NAME = "builder_default"


class MineBuilder:
    """A mine to run build commands on.

    Constructor takes a config to initialise and verify environment. Each
    method starts a docker container in which a command is run, then exits with
    only changes to volumes persisting.
    """

    def __init__(self, config: dict) -> None:
        self.user = str(os.getuid()) + ":" + str(os.getgid())

        self.mine = config["mine"]

        # TODO specify path to data folder
        # - as argument for lib usage
        # - as flag for cli usage
        mine_path = Path.cwd() / "data" / "mine"

        # TODO centrally define all these paths, to make it easy to change and robust
        self.volumes = {
            mine_path
            / "dump": {"bind": "/home/intermine/intermine/dump", "mode": "rw"},
            mine_path
            / "configs": {"bind": "/home/intermine/intermine/configs", "mode": "rw"},
            mine_path / "packages": {"bind": "/home/intermine/.m2", "mode": "rw"},
            mine_path
            / "intermine": {"bind": "/home/intermine/.intermine", "mode": "rw"},
            mine_path
            / self.mine: {
                "bind": "/home/intermine/intermine/" + self.mine,
                "mode": "rw",
            },
        }

        self.client = docker.from_env()

        # TODO maybe not the right place to build the image
        self.image = self.client.images.build(path=".")[0]

        try:
            if (
                self.client.containers.get("intermine_postgres").status != "running"
                or self.client.containers.get("intermine_solr").status != "running"
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

        if "properties" in config:
            properties = create_properties(override=config["properties"])
            write_properties(
                mine_path / "intermine" / (self.mine + ".properties"),
                properties
            )

        if "datasources" in config:
            for source in config["datasources"]:
                project_xml.append_source(mine_path / self.mine / "project.xml", source)

    def __run(self, command):
        return self.client.containers.run(
            image=self.image,
            name="builder",
            user=self.user,
            volumes=self.volumes,
            network=DOCKER_NETWORK_NAME,
            command=command,
            auto_remove=True,
            stdout=False,
            stderr=True,
            working_dir="/home/intermine/intermine/" + self.mine,
        )

    # Gradle commands

    def __gradle(self, args: List[str], **kwargs):
        command = ["./gradlew"] + args
        try:
            if kwargs["stacktrace"]:
                command += ["--stacktrace"]
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

    def post_process(self, **kwargs):
        args = ["postProcess"]
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
        return self.__run(
            [
                "./project_build",
                "-b",
                "-T",
                "localhost",
                "/home/intermine/intermine/dump/dump",
            ]
        )
