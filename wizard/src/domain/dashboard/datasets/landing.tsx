import { useEffect, useState } from 'react'
import { useHistory } from 'react-router-dom'
import { Box } from '@intermine/chromatin/box'
import { WorkspaceHeading } from '../common/workspace-heading'
import UploadIcon from '@intermine/chromatin/icons/System/upload-line'

import { DASHBOARD_UPLOAD_DATASET_PATH } from '../../../routes'

import { DashboardErrorBoundary } from '../common/error-boundary'
import { dataApi, fileApi } from '../../../services/api'
import { useDashboardQuery } from '../common/use-dashboard-query'

import {
    AccordionListContainer,
    TAccordionListDatum
} from '../common/accordion-list/accordion-list'

// eslint-disable-next-line max-len
import { LandingPageAccordionList } from '../common/accordion-list/landing-page-accordion-list'
import { Data, ModelFile } from '@intermine/compose-rest-client'
import { StatusTag } from '../common/status-tag'

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
    const dataResponse = await dataApi.dataGet('get_all_data')
    const { data_list: dataList } = dataResponse.data.items

    const fileIds: Record<'file_id', string>[] = []

    for (const data of dataList) {
        fileIds.push({
            file_id: data.file_id
        })
    }

    const fileResponse = await fileApi.filePut({
        // @ts-expect-error This will be fixed when we use fileApi.fileGet
        file_list: fileIds
    })

    const { file_list: fileList } = fileResponse.data.items

    const fileListObj: Record<string, ModelFile> = {}

    for (const file of fileList) {
        fileListObj[file.file_id] = file
    }

    const dataset: TDataset[] = []

    for (const data of dataList) {
        dataset.push({ ...data, file: fileListObj[data.file_id] })
    }

    return dataset
}

export const Landing = () => {
    const history = useHistory()
    const [data, setData] = useState<TAccordionListDatum[]>([])
    const [isFailedToFetchData, setIsFailedToFetchData] = useState(false)

    const handleUploadClick = () => {
        history.push(DASHBOARD_UPLOAD_DATASET_PATH)
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
                    }
                ]
            })
        }
        setData(lists)
    }

    const { isLoading, query } = useDashboardQuery({
        queryFn: () => fetchDataAndFiles(),
        onSuccessful: onQuerySuccessful,
        onError: () => setIsFailedToFetchData(true)
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

            <DashboardErrorBoundary errorMessage="Unable to load table.">
                <AccordionListContainer
                    isEmpty={data.length === 0}
                    isLoading={isLoading}
                    msgIfListIsEmpty={
                        isFailedToFetchData
                            ? MsgIfFailedToLoadList
                            : MsgIfListEmpty
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
