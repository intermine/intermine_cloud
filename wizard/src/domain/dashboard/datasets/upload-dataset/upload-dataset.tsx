import { useEffect, useState } from 'react'
import { useMachine } from '@xstate/react'
import { InlineAlertProps } from '@intermine/chromatin/inline-alert'

import { uploadDatasetMachine } from './upload-dataset-machine'
import { UploadDatasetView } from './upload-dataset-view'
import {
    useAdditionalSidebarReducer,
    useGlobalAlertReducer,
    useProgressReducer
} from '../../../../context'
import { AdditionalSidebarTabs } from '../../../../constants/additional-sidebar'
import {
    uploadDataset,
    TOnUploadFailedEvent,
    TOnUploadProgressEvent,
    TOnUploadSuccessfulEvent
} from './utils'
import { ProgressItemUploadStatus } from '../../../../constants/progress'

const { Canceled, Failed, Completed, Running } = ProgressItemUploadStatus

export const UploadDataset = () => {
    const [uploadDatasetMachineState, dispatch] =
        useMachine(uploadDatasetMachine)
    const {
        context: uploadDatasetMachineContext,
        value: uploadDatasetMachineValue
    } = uploadDatasetMachineState
    const [inlineAlert, _setInlineAlertProps] = useState<InlineAlertProps>({
        isOpen: false
    })

    const progressReducer = useProgressReducer()
    const additionalSidebarReducer = useAdditionalSidebarReducer()
    const globalAlertReducer = useGlobalAlertReducer()

    const { addDataset, updateDataset } = progressReducer
    const { updateState: updateAdditionalSidebarState } =
        additionalSidebarReducer
    const { addAlert } = globalAlertReducer

    const setInlineAlertProps = (p: InlineAlertProps) => {
        _setInlineAlertProps((prev) => ({
            ...prev,
            isOpen: true,
            duration: 5000,
            onClose: () => setInlineAlertProps({ isOpen: false }),
            ...p
        }))
    }

    const uploadEventHandler = () => {
        if (uploadDatasetMachineState.can('UPLOADING_FILE')) {
            dispatch('UPLOADING_FILE')
            return
        }

        if (uploadDatasetMachineState.can('FILE_MISSING')) {
            dispatch('FILE_MISSING')
            setInlineAlertProps({
                type: 'error',
                message: 'Please select a file.'
            })
        }
    }

    const onInputChange = (event: React.FormEvent<HTMLInputElement>) => {
        setInlineAlertProps({ isOpen: false })
        const files = event.currentTarget.files
        if (files) {
            dispatch('FILE_SELECTED', { file: files[0] })
        }
    }

    const onUploadFailed = (event: TOnUploadFailedEvent) => {
        const { id, error, file } = event
        if (error.message === Canceled) {
            updateDataset({
                id,
                status: Canceled
            })
            return
        }

        updateDataset({
            id,
            status: Failed
        })

        addAlert({
            id,
            type: 'error',
            message: 'Failed to upload ' + file.name,
            isOpen: true
        })
    }

    const onUploadSuccessful = (event: TOnUploadSuccessfulEvent) => {
        const { id, totalSize, loadedSize, file } = event
        updateDataset({ id, status: Completed, totalSize, loadedSize })
        addAlert({
            id: id + 'success',
            isOpen: true,
            message: file.name + ' is uploaded successfully.',
            type: 'success'
        })
    }

    const onUploadProgress = (event: TOnUploadProgressEvent) => {
        const { id, loadedSize, totalSize } = event
        updateDataset({
            id,
            loadedSize,
            totalSize
        })
    }

    const uploadDatasetHandler = () => {
        const { putUrl, file } = uploadDatasetMachineContext
        if (putUrl && file) {
            const { cancelSourceToken, id } = uploadDataset({
                file,
                url: putUrl,
                onUploadFailed,
                onUploadProgress,
                onUploadSuccessful
            })

            addDataset({
                cancelSourceToken,
                id,
                file,
                loadedSize: 0,
                totalSize: file.size,
                status: Running,
                url: putUrl,
                onUploadFailed,
                onUploadProgress,
                onUploadSuccessful
            })

            updateAdditionalSidebarState({
                isOpen: true,
                activeTab: AdditionalSidebarTabs.ProgressTab
            })
        }
    }

    useEffect(() => {
        if (uploadDatasetMachineValue === 'serverError') {
            setInlineAlertProps({
                message: uploadDatasetMachineContext.errorMessage,
                type: 'error'
            })
        }

        if (uploadDatasetMachineValue === 'successful') {
            uploadDatasetHandler()
            dispatch('RESET')
        }
    }, [uploadDatasetMachineValue])

    return (
        <UploadDatasetView
            isUploadingFile={uploadDatasetMachineValue === 'uploadingFile'}
            file={uploadDatasetMachineContext.file}
            inlineAlert={inlineAlert}
            onInputChange={onInputChange}
            uploadEventHandler={uploadEventHandler}
        />
    )
}
