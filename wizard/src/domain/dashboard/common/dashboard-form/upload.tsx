import { useEffect } from 'react'
import { useMachine } from '@xstate/react'

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

    const uploadEventHandler = () => {
        if (uploadMachineState.can('UPLOADING_FILE')) {
            dispatch('UPLOADING_FILE')
            return
        }

        if (uploadMachineState.can('FILE_MISSING')) {
            dispatch('FILE_MISSING')
        }
    }

    const setFile = (file: File) => {
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
