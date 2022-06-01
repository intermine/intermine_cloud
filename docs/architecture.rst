Architecture
============

.. note:: This is a technical description of the underlying architecture
    of InterMine Cloud. It is not necessary to go through it entirely.
    But, it is recommended for production platform operators.

.. toctree::
   :hidden:
   :maxdepth: 2

   compose
   demon


InterMine Cloud is build on top of many modular components to maximize code reusability.
Most of these components are either libraries themselves or are very thin implementations of libraries.
This enables extreme customizability and flexibility in deployments.

But, before deep diving into these libraries and architecture,
A brief discussion on the design principles and constraints
we followed is more appropriate.