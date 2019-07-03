resource "random_string" "suffix" {
  length  = 4
  special = false
  upper   = false
}
resource "google_compute_network" "main" {
  name                    = "intermine-gke-test-${random_string.suffix.result}"
  auto_create_subnetworks = "false"
}

resource "google_compute_subnetwork" "main" {
  name          = "intermine-gke-test-${random_string.suffix.result}"
  ip_cidr_range = "10.0.0.0/17"
  region        = "${var.project_region}"
  network       = "${google_compute_network.main.self_link}"

  secondary_ip_range {
    range_name    = "intermine-gke-test-pods-${random_string.suffix.result}"
    ip_cidr_range = "192.168.0.0/18"
  }

  secondary_ip_range {
    range_name    = "intermine-gke-test-services-${random_string.suffix.result}"
    ip_cidr_range = "192.168.64.0/18"
  }
}
