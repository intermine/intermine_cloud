import { useEffect, useState } from 'react'
import { Box } from '@intermine/chromatin/box'
import { FormControlLabel } from '@intermine/chromatin/form-control-label'
import { Radio } from '@intermine/chromatin/radio'
import { RadioGroup } from '@intermine/chromatin/radio-group'
import { createStyle } from '@intermine/chromatin/styles'
import { InlineAlertProps } from '@intermine/chromatin/inline-alert'
import { useForm, Controller } from 'react-hook-form'

import { DASHBOARD_MINES_LANDING_PATH } from '../../../../routes'
import { dataApi, mineApi, templateApi } from '../../../../services/api'
import { DashboardForm as DForm } from '../../common/dashboard-form'
import { useDashboardQuery } from '../../hooks'
import {
    TSelectOption,
    datasetsValidator,
    subDomainNameValidator,
    templateValidator
} from './form-utils'

type TCreateMineFormFields = {
    template: TSelectOption
    datasets: TSelectOption[]
    subDomain: string
    name: string
    description: string
    action: 'build' | 'build-deploy'
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
    const [inlineAlertProps, setInlineAlertProps] = useState<InlineAlertProps>(
        {}
    )

    const _setInlineAlert = (p: InlineAlertProps) => {
        setInlineAlertProps({
            onClose: () => setInlineAlertProps({ isOpen: false }),
            isOpen: true,
            isDense: true,
            ...p
        })
    }

    const {
        reset,
        control,
        formState: { isDirty, errors, isSubmitting },
        handleSubmit
    } = useForm<TCreateMineFormFields>({
        defaultValues: {
            action: 'build',
            datasets: [],
            description: '',
            name: '',
            subDomain: '',
            template: {}
        }
    })

    const resetForm = () => {
        reset()
    }

    // const { onProgressStart, onProgressUpdate, onProgressSuccessful } =
    //     useOnProgress()

    const submitForm = async (data: TCreateMineFormFields) => {
        console.log(data)
        const { action, datasets, description, name, subDomain, template } =
            data
        try {
            const response = await mineApi.minePost({
                mine_list: [
                    {
                        data_file_ids: datasets.map((v) => v.value),
                        name,
                        subdomain: subDomain,
                        template_id: template.value,
                        description,
                        preference: {}
                    }
                ]
            })

            console.log('Response', response)

            // Add action

            _setInlineAlert({
                message: 'Mine created successfully',
                type: 'success'
            })
            resetForm()
        } catch (error) {
            _setInlineAlert({
                message: 'Something went wrong. Please try again',
                type: 'error'
            })

            console.error(error)
        }
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
        <DForm isDirty={isDirty} onSubmit={handleSubmit(submitForm)}>
            <DForm.PageHeading
                landingPageUrl={DASHBOARD_MINES_LANDING_PATH}
                pageHeading="Mines"
            />
            <DForm.Wrapper>
                <DForm.InlineAlert {...inlineAlertProps} />
                <DForm.Heading>Create a Mine</DForm.Heading>
                <Box>
                    <DForm.Label
                        main="Select a template"
                        sub="Make sure you have already uploaded the 
                            template. There are also some of the pre-existing 
                            templates."
                        isError={Boolean(errors.template)}
                        errorMsg="Template is required"
                        hasAsterisk
                    >
                        <Controller
                            render={({ field }) => (
                                <DForm.Select
                                    {...field}
                                    options={templateOptions}
                                    placeholder="Select template"
                                    isLoading={isLoading}
                                    isDisabled={isSubmitting}
                                    isError={Boolean(errors.template)}
                                />
                            )}
                            name="template"
                            control={control}
                            rules={{
                                validate: templateValidator
                            }}
                        />
                    </DForm.Label>

                    <DForm.Label
                        main="Select dataset(s)"
                        sub="Make sure you have already uploaded the
                            dataset. You can select multiple dataset."
                        isError={Boolean(errors.datasets)}
                        errorMsg={`Dataset is required.
                        Please select at least one dataset`}
                        hasAsterisk
                    >
                        <Controller
                            render={({ field }) => (
                                <DForm.Select
                                    {...field}
                                    closeMenuOnSelect={false}
                                    options={datasetOptions}
                                    isMulti
                                    isLoading={isLoading}
                                    isDisabled={isSubmitting}
                                    isError={Boolean(errors.datasets)}
                                />
                            )}
                            name="datasets"
                            control={control}
                            rules={{
                                validate: datasetsValidator
                            }}
                        />
                    </DForm.Label>

                    <DForm.Label
                        main="Name of your new Mine"
                        sub="This will be the name under which your mine is
                            publicly available. Some examples are HumanMine,
                            FlyMine, CovidMine, etc."
                        isError={Boolean(errors.name)}
                        hasAsterisk
                        errorMsg="Name is required"
                    >
                        <Controller
                            render={({ field }) => (
                                <DForm.Input
                                    {...field}
                                    isDisabled={isSubmitting}
                                    isError={Boolean(errors.name)}
                                    placeholder="Enter mine name"
                                />
                            )}
                            control={control}
                            name="name"
                            rules={{
                                required: true
                            }}
                        />
                    </DForm.Label>

                    <DForm.Label
                        main="Describe your Mine"
                        sub="This will help other users to get an 
                            idea about your mine. You can write something 
                            like: An integrated data warehouse for..."
                    >
                        <Controller
                            render={({ field }) => (
                                <DForm.Input
                                    {...field}
                                    rows={5}
                                    isDisabled={isSubmitting}
                                    Component="textarea"
                                    placeholder="Description of your mine"
                                />
                            )}
                            control={control}
                            name="description"
                        />
                    </DForm.Label>

                    <DForm.Label
                        hasAsterisk
                        main="Sub Domain"
                        sub="We will host your newly built mine under this
                            sub-domain. Please don't include any special
                            character."
                        isError={Boolean(errors.subDomain)}
                        errorMsg={errors.subDomain?.message}
                    >
                        <Box display="flex">
                            <Controller
                                render={({ field }) => (
                                    <DForm.Input
                                        {...field}
                                        classes={{
                                            inputRoot: classes.subdomainInput
                                        }}
                                        // eslint-disable-next-line max-len
                                        placeholder="my-first-intermine-database"
                                        isError={Boolean(errors.subDomain)}
                                        isDisabled={isSubmitting}
                                    />
                                )}
                                control={control}
                                name="subDomain"
                                rules={{
                                    required: 'Sub domain is required',
                                    validate: subDomainNameValidator
                                }}
                            />
                            <Box
                                isContentCenter
                                className={classes.intermineBox}
                            >
                                .intermine.org
                            </Box>
                        </Box>
                        {/* 
                            <Box>
                                Add error message here
                            </Box> 
                        */}
                    </DForm.Label>
                    <DForm.Label
                        main="Action"
                        sub="Select whether you only want to build this
                        mine or you want to build and deploy."
                        csx={{ root: { marginBottom: 0 } }}
                    />
                    <Controller
                        render={({ field }) => (
                            <RadioGroup {...field} name="action">
                                <FormControlLabel
                                    control={
                                        <Radio
                                            value="build"
                                            isDisabled={isSubmitting}
                                        />
                                    }
                                    label="Build"
                                />
                                <FormControlLabel
                                    control={
                                        <Radio
                                            value="build-deploy"
                                            isDisabled={isSubmitting}
                                        />
                                    }
                                    label="Build & Deploy"
                                />
                            </RadioGroup>
                        )}
                        control={control}
                        name="action"
                    />
                    <DForm.Actions
                        actions={[
                            {
                                color: 'warning',
                                children: 'Reset',
                                key: 'reset',
                                onClick: resetForm,
                                isDisabled: isSubmitting
                            },
                            {
                                color: 'primary',
                                children: 'Create Mine',
                                key: 'create',
                                type: 'submit',
                                isDisabled: isSubmitting,
                                isLoading: isSubmitting
                            }
                        ]}
                    />
                </Box>
            </DForm.Wrapper>
        </DForm>
    )
}
