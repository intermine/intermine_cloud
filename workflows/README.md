# Development usage

The easiest way to run a local kubernetes cluster for development is with kind running on docker.

```
# install docker with your package manager and make sure it's running
# install kubernetes-kind with your package manager
kind create cluster
```

Argo Workflows runs in kubernetes and can be installed using its manifest.

```
# install kubectl with your package manager
kubectl create namespace argo
kubectl create rolebinding default-admin --clusterrole=admin --serviceaccount=default:default
kubectl create configmap -n argo workflow-controller-configmap --from-literal=config="containerRuntimeExecutor: pns"
kubectl apply -n argo -f https://raw.githubusercontent.com/argoproj/argo-workflows/master/manifests/install.yaml
```

You will need the Argo CLI to access the web UI at https://localhost:2746 - follow the instructions at https://github.com/argoproj/argo-workflows/releases and run `argo server --auth-mode server`.

To support output artifacts for testing, you'll need to setup MinIO as the artifact repository (web UI accessible from http://localhost:9000).

```
# install helm with your package manager
helm repo add minio https://helm.min.io/
helm repo update
helm install argo-artifacts minio/minio --set fullnameOverride=argo-artifacts
kubectl port-forward svc/argo-artifacts 9000:9000
```

Then you'll need to use the various manifests in the directory to create and prepopulate the contents of the two PVC's used in minebuilder. Make sure to also create the `artifacts.yaml` resource to expose MinIO to Argo, and create a secret containing your MinIO keys with the below command.

```
kubectl -n argo create secret generic my-minio-cred --from-literal=accesskey=`kubectl get secret argo-artifacts -o jsonpath='{.data.accesskey}' | base64 --decode` --from-literal=secretkey=`kubectl get secret argo-artifacts -o jsonpath='{.data.secretkey}' | base64 --decode`
```

Finally, you can start the workflow.

```
./make_minebuilder.py ~/path/to/biotestmine
argo -n argo submit --watch minebuilder.yaml
```
