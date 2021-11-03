## Development

### Deploy to local kubernetes cluster.

You'll first need to build the controller's docker image.

```
make docker-build
```

Then you'll need to load the docker image into your cluster. This varies depending on how you're running kubernetes locally, but for kind you can run `kind load docker-image intermine/operator:0.0.1` replacing the version number with what was outputted in your terminal.

Finally, run the following to deploy it to your cluster.

```
make deploy
kubectl apply -f config/samples/_v1alpha1_intermineinstance.yaml
# Play with it!
kubectl delete -f config/samples/_v1alpha1_intermineinstance.yaml
make undeploy
```

### Run without a cluster

```
make install run
```