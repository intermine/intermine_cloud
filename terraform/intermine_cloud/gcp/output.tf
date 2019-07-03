output "kubernetes_endpoint" {
  sensitive = true
  value     = "${module.gke.endpoint}"
}

output "client_token" {
  sensitive = true
  value     = "${base64encode(data.google_client_config.default.access_token)}"
}

output "ca_certificate" {
  value = "${module.gke.ca_certificate}"
}

output "service_account" {
  description = "The service account to default running nodes as if not overridden in `node_pools`."
  value       = "${module.gke.service_account}"
}

output "project_id" {
  value = "${var.project_id}"
}

output "region" {
  value = "${module.gke.region}"
}

output "cluster_name" {
  description = "Cluster name"
  value       = "${module.gke.name}"
}

output "network" {
  value = "${var.network}"
}

output "subnetwork" {
  value = "${var.subnetwork}"
}

output "location" {
  value = "${module.gke.location}"
}

output "ip_range_pods" {
  description = "The secondary IP range used for pods"
  value       = "${var.ip_range_pods}"
}

output "ip_range_services" {
  description = "The secondary IP range used for services"
  value       = "${var.ip_range_services}"
}

output "zones" {
  description = "List of zones in which the cluster resides"
  value       = "${module.gke.zones}"
}

output "master_kubernetes_version" {
  description = "The master Kubernetes version"
  value       = "${module.gke.master_version}"
}