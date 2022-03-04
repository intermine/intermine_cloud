import { useHistory } from 'react-router'
import shortid from 'shortid'
import { ButtonCommonProps } from '@intermine/chromatin/button'
import { AxiosResponse } from 'axios'

import {
    useStoreDispatch,
    addGlobalAlert,
    updateSharedState
} from '../../../store'
import { ResponseStatus } from '../../../shared/constants'
import { LOGIN_PATH } from '../../../routes'
import { useLogout } from '../../../hooks/use-logout'
import { useDashboardWarningModal } from './use-dashboard-warning-modal'

export enum RestrictLogoutRestrictions {
    FormIsDirty = 'FormIsDirty',
    Uploading = 'Uploading'
}

export type TRestrictAdditionalSidebarLogoutWithModalProps = {
    primaryActionCallback?: () => void
    type: RestrictLogoutRestrictions
}

export const useDashboardLogout = () => {
    const storeDispatch = useStoreDispatch()

    const { FormIsDirty, Uploading } = RestrictLogoutRestrictions

    const { showWarningModal, closeWarningModal, updateWarningModal } =
        useDashboardWarningModal()

    const { logout } = useLogout()
    const history = useHistory()

    type TDashboardLogoutOptions = {
        onSuccess?: () => void
        onError?: (response: AxiosResponse) => void
    }
    const dashboardLogout = async (options = {} as TDashboardLogoutOptions) => {
        const { onError, onSuccess } = options

        const response = await logout()

        if (response.status === ResponseStatus.Ok) {
            history.push(LOGIN_PATH)
            if (typeof onSuccess === 'function') {
                onSuccess()
            }
        } else if (typeof onError === 'function') {
            onError(response)
        }
    }

    const showAlertOnFailedLogoutAttempt = (response: AxiosResponse) => {
        let message = ''
        switch (response.status) {
            case ResponseStatus.ServerUnavailable: {
                message = `Failed to logout. Please
                try again.`
                break
            }
            case ResponseStatus.UserOffline: {
                message = `It seems that you are offline.
                Please check your internet connection.`
                break
            }
            case 401: {
                message = `It seems that you are already logout.
                Please refresh your page.
                `
                break
            }
            default:
                message = `Oh no! Something bad happened and
                we don't know why. Please try to refresh this page.`
        }

        storeDispatch(
            addGlobalAlert({
                id: shortid.generate(),
                isOpen: true,
                type: 'error',
                message,
                title: 'Error'
            })
        )
    }

    const restrictAdditionalSidebarLogoutWithModal = (
        props: TRestrictAdditionalSidebarLogoutWithModalProps
    ) => {
        const { type, primaryActionCallback, ...rest } = props

        const onClickPrimaryAction = async () => {
            updateWarningModal({ isLoadingPrimaryAction: true, isOpen: true })

            await dashboardLogout({
                onSuccess: () => {
                    history.push(LOGIN_PATH)
                    if (primaryActionCallback) primaryActionCallback()
                    closeWarningModal()
                },
                onError: (response) => {
                    closeWarningModal()
                    showAlertOnFailedLogoutAttempt(response)
                }
            })
        }

        const primaryAction: ButtonCommonProps = {
            onClick: onClickPrimaryAction,
            children: 'Logout'
        }

        if (type === FormIsDirty) {
            storeDispatch(
                updateSharedState({
                    isEditingAnyForm: true,
                    cbIfEditingFormAndUserRequestLogout: () => {
                        showWarningModal({
                            primaryAction,
                            ...rest
                        })
                    }
                })
            )

            return
        }

        if (type === Uploading) {
            storeDispatch(
                updateSharedState({
                    isUploadingAnyFile: true,
                    cbIfUploadingFileAndUserRequestLogout: () => {
                        showWarningModal({
                            primaryAction,
                            msg: `If you logout, then all the uploads
                            in progress will be lost.`,
                            ...rest
                        })
                    }
                })
            )
            return
        }
    }

    const removeAdditionalSidebarLogoutWithModalRestriction = (props: {
        type: RestrictLogoutRestrictions
    }) => {
        const { type } = props
        if (type === FormIsDirty) {
            storeDispatch(
                updateSharedState({
                    isEditingAnyForm: false,
                    cbIfEditingFormAndUserRequestLogout: () => false
                })
            )

            return
        }

        if (type === Uploading) {
            storeDispatch(
                updateSharedState({
                    isUploadingAnyFile: false,
                    cbIfUploadingFileAndUserRequestLogout: () => false
                })
            )
        }
    }

    return {
        dashboardLogout,
        restrictAdditionalSidebarLogoutWithModal,
        removeAdditionalSidebarLogoutWithModalRestriction,
        showAlertOnFailedLogoutAttempt
    }
}
