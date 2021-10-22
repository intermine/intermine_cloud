import { AppContext } from './index'
import { useAuthReducer } from './reducers/auth-reducer'

import type { TAppContext } from './types'

export interface AppContextProviderProps {
    children?: React.ReactChild
}

export const AppContextProvider = (props: AppContextProviderProps) => {
    const { children } = props
    const store: TAppContext = {
        authReducer: useAuthReducer()
    }

    return <AppContext.Provider value={store}>{children}</AppContext.Provider>
}
