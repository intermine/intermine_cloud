import { useReducer } from 'react'

import { GlobalAlertsActions } from '../../constants/global-alert'

import {
    TAlert,
    TGlobalAlertReducer,
    TGlobalAlertReducerAction,
    TUseGlobalAlertReducer,
} from '../types'

const { AddAlert, RemoveAlert, UpdateAlert } = GlobalAlertsActions

const globalAlertInitialReducer: TGlobalAlertReducer = {
    alerts: [],
}

const globalAlertReducer = (
    state: TGlobalAlertReducer,
    action: TGlobalAlertReducerAction
) => {
    const { type, data } = action

    const filterAlert = (id: string) => {
        return state.alerts.filter((alert) => alert.id !== id)
    }

    const modifyAlert = (a: TAlert) => {
        return state.alerts.map((alert) => {
            if (alert.id === a.id) {
                return { ...alert, ...a }
            }
            return alert
        })
    }

    switch (type) {
        case AddAlert:
            state.alerts.push({ isOpen: true, ...(data as TAlert) })
            return { ...state }

        case RemoveAlert:
            state.alerts = filterAlert(data as string)
            return { ...state }

        case UpdateAlert:
            state.alerts = modifyAlert(data as TAlert)
            return { ...state }

        /* istanbul ignore next */
        default:
            throw new Error(
                ''.concat(
                    '[GlobalAlert Reducer]: Action type is not identified',
                    'Type: ',
                    type
                )
            )
    }
}

export const useGlobalAlertReducer = (): TUseGlobalAlertReducer => {
    const [state, dispatch] = useReducer(
        globalAlertReducer,
        globalAlertInitialReducer
    )

    const addAlert = (data: TAlert) => {
        dispatch({
            type: AddAlert,
            data,
        })
    }

    const updateAlert = (data: TAlert) => {
        dispatch({
            type: UpdateAlert,
            data,
        })
    }

    const removeAlert = (id: string) => {
        dispatch({
            type: UpdateAlert,
            data: { id, isOpen: false },
        })

        setTimeout(() => {
            dispatch({
                type: RemoveAlert,
                data: id,
            })
        }, 1000)
    }

    return {
        state,
        addAlert,
        removeAlert,
        updateAlert,
    }
}
