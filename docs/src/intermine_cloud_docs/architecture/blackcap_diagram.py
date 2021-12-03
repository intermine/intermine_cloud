"""Architecture overview diagram."""

from diagrams import Cluster, Diagram, Edge
from diagrams.aws.storage import S3
from diagrams.gcp.analytics import PubSub
from diagrams.onprem.client import Client, Users
from diagrams.onprem.compute import Server
from diagrams.onprem.database import PostgreSQL, MySQL, Cockroachdb
from diagrams.onprem.gitops import ArgoCD
from diagrams.onprem.workflow import Airflow, Kubeflow
from diagrams.onprem.monitoring import Grafana, Prometheus
from diagrams.onprem.network import Traefik
from diagrams.onprem.queue import Nats, Kafka

with Diagram(name="", filename="orchestra", show=False, direction="LR"):
    users = Users("Users")
    client = Client("Web / CLI / \nProgrammatic")

    with Cluster("Cloud vendor 001"):
        with Cluster("Kubernetes / Docker / Bare Metal setup 001"):
            with Cluster("Coductor cluster", "TB"):
                conductor = [
                    Server("Conductor"),
                    Server("Conductor"),
                    Server("Conductor"),
                ]

    with Cluster("Cloud vendor 002", "LR"):
        with Cluster("Kubernetes / Docker / Bare Metal setup 002", "LR"):
            with Cluster("MinIO Cluster", "LR"):
                minio = [
                    S3("MinIO"),
                    S3("MinIO"),
                    S3("MinIO"),
                ]

    with Cluster("Cloud vendor 004"):
        with Cluster("Kubernetes / Docker / Bare Metal setup 004"):
            with Cluster("Message queues"):
                message_queue = [Nats(""), Kafka(""), PubSub("")]

    with Cluster("Cloud vendor 003", "LR"):
        with Cluster("Kubernetes / Docker / Bare Metal setup 003", "LR"):
            with Cluster("MinIO Cluster", "LR"):
                postgres = [
                    PostgreSQL(""),
                    MySQL(""),
                    Cockroachdb(""),
                ]

    with Cluster("Cloud vendor 006", "LR"):
        with Cluster("Kubernetes / Docker / Bare Metal setup 006", "LR"):
            with Cluster("Job Cluster 001", "LR"):
                demon1 = Server("Demon")
                argo = [ArgoCD(""), ArgoCD(""), ArgoCD("")]
                demon1 >> argo

    with Cluster("Cloud vendor 007", "LR"):
        with Cluster("Kubernetes / Docker / Bare Metal setup 007", "LR"):
            with Cluster("Job Cluster 002", "LR"):
                demon2 = Server("Demon")
                slurm = [Airflow(""), Airflow(""), Airflow("")]
                demon2 >> slurm

    with Cluster("Cloud vendor 008", "LR"):
        with Cluster("Kubernetes / Docker / Bare Metal setup 008", "LR"):
            with Cluster("Job Cluster 003", "LR"):
                demon3 = Server("Demon")
                lsf = [Kubeflow(""), Kubeflow(""), Kubeflow("")]
                demon3 >> lsf

    with Cluster("Cloud vendor 009", "LR"):
        with Cluster("Kubernetes / Docker / Bare Metal setup 009", "LR"):
            with Cluster("Deploy Cluster", "LR"):
                demon4 = Server("Demon")
                traefik = Traefik("")
                mines = [
                    Server("Flymine"),
                    Server("HumanMine"),
                    Server("CovidMine"),
                ]
                # demon4 >> mines
                traefik >> mines

    with Cluster("Monitoring"):
        with Cluster("Kubernetes / Docker / Bare Metal setup 005"):
            metrics = [Prometheus(""), Prometheus(""), Prometheus("")]
            metrics << Edge(color="firebrick", style="dashed") << Grafana("")

    users >> Edge() << client
    client >> Edge() << conductor
    conductor[1] >> Edge() << minio[0]
    conductor[0] >> message_queue[0]
    conductor[1] >> message_queue[1]
    conductor[2] >> message_queue[2]
    message_queue[0] << demon1
    message_queue[1] << demon2
    message_queue[1] << demon4
    message_queue[2] << demon3
    minio[0] << demon1
    minio[1] << demon2
    minio[2] << demon3
    conductor[1] >> Edge() << postgres[0]
    client >> Edge() << traefik
    argo << Edge(color="firebrick", style="dashed") << metrics[0]
    slurm << Edge(color="firebrick", style="dashed") << metrics[1]
    lsf << Edge(color="firebrick", style="dashed") << metrics[2]
    mines << Edge(color="firebrick", style="dashed") << metrics[2]
