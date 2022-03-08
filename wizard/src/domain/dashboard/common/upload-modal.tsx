import { useEffect, useState } from 'react'
import UploadIcon from '@intermine/chromatin/icons/System/upload-line'

import { Modal } from '../../../components/modal'
import { DashboardForm as DForm } from '../common/dashboard-form'
import { InlineAlertProps } from '@intermine/chromatin/inline-alert'
import { useUpload, TUploadProps } from '../hooks'
import { getFileExt } from '../utils/misc'

export type TUploadModalProps = {
    isOpen: boolean
    onClose: () => void
    heading: string
    uploadProps: Omit<TUploadProps, 'file'>
}

export const UploadModal = (props: TUploadModalProps) => {
    const { uploadProps, isOpen, onClose, heading } = props

    const { runWhenPresignedURLGenerated } = useUpload()

    const [file, setFile] = useState<File>()
    const [alertProps, setAlertProps] = useState<InlineAlertProps>({
        isOpen: false
    })

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

    const onUploadClick = () => {
        if (!file) {
            setAlertProps({
                isOpen: true,
                type: 'error',
                message: 'Please select a file'
            })
            return
        }

        const previousFileExtension = uploadProps.fileList[0].ext

        if (getFileExt(file) !== previousFileExtension) {
            setAlertProps({
                isOpen: true,
                type: 'error',
                message: `File type is not same as previous. 
                Previous file extension was "${previousFileExtension}" 
                and current file extension is "${getFileExt(file)}"`
            })

            return
        }

        runWhenPresignedURLGenerated({
            ...uploadProps,
            file
        })

        onClose()
    }

    useEffect(() => {
        if (!isOpen) {
            // eslint-disable-next-line unicorn/no-useless-undefined
            setFile(undefined)
        }
    }, [isOpen])

    return (
        <Modal
            isOpen={isOpen}
            type="success"
            HeaderIcon={UploadIcon}
            onClose={onClose}
            heading={heading}
            primaryAction={{
                children: 'Upload',
                onClick: onUploadClick
            }}
            secondaryAction={{
                children: 'Cancel',
                onClick: onClose
            }}
        >
            <DForm.InlineAlert
                isDense
                onClose={() =>
                    setAlertProps((prev) => ({ ...prev, isOpen: false }))
                }
                {...alertProps}
            />
            Uploading file for "{uploadProps.entityList[0]?.name}"
            <DForm.UploadBox
                onInputChange={onInputChange}
                onDropHandler={onDropHandler}
            />
            <DForm.UploadFileInfo file={file} />
        </Modal>
    )
}
