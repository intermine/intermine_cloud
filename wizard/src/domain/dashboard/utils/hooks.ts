import { useHistory } from 'react-router'
import shortid from 'shortid'

import { ButtonCommonProps } from '@intermine/chromatin/button'
import { AxiosResponse } from 'axios'

import {
    useGlobalModalReducer,
    useProgressReducer,
    useGlobalAlertReducer,
    useAdditionalSidebarReducer,
    useSharedReducer,
} from '../../../context'
import { TProgressItem } from '../../../context/types'
import { AdditionalSidebarTabs } from '../../../constants/additional-sidebar'
import { ProgressItemStatus } from '../../../constants/progress'
import { LOGIN_PATH } from '../../../routes'
import { useLogout } from '../../../hooks/use-logout'

import { ResponseStatus } from '../../../constants/response'

type TUseDashboardWarningModalProps = {
    msg?: string
    primaryAction?: ButtonCommonProps
    secondaryAction?: ButtonCommonProps
    /**
     * If set then redirect to this url otherwise
     * no redirection will take place
     */
    redirectTo?: string
}

export const useDashboardWarningModal = () => {
    const history = useHistory()
    const { updateGlobalModalProps, closeGlobalModal } = useGlobalModalReducer()

    const showWarningModal = (props: TUseDashboardWarningModalProps) => {
        const {
            msg = 'All your work will be lost.',
            primaryAction = {
                children: 'Proceed',
            },
            secondaryAction = {
                children: 'Cancel',
            },
            redirectTo,
        } = props

        updateGlobalModalProps({
            isOpen: true,
            heading: 'Are you sure?',
            type: 'warning',
            children: msg,
            primaryAction: {
                ...primaryAction,
                onClick: (event) => {
                    if (redirectTo) {
                        closeGlobalModal()
                        history.push(redirectTo)
                    }
                    if (primaryAction.onClick) {
                        primaryAction.onClick(event)
                    }
                },
            },
            secondaryAction: {
                onClick: closeGlobalModal,
                ...secondaryAction,
            },
        })
    }

    return {
        showWarningModal,
        closeWarningModal: closeGlobalModal,
        updateWarningModal: updateGlobalModalProps,
    }
}

export enum RestrictLogoutRestrictions {
    FormIsDirty = 'FormIsDirty',
    Uploading = 'Uploading',
}

export type TRestrictAdditionalSidebarLogoutWithModalProps = {
    primaryActionCallback?: () => void
    type: RestrictLogoutRestrictions
}

export const useDashboardLogout = () => {
    const { FormIsDirty, Uploading } = RestrictLogoutRestrictions

    const { updateSharedReducer } = useSharedReducer()
    const { addAlert } = useGlobalAlertReducer()

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

        addAlert({
            id: shortid.generate(),
            isOpen: true,
            type: 'error',
            message,
            title: 'Error',
        })
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
                },
            })
        }

        const primaryAction: ButtonCommonProps = {
            onClick: onClickPrimaryAction,
            children: 'Logout',
        }

        if (type === FormIsDirty) {
            updateSharedReducer({
                isEditingAnyForm: true,
                cbIfEditingFormAndUserRequestLogout: () => {
                    showWarningModal({
                        primaryAction,
                        ...rest,
                    })
                },
            })

            return
        }

        if (type === Uploading) {
            updateSharedReducer({
                isUploadingAnyFile: true,
                cbIfUploadingFileAndUserRequestLogout: () => {
                    showWarningModal({
                        primaryAction,
                        msg: `If you logout, then all the uploads
                            in progress will be lost.`,
                        ...rest,
                    })
                },
            })
            return
        }
    }

    const removeAdditionalSidebarLogoutWithModalRestriction = (props: {
        type: RestrictLogoutRestrictions
    }) => {
        const { type } = props
        if (type === FormIsDirty) {
            updateSharedReducer({
                isEditingAnyForm: false,
                cbIfEditingFormAndUserRequestLogout: () => false,
            })

            return
        }

        if (type === Uploading) {
            updateSharedReducer({
                isUploadingAnyFile: false,
                cbIfUploadingFileAndUserRequestLogout: () => false,
            })
        }
    }

    return {
        dashboardLogout,
        restrictAdditionalSidebarLogoutWithModal,
        removeAdditionalSidebarLogoutWithModalRestriction,
        showAlertOnFailedLogoutAttempt,
    }
}

export type TOnProgressUpdateProps = Partial<TProgressItem> & { id: string }
export type TOnProgressSuccessfulProps = Partial<TProgressItem> & {
    successMsg: string
    id: string
}
export type TOnProgressFailedProps = Partial<TProgressItem> & {
    failedMsg: string
    id: string
}
export type TOnProgressStartProps = Omit<TProgressItem, 'status'> & {
    isDependentOnBrowser: boolean
}
export type TOnProgressCancel = {
    id: string
}
export type TOnProgressRetry = {
    id: string
    isDependentOnBrowser: boolean
    onCancel: () => void
}

const { Canceled, Completed, Failed, Running } = ProgressItemStatus

export const useOnProgress = () => {
    const { addAlert } = useGlobalAlertReducer()
    const { updateAdditionalSidebarState } = useAdditionalSidebarReducer()
    const {
        updateProgressItem,
        removeActiveItem,
        addActiveItem,
        addItemToProgress,
    } = useProgressReducer()

    const onProgressUpdate = (props: TOnProgressUpdateProps) => {
        updateProgressItem({ ...props })
    }

    const onProgressSuccessful = (props: TOnProgressSuccessfulProps) => {
        const { successMsg, id, ...rest } = props
        removeActiveItem(id)
        updateProgressItem({ id, status: Completed, ...rest })
        addAlert({
            id: id + 'success',
            isOpen: true,
            message: successMsg,
            type: 'success',
        })
    }

    const onProgressFailed = (props: TOnProgressFailedProps) => {
        const { failedMsg, id, ...rest } = props
        removeActiveItem(id)
        updateProgressItem({ id, status: Failed, ...rest })
        addAlert({
            id: id + 'error',
            isOpen: true,
            message: failedMsg,
            type: 'error',
        })
    }

    const onProgressStart = (props: TOnProgressStartProps) => {
        const { id, isDependentOnBrowser, ...rest } = props
        addActiveItem({ id, isDependentOnBrowser })
        updateAdditionalSidebarState({
            isOpen: true,
            activeTab: AdditionalSidebarTabs.ProgressTab,
        })
        addItemToProgress({
            id,
            status: Running,
            ...rest,
        })
    }

    const onProgressCancel = (props: TOnProgressCancel) => {
        const { id } = props
        removeActiveItem(id)
        updateProgressItem({ id, status: Canceled })
    }

    const onProgressRetry = (props: TOnProgressRetry) => {
        const { id, isDependentOnBrowser, onCancel } = props
        addActiveItem({ id, isDependentOnBrowser })
        updateProgressItem({ id, status: Running, onCancel })
    }

    return {
        onProgressUpdate,
        onProgressSuccessful,
        onProgressFailed,
        onProgressStart,
        onProgressCancel,
        onProgressRetry,
    }
}
