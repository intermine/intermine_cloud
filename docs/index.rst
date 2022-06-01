Intermine Cloud
==============================

Intemine Cloud is a cloud native platform that enables automation of InterMine
builds and deployments. It also provides a framework to provide this automation
to the end user as a service.

.. toctree::
   :hidden:
   :maxdepth: 2
   
   architecture

Installation
------------

.. code-block:: console

   $ pip install iminfra


Getting Started
----------------

Use the `iminfra` CLI to create a new git repository with the vanilla kubernetes template.
Other available template can be found [here].

.. code-block:: console

   $ iminfra new kube ./biocloud

After the execution of the above command, a biocloud directory will be created.
Inside the directory, a python project with the same name is also created.
Change directory to `biocloud` and use the setup script to install the project
into an isolated environment.

.. code-block:: console

   $ cd biocloud && python scripts/setup_env.py

This will take a few minutes depending on the network connection.
Once the isolated environment is ready, activate the environment.

.. code-block:: console

   $ source .setup.env

A CLI with the same name as the project will be present in
this environment. In this case, it is `biocloud`. It can be used
to manage the cloud platform.

