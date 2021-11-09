import { useReducer } from 'react'

import { GlobalModalActions } from '../../constants/global-modal'

import {
    TGlobalModalReducer,
    TGlobalModalReducerAction,
    TUseGlobalModalReducer,
} from '../types'

const { CloseGlobalModal, UpdateGlobalModalProps } = GlobalModalActions

/**
 * Global Modal reducer initial state
 */
const globalModalInitialReducer: TGlobalModalReducer = {
    isOpen: false,
}

const globalModalReducer = (
    state: TGlobalModalReducer,
    action: TGlobalModalReducerAction
) => {
    const { type, data } = action

    switch (type) {
        case UpdateGlobalModalProps:
            state = { ...(data as TGlobalModalReducer) }
            return state

        case CloseGlobalModal:
            state = { isOpen: false }
            return state

        /* istanbul ignore next */
        default:
            throw new Error(
                ''.concat(
                    '[GlobalModal Reducer]: Action type is not identified',
                    'Type: ',
                    type
                )
            )
    }
}

export const useGlobalModalReducer = (): TUseGlobalModalReducer => {
    const [state, dispatch] = useReducer(
        globalModalReducer,
        globalModalInitialReducer
    )

    const updateGlobalModalProps = (data: TGlobalModalReducer) => {
        dispatch({ type: UpdateGlobalModalProps, data })
    }

    const closeGlobalModal = () => {
        dispatch({
            type: CloseGlobalModal,
            data: { isOpen: false },
        })
    }

    return {
        state,
        updateGlobalModalProps,
        closeGlobalModal,
    }
}
