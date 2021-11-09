import { Box } from '@intermine/chromatin/box'
import { WorkspaceHeading } from '../common/workspace-heading'

import UploadIcon from '@intermine/chromatin/icons/System/upload-line'

export const Data = () => {
    return (
        <Box>
            <WorkspaceHeading
                heading="Data"
                primaryAction={{
                    children: 'Upload New Data',
                    RightIcon: <UploadIcon />
                }}
            />
        </Box>
    )
}
