import { Box } from '@intermine/chromatin/box'

import { WorkspaceHeading } from '../common/workspace-heading'

export const Overview = () => {
    return (
        <Box>
            <WorkspaceHeading
                heading={{ children: 'Hey, Ank!' }}
                subHeading={{
                    children: 'Welcome back, nice to see you again.'
                }}
            />
        </Box>
    )
}
