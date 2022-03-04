import { AuthStates, AdditionalSidebarTabs } from './constants'

export type TAuthReducerUserDetails = {
    name: string
    organisation: string
    email: string
    id: string
    isActive: boolean
}

export type TAuthReducerState = {
    authState: AuthStates
    userDetails: TAuthReducerUserDetails
}

export type TAdditionalSidebarReducer = {
    isOpen: boolean
    activeTab: AdditionalSidebarTabs
}
