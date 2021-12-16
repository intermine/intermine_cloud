import { useHistory } from 'react-router'
import shortid from 'shortid'

import { ButtonCommonProps } from '@intermine/chromatin/button'

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
        onError?: () => void
    }
    const dashboardLogout = async (options = {} as TDashboardLogoutOptions) => {
        const { onError, onSuccess } = options

        const isLogoutSuccessfully = await logout()

        if (isLogoutSuccessfully) {
            history.push(LOGIN_PATH)
            if (typeof onSuccess === 'function') {
                onSuccess()
            }
        } else if (typeof onError === 'function') {
            onError()
        }
    }

    const showAlertOnFailedLogoutAttempt = () => {
        addAlert({
            id: shortid.generate(),
            isOpen: true,
            type: 'error',
            message: window.navigator.onLine
                ? 'Failed to logout. Please refresh your page.'
                : 'You seem to be offline.',
        })
    }

    const primaryAction = async (cb?: () => void) => {
        updateWarningModal({ isLoadingPrimaryAction: true, isOpen: true })

        await dashboardLogout({
            onSuccess: () => {
                history.push(LOGIN_PATH)
                if (cb) cb()
                closeWarningModal()
            },
            onError: showAlertOnFailedLogoutAttempt,
        })

        updateWarningModal({ isLoadingPrimaryAction: false, isOpen: true })
    }

    const restrictAdditionalSidebarLogoutWithModal = (
        props: TRestrictAdditionalSidebarLogoutWithModalProps
    ) => {
        const { type, primaryActionCallback, ...rest } = props

        if (type === FormIsDirty) {
            updateSharedReducer({
                isEditingAnyForm: true,
                cbIfEditingFormAndUserRequestLogout: () => {
                    showWarningModal({
                        primaryAction: {
                            children: 'Logout',
                            onClick: () => primaryAction(primaryActionCallback),
                        },
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
                        primaryAction: {
                            children: 'Logout',
                            onClick: () => primaryAction(primaryActionCallback),
                        },
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
