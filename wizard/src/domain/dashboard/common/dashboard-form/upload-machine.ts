import { createMachine, assign } from 'xstate'

import { AxiosResponse } from 'axios'

import {
    getResponseMessageUsingResponseStatus,
    getResponseStatus,
} from '../../../../utils/get'

type Model200Response = {
    msg?: string
    items: Array<{
        presigned_url: string
        name: string
        file_id: string
        description: string
        ext: string
    }>
}

export type TUploadMachineContext = {
    file: File
    putUrl: string
    errorMessage?: string
    response?: AxiosResponse<Model200Response>
}

export type TUploadMachineState =
    | {
          value: 'start'
          context: TUploadMachineContext
      }
    | {
          value: 'fileMissing'
          context: TUploadMachineContext
      }
    | {
          value: 'fileSelected'
          context: TUploadMachineContext
      }
    | {
          value: 'generatePresignedURL'
          context: TUploadMachineContext
      }
    | {
          value: 'serverError'
          context: TUploadMachineContext
      }
    | {
          value: 'successful'
          context: TUploadMachineContext
      }
    | {
          value: 'reset'
          context: TUploadMachineContext
      }

type TResponse = AxiosResponse

export type TServiceToGeneratePresignedURL = (
    ctx: TUploadMachineContext
) => Promise<unknown>

export type TUploadMachineEvents =
    | { type: 'START' }
    | { type: 'FILE_MISSING' }
    | { type: 'FILE_SELECTED'; file: File }
    | {
          type: 'GENERATE_PRESIGNED_URL'
          serviceToGeneratePresignedURL: TServiceToGeneratePresignedURL
      }
    | { type: 'SERVER_ERROR' }
    | { type: 'SUCCESSFUL' }
    | { type: 'RESET' }
    | { type: 'generatePresignedURL'; data: { response: TResponse } }

export const uploadMachine = createMachine<
    TUploadMachineContext,
    TUploadMachineEvents,
    TUploadMachineState
>(
    {
        id: 'upload-data-machine',
        initial: 'start',
        context: {
            putUrl: '',
            file: new File([], ''),
        },
        states: {
            start: {
                entry: 'reset',
                on: {
                    FILE_MISSING: 'fileMissing',
                    FILE_SELECTED: 'fileSelected',
                },
            },
            fileMissing: {
                on: {
                    FILE_SELECTED: 'fileSelected',
                    RESET: 'start',
                },
            },
            fileSelected: {
                entry: 'setFile',
                on: {
                    GENERATE_PRESIGNED_URL: 'generatePresignedURL',
                    FILE_SELECTED: 'fileSelected',
                    RESET: 'start',
                },
            },
            generatePresignedURL: {
                invoke: {
                    src: 'generatePresignedURL',
                    onDone: {
                        target: 'successful',
                        actions: 'onPresignedURLGenerated',
                    },
                    onError: {
                        target: 'serverError',
                        actions: 'OnServerError',
                    },
                },
            },
            serverError: {
                on: {
                    FILE_SELECTED: 'fileSelected',
                    GENERATE_PRESIGNED_URL: 'generatePresignedURL',
                    RESET: 'start',
                },
            },
            successful: {
                on: {
                    RESET: 'start',
                },
            },
        },
    },
    {
        actions: {
            setFile: assign<TUploadMachineContext, TUploadMachineEvents>({
                file: (ctx, event) => {
                    if (event.type === 'FILE_SELECTED') {
                        return event.file
                    }
                    return ctx.file
                },
            }),
            reset: assign<TUploadMachineContext, TUploadMachineEvents>({
                file: undefined,
                putUrl: undefined,
                errorMessage: undefined,
            }),

            onPresignedURLGenerated: assign<TUploadMachineContext, any>({
                putUrl: (_, event) => {
                    return event.data.data.items[0].presigned_url
                },
                response: (_, event) => event.data,
            }),

            OnServerError: assign<TUploadMachineContext, any>({
                errorMessage: (_, event) => {
                    if (event.type === 'error.platform.generatePresignedURL') {
                        const status = getResponseStatus(event.data.response)

                        return getResponseMessageUsingResponseStatus(
                            event.data.response,
                            status
                        )
                    }
                },
            }),
        },
        services: {
            generatePresignedURL: (ctx, event) => {
                if (event.type === 'GENERATE_PRESIGNED_URL') {
                    return event.serviceToGeneratePresignedURL(ctx)
                }

                throw new Error(
                    '[GeneratePresignedURL]: event type'.concat(
                        ' is not as expected. ',
                        'Got: ',
                        event.type
                    )
                )
            },
        },
    }
)
