import { Box } from '@intermine/chromatin/box'
import React, { useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'

import { DASHBOARD_DATASETS_LANDING_PATH } from '../../../../routes'
import { Entities } from '../../common/constants'
import { DashboardForm as DForm } from '../../common/dashboard-form'
import { useDashboardUpload } from '../../common/dashboard-form'
import {
    useUpload,
    formatUploadMachineContextForUseUploadProps
} from '../../hooks'
import { areFileTypeSame, getFileExt, getFileType } from '../../utils/misc'
import { FileChangeWarningModal } from './file-change-warning-modal'

const { Dataset } = Entities

/**
 * All file extensions that we are supporting
 */
const fileAcceptString = '.fasta,.gff,.tsv,.csv'

type TUploadDatasetFormFields = {
    name: string
    description: string
}

export const UploadDataset = () => {
    const [modalProps, setModalProps] = useState({
        isOpen: false,
        primaryAction: () => null
    })

    const {
        control,
        reset,
        formState: { isDirty },
        getValues
    } = useForm<TUploadDatasetFormFields>({
        defaultValues: {
            description: '',
            name: ''
        }
    })

    const {
        serviceToGeneratePresignedURL,
        runWhenPresignedURLGenerationFailed,
        runWhenPresignedURLGenerated,
        inlineAlertProps
    } = useUpload()

    const {
        generatePresignedURL,
        isDirty: isUploadDirty,
        isGeneratingPresignedURL,
        onDropHandler: _onDropHandler,
        onInputChange: _onInputChange,
        uploadMachineState,
        reset: resetUpload
    } = useDashboardUpload({
        serviceToGeneratePresignedURL: (ctx) => {
            const { file } = ctx

            return serviceToGeneratePresignedURL({
                entity: Dataset,
                dataset: {
                    ext: getFileExt(file),
                    file_type: file.type ? file.type : getFileExt(file),
                    name: getValues('name') ? getValues('name') : file.name
                }
            })
        },

        runWhenPresignedURLGenerated: (ctx) => {
            const _ctx = formatUploadMachineContextForUseUploadProps(
                ctx,
                Dataset
            )
            runWhenPresignedURLGenerated(_ctx)
            resetForm()
        },

        runWhenPresignedURLGenerationFailed: (ctx) => {
            runWhenPresignedURLGenerationFailed({
                errorMessage: ctx.errorMessage
            })
        }
    })

    const isAllowedToChangeFile = (file?: File) => {
        const { file: currentFile } = uploadMachineState.context

        if (!currentFile || !file) return false

        return areFileTypeSame({
            firstFileType: getFileType(file),
            secondFileType: getFileType(currentFile)
        })
    }

    const closeModal = () => {
        setModalProps({
            isOpen: false,
            primaryAction: () => null
        })
    }

    const onDropHandler = (event: React.DragEvent) => {
        const file = event.dataTransfer.files[0]
        if (isAllowedToChangeFile(file)) {
            setModalProps({
                isOpen: true,
                primaryAction: () => {
                    _onDropHandler(event)
                    closeModal()
                    return null
                }
            })
            return
        }

        _onDropHandler(event)
    }

    const onInputChange = (event: React.FormEvent<HTMLInputElement>) => {
        const files = event.currentTarget.files
        if (files && isAllowedToChangeFile(files[0])) {
            setModalProps({
                isOpen: true,
                primaryAction: () => {
                    _onInputChange(event)
                    closeModal()
                    return null
                }
            })
            return
        }

        _onInputChange(event)
    }

    const resetForm = () => {
        reset()
        resetUpload()
    }

    useEffect(() => {
        const { file } = uploadMachineState.context
        if (file) {
            console.log('File Format', getFileType(file))
        }
    }, [uploadMachineState.context.file])

    return (
        <Box>
            <FileChangeWarningModal {...modalProps} onClose={closeModal} />
            <DForm isDirty={isDirty || isUploadDirty}>
                <DForm.PageHeading
                    landingPageUrl={DASHBOARD_DATASETS_LANDING_PATH}
                    pageHeading="Datasets"
                />
                <DForm.Wrapper>
                    <DForm.InlineAlert {...inlineAlertProps} />
                    <DForm.Heading>Upload New Dataset</DForm.Heading>
                    <DForm.Label
                        isDisabled={isGeneratingPresignedURL}
                        main="Name"
                        sub="Name of your dataset."
                    >
                        <Controller
                            render={({ field }) => (
                                <DForm.Input
                                    {...field}
                                    isDisabled={isGeneratingPresignedURL}
                                    placeholder="Dataset Name"
                                />
                            )}
                            control={control}
                            name="name"
                        />
                    </DForm.Label>
                    <DForm.Label
                        main="Describe your Dataset"
                        sub="This will help other users to get an idea about
                        this dataset. You can write something like: A dataset 
                        having information about..."
                        isDisabled={isGeneratingPresignedURL}
                    >
                        <Controller
                            render={({ field }) => (
                                <DForm.Input
                                    {...field}
                                    isDisabled={isGeneratingPresignedURL}
                                    rows={5}
                                    Component="textarea"
                                    placeholder="Description of your dataset"
                                />
                            )}
                            control={control}
                            name="description"
                        />
                    </DForm.Label>

                    <DForm.Label
                        main="Select a file"
                        sub="You can select .fasta, .gff, .csv, .tsv"
                        hasAsterisk
                        isError={uploadMachineState.value === 'fileMissing'}
                        errorMsg="Please select a file."
                        isDisabled={isGeneratingPresignedURL}
                    >
                        <DForm.UploadBox
                            onInputChange={onInputChange}
                            onDropHandler={onDropHandler}
                            accept={fileAcceptString}
                        />
                    </DForm.Label>
                    <DForm.UploadFileInfo
                        file={uploadMachineState.context.file}
                    />

                    <Box>
                        <DForm.Actions
                            actions={[
                                {
                                    key: 'reset',
                                    children: 'Reset',
                                    color: 'warning',
                                    type: 'reset',
                                    isDisabled: isGeneratingPresignedURL,
                                    onClick: resetForm
                                },
                                {
                                    key: 'upload',
                                    color: 'primary',
                                    children: 'Upload Dataset',
                                    onClick: generatePresignedURL,
                                    isDisabled: isGeneratingPresignedURL,
                                    isLoading: isGeneratingPresignedURL
                                }
                            ]}
                        />
                    </Box>
                </DForm.Wrapper>
            </DForm>
        </Box>
    )
}
