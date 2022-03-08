import { useMachine } from '@xstate/react'
import { useEffect, useState } from 'react'

import type { State } from 'xstate'

import {
    TServiceToGeneratePresignedURL,
    TUploadMachineContext,
    TUploadMachineEvents,
    TUploadMachineState,
    uploadMachine,
} from './upload-machine'

export type TUseDashboardUploadMachineState = State<
    TUploadMachineContext,
    TUploadMachineEvents,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    any,
    TUploadMachineState
>

export type TUseDashboardUploadProps = {
    runWhenPresignedURLGenerated: (ctx: TUploadMachineContext) => void
    runWhenPresignedURLGenerationFailed: (ctx: TUploadMachineContext) => void
    serviceToGeneratePresignedURL: TServiceToGeneratePresignedURL
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
        runWhenPresignedURLGenerated,
        runWhenPresignedURLGenerationFailed,
        serviceToGeneratePresignedURL,
    } = props
    const [isDirty, setIsDirty] = useState(false)

    const [uploadMachineState, dispatch] = useMachine(uploadMachine)

    const { value, context } = uploadMachineState

    const setFile = (file: File) => {
        setIsDirty(true)
        dispatch('FILE_SELECTED', { file })
    }

    const onInputChange = (event: React.FormEvent<HTMLInputElement>) => {
        try {
            const files = (event.target as HTMLInputElement).files
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
        // @ts-expect-error xstate not able to narrow down possible transition
        // state.
        if (uploadMachineState.can('GENERATE_PRESIGNED_URL')) {
            dispatch('GENERATE_PRESIGNED_URL', {
                serviceToGeneratePresignedURL,
            })
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
            runWhenPresignedURLGenerationFailed(context)
        } else if (value === 'successful') {
            runWhenPresignedURLGenerated(context)
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
