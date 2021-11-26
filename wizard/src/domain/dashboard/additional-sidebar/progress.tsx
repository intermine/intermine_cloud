import { useEffect } from 'react'
import { Typography } from '@intermine/chromatin/typography'

import { AdditionalSidebarTabs } from '../../../constants/additional-sidebar'
import {
    useAdditionalSidebarReducer,
    useProgressReducer
} from '../../../context'
import { ActionSection } from './action-section'
import { ProgressItemView } from './progress-item-view'
import { handleOnBeforeUnload } from '../utils/misc'

export const Progress = () => {
    const additionalSidebarReducer = useAdditionalSidebarReducer()
    const progressReducer = useProgressReducer()

    const {
        state: { activeTab }
    } = additionalSidebarReducer

    const {
        state: { progressItems, isRestrictUnmount },
        removeItemFromProgress
    } = progressReducer

    useEffect(() => {
        if (isRestrictUnmount) {
            window.removeEventListener('beforeunload', handleOnBeforeUnload)
        } else {
            window.addEventListener('beforeunload', handleOnBeforeUnload)
        }

        return () => {
            window.addEventListener('beforeunload', handleOnBeforeUnload)
        }
    }, [isRestrictUnmount])

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

                {Object.keys(progressItems).map((key) => {
                    const { id } = progressItems[key]
                    return (
                        <ProgressItemView
                            key={id}
                            onRemoveItem={removeItemFromProgress}
                            {...progressItems[key]}
                        />
                    )
                })}
            </ActionSection.Content>
        </ActionSection>
    )
}
