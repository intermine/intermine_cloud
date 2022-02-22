import { Box } from '@intermine/chromatin/box'
import { Typography } from '@intermine/chromatin/typography'

export type TStateTagProps = {
    status: 'error' | 'success' | 'warning'
    statusText: string
}

export const StatusTag = (props: TStateTagProps) => {
    const { status, statusText } = props

    return (
        <Box csx={{ root: { display: 'flex', alignItems: 'center' } }}>
            <Box
                csx={{
                    root: ({ spacing, palette }) => ({
                        height: '0.5rem',
                        width: '0.5rem',
                        borderRadius: '50%',
                        marginRight: spacing(2),
                        background: palette[status].main
                    })
                }}
            />
            <Typography>{statusText}</Typography>
        </Box>
    )
}
