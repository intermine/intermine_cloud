import { AdditionalSidebarTabs } from '../../../shared/constants'

// eslint-disable-next-line max-len
import { useStoreSelector, additionalSidebarSelector } from '../../../store'
import { ActionSection } from './action-section'

export const EditProfile = () => {
    const { activeTab } = useStoreSelector(additionalSidebarSelector)

    return (
        <ActionSection
            heading="Edit Profile"
            isActive={activeTab === AdditionalSidebarTabs.EditProfileTab}
        >
            Edit Profile Section
        </ActionSection>
    )
}
