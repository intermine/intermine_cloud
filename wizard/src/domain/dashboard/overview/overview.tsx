import { useContext } from 'react'
import { Box } from '@intermine/chromatin/box'

import { AppContext } from '../../../context'
import { WorkspaceHeading } from '../common/workspace-heading'

export const Overview = () => {
    const store = useContext(AppContext)

    const {} = store

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
