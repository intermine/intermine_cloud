import { getValueFromLocalStorage, setValueToLocalStorage } from './common'
import { DEFAULT_AUTH } from '../../constants/auth'
import { TAuthReducer } from '../../context/types'

export const LOCAL_STORAGE_AUTH_KEY = 'AUTH'

export const getAuthStateFromLocalStorage = (): TAuthReducer => {
    try {
        const authState = getValueFromLocalStorage(LOCAL_STORAGE_AUTH_KEY)
        if (typeof authState !== 'string') {
            return DEFAULT_AUTH
        }

        return JSON.parse(authState)
    } catch {
        return DEFAULT_AUTH
    }
}

export const setAuthStateToLocalStorage = (state: TAuthReducer): void => {
    setValueToLocalStorage(LOCAL_STORAGE_AUTH_KEY, JSON.stringify(state))
}
