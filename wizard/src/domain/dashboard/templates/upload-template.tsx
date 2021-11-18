import { Box } from '@intermine/chromatin/box'

import { DASHBOARD_TEMPLATES_LANDING_PATH } from '../../../routes'
import { UploadPage } from '../page-templates/upload'

const uploadEndpoint = 'http://localhost:3000/presignedUrl/template?name='

export const UploadTemplate = () => {
    return (
        <UploadPage>
            {({ uploadHandler }) => (
                <Box>
                    <UploadPage.UploadPageHeading
                        prevPageUrl={DASHBOARD_TEMPLATES_LANDING_PATH}
                        heading="Templates"
                    />
                    <UploadPage.UploadBox
                        heading="Upload New Template"
                        sub="Make sure to zip your template before uploading."
                        uploadBaseUrl={uploadEndpoint}
                        uploadHandler={uploadHandler}
                    />
                </Box>
            )}
        </UploadPage>
    )
}
