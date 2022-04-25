import { useForm, Controller } from 'react-hook-form'
import { DASHBOARD_CLUSTERS_LANDING_PATH } from '../../../../routes'
import { DashboardForm as DForm } from '../../common/dashboard-form'
import {
    createClusterDefaultFieldsValues,
    TCreateClusterFormFields
} from './form-utils'

export const CreateCluster = () => {
    const {
        control,
        reset,
        handleSubmit,
        formState: { errors, isSubmitting }
    } = useForm<TCreateClusterFormFields>({
        defaultValues: createClusterDefaultFieldsValues
    })

    const onResetClick = () => {
        reset()
    }

    const onFormSubmit = (data: TCreateClusterFormFields) => {
        console.log(data)
    }

    return (
        <DForm isDirty={false} onSubmit={handleSubmit(onFormSubmit)}>
            <DForm.PageHeading
                landingPageUrl={DASHBOARD_CLUSTERS_LANDING_PATH}
                pageHeading="Clusters"
            />
            <DForm.Wrapper>
                <DForm.Label
                    isDisabled={isSubmitting}
                    main="Cluster Name"
                    sub="This will help to identify your cluster."
                    hasAsterisk
                    errorMsg={errors.name?.message}
                    isError={Boolean(errors.name)}
                >
                    <Controller
                        render={({ field }) => (
                            <DForm.Input
                                {...field}
                                isDisabled={isSubmitting}
                                placeholder="Cluster Name"
                                isError={Boolean(errors.name)}
                            />
                        )}
                        control={control}
                        name="name"
                        rules={{
                            required: 'Cluster Name is required'
                        }}
                    />
                </DForm.Label>

                <DForm.Label
                    isDisabled={isSubmitting}
                    main="Cluster Type"
                    sub=""
                    hasAsterisk
                    errorMsg={errors.clusterType?.message}
                    isError={Boolean(errors.clusterType)}
                >
                    <Controller
                        render={({ field }) => (
                            <DForm.Input
                                {...field}
                                isDisabled={isSubmitting}
                                placeholder="Cluster Type"
                                isError={Boolean(errors.clusterType)}
                            />
                        )}
                        control={control}
                        name="clusterType"
                        rules={{
                            required: 'Cluster Type is required'
                        }}
                    />
                </DForm.Label>

                <DForm.Label
                    isDisabled={isSubmitting}
                    main="Messenger"
                    sub="Messenger used by cluster"
                    hasAsterisk
                    errorMsg={errors.messenger?.message}
                    isError={Boolean(errors.messenger)}
                >
                    <Controller
                        render={({ field }) => (
                            <DForm.Input
                                {...field}
                                isDisabled={isSubmitting}
                                placeholder="Messenger"
                                isError={Boolean(errors.messenger)}
                            />
                        )}
                        control={control}
                        name="messenger"
                        rules={{
                            required: 'Messenger is required'
                        }}
                    />
                </DForm.Label>

                <DForm.Label
                    isDisabled={isSubmitting}
                    main="Messenger Queue"
                    sub=""
                    hasAsterisk
                    errorMsg={errors.messengerQueue?.message}
                    isError={Boolean(errors.messengerQueue)}
                >
                    <Controller
                        render={({ field }) => (
                            <DForm.Input
                                {...field}
                                isDisabled={isSubmitting}
                                placeholder="Messenger Queue"
                                isError={Boolean(errors.messengerQueue)}
                            />
                        )}
                        control={control}
                        name="messengerQueue"
                        rules={{
                            required: 'Messenger Queue is required'
                        }}
                    />
                </DForm.Label>

                <DForm.Actions
                    actions={[
                        {
                            color: 'warning',
                            children: 'Reset',
                            key: 'reset',
                            type: 'button',
                            onClick: onResetClick
                        },
                        {
                            color: 'primary',
                            children: 'Create Cluster',
                            key: 'create',
                            type: 'submit'
                        }
                    ]}
                />
            </DForm.Wrapper>
        </DForm>
    )
}
