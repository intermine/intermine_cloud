import { AuthStates, AuthActions } from '../constants/auth'

/**
 * Auth
 */
export type TAuthReducer = {
    authState: AuthStates
}

export type TAuthReducerAction = {
    type: AuthActions
    data: unknown
}

export type TUseAuthReducer = {
    state: TAuthReducer
    updateAuthState: (state: AuthStates) => void
}
/**
 * Auth Ends
 */

export type TAppContext = {
    authReducer: TUseAuthReducer
}
