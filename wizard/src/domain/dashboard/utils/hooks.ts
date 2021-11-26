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
            msg = 'All your work will be lost',
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

export const useLogout = () => {
    const { updateAuthState } = useAuthReducer()

    const logout = () => {
        updateAuthState(AuthStates.NotAuthorize)
    }

    return {
        logout,
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
    isRestrictUnmount: boolean
}
export type TOnProgressCancel = {
    id: string
}
export type TOnProgressRetry = {
    id: string
    isRestrictUnmount: boolean
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
        const { id, isRestrictUnmount, ...rest } = props
        addActiveItem({ id, isRestrictUnmount })
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
        const { id, isRestrictUnmount, onCancel } = props
        addActiveItem({ id, isRestrictUnmount })
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
