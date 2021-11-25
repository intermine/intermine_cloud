import { createMachine, assign } from 'xstate'

export type TUploadMachineContext = {
    file?: File
    errorMessage?: string
    putUrl?: string
    baseURL: string
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

export type TUploadMachineEvents =
    | { type: 'START' }
    | { type: 'FILE_MISSING' }
    | { type: 'FILE_SELECTED'; file: File }
    | { type: 'GENERATE_PRESIGNED_URL' }
    | { type: 'SERVER_ERROR' }
    | { type: 'SUCCESSFUL' }
    | { type: 'RESET' }

export const uploadMachine = createMachine<
    TUploadMachineContext,
    TUploadMachineEvents,
    TUploadMachineState
>(
    {
        id: 'upload-data-machine',
        initial: 'start',
        context: {
            baseURL: '',
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
                    return event.data
                },
            }),

            OnServerError: assign<TUploadMachineContext, any>({
                errorMessage:
                    'Unexpected error occur. Please try after some time',
            }),
        },
        services: {
            generatePresignedURL: (ctx) =>
                fetch(ctx.baseURL + ctx.file?.name)
                    .then((response) => response.text())
                    .then((url) => url),
        },
    }
)
