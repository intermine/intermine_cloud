import { Divider } from '@intermine/chromatin'
import { Box } from '@intermine/chromatin/box'
import { Typography } from '@intermine/chromatin/typography'
import { IconButton } from '@intermine/chromatin/icon-button'
import CloseIcon from '@intermine/chromatin/icons/System/close-line'

export type TActionSectionProps = {
    heading: string
    children: React.ReactChild | React.ReactChild[]
}

export const ActionSection = (props: TActionSectionProps) => {
    const { heading, children } = props

    return (
        <Box
            csx={{
                root: ({ spacing }) => ({
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
                <IconButton Icon={<CloseIcon />} color="error" isDense />
            </Box>
            <Divider />
            {children}
        </Box>
    )
}
