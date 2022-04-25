export type TCreateClusterFormFields = {
    name: string
    clusterType: string
    status: 'ONLINE'
    clusterCaps: string
    messenger: string
    messengerQueue: string
}

export const createClusterDefaultFieldsValues: TCreateClusterFormFields = {
    clusterCaps: '',
    clusterType: '',
    messenger: '',
    messengerQueue: '',
    name: '',
    status: 'ONLINE',
}
