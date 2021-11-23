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
          value: 'uploadingFile'
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
    | { type: 'UPLOADING_FILE' }
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
                },
            },
            fileSelected: {
                entry: 'setFile',
                on: {
                    UPLOADING_FILE: 'uploadingFile',
                    FILE_SELECTED: 'fileSelected',
                },
            },
            uploadingFile: {
                invoke: {
                    src: 'uploadFile',
                    onDone: {
                        target: 'successful',
                        actions: 'onUploadSuccessful',
                    },
                    onError: {
                        target: 'serverError',
                        actions: 'onUploadError',
                    },
                },
            },
            serverError: {
                on: {
                    FILE_SELECTED: 'fileSelected',
                    UPLOADING_FILE: 'uploadingFile',
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

            onUploadSuccessful: assign<TUploadMachineContext, any>({
                putUrl: (_, event) => {
                    return event.data
                },
            }),

            onUploadError: assign<TUploadMachineContext, any>({
                errorMessage:
                    'Unexpected error occur. Please try after some time',
            }),
        },
        services: {
            uploadFile: (ctx) =>
                fetch(ctx.baseURL + ctx.file?.name)
                    .then((response) => response.text())
                    .then((url) => url),
        },
    }
)
