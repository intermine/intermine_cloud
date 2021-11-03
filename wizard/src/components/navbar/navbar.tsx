import { createStyle } from '@intermine/chromatin/styles'
import { Box } from '@intermine/chromatin/box'

import { DomElementIDs } from '../../constants/ids'
import { NavbarItems } from './navbar-items'
import { Logo } from '../logo'

const useStyles = createStyle((theme) => {
    const {
        palette: { neutral },
        breakingPoints: { mixin }
    } = theme

    return {
        root: {
            alignItems: 'center',
            display: 'flex',
            justifyContent: 'space-between',
            left: 0,
            padding: '1rem 2rem',
            position: 'fixed',
            right: 0,
            top: 0,
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
