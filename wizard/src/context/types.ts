import { ButtonCommonProps } from '@intermine/chromatin/button'
import type { ThemeType } from '@intermine/chromatin/styles'

import { AuthStates, AuthActions } from '../constants/auth'
import { GlobalModalActions } from '../constants/global-modal'
import { PreferencesActions } from '../constants/preferences'
import { SidebarActions } from '../constants/sidebar'

/**
 * Auth
 */

// TODO: fix type after userDetails structure is finalize.
export type TUserDetails = any

export type TAuthReducer = {
    authState: AuthStates
    userDetails: TUserDetails
}

export type TAuthReducerAction = {
    type: AuthActions
    data: unknown
}

export type TUseAuthReducer = {
    state: TAuthReducer
    updateAuthState: (state: AuthStates) => void
    updateUserDetails: (state: TUserDetails) => void
}
/**
 * Auth Ends
 */

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
    onSidebarItemClick: (to: string) => void
    isPageSwitchingAllowed: boolean
}

export type TSidebarReducerAction = {
    type: SidebarActions
    data: unknown
}

export type TUseSidebarReducer = {
    state: TSidebarReducer
    onSidebarItemClick: (fn: TSidebarReducer['onSidebarItemClick']) => void
    updatePageSwitchStatus: (status: boolean) => void
    removeOnSidebarItemClick: () => void
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
    children?: React.ReactChild | React.ReactChild[]
    isOpen?: boolean
    primaryAction?: ButtonCommonProps
    secondaryAction?: ButtonCommonProps
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

export type TAppContext = {
    authReducer: TUseAuthReducer
    preferencesReducer: TUsePreferencesReducer
    sidebarReducer: TUseSidebarReducer
    globalModalReducer: TUseGlobalModalReducer
}
