import { useEffect, useState } from 'react'
import { Box } from '@intermine/chromatin'
import { createStyle } from '@intermine/chromatin/styles'

import { DASHBOARD_MINES_LANDING_PATH } from '../../../../routes'
import { dataApi, templateApi } from '../../../../services/api'
import { DashboardForm as DForm } from '../../common/dashboard-form'
import { useDashboardForm } from '../../common/dashboard-form/utils'
import { useDashboardQuery } from '../../common/use-dashboard-query'
import { useOnProgress } from '../../utils/hooks'
import { initialFormFieldsValue } from './form-utils'

type TSelectOption = {
    label: string
    value: string
}

const fetchTemplatesAndDatasets = async () => {
    const datasetResponse = await dataApi.dataGet('get_all_data')
    const templateResponse = await templateApi.templateGet('get_all_templates')

    const datasets: TSelectOption[] = []
    const templates: TSelectOption[] = []

    for (const data of datasetResponse.data.items.data_list) {
        datasets.push({
            label: data.name,
            value: data.data_id
        })
    }

    for (const template of templateResponse.data.items.template_list) {
        templates.push({
            label: template.name,
            value: template.template_id
        })
    }

    return {
        datasets,
        templates
    }
}

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
    const [templateOptions, setTemplatesOptions] = useState<TSelectOption[]>([])
    const [datasetOptions, setDatasetOptions] = useState<TSelectOption[]>([])

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

    const { onProgressStart, onProgressUpdate, onProgressSuccessful } =
        useOnProgress()

    const submitForm = () => {
        onProgressStart({
            id: subDomain.value,
            getProgressText: (loadedSize, totalSize) =>
                `${loadedSize}/${totalSize} steps`,
            isDependentOnBrowser: false,
            loadedSize: 1,
            totalSize: 11,
            name: name.value,
            onCancel: () => console.log('Cancel'),
            onRetry: () => console.log('Retry')
        })

        let l = 1
        const i = setInterval(() => {
            console.log(l)
            onProgressUpdate({ id: subDomain.value, loadedSize: ++l })
            if (l === 11) {
                onProgressSuccessful({
                    id: subDomain.value,
                    successMsg: name.value + ' is successfully created.',
                    to: {
                        pathname: 'http://bluegenes.apps.intermine.org/flymine'
                    }
                })
                clearInterval(i)
            }
        }, 100)

        resetForm()
    }

    const onFetchSuccessful = (response: {
        datasets: TSelectOption[]
        templates: TSelectOption[]
    }) => {
        const { datasets, templates } = response
        setDatasetOptions(datasets)
        setTemplatesOptions(templates)
    }

    const { query, isLoading } = useDashboardQuery({
        queryFn: fetchTemplatesAndDatasets,
        onSuccessful: onFetchSuccessful
    })

    useEffect(() => {
        query()
    }, [])

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
                            options={templateOptions}
                            placeholder="Select template"
                            isLoading={isLoading}
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
                            options={datasetOptions}
                            isMulti
                            isLoading={isLoading}
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
                        <Box>
                            {initialFormFieldsValue?.subDomain?.options
                                ?.validator &&
                                initialFormFieldsValue?.subDomain?.options?.validator(
                                    subDomain.value
                                ).isError === false &&
                                'Checking whether this subdomain is available or not'}
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
                                    handleFormSubmit(() => submitForm())
                            }
                        ]}
                    />
                </Box>
            </DForm.Wrapper>
        </DForm>
    )
}
