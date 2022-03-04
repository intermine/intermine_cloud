import { FormControlLabel } from '@intermine/chromatin/form-control-label'
import { Toggle } from '@intermine/chromatin/toggle'

import { ActionSection } from './action-section'
import { AdditionalSidebarTabs } from '../../../shared/constants'
import {
    useStoreSelector,
    additionalSidebarSelector,
    useStoreDispatch,
    preferencesSelector,
    updateAppTheme
} from '../../../store'

export const Preferences = () => {
    const storeDispatch = useStoreDispatch()
    const { activeTab } = useStoreSelector(additionalSidebarSelector)
    const { themeType } = useStoreSelector(preferencesSelector)

    const onDarkThemeToggle = () => {
        if (themeType === 'dark') {
            return storeDispatch(updateAppTheme({ themeType: 'light' }))
        }

        storeDispatch(updateAppTheme({ themeType: 'light' }))
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
