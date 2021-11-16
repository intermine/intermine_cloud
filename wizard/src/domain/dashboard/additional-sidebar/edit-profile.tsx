import { AdditionalSidebarTabs } from '../../../constants/additional-sidebar'

// eslint-disable-next-line max-len
import { useAdditionalSidebarReducer } from '../../../context'
import { ActionSection } from './action-section'

export const EditProfile = () => {
    const additionalSidebarReducer = useAdditionalSidebarReducer()
    const {
        state: { activeTab }
    } = additionalSidebarReducer

    return (
        <ActionSection
            heading="Edit Profile"
            isActive={activeTab === AdditionalSidebarTabs.EditProfileTab}
        >
            Edit Profile Section
        </ActionSection>
    )
}
