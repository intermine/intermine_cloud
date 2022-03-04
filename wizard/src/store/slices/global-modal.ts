import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { TGlobalModalReducer } from '../../shared/types'

import type { RootState } from '../store'

export const globalModalSlice = createSlice({
    name: 'GLOBAL_MODAL',
    initialState: { isOpen: false } as TGlobalModalReducer,
    reducers: {
        updateGlobalModal: (
            state,
            action: PayloadAction<TGlobalModalReducer>
        ) => {
            // @ts-expect-error for some reason redux is giving weird error.
            state = { ...state, ...action.payload }
            return state
        },

        closeGlobalModal: (state) => {
            state = {
                isOpen: false,
            }

            return state
        },
    },
})

export const { updateGlobalModal, closeGlobalModal } = globalModalSlice.actions
export const globalModalSelector = (state: RootState) => state.globalModal

export default globalModalSlice.reducer
