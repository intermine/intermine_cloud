import {
    TUploadProps,
    uploadService,
    TOnUploadFailedEvent,
    TOnUploadProgressEvent,
    TOnUploadSuccessfulEvent
} from '../../common/upload'

import {
    useAdditionalSidebarReducer,
    useGlobalAlertReducer,
    useProgressReducer
} from '../../../../context'
import { AdditionalSidebarTabs } from '../../../../constants/additional-sidebar'
import { ProgressItemUploadStatus } from '../../../../constants/progress'
import { UploadBox } from './upload-box'
import { UploadPageHeading } from './upload-page-heading'

const { Canceled, Failed, Completed, Running } = ProgressItemUploadStatus

type TUploadPageChildrenProps = {
    uploadHandler: TUploadProps['uploadHandler']
}

export type TUploadPageProps = {
    children: (props: TUploadPageChildrenProps) => JSX.Element
}

export const UploadPage = (props: TUploadPageProps) => {
    const { children } = props

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

    const uploadHandler: TUploadProps['uploadHandler'] = (event) => {
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

    return children({ uploadHandler })
}

UploadPage.UploadBox = UploadBox
UploadPage.UploadPageHeading = UploadPageHeading
