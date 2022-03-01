import { useState } from 'react'
import { Tooltip } from '@intermine/chromatin/tooltip'
import { IconButton } from '@intermine/chromatin/icon-button'
import LogoutIcon from '@intermine/chromatin/icons/Device/shut-down-line'

import { useSharedReducer } from '../../../context'
import { useDashboardLogout } from '../hooks'

type TLogoutProps = {
    className?: string
    /**
     * Callback to run after logout.
     */
    onLogout?: () => void
    tooltipPlacement?: 'left' | 'bottom'
}

/**
 * This logout button should only be use on dashboard.
 * If will only trigger logout if logout is allowed.
 * If logout is not allowed then it will fire callbacks.
 *
 * Callbacks can be set using sharedReducer.
 */
export const LogoutIconButton = (props: TLogoutProps) => {
    const { dashboardLogout, showAlertOnFailedLogoutAttempt } =
        useDashboardLogout()
    const {
        state: {
            isEditingAnyForm,
            isUploadingAnyFile,
            cbIfEditingFormAndUserRequestLogout,
            cbIfUploadingFileAndUserRequestLogout
        }
    } = useSharedReducer()

    const { className, onLogout, tooltipPlacement = 'left' } = props
    const [isMakingPostRequest, setIsMakingPostRequest] = useState(false)

    const isLogoutAllowed = () => {
        return !(isEditingAnyForm || isUploadingAnyFile)
    }

    const handleLogout = async () => {
        if (isLogoutAllowed()) {
            setIsMakingPostRequest(true)

            await dashboardLogout({
                onSuccess: onLogout,
                onError: showAlertOnFailedLogoutAttempt
            })

            setIsMakingPostRequest(false)
            return
        }

        /**
         * If logout is now allowed
         */

        if (isEditingAnyForm && cbIfEditingFormAndUserRequestLogout) {
            cbIfEditingFormAndUserRequestLogout()
            return
        }

        if (isUploadingAnyFile && cbIfUploadingFileAndUserRequestLogout) {
            cbIfUploadingFileAndUserRequestLogout()
            return
        }

        if (process.env.NODE_ENV === 'development') {
            throw new Error(`
                There is now callback to handle the case 
                if logout is not allowed. 
            `)
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
