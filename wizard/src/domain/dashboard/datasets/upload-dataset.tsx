import { Box } from '@intermine/chromatin/box'
import { useForm, Controller } from 'react-hook-form'

import { DASHBOARD_DATASETS_LANDING_PATH } from '../../../routes'
import { Entities } from '../common/constants'
import { DashboardForm as DForm } from '../common/dashboard-form'
import { useDashboardUpload } from '../common/dashboard-form'
import {
    useUpload,
    formatUploadMachineContextForUseUploadProps
} from '../hooks'
import { getFileExt } from '../utils/misc'

const { Dataset } = Entities

type TUploadDatasetFormFields = {
    name: string
    description: string
}

export const UploadDataset = () => {
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
        onDropHandler,
        onInputChange,
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

    const resetForm = () => {
        reset()
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
