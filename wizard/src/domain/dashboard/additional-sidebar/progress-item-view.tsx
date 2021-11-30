import {
    Typography,
    TypographyBaseProps
} from '@intermine/chromatin/typography'
import { IconButton } from '@intermine/chromatin/icon-button'
import { Tooltip, TooltipProps } from '@intermine/chromatin/tooltip'
import { Box } from '@intermine/chromatin/box'
import { createStyle } from '@intermine/chromatin/styles'

import RemoveIcon from '@intermine/chromatin/icons/System/close-line'
import CancelIcon from '@intermine/chromatin/icons/System/delete-bin-6-line'
import RetryIcon from '@intermine/chromatin/icons/System/arrow-go-forward-line'

import { TProgressItem } from '../../../context/types'
import { ProgressItemStatus } from '../../../constants/progress'
import { Button } from '@intermine/chromatin'
import { Link } from 'react-router-dom'

type TProgressItemViewProps = TProgressItem & {
    onRemoveItem: (id: string) => void
}

type TUseStyleProps = {
    progressPercentage: string
}

const { Completed, Running, Canceled, Failed } = ProgressItemStatus

const useStyle = createStyle((theme) => {
    const {
        spacing,
        palette: { themeType, grey, darkGrey, primary }
    } = theme

    return {
        root: {
            marginBottom: spacing(6)
        },
        progressContainer: {
            background: themeType === 'dark' ? darkGrey[40] : grey[20],
            borderRadius: '1rem',
            height: '0.25rem',
            marginBottom: spacing(2),
            overflow: 'hidden',
            width: '100%'
        },
        progressIndicator: (props: TUseStyleProps) => ({
            background: primary.main,
            height: '100%',
            width: props.progressPercentage,
            transition: '0.3s'
        }),
        rowContainer: {
            alignItems: 'center',
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: spacing(1),
            width: '100%'
        }
    }
})

const defaultTooltipProps: Omit<TooltipProps, 'children'> = {
    csx: {
        root: {
            padding: '0.25rem 0.5rem'
        },
        message: ({
            typography,
            themeType,
            palette: {
                common: { white, black }
            }
        }) => ({
            ...typography.bodySm,
            color: themeType === 'dark' ? black : white
        })
    },
    placement: 'top-start'
}

export const ProgressItemView = (props: TProgressItemViewProps) => {
    const {
        name,
        loadedSize,
        totalSize,
        id,
        status,
        onCancel = () => false,
        onRetry = () => false,
        onRemoveItem = () => false,
        getProgressText,
        getOnSuccessViewButtonProps,
        getRunningStatusText = () => ''
    } = props

    const getPrimaryAction = (): JSX.Element => {
        if (status === Running) {
            return (
                <Tooltip
                    {...defaultTooltipProps}
                    message="Cancel"
                    key="cancel"
                    color="error"
                >
                    <IconButton
                        color="error"
                        size="small"
                        isDense
                        Icon={<CancelIcon />}
                        onClick={() => onCancel()}
                    />
                </Tooltip>
            )
        }

        return (
            <Tooltip
                {...defaultTooltipProps}
                color="info"
                message="Remove"
                key="remove"
            >
                <IconButton
                    color="info"
                    size="small"
                    isDense
                    Icon={<RemoveIcon />}
                    onClick={() => onRemoveItem(id)}
                />
            </Tooltip>
        )
    }

    const getSecondaryAction = () => {
        if (status === Canceled || status === Failed) {
            return (
                <Tooltip
                    {...defaultTooltipProps}
                    color="secondary"
                    message="Retry"
                >
                    <IconButton
                        color="secondary"
                        size="small"
                        isDense
                        Icon={<RetryIcon />}
                        onClick={() => onRetry()}
                    />
                </Tooltip>
            )
        }
        return <></>
    }

    const getStatusTextProps = (): TypographyBaseProps => {
        if (status === Canceled) {
            return {
                children: 'Canceled',
                color: 'error'
            }
        }

        if (status === Failed) {
            return {
                children: 'Failed',
                color: 'warning'
            }
        }

        if (status === Completed) {
            return {
                children: 'Completed',
                color: 'info'
            }
        }

        return {
            children: getRunningStatusText(loadedSize, totalSize),
            color: 'neutral.30',
            variant: 'bodySm'
        }
    }

    const getViewButton = () => {
        if (
            status !== Completed ||
            typeof getOnSuccessViewButtonProps !== 'function'
        )
            return <></>
        const { title, to, target } = getOnSuccessViewButtonProps()

        return (
            <Button
                variant="ghost"
                color="primary"
                size="small"
                isDense
                Component={Link}
                to={to}
                target={target}
                csx={{ root: { padding: '0.25rem 0' } }}
            >
                {title}
            </Button>
        )
    }

    const progressPercentage = ((100 * loadedSize) / totalSize).toFixed(1) + '%'
    const classes = useStyle({ progressPercentage })

    return (
        <Box className={classes.root}>
            <Box className={classes.rowContainer}>
                <Typography isTruncateText variant="bodySm">
                    {name}
                </Typography>

                {getSecondaryAction()}
                {getPrimaryAction()}
            </Box>
            <Box className={classes.rowContainer}>
                <Typography isTruncateText variant="bodySm" color="neutral.30">
                    {getProgressText(loadedSize, totalSize)}
                </Typography>

                <Typography
                    Component="span"
                    variant="bodySm"
                    color="neutral.30"
                >
                    {progressPercentage}
                </Typography>
            </Box>
            {status === Running && (
                <Box className={classes.progressContainer}>
                    <Box className={classes.progressIndicator}></Box>
                </Box>
            )}
            <Box className={classes.rowContainer}>
                <Typography variant="caption" {...getStatusTextProps()} />
                {getViewButton()}
            </Box>
        </Box>
    )
}
