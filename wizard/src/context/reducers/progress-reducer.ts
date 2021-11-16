import { useReducer } from 'react'
import axios from 'axios'
import shortid from 'shortid'

import {
    ProgressActions,
    ProgressItemUploadStatus,
} from '../../constants/progress'
import type {
    TProgressReducer,
    TUseProgressReducer,
    TProgressReducerAction,
    TUploadDataOptions,
    TProgressItem,
} from '../types'
import { throttle } from '../../domain/dashboard/data/utils'

const { UploadData, StopDataUploading, UpdateDataProgress, RemoveEntry } =
    ProgressActions

const { Failed, Canceled, Uploading, Uploaded } = ProgressItemUploadStatus

const progressReducerInitialState: TProgressReducer = {
    progressItems: {},
}

const progressReducer = (
    state: TProgressReducer,
    action: TProgressReducerAction
) => {
    const { type, data } = action

    switch (type) {
        case UploadData:
            const progressItems = {
                ...state.progressItems,
                [(data as TProgressItem).id]: data as TProgressItem,
            }
            return { progressItems }

        case UpdateDataProgress:
            state.progressItems[(data as TProgressItem).id] = {
                ...state.progressItems[(data as TProgressItem).id],
                ...(data as TProgressItem),
            }

            return { ...state }

        case StopDataUploading:
            state.progressItems[data as string].cancelSourceToken.cancel(
                Canceled
            )
            state.progressItems[data as string].status = Canceled
            return { ...state }

        case RemoveEntry:
            delete state.progressItems[data as string]
            return { ...state }

        /* istanbul ignore next */
        default:
            throw new Error(
                ''.concat(
                    '[Progress Reducer]: Action type is not identified',
                    'Type: ',
                    type
                )
            )
    }
}

export const useProgressReducer = (): TUseProgressReducer => {
    const [state, dispatch] = useReducer(
        progressReducer,
        progressReducerInitialState
    )

    const updateDataProgress = (data: Partial<TProgressItem>) => {
        dispatch({ type: UpdateDataProgress, data })
    }

    const uploadData = (options: TUploadDataOptions) => {
        const CancelToken = axios.CancelToken
        const source = CancelToken.source()
        const { url, file, id = shortid.generate() } = options

        const throttleUpdate = throttle((event) => {
            updateDataProgress({
                id,
                loadedSize: event.loaded,
                totalSize: event.total,
            })
        }, 60)

        axios
            .put(url, file, {
                cancelToken: source.token,
                onUploadProgress: throttleUpdate,
            })
            .then(() => {
                return updateDataProgress({
                    id,
                    status: Uploaded,
                    loadedSize: file.size,
                    totalSize: file.size,
                })
            })
            .catch((error) => {
                if (error.message !== Canceled) {
                    updateDataProgress({
                        id,
                        status: Failed,
                    })
                }
            })

        dispatch({
            type: UploadData,
            data: {
                id,
                totalSize: file.size,
                loadedSize: 0,
                file,
                url,
                cancelSourceToken: source,
                status: Uploading,
            } as TProgressItem,
        })
    }

    const retryUpload = (id: string) => {
        uploadData({
            url: state.progressItems[id].url,
            file: state.progressItems[id].file,
            id,
        })
    }

    const stopDataUploading = (id: string) => {
        dispatch({
            type: StopDataUploading,
            data: id,
        })
    }

    const removeEntry = (id: string) => {
        dispatch({
            type: RemoveEntry,
            data: id,
        })
    }

    return {
        state,
        uploadData,
        stopDataUploading,
        removeEntry,
        retryUpload,
    }
}
