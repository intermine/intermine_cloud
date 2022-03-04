import { AlertProps } from '@intermine/chromatin/alert'
import { ButtonCommonProps } from '@intermine/chromatin/button'
import { ChromatinIcon } from '@intermine/chromatin/icons/types'
import { ThemeType } from '@intermine/chromatin/styles'
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

export type TGlobalModalReducer = {
    heading?: string
    type?: 'error' | 'warning' | 'success' | 'info'
    HeaderIcon?: (props: ChromatinIcon) => JSX.Element
    children?: React.ReactChild | React.ReactChild[]
    isOpen: boolean
    primaryAction?: ButtonCommonProps
    secondaryAction?: ButtonCommonProps
    isLoadingPrimaryAction?: boolean
    isLoadingSecondaryAction?: boolean
}

export type TSharedReducer = {
    isUploadingAnyFile: boolean
    isEditingAnyForm: boolean
    /**
     * Callback function to show user warning, if any
     * file is uploading and user request to logout.
     */
    cbIfUploadingFileAndUserRequestLogout?: () => void
    /**
     * Callback function to show user warning, if any
     * form is edited by user and user request to logout.
     */
    cbIfEditingFormAndUserRequestLogout?: () => void
}

export type TSidebarReducer = {
    isOpen: boolean
    onSidebarItemClick: (to: string) => void
    isPageSwitchingAllowed: boolean
}

export type TPreferencesReducer = {
    themeType: ThemeType
}
