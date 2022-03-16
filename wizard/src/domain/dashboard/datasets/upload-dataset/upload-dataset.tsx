import { Box } from '@intermine/chromatin/box'
import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'

import { TModalProps, Modal } from '../../../../components/modal'

import { DASHBOARD_DATASETS_LANDING_PATH } from '../../../../routes'
import { ResponseStatus } from '../../../../shared/constants'
import { FileTypes } from '../../common/constants'
import { DashboardForm as DForm } from '../../common/dashboard-form'
import { useUpload } from '../../hooks'
import {
    areFileTypeSame,
    getFileType,
    isFileTypeSupportedForDataset
} from '../../utils/misc'
import {
    defaultUploadDatasetFormFields,
    onUploadDatasetFormSubmit,
    TUploadDatasetFormFields
} from './form-utils'
import { GetFileRelatedQuestions } from './get-file-related-questions'

/**
 * All file extensions that we are supporting
 */
const fileAcceptString = '.fasta,.gff,.tsv,.csv'

type SelectedFile = {
    file?: File
    type: FileTypes
}

export const UploadDataset = () => {
    const [modalProps, setModalProps] = useState<TModalProps>({
        isOpen: false
    })

    const [selectedFile, setSelectedFile] = useState<SelectedFile>({
        type: FileTypes.Unknown
    })

    const {
        control,
        reset,
        formState: { isDirty, dirtyFields, errors, isSubmitting },
        handleSubmit,
        resetField,
        setValue,
        clearErrors
    } = useForm<TUploadDatasetFormFields>({
        defaultValues: defaultUploadDatasetFormFields
    })

    const {
        runWhenPresignedURLGenerationFailed,
        runWhenPresignedURLGenerated,
        inlineAlertProps
    } = useUpload()

    const hasAnsweredAnyFileRelatedQuestions = (): boolean => {
        if (dirtyFields.fasta || dirtyFields.gff || dirtyFields.tsvOrCsv)
            return true
        return false
    }

    const isAllowedToChangeFile = (file?: File) => {
        const currentFile = selectedFile.file

        if (!currentFile || !file) return false

        return areFileTypeSame({
            firstFileType: getFileType(file),
            secondFileType: getFileType(currentFile)
        })
    }

    const setFile = (file?: File) => {
        if (file) {
            setValue('file', file)
            clearErrors('file')
            setSelectedFile({ type: getFileType(file), file })
        }
    }

    const handleOnFileChange = (file?: File) => {
        if (!isFileTypeSupportedForDataset(file)) {
            setModalProps({
                isOpen: true,
                type: 'error',
                heading: 'File type not supported',
                children: `File which you have selected is not supported.
                Please select a different file.`,
                primaryAction: {
                    children: 'Dismiss',
                    onClick: () => {
                        setModalProps({ isOpen: false })
                    }
                }
            })
            return
        }

        if (
            hasAnsweredAnyFileRelatedQuestions() &&
            isAllowedToChangeFile(file)
        ) {
            setModalProps({
                isOpen: true,
                type: 'warning',
                heading: 'Are you sure?',
                children: ` You have answered some questions related to current 
                file. If you change file whose file type is different to current
                file then you'll lose all the answers you have added.`,
                primaryAction: {
                    children: 'Change File',
                    onClick: () => {
                        setFile(file)
                        setModalProps({ isOpen: false })
                    }
                },
                secondaryAction: {
                    children: 'Cancel',
                    onClick: () => setModalProps({ isOpen: false })
                }
            })
            return
        }

        setFile(file)
    }

    const resetForm = () => {
        reset()
        setSelectedFile({ type: FileTypes.Unknown })
    }

    const onFormSubmit = async (data: TUploadDatasetFormFields) => {
        const response = await onUploadDatasetFormSubmit(data)

        if (
            response.status === ResponseStatus.Ok &&
            response.fileList &&
            response.dataList
        ) {
            runWhenPresignedURLGenerated({
                entityList: response.dataList,
                file: data.file,
                fileList: response.fileList
            })
            resetForm()
        } else {
            runWhenPresignedURLGenerationFailed({
                errorMessage: response.message
            })
        }
    }

    return (
        <Box>
            <Modal
                {...modalProps}
                onClose={() => setModalProps({ isOpen: false })}
            />
            <DForm isDirty={isDirty} onSubmit={handleSubmit(onFormSubmit)}>
                <DForm.PageHeading
                    landingPageUrl={DASHBOARD_DATASETS_LANDING_PATH}
                    pageHeading="Datasets"
                />
                <DForm.Wrapper>
                    <DForm.InlineAlert {...inlineAlertProps} />
                    <DForm.Heading>Upload New Dataset</DForm.Heading>
                    <DForm.Label
                        isDisabled={isSubmitting}
                        main="Name"
                        sub="Name of your dataset."
                        hasAsterisk
                        errorMsg={errors.name?.message}
                        isError={Boolean(errors.name)}
                    >
                        <Controller
                            render={({ field }) => (
                                <DForm.Input
                                    {...field}
                                    isDisabled={isSubmitting}
                                    placeholder="Dataset Name"
                                    isError={Boolean(errors.name)}
                                />
                            )}
                            control={control}
                            name="name"
                            rules={{
                                required: 'Name is required'
                            }}
                        />
                    </DForm.Label>
                    <DForm.Label
                        main="Describe your Dataset"
                        sub="This will help other users to get an idea about
                        this dataset. You can write something like: A dataset 
                        having information about..."
                        isDisabled={isSubmitting}
                    >
                        <Controller
                            render={({ field }) => (
                                <DForm.Input
                                    {...field}
                                    isDisabled={isSubmitting}
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
                        sub={
                            Boolean(selectedFile.file)
                                ? 'You can select .fasta, .gff, .csv, .tsv'
                                : `Click or drop a file here 
                                if you want to change file`
                        }
                        hasAsterisk
                        isError={Boolean(errors.file)}
                        errorMsg={errors.file?.message}
                        isDisabled={isSubmitting}
                    >
                        <Controller
                            render={() => {
                                return (
                                    <DForm.UploadBox
                                        accept={fileAcceptString}
                                        isHidden={Boolean(selectedFile.file)}
                                        isError={Boolean(errors.file)}
                                        isDisabled={isSubmitting}
                                        onChange={(file) =>
                                            handleOnFileChange(file)
                                        }
                                    />
                                )
                            }}
                            control={control}
                            name="file"
                            rules={{
                                required: 'Please select a file'
                            }}
                        />
                        <DForm.UploadFileInfo file={selectedFile.file} />
                    </DForm.Label>

                    <GetFileRelatedQuestions
                        control={control}
                        fileType={selectedFile.type}
                        resetFields={resetField}
                    />
                    <Box>
                        <DForm.Actions
                            actions={[
                                {
                                    key: 'reset',
                                    children: 'Reset',
                                    color: 'warning',
                                    type: 'reset',
                                    isDisabled: isSubmitting,
                                    onClick: resetForm
                                },
                                {
                                    key: 'upload',
                                    color: 'primary',
                                    children: 'Upload Dataset',
                                    type: 'submit',
                                    isDisabled: isSubmitting,
                                    isLoading: isSubmitting
                                }
                            ]}
                        />
                    </Box>
                </DForm.Wrapper>
            </DForm>
        </Box>
    )
}
