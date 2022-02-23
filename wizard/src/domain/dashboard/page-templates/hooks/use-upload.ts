import { useState } from 'react'
import { InlineAlertProps } from '@intermine/chromatin/inline-alert'

import type { Data, ModelFile, Template } from '@intermine/compose-rest-client'
import type { CancelTokenSource } from 'axios'

import { uploadService } from '../../common/dashboard-form/utils'
import { useOnProgress } from '../../utils/hooks'
import { getDataSize } from '../../../../utils/get'
import { dataApi, fileApi, templateApi } from '../../../../services/api'

// eslint-disable-next-line max-len
import { TUploadMachineContext } from '../../common/dashboard-form/upload-machine'

export type TRunWhenPresignedURLGeneratedOptions = {
    toUpload: UploadType
    name?: string
    description?: string
    getProgressText?: (loaded: number, total: number) => string
}

enum GetMessageType {
    Successful,
    FailedToUpload,
    FailedToUploadToFile,
}

export enum UploadType {
    Dataset,
    Template,
}

export type TServiceToGeneratePreSignedURLOption = {
    name?: string
    description?: string
    toUpload: UploadType
}

export type TUseUploadProps = {
    toUpload: UploadType
}

export type TUploadProps = {
    file: File
    fileList: ModelFile[]
    dataList?: Data[]
    templateList?: Template[]
    errorMessage?: string
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

const serviceToGeneratePresignedURL = (
    uploadCtx: TUploadProps,
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

export const useUpload = () => {
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
        upload: TUploadProps,
        options: {
            _id?: string
            toUpload: UploadType
        }
    ) => {
        const { file, dataList, templateList, fileList } = upload
        const { _id, toUpload } = options

        const list = toUpload === UploadType.Dataset ? dataList : templateList

        if (!Array.isArray(list) || !Array.isArray(fileList)) {
            if (process.env.NODE_ENV === 'development') {
                console.error(
                    'Data or File is not defined, Given: Data',
                    list,
                    'File:',
                    fileList,
                    'To Upload:',
                    toUpload === UploadType.Dataset ? 'Dataset' : 'Template',
                    'Upload Context',
                    upload
                )
            }

            throw new Error('Data or File is not defined')
        }

        const failedMsg = getMsg(GetMessageType.FailedToUpload, list[0].name)
        const failedToUploadToFileMsg = getMsg(
            GetMessageType.FailedToUploadToFile,
            list[0].name
        )
        const successMsg = getMsg(GetMessageType.Successful, list[0].name)

        const { id, cancelTokenSource } = uploadService({
            id: _id,
            file,
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            url: fileList[0].presigned_put!,
            onProgress: onProgressUpdate,
            onFailed: (evt) => onProgressFailed({ ...evt, failedMsg }),
            onSuccessful: async (evt) => {
                try {
                    await fileApi.filePut({
                        file_list: [
                            {
                                file_id: fileList[0].file_id,
                                name: fileList[0].name,
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
        upload: TUploadProps
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
        upload: TUploadProps,
        options = {} as TRunWhenPresignedURLGeneratedOptions
    ) => {
        const {
            name,
            toUpload,
            getProgressText = (l, t) => `${getDataSize(l)} / ${getDataSize(t)}`,
        } = options
        const { file } = upload
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

    const runWhenPresignedURLGenerationFailed = (upload: TUploadProps) => {
        const { errorMessage = 'Unknown error occurred' } = upload
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

export const formatUploadMachineContextForUseUploadProps = (
    ctx: TUploadMachineContext
): TUploadProps => {
    const { file, response, errorMessage } = ctx

    if (!response) {
        if (process.env.NODE_ENV === 'development') {
            console.error(
                'FormUploadMachineContextForUseUploadProps',
                'response is not defined',
                'Got',
                response
            )
        }
        return {
            file,
            errorMessage,
            fileList: [],
        }
    }

    const { file_list, data_list, template_list } = response.data.items

    if (!Array.isArray(file_list)) {
        if (process.env.NODE_ENV === 'development') {
            console.error(
                'FormUploadMachineContextForUseUploadProps',
                'file_list is not an array',
                'Got',
                file_list
            )
        }
        return {
            file,
            errorMessage,
            fileList: [],
        }
    }

    return {
        file,
        fileList: file_list,
        dataList: data_list,
        templateList: template_list,
        errorMessage,
    }
}
