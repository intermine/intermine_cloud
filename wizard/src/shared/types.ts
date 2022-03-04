import { AlertProps } from '@intermine/chromatin/alert'
import { HTMLAttributeAnchorTarget } from 'react'
import { LinkProps } from 'react-router-dom'

import {
    AuthStates,
    AdditionalSidebarTabs,
    ProgressItemStatus,
} from './constants'

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
    alerts: Record<string, TGlobalAlertReducerAlert>
}

export type TProgressReducerItem = {
    id: string
    name: string
    status: ProgressItemStatus
    totalSize: number
    loadedSize: number
    getProgressText: (loadedSize: number, totalSize: number) => string
    onRetry: () => void
    onCancel: () => void
    getOnSuccessViewButtonProps?: () => {
        to: LinkProps['to']
        title: string
        target?: HTMLAttributeAnchorTarget
    }
    getRunningStatusText?: (loadedSize: number, totalSize: number) => string
}

export type TProgressReducerActiveItem = {
    id: string
    isDependentOnBrowser: boolean
}

export type TProgressReducer = {
    items: Record<string, TProgressReducerItem>
    activeItems: Record<string, TProgressReducerActiveItem>
    isRestrictUnmount: boolean
}
