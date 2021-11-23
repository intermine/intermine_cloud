import { Box } from '@intermine/chromatin/box'

import { DASHBOARD_DATASETS_LANDING_PATH } from '../../../routes'
import { DashboardForm as DForm } from '../common/dashboard-form'
import { UploadPage } from '../page-templates/upload'

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
                    <DForm>
                        <DForm.Wrapper>
                            <DForm.Heading>Upload New Dataset</DForm.Heading>
                            <DForm.Label
                                main="Name"
                                sub="Name of your dataset."
                            >
                                <DForm.Input placeholder="Dataset Name" />
                            </DForm.Label>
                            <DForm.Label
                                main="Describe your Dataset"
                                sub="This will help other users to
                                    get an idea about this dataset. 
                                    You can write something like: A dataset 
                                    having information about..."
                            >
                                <DForm.Input
                                    rows={5}
                                    Component="textarea"
                                    placeholder="Description of your mine"
                                />
                            </DForm.Label>
                            <DForm.Label
                                main="Select a file"
                                sub="You can select .fasta, 
                                                .tsv, .cst, .etc"
                            >
                                <UploadPage.UploadBox
                                    uploadBaseUrl={uploadEndpoint}
                                    uploadHandler={uploadHandler}
                                />
                            </DForm.Label>
                            <Box>
                                <DForm.Actions
                                    actions={[
                                        {
                                            key: 'reset',
                                            children: 'Reset',
                                            color: 'warning'
                                        },
                                        {
                                            key: 'upload',
                                            color: 'primary',
                                            children: 'Upload Dataset'
                                        }
                                    ]}
                                />
                            </Box>
                        </DForm.Wrapper>
                    </DForm>
                </Box>
            )}
        </UploadPage>
    )
}
