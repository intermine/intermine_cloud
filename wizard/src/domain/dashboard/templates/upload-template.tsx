import { Box } from '@intermine/chromatin/box'

import { DASHBOARD_TEMPLATES_LANDING_PATH } from '../../../routes'
import { DashboardForm as DForm } from '../common/dashboard-form'
import {
    useDashboardForm,
    useDashboardUpload
} from '../common/dashboard-form/utils'
import { useUploadPageTemplate } from '../page-templates/hooks'

const uploadEndpoint = 'http://localhost:3000/presignedUrl/template?name='

export const UploadTemplate = () => {
    const {
        runWhenPresignedURLGenerationFailed,
        runWhenPresignedURLGenerated,
        inlineAlertProps
    } = useUploadPageTemplate()

    const {
        state: { name, description },
        isDirty,
        resetToInitialState,
        updateDashboardFormState
    } = useDashboardForm({
        name: {
            value: ''
        },
        description: {
            value: ''
        }
    })

    const {
        generatePresignedURL,
        isDirty: isUploadDirty,
        isGeneratingPresignedURL,
        onDropHandler,
        onInputChange,
        uploadMachineState,
        reset: resetUpload
    } = useDashboardUpload({
        uploadBaseUrl: uploadEndpoint,
        runWhenPresignedURLGenerated: (upload) => {
            runWhenPresignedURLGenerated(upload)
            resetForm()
        },
        runWhenPresignedURLGenerationFailed
    })

    const resetForm = () => {
        resetToInitialState()
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
                    <DForm.Label main="Name" sub="Name of your template.">
                        <DForm.Input
                            value={name.value}
                            onChange={(event) =>
                                updateDashboardFormState(
                                    'name',
                                    event.currentTarget.value
                                )
                            }
                            placeholder="Template Name"
                        />
                    </DForm.Label>
                    <DForm.Label
                        main="Describe your Template"
                        sub="This will help other users to get an idea about
                        this template. You can write something like: A template 
                        for building mines similar to..."
                    >
                        <DForm.Input
                            rows={5}
                            value={description.value}
                            Component="textarea"
                            placeholder="Description of your template"
                            onChange={(event) =>
                                updateDashboardFormState(
                                    'description',
                                    event.currentTarget.value
                                )
                            }
                        />
                    </DForm.Label>

                    <DForm.Label
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
