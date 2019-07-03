provider "google" {
    version = "~> 2.9.0"
    credentials = "${file(var.credentials_file_path)}"
    project     = "${var.project_id}"
    region      = "${var.project_region}"
}

provider "google-beta" {
    version = "~> 2.9.0"
    credentials = "${file(var.credentials_file_path)}"
    project     = "${var.project_id}"
    region      = "${var.project_region}"
}

terraform {
    backend "remote" {
    hostname = "app.terraform.io"
    organization = "InterMine"

    workspaces {
        name = "intermine_cloud"
    }
    }
}