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

// Data
export const DASHBOARD_DATASETS_LANDING_PATH = DASHBOARD_DATASETS_PATH
// eslint-disable-next-line max-len
export const DASHBOARD_UPLOAD_DATASET_PATH = `${DASHBOARD_DATASETS_PATH}/upload-dataset`

/**
 *
 * @param path path string, must starts with '/'
 * @returns {boolean}
 */
export const isAuthRoute = (path: string): boolean => {
    return path.startsWith(AUTH_PATH_BASE)
}
