First, setup MinIO as artifact repository.

```
# install helm with your package manager
helm repo add minio https://helm.min.io/
helm repo update
helm install argo-artifacts minio/minio --set fullnameOverride=argo-artifacts
kubectl port-forward svc/argo-artifacts 9000:9000
```

Then you'll need to use the various manifests in the directory to create and prepopulate the contents of the two PVC's used in minebuilder.

Finally, you can start the workflow.

```
./make_minebuilder.py ~/path/to/biotestmine
argo -n argo submit --watch minebuilder.yaml
```
