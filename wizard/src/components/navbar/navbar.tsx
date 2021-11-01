import { createStyle } from '@intermine/chromatin/styles'
import { Box } from '@intermine/chromatin/box'

import { DomElementIDs } from '../../constants/ids'
import { NavbarItems } from './navbar-items'
import { Logo } from '../logo'

const useStyles = createStyle((theme) => {
    const {
        themeType,

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
        }
    }
})

export const Navbar = () => {
    const classes = useStyles()

    return (
        <Box id={DomElementIDs.Navbar} className={classes.root}>
            <Logo />
            <Box isContentAlignCenter>
                <NavbarItems />
            </Box>
        </Box>
    )
}
