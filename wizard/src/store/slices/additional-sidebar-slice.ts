import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { AdditionalSidebarTabs } from '../../shared/constants'
import { TAdditionalSidebarReducer } from '../../shared/types'

import type { RootState } from '../store'

export const additionalSidebarSlice = createSlice({
    name: 'ADDITIONAL_SIDEBAR',
    initialState: {
        isOpen: false,
        activeTab: AdditionalSidebarTabs.None,
    } as TAdditionalSidebarReducer,
    reducers: {
        updateAdditionalSidebar: (
            state,
            action: PayloadAction<TAdditionalSidebarReducer>
        ) => {
            state = { ...state, ...action.payload }
            return state
        },
    },
})

export const additionalSidebarActions = additionalSidebarSlice.actions
export const additionalSidebarSelector = (state: RootState) =>
    state.additionalSidebar

export default additionalSidebarSlice.reducer
