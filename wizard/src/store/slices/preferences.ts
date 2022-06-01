import { ThemeType } from '@intermine/chromatin/styles'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { TPreferencesReducer } from '../../shared/types'
// eslint-disable-next-line max-len
import {
    getPreferencesReducerFromLocalStorage,
    setPreferencesReducerToLocalStorage,
} from '../../utils/local-storage/preferences'

import type { RootState } from '../store'

const defaultPreferenceState: TPreferencesReducer = {
    themeType: window.matchMedia('(prefers-color-scheme: light)').matches
        ? 'light'
        : 'dark',
    fontSize: 16,
}

export const preferencesSlice = createSlice({
    name: 'PREFERENCES',
    initialState: getPreferencesReducerFromLocalStorage(defaultPreferenceState),
    reducers: {
        updateAppTheme: (
            state,
            action: PayloadAction<{ themeType: ThemeType }>
        ) => {
            state.themeType = action.payload.themeType

            setPreferencesReducerToLocalStorage(state)
            return state
        },

        updateFontSize: (
            state,
            action: PayloadAction<{ fontSize: number }>
        ) => {
            state.fontSize = action.payload.fontSize
            setPreferencesReducerToLocalStorage(state)
            return state
        },
    },
})

export const { updateAppTheme, updateFontSize } = preferencesSlice.actions
export const preferencesSelector = (state: RootState) => state.preferences

export default preferencesSlice.reducer
