import { LandingPageListContext } from './landing-page-context'
import { useMemo, useReducer } from 'react'
import {
    LandingPageListActions,
    TLandingPageListProps,
    TLandingPageListReducerAction,
    TLandingPageReducer
} from './types'
import { LandingPageListContainer } from './components'

const { UpdateState } = LandingPageListActions
const landingPageListReducer = (
    state: TLandingPageReducer,
    action: TLandingPageListReducerAction
) => {
    switch (action.type) {
        case UpdateState:
            state = { ...state, ...action.data }
            return state

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
        listsObj
    }
}

export const LandingPageList = (props: TLandingPageListProps) => {
    const initialReducer = useMemo(
        () => getLandingPageListReducerFromProps(props),
        [props.data]
    )
    const [state, dispatch] = useReducer(landingPageListReducer, initialReducer)

    const updateState = (data: Partial<TLandingPageReducer>) => {
        dispatch({ type: UpdateState, data })
    }

    return (
        <LandingPageListContext.Provider value={{ ...state, updateState }}>
            <LandingPageListContainer />
        </LandingPageListContext.Provider>
    )
}
