# Commands

> Note: Modify commands according to the platform

## Docker and docker compose

### Docker

<https://docs.docker.com/engine/install/>

### Docker Compose

<https://docs.docker.com/compose/install/>

---

## Install Traefik

<https://github.com/traefik/traefik/releases>

```bash
curl -LO "https://github.com/traefik/traefik/releases/download/v2.5.2/traefik_v2.5.2_linux_amd64.tar.gz"
```

---

## Install MinIO

<https://min.io/download>

### Server

```bash
wget https://dl.min.io/server/minio/release/linux-amd64/minio
chmod +x minio

MINIO_ROOT_USER=admin MINIO_ROOT_PASSWORD=password ./minio server /mnt/data --console-address ":9001"
```

### Client

```bash
wget https://dl.min.io/client/mc/release/linux-amd64/mc
chmod +x mc

mc alias set myminio/ http://MINIO-SERVER MYUSER MYPASSWORD
```

---

## Install NatsIO

<https://docs.nats.io/nats-server/installation>

```bash
curl -L https://github.com/nats-io/nats-server/releases/download/v2.0.0/nats-server-v2.0.0-linux-amd64.zip -o nats-server.zip

unzip nats-server.zip -d nats-server
```

---

## Install Grafana

<https://grafana.com/grafana/download?pg=docs&platform=linux&edition=oss>

```bash
wget https://dl.grafana.com/oss/release/grafana-8.1.3.linux-amd64.tar.gz
```

---

## Install Minikube

<https://minikube.sigs.k8s.io/docs/start/>

```bash
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64

sudo install minikube-linux-amd64 /usr/local/bin/minikube
```

## Install Kind

<https://kind.sigs.k8s.io/docs/user/quick-start/#installation>

```bash
curl -Lo ./kind https://kind.sigs.k8s.io/dl/v0.11.1/kind-linux-amd64

chmod +x ./kind
```

---

## Install Kubectl

<https://kubernetes.io/docs/tasks/tools/install-kubectl-linux/>

```bash
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl
```

---

## Install Helm

<https://github.com/helm/helm/releases>

```bash
curl -LO https://get.helm.sh/helm-v3.7.0-rc.3-linux-amd64.tar.gz
```

---

## Install Kustomize

<https://kubectl.docs.kubernetes.io/installation/kustomize/binaries/>

```bash
curl -s "https://raw.githubusercontent.com/kubernetes-sigs/kustomize/master/hack/install_kustomize.sh"  | bash
```

---

## Install Terraform

<https://www.terraform.io/downloads.html>

```bash
curl -LO https://releases.hashicorp.com/terraform/1.0.6/terraform_1.0.6_linux_amd64.zip
```

---

## Install FluxCD

<https://fluxcd.io/docs/installation/#install-the-flux-cli>

```bash
curl -s https://fluxcd.io/install.sh | sudo bash
```
