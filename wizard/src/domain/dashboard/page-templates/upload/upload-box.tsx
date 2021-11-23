import { Box } from '@intermine/chromatin/box'

import { Upload, TUploadProps } from '../../common/dashboard-form/upload'

type TUploadBoxProps = Omit<TUploadProps, 'children'>

export const UploadBox = (props: TUploadBoxProps) => {
    const { uploadHandler, uploadBaseUrl } = props

    return (
        <Upload uploadBaseUrl={uploadBaseUrl} uploadHandler={uploadHandler}>
            {({ onInputChange, onDropHandler, uploadMachineState }) => (
                <Box>
                    <Upload.Box
                        onDropHandler={onDropHandler}
                        onInputChange={onInputChange}
                        isDisabled={
                            uploadMachineState.value === 'uploadingFile'
                        }
                    />
                    <Upload.FileInfo file={uploadMachineState.context.file} />
                </Box>
            )}
        </Upload>
    )
}
