import { useHistory } from 'react-router'
import { ButtonCommonProps } from '@intermine/chromatin/button'

import {
    useStoreDispatch,
    updateGlobalModal,
    closeGlobalModal,
} from '../../../store'
import { TGlobalModalReducer } from '../../../shared/types'

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
    const storeDispatch = useStoreDispatch()

    const _updateGlobalModal = (payload: TGlobalModalReducer) => {
        storeDispatch(updateGlobalModal(payload))
    }

    const _closeGlobalModal = () => {
        storeDispatch(closeGlobalModal())
    }

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

        _updateGlobalModal({
            isOpen: true,
            heading: 'Are you sure?',
            type: 'warning',
            children: msg,
            primaryAction: {
                ...primaryAction,
                onClick: (event) => {
                    if (redirectTo) {
                        storeDispatch(closeGlobalModal())
                        history.push(redirectTo)
                    }
                    if (primaryAction.onClick) {
                        primaryAction.onClick(event)
                    }
                },
            },
            secondaryAction: {
                onClick: _closeGlobalModal,
                ...secondaryAction,
            },
        })
    }

    return {
        showWarningModal,
        closeWarningModal: _closeGlobalModal,
        updateWarningModal: _updateGlobalModal,
    }
}
