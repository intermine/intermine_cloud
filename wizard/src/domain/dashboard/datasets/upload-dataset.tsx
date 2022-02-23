import { Box } from '@intermine/chromatin/box'

import { DASHBOARD_DATASETS_LANDING_PATH } from '../../../routes'
import { DashboardForm as DForm } from '../common/dashboard-form'
import {
    useDashboardForm,
    useDashboardUpload
} from '../common/dashboard-form/utils'
import { useUpload } from '../page-templates/hooks'
import {
    formatUploadMachineContextForUseUploadProps,
    UploadType
} from '../page-templates/hooks/use-upload'

export const UploadDataset = () => {
    const {
        serviceToGeneratePresignedURL,
        runWhenPresignedURLGenerationFailed,
        runWhenPresignedURLGenerated,
        inlineAlertProps
    } = useUpload()

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
        serviceToGeneratePresignedURL: (ctx) => {
            const _ctx = formatUploadMachineContextForUseUploadProps(ctx)
            return serviceToGeneratePresignedURL(_ctx, {
                toUpload: UploadType.Dataset,
                name: name.value,
                description: description.value
            })
        },
        runWhenPresignedURLGenerated: (ctx) => {
            const _ctx = formatUploadMachineContextForUseUploadProps(ctx)
            runWhenPresignedURLGenerated(_ctx, {
                name: name.value,
                description: description.value,
                toUpload: UploadType.Dataset
            })
            resetForm()
        },
        runWhenPresignedURLGenerationFailed: (ctx) => {
            const _ctx = formatUploadMachineContextForUseUploadProps(ctx)
            runWhenPresignedURLGenerationFailed(_ctx)
        }
    })

    const resetForm = () => {
        resetToInitialState()
        resetUpload()
    }

    return (
        <Box>
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
                        <DForm.Input
                            value={name.value}
                            onChange={(event) =>
                                updateDashboardFormState(
                                    'name',
                                    event.currentTarget.value
                                )
                            }
                            placeholder="Dataset Name"
                        />
                    </DForm.Label>
                    <DForm.Label
                        main="Describe your Dataset"
                        sub="This will help other users to get an idea about
                        this dataset. You can write something like: A dataset 
                        having information about..."
                        isDisabled={isGeneratingPresignedURL}
                    >
                        <DForm.Input
                            rows={5}
                            value={description.value}
                            Component="textarea"
                            placeholder="Description of your dataset"
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
                        isDisabled={isGeneratingPresignedURL}
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
