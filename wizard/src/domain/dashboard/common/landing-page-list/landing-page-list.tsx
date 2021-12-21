import { useEffect, useMemo, useReducer, useRef } from 'react'

import { LandingPageListContext } from './landing-page-context'
import { LandingPageListContainer } from './components'

import {
    LandingPageListActions,
    TLandingPageListProps,
    TLandingPageListReducerAction,
    TLandingPageReducer
} from './types'

const { UpdateState } = LandingPageListActions
const landingPageListReducer = (
    state: TLandingPageReducer,
    action: TLandingPageListReducerAction
) => {
    switch (action.type) {
        case UpdateState:
            return { ...state, ...action.data }

        /* istanbul ignore next */
        default:
            throw new Error(
                ''.concat(
                    '[LandingPageList Reducer]: Action type is not identified',
                    'Type: ',
                    action.type
                )
            )
    }
}

const getLandingPageListReducerFromProps = (
    props: TLandingPageListProps
): TLandingPageReducer => {
    const { data } = props

    const listsObj: TLandingPageReducer['listsObj'] = {}

    for (let idx = 0; idx < data.length; idx++) {
        const item = data[idx]
        const upItemId = idx > 0 ? data[idx - 1].id : ''
        const downItemId = idx !== data.length - 1 ? data[idx + 1].id : ''
        listsObj[item.id] = { ...item, upItemId, downItemId }
    }

    return {
        activeItemId: '',
        downItemId: '',
        upItemId: '',
        lists: data,
        listsObj,
        // Here we are only using dummy data for emptyListMsg
        // and isLoading to fix typing issue.
        // emptyListMsg and isLoading are spread over the Context provider
        // later in the code.
        isLoading: false,
        emptyListMsg: ''
    }
}

export const LandingPageList = (props: TLandingPageListProps) => {
    const { data, isLoading, emptyListMsg } = props

    const initialReducer = useMemo(
        () => getLandingPageListReducerFromProps(props),
        []
    )

    const isMounted = useRef(false)

    const [state, dispatch] = useReducer(landingPageListReducer, initialReducer)

    const updateState = (data: Partial<TLandingPageReducer>) => {
        dispatch({ type: UpdateState, data })
    }

    useEffect(() => {
        if (isMounted) {
            updateState(getLandingPageListReducerFromProps(props))
        }
        isMounted.current = true
    }, [data])

    return (
        <LandingPageListContext.Provider
            value={{
                ...state,
                isLoading,
                emptyListMsg,
                updateState
            }}
        >
            <LandingPageListContainer />
        </LandingPageListContext.Provider>
    )
}
