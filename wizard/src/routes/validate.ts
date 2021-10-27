import { AUTH_PATH_BASE } from '.'
/**
 *
 * @param path path string, must starts with '/'
 * @returns {boolean}
 */
export const isAuthRoute = (path: string): boolean => {
    return path.startsWith(AUTH_PATH_BASE)
}
