import { TAuthReducer } from '../context/types'

export enum AuthStates {
    Authorize = 'Authorize',
    NotAuthorize = 'NotAuthorize',
}

export enum AuthActions {
    UpdateAuthState = 'UpdateUserAuthState',
    UpdateUserDetails = 'UpdateUserDetails',
}

export const DEFAULT_AUTH: TAuthReducer = {
    authState: AuthStates.NotAuthorize,
    userDetails: {
        email: '',
        name: '',
        organisation: '',
    },
}
