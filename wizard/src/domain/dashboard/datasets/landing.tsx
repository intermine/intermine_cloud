import { useState, useEffect } from 'react'
import { useHistory } from 'react-router-dom'
import { Box } from '@intermine/chromatin/box'
import { WorkspaceHeading } from '../common/workspace-heading'
import UploadIcon from '@intermine/chromatin/icons/System/upload-line'

import { DASHBOARD_UPLOAD_DATASET_PATH } from '../../../routes'

import { DashboardErrorBoundary } from '../common/error-boundary'
import { LandingPageList } from '../common/landing-page-list'
import { d } from './test-data'

export const Landing = () => {
    const history = useHistory()
    const [isLoadingData, setIsLoadingData] = useState(true)

    const handleUploadClick = () => {
        history.push(DASHBOARD_UPLOAD_DATASET_PATH)
    }

    useEffect(() => {
        setTimeout(() => setIsLoadingData(false), 5000)
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
                <LandingPageList data={d} />
            </DashboardErrorBoundary>
        </Box>
    )
}
