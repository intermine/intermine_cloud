import { useReducer } from 'react'

import { SharedReducerActions } from '../../constants/shared-reducer'
import {
    TSharedReducer,
    TSharedReducerAction,
    TUseSharedReducer,
} from '../types'

const { UpdateSharedReducerState } = SharedReducerActions

const sharedReducerInitialReducer: TSharedReducer = {
    isEditingAnyForm: false,
    isUploadingAnyFile: false,
}

const sharedReducer = (state: TSharedReducer, action: TSharedReducerAction) => {
    const { type, data } = action

    switch (type) {
        case UpdateSharedReducerState:
            return { ...state, ...data }

        /* istanbul ignore next */
        default:
            throw new Error(
                ''.concat(
                    '[Shared Reducer]: Action',
                    'type is not identified. Type: ',
                    type
                )
            )
    }
}

export const useSharedReducer = (): TUseSharedReducer => {
    const [state, dispatch] = useReducer(
        sharedReducer,
        sharedReducerInitialReducer
    )

    const updateSharedReducer: TUseSharedReducer['updateSharedReducer'] = (
        data
    ) => {
        dispatch({
            type: UpdateSharedReducerState,
            data,
        })
    }

    return {
        state,
        updateSharedReducer,
    }
}
