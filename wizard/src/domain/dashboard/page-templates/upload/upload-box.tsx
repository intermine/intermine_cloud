import { InlineAlert } from '@intermine/chromatin/inline-alert'
import { Box } from '@intermine/chromatin/box'
import { Button } from '@intermine/chromatin/button'

import { Upload, TUploadProps } from '../../common/upload'

type TUploadBoxProps = Omit<TUploadProps, 'children'> & {
    heading: string
    sub: string
}

export const UploadBox = (props: TUploadBoxProps) => {
    const { uploadHandler, uploadBaseUrl, heading, sub } = props

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
                            heading={{ children: heading }}
                            sub={{ children: sub }}
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
                                Upload
                            </Button>
                        </Box>
                    </Box>
                )}
            </Upload>
        </Box>
    )
}
