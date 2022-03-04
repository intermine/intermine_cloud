import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import {
    TGlobalAlertReducer,
    TGlobalAlertReducerAlert,
} from '../../shared/types'

import type { RootState } from '../store'

export const globalAlertSlice = createSlice({
    name: 'GLOBAL_ALERT',
    initialState: {
        alerts: {},
    } as TGlobalAlertReducer,
    reducers: {
        addGlobalAlert: (
            state,
            action: PayloadAction<TGlobalAlertReducerAlert>
        ) => {
            const { payload } = action
            state.alerts[payload.id] = payload

            return state
        },
        updateGlobalAlert: (
            state,
            action: PayloadAction<TGlobalAlertReducerAlert>
        ) => {
            const { payload } = action
            state.alerts[payload.id] = {
                ...state.alerts[payload.id],
                ...payload,
            }

            return state
        },
        removeGlobalAlert: (
            state,
            action: PayloadAction<TGlobalAlertReducerAlert>
        ) => {
            const { payload } = action
            delete state.alerts[payload.id]

            return state
        },
    },
})

export const { updateGlobalAlert, addGlobalAlert, removeGlobalAlert } =
    globalAlertSlice.actions
export const globalAlertSelector = (state: RootState) => state.globalAlert

export default globalAlertSlice.reducer
