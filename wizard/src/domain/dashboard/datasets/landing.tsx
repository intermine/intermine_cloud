import { useEffect, useState } from 'react'
import { useHistory } from 'react-router-dom'
import { Box } from '@intermine/chromatin/box'
import { WorkspaceHeading } from '../common/workspace-heading'
import UploadIcon from '@intermine/chromatin/icons/System/upload-line'

import { AxiosResponse } from 'axios'

import { DASHBOARD_UPLOAD_DATASET_PATH } from '../../../routes'

import { DashboardErrorBoundary } from '../common/error-boundary'
import { dataApi } from '../../../services/api'
import { useDashboardQuery } from '../common/use-dashboard-query'

import { TDatasetResponseData } from './types'
import {
    AccordionListContainer,
    TAccordionListDatum,
} from '../common/accordion-list/accordion-list'

// eslint-disable-next-line max-len
import { LandingPageAccordionList } from '../common/accordion-list/landing-page-accordion-list'

const MsgIfListEmpty = (
    <Box>
        You haven't uploaded any dataset yet!
        <br />
        Use the 'Upload New Dataset' button to upload.
    </Box>
)

const MsgIfFailedToLoadList = <Box>Failed to load datasets.</Box>

export const Landing = () => {
    const history = useHistory()
    const [data, setData] = useState<TAccordionListDatum[]>([])
    const [isFailedToFetchData, setIsFailedToFetchData] = useState(false)

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
                        heading: 'Name',
                    },
                    {
                        id: currentItem.data_id + 'header-file-type',
                        body: currentItem.file_type,
                        heading: 'File Type',
                    },
                    {
                        id: currentItem.data_id + 'header-ext',
                        body: currentItem.ext,
                        heading: 'Extension',
                    },
                ],
            })
        }

        setData(lists)
    }

    const { isLoading, query } = useDashboardQuery({
        queryFn: () => dataApi.dataGet('get_all_data'),
        onSuccessful: onQuerySuccessful,
        onError: () => setIsFailedToFetchData(true),
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
                    onClick: handleUploadClick,
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
