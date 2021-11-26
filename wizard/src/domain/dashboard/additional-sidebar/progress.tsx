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
import { useDashboardWarningModal, useLogout } from '../utils/hooks'
import { LOGIN_PATH } from '../../../routes'

const _handleOnBeforeUnload = (event: Event) => {
    handleOnBeforeUnload(event)
}

export const Progress = () => {
    const additionalSidebarReducer = useAdditionalSidebarReducer()
    const progressReducer = useProgressReducer()

    const {
        state: { activeTab },
        updateAdditionalSidebarState
    } = additionalSidebarReducer

    const {
        state: { progressItems, isRestrictUnmount, activeItems },
        removeItemFromProgress
    } = progressReducer

    const { showWarningModal } = useDashboardWarningModal()
    const { logout } = useLogout()

    const cancelBrowserDependentRequests = () => {
        const _active = { ...activeItems }

        for (const id in _active) {
            if (activeItems[id].isDependentOnBrowser) {
                progressItems[id].onCancel()
                removeItemFromProgress(id)
            }
        }
    }

    useEffect(() => {
        if (isRestrictUnmount) {
            window.addEventListener('beforeunload', _handleOnBeforeUnload)
            updateAdditionalSidebarState({
                logout: {
                    isLogoutAllowed: false,
                    onLogoutClick: () => {
                        showWarningModal({
                            to: LOGIN_PATH,
                            primaryActionTitle: 'Logout',
                            primaryActionCallback: () => {
                                logout()
                                cancelBrowserDependentRequests()
                            },
                            msg: `If you logout, then all the uploads
                            in progress will be lost.`
                        })
                    }
                }
            })
        }

        return () => {
            window.removeEventListener('beforeunload', _handleOnBeforeUnload)
            updateAdditionalSidebarState({
                logout: { isLogoutAllowed: true, onLogoutClick: () => false }
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
                            onRemoveItem={removeItemFromProgress}
                            {...progressItems[key]}
                        />
                    )
                })}
            </ActionSection.Content>
        </ActionSection>
    )
}
