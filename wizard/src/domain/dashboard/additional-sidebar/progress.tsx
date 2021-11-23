import { useEffect } from 'react'
import { Typography } from '@intermine/chromatin/typography'

import { AdditionalSidebarTabs } from '../../../constants/additional-sidebar'
import { ProgressItemStatus } from '../../../constants/progress'
import {
    useAdditionalSidebarReducer,
    useProgressReducer
} from '../../../context'
import { TProgressItem } from '../../../context/types'
import { uploadService } from '../common/upload'
import { ActionSection } from './action-section'
import { ProgressItemView } from './progress-item-view'

const { Canceled, Running } = ProgressItemStatus

const handleOnCancelUpload = (item: TProgressItem) => {
    const { cancelSourceToken } = item
    cancelSourceToken.cancel(Canceled)
}

const handleOnBeforeUnload = (event: Event) => {
    event.preventDefault()

    // @ts-expect-error Chrome requires returnValue to be set
    event.returnValue = ''

    return 'Are you sure? Some file(s) are still uploading.'
}

export const Progress = () => {
    const additionalSidebarReducer = useAdditionalSidebarReducer()
    const progressReducer = useProgressReducer()

    const {
        state: { activeTab }
    } = additionalSidebarReducer

    const {
        state: { progressItems, activeItems },
        updateProgressItem,
        removeItemFromProgress,
        addActiveItem
    } = progressReducer

    const handleOnRetryClick = (item: TProgressItem) => {
        const { cancelSourceToken } = uploadService({
            ...item
        })

        addActiveItem(item.id)

        updateProgressItem({
            ...item,
            status: Running,
            loadedSize: 0,
            cancelSourceToken
        })
    }

    useEffect(() => {
        if (Object.keys(activeItems).length === 0) {
            window.removeEventListener('beforeunload', handleOnBeforeUnload)
        } else {
            window.addEventListener('beforeunload', handleOnBeforeUnload)
        }
    }, [Object.keys(activeItems).length])

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
                            handleOnRetryClick(progressItems[key])
                        }
                        {...progressItems[key]}
                    />
                ))}
            </ActionSection.Content>
        </ActionSection>
    )
}
