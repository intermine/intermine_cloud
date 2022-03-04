import { TProgressReducerItem } from '../../../shared/types'
import { AdditionalSidebarTabs } from '../../../shared/constants'
import { ProgressItemStatus } from '../../../shared/constants'
import {
    useStoreDispatch,
    updateAdditionalSidebar,
    addGlobalAlert,
    updateProgressItem,
    addItemToProgress,
    removeActiveItemFromProgress,
    addActiveItemToProgress
} from '../../../store'
import { TGlobalAlertReducerAlert } from '../../../shared/types'

export type TOnProgressUpdateProps = Partial<TProgressReducerItem> & {
    id: string
}
export type TOnProgressSuccessfulProps = Partial<TProgressReducerItem> & {
    successMsg: string
    id: string
}
export type TOnProgressFailedProps = Partial<TProgressReducerItem> & {
    failedMsg: string
    id: string
}
export type TOnProgressStartProps = Omit<TProgressReducerItem, 'status'> & {
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
    const storeDispatch = useStoreDispatch()

    const _addGlobalAlert = (payload: TGlobalAlertReducerAlert) => {
        storeDispatch(addGlobalAlert(payload))
    }

    const onProgressUpdate = (props: TOnProgressUpdateProps) => {
        storeDispatch(updateProgressItem({ ...props }))
    }

    const onProgressSuccessful = (props: TOnProgressSuccessfulProps) => {
        const { successMsg, id, ...rest } = props
        storeDispatch(removeActiveItemFromProgress({ id }))
        storeDispatch(updateProgressItem({ id, status: Completed, ...rest }))
        _addGlobalAlert({
            id: id + 'success',
            isOpen: true,
            message: successMsg,
            type: 'success'
        })
    }

    const onProgressFailed = (props: TOnProgressFailedProps) => {
        const { failedMsg, id, ...rest } = props
        storeDispatch(removeActiveItemFromProgress({ id }))
        storeDispatch(updateProgressItem({ id, status: Failed, ...rest }))
        _addGlobalAlert({
            id: id + 'error',
            isOpen: true,
            message: failedMsg,
            type: 'error'
        })
    }

    const onProgressStart = (props: TOnProgressStartProps) => {
        const { id, isDependentOnBrowser, ...rest } = props
        storeDispatch(addActiveItemToProgress({ id, isDependentOnBrowser }))
        storeDispatch(
            updateAdditionalSidebar({
                isOpen: true,
                activeTab: AdditionalSidebarTabs.ProgressTab
            })
        )
        storeDispatch(
            addItemToProgress({
                id,
                status: Running,
                ...rest
            })
        )
    }

    const onProgressCancel = (props: TOnProgressCancel) => {
        const { id } = props
        storeDispatch(removeActiveItemFromProgress({ id }))
        storeDispatch(updateProgressItem({ id, status: Canceled }))
    }

    const onProgressRetry = (props: TOnProgressRetry) => {
        const { id, isDependentOnBrowser, onCancel } = props
        storeDispatch(addActiveItemToProgress({ id, isDependentOnBrowser }))
        storeDispatch(updateProgressItem({ id, status: Running, onCancel }))
    }

    return {
        onProgressUpdate,
        onProgressSuccessful,
        onProgressFailed,
        onProgressStart,
        onProgressCancel,
        onProgressRetry
    }
}
