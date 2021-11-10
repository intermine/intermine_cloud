import { getValueFromLocalStorage, setValueToLocalStorage } from './common'

export const LOCAL_STORAGE_SIDEBAR_KEY = 'SIDEBAR'

const DefaultSidebar = {
    isOpen: window.innerWidth > 1200 ? true : false,
    isPageSwitchingAllowed: true,
    onSidebarItemClick: () => ({}),
}

type TSidebarState = {
    isOpen: boolean
}
export const getSidebarStateFromLocalStorage = (): TSidebarState => {
    try {
        const sidebar = getValueFromLocalStorage(LOCAL_STORAGE_SIDEBAR_KEY)

        if (typeof sidebar !== 'string') {
            return DefaultSidebar
        }

        return JSON.parse(sidebar)
    } catch {
        return DefaultSidebar
    }
}

export const setSidebarStateToLocalStorage = (sidebar: TSidebarState): void => {
    setValueToLocalStorage(LOCAL_STORAGE_SIDEBAR_KEY, JSON.stringify(sidebar))
}
