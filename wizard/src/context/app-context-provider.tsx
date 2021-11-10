import { AppContext } from './index'
// eslint-disable-next-line max-len
import { useAdditionalSidebarReducer } from './reducers/additional-sidebar-reducer'
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
        globalModalReducer: useGlobalModalReducer(),
        additionalSidebarReducer: useAdditionalSidebarReducer()
    }

    return <AppContext.Provider value={store}>{children}</AppContext.Provider>
}
