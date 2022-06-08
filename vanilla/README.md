## Deployment

Firstly, login to the [Rahti console](https://rahti.csc.fi:8443) and click your username in the top-right followed by *Copy Login Command*. You will need the [OpenShift CLI](https://github.com/openshift/origin/releases) to use the login command.

You should now be able to use `kubectl` and dependent commands like `helm` to manage your Rahti kubernetes cluster.

### Installing

Edit *pombemine.yaml* and *secrets.yaml* so the mineName, objectStorage keys and bucket paths are correct. You will need to have uploaded each of the required resources to Allas (`rclone sync -P my-local-dir s3allas:mybucket/path`).

```bash
helm install -f values.yaml -f pombemine.yaml -f secrets.yaml pombemine ../helm-operator/helm-charts/intermineinstance
```

### Upgrading

If you've made changes to the charts or values and wish to get a previously installed release up-to-date, you can use the upgrade command.

```bash
helm upgrade -f values.yaml -f pombemine.yaml -f secrets.yaml pombemine ../helm-operator/helm-charts/intermineinstance
```

**This will start a new job to rebuild the mine (keeping the existing userprofile DB).**

You can optionally include any of the following flags:

- `--set builder.task=redeploy` to run one specific build task instead of performing a full rebuild
- `--set builder.rebuild=true` to perform a full build while keeping the existing userprofile DB (you don't need this flag for upgrades as this is default behaviour)

*Note: If changes were made to the CronJob responsible for backups, you need to manually delete it with `kubectl delete cronjobs.batch/pombemine-backup` to be able to create the new one. After deletion, use the command from [Cherry-picking](#cherry-picking) with `app.kubernetes.io/component=backup`*

### Uninstalling

Most of the resources will be removed by helm.

```bash
helm uninstall pombemine
```

If the builder job hasn't finished, this will continue to linger unless you delete it.

```bash
kubectl delete job.batch/pombemine-builder
```

Postgresql and solr use PVCs so their resources can be replaced without losing data. If you've changed their configuration or would like to start from an empty database, you will need to delete their PVCs.

```bash
kubectl delete pvc/data-pombemine-postgresql-0
kubectl delete pvc/data-pombemine-solr-0
```

### Advanced usage

#### Backups

Automated backups of the userprofile DB can be made to the Allas object storage. To enable this, set `backup.objectStorage.bucket`.

#### Cherry-picking

This uses the kubectl `-l` flag to only apply the resources matching a selector, which in this example is for tomcat.

```bash
helm template -f values.yaml -f pombemine.yaml -f secrets.yaml pombemine ../helm-operator/helm-charts/intermineinstance | kubectl apply -f - -l app.kubernetes.io/name=tomcat
```

The same can be done for the other applications as well.

- `app.kubernetes.io/name=tomcat`
- `app.kubernetes.io/name=postgresql`
- `app.kubernetes.io/name=solr`
- `app.kubernetes.io/name=intermineinstance` for BlueGenes

## Allas Object Storage

```bash
wget https://raw.githubusercontent.com/CSCfi/allas-cli-utils/master/allas_conf
# install rclone with your package manager
# install liberasurecode with your package manager, or from source: https://github.com/openstack/liberasurecode
# if from source, you might have to add LD_LIBRARY_PATH=/usr/local/lib to the below command.
pip3 install --user python-openstackclient swift
```

**WARNING**: If you are using any other shell than bash, you will need to run `bash` first. For more information, see: https://github.com/CSCfi/allas-cli-utils#installing-allas-cli-utils

For all password prompts that follow, use your CSC account password.

```bash
source allas_conf --user <your-csc-username>
```

You can now use [rclone](https://docs.csc.fi/data/Allas/using_allas/rclone/) to interact with the object storage.

For programmatic access, some additional steps are required:

1. Open https://pouta.csc.fi/dashboard/project/api_access/
1. Click *Download OpenStack RC File* near the right edge of the page
1. Click *OpenStack RC File (Identity API v3)*
1. Run `source ~/Downloads/project_XXXXXXX-openrc.sh`

You now have all the environment variables (`env | grep OS`) needed to use Keystone authentication with the [Python swift client](https://docs.openstack.org/python-swiftclient/newton/client-api.html).

You can also create *S3-like* `ACCESS_KEY` and `SECRET_KEY` credentials using `openstack ec2 credentials create` and then to list them again in the future, `openstack ec2 credentials list -f yaml`.

To use rclone with these credentials and not your CSC account, edit `~/.config/rclone/rclone.conf` to add

```rc
[s3allas]
type = s3
provider = Other
env_auth = false
access_key_id = <ACCESSKEY>
secret_access_key = <SECRETKEY>
endpoint = object.pouta.csc.fi
location_constraint = regionOne
```

replacing the following

- `<ACCESSKEY>`
- `<SECRETKEY>`

For an example of performing this within CSC, see: https://github.com/lvarin/rclone-template

#### Resources
- https://docs.csc.fi/cloud/pouta/install-client/
- https://docs.csc.fi/cloud/rahti/tutorials/backup-postgres-allas/
- https://docs.csc.fi/data/Allas/using_allas/python_library/

## Rahti docker registry

Sometimes you want to make a docker image available on Rahti without pushing it to dockerhub. You can do this by going to https://registry-console.rahti.csc.fi/registry and copying the *docker login* command. You can now build an image and push it to this registry.

```bash
docker build -t myimage .
docker tag myimage docker-registry.rahti.csc.fi/myproject/myimage:0.0.1
docker tag myimage docker-registry.rahti.csc.fi/myproject/myimage:latest
docker push docker-registry.rahti.csc.fi/myproject/myimage:0.0.1
docker push docker-registry.rahti.csc.fi/myproject/myimage:latest
```

Then use the repository tag: `docker-registry.default.svc:5000/myproject/myimage`


#### Resources
- https://docs.csc.fi/cloud/rahti/tutorials/docker_hub_manual_caching/
