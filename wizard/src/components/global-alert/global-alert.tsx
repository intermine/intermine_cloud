import { AlertGroup } from '@intermine/chromatin/alert-group'
import { Alert } from '@intermine/chromatin/alert'

import {
    useAdditionalSidebarReducer,
    useGlobalAlertReducer
} from '../../context'

export const GlobalAlert = () => {
    const globalAlertReducer = useGlobalAlertReducer()
    const additionalSidebarReducer = useAdditionalSidebarReducer()

    const {
        state: { alerts },
        removeAlert
    } = globalAlertReducer

    const {
        state: { isOpen: isAdditionalSidebarOpen }
    } = additionalSidebarReducer

    const getOrigin = (): { top: string; right: string } => {
        if (isAdditionalSidebarOpen) {
            return {
                top: '1.5rem',
                right: '22.5rem'
            }
        }

        return {
            top: '1.5rem',
            right: '5.5rem'
        }
    }

    const alertsKey = Object.keys(alerts)

    return (
        <AlertGroup
            isOpen={alertsKey.length > 0}
            origin="top-right"
            csx={{ root: { ...getOrigin(), transition: '0.2s' } }}
            alertChildProps={{
                csx: { root: { wordBreak: 'break-all' } }
            }}
        >
            {alertsKey.map((alertKey) => {
                const { id, onClose, ...alert } = alerts[alertKey]

                return (
                    <Alert
                        key={id}
                        id={id}
                        onClose={() => {
                            if (typeof onClose === 'function') {
                                onClose()
                            }
                            removeAlert(id)
                        }}
                        duration={10_000}
                        {...alert}
                    />
                )
            })}
        </AlertGroup>
    )
}
