import { AppContext } from './index'
import { useAuthReducer } from './reducers/auth-reducer'
import { useGlobalModalReducer } from './reducers/global-modal-reducer'
import { usePreferencesReducer } from './reducers/preferences-reducer'
import { useSidebarReducer } from './reducers/sidebar-reducer'

import type { TAppContext } from './types'

export interface AppContextProviderProps {
    children?: React.ReactChild
}

export const AppContextProvider = (props: AppContextProviderProps) => {
    const { children } = props
    const store: TAppContext = {
        authReducer: useAuthReducer(),
        preferencesReducer: usePreferencesReducer(),
        sidebarReducer: useSidebarReducer(),
        globalModalReducer: useGlobalModalReducer()
    }

    return <AppContext.Provider value={store}>{children}</AppContext.Provider>
}
