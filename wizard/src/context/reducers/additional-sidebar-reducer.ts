import { useReducer } from 'react'

import {
    AdditionalSidebarActions,
    AdditionalSidebarTabs,
} from '../../constants/additional-sidebar'

import type {
    TAdditionalSidebarReducer,
    TAdditionalSidebarReducerAction,
    TUseAdditionalSidebarReducer,
} from '../types'

const { UpdateState } = AdditionalSidebarActions

/**
 * Additional sidebar reducer initial state
 */
const additionalSidebarInitialReducer: TAdditionalSidebarReducer = {
    isOpen: true,
    activeTab: AdditionalSidebarTabs.ProgressTab,
}

const additionalSidebarReducer = (
    state: TAdditionalSidebarReducer,
    action: TAdditionalSidebarReducerAction
) => {
    const { type, data } = action

    switch (type) {
        case UpdateState:
            state = { ...state, ...data }
            return state

        /* istanbul ignore next */
        default:
            throw new Error(
                ''.concat(
                    '[Additional Sidebar Reducer]: Action',
                    'type is not identified. Type: ',
                    type
                )
            )
    }
}

export const useAdditionalSidebarReducer = (): TUseAdditionalSidebarReducer => {
    const [state, dispatch] = useReducer(
        additionalSidebarReducer,
        additionalSidebarInitialReducer
    )

    const updateState = (data: Partial<TAdditionalSidebarReducer>) => {
        dispatch({
            type: UpdateState,
            data,
        })
    }

    return {
        state,
        updateState,
    }
}
