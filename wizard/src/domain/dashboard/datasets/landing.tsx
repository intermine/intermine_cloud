import { useEffect, useState } from 'react'
import { useHistory } from 'react-router-dom'
import { Box } from '@intermine/chromatin/box'
import { WorkspaceHeading } from '../common/workspace-heading'
import UploadIcon from '@intermine/chromatin/icons/System/upload-line'

import { AxiosResponse } from 'axios'

import { DASHBOARD_UPLOAD_DATASET_PATH } from '../../../routes'

import { DashboardErrorBoundary } from '../common/error-boundary'
import { LandingPageList } from '../common/landing-page-list'
import { dataApi } from '../../../services/api'
import { useDashboardQuery } from '../common/use-dashboard-query'

import { TDatasetResponseData } from './types'
import { TLandingPageListProps } from '../common/landing-page-list/types'

const emptyListMsg = (
    <Box>
        You haven't uploaded any dataset yet!
        <br />
        Use the 'Upload New Dataset' button to upload.
    </Box>
)

export const Landing = () => {
    const history = useHistory()
    const [data, setData] = useState<TLandingPageListProps['data']>([])

    const handleUploadClick = () => {
        history.push(DASHBOARD_UPLOAD_DATASET_PATH)
    }

    const onQuerySuccessful = (
        response: AxiosResponse<TDatasetResponseData>
    ) => {
        const lists: TLandingPageListProps['data'] = []

        for (let i = 0; i < response.data.items.length; i += 1) {
            const currentItem = response.data.items[i]
            lists.push({
                id: currentItem.data_id,
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
                <LandingPageList
                    isLoading={isLoading}
                    emptyListMsg={emptyListMsg}
                    data={data}
                />
            </DashboardErrorBoundary>
        </Box>
    )
}
