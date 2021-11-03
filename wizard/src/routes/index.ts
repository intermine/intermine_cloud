export const BASE_PATH = ''

// Pre-auth paths
export const PRE_AUTH_PATH_BASE = `${BASE_PATH}/pre-auth`
export const LOGIN_PATH = `${PRE_AUTH_PATH_BASE}/login`
export const REGISTER_PATH = `${PRE_AUTH_PATH_BASE}/register`
export const FORGOT_PASSWORD_PATH = `${PRE_AUTH_PATH_BASE}/forgot-password`

// Auth Paths
export const AUTH_PATH_BASE = `${BASE_PATH}/app`
export const DASHBOARD_OVERVIEW_PATH = `${AUTH_PATH_BASE}/overview`
export const DASHBOARD_DATA_PATH = `${AUTH_PATH_BASE}/data`
export const DASHBOARD_MINES_PATH = `${AUTH_PATH_BASE}/mines`

export { isAuthRoute } from './validate'
