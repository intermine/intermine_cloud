import { useReducer } from 'react'

import { SidebarActions } from '../../constants/sidebar'

import type {
    TSidebarReducer,
    TSidebarReducerAction,
    TUseSidebarReducer,
} from '../types'

const { ChangePageSwitchStatus, UpdateOnSidebarClick } = SidebarActions

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
        console.log('On side')
        dispatch({
            type: UpdateOnSidebarClick,
            data: fn,
        })
    }

    return {
        state,
        onSidebarItemClick,
        updatePageSwitchStatus,
    }
}
