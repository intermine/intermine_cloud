import { Divider } from '@intermine/chromatin'
import { Box, BoxBaseProps } from '@intermine/chromatin/box'
import { Typography } from '@intermine/chromatin/typography'
import { IconButton } from '@intermine/chromatin/icon-button'
import CloseIcon from '@intermine/chromatin/icons/System/close-line'

import { updateAdditionalSidebar, useStoreDispatch } from '../../../store'
import { AdditionalSidebarTabs } from '../../../shared/constants'

import { ChromatinIcon } from '@intermine/chromatin/icons/types'

export type TActionSectionProps = {
    heading: string
    children: React.ReactNode
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

export type TActionSectionLabelProps = {
    Icon: (props: ChromatinIcon) => JSX.Element
    labelText: string
}

const ActionSectionLabel = (props: TActionSectionLabelProps) => {
    const { Icon, labelText } = props

    return (
        <Box isContentCenter>
            <Icon
                height="1rem"
                width="1rem"
                csx={{
                    root: ({ spacing, palette }) => ({
                        marginRight: spacing(2),
                        fill: palette.neutral.main
                    })
                }}
            />
            {labelText}
        </Box>
    )
}

const ActionSection = (props: TActionSectionProps) => {
    const { heading, children, isActive } = props
    const storeDispatch = useStoreDispatch()

    const closeAdditionalSidebar = () => {
        storeDispatch(
            updateAdditionalSidebar({
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
ActionSection.Label = ActionSectionLabel

export { ActionSection }
