import { useReducer } from 'react'
import { ThemeType } from '@intermine/chromatin/styles'

import {
    getPreferencesFromLocalStorage,
    setPreferencesToLocalStorage,
} from '../../utils/local-storage/preferences'

import { PreferencesActions } from '../../constants/preferences'
import type {
    TPreferencesReducer,
    TPreferencesReducerAction,
    TUsePreferencesReducer,
} from '../types'

const { UpdateTheme } = PreferencesActions
/**
 * Preferences reducer initial state
 */
const preferencesInitialReducer = getPreferencesFromLocalStorage()

const preferencesReducer = (
    state: TPreferencesReducer,
    action: TPreferencesReducerAction
) => {
    const { type, data } = action
    switch (type) {
        case UpdateTheme:
            state = { ...state, themeType: data as ThemeType }
            setPreferencesToLocalStorage(state)
            return state

        /* istanbul ignore next */
        default:
            throw new Error(
                ''.concat(
                    '[Preferences Reducer]: Action type is not identified',
                    'Type: ',
                    type
                )
            )
    }
}

export const usePreferencesReducer = (): TUsePreferencesReducer => {
    const [state, dispatch] = useReducer(
        preferencesReducer,
        preferencesInitialReducer
    )

    const updateTheme = (data: ThemeType) =>
        dispatch({
            type: UpdateTheme,
            data,
        })

    return {
        state,
        updateTheme,
    }
}
