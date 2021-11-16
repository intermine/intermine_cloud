import { Divider } from '@intermine/chromatin'
import { Box, BoxBaseProps } from '@intermine/chromatin/box'
import { Typography } from '@intermine/chromatin/typography'
import { IconButton } from '@intermine/chromatin/icon-button'
import CloseIcon from '@intermine/chromatin/icons/System/close-line'

import { useStore } from '../../../context'
import { AdditionalSidebarTabs } from '../../../constants/additional-sidebar'

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
    const store = useStore()
    const {
        additionalSidebarReducer: { updateState }
    } = store

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
                    onClick={() =>
                        updateState({
                            isOpen: false,
                            activeTab: AdditionalSidebarTabs.None
                        })
                    }
                />
            </Box>
            <Divider />
            {children}
        </Box>
    )
}

ActionSection.Content = ActionSectionContent

export { ActionSection }
