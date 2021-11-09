import { useReducer } from 'react'

import { SidebarActions } from '../../constants/sidebar'
import {
    getSidebarStateFromLocalStorage,
    setSidebarStateToLocalStorage,
} from '../../utils/local-storage/sidebar'

import type {
    TSidebarReducer,
    TSidebarReducerAction,
    TUseSidebarReducer,
} from '../types'

const { UpdateSidebarState, UpdateOnSidebarClick, RemoveOnSidebarClick } =
    SidebarActions

/**
 * Sidebar reducer initial state
 */
const sidebarInitialReducer: TSidebarReducer = {
    isOpen: getSidebarStateFromLocalStorage().isOpen,
    isPageSwitchingAllowed: true,
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    onSidebarItemClick: () => {},
}

const sidebarReducer = (
    state: TSidebarReducer,
    action: TSidebarReducerAction
) => {
    const { type, data } = action

    switch (type) {
        case UpdateSidebarState:
            state = { ...state, ...(data as TSidebarReducer) }
            setSidebarStateToLocalStorage({ isOpen: state.isOpen })
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

    const updateSidebarState = (data: Partial<TSidebarReducer>) =>
        dispatch({
            type: UpdateSidebarState,
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
        updateSidebarState,
        removeOnSidebarItemClick,
    }
}
