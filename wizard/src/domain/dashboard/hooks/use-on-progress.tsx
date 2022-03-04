import { useProgressReducer } from '../../../context'
import { TProgressItem } from '../../../context/types'
import { AdditionalSidebarTabs } from '../../../shared/constants'
import { ProgressItemStatus } from '../../../constants/progress'
import {
    useStoreDispatch,
    updateAdditionalSidebar,
    addGlobalAlert
} from '../../../store'
import { TGlobalAlertReducerAlert } from '../../../shared/types'

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
    const storeDispatch = useStoreDispatch()
    const {
        updateProgressItem,
        removeActiveItem,
        addActiveItem,
        addItemToProgress
    } = useProgressReducer()

    const _addGlobalAlert = (payload: TGlobalAlertReducerAlert) => {
        storeDispatch(addGlobalAlert(payload))
    }

    const onProgressUpdate = (props: TOnProgressUpdateProps) => {
        updateProgressItem({ ...props })
    }

    const onProgressSuccessful = (props: TOnProgressSuccessfulProps) => {
        const { successMsg, id, ...rest } = props
        removeActiveItem(id)
        updateProgressItem({ id, status: Completed, ...rest })
        _addGlobalAlert({
            id: id + 'success',
            isOpen: true,
            message: successMsg,
            type: 'success'
        })
    }

    const onProgressFailed = (props: TOnProgressFailedProps) => {
        const { failedMsg, id, ...rest } = props
        removeActiveItem(id)
        updateProgressItem({ id, status: Failed, ...rest })
        _addGlobalAlert({
            id: id + 'error',
            isOpen: true,
            message: failedMsg,
            type: 'error'
        })
    }

    const onProgressStart = (props: TOnProgressStartProps) => {
        const { id, isDependentOnBrowser, ...rest } = props
        addActiveItem({ id, isDependentOnBrowser })
        storeDispatch(
            updateAdditionalSidebar({
                isOpen: true,
                activeTab: AdditionalSidebarTabs.ProgressTab
            })
        )
        addItemToProgress({
            id,
            status: Running,
            ...rest
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
        onProgressRetry
    }
}
