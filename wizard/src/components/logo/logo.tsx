import { Typography } from '@intermine/chromatin/typography'
import { Box, BoxBaseProps } from '@intermine/chromatin/box'
import { createStyle } from '@intermine/chromatin/styles'

import IntermineLogo from '../../../public/assets/img/logo-light.svg'

export type TLogoProps = {
    /**
     * @default '1.5rem'
     */
    height?: string
    /**
     * Space between logo and text.
     * @default 4
     */
    spacing?: number
    hasText?: boolean
    className?: string
    csx?: BoxBaseProps['csx']
}

const useStyles = createStyle((theme) => {
    const { spacing } = theme

    return {
        logo: (props: TLogoProps) => ({
            height: props.height ?? '1.5rem',
            marginRight: spacing(2)
        })
    }
})

export const Logo = (props: TLogoProps) => {
    const {
        height = '1.5rem',
        spacing = 4,
        csx = {},
        hasText = true,
        className
    } = props

    const classes = useStyles({ height, spacing })

    return (
        <Box isContentAlignCenter csx={csx} className={className}>
            <img
                className={classes.logo}
                src={IntermineLogo}
                alt="intermine's logo"
            />
            {hasText && <Typography variant="h3">Intermine Cloud</Typography>}
        </Box>
    )
}
