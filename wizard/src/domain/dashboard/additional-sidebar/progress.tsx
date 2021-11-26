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
        for (const key in activeItems) {
            if (activeItems[key].isDependentOnBrowser) {
                progressItems[key].onCancel()
            }
        }
    }

    useEffect(() => {
        if (isRestrictUnmount) {
            window.addEventListener('beforeunload', handleOnBeforeUnload)
            updateAdditionalSidebarState({
                logout: {
                    isLogoutAllowed: false,
                    onLogoutClick: () => {
                        showWarningModal({
                            to: LOGIN_PATH,
                            primaryActionTitle: 'Logout',
                            primaryActionCallback: () => {
                                cancelBrowserDependentRequests()
                                logout()
                            },
                            msg: `If you logout, then all the uploads
                            in progress will be lost.`
                        })
                    }
                }
            })
        }

        return () => {
            window.removeEventListener('beforeunload', handleOnBeforeUnload)
            updateAdditionalSidebarState({
                logout: { isLogoutAllowed: true, onLogoutClick: () => false }
            })
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
