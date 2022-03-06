import { createMachine, assign, ServiceMap } from 'xstate'

import { AxiosResponse } from 'axios'

import {
    getResponseMessageUsingResponseStatus,
    getResponseStatus,
} from '../../../../utils/get'
import { Data, ModelFile, Template } from '@intermine/compose-rest-client'

type TServerResponse = {
    msg?: string
    items: {
        data_list?: Array<Data>
        template_list?: Array<Template>
        file_list?: Array<ModelFile>
    }
}

export type TUploadMachineContext = {
    file: File
    errorMessage?: string
    response?: AxiosResponse<TServerResponse>
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
    TUploadMachineState,
    ServiceMap,
    any
>(
    {
        id: 'upload-machine',
        initial: 'start',
        context: {
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
                errorMessage: undefined,
            }),

            onPresignedURLGenerated: assign<TUploadMachineContext, any>({
                response: (_, event) => event.data,
            }),

            OnServerError: assign<TUploadMachineContext, any>({
                errorMessage: (_, event) => {
                    if (event.type.startsWith('error.platform')) {
                        const status = getResponseStatus(event.data.response)

                        return getResponseMessageUsingResponseStatus(
                            event.data.response,
                            status
                        )
                    }
                    return getResponseMessageUsingResponseStatus({}, 500)
                },
            }),
        },
        services: {
            generatePresignedURL: (ctx, event) => {
                console.log('Generating url')
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
