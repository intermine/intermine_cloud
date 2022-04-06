import { useState } from 'react'
import { Box } from '@intermine/chromatin/box'
import { useForm, Controller } from 'react-hook-form'

import { DASHBOARD_TEMPLATES_LANDING_PATH } from '../../../routes'
import { FileTypes } from '../common/constants'
import { DashboardForm as DForm } from '../common/dashboard-form'
import { useUpload } from '../hooks'

import {
    TUploadTemplateFormFields,
    defaultUploadTemplateFormFields,
    onUploadTemplateFormSubmit
} from './form-utils'

import { TModalProps, Modal } from '../../../components/modal'
import { ResponseStatus } from '../../../shared/constants'
import { getFileType, isAValidFileForTemplate } from '../utils/misc'

/**
 * All file extensions that we are supporting
 */
const fileAcceptString = '.zip'

type SelectedFile = {
    file?: File
    type: FileTypes
}

export const UploadTemplate = () => {
    const [modalProps, setModalProps] = useState<TModalProps>({
        isOpen: false
    })

    const [selectedFile, setSelectedFile] = useState<SelectedFile>({
        type: FileTypes.Unknown
    })

    const {
        control,
        reset,
        formState: { isDirty, errors, isSubmitting },
        handleSubmit,
        setValue,
        clearErrors
    } = useForm<TUploadTemplateFormFields>({
        defaultValues: defaultUploadTemplateFormFields
    })

    const {
        runWhenPresignedURLGenerationFailed,
        runWhenPresignedURLGenerated,
        inlineAlertProps
    } = useUpload()

    const resetForm = () => {
        reset()
        setSelectedFile({ type: FileTypes.Unknown })
    }

    const setFile = (file?: File) => {
        if (file) {
            setValue('file', file, {
                shouldDirty: true,
                shouldTouch: true,
                shouldValidate: true
            })
            clearErrors('file')
            setSelectedFile({ type: getFileType(file), file })
        }
    }

    const handleOnFileChange = (file?: File) => {
        const { isValid, reason } = isAValidFileForTemplate(file)
        if (!isValid) {
            const { title, msg } = reason
            setModalProps({
                isOpen: true,
                type: 'error',
                heading: title,
                children: msg,
                primaryAction: {
                    children: 'Dismiss',
                    onClick: () => {
                        setModalProps({ isOpen: false })
                    }
                }
            })
            return
        }

        setFile(file)
    }

    const onFormSubmit = async (data: TUploadTemplateFormFields) => {
        const response = await onUploadTemplateFormSubmit(data)

        if (
            response.status === ResponseStatus.Ok &&
            response.fileList &&
            response.templateList
        ) {
            runWhenPresignedURLGenerated({
                entityList: response.templateList,
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
                    landingPageUrl={DASHBOARD_TEMPLATES_LANDING_PATH}
                    pageHeading="Templates"
                />
                <DForm.Wrapper>
                    <DForm.InlineAlert {...inlineAlertProps} />
                    <DForm.Heading>Upload New Template</DForm.Heading>
                    <DForm.Label
                        isDisabled={isSubmitting}
                        main="Name"
                        sub="Name of your template."
                    >
                        <Controller
                            render={({ field }) => (
                                <DForm.Input
                                    {...field}
                                    isDisabled={isSubmitting}
                                    placeholder="Template Name"
                                />
                            )}
                            control={control}
                            name="name"
                        />
                    </DForm.Label>
                    <DForm.Label
                        isDisabled={isSubmitting}
                        main="Describe your Template"
                        sub="This will help other users to get an idea about
                        this template. You can write something like: A template 
                        for building mines similar to..."
                    >
                        <Controller
                            render={({ field }) => (
                                <DForm.Input
                                    {...field}
                                    isDisabled={isSubmitting}
                                    rows={5}
                                    Component="textarea"
                                    placeholder="Description of your template"
                                />
                            )}
                            control={control}
                            name="description"
                        />
                    </DForm.Label>

                    <DForm.Label
                        isDisabled={isSubmitting}
                        main="Select a file"
                        sub={
                            Boolean(selectedFile.file)
                                ? `Click or drop a file here 
                                if you want to change current file`
                                : 'You can select .zip'
                        }
                        hasAsterisk
                        isError={Boolean(errors.file)}
                        errorMsg={errors.file?.message}
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
                                    children: 'Upload Template',
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
