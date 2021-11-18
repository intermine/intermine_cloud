import { Box } from '@intermine/chromatin/box'
import { Typography } from '@intermine/chromatin/typography'
import { Label } from '@intermine/chromatin/label'
import { InputBase } from '@intermine/chromatin/input-base'
import UploadIcon from '@intermine/chromatin/icons/System/upload-cloud-2-line'
import { createStyle } from '@intermine/chromatin/styles'

export type TUploadBoxProps = {
    isDisabled?: boolean
    onInputChange: (event: React.FormEvent<HTMLInputElement>) => void
}

type TUseStyleProps = {
    isDisabled: boolean
}

const useBoxStyles = createStyle((theme) => {
    const {
        palette: { neutral, info, themeType, disable },
        spacing
    } = theme
    return {
        uploadBox: (props: TUseStyleProps) => ({
            border: '5px dashed ' + neutral[themeType === 'dark' ? 20 : 10],
            borderRadius: '0.5rem',
            height: '8rem',
            margin: spacing(10, 0),
            maxWidth: '25rem',
            width: '100%',
            ...(props.isDisabled && {
                background: disable.main,
                pointerEvents: 'none'
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

export const UploadBox = (props: TUploadBoxProps) => {
    const { isDisabled, onInputChange } = props

    const classes = useBoxStyles()

    return (
        <Box className={classes.uploadBox}>
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
