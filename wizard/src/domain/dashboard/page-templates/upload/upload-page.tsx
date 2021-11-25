import {
    TUploadProps,
    uploadService,
    TOnUploadFailedEvent,
    TOnUploadProgressEvent,
    TOnUploadSuccessfulEvent
} from '../../common/dashboard-form'

import {
    useAdditionalSidebarReducer,
    useGlobalAlertReducer,
    useProgressReducer
} from '../../../../context'
import { AdditionalSidebarTabs } from '../../../../constants/additional-sidebar'
import { ProgressItemStatus } from '../../../../constants/progress'
import { UploadBox } from './upload-box'
import { UploadPageHeading } from './upload-page-heading'

const { Canceled, Failed, Completed, Running } = ProgressItemStatus

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

    const {
        addItemToProgress,
        updateProgressItem,
        addActiveItem,
        removeActiveItem
    } = progressReducer
    const { updateAdditionalSidebarState } = additionalSidebarReducer
    const { addAlert } = globalAlertReducer

    const onFailed = (event: TOnUploadFailedEvent) => {
        const { id, error, file } = event
        removeActiveItem(id)
        if (error.message === Canceled) {
            updateProgressItem({
                id,
                status: Canceled
            })
            return
        }

        updateProgressItem({
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

    const onSuccessful = (event: TOnUploadSuccessfulEvent) => {
        const { id, totalSize, loadedSize, file } = event
        removeActiveItem(id)
        updateProgressItem({ id, status: Completed, totalSize, loadedSize })
        addAlert({
            id: id + 'success',
            isOpen: true,
            message: file.name + ' is uploaded successfully.',
            type: 'success'
        })
    }

    const onProgress = (event: TOnUploadProgressEvent) => {
        const { id, loadedSize, totalSize } = event
        updateProgressItem({
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
            onFailed,
            onProgress,
            onSuccessful
        })

        addItemToProgress({
            cancelSourceToken,
            id,
            file,
            loadedSize: 0,
            totalSize: file.size,
            status: Running,
            url: presignedURL,
            onFailed,
            onProgress,
            onSuccessful
        })

        addActiveItem(id)

        updateAdditionalSidebarState({
            isOpen: true,
            activeTab: AdditionalSidebarTabs.ProgressTab
        })
    }

    return children({ uploadHandler })
}

UploadPage.UploadBox = UploadBox
UploadPage.UploadPageHeading = UploadPageHeading
