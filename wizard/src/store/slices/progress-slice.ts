import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import {
    TProgressReducer,
    TProgressReducerActiveItem,
    TProgressReducerItem,
} from '../../shared/types'

import type { RootState } from '../store'

const hasToRestrictUnmount = (
    activeItems: Record<string, TProgressReducerActiveItem>
) => {
    for (const key in activeItems) {
        if (activeItems[key].isDependentOnBrowser) {
            return true
        }
    }
    return false
}

export const progressSlice = createSlice({
    name: 'PROGRESS',
    initialState: {
        activeItems: {},
        isRestrictUnmount: false,
        items: {},
    } as TProgressReducer,
    reducers: {
        addItemToProgress: (
            state,
            action: PayloadAction<TProgressReducerItem>
        ) => {
            const { payload } = action

            state.items = {
                ...state.items,
                [payload.id]: payload,
            }

            return state
        },
        updateProgressItem: (
            state,
            action: PayloadAction<
                Partial<TProgressReducerItem> & { id: string }
            >
        ) => {
            const { payload } = action

            state.items[payload.id] = {
                ...state.items[payload.id],
                ...payload,
            }

            return state
        },
        removeItemFromProgress: (
            state,
            action: PayloadAction<{ id: string }>
        ) => {
            delete state.items[action.payload.id]

            return state
        },
        addActiveItemToProgress: (
            state,
            action: PayloadAction<TProgressReducerActiveItem>
        ) => {
            const { id, isDependentOnBrowser } = action.payload

            state.activeItems[id] = {
                id,
                isDependentOnBrowser,
            }

            state.isRestrictUnmount ||= hasToRestrictUnmount(state.activeItems)

            return state
        },
        removeActiveItemFromProgress: (
            state,
            action: PayloadAction<{ id: string }>
        ) => {
            const { id } = action.payload

            delete state.activeItems[id]
            state.isRestrictUnmount = hasToRestrictUnmount(state.activeItems)
            return state
        },
    },
})

export const {
    addActiveItemToProgress,
    addItemToProgress,
    removeActiveItemFromProgress,
    removeItemFromProgress,
    updateProgressItem,
} = progressSlice.actions
export const progressSelector = (state: RootState) => state.progress

export default progressSlice.reducer
