import { useContext, useRef, useState } from 'react'
import { createStyle } from '@intermine/chromatin/styles'
import { Box } from '@intermine/chromatin/box'
import { Toggle } from '@intermine/chromatin/toggle'
import { Typography } from '@intermine/chromatin/typography'
import { IconButton } from '@intermine/chromatin/icon-button'
import { Menu } from '@intermine/chromatin/menu'
import { MenuItem } from '@intermine/chromatin/menu-item'
import { FormControlLabel } from '@intermine/chromatin/form-control-label'
import SettingIcon from '@intermine/chromatin/icons/System/settings-4-fill'
import { useOutsideClick } from '@intermine/chromatin/utils'

import { AppContext } from '../context'
import InterMineLogo from '../../public/assets/img/intermine-logo.webp'

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
    const store = useContext(AppContext)
    const {
        state: { themeType },
        updateTheme
    } = store.preferencesReducer

    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [anchorElement, setAnchorElement] = useState<
        undefined | HTMLElement
    >()

    const menuRef = useRef(null)

    const handleToggleOnClick = () => {
        updateTheme(themeType === 'dark' ? 'light' : 'dark')
    }

    useOutsideClick({
        anchorElement: anchorElement,
        otherElements: [menuRef.current],
        onInsideClicked: () => setIsMenuOpen(true),
        onOutsideClicked: () => setIsMenuOpen(false)
    })

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
            <Box>
                <IconButton
                    handle
                    innerRef={(el: HTMLElement) => setAnchorElement(el)}
                    color="neutral"
                    hasHighlightOnFocus={isMenuOpen ? false : true}
                    isHovered={isMenuOpen}
                    Icon={<SettingIcon />}
                />
            </Box>
            <Menu
                innerRef={menuRef}
                anchorElement={anchorElement}
                isOpen={isMenuOpen}
                csx={{ root: { borderRadius: '0.5rem', overflow: 'hidden' } }}
            >
                <MenuItem hasPadding={false}>
                    <FormControlLabel
                        label="Dark Theme"
                        spaceBetween="all"
                        csx={{
                            root: {
                                cursor: 'pointer',
                                flex: '1',
                                margin: 0,
                                padding: '0.7rem 1.4rem'
                            }
                        }}
                        labelPlacement="left"
                        control={
                            <Toggle
                                isDense
                                isChecked={themeType === 'dark'}
                                onChange={handleToggleOnClick}
                                hasHighlightOnFocus={false}
                                csx={{ root: { padding: 0 } }}
                            />
                        }
                    />
                </MenuItem>
                <MenuItem>Sign Out</MenuItem>
            </Menu>
        </Box>
    )
}
