# Intermine cloud infrastructure

This repository contains everything required to bootstrap intermine cloud on supported public clouds.

## Requirements

To use this repository, you need to have few tools setup in your local environment.

### Terraform
```bash
## Download the tar file
wget https://releases.hashicorp.com/terraform/0.11.14/terraform_0.11.14_linux_amd64.zip

## extract the tar file
unzip terraform_0.11.14_linux_amd64.zip

## move application binary to path
sudo mv terraform /usr/local/bin/terraform
```
> Note: Latest terraform is not supported yet. Download a version <=0.11.14

### GCloud

See https://cloud.google.com/sdk/docs/quickstart-debian-ubuntu


### Kubectl

After setting up google cloud sdk, install kubectl using this command:
```bash
apt install kubectl
```

### Helm

```bash
## Download the tar file
wget https://get.helm.sh/helm-v2.14.2-linux-amd64.tar.gz

## extract the tar file
unzip helm-v2.14.2-linux-amd64.tar.gz

## move the application binary to path
sudo mv helm /usr/local/bin/helm

```

## Configure credentials

After installing required dependencies, you have to configure them with right credentials. This is a one time process.

### Terraform

Create a free account at https://app.terraform.io/signup and then follow instructions at https://learn.hashicorp.com/terraform/cloud/tf_cloud_gettingstarted to create an organization, project and token that the terraform cli will use.

Then create a `.terraformrc` file in your home folder and add the following:
```
plugin_cache_dir   = "$HOME/.terraform.d/plugin-cache"
disable_checkpoint = false
credentials "app.terraform.io" {
    token = "[your token]"
}
```

### GCloud

Create a service account using instructions at https://cloud.google.com/iam/docs/creating-managing-service-account-keys

Add these roles to your service account:
 - Compute Admin
 - Compute Network Viewer
 - Kubernetes Engine Admin
 - Container Analysis Admin
 - Security Admin
 - Security Reviewer
 - Service Account User
 - Project IAM Admin

Then create a key and download the JSON file.

Create a creds folder at the root of this repo and add this JSON file to creds folder. Rename JSON file to gcp_creds.json

## Spinning up a new cluster

### Add terraform tfvars

You can configure the cluster parameters with the help of a `.tfvars file`.

Create a `terraform.tfvars` file at `intermine-cloud/terraform/intermine_cloud/gcp` folder and add the following things:
```
// This file may contains secrets
// Never add to git repo!!!!
// Assign values to variables according to project requirements.


credentials_file_path = "../../../creds/gcp_creds.json"
compute_engine_service_account = "[SERVICE_ACCOUNT_NAME]@[PROJECT_ID].iam.gserviceaccount.com"
project_id = "[PROJECT_ID]"
project_region = "europe-west2"
project_regional_boolean = "false"
cluster_name = "[CLUSTER_NAME]"
cluster_name_suffix = ""
zones = ["europe-west2-a"]
http_load_balancing_boolean = "true"

``` 
### Initialise terrfaorm

```bash
## change dir to gcp directory
cd intermine-cloud/terraform/intermine_cloud/gcp

## init terraform
terraform init
```

### Create a new cluster

```bash
## terraform plan will show what resources it is going to create
terraform plan

## terraform apply will create those resources
terraform apply
```

### Destroy a cluster

```bash
## from the same dir where you did terraform init
terraform refresh && terraform destroy
```

## Deploy InterMine on a cluster

### Configure Kubectl and Helm

This is a one time process, required for every new cluster.

#### Kubectl

```bash
gcloud container clusters get-credentials [CLUSTER_NAME] --zone [CLUSTER_ZONE] --project [PROJECT_ID]
```

#### Helm

```bash
## cd to helm folder
cd intermine-cloud/helm

## Apply tiller.yaml
kubectl apply -f tiller.yaml

## install tiller on cluster
helm init --service-account tiller
```
### Deploy InterMine

```bash
## cd to intermine-cloud/helm/intermine_instance
cd intermine-cloud/helm/intermine_instance

## Install InterMine on cluster
helm install .
```
This will take around 15min to complete. You can check the logs of builder for debugging. See 

### Delete InterMine instance from the cluster
```bash
helm delete --purge [NAME_OF_RELEASE]
```