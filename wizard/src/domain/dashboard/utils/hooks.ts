import { useHistory } from 'react-router'
import {
    useGlobalModalReducer,
    useAuthReducer,
    useProgressReducer,
    useGlobalAlertReducer,
    useAdditionalSidebarReducer,
} from '../../../context'
import { AuthStates } from '../../../constants/auth'
import { TProgressItem } from '../../../context/types'
import { AdditionalSidebarTabs } from '../../../constants/additional-sidebar'
import { ProgressItemStatus } from '../../../constants/progress'
import { LOGIN_PATH } from '../../../routes'

type TUseDashboardWarningModalProps = {
    msg?: string
    primaryActionTitle?: string
    primaryActionCallback?: () => void
    secondaryActionTitle?: string
    to?: string
}

export const useDashboardWarningModal = () => {
    const history = useHistory()
    const { updateGlobalModalProps, closeGlobalModal } = useGlobalModalReducer()

    const showWarningModal = (props: TUseDashboardWarningModalProps) => {
        const {
            msg = 'All your work will be lost.',
            primaryActionTitle = 'Proceed',
            secondaryActionTitle = 'Cancel',
            to = '/',
            primaryActionCallback,
        } = props
        updateGlobalModalProps({
            isOpen: true,
            heading: 'Are you sure?',
            type: 'warning',
            children: msg,
            primaryAction: {
                onClick: () => {
                    closeGlobalModal()
                    history.push(to)
                    if (typeof primaryActionCallback === 'function') {
                        primaryActionCallback()
                    }
                },
                children: primaryActionTitle,
            },
            secondaryAction: {
                onClick: closeGlobalModal,
                children: secondaryActionTitle,
            },
        })
    }

    return {
        showWarningModal,
    }
}

export enum RestrictLogoutRestrictions {
    FormIsDirty = 'FormIsDirty',
    Uploading = 'Uploading',
}

export type TRestrictAdditionalSidebarLogoutWithModalProps =
    TUseDashboardWarningModalProps & {
        type: RestrictLogoutRestrictions
    }

export const useLogout = () => {
    const { FormIsDirty, Uploading } = RestrictLogoutRestrictions

    const { updateAuthState } = useAuthReducer()
    const { updateAdditionalSidebarLogoutState } = useAdditionalSidebarReducer()
    const { showWarningModal } = useDashboardWarningModal()

    const logout = () => {
        updateAuthState(AuthStates.NotAuthorize)
    }

    const restrictAdditionalSidebarLogoutWithModal = (
        props: TRestrictAdditionalSidebarLogoutWithModalProps
    ) => {
        const { type, primaryActionCallback, ...rest } = props

        if (type === FormIsDirty) {
            updateAdditionalSidebarLogoutState({
                isEditingForm: true,
                onLogoutClickCallbacks: {
                    editingFormCallback: () => {
                        showWarningModal({
                            to: LOGIN_PATH,
                            primaryActionTitle: 'Logout',
                            primaryActionCallback: () => {
                                logout()
                                primaryActionCallback && primaryActionCallback()
                            },
                            ...rest,
                        })
                    },
                },
            })

            return
        }

        if (type === Uploading) {
            updateAdditionalSidebarLogoutState({
                isUploading: true,
                onLogoutClickCallbacks: {
                    uploadingFormCallback: () => {
                        showWarningModal({
                            to: LOGIN_PATH,
                            primaryActionTitle: 'Logout',
                            primaryActionCallback: () => {
                                logout()
                                primaryActionCallback && primaryActionCallback()
                            },
                            msg: `If you logout, then all the uploads
                            in progress will be lost.`,
                            ...rest,
                        })
                    },
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
            updateAdditionalSidebarLogoutState({
                isEditingForm: false,
                onLogoutClickCallbacks: {
                    editingFormCallback: () => false,
                },
            })

            return
        }

        if (type === Uploading) {
            updateAdditionalSidebarLogoutState({
                isUploading: false,
                onLogoutClickCallbacks: {
                    uploadingFormCallback: () => false,
                },
            })
        }
    }

    return {
        logout,
        restrictAdditionalSidebarLogoutWithModal,
        removeAdditionalSidebarLogoutWithModalRestriction,
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
