```
make docker-build
kind load docker-image intermine/helm-operator:0.0.1 --name kind-ingress
make deploy
kubectl apply -f config/samples/intermine_v1alpha1_intermineinstance.yaml
# Play with it!
kubectl delete -f config/samples/intermine_v1alpha1_intermineinstance.yaml
make undeploy
```
