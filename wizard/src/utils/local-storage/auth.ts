import { getValueFromLocalStorage, setValueToLocalStorage } from './common'
import { AuthStates } from '../../constants/auth'

export const LOCAL_STORAGE_AUTH_KEY = 'AUTH'

export const getAuthStateFromLocalStorage = (): AuthStates => {
    const authState = getValueFromLocalStorage(LOCAL_STORAGE_AUTH_KEY)
    if (authState && authState in AuthStates) {
        return authState as AuthStates
    }

    return AuthStates.NotAuthorize
}

export const setAuthStateToLocalStorage = (state: AuthStates): void => {
    setValueToLocalStorage(LOCAL_STORAGE_AUTH_KEY, state.toString())
}
