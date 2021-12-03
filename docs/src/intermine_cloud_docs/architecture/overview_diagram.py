"""Architecture overview diagram."""

from diagrams import Cluster, Diagram, Edge
from diagrams.aws.storage import S3
from diagrams.onprem.client import Client, Users
from diagrams.onprem.compute import Server
from diagrams.onprem.gitops import ArgoCD
from diagrams.onprem.monitoring import Grafana, Prometheus
from diagrams.onprem.network import Traefik
from diagrams.onprem.queue import Nats

with Diagram(name="", filename="intermine_cloud", show=False, direction="LR"):
    im_users = Users("Intermine Users")

    client = Client("Web / CLI / \nProgrammatic")

    with Cluster("Cloud"):
        with Cluster("Kubernetes"):
            with Cluster("Message queues"):
                message_queue = [Nats(""), Nats(""), Nats("")]

            with Cluster("Endpoints", "TB"):
                endpoints = [
                    Server("Compose"),
                    S3("MinIO"),
                ]
            traefik = Traefik("Traefik")
            im_users >> Edge() << client
            client >> Edge() << traefik
            traefik >> Edge() << endpoints

            with Cluster("Build cluster"):
                argo = [ArgoCD(), ArgoCD(), ArgoCD()]
                demon = Server("Demon")

            endpoints[0] >> message_queue[0] << demon >> argo

            with Cluster("Deployed Mines", "TB"):
                mines = [Server("FlyMine"), Server("HumanMine"), Server("CovidMine")]
        with Cluster("Monitoring"):
            metrics = Prometheus("")
            metrics << Edge(color="firebrick", style="dashed") << Grafana("")

    argo[1] >> mines
    traefik >> mines
    mines << metrics
