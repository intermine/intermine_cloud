// GCP variables
variable "credentials_file_path" {
  type = "string"
  description = "Path to credentials.json file"
}

variable "project_id" {
  type = "string"
  description = "ID of the google cloud project"
}

variable "project_regional_boolean" {
  type = "string"
  description = "Regional boolean of google cloud project"
  default = "false"
}

variable "project_region" {
  type = "string"
  description = "Region of google cloud project"
}

variable "compute_engine_service_account" {
  description = "Service account to associate to the nodes in the cluster"
}

variable "cluster_name" {
  description = "cluster name"
  default     = "intermine_cloud"
}

variable "cluster_name_suffix" {
  description = "A suffix to append to the default cluster name"
  default     = ""
}

variable "zones" {
  type        = "list"
  description = "The zone to host the cluster in (required if is a zonal cluster)"
}

variable "network" {
  description = "The VPC network to host the cluster in"
}

variable "subnetwork" {
  description = "The subnetwork to host the cluster in"
}

variable "ip_range_pods" {
  description = "The secondary ip range to use for pods"
}

variable "ip_range_services" {
  description = "The secondary ip range to use for pods"
}

variable "http_load_balancing_boolean" {
  type = "string"
  description = "http load balancing boolean for kubernetes cluster"
  default = "false"
}

variable "horizontal_pod_autoscaling_boolean" {
  type = "string"
  description = "horizontal pod autoscaling boolean for kubernetes cluster"
  default = "true"
}

variable "kubernetes_dashboard_boolean" {
  type = "string"
  description = "kubernetes dashboard boolean for kubernetes cluster"
  default = "true"
}

variable "network_policy_boolean" {
  type = "string"
  description = "network policy boolean for kubernetes cluster"
  default = "true"
}

variable "node_pool_name" {
  type = "string"
  description = "node pool name"
  default = "default-node-pool"
}
variable "node_pool_machine_type" {
  type = "string"
  description = "machine type for kubernetes nodes"
  default = "n1-standard-1"
}

variable "node_pool_min_node_count" {
  type = "string"
  description = "minimum number of nodes for autoscaling"
  default = "3"
}

variable "node_pool_max_node_count" {
  type = "string"
  description = "maximum number of nodes for autoscaling"
  default = "5"
}

variable "node_pool_initial_node_count" {
  type = "string"
  description = "initial number of nodes for autoscaling"
  default = "3"
}
variable "node_disk_size_gb" {
  type = "string"
  description = "disk size in gb for nodes"
  default = "25"
}

variable "node_disk_type" {
  type = "string"
  description = "disk type for nodes"
  default = "pd-standard"
}

variable "node_image_type" {
  type = "string"
  description = "image type for nodes"
  default = "Ubuntu"
}

variable "node_auto_repair_boolean" {
  type = "string"
  description = "auto repair boolean for nodes"
  default = "true"
}

variable "node_auto_upgrade_boolean" {
  type = "string"
  description = "auto upgrade boolean for nodes"
  default = "true"
}

variable "node_preemptible_boolean" {
  type = "string"
  description = "preemptible boolean for nodes"
  default = "false"
}

