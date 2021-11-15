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

import { DomElementIDs } from '../../../constants/ids'

export type TWorkspaceHeadingProps = {
    heading: TypographyBaseProps
    subHeading?: TypographyBaseProps
    primaryAction?: ButtonCommonProps
    backAction?: IconButtonCommonProps
}

export const WorkspaceHeading = (props: TWorkspaceHeadingProps) => {
    const { heading, primaryAction, backAction, subHeading } = props

    return (
        <Box
            id={DomElementIDs.WorkspaceHeadingContainer}
            csx={{
                root: ({ spacing }) => ({
                    alignItems: 'center',
                    display: 'flex',
                    height: '3.5rem',
                    justifyContent: 'space-between',
                    marginBottom: spacing(10),
                    paddingRight: spacing(1)
                })
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
                <Box
                    csx={{ root: { display: 'flex', flexDirection: 'column' } }}
                >
                    <Typography variant="h1" {...heading} />
                    {subHeading && (
                        <Typography
                            variant="bodySm"
                            color="neutral.30"
                            {...subHeading}
                        />
                    )}
                </Box>
            </Box>
            {primaryAction && (
                <Button
                    variant="outlined"
                    color="primary"
                    isDense
                    {...primaryAction}
                />
            )}
        </Box>
    )
}
