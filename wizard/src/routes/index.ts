export const BASE_PATH = ''

// Pre-auth paths
export const PRE_AUTH_PATH_BASE = `${BASE_PATH}/pre-auth`
export const LOGIN_PATH = `${PRE_AUTH_PATH_BASE}/login`
export const REGISTER_PATH = `${PRE_AUTH_PATH_BASE}/register`
export const FORGOT_PASSWORD_PATH = `${PRE_AUTH_PATH_BASE}/forgot-password`

// Auth Paths
export const AUTH_PATH_BASE = `${BASE_PATH}/app`
export const DASHBOARD_OVERVIEW_PATH = `${AUTH_PATH_BASE}/overview`
export const DASHBOARD_DATASETS_PATH = `${AUTH_PATH_BASE}/datasets`
export const DASHBOARD_MINES_PATH = `${AUTH_PATH_BASE}/mines`
export const DASHBOARD_TEMPLATES_PATH = `${AUTH_PATH_BASE}/templates`
export const DASHBOARD_CLUSTERS_PATH = `${AUTH_PATH_BASE}/clusters`

// Data
export const DASHBOARD_DATASETS_LANDING_PATH = DASHBOARD_DATASETS_PATH
// eslint-disable-next-line max-len
export const DASHBOARD_UPLOAD_DATASET_PATH = `${DASHBOARD_DATASETS_PATH}/upload-dataset`

// Templates
export const DASHBOARD_TEMPLATES_LANDING_PATH = DASHBOARD_TEMPLATES_PATH
// eslint-disable-next-line max-len
export const DASHBOARD_UPLOAD_TEMPLATE_PATH = `${DASHBOARD_TEMPLATES_PATH}/upload-template`

// Mine
export const DASHBOARD_MINES_LANDING_PATH = DASHBOARD_MINES_PATH
// eslint-disable-next-line max-len
export const DASHBOARD_CREATE_MINE_PATH = `${DASHBOARD_MINES_PATH}/create-mine`

// Cluster
export const DASHBOARD_CLUSTERS_LANDING_PATH = DASHBOARD_CLUSTERS_PATH
// eslint-disable-next-line max-len
export const DASHBOARD_CREATE_CLUSTER_PATH = `${DASHBOARD_CLUSTERS_PATH}/create-cluster`

/**
 *
 * @param path path string, must starts with '/'
 * @returns {boolean}
 */
export const isAuthRoute = (path: string): boolean => {
    return path.startsWith(AUTH_PATH_BASE)
}
