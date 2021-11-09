import { Box } from '@intermine/chromatin/box'
import {
    Typography,
    TypographyBaseProps
} from '@intermine/chromatin/typography'
import { Button, ButtonCommonProps } from '@intermine/chromatin/button'
import {
    IconButton,
    IconButtonCommonProps
} from '@intermine/chromatin/icon-button'
import ArrowLeftIcon from '@intermine/chromatin/icons/System/arrow-left-s-line'

export type TWorkspaceHeadingProps = {
    heading: TypographyBaseProps
    primaryAction?: ButtonCommonProps
    backAction?: IconButtonCommonProps
}

export const WorkspaceHeading = (props: TWorkspaceHeadingProps) => {
    const { heading, primaryAction, backAction } = props

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
            <Box isContentAlignCenter>
                {backAction && (
                    <IconButton
                        Icon={<ArrowLeftIcon />}
                        csx={{
                            root: ({ spacing }) => ({ margin: spacing(2) })
                        }}
                        color="neutral"
                        size="large"
                        isDense
                        {...backAction}
                    />
                )}
                <Typography variant="h1" {...heading} />
            </Box>
            {primaryAction && (
                <Button color="primary" isDense {...primaryAction} />
            )}
        </Box>
    )
}
