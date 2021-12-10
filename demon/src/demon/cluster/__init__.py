"""Cluster interfaces."""

from blackcap.cluster import cluster_registry  # noqa: F401

from demon.cluster.argo_cluster import ArgoCluster

cluster_registry.add_cluster(ArgoCluster())
