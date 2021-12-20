import { useState } from 'react'
import { InlineAlertProps } from '@intermine/chromatin/inline-alert'

import type { CancelTokenSource } from 'axios'

import {
    TUseDashboardUploadMachineState,
    uploadService,
} from '../../common/dashboard-form/utils'
import { useOnProgress } from '../../utils/hooks'
import { getDataSize } from '../../../../utils/get'
import { dataApi, fileApi, templateApi } from '../../../../services/api'
// eslint-disable-next-line max-len
import { TUploadMachineContext } from '../../common/dashboard-form/upload-machine'

const getMsg = (type: 'failed' | 'success', fileName: string) => {
    if (type === 'failed') {
        return 'Failed to upload ' + fileName
    }

    return 'Successfully uploaded ' + fileName
}

export type TRunWhenPresignedURLGeneratedOptions = {
    name?: string
    description?: string
}

export type TServiceToGeneratePreSignedURLOption = {
    name?: string
    description?: string
    toUpload: 'dataset' | 'template'
}

const getTaskName = (fileName: string, optionName?: string): string => {
    if (optionName) return optionName
    return fileName
}

const getFileExt = (file: File): string => {
    return file.name.slice(file.name.lastIndexOf('.') + 1, file.name.length)
}

const serviceToGeneratePresignedURL = (
    uploadCtx: TUploadMachineContext,
    options: TServiceToGeneratePreSignedURLOption
): Promise<unknown> => {
    const { file } = uploadCtx
    const { toUpload, name: nameOption, description } = options

    const name = getTaskName(file.name, nameOption)

    switch (toUpload) {
        case 'dataset':
            return dataApi.dataPost([
                {
                    name,
                    ext: getFileExt(file),
                    file_type: file.type,
                },
            ])

        case 'template':
            return templateApi.templatePost([
                {
                    name,
                    template_vars: [],
                    description,
                },
            ])

        default:
            throw new Error(
                ''.concat(
                    '[ServiceToGeneratePresignedURL]: toUpload',
                    ' is not of known type. Got ',
                    toUpload,
                    '. It should be "dataset" or "template"'
                )
            )
    }
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
        const { file, putUrl, response } = upload.context

        // It is sure that we have some response.
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const data = response!.data.items[0]

        const failedMsg = getMsg('failed', data.name)
        const successMsg = getMsg('success', data.name)

        const { id, cancelTokenSource } = uploadService({
            id: _id,
            file,
            url: putUrl,
            onProgress: onProgressUpdate,
            onFailed: (evt) => onProgressFailed({ ...evt, failedMsg }),
            onSuccessful: async (evt) => {
                try {
                    await fileApi.filePut([
                        { file_id: data.file_id, uploaded: true },
                    ])

                    onProgressSuccessful({
                        ...evt,
                        successMsg,
                    })
                } catch {
                    onProgressFailed({ ...evt, failedMsg })
                }
            },
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
        upload: TUseDashboardUploadMachineState,
        options = {} as TRunWhenPresignedURLGeneratedOptions
    ) => {
        const { name } = options
        const { file } = upload.context
        const { id, cancelTokenSource } = uploadFile(upload)

        onProgressStart({
            id,
            onCancel: () => {
                onCancelRequest(id, cancelTokenSource)
            },
            getProgressText: (l, t) => `${getDataSize(l)} / ${getDataSize(t)}`,
            isDependentOnBrowser: true,
            name: getTaskName(file.name, name),
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

    const runWhenPresignedURLGenerationFailed = (
        upload: TUseDashboardUploadMachineState
    ) => {
        const { errorMessage = 'Unknown error occurred' } = upload.context
        _setInlineAlert({
            message: errorMessage,
            type: 'error',
        })
    }

    return {
        inlineAlertProps,
        runWhenPresignedURLGenerated,
        runWhenPresignedURLGenerationFailed,
        serviceToGeneratePresignedURL,
    }
}
