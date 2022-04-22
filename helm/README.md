First follow *intermine_cloud/terraform/README.md*.

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
