import { useReducer } from 'react'

import {
    AdditionalSidebarActions,
    AdditionalSidebarTabs,
} from '../../constants/additional-sidebar'

import type {
    TAdditionalSidebarReducer,
    TAdditionalSidebarReducerAction,
    TUseAdditionalSidebarReducer,
    TAdditionalSidebarLogout,
} from '../types'

const { UpdateState, UpdateLogoutState } = AdditionalSidebarActions

/**
 * Additional sidebar reducer initial state
 */
const additionalSidebarInitialReducer: TAdditionalSidebarReducer = {
    isOpen: false,
    activeTab: AdditionalSidebarTabs.None,
    logout: {
        isUploading: false,
        isEditingForm: false,
        onLogoutClickCallbacks: {},
    },
}

const additionalSidebarReducer = (
    state: TAdditionalSidebarReducer,
    action: TAdditionalSidebarReducerAction
) => {
    const { type, data } = action

    switch (type) {
        case UpdateState:
            state = { ...state, ...data }

            return { ...state }

        case UpdateLogoutState:
            const { onLogoutClickCallbacks, ...rest } =
                data as TAdditionalSidebarLogout
            const { logout } = state
            state.logout = {
                ...logout,
                ...rest,
                onLogoutClickCallbacks: {
                    ...logout.onLogoutClickCallbacks,
                    ...onLogoutClickCallbacks,
                },
            }
            return { ...state }

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

    const updateAdditionalSidebarState = (
        data: Partial<TAdditionalSidebarReducer>
    ) => {
        dispatch({
            type: UpdateState,
            data,
        })
    }

    const updateAdditionalSidebarLogoutState = (
        data: Partial<TAdditionalSidebarLogout>
    ) => {
        dispatch({
            type: UpdateLogoutState,
            data,
        })
    }

    return {
        state,
        updateAdditionalSidebarState,
        updateAdditionalSidebarLogoutState,
    }
}
