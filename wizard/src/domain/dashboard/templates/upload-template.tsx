import { Box } from '@intermine/chromatin/box'
import { useForm, Controller } from 'react-hook-form'

import { DASHBOARD_TEMPLATES_LANDING_PATH } from '../../../routes'
import { Entities } from '../common/constants'
import { DashboardForm as DForm } from '../common/dashboard-form'
import { useDashboardUpload } from '../common/dashboard-form'
import {
    useUpload,
    formatUploadMachineContextForUseUploadProps
} from '../hooks'

const { Template } = Entities

type TUploadTemplateFormFields = {
    name: string
    description: string
}

export const UploadTemplate = () => {
    const {
        control,
        reset,
        formState: { isDirty },
        getValues
    } = useForm<TUploadTemplateFormFields>({
        defaultValues: {
            description: '',
            name: ''
        }
    })

    const {
        runWhenPresignedURLGenerationFailed,
        runWhenPresignedURLGenerated,
        serviceToGeneratePresignedURL,
        inlineAlertProps
    } = useUpload()

    const {
        generatePresignedURL,
        isDirty: isUploadDirty,
        isGeneratingPresignedURL,
        onDropHandler,
        onInputChange,
        uploadMachineState,
        reset: resetUpload
    } = useDashboardUpload({
        serviceToGeneratePresignedURL: (ctx) => {
            const { file } = ctx

            return serviceToGeneratePresignedURL({
                entity: Template,
                template: {
                    description: getValues('description'),
                    name: getValues('name') ? getValues('name') : file.name,
                    template_vars: []
                }
            })
        },

        runWhenPresignedURLGenerated: (ctx) => {
            const _ctx = formatUploadMachineContextForUseUploadProps(
                ctx,
                Template
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

    const resetForm = () => {
        reset()
        resetUpload()
    }

    return (
        <Box>
            <DForm isDirty={isDirty || isUploadDirty}>
                <DForm.PageHeading
                    landingPageUrl={DASHBOARD_TEMPLATES_LANDING_PATH}
                    pageHeading="Templates"
                />
                <DForm.Wrapper>
                    <DForm.InlineAlert {...inlineAlertProps} />
                    <DForm.Heading>Upload New Template</DForm.Heading>
                    <DForm.Label
                        isDisabled={isGeneratingPresignedURL}
                        main="Name"
                        sub="Name of your template."
                    >
                        <Controller
                            render={({ field }) => (
                                <DForm.Input
                                    {...field}
                                    isDisabled={isGeneratingPresignedURL}
                                    placeholder="Template Name"
                                />
                            )}
                            control={control}
                            name="name"
                        />
                    </DForm.Label>
                    <DForm.Label
                        isDisabled={isGeneratingPresignedURL}
                        main="Describe your Template"
                        sub="This will help other users to get an idea about
                        this template. You can write something like: A template 
                        for building mines similar to..."
                    >
                        <Controller
                            render={({ field }) => (
                                <DForm.Input
                                    {...field}
                                    isDisabled={isGeneratingPresignedURL}
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
                        isDisabled={isGeneratingPresignedURL}
                        main="Select a file"
                        sub="You can select .fasta, .tsv, .cst, .etc"
                        hasAsterisk
                        isError={uploadMachineState.value === 'fileMissing'}
                        errorMsg="Please select a file."
                    >
                        <DForm.UploadBox
                            onInputChange={onInputChange}
                            onDropHandler={onDropHandler}
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
                                    children: 'Upload Template',
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
