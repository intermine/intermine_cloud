type TLandingPageListID = string

export type TLandingPageListHeaderItem = {
    id: TLandingPageListID
    heading: string
    body: string
}

export type TLandingPageListBodyItem = {
    content: string
}

export type TLandingPageListDatum = {
    id: TLandingPageListID
    headerItems: Array<TLandingPageListHeaderItem>
    bodyItem: TLandingPageListBodyItem
}

export type TLandingPageListProps = {
    data: Array<TLandingPageListDatum>
}

export type TLandingPageReducer = {
    lists: TLandingPageListProps['data']
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
