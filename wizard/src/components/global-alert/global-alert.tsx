import { AlertGroup } from '@intermine/chromatin/alert-group'
import { Alert } from '@intermine/chromatin/alert'

import { useGlobalAlertReducer } from '../../context'

export const GlobalAlert = () => {
    const globalAlertReducer = useGlobalAlertReducer()
    const {
        state: { alerts },
        removeAlert
    } = globalAlertReducer

    const alertsKey = Object.keys(alerts)

    return (
        <AlertGroup
            isOpen={alertsKey.length > 0}
            origin="bottom-right"
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
                        {...alert}
                    />
                )
            })}
        </AlertGroup>
    )
}
