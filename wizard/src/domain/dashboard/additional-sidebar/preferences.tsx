import { FormControlLabel } from '@intermine/chromatin/form-control-label'
import { Toggle } from '@intermine/chromatin/toggle'

import { usePreferencesReducer } from '../../../context'
import { ActionSection } from './action-section'
import { AdditionalSidebarTabs } from '../../../shared/constants'
import { useStoreSelector, additionalSidebarSelector } from '../../../store'

export const Preferences = () => {
    const preferencesReducer = usePreferencesReducer()
    const { activeTab } = useStoreSelector(additionalSidebarSelector)

    const {
        updateTheme,
        state: { themeType }
    } = preferencesReducer

    const onDarkThemeToggle = () => {
        if (themeType === 'dark') {
            return updateTheme('light')
        }

        updateTheme('dark')
    }
    return (
        <ActionSection
            heading="Preferences"
            isActive={activeTab === AdditionalSidebarTabs.PreferencesTab}
        >
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
