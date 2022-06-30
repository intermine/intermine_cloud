# Flux

```bash
flux get kustomization | awk '{if ($1 != "NAME" && $1 != "flux-system") print $1;}' | xargs flux delete ks -s
```
