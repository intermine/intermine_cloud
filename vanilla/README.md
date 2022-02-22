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

#### Resources
- https://docs.csc.fi/cloud/pouta/install-client/
- https://docs.csc.fi/cloud/rahti/tutorials/backup-postgres-allas/
- https://docs.csc.fi/data/Allas/using_allas/python_library/
