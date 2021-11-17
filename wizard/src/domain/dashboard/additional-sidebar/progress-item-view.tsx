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
import { getDataSize } from '../../../utils/get'
import { ProgressItemUploadStatus } from '../../../constants/progress'

type TProgressItemViewProps = TProgressItem & {
    onCancelUpload: (id: string) => void
    onRemoveClick: (id: string) => void
    onRetryClick: (id: string) => void
}

type TUseStyleProps = {
    uploadPercentage: string
}

const { Completed, Running, Canceled, Failed } = ProgressItemUploadStatus

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
            width: props.uploadPercentage,
            transition: '0.3s'
        }),
        textContainer: {
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
        file,
        loadedSize,
        totalSize,
        id,
        status,
        onCancelUpload,
        onRemoveClick,
        onRetryClick
    } = props

    const getPrimaryAction = (): JSX.Element => {
        if (status === Running) {
            return (
                <Tooltip
                    {...defaultTooltipProps}
                    message="Cancel upload"
                    key="cancel"
                    color="error"
                >
                    <IconButton
                        color="error"
                        size="small"
                        isDense
                        Icon={<CancelIcon />}
                        onClick={() => onCancelUpload(id)}
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
                    onClick={() => onRemoveClick(id)}
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
                    message="Retry upload"
                >
                    <IconButton
                        color="secondary"
                        size="small"
                        isDense
                        Icon={<RetryIcon />}
                        onClick={() => onRetryClick(id)}
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
                color: 'primary'
            }
        }

        return {
            children: 'Progress',
            color: 'info'
        }
    }

    const uploadPercentage = ((100 * loadedSize) / totalSize).toFixed(1) + '%'
    const classes = useStyle({ uploadPercentage })

    return (
        <Box className={classes.root}>
            <Box className={classes.textContainer}>
                <Typography isTruncateText variant="bodySm">
                    {file.name}
                </Typography>

                {getSecondaryAction()}
                {getPrimaryAction()}
            </Box>
            <Box className={classes.textContainer}>
                <Typography isTruncateText variant="small" color="neutral.30">
                    {getDataSize(loadedSize)} / {getDataSize(totalSize)}
                </Typography>

                <Typography Component="span" variant="small" color="neutral.30">
                    {uploadPercentage}
                </Typography>
            </Box>
            {status !== Running && (
                <Typography variant="caption" {...getStatusTextProps()} />
            )}
            {status === Running && (
                <Box className={classes.progressContainer}>
                    <Box className={classes.progressIndicator}></Box>
                </Box>
            )}
        </Box>
    )
}
