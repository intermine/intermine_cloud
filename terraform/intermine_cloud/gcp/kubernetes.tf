module "gke" {
  source                     = "terraform-google-modules/kubernetes-engine/google"
  version                    = "3.0.0"
  project_id                 = "${var.project_id}"
  name                       = "${var.cluster_name}"
  region                     = "${var.project_region}"
  regional                   = "${var.project_regional_boolean}"
  zones                      = ["${slice(var.zones,0,1)}"]
  # network                    = "${var.network}"
  # subnetwork                 = "${var.subnetwork}"
  # ip_range_pods              = "${var.ip_range_pods}"
  # ip_range_services          = "${var.ip_range_services}"
  network                    = "${google_compute_network.main.name}"
  subnetwork                 = "${google_compute_subnetwork.main.name}"
  ip_range_pods              = "${google_compute_subnetwork.main.secondary_ip_range.0.range_name}"
  ip_range_services          = "${google_compute_subnetwork.main.secondary_ip_range.1.range_name}"
  http_load_balancing        = "${var.http_load_balancing_boolean}"
  horizontal_pod_autoscaling = "${var.horizontal_pod_autoscaling_boolean}"
  kubernetes_dashboard       = "${var.kubernetes_dashboard_boolean}"
  network_policy             = "${var.network_policy_boolean}"
  service_account            = "${var.compute_engine_service_account}"

  node_pools = [
    {
      name               = "${var.node_pool_name}"
      machine_type       = "${var.node_pool_machine_type}"
      min_count          = "${var.node_pool_min_node_count}"
      max_count          = "${var.node_pool_max_node_count}"
      disk_size_gb       = "${var.node_disk_size_gb}"
      disk_type          = "${var.node_disk_type}"
      image_type         = "${var.node_image_type}"
      auto_repair        = "${var.node_auto_repair_boolean}"
      auto_upgrade       = "${var.node_auto_upgrade_boolean}"
      service_account    = "${var.compute_engine_service_account}"
      preemptible        = "${var.node_preemptible_boolean}"
      initial_node_count = "${var.node_pool_initial_node_count}"
    },
  ]

  node_pools_oauth_scopes = {
    all = []

    "${var.node_pool_name}" = [
      "https://www.googleapis.com/auth/cloud-platform",
    ]
  }

  node_pools_labels = {
    all = {}

    "${var.node_pool_name}" = {
      "${var.node_pool_name}" = "true"
    }
  }

  node_pools_metadata = {
    all = {}

    "${var.node_pool_name}" = {
      node-pool-metadata-custom-value = "test-node-pool"
    }
  }

  node_pools_taints = {
    all = []

    "${var.node_pool_name}" = [
      {
        key    = "${var.node_pool_name}"
        value  = "true"
        effect = "PREFER_NO_SCHEDULE"
      },
    ]
  }

  node_pools_tags = {
    all = []

    "${var.node_pool_name}" = [
      "${var.node_pool_name}",
    ]
  }
}

data "google_client_config" "default" {}