import { createMachine, assign } from 'xstate'

export type TUploadDatasetMachineContext = {
    file?: File
    errorMessage?: string
    putUrl?: string
}

export type TUploadDatasetState =
    | {
          value: 'start'
          context: TUploadDatasetMachineContext
      }
    | {
          value: 'fileMissing'
          context: TUploadDatasetMachineContext
      }
    | {
          value: 'fileSelected'
          context: TUploadDatasetMachineContext
      }
    | {
          value: 'uploadingFile'
          context: TUploadDatasetMachineContext
      }
    | {
          value: 'serverError'
          context: TUploadDatasetMachineContext
      }
    | {
          value: 'successful'
          context: TUploadDatasetMachineContext
      }
    | {
          value: 'reset'
          context: TUploadDatasetMachineContext
      }

export type TUploadDatasetMachineEvents =
    | { type: 'START' }
    | { type: 'FILE_MISSING' }
    | { type: 'FILE_SELECTED'; file: File }
    | { type: 'UPLOADING_FILE' }
    | { type: 'SERVER_ERROR' }
    | { type: 'SUCCESSFUL' }
    | { type: 'RESET' }

export const uploadDatasetMachine = createMachine<
    TUploadDatasetMachineContext,
    TUploadDatasetMachineEvents,
    TUploadDatasetState
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
            setFile: assign<
                TUploadDatasetMachineContext,
                TUploadDatasetMachineEvents
            >({
                file: (ctx, event) => {
                    if (event.type === 'FILE_SELECTED') {
                        return event.file
                    }
                    return ctx.file
                },
            }),
            reset: assign<
                TUploadDatasetMachineContext,
                TUploadDatasetMachineEvents
            >({
                file: undefined,
                putUrl: undefined,
                errorMessage: undefined,
            }),

            onUploadSuccessful: assign<TUploadDatasetMachineContext, any>({
                putUrl: (_, event) => {
                    return event.data
                },
            }),

            onUploadError: assign<TUploadDatasetMachineContext, any>({
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
