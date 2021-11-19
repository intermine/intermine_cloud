import { useReducer } from 'react'

import { ProgressActions } from '../../constants/progress'
import type {
    TProgressReducer,
    TUseProgressReducer,
    TProgressReducerAction,
    TProgressItem,
} from '../types'

const { AddItemToProgress, RemoveItemFromProgress, UpdateProgressItem } =
    ProgressActions

const progressReducerInitialState: TProgressReducer = {
    progressItems: {},
}

const progressReducer = (
    state: TProgressReducer,
    action: TProgressReducerAction
) => {
    const { type, data } = action

    switch (type) {
        case AddItemToProgress:
            state.progressItems = {
                ...state.progressItems,
                [(data as TProgressItem).id]: data as TProgressItem,
            }

            return { ...state }

        case UpdateProgressItem:
            state.progressItems[(data as TProgressItem).id] = {
                ...state.progressItems[(data as TProgressItem).id],
                ...(data as TProgressItem),
            }

            return { ...state }

        case RemoveItemFromProgress:
            delete state.progressItems[data as string]
            return { ...state }

        /* istanbul ignore next */
        default:
            throw new Error(
                ''.concat(
                    '[Progress Reducer]: Action type is not identified',
                    'Type: ',
                    type
                )
            )
    }
}

export const useProgressReducer = (): TUseProgressReducer => {
    const [state, dispatch] = useReducer(
        progressReducer,
        progressReducerInitialState
    )

    const updateProgressItem = (data: Partial<TProgressItem>) => {
        dispatch({ type: UpdateProgressItem, data })
    }

    const addItemToProgress = (data: TProgressItem) => {
        dispatch({
            type: AddItemToProgress,
            data,
        })
    }

    const removeItemFromProgress = (id: string) => {
        dispatch({
            type: RemoveItemFromProgress,
            data: id,
        })
    }

    return {
        state,
        updateProgressItem,
        addItemToProgress,
        removeItemFromProgress,
    }
}
