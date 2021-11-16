import { useEffect, useState } from 'react'
import { useMachine } from '@xstate/react'
import { InlineAlertProps } from '@intermine/chromatin/inline-alert'

import { uploadDataMachine } from './upload-data-machine'
import { UploadDataView } from './upload-data-view'
import {
    useAdditionalSidebarReducer,
    useProgressReducer
} from '../../../../context'
import { AdditionalSidebarTabs } from '../../../../constants/additional-sidebar'

export const UploadData = () => {
    const [uploadDataMachineState, dispatch] = useMachine(uploadDataMachine)
    const { context: uploadDataMachineContext, value: uploadDataMachineValue } =
        uploadDataMachineState
    const [inlineAlert, _setInlineAlertProps] = useState<InlineAlertProps>({
        isOpen: false
    })

    const progressReducer = useProgressReducer()
    const additionalSidebarReducer = useAdditionalSidebarReducer()

    const { uploadData: _uploadData } = progressReducer
    const { updateState: updateAdditionalSidebarState } =
        additionalSidebarReducer

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
        if (uploadDataMachineState.can('UPLOADING_FILE')) {
            dispatch('UPLOADING_FILE')
            return
        }

        if (uploadDataMachineState.can('FILE_MISSING')) {
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

    const uploadData = () => {
        const { putUrl, file } = uploadDataMachineContext
        if (putUrl && file) {
            _uploadData({
                file: file,
                url: putUrl
            })
            updateAdditionalSidebarState({
                isOpen: true,
                activeTab: AdditionalSidebarTabs.ProgressTab
            })
        }
    }

    useEffect(() => {
        if (uploadDataMachineValue === 'serverError') {
            setInlineAlertProps({
                message: uploadDataMachineContext.errorMessage,
                type: 'error'
            })
        }

        if (uploadDataMachineValue === 'successful') {
            setInlineAlertProps({
                type: 'success',
                message:
                    'Your file is uploading. Check progress in Progress Tab.'
            })

            uploadData()
            dispatch('RESET')
        }
    }, [uploadDataMachineValue])

    return (
        <UploadDataView
            isUploadingFile={uploadDataMachineValue === 'uploadingFile'}
            file={uploadDataMachineContext.file}
            inlineAlert={inlineAlert}
            onInputChange={onInputChange}
            uploadEventHandler={uploadEventHandler}
        />
    )
}
