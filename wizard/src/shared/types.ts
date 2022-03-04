import { AuthStates } from './constants'

/**
 * Auth
 */
export type TAuthReducerUserDetails = {
    name: string
    organisation: string
    email: string
    id: string
    isActive: boolean
}

export type TAuthReducerAuthState = AuthStates

export type TAuthReducerState = {
    authState: TAuthReducerAuthState
    userDetails: TAuthReducerUserDetails
}
