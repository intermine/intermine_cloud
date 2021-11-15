import { useContext } from 'react'
import { AdditionalSidebarTabs } from '../../../constants/additional-sidebar'

import { AppContext } from '../../../context'
import { ActionSection } from './action-section'

export const Progress = () => {
    const store = useContext(AppContext)
    const {
        additionalSidebarReducer: {
            state: { activeTab }
        }
    } = store

    return (
        <ActionSection
            heading="Progress"
            isActive={activeTab === AdditionalSidebarTabs.ProgressTab}
        >
            Progress Section
        </ActionSection>
    )
}
