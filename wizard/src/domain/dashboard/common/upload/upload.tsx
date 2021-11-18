import { useEffect, useState } from 'react'
import { useMachine } from '@xstate/react'
import { InlineAlertProps } from '@intermine/chromatin/inline-alert'

import { UploadBox } from './upload-box'
import { UploadFileInfo } from './upload-file-info'
import { UploadHeading } from './upload-heading'
import {
    uploadMachine,
    TUploadMachineContext,
    TUploadMachineEvents,
    TUploadMachineState
} from './upload-machine'
import { State } from 'xstate'

type TUploaderHandlerOption = {
    file: File
    presignedURL: string
}
type ChildrenProps = {
    inlineAlertProps: InlineAlertProps
    uploadEventHandler: () => void
    onDropHandler: (event: React.DragEvent) => void
    onInputChange: (event: React.FormEvent<HTMLInputElement>) => void
    uploadMachineState: State<
        TUploadMachineContext,
        TUploadMachineEvents,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        any,
        TUploadMachineState
    >
}

export type TUploadProps = {
    children: (props: ChildrenProps) => JSX.Element
    uploadBaseUrl: string
    uploadHandler: (option: TUploaderHandlerOption) => void
}

const Upload = (props: TUploadProps) => {
    const { uploadBaseUrl, children, uploadHandler } = props

    const [uploadMachineState, dispatch] = useMachine(uploadMachine, {
        context: { baseURL: uploadBaseUrl }
    })

    const { context, value } = uploadMachineState

    const [inlineAlertProps, _setInlineAlertProps] = useState<InlineAlertProps>(
        {
            isOpen: false
        }
    )

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
        if (uploadMachineState.can('UPLOADING_FILE')) {
            dispatch('UPLOADING_FILE')
            return
        }

        if (uploadMachineState.can('FILE_MISSING')) {
            dispatch('FILE_MISSING')
            setInlineAlertProps({
                type: 'error',
                message: 'Please select a file.'
            })
        }
    }

    const setFile = (file: File) => {
        setInlineAlertProps({ isOpen: false })
        dispatch('FILE_SELECTED', { file })
    }

    const onInputChange = (event: React.FormEvent<HTMLInputElement>) => {
        try {
            const files = event.currentTarget.files
            if (files) {
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

    useEffect(() => {
        if (value === 'serverError') {
            setInlineAlertProps({
                message: context.errorMessage,
                type: 'error'
            })
        }

        if (value === 'successful') {
            const { putUrl, file } = context
            if (putUrl && file) {
                uploadHandler({ file, presignedURL: putUrl })
            }
            dispatch('RESET')
        }
    }, [value])

    return children({
        inlineAlertProps,
        onInputChange,
        uploadEventHandler,
        uploadMachineState,
        onDropHandler
    })
}

Upload.Box = UploadBox
Upload.FileInfo = UploadFileInfo
Upload.Heading = UploadHeading

export { Upload }
