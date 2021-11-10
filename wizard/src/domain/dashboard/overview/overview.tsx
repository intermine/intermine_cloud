import { useContext } from 'react'
import { Box } from '@intermine/chromatin/box'
import { Button } from '@intermine/chromatin/button'
import { useHistory } from 'react-router-dom'

import { AppContext } from '../../../context'

export const Overview = () => {
    const store = useContext(AppContext)
    const history = useHistory()

    const {
        sidebarReducer: {
            onSidebarItemClick,
            updateSidebarState,
            state,
            removeOnSidebarItemClick
        },
        globalModalReducer: { updateGlobalModalProps, closeGlobalModal }
    } = store

    const openModal = (to: string) => {
        updateGlobalModalProps({
            children: 'You will lose all your work.',
            heading: 'Are you sure?',
            isOpen: true,
            type: 'warning',
            primaryAction: {
                children: 'Proceed',
                onClick: () => {
                    history.push(to)
                    closeGlobalModal()
                }
            },
            secondaryAction: {
                children: 'Cancel',
                onClick: closeGlobalModal
            }
        })
    }

    return (
        <Box>
            Overview Page
            <Button
                onClick={() => {
                    updateSidebarState({
                        isPageSwitchingAllowed: !state.isPageSwitchingAllowed
                    })
                    removeOnSidebarItemClick()
                }}
            >
                Toggle page changeState
            </Button>
            <Button onClick={() => onSidebarItemClick((to) => openModal(to))}>
                Update onSidebar click
            </Button>
            {/* <Button onClick={openModal}>Open Modal</Button> */}
            Page Change:{' '}
            {state.isPageSwitchingAllowed ? 'Allowed' : 'Not Allowed'}
        </Box>
    )
}
