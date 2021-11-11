import { useContext } from 'react'
import { AlertGroup } from '@intermine/chromatin/alert-group'
import { Alert } from '@intermine/chromatin/alert'

import { AppContext } from '../../context'

export const GlobalAlert = () => {
    const store = useContext(AppContext)
    const {
        globalAlertReducer: {
            state: { alerts },
            removeAlert
        }
    } = store

    return (
        <AlertGroup isOpen={alerts.length > 0} origin="bottom-right">
            {alerts.map(({ onClose, id, ...alert }) => (
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
            ))}
        </AlertGroup>
    )
}
