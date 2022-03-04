import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { TSidebarReducer } from '../../shared/types'
// eslint-disable-next-line max-len
import {
    getSidebarReducerFromLocalStorage,
    setSidebarReducerToLocalStorage,
} from '../../utils/local-storage/sidebar'

import type { RootState } from '../store'

const defaultSidebarState = {
    isOpen: window.innerWidth > 1200 ? true : false,
    isPageSwitchingAllowed: true,
    onSidebarItemClick: () => ({}),
}

export const sidebarSlice = createSlice({
    name: 'SIDEBAR',
    initialState: getSidebarReducerFromLocalStorage(defaultSidebarState),
    reducers: {
        updateSidebarState: (
            state,
            action: PayloadAction<Partial<TSidebarReducer>>
        ) => {
            state = { ...state, ...action.payload }
            setSidebarReducerToLocalStorage({
                isOpen: state.isOpen,
            })

            return state
        },
    },
})

export const { updateSidebarState } = sidebarSlice.actions
export const sidebarSelector = (state: RootState) => state.sidebar

export default sidebarSlice.reducer
