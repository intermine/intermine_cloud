import { useState } from 'react'
import { Box } from '@intermine/chromatin/box'
import { Typography } from '@intermine/chromatin/typography'
import { Label } from '@intermine/chromatin/label'
import { InputBase } from '@intermine/chromatin/input-base'
import UploadIcon from '@intermine/chromatin/icons/System/upload-cloud-2-line'
import { createStyle } from '@intermine/chromatin/styles'

import {
    getFileFromOnChangeEvent,
    getFileOnDropEvent
} from '../../utils/form-event'

export type TUploadBoxProps = {
    isError?: boolean
    isHidden?: boolean
    isDisabled?: boolean
    accept?: string
    onChange?: (file?: File) => void
}

type TUseStyleProps = {
    isDisabled: boolean
    isError: boolean
    isHidden: boolean
    dragEvent: {
        isDragOver: boolean
    }
}

const useBoxStyles = createStyle((theme) => {
    const {
        palette: { neutral, info, themeType, disable, grey, error },
        spacing
    } = theme

    return {
        uploadBox: (props: TUseStyleProps) => ({
            borderStyle: 'dashed',
            borderRadius: '0.25rem',
            borderWidth: '0.125rem',
            margin: spacing(3, 0),
            width: '100%',
            transition: '0.3s',
            borderColor: themeType === 'dark' ? neutral[20] : grey[50],
            ...(props.dragEvent.isDragOver && {
                transform: 'scale(1.1)',
                background: themeType === 'dark' ? neutral[10] : grey[20]
            }),
            ...(props.isDisabled && {
                background: disable.main,
                pointerEvents: 'none'
            }),
            ...(props.isError && {
                borderColor: error.main
            }),
            ...(props.isHidden && {
                borderWidth: 0,
                height: 0,
                margin: 0,
                opacity: 0
            })
        }),
        label: {
            alignItems: 'center',
            cursor: 'pointer',
            justifyContent: 'center',
            display: 'flex',
            height: '100%',
            textAlign: 'center',
            padding: spacing(5)
        },
        icon: (props: TUseStyleProps) => ({
            fill: info.main,
            marginRight: spacing(2),
            ...(props.isError && {
                fill: error.main
            })
        })
    }
})

const preventAndStopEvent = (event: React.DragEvent) => {
    event.preventDefault()
    event.stopPropagation()
}

export const UploadBox = (props: TUploadBoxProps) => {
    const {
        isDisabled = false,
        isError = false,
        isHidden = false,
        accept,
        onChange
    } = props

    const [dragEvent, setDragEvent] = useState({
        isDragOver: false
    })

    const onDragOver = (event: React.DragEvent) => {
        preventAndStopEvent(event)
        setDragEvent({ isDragOver: true })
    }

    const onDragLeave = (event: React.DragEvent) => {
        preventAndStopEvent(event)
        setDragEvent({ isDragOver: false })
    }

    const onDropHandler = (event: React.DragEvent) => {
        preventAndStopEvent(event)
        setDragEvent({ isDragOver: false })

        const _file = getFileOnDropEvent(event)
        if (typeof onChange === 'function') {
            onChange(_file)
        }
    }

    const onInputChange = (event: React.FormEvent<HTMLInputElement>) => {
        const _file = getFileFromOnChangeEvent(event)
        if (typeof onChange === 'function') {
            onChange(_file)
        }
    }

    const classes = useBoxStyles({ isDisabled, dragEvent, isError, isHidden })

    return (
        <Box
            className={classes.uploadBox}
            onDrag={preventAndStopEvent}
            onDragStart={preventAndStopEvent}
            onDragEnd={preventAndStopEvent}
            onDragLeave={onDragLeave}
            onDragOver={onDragOver}
            onDragEnter={preventAndStopEvent}
            onDrop={onDropHandler}
        >
            <Label className={classes.label}>
                <UploadIcon
                    className={classes.icon}
                    height="1.5rem"
                    width="1.5rem"
                />
                <Typography>
                    <Typography
                        Component="span"
                        color={isError ? 'error' : 'info'}
                    >
                        Drag and Drop&nbsp;
                    </Typography>
                    or&nbsp;
                    <Typography
                        Component="span"
                        color={isError ? 'error' : undefined}
                    >
                        browse a file
                    </Typography>
                </Typography>
                <InputBase
                    type="file"
                    accept={accept}
                    isHidden
                    isDisabled={isDisabled}
                    onChange={onInputChange}
                />
            </Label>
        </Box>
    )
}
