import { useReducer } from 'react'

import { ProgressActions } from '../../constants/progress'
import type {
    TProgressReducer,
    TUseProgressReducer,
    TProgressReducerAction,
    TProgressItem,
} from '../types'

const { AddDataset, UpdateDataset, RemoveEntry } = ProgressActions

const progressReducerInitialState: TProgressReducer = {
    progressItems: {},
}

const progressReducer = (
    state: TProgressReducer,
    action: TProgressReducerAction
) => {
    const { type, data } = action

    switch (type) {
        case AddDataset:
            const progressItems = {
                ...state.progressItems,
                [(data as TProgressItem).id]: data as TProgressItem,
            }

            return { progressItems }

        case UpdateDataset:
            state.progressItems[(data as TProgressItem).id] = {
                ...state.progressItems[(data as TProgressItem).id],
                ...(data as TProgressItem),
            }

            return { ...state }

        case RemoveEntry:
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

    const updateDataset = (data: Partial<TProgressItem>) => {
        dispatch({ type: UpdateDataset, data })
    }

    const addDataset = (data: TProgressItem) => {
        dispatch({
            type: AddDataset,
            data,
        })
    }

    const removeEntry = (id: string) => {
        dispatch({
            type: RemoveEntry,
            data: id,
        })
    }

    return {
        state,
        updateDataset,
        addDataset,
        removeEntry,
    }
}
