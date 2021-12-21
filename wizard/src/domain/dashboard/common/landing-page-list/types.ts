type TLandingPageListID = string
type TElement = React.ReactChild | React.ReactChild[]

export type TLandingPageListHeaderItem = {
    id: TLandingPageListID
    heading: TElement
    body: TElement
}

export type TLandingPageListBodyItem = {
    content: TElement
}

export type TLandingPageListDatum = {
    id: TLandingPageListID
    headerItems: Array<TLandingPageListHeaderItem>
    bodyItem: TLandingPageListBodyItem
}

export type TLandingPageListProps = {
    data: Array<TLandingPageListDatum>
    emptyListMsg: TElement
    isLoading: boolean
}

export type TLandingPageReducer = {
    lists: TLandingPageListProps['data']
    emptyListMsg: TElement
    isLoading: boolean
    listsObj: {
        [X in string]: TLandingPageListDatum & {
            upItemId: string
            downItemId: string
        }
    }
    activeItemId: TLandingPageListID
    upItemId: TLandingPageListID
    downItemId: TLandingPageListID
}

export type TLandingPageListContext = TLandingPageReducer & {
    updateState: (data: Partial<TLandingPageReducer>) => void
}

export enum LandingPageListActions {
    UpdateState = 'UpdateState',
}

export type TLandingPageListReducerAction = {
    type: LandingPageListActions
    data: Partial<TLandingPageReducer>
}
