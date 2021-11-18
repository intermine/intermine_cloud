import { InlineAlert } from '@intermine/chromatin/inline-alert'
import { Box } from '@intermine/chromatin/box'
import { Button } from '@intermine/chromatin/button'

import { Upload, TUploadProps } from '../../common/upload'

export const UploadBox = (props: Omit<TUploadProps, 'children'>) => {
    const { uploadHandler, uploadBaseUrl } = props

    return (
        <Box isContentCenter>
            <Upload uploadBaseUrl={uploadBaseUrl} uploadHandler={uploadHandler}>
                {({
                    inlineAlertProps,
                    uploadEventHandler,
                    onInputChange,
                    onDropHandler,
                    uploadMachineState
                }) => (
                    <Box csx={{ root: { maxWidth: '26rem', width: '100%' } }}>
                        <InlineAlert
                            hasFullWidth
                            csx={{
                                root: ({ spacing }) => ({
                                    marginBottom: spacing(5)
                                })
                            }}
                            {...inlineAlertProps}
                        />
                        <Upload.Heading
                            heading={{ children: 'Upload New Dataset' }}
                            sub={{
                                children:
                                    // eslint-disable-next-line max-len
                                    'You can select .fasta, .tsv, .csv, .etc'
                            }}
                        />
                        <Upload.Box
                            onDropHandler={onDropHandler}
                            onInputChange={onInputChange}
                            isDisabled={
                                uploadMachineState.value === 'uploadingFile'
                            }
                        />
                        <Upload.FileInfo
                            file={uploadMachineState.context.file}
                        />

                        <Box isContentCenter>
                            <Button
                                color="primary"
                                onClick={uploadEventHandler}
                                isLoading={
                                    uploadMachineState.value === 'uploadingFile'
                                }
                            >
                                Upload Dataset
                            </Button>
                        </Box>
                    </Box>
                )}
            </Upload>
        </Box>
    )
}
