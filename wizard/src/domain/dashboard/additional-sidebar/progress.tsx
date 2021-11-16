import { Typography } from '@intermine/chromatin/typography'

import { AdditionalSidebarTabs } from '../../../constants/additional-sidebar'
import {
    useAdditionalSidebarReducer,
    useProgressReducer
} from '../../../context'
import { ActionSection } from './action-section'
import { ProgressItemView } from './progress-item-view'

export const Progress = () => {
    const additionalSidebarReducer = useAdditionalSidebarReducer()
    const progressReducer = useProgressReducer()

    const {
        state: { activeTab }
    } = additionalSidebarReducer

    const {
        state: { progressItems },
        stopDataUploading,
        removeEntry,
        retryUpload
    } = progressReducer

    return (
        <ActionSection
            heading="Progress"
            isActive={activeTab === AdditionalSidebarTabs.ProgressTab}
        >
            <ActionSection.Content>
                {Object.keys(progressItems).length === 0 && (
                    <Typography color="neutral.30">
                        Nothing is in progress.
                    </Typography>
                )}

                {Object.keys(progressItems).map((key) => (
                    <ProgressItemView
                        key={progressItems[key].id}
                        onCancelUpload={stopDataUploading}
                        onRemoveClick={removeEntry}
                        onRetryClick={retryUpload}
                        {...progressItems[key]}
                    />
                ))}
            </ActionSection.Content>
        </ActionSection>
    )
}
