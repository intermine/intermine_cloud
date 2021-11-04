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

To support artifacts, you'll need to setup MinIO (web UI accessible from http://localhost:9000).

```
# install helm with your package manager
helm repo add minio https://helm.min.io/
helm repo update
helm install argo-artifacts minio/minio --set fullnameOverride=argo-artifacts
kubectl port-forward svc/argo-artifacts 9000:9000
```

You need to tell Argo to use MinIO as the artifact repository. To achieve this, you create a ConfigMap and a Secret containing the necessary MinIO authentication keys.

```
kubectl apply -f artifacts.yaml
kubectl create secret generic my-minio-cred --from-literal=accesskey=`kubectl get secret argo-artifacts -o jsonpath='{.data.accesskey}' | base64 --decode` --from-literal=secretkey=`kubectl get secret argo-artifacts -o jsonpath='{.data.secretkey}' | base64 --decode`
```

Finally, you can start the workflow.

```
./make_minebuilder.py --mine-path ~/testmines/biotestmine --source-path ~/testdata/malaria
argo submit --watch minebuilder.yaml
```

Once the minebuilder workflow has finished, you can move on to run the minedeployer workflow. Before you do that, you should follow *intermine_cloud/helm-operator/README.md* to deploy the InterMine operator. Once that's done, you'll need permissions to create an IntermineInstance CRD.

```
kubectl apply -f rbac.yaml
kubectl create rolebinding workflow --role=workflow-role --serviceaccount=default:default
```

Now you can start the final workflow (remember to replace the `--bucket-path` flag using the MinIO webapp).

```
./make_minedeployer.py --mine-name biotestmine --bucket-path build-a-mine-m7jg5/build-a-mine-m7jg5-914546954
argo submit --watch minedeployer.yaml
```
