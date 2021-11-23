import { createStyle } from '@intermine/chromatin/styles'
import { Box } from '@intermine/chromatin/box'
import { Typography } from '@intermine/chromatin/typography'
import { Collapsible } from '@intermine/chromatin/collapsible'
import { getDataSize } from '../../../../utils/get'

export type TUploadBoxFileInfoProps = {
    file?: File
}

const useFileInfoStyles = createStyle((theme) => {
    const { spacing } = theme
    return {
        filePropContainer: {
            marginBottom: spacing(4)
        }
    }
})

export const UploadFileInfo = (props: TUploadBoxFileInfoProps) => {
    const { file } = props

    const classes = useFileInfoStyles()

    return (
        <Collapsible in={Boolean(file)} className={classes.filePropContainer}>
            <Box display="flex">
                <Typography variant="title" Component="span">
                    File:&nbsp;
                </Typography>
                <Typography isTruncateText>{file?.name}</Typography>
            </Box>
            <Box display="flex">
                <Typography variant="title" Component="span">
                    Size:&nbsp;
                </Typography>
                <Typography variant="body" isTruncateText>
                    {file && getDataSize(file.size)}
                </Typography>
            </Box>
        </Collapsible>
    )
}
