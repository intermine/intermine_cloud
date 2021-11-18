import { Box } from '@intermine/chromatin/box'

import { DASHBOARD_DATASETS_LANDING_PATH } from '../../../routes'
import { UploadPage } from '../templates/upload'

const uploadEndpoint = 'http://localhost:3000/presignedUrl/dataset?name='

export const UploadDataset = () => {
    return (
        <UploadPage>
            {({ uploadHandler }) => (
                <Box>
                    <UploadPage.UploadPageHeading
                        prevPageUrl={DASHBOARD_DATASETS_LANDING_PATH}
                        heading="Datasets"
                    />
                    <UploadPage.UploadBox
                        uploadBaseUrl={uploadEndpoint}
                        uploadHandler={uploadHandler}
                    />
                </Box>
            )}
        </UploadPage>
    )
}
