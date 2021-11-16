export enum ProgressActions {
    UploadData = 'UploadData',
    UpdateDataProgress = 'UpdateDataProgress',
    StopDataUploading = 'StopDataUploading',
    RemoveEntry = 'RemoveEntry',
    BuildMine = 'BuildMine',
}

export enum ProgressItemUploadStatus {
    Uploading = 'Uploading',
    Canceled = 'Canceled',
    Uploaded = 'Uploaded',
    Failed = 'Failed',
}
