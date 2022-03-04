import { useLocation } from 'react-router'
import { AlertGroup } from '@intermine/chromatin/alert-group'
import { Alert } from '@intermine/chromatin/alert'

import { useGlobalAlertReducer } from '../../context'
import { useStoreSelector, additionalSidebarSelector } from '../../store'
import { isAuthRoute } from '../../routes'

export const GlobalAlert = () => {
    const globalAlertReducer = useGlobalAlertReducer()
    const { isOpen: isAdditionalSidebarOpen } = useStoreSelector(
        additionalSidebarSelector
    )
    const { pathname } = useLocation()

    const {
        state: { alerts },
        removeAlert
    } = globalAlertReducer

    const getOrigin = (): { top: string; right: string } => {
        const top = '1.5rem'
        let right = '5.5rem'

        if (isAdditionalSidebarOpen) {
            right = '22.5rem'
        }

        if (!isAuthRoute(pathname)) {
            /**
             * If path is not auth path. Then we don't have any additional
             * sidebar. So alert should be less far from right.
             */
            right = '1.5rem'
        }

        return {
            top,
            right
        }
    }

    const alertsKey = Object.keys(alerts)

    return (
        <AlertGroup
            isOpen={alertsKey.length > 0}
            origin="top-right"
            csx={{ root: { ...getOrigin(), transition: '0.2s' } }}
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
                        duration={20_000}
                        {...alert}
                    />
                )
            })}
        </AlertGroup>
    )
}
