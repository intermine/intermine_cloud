import { Box } from '@intermine/chromatin'
import { useHistory } from 'react-router-dom'

import { useGlobalModalReducer } from '../../../../context'
import { DASHBOARD_MINES_LANDING_PATH } from '../../../../routes'
import { WorkspaceHeading } from '../../common/workspace-heading'
import { Form } from './form'

export const CreateMine = () => {
    const history = useHistory()
    const globalModalReducer = useGlobalModalReducer()
    const { updateGlobalModalProps, closeGlobalModal } = globalModalReducer

    const handleBackClick = () => {
        updateGlobalModalProps({
            isOpen: true,
            heading: 'Are you sure?',
            type: 'warning',
            children: 'All your work will be lost.',
            primaryAction: {
                onClick: () => {
                    closeGlobalModal()
                    history.push(DASHBOARD_MINES_LANDING_PATH)
                },
                children: 'Proceed'
            },
            secondaryAction: {
                onClick: closeGlobalModal,
                children: 'Cancel'
            }
        })
    }

    return (
        <Box>
            <WorkspaceHeading
                heading={{ variant: 'h2', children: 'Mines' }}
                backAction={{ onClick: handleBackClick }}
            />
            <Form />
        </Box>
    )
}
