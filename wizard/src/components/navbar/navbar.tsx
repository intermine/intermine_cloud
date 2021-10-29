import { createStyle } from '@intermine/chromatin/styles'
import { Box } from '@intermine/chromatin/box'
import { Typography } from '@intermine/chromatin/typography'

import InterMineLogo from '../../../public/assets/img/intermine-logo.webp'
import { NavbarItems } from './navbar-items'

const useStyles = createStyle((theme) => {
    const {
        themeType,
        spacing,
        palette: {
            darkGrey,
            neutral,
            common: { white }
        },
        elevation,
        breakingPoints: { mixin }
    } = theme

    return {
        root: {
            alignItems: 'center',
            background: themeType === 'dark' ? darkGrey[20] : white,
            boxShadow: elevation.low,
            display: 'flex',
            justifyContent: 'space-between',
            padding: '1rem 2rem',
            ...mixin(
                {
                    sm: {
                        boxShadow: `inset 0 -1px ${neutral[10]}`
                    }
                },
                'max'
            )
        },

        logo: {
            height: '2rem'
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
                    variant="h3"
                    Component="span"
                >
                    Intermine Cloud
                </Typography>
            </Box>
            <Box isContentAlignCenter>
                <NavbarItems />
            </Box>
        </Box>
    )
}
