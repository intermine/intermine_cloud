import { Divider } from '@intermine/chromatin'
import { Box, BoxBaseProps } from '@intermine/chromatin/box'
import { Typography } from '@intermine/chromatin/typography'
import { IconButton } from '@intermine/chromatin/icon-button'
import CloseIcon from '@intermine/chromatin/icons/System/close-line'

import { additionalSidebarActions, useStoreDispatch } from '../../../store'
import { AdditionalSidebarTabs } from '../../../shared/constants'

export type TActionSectionProps = {
    heading: string
    children: React.ReactChild | React.ReactChild[]
    isActive?: boolean
}

const ActionSectionContent = (props: BoxBaseProps) => {
    return (
        <Box
            csx={{ root: ({ spacing }) => ({ padding: spacing(4, 0) }) }}
            {...props}
        />
    )
}

const ActionSection = (props: TActionSectionProps) => {
    const { heading, children, isActive } = props
    const storeDispatch = useStoreDispatch()

    const closeAdditionalSidebar = () => {
        storeDispatch(
            additionalSidebarActions.updateAdditionalSidebar({
                isOpen: false,
                activeTab: AdditionalSidebarTabs.None
            })
        )
    }
    return (
        <Box
            csx={{
                root: ({ spacing }) => ({
                    display: isActive ? 'block' : 'none',
                    padding: spacing(5, 3, 5, 0)
                })
            }}
        >
            <Box
                csx={{
                    root: {
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }
                }}
            >
                <Typography variant="title">{heading}</Typography>
                <IconButton
                    Icon={<CloseIcon />}
                    color="error"
                    isDense
                    onClick={closeAdditionalSidebar}
                />
            </Box>
            <Divider />
            {children}
        </Box>
    )
}

ActionSection.Content = ActionSectionContent

export { ActionSection }
