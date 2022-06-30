Intermine Compose
==================

Compose component

Installation
------------

To install `compose` ,
run this command in your terminal at the root of this project:

.. code-block:: console

   $ poetry install


Usage
-----

`compose` usage looks like:

.. code-block:: console

   $ compose [Command] [Flags]

**Commands**

.. option:: run

   Runs the backend server in debug mode.

.. warning:: Do not use this in prodcution.

.. option:: db [Command] [Flags]

   Runs database management related operations.

   **Commands**

   .. option:: init

   Initializes the database.

   .. option:: destroy

   Drops all the database tables.

   .. option:: reset

   Drops all the database tables and then recreates them.

**Flags**

.. option:: --help

   Display a short usage message and exit.