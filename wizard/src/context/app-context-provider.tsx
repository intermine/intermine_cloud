import { AppContext } from './app-context'
import { useStore } from './store'

export interface AppContextProviderProps {
    children?: React.ReactChild
}

export const AppContextProvider = (props: AppContextProviderProps) => {
    const { children } = props
    const store = useStore()

    return <AppContext.Provider value={store}>{children}</AppContext.Provider>
}
