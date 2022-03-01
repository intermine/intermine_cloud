import { useHistory } from 'react-router'
import { ButtonCommonProps } from '@intermine/chromatin/button'

import { useGlobalModalReducer } from '../../../context'

type TUseDashboardWarningModalProps = {
    msg?: string
    primaryAction?: ButtonCommonProps
    secondaryAction?: ButtonCommonProps
    /**
     * If set then redirect to this url otherwise
     * no redirection will take place
     */
    redirectTo?: string
}

export const useDashboardWarningModal = () => {
    const history = useHistory()
    const { updateGlobalModalProps, closeGlobalModal } = useGlobalModalReducer()

    const showWarningModal = (props: TUseDashboardWarningModalProps) => {
        const {
            msg = 'All your work will be lost.',
            primaryAction = {
                children: 'Proceed',
            },
            secondaryAction = {
                children: 'Cancel',
            },
            redirectTo,
        } = props

        updateGlobalModalProps({
            isOpen: true,
            heading: 'Are you sure?',
            type: 'warning',
            children: msg,
            primaryAction: {
                ...primaryAction,
                onClick: (event) => {
                    if (redirectTo) {
                        closeGlobalModal()
                        history.push(redirectTo)
                    }
                    if (primaryAction.onClick) {
                        primaryAction.onClick(event)
                    }
                },
            },
            secondaryAction: {
                onClick: closeGlobalModal,
                ...secondaryAction,
            },
        })
    }

    return {
        showWarningModal,
        closeWarningModal: closeGlobalModal,
        updateWarningModal: updateGlobalModalProps,
    }
}
