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
