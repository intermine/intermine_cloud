import { Box } from '@intermine/chromatin/box'
import { createStyle } from '@intermine/chromatin/styles'

import { DashboardForm } from '../../common/dashboard-form'

const dummyTemplateOptions = [
    { label: 'HumanMine', value: 'template-1' },
    { label: 'CovidMine', value: 'template-2' },
    { label: 'FlyMine', value: 'template-3' },
    { label: 'RatMine', value: 'template-4' }
]

const dummyDatasetsOptions = [
    { label: 'Dataset 1', value: 'template-1' },
    { label: 'Dataset 2', value: 'template-2' },
    { label: 'Dataset 3', value: 'template-3' },
    { label: 'Dataset 4', value: 'template-4' },
    { label: 'Dataset 5', value: 'template-5' },
    { label: 'Dataset 6', value: 'template-6' },
    { label: 'Dataset 7', value: 'template-7' },
    { label: 'Dataset 8', value: 'template-8' },
    { label: 'Dataset 9', value: 'template-9' },
    { label: 'Dataset 10', value: 'template-10' }
]

const useStyles = createStyle((theme) => {
    const {
        spacing,
        palette: { neutral, grey, themeType }
    } = theme

    return {
        subdomainInput: {
            '&&': {
                borderRadius: '0.25rem 0 0 0.25rem',
                textAlign: 'right'
            }
        },
        intermineBox: {
            flex: 1,
            background: themeType === 'dark' ? neutral[10] : grey[20],
            borderRadius: '0 0.25rem 0.25rem 0',
            padding: spacing(1, 2, 1, 1)
        }
    }
})

export const Form = () => {
    const classes = useStyles()

    return (
        <DashboardForm>
            <DashboardForm.Wrapper>
                <DashboardForm.Heading>Create a Mine</DashboardForm.Heading>
                <Box>
                    <DashboardForm.Label
                        main="Select a template"
                        sub="Make sure you have already uploaded the template.
                            There are also some of the pre-existing templates."
                    >
                        <DashboardForm.Select options={dummyTemplateOptions} />
                    </DashboardForm.Label>
                    <DashboardForm.Label
                        main="Select dataset(s)"
                        sub="Make sure you have already uploaded the dataset.
                        You can select multiple dataset."
                    >
                        <DashboardForm.Select
                            closeMenuOnSelect={false}
                            options={dummyDatasetsOptions}
                            isMulti
                        />
                    </DashboardForm.Label>
                    <DashboardForm.Label
                        main="Name of your new Mine"
                        sub="This will be the name under which your mine is
                            publicly available. Some examples are HumanMine,
                            FlyMine, CovidMine, etc."
                    >
                        <DashboardForm.Input placeholder="Enter mine name" />
                    </DashboardForm.Label>
                    <DashboardForm.Label
                        main="Describe your Mine"
                        sub="This will help other users to get an idea about 
                            your mine. You can write something like: 
                            An integrated data warehouse for..."
                    >
                        <DashboardForm.Input
                            rows={5}
                            Component="textarea"
                            placeholder="Description of your mine"
                        />
                    </DashboardForm.Label>
                    <DashboardForm.Label
                        main="Sub Domain"
                        sub="We will host your newly built mine under this
                            sub-domain. Please don't include any special
                            character."
                    >
                        <Box display="flex">
                            <DashboardForm.Input
                                classes={{ inputRoot: classes.subdomainInput }}
                                placeholder="my-first-intermine-database"
                            />
                            <Box
                                isContentCenter
                                className={classes.intermineBox}
                            >
                                .intermine.org
                            </Box>
                        </Box>
                    </DashboardForm.Label>

                    <DashboardForm.Actions
                        actions={[
                            { color: 'warning', children: 'Reset' },
                            { color: 'primary', children: 'Create Mine' }
                        ]}
                    />
                </Box>
            </DashboardForm.Wrapper>
        </DashboardForm>
    )
}
