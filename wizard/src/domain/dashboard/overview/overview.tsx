import { Box } from '@intermine/chromatin/box'
import { useEffect } from 'react'
import { ResponseStatus } from '../../../constants/response'
import {
    useStoreSelector,
    authSelector,
    authActions,
    useStoreDispatch
} from '../../../store'
import { getCurrentUserDetails } from '../../../services/utils'

import { WorkspaceHeading } from '../common/workspace-heading'

export const Overview = () => {
    const { userDetails } = useStoreSelector(authSelector)
    const storeDispatch = useStoreDispatch()

    const fetchUserDetails = async () => {
        const response = await getCurrentUserDetails()

        if (response.status === ResponseStatus.Ok) {
            storeDispatch(authActions.updateUserDetails(response))
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
