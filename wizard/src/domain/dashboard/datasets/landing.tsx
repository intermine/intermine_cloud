import { useEffect, useState } from 'react'
import { useHistory } from 'react-router-dom'
import { Box } from '@intermine/chromatin/box'
import { WorkspaceHeading } from '../common/workspace-heading'
import UploadIcon from '@intermine/chromatin/icons/System/upload-line'
import DownloadIcon from '@intermine/chromatin/icons/System/download-line'

import { AxiosResponse } from 'axios'

import { DASHBOARD_UPLOAD_DATASET_PATH } from '../../../routes'

import { DashboardErrorBoundary } from '../common/error-boundary'
import { dataApi, fileApi } from '../../../services/api'
import { useDashboardQuery } from '../common/use-dashboard-query'

import { TDatasetResponseData } from './types'
import {
    AccordionList,
    AccordionListContainer,
    TAccordionListDatum
} from '../common/accordion-list/accordion-list'

const MsgIfListEmpty = (
    <Box>
        You haven't uploaded any dataset yet!
        <br />
        Use the 'Upload New Dataset' button to upload.
    </Box>
)

type TActionsLoading = {
    [x in string]: {
        download: boolean
    }
}

export const Landing = () => {
    const history = useHistory()
    const [data, setData] = useState<TAccordionListDatum[]>([])
    const [actionsLoading, _setActionsLoading] = useState<TActionsLoading>({})

    const setActionsLoading = (
        id: string,
        key: keyof TActionsLoading[''],
        value: boolean
    ) => {
        _setActionsLoading((prev) => ({
            ...prev,
            [id]: {
                ...prev[id],
                [key]: value
            }
        }))
    }

    const handleUploadClick = () => {
        history.push(DASHBOARD_UPLOAD_DATASET_PATH)
    }

    const onQuerySuccessful = (
        response: AxiosResponse<TDatasetResponseData>
    ) => {
        const lists: TAccordionListDatum[] = []

        for (let i = 0; i < response.data.items.length; i += 1) {
            const currentItem = response.data.items[i]
            lists.push({
                id: currentItem.data_id,
                file_id: currentItem.file_id,
                bodyItem: { content: currentItem.description },
                headerItems: [
                    {
                        id: currentItem.data_id + 'header-name',
                        body: currentItem.name,
                        heading: 'Name'
                    },
                    {
                        id: currentItem.data_id + 'header-file-type',
                        body: currentItem.file_type,
                        heading: 'File Type'
                    },
                    {
                        id: currentItem.data_id + 'header-ext',
                        body: currentItem.ext,
                        heading: 'Extension'
                    }
                ]
            })
        }

        setData(lists)
    }

    const { isLoading, query } = useDashboardQuery({
        queryFn: () => dataApi.dataGet('get_all_data'),
        onSuccessful: onQuerySuccessful
    })

    const { query: downloadQuery } = useDashboardQuery({
        queryFn: (id) => fileApi.fileGet('get_file_by_id', id),
        onSuccessful: (res) => {
            // Add download file logic
            // Add a logic to remove id from loading
        }
    })

    const handleDownloadClick = (id: string) => {
        // Add a logic to add id to loading.
        downloadQuery(id)
    }

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
                    msgIfListIsEmpty={MsgIfListEmpty}
                >
                    {data.map((item, idx) => {
                        return (
                            <AccordionList
                                key={item.id}
                                isFirstItem={idx === 0}
                                isLastItem={idx + 1 === data.length}
                            >
                                <AccordionList.Header>
                                    {item.headerItems.map((header) => {
                                        return (
                                            <AccordionList.HeaderChild
                                                key={header.id}
                                                data={header}
                                            />
                                        )
                                    })}
                                </AccordionList.Header>
                                <AccordionList.Body
                                    content={item.bodyItem.content}
                                >
                                    <AccordionList.ActionButton
                                        color="primary"
                                        isLoading={
                                            actionsLoading[item.file_id]
                                                ?.download
                                        }
                                        onClick={() => {
                                            handleDownloadClick(item.file_id)
                                            setActionsLoading(
                                                item.file_id,
                                                'download',
                                                true
                                            )
                                        }}
                                        Icon={<DownloadIcon />}
                                    >
                                        Download
                                    </AccordionList.ActionButton>
                                </AccordionList.Body>
                            </AccordionList>
                        )
                    })}
                </AccordionListContainer>
            </DashboardErrorBoundary>
        </Box>
    )
}
