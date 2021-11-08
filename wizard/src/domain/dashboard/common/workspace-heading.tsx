import { Box } from '@intermine/chromatin/box'
import { Typography } from '@intermine/chromatin/typography'
import { Button, ButtonCommonProps } from '@intermine/chromatin/button'

export type TWorkspaceHeadingProps = {
    heading: string
    primaryAction?: ButtonCommonProps
}

export const WorkspaceHeading = (props: TWorkspaceHeadingProps) => {
    const { heading, primaryAction } = props

    return (
        <Box
            csx={{
                root: {
                    alignItems: 'center',
                    display: 'flex',
                    justifyContent: 'space-between',
                    paddingRight: '0.25rem'
                }
            }}
        >
            <Typography variant="h1">{heading}</Typography>
            {primaryAction && (
                <Button color="primary" isDense {...primaryAction} />
            )}
        </Box>
    )
}
