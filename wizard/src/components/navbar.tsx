import { createStyle } from '@intermine/chromatin/styles'
import { Box } from '@intermine/chromatin/box'
import { Typography } from '@intermine/chromatin/typography'

import InterMineLogo from '../../public/assets/img/intermine-logo.webp'
import { NavbarItems } from './navbar-items'

const useStyles = createStyle((theme) => {
    const {
        themeType,
        spacing,
        palette: {
            neutral,
            common: { white }
        },
        elevation
    } = theme

    return {
        root: {
            alignItems: 'center',
            background: themeType === 'dark' ? neutral[30] : white,
            boxShadow: elevation.low,
            display: 'flex',
            justifyContent: 'space-between',
            padding: '1rem 2rem'
        },

        logo: {
            height: '3rem',
            filter: `brightness(${themeType === 'dark' ? 10 : 0})`
        },

        logoText: {
            marginLeft: spacing(4)
        }
    }
})

export const Navbar = () => {
    const classes = useStyles()

    return (
        <Box className={classes.root}>
            <Box isContentAlignCenter>
                <img
                    className={classes.logo}
                    src={InterMineLogo}
                    alt="intermine's logo"
                />
                <Typography
                    className={classes.logoText}
                    variant="h1"
                    Component="span"
                >
                    Wizard
                </Typography>
            </Box>
            <Box isContentAlignCenter>
                <NavbarItems />
            </Box>
        </Box>
    )
}
