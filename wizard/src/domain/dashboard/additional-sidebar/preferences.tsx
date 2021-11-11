import { useContext } from 'react'
import { FormControlLabel } from '@intermine/chromatin/form-control-label'
import { Toggle } from '@intermine/chromatin/toggle'

import { AppContext } from '../../../context'
import { ActionSection } from './action-section'

export const Preferences = () => {
    const store = useContext(AppContext)

    const {
        preferencesReducer: {
            updateTheme,
            state: { themeType }
        }
    } = store

    const onDarkThemeToggle = () => {
        if (themeType === 'dark') {
            return updateTheme('light')
        }

        updateTheme('dark')
    }
    return (
        <ActionSection heading="Preferences">
            <ActionSection.Content>
                <FormControlLabel
                    label="Dark Theme"
                    control={
                        <Toggle
                            isDense
                            isChecked={themeType === 'dark'}
                            onChange={onDarkThemeToggle}
                        />
                    }
                    labelPlacement="left"
                    spaceBetween="all"
                />
            </ActionSection.Content>
        </ActionSection>
    )
}
