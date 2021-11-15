import { createMachine, assign } from 'xstate'

export type TUploadDataMachineContext = {
    file?: File
    errorMessage?: string
    putUrl?: string
}

export type TUploadDataState =
    | {
          value: 'start'
          context: TUploadDataMachineContext
      }
    | {
          value: 'fileMissing'
          context: TUploadDataMachineContext
      }
    | {
          value: 'fileSelected'
          context: TUploadDataMachineContext
      }
    | {
          value: 'uploadingFile'
          context: TUploadDataMachineContext
      }
    | {
          value: 'serverError'
          context: TUploadDataMachineContext
      }
    | {
          value: 'successful'
          context: TUploadDataMachineContext
      }
    | {
          value: 'reset'
          context: TUploadDataMachineContext
      }

export type TUploadDataMachineEvents =
    | { type: 'START' }
    | { type: 'FILE_MISSING' }
    | { type: 'FILE_SELECTED'; file: File }
    | { type: 'UPLOADING_FILE' }
    | { type: 'SERVER_ERROR' }
    | { type: 'SUCCESSFUL' }
    | { type: 'RESET' }

export const uploadDataMachine = createMachine<
    TUploadDataMachineContext,
    TUploadDataMachineEvents,
    TUploadDataState
>(
    {
        id: 'upload-data-machine',
        initial: 'start',
        context: {},
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
            setFile: assign<
                TUploadDataMachineContext,
                TUploadDataMachineEvents
            >({
                file: (ctx, event) => {
                    if (event.type === 'FILE_SELECTED') {
                        return event.file
                    }
                    return ctx.file
                },
            }),
            reset: assign<TUploadDataMachineContext, TUploadDataMachineEvents>({
                file: undefined,
                putUrl: undefined,
                errorMessage: undefined,
            }),

            onUploadSuccessful: assign<TUploadDataMachineContext, any>({
                putUrl: (_, event) => {
                    return event.data
                },
            }),
            onUploadError: assign<TUploadDataMachineContext, any>({
                errorMessage:
                    'Unexpected error occur. Please try after some time',
            }),
        },
        services: {
            uploadFile: (ctx) =>
                fetch(
                    'http://localhost:3000/presignedUrl?name=' + ctx.file?.name
                )
                    .then((response) => response.text())
                    .then((url) => url),
        },
    }
)
