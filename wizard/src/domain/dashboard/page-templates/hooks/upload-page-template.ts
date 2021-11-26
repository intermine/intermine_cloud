import { useState } from 'react'
import { InlineAlertProps } from '@intermine/chromatin/inline-alert'

import type { CancelTokenSource } from 'axios'

import {
    TUseDashboardUploadMachineState,
    uploadService,
} from '../../common/dashboard-form/utils'
import { useOnProgress } from '../../utils/hooks'
import { getDataSize } from '../../../../utils/get'

const getMsg = (type: 'failed' | 'success', file: File) => {
    if (type === 'failed') {
        return 'Failed to upload ' + file.name
    }

    return 'Successfully uploaded ' + file.name
}

export const useUploadPageTemplate = () => {
    const [inlineAlertProps, setInlineAlertProps] = useState<InlineAlertProps>(
        {}
    )

    const _setInlineAlert = (p: InlineAlertProps) => {
        setInlineAlertProps({
            onClose: () => setInlineAlertProps({ isOpen: false }),
            isOpen: true,
            ...p,
        })
    }

    const {
        onProgressFailed,
        onProgressSuccessful,
        onProgressUpdate,
        onProgressStart,
        onProgressCancel,
        onProgressRetry,
    } = useOnProgress()

    const uploadFile = (
        upload: TUseDashboardUploadMachineState,
        _id?: string
    ) => {
        const { file, putUrl } = upload.context

        const failedMsg = getMsg('failed', file)
        const successMsg = getMsg('success', file)

        const { id, cancelTokenSource } = uploadService({
            id: _id,
            file,
            url: putUrl,
            onProgress: onProgressUpdate,
            onFailed: (evt) => onProgressFailed({ ...evt, failedMsg }),
            onSuccessful: (evt) =>
                onProgressSuccessful({
                    ...evt,
                    successMsg,
                }),
        })

        return {
            id,
            cancelTokenSource,
        }
    }

    const onCancelRequest = (
        id: string,
        cancelTokenSource: CancelTokenSource
    ) => {
        cancelTokenSource.cancel()
        onProgressCancel({ id })
    }

    const onRetryRequest = (
        id: string,
        upload: TUseDashboardUploadMachineState
    ) => {
        const { cancelTokenSource } = uploadFile(upload, id)
        onProgressRetry({
            id,
            isDependentOnBrowser: true,
            onCancel: () => {
                onCancelRequest(id, cancelTokenSource)
            },
        })
    }

    const runWhenPresignedURLGenerated = (
        upload: TUseDashboardUploadMachineState
    ) => {
        const { file } = upload.context
        const { id, cancelTokenSource } = uploadFile(upload)

        onProgressStart({
            id,
            onCancel: () => {
                onCancelRequest(id, cancelTokenSource)
            },
            getProgressText: (l, t) => `${getDataSize(l)}/${getDataSize(t)}`,
            isDependentOnBrowser: true,
            name: file.name,
            totalSize: file.size,
            loadedSize: 0,
            onRetry: () => {
                onRetryRequest(id, upload)
            },
        })

        _setInlineAlert({
            message: 'Your file is uploading.',
            type: 'success',
        })
    }

    const runWhenPresignedURLGenerationFailed = () => {
        _setInlineAlert({
            message: 'Unexpected Error occurred. Please try after sometime.',
            type: 'error',
        })
    }

    return {
        inlineAlertProps,
        runWhenPresignedURLGenerated,
        runWhenPresignedURLGenerationFailed,
    }
}
