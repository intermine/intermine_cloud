import { useReducer } from 'react'

import { SidebarActions } from '../../constants/sidebar'

import type {
    TSidebarReducer,
    TSidebarReducerAction,
    TUseSidebarReducer,
} from '../types'

const { ChangePageSwitchStatus, UpdateOnSidebarClick, RemoveOnSidebarClick } =
    SidebarActions

/**
 * Sidebar reducer initial state
 */
const sidebarInitialReducer: TSidebarReducer = {
    isPageSwitchingAllowed: true,
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    onSidebarItemClick: () => {},
}

const sidebarReducer = (
    state: TSidebarReducer,
    action: TSidebarReducerAction
) => {
    const { type, data } = action

    console.log('Type', type, data)
    switch (type) {
        case ChangePageSwitchStatus:
            state = { ...state, isPageSwitchingAllowed: data as boolean }
            return state

        case UpdateOnSidebarClick:
            state = {
                ...state,
                onSidebarItemClick:
                    data as TSidebarReducer['onSidebarItemClick'],
            }
            return state

        case RemoveOnSidebarClick:
            state = {
                ...state,
                // eslint-disable-next-line @typescript-eslint/no-empty-function
                onSidebarItemClick: () => {},
            }

            return state

        /* istanbul ignore next */
        default:
            throw new Error(
                ''.concat(
                    '[Sidebar Reducer]: Action type is not identified',
                    'Type: ',
                    type
                )
            )
    }
}

export const useSidebarReducer = (): TUseSidebarReducer => {
    const [state, dispatch] = useReducer(sidebarReducer, sidebarInitialReducer)

    const updatePageSwitchStatus = (data: boolean) =>
        dispatch({
            type: ChangePageSwitchStatus,
            data,
        })

    const onSidebarItemClick = (fn: TSidebarReducer['onSidebarItemClick']) => {
        dispatch({
            type: UpdateOnSidebarClick,
            data: fn,
        })
    }

    const removeOnSidebarItemClick = () => {
        dispatch({
            type: RemoveOnSidebarClick,
            data: {},
        })
    }

    return {
        state,
        onSidebarItemClick,
        updatePageSwitchStatus,
        removeOnSidebarItemClick,
    }
}
