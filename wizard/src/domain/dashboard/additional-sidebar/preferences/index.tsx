import { ActionSection } from '../action-section'
import { AdditionalSidebarTabs } from '../../../../shared/constants'
import {
    useStoreSelector,
    additionalSidebarSelector,
    useStoreDispatch,
    preferencesSelector,
    updateAppTheme,
    updateFontSize
} from '../../../../store'
import { ThemeToggle } from './theme-toggle'
import { FontSize } from './font-size'

export const Preferences = () => {
    const storeDispatch = useStoreDispatch()
    const { activeTab } = useStoreSelector(additionalSidebarSelector)
    const { themeType, fontSize } = useStoreSelector(preferencesSelector)

    const onThemeToggle = () => {
        if (themeType === 'dark') {
            return storeDispatch(updateAppTheme({ themeType: 'light' }))
        }

        storeDispatch(updateAppTheme({ themeType: 'dark' }))
    }

    const onFontSizeUpdate = (fontSize: number) => {
        storeDispatch(updateFontSize({ fontSize }))
    }

    return (
        <ActionSection
            heading="Preferences"
            isActive={activeTab === AdditionalSidebarTabs.PreferencesTab}
        >
            <ActionSection.Content>
                <ThemeToggle
                    themeType={themeType}
                    onThemeToggle={onThemeToggle}
                />

                <FontSize
                    fontSize={fontSize}
                    onFontSizeUpdate={onFontSizeUpdate}
                />
            </ActionSection.Content>
        </ActionSection>
    )
}
