Local - Container
=================

`Intermine builder <https://github.com/intermine/intermine_cloud/tree/master/builder>`_
library is used to handle local InterMine builds. 
It is a Python library that automates building an InterMine within a container.

The generated project directory and the data directory required for the build
are mounted inside a container where the build is performed.
After a successful build, dumps of Postgres and Solr are generated along with the WAR file of the webapp.
These artifacts are saved in a directory local to the project and later used for deploying the mine.

The generated project directory contains the skeleton of an InterMine.
One can make changes to these files as usual and customize the mine as needed.

Build and deployment parameters can be configured using ``minectl.toml`` file.

.. warning:: 
    Do not add sensitive parameters to ``minectl.toml``. 
    Instead use environment variables.

Mines are deployed by orchestrating three containers (Postgres, Solr and Webapp) using docker compose.
By default, only Webapp's exposed ports are bound to the host.
However, Postgres and Solr can also be exposed to the host for debugging using ``minectl.toml``.