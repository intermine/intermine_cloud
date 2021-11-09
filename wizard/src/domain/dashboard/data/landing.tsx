import { useHistory } from 'react-router-dom'
import { Box } from '@intermine/chromatin/box'
import { WorkspaceHeading } from '../common/workspace-heading'
import UploadIcon from '@intermine/chromatin/icons/System/upload-line'

import { DASHBOARD_DATA_UPLOAD_DATA_PATH } from '../../../routes'

export const Landing = () => {
    const history = useHistory()

    const handleUploadClick = () => {
        history.push(DASHBOARD_DATA_UPLOAD_DATA_PATH)
    }

    return (
        <Box>
            <WorkspaceHeading
                heading={{ children: 'Data' }}
                primaryAction={{
                    children: 'Upload New Data',
                    RightIcon: <UploadIcon />,
                    onClick: handleUploadClick
                }}
            />
        </Box>
    )
}
