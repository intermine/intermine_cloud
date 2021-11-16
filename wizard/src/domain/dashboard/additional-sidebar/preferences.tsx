import { FormControlLabel } from '@intermine/chromatin/form-control-label'
import { Toggle } from '@intermine/chromatin/toggle'

import { useStore } from '../../../context'
import { ActionSection } from './action-section'
import { AdditionalSidebarTabs } from '../../../constants/additional-sidebar'

export const Preferences = () => {
    const store = useStore()
    const {
        preferencesReducer: {
            updateTheme,
            state: { themeType }
        },
        additionalSidebarReducer: {
            state: { activeTab }
        }
    } = store

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
