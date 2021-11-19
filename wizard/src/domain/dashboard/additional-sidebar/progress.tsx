import { Typography } from '@intermine/chromatin/typography'

import { AdditionalSidebarTabs } from '../../../constants/additional-sidebar'
import { ProgressItemUploadStatus } from '../../../constants/progress'
import {
    useAdditionalSidebarReducer,
    useProgressReducer
} from '../../../context'
import { TProgressItem } from '../../../context/types'
import { uploadService } from '../common/upload'
import { ActionSection } from './action-section'
import { ProgressItemView } from './progress-item-view'

const { Canceled, Running } = ProgressItemUploadStatus

const handleOnCancelUpload = (item: TProgressItem) => {
    const { cancelSourceToken } = item
    cancelSourceToken.cancel(Canceled)
}

const handleOnRetryClick = (
    item: TProgressItem,
    cb: (data: Partial<TProgressItem>) => void
) => {
    const { cancelSourceToken } = uploadService({
        ...item
    })

    cb({
        ...item,
        status: Running,
        loadedSize: 0,
        cancelSourceToken
    })
}

export const Progress = () => {
    const additionalSidebarReducer = useAdditionalSidebarReducer()
    const progressReducer = useProgressReducer()

    const {
        state: { activeTab }
    } = additionalSidebarReducer

    const {
        state: { progressItems },
        updateProgressItem,
        removeItemFromProgress
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
                        onCancelUpload={() =>
                            handleOnCancelUpload(progressItems[key])
                        }
                        onRemoveClick={removeItemFromProgress}
                        onRetryClick={() =>
                            handleOnRetryClick(
                                progressItems[key],
                                updateProgressItem
                            )
                        }
                        {...progressItems[key]}
                    />
                ))}
            </ActionSection.Content>
        </ActionSection>
    )
}
