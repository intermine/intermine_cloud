import { useState } from 'react'
import { useHistory } from 'react-router'
import { Tooltip } from '@intermine/chromatin/tooltip'
import { IconButton } from '@intermine/chromatin/icon-button'
import LogoutIcon from '@intermine/chromatin/icons/Device/shut-down-line'

import { LOGIN_PATH } from '../../../routes'
import { useLogout } from '../utils/hooks'
import { useGlobalAlertReducer } from '../../../context'
import shortid from 'shortid'

type TLogoutProps = {
    className?: string
    onLogout?: () => void
    onLogoutClick: () => boolean
    tooltipPlacement?: 'left' | 'bottom'
    isLogoutAllowed?: boolean
}

export const LogoutIconButton = (props: TLogoutProps) => {
    const history = useHistory()
    const { logout } = useLogout()
    const { addAlert } = useGlobalAlertReducer()

    const {
        className,
        onLogout,
        onLogoutClick,
        tooltipPlacement = 'left',
        isLogoutAllowed = true
    } = props
    const [isMakingPostRequest, setIsMakingPostRequest] = useState(false)

    const handleLogout = async () => {
        let isPreventDefault = false

        if (typeof onLogoutClick === 'function') {
            isPreventDefault = onLogoutClick()
        }

        if (isLogoutAllowed && !isPreventDefault) {
            setIsMakingPostRequest(true)
            const isLogoutSuccessfully = await logout()

            if (isLogoutSuccessfully) {
                history.push(LOGIN_PATH)
                if (typeof onLogout === 'function') {
                    onLogout()
                }
                return
            }

            addAlert({
                id: shortid.generate(),
                isOpen: true,
                type: 'error',
                message: window.navigator.onLine
                    ? 'Failed to logout. Please try again.'
                    : 'You seem to be offline.'
            })

            setIsMakingPostRequest(false)
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
