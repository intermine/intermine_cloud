import { useHistory } from 'react-router'
import { useGlobalModalReducer, useAuthReducer } from '../../../context'
import { AuthStates } from '../../../constants/auth'

type TUseDashboardWarningModalProps = {
    msg?: string
    primaryActionTitle?: string
    primaryActionCallback?: () => void
    secondaryActionTitle?: string
    to?: string
}

export const useDashboardWarningModal = () => {
    const history = useHistory()
    const { updateGlobalModalProps, closeGlobalModal } = useGlobalModalReducer()

    const showWarningModal = (props: TUseDashboardWarningModalProps) => {
        const {
            msg = 'All your work will be lost',
            primaryActionTitle = 'Proceed',
            secondaryActionTitle = 'Cancel',
            to = '/',
            primaryActionCallback,
        } = props
        updateGlobalModalProps({
            isOpen: true,
            heading: 'Are you sure?',
            type: 'warning',
            children: msg,
            primaryAction: {
                onClick: () => {
                    closeGlobalModal()
                    history.push(to)
                    if (typeof primaryActionCallback === 'function') {
                        primaryActionCallback()
                    }
                },
                children: primaryActionTitle,
            },
            secondaryAction: {
                onClick: closeGlobalModal,
                children: secondaryActionTitle,
            },
        })
    }

    return {
        showWarningModal,
    }
}

export const useLogout = () => {
    const { updateAuthState } = useAuthReducer()

    const logout = () => {
        updateAuthState(AuthStates.NotAuthorize)
    }

    return {
        logout,
    }
}
