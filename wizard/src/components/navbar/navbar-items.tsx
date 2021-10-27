import { useContext, useRef, useState } from 'react'
import { useHistory } from 'react-router-dom'
import { useOutsideClick } from '@intermine/chromatin/utils'
import { IconButton } from '@intermine/chromatin/icon-button'
import { Menu } from '@intermine/chromatin/menu'
import { MenuItem } from '@intermine/chromatin/menu-item'
import { Box } from '@intermine/chromatin/box'
import { Tooltip } from '@intermine/chromatin/tooltip'
import { Divider } from '@intermine/chromatin/divider'
import { Typography } from '@intermine/chromatin/typography'
import DarkThemeIcon from '@intermine/chromatin/icons/Weather/sun-fill'
import LightThemeIcon from '@intermine/chromatin/icons/Weather/moon-fill'

import { AppContext } from '../../context'
import { AuthStates } from '../../constants/auth'
import { LOGIN_PATH } from '../../routes'

const { Authorize, NotAuthorize } = AuthStates

export const NavbarItems = () => {
    const store = useContext(AppContext)
    const {
        preferencesReducer: {
            state: { themeType },
            updateTheme
        },
        authReducer: {
            state: { authState, userDetails },
            updateAuthState
        }
    } = store
    const history = useHistory()

    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [anchorElement, setAnchorElement] = useState<HTMLElement>()

    const menuRef = useRef(null)

    const handleToggleOnClick = () => {
        updateTheme(themeType === 'dark' ? 'light' : 'dark')
    }

    const handleLogout = () => {
        setIsMenuOpen(false)
        updateAuthState(NotAuthorize)
        history.push(LOGIN_PATH)
    }

    useOutsideClick({
        anchorElement: anchorElement,
        otherElements: [menuRef.current],
        onInsideClicked: () => setIsMenuOpen(true),
        onOutsideClicked: () => setIsMenuOpen(false)
    })

    if (authState === Authorize) {
        return (
            <IconButton
                ref={(el: HTMLElement) => setAnchorElement(el)}
                color="primary"
                variant="normal"
                hasElevation={false}
                hasHighlightOnFocus={false}
                Icon={<Box isContentCenter>Z</Box>}
            >
                <Menu
                    ref={menuRef}
                    anchorElement={anchorElement}
                    isOpen={isMenuOpen}
                    csx={{
                        root: {
                            borderRadius: '0.5rem',
                            overflow: 'hidden'
                        }
                    }}
                >
                    <MenuItem
                        isButtonLike={false}
                        csx={{
                            root: {
                                flexDirection: 'column',
                                alignItems: 'flex-start'
                            }
                        }}
                    >
                        <Typography variant="h3">User's name</Typography>
                        <Typography
                            csx={{
                                root: ({ palette: { neutral } }) => ({
                                    color: neutral[60]
                                })
                            }}
                            variant="caption"
                        >
                            User's organization
                        </Typography>
                    </MenuItem>
                    <Divider Component="li" csx={{ root: { margin: 0 } }} />
                    <MenuItem>Edit Profile</MenuItem>
                    <MenuItem onClick={handleLogout}>Logout</MenuItem>
                    <Divider Component="li" csx={{ root: { margin: 0 } }} />
                    <MenuItem onClick={handleToggleOnClick}>
                        Dark Theme: {themeType === 'dark' ? 'On' : 'Off'}
                    </MenuItem>
                </Menu>
            </IconButton>
        )
    }

    return (
        <Tooltip
            message={`Switch to ${
                themeType === 'dark' ? 'light' : 'dark'
            } theme.`}
            placement="left"
        >
            <IconButton
                onClick={handleToggleOnClick}
                color="neutral"
                hasHighlightOnFocus={isMenuOpen ? false : true}
                isHovered={isMenuOpen}
                Icon={
                    themeType === 'dark' ? (
                        <DarkThemeIcon />
                    ) : (
                        <LightThemeIcon />
                    )
                }
            />
        </Tooltip>
    )
}
