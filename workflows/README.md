# Development usage

The easiest way to run a local kubernetes cluster for development is with [kind](https://kind.sigs.k8s.io/) running on docker.

```
# install docker with your package manager and make sure it's running
# install kubernetes-kind with your package manager
kind create cluster --config ./kind.config.yaml
```

We will add Traefik to the cluster so we can access our InterMine instance later on.

```
helm repo add traefik https://helm.traefik.io/traefik
helm repo update
helm install traefik traefik/traefik -n traefik --create-namespace -f traefik.values.yaml
```

If you wish, you can access the Traefik dashboard by running `kubectl -n traefik port-forward svc/traefik 9090:9000` and opening: http://127.0.0.1:9090/dashboard/#/ (*Warning*: You **need** to use this URL including the path, otherwise you'll get a 404)

Argo Workflows runs in kubernetes and can be installed using its manifest.

```
# install kubectl with your package manager
kubectl create ns argo
kubectl create rolebinding default-admin --clusterrole=admin --serviceaccount=default:default
kubectl create configmap -n argo workflow-controller-configmap --from-literal=config="containerRuntimeExecutor: pns"
kubectl apply -n argo -f https://raw.githubusercontent.com/argoproj/argo-workflows/master/manifests/install.yaml
```

You will need the Argo CLI to access its web UI at https://localhost:2746 (note: using HTTPS is required and you'll have to accept the certificate) - follow the instructions at https://github.com/argoproj/argo-workflows/releases and run `argo server --auth-mode server`.

To support artifacts, you'll need to setup MinIO.

```
# install helm with your package manager
helm repo add minio https://helm.min.io/
helm repo update
helm install argo-artifacts minio/minio --set fullnameOverride=argo-artifacts
```

We'll need to create a bucket from the MinIO web UI to run our test workflows. Run `kubectl port-forward svc/argo-artifacts 9000:9000` and open http://localhost:9000 - to login you'll need the tokens from

```
kubectl get secret argo-artifacts -o jsonpath='{.data.accesskey}' | base64 --decode
kubectl get secret argo-artifacts -o jsonpath='{.data.secretkey}' | base64 --decode
```

Use the **+** button in the bottom right corner to create a bucket called `my-bucket`.

Now you need to tell Argo to use MinIO as the artifact repository. To achieve this, you create a ConfigMap and a Secret containing the necessary MinIO authentication keys.

```
kubectl apply -f artifacts.yaml
kubectl create secret generic my-minio-cred --from-literal=accesskey=`kubectl get secret argo-artifacts -o jsonpath='{.data.accesskey}' | base64 --decode` --from-literal=secretkey=`kubectl get secret argo-artifacts -o jsonpath='{.data.secretkey}' | base64 --decode`
```

Finally, you can start the workflow.

```
./make_minebuilder.py --mine-path ~/testmines/biotestmine --source-path ~/testdata/malaria
argo submit --watch minebuilder.yaml
```

*Note:* If your mine requires additional bio sources, you can install those by adding the `--bio-path ~/testbio/biotestmine-bio-sources` argument to the `./make_minebuilder.py` invocation.

Once the minebuilder workflow has finished, you can move on to run the minedeployer workflow. Before you do that, you should follow *intermine_cloud/helm-operator/README.md* to deploy the InterMine operator (make sure to stop after the `make deploy` step). Once that's done, you'll need permissions to create an IntermineInstance CRD.

```
kubectl apply -f rbac.yaml
kubectl create rolebinding workflow --role=workflow-role --serviceaccount=default:default
```

Now you can start the final workflow (remember to replace the `--bucket-path` flag with the path the minebuilder workflow used to save the artifacts - use the MinIO web UI to look this up).

```
./make_minedeployer.py --mine-name biotestmine --bucket-path build-a-mine-m7jg5/build-a-mine-m7jg5-914546954
argo submit --watch minedeployer.yaml
```

You should now be able to access the InterMine instance by opening: http://localhost/biotestmine

Note that to run another minedeployer workflow, you'll have to delete the existing instance as all are assigned to the same address for ease of testing.

```
kubectl get intermineinstances
kubectl delete intermineinstances deploy-a-mine-UNIQUE_ID_HERE
```

## Argo Events

```
kubectl create namespace argo-events
kubectl apply -f https://raw.githubusercontent.com/argoproj/argo-events/stable/manifests/install.yaml
kubectl apply -f https://raw.githubusercontent.com/argoproj/argo-events/stable/manifests/install-validating-webhook.yaml
kubectl apply -n argo-events -f https://raw.githubusercontent.com/argoproj/argo-events/stable/examples/eventbus/native.yaml

kubectl apply -n argo-events -f nats.yaml
kubectl apply -n argo-events -f event-source.yaml
kubectl apply -n argo-events -f https://raw.githubusercontent.com/argoproj/argo-events/master/examples/rbac/sensor-rbac.yaml
kubectl apply -n argo-events -f https://raw.githubusercontent.com/argoproj/argo-events/master/examples/rbac/workflow-rbac.yaml
kubectl apply -n argo-events -f sensor.yaml
```

`kubectl -n argo-events port-forward svc/nats 4222:4222`

```
nats context add local --description "Localhost" --select
nats pub minejob '{"message": "hello there"}'
```

Make sure to check Argo workflows using namespace `argo-events`.

```
argo -n argo-events list
```
