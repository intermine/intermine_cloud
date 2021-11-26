import { Box } from '@intermine/chromatin'
import { createStyle } from '@intermine/chromatin/styles'

import { DASHBOARD_MINES_LANDING_PATH } from '../../../../routes'
import { DashboardForm as DForm } from '../../common/dashboard-form'
import { useDashboardForm } from '../../common/dashboard-form/utils'
import { initialFormFieldsValue } from './form-utils'

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

export const CreateMine = () => {
    const classes = useStyles()
    const {
        state,
        errorFields,
        isDirty,
        updateDashboardFormState,
        handleFormSubmit,
        resetToInitialState
    } = useDashboardForm(initialFormFieldsValue)

    const { subDomain, name, description, template, datasets } = state
    const {
        datasets: eDatasets,
        name: eName,
        subDomain: eSubDomain,
        template: eTemplate
    } = errorFields

    const resetForm = () => {
        resetToInitialState()
    }

    return (
        <DForm isDirty={isDirty}>
            <DForm.PageHeading
                landingPageUrl={DASHBOARD_MINES_LANDING_PATH}
                pageHeading="Mines"
            />
            <DForm.Wrapper>
                <DForm.Heading>Create a Mine</DForm.Heading>
                <Box>
                    <DForm.Label
                        main="Select a template"
                        sub="Make sure you have already uploaded the 
                            template. There are also some of the pre-existing 
                            templates."
                        isError={Boolean(eTemplate)}
                        errorMsg={eTemplate?.errorMsg}
                        hasAsterisk
                    >
                        <DForm.Select
                            value={template.value}
                            options={dummyTemplateOptions}
                            placeholder="Select template"
                            onChange={(val) =>
                                updateDashboardFormState('template', val)
                            }
                        />
                    </DForm.Label>
                    <DForm.Label
                        main="Select dataset(s)"
                        sub="Make sure you have already uploaded the
                            dataset. You can select multiple dataset."
                        isError={Boolean(eDatasets)}
                        errorMsg={eDatasets?.errorMsg}
                        hasAsterisk
                    >
                        <DForm.Select
                            closeMenuOnSelect={false}
                            value={datasets.value}
                            options={dummyDatasetsOptions}
                            isMulti
                            onChange={(val) =>
                                updateDashboardFormState('datasets', val)
                            }
                        />
                    </DForm.Label>
                    <DForm.Label
                        main="Name of your new Mine"
                        sub="This will be the name under which your mine is
                            publicly available. Some examples are HumanMine,
                            FlyMine, CovidMine, etc."
                        isError={Boolean(eName)}
                        hasAsterisk
                        errorMsg="Name is required"
                    >
                        <DForm.Input
                            value={name.value}
                            onChange={(event) =>
                                updateDashboardFormState(
                                    'name',
                                    event.currentTarget.value
                                )
                            }
                            placeholder="Enter mine name"
                            isError={Boolean(eName)}
                        />
                    </DForm.Label>
                    <DForm.Label
                        main="Describe your Mine"
                        sub="This will help other users to get an 
                            idea about your mine. You can write something 
                            like: An integrated data warehouse for..."
                    >
                        <DForm.Input
                            rows={5}
                            Component="textarea"
                            placeholder="Description of your mine"
                            value={description.value}
                            onChange={(event) =>
                                updateDashboardFormState(
                                    'description',
                                    event.currentTarget.value
                                )
                            }
                        />
                    </DForm.Label>
                    <DForm.Label
                        hasAsterisk
                        main="Sub Domain"
                        sub="We will host your newly built mine under this
                            sub-domain. Please don't include any special
                            character."
                        isError={Boolean(eSubDomain)}
                        errorMsg={eSubDomain?.errorMsg}
                    >
                        <Box display="flex">
                            <DForm.Input
                                classes={{
                                    inputRoot: classes.subdomainInput
                                }}
                                placeholder="my-first-intermine-database"
                                value={subDomain.value}
                                isError={Boolean(eSubDomain)}
                                onChange={(event) =>
                                    updateDashboardFormState(
                                        'subDomain',
                                        event.currentTarget.value
                                    )
                                }
                            />
                            <Box
                                isContentCenter
                                className={classes.intermineBox}
                            >
                                .intermine.org
                            </Box>
                        </Box>
                    </DForm.Label>

                    <DForm.Actions
                        actions={[
                            {
                                color: 'warning',
                                children: 'Reset',
                                key: 'reset',
                                onClick: resetForm
                            },
                            {
                                color: 'primary',
                                children: 'Create Mine',
                                key: 'create',
                                onClick: () =>
                                    handleFormSubmit((s) => console.log(s))
                            }
                        ]}
                    />
                </Box>
            </DForm.Wrapper>
        </DForm>
    )
}
