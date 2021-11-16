import { AdditionalSidebarTabs } from '../../../constants/additional-sidebar'

import { useAdditionalSidebarReducer } from '../../../context'
import { ActionSection } from './action-section'

export const Progress = () => {
    const additionalSidebarReducer = useAdditionalSidebarReducer()
    const {
        state: { activeTab }
    } = additionalSidebarReducer

    return (
        <ActionSection
            heading="Progress"
            isActive={activeTab === AdditionalSidebarTabs.ProgressTab}
        >
            Progress Section
        </ActionSection>
    )
}
