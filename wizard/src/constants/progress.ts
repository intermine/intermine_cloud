export enum ProgressActions {
    AddItemToProgress = 'AddItemToProgress',
    UpdateProgressItem = 'UpdateProgressItem',
    RemoveItemFromProgress = 'RemoveItemFromProgress',
    AddActiveItem = 'AddActiveItem',
    RemoveActiveItem = 'RemoveActiveItem',
}

export enum ProgressItemUploadStatus {
    Running = 'Running',
    Canceled = 'Canceled',
    Completed = 'Completed',
    Failed = 'Failed',
}
