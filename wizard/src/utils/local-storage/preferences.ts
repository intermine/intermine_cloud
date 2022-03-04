import { getValueFromLocalStorage, setValueToLocalStorage } from './common'
import type { TPreferencesReducer } from '../../shared/types'

export const LOCAL_STORAGE_PREFERENCES_KEY = 'PREFERENCES'

export const getPreferencesReducerFromLocalStorage = (
    defaultValue: TPreferencesReducer
): TPreferencesReducer => {
    try {
        const preferences = getValueFromLocalStorage(
            LOCAL_STORAGE_PREFERENCES_KEY
        )

        if (typeof preferences !== 'string') {
            return defaultValue
        }

        return JSON.parse(preferences)
    } catch {
        return defaultValue
    }
}

export const setPreferencesReducerToLocalStorage = (
    preferences: TPreferencesReducer
): void => {
    setValueToLocalStorage(
        LOCAL_STORAGE_PREFERENCES_KEY,
        JSON.stringify(preferences)
    )
}
