import { TAuthReducerState } from '../../shared/types'
import { getValueFromLocalStorage, setValueToLocalStorage } from './common'

export const LOCAL_STORAGE_AUTH_KEY = 'AUTH'

export const getAuthReducerFromLocalStorage = (
    defaultValue: TAuthReducerState
): TAuthReducerState => {
    try {
        const authState = getValueFromLocalStorage(LOCAL_STORAGE_AUTH_KEY)
        if (typeof authState !== 'string') {
            return defaultValue
        }

        return { ...defaultValue, ...JSON.parse(authState) }
    } catch {
        return defaultValue
    }
}

export const setAuthReducerToLocalStorage = (
    state: TAuthReducerState
): void => {
    setValueToLocalStorage(LOCAL_STORAGE_AUTH_KEY, JSON.stringify(state))
}
