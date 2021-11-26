import { Box } from '@intermine/chromatin/box'
import { Typography } from '@intermine/chromatin/typography'
import { Label } from '@intermine/chromatin/label'
import { InputBase } from '@intermine/chromatin/input-base'
import UploadIcon from '@intermine/chromatin/icons/System/upload-cloud-2-line'
import { createStyle } from '@intermine/chromatin/styles'
import { useState } from 'react'

export type TUploadBoxProps = {
    isError?: boolean
    isDisabled?: boolean
    onInputChange: (event: React.FormEvent<HTMLInputElement>) => void
    onDropHandler: (event: React.DragEvent) => void
}

type TUseStyleProps = {
    isDisabled: boolean
    isError: boolean
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
            border:
                '5px dashed ' + (themeType === 'dark' ? neutral[20] : grey[50]),
            borderRadius: '0.5rem',
            height: '8rem',
            margin: spacing(3, 0),
            width: '100%',
            transition: '0.3s',
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
            })
        }),
        label: {
            alignItems: 'center',
            cursor: 'pointer',
            justifyContent: 'center',
            display: 'flex',
            height: '100%',
            textAlign: 'center',
            padding: spacing(5),
            fill: info.main
        },
        icon: {
            fill: info.main,
            marginRight: spacing(2)
        }
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
        onInputChange,
        onDropHandler: _onDropHandler
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
        _onDropHandler(event)
    }

    const classes = useBoxStyles({ isDisabled, dragEvent, isError })

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
                    <Typography Component="span" color="info">
                        Drag and Drop&nbsp;
                    </Typography>
                    or browse file
                </Typography>
                <InputBase
                    type="file"
                    isHidden
                    onChange={onInputChange}
                    isDisabled={isDisabled}
                />
            </Label>
        </Box>
    )
}
