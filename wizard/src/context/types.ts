import { AlertProps } from '@intermine/chromatin/alert'
import { ButtonCommonProps } from '@intermine/chromatin/button'
import { ChromatinIcon } from '@intermine/chromatin/icons/types'

import type { ThemeType } from '@intermine/chromatin/styles'
import { HTMLAttributeAnchorTarget } from 'react'
import { LinkProps } from 'react-router-dom'

import {
    AdditionalSidebarActions,
    AdditionalSidebarTabs,
} from '../constants/additional-sidebar'

import { GlobalAlertsActions } from '../constants/global-alert'
import { GlobalModalActions } from '../constants/global-modal'
import { PreferencesActions } from '../constants/preferences'
import { ProgressActions, ProgressItemStatus } from '../constants/progress'
import { SharedReducerActions } from '../constants/shared-reducer'
import { SidebarActions } from '../constants/sidebar'

/**
 * Preferences
 */

export type TPreferencesReducer = {
    themeType: ThemeType
}

export type TPreferencesReducerAction = {
    type: PreferencesActions
    data: unknown
}

export type TUsePreferencesReducer = {
    state: TPreferencesReducer
    updateTheme: (theme: ThemeType) => void
}

/**
 * Preferences Ends
 */

/**
 * Sidebar
 */
export type TSidebarReducer = {
    isOpen: boolean
    onSidebarItemClick: (to: string) => void
    isPageSwitchingAllowed: boolean
}

export type TSidebarReducerAction = {
    type: SidebarActions
    data: unknown
}

export type TUseSidebarReducer = {
    state: TSidebarReducer
    updateSidebarState: (data: Partial<TSidebarReducer>) => void
}

/**
 * Sidebar Ends
 */

/**
 * Modal
 */
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

export type TGlobalModalReducerAction = {
    type: GlobalModalActions
    data: unknown
}

export type TUseGlobalModalReducer = {
    state: TGlobalModalReducer
    updateGlobalModalProps: (data: TGlobalModalReducer) => void
    closeGlobalModal: () => void
}

/**
 * Modal Ends
 */

/**
 * Additional Sidebar
 */
export type TAdditionalSidebarReducer = {
    isOpen: boolean
    activeTab: AdditionalSidebarTabs
}

export type TAdditionalSidebarReducerAction = {
    type: AdditionalSidebarActions
    data: Partial<TAdditionalSidebarReducer>
}

export type TUseAdditionalSidebarReducer = {
    state: TAdditionalSidebarReducer
    updateAdditionalSidebarState: (
        data: Partial<TAdditionalSidebarReducer>
    ) => void
}
/**
 * Additional Sidebar Ends
 */

/**
 * Global Alert
 */
export type TAlert = {
    id: string
    type?: AlertProps['type']
    message?: string
    title?: string
    onClose?: () => void
    isOpen?: boolean
}

export type TGlobalAlertReducer = {
    alerts: { [x: string]: TAlert }
}

export type TGlobalAlertReducerAction = {
    type: GlobalAlertsActions
    data: unknown
}

export type TUseGlobalAlertReducer = {
    state: TGlobalAlertReducer
    addAlert: (data: TAlert) => void
    removeAlert: (id: string) => void
    updateAlert: (data: TAlert) => void
}

/**
 * Global Alert Ends
 */

/**
 * Progress
 */
export type TProgressItem = {
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

export type TProgressItems = {
    [X in string]: TProgressItem
}

export type TProgressActiveItem = {
    id: string
    isDependentOnBrowser: boolean
}

export type TProgressActiveItems = {
    [X in string]: TProgressActiveItem
}

export type TProgressReducer = {
    progressItems: TProgressItems
    activeItems: TProgressActiveItems
    isRestrictUnmount: boolean
}

export type TProgressReducerAction = {
    type: ProgressActions
    data: unknown
}

export type TUseProgressReducer = {
    state: TProgressReducer
    addItemToProgress: (data: TProgressItem) => void
    updateProgressItem: (data: Partial<TProgressItem>) => void
    removeItemFromProgress: (id: string) => void
    addActiveItem: (data: TProgressActiveItem) => void
    removeActiveItem: (id: string) => void
}

/**
 * Progress Ends
 */

/**
 * Shared
 */

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

export type TSharedReducerAction = {
    type: SharedReducerActions
    data: Partial<TSharedReducer>
}

export type TUseSharedReducer = {
    state: TSharedReducer
    updateSharedReducer: (data: Partial<TSharedReducer>) => void
}

/**
 * Shared Ends
 */

/**
 * App Context
 */
export type TAppContext = {
    preferencesReducer: TUsePreferencesReducer
    sidebarReducer: TUseSidebarReducer
    globalModalReducer: TUseGlobalModalReducer
    additionalSidebarReducer: TUseAdditionalSidebarReducer
    globalAlertReducer: TUseGlobalAlertReducer
    progressReducer: TUseProgressReducer
    sharedReducer: TUseSharedReducer
}
