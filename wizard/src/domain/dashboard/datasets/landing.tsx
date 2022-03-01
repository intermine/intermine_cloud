import { useEffect, useState } from 'react'
import { useHistory } from 'react-router-dom'
import { Box } from '@intermine/chromatin/box'
import UploadIcon from '@intermine/chromatin/icons/System/upload-line'

import { Data, ModelFile } from '@intermine/compose-rest-client'

import { WorkspaceHeading } from '../common/workspace-heading'
import { DASHBOARD_UPLOAD_DATASET_PATH } from '../../../routes'
import { DashboardErrorBoundary } from '../common/error-boundary'
import { dataApi } from '../../../services/api'
import { useDashboardQuery } from '../hooks'
import {
    AccordionListContainer,
    TAccordionListDatum,
    AccordionList
} from '../common/accordion-list/accordion-list'
// eslint-disable-next-line max-len
import { LandingPageAccordionList } from '../common/accordion-list/landing-page-accordion-list'
import { StatusTag } from '../common/status-tag'
import {
    extractAllFileIdsObjFromList,
    fetchAllFileUsingFileIds
} from '../utils/misc'
import { UploadModal } from '../common/upload-modal'
import { Entities } from '../common/constants'

type TDataset = Data & {
    file: ModelFile
}

const MsgIfListEmpty = (
    <Box>
        You haven't uploaded any dataset yet!
        <br />
        Use the 'Upload New Dataset' button to upload.
    </Box>
)

const MsgIfFailedToLoadList = <Box>Failed to load datasets.</Box>

const fetchDataAndFiles = async () => {
    const res = await dataApi.dataGet('get_all_data')
    const { data_list: dataList } = res.data.items

    const fileIds = extractAllFileIdsObjFromList(dataList)
    const fileListObj = await fetchAllFileUsingFileIds(fileIds)

    const dataset: TDataset[] = []

    for (const data of dataList) {
        dataset.push({ ...data, file: fileListObj[data.file_id] })
    }

    return dataset
}

const defaultUploadModalState = {
    isOpen: false,
    uploadProps: {
        entity: Entities.Dataset,
        entityList: [] as Data[],
        fileList: [] as ModelFile[]
    }
}

export const Landing = () => {
    const history = useHistory()
    const [data, setData] = useState<TAccordionListDatum[]>([])
    const [uploadModalState, setUploadModalState] = useState(
        defaultUploadModalState
    )

    const handleUploadClick = () => {
        history.push(DASHBOARD_UPLOAD_DATASET_PATH)
    }

    const onUploadModalClose = () => {
        setUploadModalState(defaultUploadModalState)
    }

    const getAction = (dataset: TDataset) => {
        const { file } = dataset

        if (file.uploaded) {
            return (
                <AccordionList.ActionButton
                    Component="a"
                    color="primary"
                    href={file.presigned_get}
                    target="_blank"
                >
                    Download Dataset
                </AccordionList.ActionButton>
            )
        }
        return (
            <AccordionList.ActionButton
                color="secondary"
                onClick={() =>
                    setUploadModalState({
                        isOpen: true,
                        uploadProps: {
                            ...defaultUploadModalState.uploadProps,
                            fileList: [file],
                            entityList: [dataset]
                        }
                    })
                }
            >
                Retry Upload
            </AccordionList.ActionButton>
        )
    }

    const onQuerySuccessful = (dataset: TDataset[]) => {
        const lists: TAccordionListDatum[] = []
        for (const data of dataset) {
            lists.push({
                id: data.data_id,
                file_id: data.file_id,
                bodyItem: { content: '' },
                headerItems: [
                    {
                        id: data.data_id + 'header-name',
                        body: data.name,
                        heading: 'Name'
                    },
                    {
                        id: data.data_id + 'header-file-type',
                        body: data.file_type,
                        heading: 'File Type'
                    },
                    {
                        id: data.data_id + 'header-ext',
                        body: '.' + data.ext,
                        heading: 'Extension'
                    },
                    {
                        id: data.data_id + 'file-upload-status',
                        body: (
                            <StatusTag
                                status={
                                    data.file.uploaded ? 'success' : 'warning'
                                }
                                statusText={
                                    data.file.uploaded ? 'Uploaded' : 'Pending'
                                }
                            />
                        ),
                        heading: 'File Upload Status'
                    },
                    {
                        id: data.data_id + 'action',
                        body: (
                            <Box csx={{ root: { padding: '0.25rem' } }}>
                                {getAction(data)}
                            </Box>
                        ),
                        heading: ''
                    }
                ]
            })
        }
        setData(lists)
    }

    const { isLoading, isFailed, query } = useDashboardQuery({
        queryFn: () => fetchDataAndFiles(),
        onSuccessful: onQuerySuccessful,
        refetchInterval: 10_000
    })

    useEffect(() => {
        query()
    }, [])

    return (
        <Box>
            <WorkspaceHeading
                heading={{ children: 'Datasets' }}
                primaryAction={{
                    children: 'Upload New Dataset',
                    RightIcon: <UploadIcon />,
                    onClick: handleUploadClick
                }}
            />

            <UploadModal
                {...uploadModalState}
                onClose={onUploadModalClose}
                heading="Upload Dataset"
            />
            <DashboardErrorBoundary errorMessage="Unable to load table.">
                <AccordionListContainer
                    isEmpty={data.length === 0}
                    isLoading={isLoading}
                    msgIfListIsEmpty={
                        isFailed ? MsgIfFailedToLoadList : MsgIfListEmpty
                    }
                >
                    {data.map((item, idx) => {
                        return (
                            <LandingPageAccordionList
                                key={item.id}
                                isFirstItem={idx === 0}
                                isLastItem={idx + 1 === data.length}
                                item={item}
                            />
                        )
                    })}
                </AccordionListContainer>
            </DashboardErrorBoundary>
        </Box>
    )
}
