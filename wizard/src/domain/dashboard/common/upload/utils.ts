import axios, { CancelTokenSource } from 'axios'
import shortid from 'shortid'

import { throttle } from '../../../../utils/throttle'

export type TOnUploadSuccessfulEvent = {
    file: File
    loadedSize: number
    totalSize: number
    id: string
}
export type TOnUploadFailedEvent = {
    error: { message: string }
    file: File
    id: string
}

export type TOnUploadProgressEvent = {
    file: File
    loadedSize: number
    totalSize: number
    id: string
}

export type TUploadDatasetOptions = {
    url: string
    file: File
    id?: string
    onUploadSuccessful?: (event: TOnUploadSuccessfulEvent) => void
    onUploadFailed?: (event: TOnUploadFailedEvent) => void
    onUploadProgress?: (event: TOnUploadProgressEvent) => void
}

export type TUploadDatasetReturn = {
    cancelSourceToken: CancelTokenSource
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
        onUploadFailed,
        onUploadSuccessful,
        onUploadProgress,
    } = options

    const throttleUpdate = throttle((event) => {
        if (onUploadProgress) {
            onUploadProgress({
                loadedSize: event.loaded,
                totalSize: event.total,
                file,
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
            if (onUploadSuccessful) {
                onUploadSuccessful({
                    loadedSize: file.size,
                    totalSize: file.size,
                    file,
                    id,
                })
            }
            return
        })
        .catch((error) => {
            if (onUploadFailed) {
                onUploadFailed({ error, file, id })
            }
        })

    return {
        id,
        cancelSourceToken: source,
    }
}
