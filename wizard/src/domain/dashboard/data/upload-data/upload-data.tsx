import { useContext, useEffect, useState } from 'react'

import { useMachine } from '@xstate/react'

import { InlineAlertProps } from '@intermine/chromatin/inline-alert'

import { AppContext } from '../../../../context'

import { uploadDataMachine } from './upload-data-machine'
import { UploadDataView } from './upload-data-view'

export const UploadData = () => {
    const store = useContext(AppContext)
    const {
        additionalSidebarReducer: { updateState }
    } = store

    const [uploadDataMachineState, dispatch] = useMachine(uploadDataMachine)

    const { context: uploadDataMachineContext, value: uploadDataMachineValue } =
        uploadDataMachineState
    const [inlineAlert, _setInlineAlertProps] = useState<InlineAlertProps>({
        isOpen: false
    })

    const setInlineAlertProps = (p: InlineAlertProps) => {
        _setInlineAlertProps((prev) => ({
            ...prev,
            isOpen: true,
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

    const uploadFile = () => {
        if (uploadDataMachineContext.putUrl) {
            fetch(uploadDataMachineContext.putUrl, {
                method: 'PUT',
                body: uploadDataMachineContext.file
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

            uploadFile()
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
