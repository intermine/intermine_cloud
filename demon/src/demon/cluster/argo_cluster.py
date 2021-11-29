from typing import List
from jinja2 import Environment, PackageLoader

from blackcap.cluster.base import BaseCluster
from blackcap.schemas.job import Job
from blackcap.schemas.schedule import Schedule
from blackcap.messenger import messenger_registry
from blackcap.configs import config_registry

config = config_registry.get_config()
messenger = messenger_registry.get_messenger(config)


class ArgoCluster(BaseCluster):
    def prepare_job(self: "BaseCluster", job: Job) -> None:
        pass

    def submit_job(self: "BaseCluster", schedule: Schedule) -> str:
        # context = schedule.job.specification

        if schedule.job.job_type == 'build':
            context = {  # Example context
                "mine_name": "pombemine",
                "source_name": "pombe",
                "bio": "pombemine-bio-sources",
                "sources": [
                    "uniprot-malaria",
                    "malaria-gff",
                    "malaria-chromosome-fasta",
                    "entrez-organism",
                ],
                "post_processing": [
                    "create-references",
                    "do-sources",
                    "summarise-objectstore",
                    "create-autocomplete-index",
                    "create-search-index",
                ],
                "get_minedir": "http://localhost:9000/my-bucket/mine.tgz?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=yGoQ32Xqe9DDM3wdXQ8j%2F20211126%2F%2Fs3%2Faws4_request&X-Amz-Date=20211126T163751Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Signature=bbceca4cd72cf406e77618d3423389f538d74342c5faca01a490c2a1349af932",
                "get_sources": "http://localhost:9000/my-bucket/source.tgz?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=yGoQ32Xqe9DDM3wdXQ8j%2F20211126%2F%2Fs3%2Faws4_request&X-Amz-Date=20211126T163819Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Signature=99e86cee96fadf579a0ba21abb241be824870a49814cca9ec26b63d0019c6a6a",
                "get_bio": "http://localhost:9000/my-bucket/bio.tgz?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=yGoQ32Xqe9DDM3wdXQ8j%2F20211126%2F%2Fs3%2Faws4_request&X-Amz-Date=20211126T163836Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Signature=b1632c3c613f00c8e690ea323732e1b5ed93b0fb29afed3e601dd7d8b67659d3",
            }

            tmpl = Environment(loader=PackageLoader("demon")).get_template(
                "minebuilder.yaml.template"
            )
            minebuilder_workflow = tmpl.render(**context)

            messenger.publish({'data': {"workflow": minebuilder_workflow}}, "minebuilder")
        elif schedule.job.job_type == 'deploy':

            context = {  # Example context
                "mine_name": "pombemine",
                "pretty_mine_name": "PombeMine",
                "get_minedir": "http://localhost:9000/my-bucket/mine.tgz?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=yGoQ32Xqe9DDM3wdXQ8j%2F20211126%2F%2Fs3%2Faws4_request&X-Amz-Date=20211126T163751Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Signature=bbceca4cd72cf406e77618d3423389f538d74342c5faca01a490c2a1349af932",
                "get_postgres": "http://localhost:9000/my-bucket/source.tgz?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=yGoQ32Xqe9DDM3wdXQ8j%2F20211126%2F%2Fs3%2Faws4_request&X-Amz-Date=20211126T163819Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Signature=99e86cee96fadf579a0ba21abb241be824870a49814cca9ec26b63d0019c6a6a",
                "get_solr": "http://localhost:9000/my-bucket/bio.tgz?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=yGoQ32Xqe9DDM3wdXQ8j%2F20211126%2F%2Fs3%2Faws4_request&X-Amz-Date=20211126T163836Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Signature=b1632c3c613f00c8e690ea323732e1b5ed93b0fb29afed3e601dd7d8b67659d3",
            }

            tmpl = Environment(loader=PackageLoader("demon")).get_template(
                "minedeployer.yaml.template"
            )
            minedeployer_workflow = tmpl.render(**context)

            messenger.publish({'data': {"workflow": minedeployer_workflow}}, "minedeployer")

    def get_job_status(self: "BaseCluster", job_id: str) -> List[str]:
        pass
