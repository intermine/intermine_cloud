import { useHistory } from 'react-router-dom'
import { Box } from '@intermine/chromatin/box'
import { Button } from '@intermine/chromatin/button'
import { InlineAlert } from '@intermine/chromatin/inline-alert'

import { DASHBOARD_DATASETS_LANDING_PATH } from '../../../routes'

import { WorkspaceHeading } from '../common/workspace-heading'
import {
    Upload,
    TUploadProps,
    uploadService,
    TOnUploadFailedEvent,
    TOnUploadProgressEvent,
    TOnUploadSuccessfulEvent
} from '../common/upload'

import {
    useAdditionalSidebarReducer,
    useGlobalAlertReducer,
    useProgressReducer
} from '../../../context'
import { AdditionalSidebarTabs } from '../../../constants/additional-sidebar'
import { ProgressItemUploadStatus } from '../../../constants/progress'

const { Canceled, Failed, Completed, Running } = ProgressItemUploadStatus

export const UploadDataset = () => {
    const history = useHistory()

    const progressReducer = useProgressReducer()
    const additionalSidebarReducer = useAdditionalSidebarReducer()
    const globalAlertReducer = useGlobalAlertReducer()

    const { addDataset, updateDataset } = progressReducer
    const { updateState: updateAdditionalSidebarState } =
        additionalSidebarReducer
    const { addAlert } = globalAlertReducer

    const onUploadFailed = (event: TOnUploadFailedEvent) => {
        const { id, error, file } = event
        if (error.message === Canceled) {
            updateDataset({
                id,
                status: Canceled
            })
            return
        }

        updateDataset({
            id,
            status: Failed
        })

        addAlert({
            id,
            type: 'error',
            message: 'Failed to upload ' + file.name,
            isOpen: true
        })
    }

    const onUploadSuccessful = (event: TOnUploadSuccessfulEvent) => {
        const { id, totalSize, loadedSize, file } = event
        updateDataset({ id, status: Completed, totalSize, loadedSize })
        addAlert({
            id: id + 'success',
            isOpen: true,
            message: file.name + ' is uploaded successfully.',
            type: 'success'
        })
    }

    const onUploadProgress = (event: TOnUploadProgressEvent) => {
        const { id, loadedSize, totalSize } = event
        updateDataset({
            id,
            loadedSize,
            totalSize
        })
    }

    const uploadDatasetHandler: TUploadProps['uploadHandler'] = (event) => {
        const { presignedURL, file } = event
        const { cancelSourceToken, id } = uploadService({
            file,
            url: presignedURL,
            onUploadFailed,
            onUploadProgress,
            onUploadSuccessful
        })

        addDataset({
            cancelSourceToken,
            id,
            file,
            loadedSize: 0,
            totalSize: file.size,
            status: Running,
            url: presignedURL,
            onUploadFailed,
            onUploadProgress,
            onUploadSuccessful
        })

        updateAdditionalSidebarState({
            isOpen: true,
            activeTab: AdditionalSidebarTabs.ProgressTab
        })
    }

    return (
        <Box>
            <WorkspaceHeading
                heading={{ variant: 'h2', children: 'Dataset' }}
                backAction={{
                    onClick: () => {
                        history.push(DASHBOARD_DATASETS_LANDING_PATH)
                    }
                }}
            />
            <Box isContentCenter>
                <Upload
                    uploadBaseUrl="http://localhost:3000/presignedUrl?name="
                    uploadHandler={uploadDatasetHandler}
                >
                    {({
                        inlineAlertProps,
                        uploadEventHandler,
                        onInputChange,
                        uploadMachineState
                    }) => (
                        <>
                            <InlineAlert
                                hasFullWidth
                                csx={{
                                    root: ({ spacing }) => ({
                                        marginBottom: spacing(5)
                                    })
                                }}
                                {...inlineAlertProps}
                            />
                            <Upload.Heading
                                heading={{ children: 'Upload New Dataset' }}
                                sub={{
                                    children:
                                        // eslint-disable-next-line max-len
                                        'You can select .fasta, .tsv, .csv, .etc'
                                }}
                            />
                            <Upload.Box
                                onInputChange={onInputChange}
                                isDisabled={
                                    uploadMachineState.value === 'uploadingFile'
                                }
                            />
                            <Upload.FileInfo
                                file={uploadMachineState.context.file}
                            />

                            <Box isContentCenter>
                                <Button
                                    color="primary"
                                    onClick={uploadEventHandler}
                                    isLoading={
                                        uploadMachineState.value ===
                                        'uploadingFile'
                                    }
                                >
                                    Upload Dataset
                                </Button>
                            </Box>
                        </>
                    )}
                </Upload>
            </Box>
        </Box>
    )
}
