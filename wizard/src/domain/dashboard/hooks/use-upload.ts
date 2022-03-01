import { useState } from 'react'
import { InlineAlertProps } from '@intermine/chromatin/inline-alert'

import type {
    Data,
    ModelFile,
    Template,
    DataPostDataList,
    TemplatePostTemplateList,
} from '@intermine/compose-rest-client'
import type { CancelTokenSource } from 'axios'

import { uploadService } from '../common/dashboard-form/utils'
import { useOnProgress } from './use-on-progress'
import { getDataSize } from '../../../utils/get'
import { dataApi, fileApi, templateApi } from '../../../services/api'

import { TUploadMachineContext } from '../common/dashboard-form/upload-machine'
import { Entities, UploadFileStatus } from '../common/constants'

export type TUploadProps = {
    file: File
    fileList: ModelFile[]
    entityList: Data[] | Template[]
    entity: Entities
    errorMessage?: string
}

export type TRunWhenPresignedURLGeneratedOptions = TUploadProps & {
    getProgressText?: (loaded: number, total: number) => string
}

export type TServiceToGeneratePreSignedURLOption = {
    entity: Entities
    dataset?: DataPostDataList
    template?: TemplatePostTemplateList
}

const { Fail, FailToUploadFile, Successful } = UploadFileStatus

const getMsg = (type: UploadFileStatus, fileName: string) => {
    switch (type) {
        case Fail:
            return 'Failed to upload ' + fileName

        case FailToUploadFile:
            return `File ${fileName} uploaded, but we failed
            to register it as uploaded. This is considered as failed.
            Please upload the file again.`

        default:
            return 'Successfully uploaded ' + fileName
    }
}

const serviceToGeneratePresignedURL = (
    options: TServiceToGeneratePreSignedURLOption
): Promise<unknown> => {
    const { entity, dataset, template } = options

    if (entity === Entities.Dataset && typeof dataset === 'object') {
        return dataApi.dataPost({
            data_list: [dataset],
        })
    }

    if (entity === Entities.Template && typeof template === 'object') {
        return templateApi.templatePost({
            template_list: [template],
        })
    }

    throw new Error(
        'serviceToGeneratePresignedURL: entity format is not correct'
    )
}

export type TUploadFileOptions = {
    _id?: string
    file: File
    fileList: ModelFile[]
    nameOfEntity: string
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

    const uploadFile = (options: TUploadFileOptions) => {
        const { _id, file, fileList, nameOfEntity } = options

        const failedMsg = getMsg(Fail, nameOfEntity)
        const failedToUploadToFileMsg = getMsg(FailToUploadFile, nameOfEntity)
        const successMsg = getMsg(Successful, nameOfEntity)

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

    const onRetryRequest = (upload: TUploadFileOptions & { _id: string }) => {
        const { cancelTokenSource } = uploadFile(upload)
        onProgressRetry({
            id: upload._id,
            isDependentOnBrowser: true,
            onCancel: () => {
                onCancelRequest(upload._id, cancelTokenSource)
            },
        })
    }

    const runWhenPresignedURLGenerated = (
        options = {} as TRunWhenPresignedURLGeneratedOptions
    ) => {
        const {
            file,
            fileList,
            entityList,
            getProgressText = (l, t) => `${getDataSize(l)} / ${getDataSize(t)}`,
        } = options

        const nameOfEntity = entityList[0].name

        const { id, cancelTokenSource } = uploadFile({
            file,
            fileList,
            nameOfEntity,
        })

        onProgressStart({
            id,
            onCancel: () => {
                onCancelRequest(id, cancelTokenSource)
            },
            getProgressText,
            isDependentOnBrowser: true,
            name: nameOfEntity,
            totalSize: file.size,
            loadedSize: 0,
            onRetry: () => {
                onRetryRequest({
                    _id: id,
                    file,
                    fileList,
                    nameOfEntity,
                })
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
    ctx: TUploadMachineContext,
    entity: Entities
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
        throw new Error('response is not defined')
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

        throw new Error('file_list is not an array.')
    }

    const entityList = entity === Entities.Dataset ? data_list : template_list

    if (!Array.isArray(entityList)) {
        if (process.env.NODE_ENV === 'development') {
            console.error(
                'FormUploadMachineContextForUseUploadProps',
                entity === Entities.Dataset ? 'data_list' : 'template_list',
                'is not an array'
            )
        }

        throw new Error('Data or File is not defined')
    }

    return {
        file,
        fileList: file_list,
        entityList,
        errorMessage,
        entity,
    }
}
