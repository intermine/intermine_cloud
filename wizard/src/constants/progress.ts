export enum ProgressActions {
    AddItemToProgress = 'AddItemToProgress',
    UpdateProgressItem = 'UpdateProgressItem',
    RemoveItemFromProgress = 'RemoveItemFromProgress',
    AddActiveItem = 'AddActiveItem',
    RemoveActiveItem = 'RemoveActiveItem',
}

export enum ProgressItemStatus {
    Running = 'Running',
    Canceled = 'Canceled',
    Completed = 'Completed',
    Failed = 'Failed',
}
