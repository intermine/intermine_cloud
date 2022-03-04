import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { AuthStates } from '../../shared/constants'
import { TAuthReducerState, TAuthReducerUserDetails } from '../../shared/types'
import {
    getAuthReducerFromLocalStorage,
    setAuthReducerToLocalStorage,
} from '../../utils/local-storage/auth'

import type { RootState } from '../store'

export const defaultAuthReducer: TAuthReducerState = {
    authState: AuthStates.NotAuthorize,
    userDetails: {
        email: '',
        id: '',
        isActive: false,
        name: '',
        organisation: '',
    },
}

export const authSlice = createSlice({
    name: 'AUTH',
    initialState: getAuthReducerFromLocalStorage(defaultAuthReducer),
    reducers: {
        updateAuthState: (state, action: PayloadAction<AuthStates>) => {
            state.authState = action.payload
            setAuthReducerToLocalStorage(state)
            return state
        },
        updateUserDetails: (
            state,
            action: PayloadAction<TAuthReducerUserDetails>
        ) => {
            state.userDetails = action.payload
            setAuthReducerToLocalStorage(state)
            return state
        },
    },
})

export const { updateAuthState, updateUserDetails } = authSlice.actions
export const authSelector = (state: RootState) => state.auth

export default authSlice.reducer
