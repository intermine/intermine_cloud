# InterMine Cloud
[![Documentation Status](https://readthedocs.org/projects/intermine-cloud/badge/?version=latest)](https://intermine-cloud.readthedocs.io/en/latest/?badge=latest)

Intermine cloud project makes it easier to build and deploy InterMines.


It is built on top of various sub projects as resuable components.
But, for the end user, all the functionality is wrapped in a single
user friendly CLI called ``minectl``, which is available on Pypi.

Intermine Cloud project is designed and built with the following goals.

Ease of use
   Time to build and deploy your first InterMine should not take more than 10 minutes.
   
Hackable
   InterMine is built for researchers. They should be able to modify the system to fit their unique needs.

Reproducible
   Science is going through a reproducibility crisis. We care about this problem. So, InterMines should be
   easily shareable.


We have made good progress on our goals. But, we are constantly working on improving the system.
Please feel free to open issues on our Github repository. Pull requests are also welcome!

## Monerepo

The project is managed as a monorepo. Brief description of sub directories are below.
### builder

Python library for building an InterMine within a container.

### compose

SaaS backend for InterMine Cloud.

### demon

Service to communicate mine workflows and progress updates across NATS, between Argo and **compose**.

### docs

Generate diagrams for InterMine Cloud infrastructure.

### helm

**DEPRECATED**: Helm Chart for deploying InterMine Cloud and InterMine instances.

### helm-operator

Kubernetes operator utilising Helm for deploying InterMine instances.

### iminfra

**UNDER DEVELOPMENT**

### intermine-operator

**NOT IN USE**: Kubernetes operator written in Go for deploying InterMine instances.

### manifest

Kustomize manifests for deploying InterMine Cloud to Kubernetes.

### minectl

Wrapper around tools for developing and managing InterMine Cloud.

### operator

**NOT IN USE**: Kubernetes operator written in Go for deploying InterMine instances.

### scripts

Scripts to facilitate InterMine Cloud development.

### terraform

**OUTDATED**: Terraform infrastructure code for deploying InterMine Cloud to GCP.

### vanilla

Documentation and YAML files for using **helm-operator** InterMine instance Chart to manually deploy InterMine instances. Does not require backing infrastructure of InterMine Cloud.

### wizard

SaaS frontend for InterMine Cloud.

### workflows

Documentation and scripts for developing and testing Argo Workflow for building and deploying InterMine instances.

> InterMine cloud is still a work in progress. So, things might break due to on-going development.