import { TSidebarReducer } from '../../shared/types'
import { getValueFromLocalStorage, setValueToLocalStorage } from './common'

export const LOCAL_STORAGE_SIDEBAR_KEY = 'SIDEBAR'

export const getSidebarReducerFromLocalStorage = (
    defaultValue: TSidebarReducer
): TSidebarReducer => {
    try {
        const sidebar = getValueFromLocalStorage(LOCAL_STORAGE_SIDEBAR_KEY)

        if (typeof sidebar !== 'string') {
            return defaultValue
        }

        return { ...defaultValue, ...JSON.parse(sidebar) }
    } catch {
        return defaultValue
    }
}

export const setSidebarReducerToLocalStorage = (sidebar: {
    isOpen: boolean
}): void => {
    setValueToLocalStorage(LOCAL_STORAGE_SIDEBAR_KEY, JSON.stringify(sidebar))
}
