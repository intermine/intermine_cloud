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

const { UpdateSidebarState } = SidebarActions

/**
 * Sidebar reducer initial state
 */
const sidebarInitialReducer: TSidebarReducer = {
    isOpen: getSidebarStateFromLocalStorage().isOpen,
    isPageSwitchingAllowed: true,
    onSidebarItemClick: () => false,
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

    return {
        state,
        updateSidebarState,
    }
}
