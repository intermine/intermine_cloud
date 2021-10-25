import { TPreferencesReducer } from '../context/types'

export enum PreferencesActions {
    UpdateTheme = 'UpdateTheme',
}

export const DEFAULT_PREFERENCES: TPreferencesReducer = {
    themeType: 'dark',
}
