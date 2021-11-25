import { clone } from '@intermine/chromatin/utils'
import axios, { CancelTokenSource } from 'axios'
import { useState } from 'react'
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
    onSuccessful?: (event: TOnUploadSuccessfulEvent) => void
    onFailed?: (event: TOnUploadFailedEvent) => void
    onProgress?: (event: TOnUploadProgressEvent) => void
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
        onFailed,
        onSuccessful,
        onProgress,
    } = options

    const throttleUpdate = throttle((event) => {
        if (onProgress) {
            onProgress({
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
            if (onSuccessful) {
                onSuccessful({
                    loadedSize: file.size,
                    totalSize: file.size,
                    file,
                    id,
                })
            }
            return
        })
        .catch((error) => {
            if (onFailed) {
                onFailed({ error, file, id })
            }
        })

    return {
        id,
        cancelSourceToken: source,
    }
}

/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any*/
export type TUseDashboardFormState<T extends TUseDashboardFormFields> = {
    [X in keyof T]: {
        value: TUseDashboardFormField<T>['value']
    }
}

export type TUseDashboardFormFieldOptions<T extends TUseDashboardFormFields> = {
    isRequired?: boolean
    validator?: (
        value: any,
        state: TUseDashboardFormState<T>
    ) => {
        isError: boolean
        type?: string
        errorMsg?: string
    }
}

export type TUseDashboardFormErrorFields<T extends TUseDashboardFormFields> =
    Partial<{
        [X in keyof T]: {
            errorMsg: string
            type: string
        }
    }>

export type TUseDashboardFormField<T extends TUseDashboardFormFields = any> = {
    value: any
    options?: TUseDashboardFormFieldOptions<T>
}

export type TUseDashboardFormFields<
    U extends string = string,
    T extends TUseDashboardFormState<any> = any
> = Record<U, TUseDashboardFormField<T>>

export type TUseDashboardFormReturn<T extends TUseDashboardFormFields> = {
    state: TUseDashboardFormState<T>
    errorFields: TUseDashboardFormErrorFields<T>
    updateState: (key: keyof T, value: any) => void
    handleFormSubmit: (
        cb: (state: TUseDashboardFormState<T>) => void
    ) => boolean
}

const defaultValidator = (v: any) => {
    if (v === '') {
        return {
            isError: true,
            type: 'isRequired',
            errorMsg: 'Required',
        }
    }
    return {
        isError: false,
        type: '',
        errorMsg: '',
    }
}

export const useDashboardForm = <T extends TUseDashboardFormFields>(
    fields: T
): TUseDashboardFormReturn<T> => {
    const getInitialValue = () => {
        const newState: TUseDashboardFormReturn<T>['state'] = Object.create({})!

        for (const key of Object.keys(fields)) {
            newState[key as keyof T] = {
                value: fields[key].value,
            }
        }
        return newState
    }

    const [state, setState] = useState<TUseDashboardFormReturn<T>['state']>(
        getInitialValue()
    )
    const [errorFields, setErrorFields] = useState<
        TUseDashboardFormReturn<T>['errorFields']
    >({})

    const updateState = (key: keyof T, value: any) => {
        delete errorFields[key]
        setErrorFields(errorFields)
        setState((prev) => ({
            ...prev,
            [key]: {
                ...prev[key],
                value,
                isError: false,
            },
        }))
    }

    const handleFormSubmit: TUseDashboardFormReturn<T>['handleFormSubmit'] = (
        cb
    ) => {
        let isValid = true
        const newState: TUseDashboardFormReturn<T>['state'] = clone(state)
        const newErrorFields: TUseDashboardFormReturn<T>['errorFields'] = {}

        for (const key of Object.keys(newState)) {
            const field = { ...fields[key], ...newState[key] }
            if (field.options && field.options.isRequired) {
                const {
                    value,
                    options: { validator: _validator },
                } = field

                const validator = _validator ?? defaultValidator
                const {
                    isError,
                    type = '',
                    errorMsg = '',
                } = validator(value, state)

                if (isError) {
                    isValid = false

                    newErrorFields[key as keyof T] = {
                        errorMsg,
                        type,
                    }
                }
            }
        }

        setErrorFields(newErrorFields)

        if (isValid) {
            cb(newState)
        }
        return isValid
    }

    return {
        state,
        errorFields,
        handleFormSubmit,
        updateState,
    }
    /* eslint-enable @typescript-eslint/no-non-null-assertion */
    /* eslint-enable @typescript-eslint/no-explicit-any*/
}
