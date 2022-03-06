import axios, { CancelTokenSource } from 'axios'
import shortid from 'shortid'

import { throttle } from '../../../../utils/throttle'

import type {
    TOnProgressCancel,
    TOnProgressFailedProps,
    TOnProgressSuccessfulProps,
    TOnProgressUpdateProps,
} from '../../hooks'

export type TOnUploadSuccessfulEvent = Omit<
    TOnProgressSuccessfulProps,
    'successMsg'
>
export type TOnUploadFailedEvent = Omit<TOnProgressFailedProps, 'failedMsg'>
export type TOnUploadProgressEvent = TOnProgressUpdateProps
export type TOnUploadCancelEvent = TOnProgressCancel

export type TUploadDatasetOptions = {
    url: string
    file: File
    id?: string
    onCancel?: (event: TOnUploadCancelEvent) => void
    onSuccessful?: (event: TOnUploadSuccessfulEvent) => void
    onFailed?: (event: TOnUploadFailedEvent) => void
    onProgress?: (event: TOnUploadProgressEvent) => void
}

export type TUploadDatasetReturn = {
    cancelTokenSource: CancelTokenSource
    id: string
}

export const uploadService = (
    options: TUploadDatasetOptions
): TUploadDatasetReturn => {
    const CancelToken = axios.CancelToken
    const source = CancelToken.source()
    const {
        id = shortid.generate(),
        url,
        file,
        onFailed,
        onSuccessful,
        onProgress,
        onCancel,
    } = options

    const throttleUpdate = throttle((event) => {
        if (onProgress) {
            onProgress({
                loadedSize: event.loaded,
                totalSize: event.total,
                id,
            })
        }
    }, 60)

    axios
        .put(url, file, {
            cancelToken: source.token,
            onUploadProgress: throttleUpdate,
        })
        .then(() => {
            if (onSuccessful) {
                onSuccessful({
                    loadedSize: file.size,
                    totalSize: file.size,
                    id,
                })
            }
            return
        })
        .catch((error) => {
            if (axios.isCancel(error)) {
                onCancel && onCancel({ id })
                return
            }
            if (onFailed) {
                onFailed({ id })
            }
        })

    return {
        id,
        cancelTokenSource: source,
    }
}
