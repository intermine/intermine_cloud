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
} from '../types'

/**
 * Auth reducer initial state
 */
const authReducerInitialState: TAuthReducer = {
    authState: getAuthStateFromLocalStorage(),
}

const authReducer = (state: TAuthReducer, action: TAuthReducerAction) => {
    const { type, data } = action
    switch (type) {
        case AuthActions.UpdateAuthState:
            setAuthStateToLocalStorage(data as AuthStates)
            state = { ...state, authState: data as AuthStates }
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

    return {
        state,
        updateAuthState,
    }
}
