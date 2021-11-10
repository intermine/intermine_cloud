import { useState, useContext } from 'react'
import { useHistory } from 'react-router'
import { Tooltip } from '@intermine/chromatin/tooltip'
import { IconButton } from '@intermine/chromatin/icon-button'
import LogoutIcon from '@intermine/chromatin/icons/Device/shut-down-line'

import { AppContext } from '../../../context'
import { LOGIN_PATH } from '../../../routes'
import { AuthStates } from '../../../constants/auth'

type TLogoutProps = {
    className?: string
    handleLogoutClick?: () => void
    tooltipPlacement?: 'left' | 'bottom'
}

export const Logout = (props: TLogoutProps) => {
    const history = useHistory()
    const store = useContext(AppContext)
    const {
        authReducer: { updateAuthState }
    } = store

    const {
        className,
        handleLogoutClick: _handleLogoutClick,
        tooltipPlacement = 'left'
    } = props
    const [isMakingPostRequest, setIsMakingPostRequest] = useState(false)

    const handleLogout = () => {
        setIsMakingPostRequest(true)
        updateAuthState(AuthStates.NotAuthorize)
        if (typeof _handleLogoutClick === 'function') {
            _handleLogoutClick()
        }
        history.push(LOGIN_PATH)
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
