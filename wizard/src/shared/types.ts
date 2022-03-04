import { AlertProps } from '@intermine/chromatin/alert'
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

export type TGlobalAlertReducerAlert = {
    id: string
    type?: AlertProps['type']
    message?: string
    title?: string
    onClose?: () => void
    isOpen?: boolean
}

export type TGlobalAlertReducer = {
    alerts: {
        [x: string]: TGlobalAlertReducerAlert
    }
}
