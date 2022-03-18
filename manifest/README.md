## TODO

- Use `vars`
- Use `patchesStrategicMerge` instead of `patches`
- Deploy `intermine/helm-operator:0.0.1` to dockerhub
- Fix namespaces (the way it is now, workflows probably don't work) -- perhaps so each component have their own namespace in addition to `workflows`
- Expose Argo web server in *base/argo.yaml* so you don't have to use Argo CLI for dashboard.

## Development

```
kubectl apply -k overlays/dev
```

**Traefik dashboard**: `kubectl port-forward svc/traefik 9090:9000` then open http://127.0.0.1:9090/dashboard/#/ (*Warning*: You **need** to use this URL including the path, otherwise you'll get a 404)

**MinIO dashboard**: `kubectl port-forward svc/argo-artifacts 9000:9000` then open http://localhost:9000 (*Note*: You'll need the base64 decoded tokens from `secret/argo-artifacts`)

## Generating base manifests

The first time you'll need to add the Helm repositories containing the charts.

```
helm repo add traefik https://helm.traefik.io/traefik
helm repo add minio https://helm.min.io/
helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo add nats https://nats-io.github.io/k8s/helm/charts/
helm repo update
```

Then you can generate the manifests.

```
helm template traefik traefik/traefik > base/traefik.yaml
curl https://raw.githubusercontent.com/argoproj/argo-workflows/master/manifests/install.yaml > base/argo.yaml
helm template argo-artifacts minio/minio --set fullnameOverride=argo-artifacts > base/minio.yaml
pushd ../helm-operator ; kustomize build config/default > ../manifest/base/intermine.yaml ; popd
helm template compose bitnami/postgresql > base/compose_postgres.yaml
helm template nats nats/nats > base/nats.yaml
```
