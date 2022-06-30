Intermine Cloud
==============================


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

.. toctree::
   :hidden:
   :maxdepth: 2
   
   book/architecture/architecture
   book/usage/new_project
   book/components/compose
   book/components/demon

Getting Started
---------------

Install ``minectl`` using pip

.. code-block:: console

   $ pip install minectl

Create a new project for local build and deployment

.. code-block:: console

   $ minectl new local -t biotestmine -n mymine

.. note:: 
   We are using the ``biotestmine`` template for the new project.
   You can find a list of available templates here.

Install dependecies for your new project

.. code-block:: console

   $ cd mymine && minectl bootstrap .

.. note:: 
   This might take some time depending on your network connection.


Build your mine

.. code-block:: console

   $ minectl build

Deploy your mine

.. code-block:: console

   $ minectl deploy

Congratulations! You have successfully built and deployed an InterMine.
You can commit the project files to a git repository for sharing your mine with others.
