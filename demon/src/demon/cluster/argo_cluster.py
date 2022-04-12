from pathlib import Path
from pprint import pprint
from typing import Dict, List, Optional
from jinja2 import Environment, PackageLoader
import yaml
import json
from logzero import logger
from kubernetes import client as kube_client, config as kube_config
from functools import lru_cache

from blackcap.cluster.base import BaseCluster
from blackcap.schemas.job import Job
from blackcap.schemas.schedule import Schedule
from blackcap.messenger import messenger_registry
from blackcap.configs import config_registry


class ArgoCluster(BaseCluster):
    CONFIG_KEY_VAL = "ARGO"

    @property
    @lru_cache
    def messenger(self):
        config = config_registry.get_config()
        return messenger_registry.get_messenger(config.MESSENGER)

    @property
    @lru_cache
    def jinja_env(self):
        return Environment(loader=PackageLoader("demon", package_path="templates"))

    @property
    @lru_cache
    def kube_api(self):
        kube_config.load_incluster_config()
        return kube_client.CustomObjectsApi()

    def report_mineprogress(self, workflow_yaml: str, extra_data: Optional[Dict] = None) -> None:
        workflow = yaml.safe_load(workflow_yaml)
        try:
            total_steps = len(workflow["spec"]["templates"][0]["steps"])
        except KeyError:
            # TODO what's the best way to report this error?
            pass

        progress_report = {
            "status": "STARTED",
            "total_steps": total_steps,
        }
        if extra_data:
            progress_report.update(extra_data)

        self.messenger.publish({"data": progress_report}, "mineprogress")

    def submit_workflow(
        self, workflow_template: str, workflow_meta: Dict, context: Dict
    ) -> None:
        logger.info("connecting to argo...")
        tmpl = self.jinja_env.get_template(workflow_template)
        workflow_yaml = tmpl.render(**context)
        logger.info("generated workflow yaml")
        # logger.info(workflow_yaml)

        self.report_mineprogress(workflow_yaml, extra_data=workflow_meta)

        res = self.kube_api.create_namespaced_custom_object(
            group="argoproj.io",
            version="v1alpha1",
            namespace="workflow",
            plural="workflows",
            body=yaml.safe_load(workflow_yaml),
        )
        logger.info(res)

    def prepare_job(self: "BaseCluster", schedule: Schedule) -> None:
        logger.info("preparing job...")
        pass

    def submit_job(self: "BaseCluster", schedule: Schedule) -> None:
        logger.info("submitting job...")
        # schedule = json.loads(schedule)
        logger.info(schedule)
        context = schedule["job"]["specification"]
        workflow_meta = {
            "workflow_name": schedule["job"]["name"],
        }

        if schedule["job"]["job_type"] == "build":
            logger.info("found a build job")
            # Example context
            # context = {
            #     "mine_name": "pombemine",
            #     "source_name": "pombe",
            #     "bio": "pombemine-bio-sources",
            #     "sources": [
            #         "uniprot-malaria",
            #         "malaria-gff",
            #         "malaria-chromosome-fasta",
            #         "entrez-organism",
            #     ],
            #     "post_processing": [
            #         "create-references",
            #         "do-sources",
            #         "summarise-objectstore",
            #         "create-autocomplete-index",
            #         "create-search-index",
            #     ],
            #     "get_minedir": "http://localhost:9000/my-bucket/mine.tgz?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=yGoQ32Xqe9DDM3wdXQ8j%2F20211126%2F%2Fs3%2Faws4_request&X-Amz-Date=20211126T163751Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Signature=bbceca4cd72cf406e77618d3423389f538d74342c5faca01a490c2a1349af932",
            #     "get_sources": "http://localhost:9000/my-bucket/source.tgz?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=yGoQ32Xqe9DDM3wdXQ8j%2F20211126%2F%2Fs3%2Faws4_request&X-Amz-Date=20211126T163819Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Signature=99e86cee96fadf579a0ba21abb241be824870a49814cca9ec26b63d0019c6a6a",
            #     "get_bio": "http://localhost:9000/my-bucket/bio.tgz?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=yGoQ32Xqe9DDM3wdXQ8j%2F20211126%2F%2Fs3%2Faws4_request&X-Amz-Date=20211126T163836Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Signature=b1632c3c613f00c8e690ea323732e1b5ed93b0fb29afed3e601dd7d8b67659d3",
            # }

            self.submit_workflow("minebuilder.yaml.template", workflow_meta, context)

        elif schedule["job"]["job_type"] == "deploy":
            # Example context
            # context = {
            #     "mine_name": "pombemine",
            #     "pretty_mine_name": "PombeMine",
            #     "get_minedir": "http://localhost:9000/my-bucket/mine.tgz?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=yGoQ32Xqe9DDM3wdXQ8j%2F20211126%2F%2Fs3%2Faws4_request&X-Amz-Date=20211126T163751Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Signature=bbceca4cd72cf406e77618d3423389f538d74342c5faca01a490c2a1349af932",
            #     "get_postgres": "http://localhost:9000/my-bucket/source.tgz?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=yGoQ32Xqe9DDM3wdXQ8j%2F20211126%2F%2Fs3%2Faws4_request&X-Amz-Date=20211126T163819Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Signature=99e86cee96fadf579a0ba21abb241be824870a49814cca9ec26b63d0019c6a6a",
            #     "get_solr": "http://localhost:9000/my-bucket/bio.tgz?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=yGoQ32Xqe9DDM3wdXQ8j%2F20211126%2F%2Fs3%2Faws4_request&X-Amz-Date=20211126T163836Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Signature=b1632c3c613f00c8e690ea323732e1b5ed93b0fb29afed3e601dd7d8b67659d3",
            # }

            self.submit_workflow("minedeployer.yaml.template", workflow_meta, context)

    def get_job_status(self: "BaseCluster", job_id: str) -> List[str]:
        pass
