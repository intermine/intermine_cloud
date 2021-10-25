import { useReducer } from 'react'

import {
    getAuthStateFromLocalStorage,
    setAuthStateToLocalStorage,
} from '../../utils/local-storage/auth'

import { AuthStates, AuthActions } from '../../constants/auth'
import type {
    TAuthReducer,
    TAuthReducerAction,
    TUseAuthReducer,
    TUserDetails,
} from '../types'

/**
 * Auth reducer initial state
 */
const authReducerInitialState = getAuthStateFromLocalStorage()

const authReducer = (state: TAuthReducer, action: TAuthReducerAction) => {
    const { type, data } = action
    switch (type) {
        case AuthActions.UpdateAuthState:
            state = { ...state, authState: data as AuthStates }
            setAuthStateToLocalStorage(state)
            return state

        case AuthActions.UpdateUserDetails:
            state = { ...state, userDetails: data }
            return state

        /* istanbul ignore next */
        default:
            throw new Error(
                ''.concat(
                    '[Auth Reducer]: Action type is not identified',
                    'Type: ',
                    type
                )
            )
    }
}

export const useAuthReducer = (): TUseAuthReducer => {
    const [state, dispatch] = useReducer(authReducer, authReducerInitialState)

    const updateAuthState = (data: AuthStates) =>
        dispatch({
            type: AuthActions.UpdateAuthState,
            data,
        })

    const updateUserDetails = (data: TUserDetails) =>
        dispatch({
            type: AuthActions.UpdateUserDetails,
            data,
        })

    return {
        state,
        updateAuthState,
        updateUserDetails,
    }
}
