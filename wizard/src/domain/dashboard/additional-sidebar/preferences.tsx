import { FormControlLabel } from '@intermine/chromatin/form-control-label'
import { Toggle } from '@intermine/chromatin/toggle'

import {
    useAdditionalSidebarReducer,
    usePreferencesReducer
} from '../../../context'
import { ActionSection } from './action-section'
import { AdditionalSidebarTabs } from '../../../constants/additional-sidebar'

export const Preferences = () => {
    const preferencesReducer = usePreferencesReducer()
    const additionalSidebarReducer = useAdditionalSidebarReducer()

    const {
        updateTheme,
        state: { themeType }
    } = preferencesReducer

    const {
        state: { activeTab }
    } = additionalSidebarReducer

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
