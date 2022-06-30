Design and Architecture
=======================

Before diving deep into the individual components and advanced use cases.
It is important to have an overview of the overall design and architecture of InterMine Cloud.

InterMine Cloud is designed to accommodate a number of use cases and deployment scenarios.
The implementation in each scenario differs in certain aspects. These scenarios are roughly
categorised as follows:

.. toctree::
   :hidden:
   :maxdepth: 1
   
   local-container
   local-kube


Local - Container
    Local build and deployments using containers.
    These containers are managed either by ``docker`` or ``podman``. 

Local - Kubernetes
    Local build and deployments using a ``kind`` cluster.
    This is mostly used for local testing and development before moving to a cloud kuberentes cluster.

Cloud - Container
    Build and deploy using containers on a Cloud VM.
    Creation of cloud resources are managed by ``pulumi``.

Cloud - Kuberenetes
    Build and deploy using a cloud Kubernetes cluster.
    The Kubernetes cluster can either be managed or can be created automatically by ``pulumi``

Cloud - SaaS
    A full fledged cloud platform to build and deploy multiple InterMines.


.. note:: 
    A managed Cloud - SaaS is also available at https://cloud.intermine.org

All of the implementations share the following features:

Git repositiory as single source of truth
    The workflow start with creating a new git repository based on a template using ``minectl``.
    This git repository serve as a single source of truth for the state of your build and deployments.
    Data required for your build is also tracked using the same git repository with the help of ``dvc``.

.. note:: 
    Data is handled differently in the case of Cloud - SaaS

Host Operating System isolation
    All the required tools are downloaded in a local directory inside your project by ``minectl``.
    So no changes are made to the host operating system.
    This provides more stability and reproducibility to the system.

Specific implementation details for each scenario is discussed in the next sections.


