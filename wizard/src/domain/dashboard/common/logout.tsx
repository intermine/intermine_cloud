import { useState } from 'react'
import { useHistory } from 'react-router'
import { Tooltip } from '@intermine/chromatin/tooltip'
import { IconButton } from '@intermine/chromatin/icon-button'
import LogoutIcon from '@intermine/chromatin/icons/Device/shut-down-line'

import { LOGIN_PATH } from '../../../routes'
import { useLogout } from '../utils/hooks'

type TLogoutProps = {
    className?: string
    handleLogoutClick?: () => void
    tooltipPlacement?: 'left' | 'bottom'
    isLogoutAllowed?: boolean
}

export const Logout = (props: TLogoutProps) => {
    const history = useHistory()
    const { logout } = useLogout()

    const {
        className,
        handleLogoutClick: _handleLogoutClick,
        tooltipPlacement = 'left',
        isLogoutAllowed = true
    } = props
    const [isMakingPostRequest, setIsMakingPostRequest] = useState(false)

    const handleLogout = () => {
        if (isLogoutAllowed) {
            setIsMakingPostRequest(true)
            logout()
            history.push(LOGIN_PATH)
        }

        if (typeof _handleLogoutClick === 'function') {
            _handleLogoutClick()
        }
    }

    return (
        <Tooltip message="Logout" placement={tooltipPlacement}>
            <IconButton
                className={className}
                Icon={<LogoutIcon />}
                onClick={handleLogout}
                isLoading={isMakingPostRequest}
            />
        </Tooltip>
    )
}
