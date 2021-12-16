import { Box } from '@intermine/chromatin/box'
import { useEffect } from 'react'
import { ResponseStatus } from '../../../constants/response'
import { useAuthReducer } from '../../../context'
import { getCurrentUserDetails } from '../../../services/utils'

import { WorkspaceHeading } from '../common/workspace-heading'

export const Overview = () => {
    const {
        updateUserDetails,
        state: { userDetails }
    } = useAuthReducer()

    const fetchUserDetails = async () => {
        const response = await getCurrentUserDetails()

        if (response.status === ResponseStatus.Ok) {
            updateUserDetails({
                name: response.name,
                email: response.email,
                organisation: response.organisation
            })
        }
        // If we want to show error if we fail to load user details
        // then we can add code for that here.
    }

    const getHeading = (): string => {
        if (typeof userDetails.name === 'string' && userDetails.name !== '') {
            return `Hey, ${userDetails.name}!`
        }
        return 'Hey!'
    }

    useEffect(() => {
        fetchUserDetails()
    }, [])

    return (
        <Box>
            <WorkspaceHeading
                heading={{ children: getHeading() }}
                subHeading={{
                    children: 'Welcome back, nice to see you again.'
                }}
            />
        </Box>
    )
}
