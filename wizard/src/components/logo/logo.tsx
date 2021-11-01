import { Typography } from '@intermine/chromatin'
import { Box, BoxBaseProps } from '@intermine/chromatin/box'
import { createStyle } from '@intermine/chromatin/styles'

import IntermineLogo from '../../../public/assets/img/logo.png'

export type LogoProps = {
    /**
     * @default '2rem'
     */
    height?: string
    /**
     * Space between logo and text.
     * @default 4
     */
    spacing?: number
    csx?: BoxBaseProps['csx']
}

const useStyles = createStyle((theme) => {
    const { spacing } = theme

    return {
        logo: (props: LogoProps) => ({
            height: props.height ?? '2rem',
            marginRight: spacing(2)
        })
    }
})

export const Logo = (props: LogoProps) => {
    const { height = '2rem', spacing = 4, csx = {} } = props

    const classes = useStyles({ height, spacing })

    return (
        <Box isContentAlignCenter csx={csx}>
            <img
                className={classes.logo}
                src={IntermineLogo}
                alt="intermine's logo"
            />
            <Typography variant="h3">Intermine Cloud</Typography>
        </Box>
    )
}
