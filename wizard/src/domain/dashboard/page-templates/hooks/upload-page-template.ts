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

enum GetMessageType {
    Successful,
    FailedToUpload,
    FailedToUploadToFile,
}

export enum UploadType {
    Dataset,
    Template,
}

const getMsg = (type: GetMessageType, fileName: string) => {
    switch (type) {
        case GetMessageType.FailedToUpload:
            return 'Failed to upload ' + fileName

        case GetMessageType.FailedToUploadToFile:
            return `File ${fileName} uploaded, but we failed
            to register it as uploaded. This is considered as failed.
            Please upload the file again.`

        default:
            return 'Successfully uploaded ' + fileName
    }
}

const getTaskName = (fileName: string, optionName?: string): string => {
    if (optionName) return optionName
    return fileName
}

const getFileExt = (file: File): string => {
    return file.name.slice(file.name.lastIndexOf('.') + 1, file.name.length)
}

export type TRunWhenPresignedURLGeneratedOptions = {
    toUpload: UploadType
    name?: string
    description?: string
    getProgressText?: (loaded: number, total: number) => string
}

export type TServiceToGeneratePreSignedURLOption = {
    name?: string
    description?: string
    toUpload: UploadType
}

const serviceToGeneratePresignedURL = (
    uploadCtx: TUploadMachineContext,
    options: TServiceToGeneratePreSignedURLOption
): Promise<unknown> => {
    const { file } = uploadCtx
    const { toUpload, name: nameOption, description = '' } = options

    const name = getTaskName(file.name, nameOption)

    switch (toUpload) {
        case UploadType.Dataset:
            return dataApi.dataPost({
                data_list: [
                    {
                        name,
                        ext: getFileExt(file),
                        file_type:
                            file.type !== '' ? file.type : getFileExt(file),
                    },
                ],
            })

        case UploadType.Template:
            return templateApi.templatePost({
                template_list: [
                    {
                        name,
                        template_vars: [],
                        description,
                    },
                ],
            })

        default:
            throw new Error(
                ''.concat(
                    '[ServiceToGeneratePresignedURL]: toUpload',
                    ' is not of known type. Got ',
                    toUpload,
                    '. It should be UploadType.Dataset or UploadType.Template'
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
        options: {
            _id?: string
            toUpload: UploadType
        }
    ) => {
        const { file, response } = upload.context
        const { _id, toUpload } = options

        // It is sure that we have some response.
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const items = response!.data.items
        const data_list =
            toUpload === UploadType.Dataset
                ? items.data_list
                : items.template_list

        const file_list = items.file_list

        if (!Array.isArray(data_list) || !Array.isArray(file_list)) {
            if (process.env.NODE_ENV === 'development') {
                console.error(
                    'Data or File is not defined, Given: Data',
                    data_list,
                    'File:',
                    file_list,
                    'To Upload:',
                    toUpload === UploadType.Dataset ? 'Dataset' : 'Template',
                    'Response',
                    response
                )
            }

            throw new Error('Data or File is not defined')
        }

        const failedMsg = getMsg(
            GetMessageType.FailedToUpload,
            data_list[0].name
        )
        const failedToUploadToFileMsg = getMsg(
            GetMessageType.FailedToUploadToFile,
            data_list[0].name
        )
        const successMsg = getMsg(GetMessageType.Successful, data_list[0].name)

        const { id, cancelTokenSource } = uploadService({
            id: _id,
            file,
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            url: file_list[0].presigned_put!,
            onProgress: onProgressUpdate,
            onFailed: (evt) => onProgressFailed({ ...evt, failedMsg }),
            onSuccessful: async (evt) => {
                try {
                    await fileApi.filePut({
                        file_list: [
                            {
                                file_id: file_list[0].file_id,
                                name: file_list[0].name,
                                uploaded: true,
                            },
                        ],
                    })

                    onProgressSuccessful({
                        ...evt,
                        successMsg,
                    })
                } catch {
                    onProgressFailed({
                        ...evt,
                        failedMsg: failedToUploadToFileMsg,
                    })
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
        toUpload: UploadType,
        upload: TUseDashboardUploadMachineState
    ) => {
        const { cancelTokenSource } = uploadFile(upload, { _id: id, toUpload })
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
        const {
            name,
            toUpload,
            getProgressText = (l, t) => `${getDataSize(l)} / ${getDataSize(t)}`,
        } = options
        const { file } = upload.context
        const { id, cancelTokenSource } = uploadFile(upload, { toUpload })

        onProgressStart({
            id,
            onCancel: () => {
                onCancelRequest(id, cancelTokenSource)
            },
            getProgressText,
            isDependentOnBrowser: true,
            name: getTaskName(file.name, name),
            totalSize: file.size,
            loadedSize: 0,
            onRetry: () => {
                onRetryRequest(id, toUpload, upload)
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
