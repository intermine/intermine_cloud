import { AlertProps } from '@intermine/chromatin/alert'
import { ButtonCommonProps } from '@intermine/chromatin/button'
import { ChromatinIcon } from '@intermine/chromatin/icons/types'

import type { ThemeType } from '@intermine/chromatin/styles'
import { HTMLAttributeAnchorTarget } from 'react'
import { LinkProps } from 'react-router-dom'

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
    sharedReducer: TUseSharedReducer
}
