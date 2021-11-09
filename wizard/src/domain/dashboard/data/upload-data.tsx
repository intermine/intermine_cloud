import { useHistory } from 'react-router-dom'
import { Box } from '@intermine/chromatin/box'

import { DASHBOARD_DATA_LANDING_PATH } from '../../../routes'
import { WorkspaceHeading } from '../common/workspace-heading'

export const UploadData = () => {
    const history = useHistory()

    return (
        <Box>
            <WorkspaceHeading
                heading={{ variant: 'h2', children: 'Upload New Data' }}
                backAction={{
                    onClick: () => {
                        history.push(DASHBOARD_DATA_LANDING_PATH)
                    }
                }}
            />
        </Box>
    )
}
