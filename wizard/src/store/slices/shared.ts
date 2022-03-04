import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { TSharedReducer } from '../../shared/types'

import type { RootState } from '../store'

export const sharedSlice = createSlice({
    name: 'SHARED',
    initialState: {
        isEditingAnyForm: false,
        isUploadingAnyFile: false,
    } as TSharedReducer,
    reducers: {
        updateSharedState: (
            state,
            action: PayloadAction<Partial<TSharedReducer>>
        ) => {
            state = { ...state, ...action.payload }
            return state
        },
    },
})

export const { updateSharedState } = sharedSlice.actions
export const sharedSelector = (state: RootState) => state.shared

export default sharedSlice.reducer
