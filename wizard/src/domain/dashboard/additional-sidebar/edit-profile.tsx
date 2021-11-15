import { useContext } from 'react'
import { AdditionalSidebarTabs } from '../../../constants/additional-sidebar'

import { AppContext } from '../../../context'
import { ActionSection } from './action-section'

export const EditProfile = () => {
    const store = useContext(AppContext)
    const {
        additionalSidebarReducer: {
            state: { activeTab }
        }
    } = store

    return (
        <ActionSection
            heading="Edit Profile"
            isActive={activeTab === AdditionalSidebarTabs.EditProfileTab}
        >
            Edit Profile Section
        </ActionSection>
    )
}
