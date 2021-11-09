import { useContext, useRef, useState } from 'react'
import { useHistory } from 'react-router-dom'
import { useOutsideClick } from '@intermine/chromatin/utils'
import { IconButton } from '@intermine/chromatin/icon-button'
import { Menu } from '@intermine/chromatin/menu'
import { MenuItem } from '@intermine/chromatin/menu-item'
import { Box } from '@intermine/chromatin/box'
import { Divider } from '@intermine/chromatin/divider'
import { Typography } from '@intermine/chromatin/typography'

import { AppContext } from '../../../context'
import { AuthStates } from '../../../constants/auth'
import { LOGIN_PATH } from '../../../routes'

const { NotAuthorize } = AuthStates

export const NavbarItems = () => {
    const store = useContext(AppContext)
    const {
        authReducer: { updateAuthState }
    } = store
    const history = useHistory()

    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [anchorElement, setAnchorElement] = useState<HTMLElement>()

    const menuRef = useRef(null)

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

    return (
        <IconButton
            ref={(el: HTMLElement) => setAnchorElement(el)}
            color="info"
            variant="normal"
            hasElevation={false}
            hasHighlightOnFocus={false}
            Icon={
                <Box isContentCenter csx={{ root: { fontWeight: 800 } }}>
                    Z
                </Box>
            }
        >
            <Menu
                ref={menuRef}
                anchorElement={anchorElement}
                isOpen={isMenuOpen}
                placement="bottom-end"
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
                                color: neutral[30]
                            })
                        }}
                        variant="caption"
                    >
                        User's organization
                    </Typography>
                </MenuItem>
                <Divider Component="li" csx={{ root: { margin: 0 } }} />
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu>
        </IconButton>
    )
}
