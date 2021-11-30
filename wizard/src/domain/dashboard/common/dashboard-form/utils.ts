import { useMachine } from '@xstate/react'
import { clone } from '@intermine/chromatin/utils'
import axios, { CancelTokenSource } from 'axios'
import { useEffect, useState } from 'react'
import shortid from 'shortid'

import type { State } from 'xstate'

import { throttle } from '../../../../utils/throttle'
import {
    TUploadMachineContext,
    TUploadMachineEvents,
    TUploadMachineState,
    uploadMachine,
} from './upload-machine'

import type {
    TOnProgressCancel,
    TOnProgressFailedProps,
    TOnProgressSuccessfulProps,
    TOnProgressUpdateProps,
} from '../../utils/hooks'

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
    updateDashboardFormState: (key: keyof T, value: any) => void
    handleFormSubmit: (
        cb: (state: TUseDashboardFormState<T>) => void
    ) => boolean
    isDirty: boolean
    resetToInitialState: () => void
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
    const [isDirty, setIsDirty] = useState(false)

    const [errorFields, setErrorFields] = useState<
        TUseDashboardFormReturn<T>['errorFields']
    >({})

    const updateDashboardFormState = (key: keyof T, value: any) => {
        delete errorFields[key]
        setErrorFields(errorFields)
        setIsDirty(true)
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

    const resetToInitialState = () => {
        setState(getInitialValue())
        setIsDirty(false)
    }

    return {
        state,
        errorFields,
        handleFormSubmit,
        updateDashboardFormState,
        isDirty,
        resetToInitialState,
    }
    /* eslint-enable @typescript-eslint/no-non-null-assertion */
    /* eslint-enable @typescript-eslint/no-explicit-any*/
}

export type TUseDashboardUploadMachineState = State<
    TUploadMachineContext,
    TUploadMachineEvents,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    any,
    TUploadMachineState
>

export type TUseDashboardUploadProps = {
    uploadBaseUrl: string
    runWhenPresignedURLGenerated: (ctx: TUseDashboardUploadMachineState) => void
    runWhenPresignedURLGenerationFailed: (
        ctx: TUseDashboardUploadMachineState
    ) => void
}

export type TUseDashboardUploadReturn = {
    isDirty: boolean
    isGeneratingPresignedURL: boolean
    onDropHandler: (event: React.DragEvent) => void
    onInputChange: (event: React.FormEvent<HTMLInputElement>) => void
    uploadMachineState: TUseDashboardUploadMachineState
    generatePresignedURL: () => boolean
    reset: () => boolean
}

export const useDashboardUpload = (
    props: TUseDashboardUploadProps
): TUseDashboardUploadReturn => {
    const {
        uploadBaseUrl,
        runWhenPresignedURLGenerated,
        runWhenPresignedURLGenerationFailed,
    } = props
    const [isDirty, setIsDirty] = useState(false)

    const [uploadMachineState, dispatch] = useMachine(uploadMachine, {
        context: { baseURL: uploadBaseUrl },
    })

    const { value } = uploadMachineState

    const setFile = (file: File) => {
        setIsDirty(true)
        dispatch('FILE_SELECTED', { file })
    }

    const onInputChange = (event: React.FormEvent<HTMLInputElement>) => {
        try {
            const files = event.currentTarget.files
            if (files && files.length > 0) {
                setFile(files[0])
            }
        } catch (error) {
            console.error(error)
        }
    }

    const onDropHandler = (event: React.DragEvent) => {
        try {
            const files = event.dataTransfer.files
            if (files) {
                setFile(files[0])
            }
        } catch (error) {
            console.error(error)
        }
    }

    const generatePresignedURL = () => {
        if (uploadMachineState.can('GENERATE_PRESIGNED_URL')) {
            dispatch('GENERATE_PRESIGNED_URL')
            return true
        }

        if (uploadMachineState.can('FILE_MISSING')) {
            dispatch('FILE_MISSING')
        }
        return false
    }

    const reset = () => {
        if (uploadMachineState.can('RESET')) {
            dispatch('RESET')
            setIsDirty(false)
            return true
        }
        return false
    }

    useEffect(() => {
        if (value === 'serverError') {
            runWhenPresignedURLGenerationFailed(uploadMachineState)
        } else if (value === 'successful') {
            runWhenPresignedURLGenerated(uploadMachineState)
            dispatch('RESET')
        }
    }, [value])

    return {
        isDirty,
        isGeneratingPresignedURL: value === 'generatePresignedURL',
        onDropHandler,
        onInputChange,
        uploadMachineState,
        generatePresignedURL,
        reset,
    }
}
