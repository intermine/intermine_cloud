import { Box } from '@intermine/chromatin/box'
import {
    Typography,
    TypographyBaseProps
} from '@intermine/chromatin/typography'

type TUploadHeadingProps = {
    heading?: TypographyBaseProps
    sub?: TypographyBaseProps
}

export const UploadHeading = (props: TUploadHeadingProps) => {
    const { heading, sub } = props

    return (
        <Box isContentCenter csx={{ root: { flexDirection: 'column' } }}>
            <Typography variant="h4" {...heading} />
            <Typography variant="bodySm" color="neutral.30" {...sub} />
        </Box>
    )
}
