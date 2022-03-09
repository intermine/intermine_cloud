## TODO

- Fix namespaces (?) -- perhaps so each component have their own namespace in addition to `workflows`
- Expose Argo web server in *base/argo.yaml* so you don't have to use Argo CLI for dashboard.

## Development

```
kubectl apply -k overlays/dev
```

**Traefik dashboard**: `kubectl port-forward svc/traefik 9090:9000` then open http://127.0.0.1:9090/dashboard/#/ (*Warning*: You **need** to use this URL including the path, otherwise you'll get a 404)

**MinIO dashboard**: `kubectl port-forward svc/argo-artifacts 9000:9000` then open http://localhost:9000 (*Note*: You'll need the base64 decoded tokens from `secret/argo-artifacts`)

## Generating base manifests

```
helm template traefik/traefik > base/traefik.yaml
curl https://raw.githubusercontent.com/argoproj/argo-workflows/master/manifests/install.yaml > base/argo.yaml
helm template argo-artifacts minio/minio --set fullnameOverride=argo-artifacts
```
