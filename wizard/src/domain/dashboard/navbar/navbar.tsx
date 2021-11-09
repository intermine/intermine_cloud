import { createStyle } from '@intermine/chromatin/styles'
import { Box } from '@intermine/chromatin/box'

import { DomElementIDs } from '../../../constants/ids'
import { Logo } from '../../../components/logo'

const useStyles = createStyle(() => {
    return {
        root: {
            alignItems: 'center',
            display: 'flex',
            justifyContent: 'space-between',
            padding: '2rem'
        }
    }
})

export const Navbar = () => {
    const classes = useStyles()

    return (
        <Box id={DomElementIDs.Navbar} className={classes.root}>
            <Logo />
        </Box>
    )
}
