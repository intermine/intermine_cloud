import { getValueFromLocalStorage, setValueToLocalStorage } from './common'
import { DEFAULT_PREFERENCES } from '../../constants/preferences'

import type { TPreferencesReducer } from '../../context/types'

export const LOCAL_STORAGE_PREFERENCES_KEY = 'PREFERENCES'

export const getPreferencesFromLocalStorage = (): TPreferencesReducer => {
    try {
        const preferences = getValueFromLocalStorage(
            LOCAL_STORAGE_PREFERENCES_KEY
        )

        if (typeof preferences !== 'string') {
            return DEFAULT_PREFERENCES
        }

        return JSON.parse(preferences)
    } catch {
        return DEFAULT_PREFERENCES
    }
}

export const setPreferencesToLocalStorage = (
    preferences: TPreferencesReducer
): void => {
    setValueToLocalStorage(
        LOCAL_STORAGE_PREFERENCES_KEY,
        JSON.stringify(preferences)
    )
}
