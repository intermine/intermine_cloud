/**
 * There are other properties as well, but here
 * we are only add those properties which we want.
 */
export type TDatasetResponseData = {
    msg: string
    items: Array<{
        data_id: string
        name: string
        file_id: string
        file_type: string
        ext: string
        description: string
    }>
}
