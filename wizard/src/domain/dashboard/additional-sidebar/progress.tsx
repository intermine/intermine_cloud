import { useEffect } from 'react'
import { Typography } from '@intermine/chromatin/typography'

import { AdditionalSidebarTabs } from '../../../shared/constants'
import {
    useStoreSelector,
    additionalSidebarSelector,
    progressSelector,
    removeItemFromProgress,
    useStoreDispatch
} from '../../../store'
import { ActionSection } from './action-section'
import { ProgressItemView } from './progress-item-view'
import { handleOnBeforeUnload } from '../utils/misc'
import { RestrictLogoutRestrictions, useDashboardLogout } from '../hooks'

const _handleOnBeforeUnload = (event: Event) => {
    handleOnBeforeUnload(event)
}

export const Progress = () => {
    const storeDispatch = useStoreDispatch()
    const { activeTab } = useStoreSelector(additionalSidebarSelector)

    const {
        items: progressItems,
        isRestrictUnmount,
        activeItems
    } = useStoreSelector(progressSelector)

    const {
        removeAdditionalSidebarLogoutWithModalRestriction,
        restrictAdditionalSidebarLogoutWithModal
    } = useDashboardLogout()

    const cancelBrowserDependentRequests = () => {
        const _active = { ...activeItems }

        for (const id in _active) {
            if (activeItems[id].isDependentOnBrowser) {
                progressItems[id].onCancel()
                storeDispatch(removeItemFromProgress({ id }))
            }
        }
    }

    useEffect(() => {
        if (isRestrictUnmount) {
            window.addEventListener('beforeunload', _handleOnBeforeUnload)
            restrictAdditionalSidebarLogoutWithModal({
                type: RestrictLogoutRestrictions.Uploading,
                primaryActionCallback: cancelBrowserDependentRequests
            })
        }

        return () => {
            window.removeEventListener('beforeunload', _handleOnBeforeUnload)
            removeAdditionalSidebarLogoutWithModalRestriction({
                type: RestrictLogoutRestrictions.Uploading
            })
        }
    }, [isRestrictUnmount, Object.keys(activeItems).length])

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
                            onRemoveItem={(id) => {
                                storeDispatch(removeItemFromProgress({ id }))
                            }}
                            {...progressItems[key]}
                        />
                    )
                })}
            </ActionSection.Content>
        </ActionSection>
    )
}
