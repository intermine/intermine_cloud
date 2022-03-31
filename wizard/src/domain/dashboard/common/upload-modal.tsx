import { useEffect, useState } from 'react'
import UploadIcon from '@intermine/chromatin/icons/System/upload-line'

import { Modal } from '../../../components/modal'
import { DashboardForm as DForm } from '../common/dashboard-form'
import { InlineAlertProps } from '@intermine/chromatin/inline-alert'
import { useUpload, TUploadProps } from '../hooks'
import { areFileTypeSame, getFileExt, getFileTypeUsingExt } from '../utils/misc'

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

    const onInputChange = (file?: File) => {
        setFile(file)
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

        if (
            areFileTypeSame({
                firstFileType: getFileTypeUsingExt(uploadProps.fileList[0].ext),
                secondFileType: getFileTypeUsingExt(getFileExt(file))
            })
        ) {
            setAlertProps({
                isOpen: true,
                type: 'error',
                message: `File type is not same as previous. 
                Previous file type was "${uploadProps.fileList[0].ext}" 
                and current file type is "${getFileExt(file)}"`
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
            <DForm.UploadBox onChange={onInputChange} />
            <DForm.UploadFileInfo file={file} />
        </Modal>
    )
}
