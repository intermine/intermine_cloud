import type { ThemeType } from '@intermine/chromatin/styles'

import { AuthStates, AuthActions } from '../constants/auth'
import { PreferencesActions } from '../constants/preferences'

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

export type TAppContext = {
    authReducer: TUseAuthReducer
    preferencesReducer: TUsePreferencesReducer
}
