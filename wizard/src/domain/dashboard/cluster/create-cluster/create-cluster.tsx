import { DASHBOARD_CLUSTERS_LANDING_PATH } from '../../../../routes'
import { DashboardForm as DForm } from '../../common/dashboard-form'

export const CreateCluster = () => {
    return (
        <DForm isDirty={false}>
            <DForm.PageHeading
                landingPageUrl={DASHBOARD_CLUSTERS_LANDING_PATH}
                pageHeading="Clusters"
            />
            Create Cluster
            <DForm.Actions
                actions={[
                    {
                        color: 'warning',
                        children: 'Reset',
                        key: 'reset'
                    },
                    {
                        color: 'primary',
                        children: 'Create Cluster',
                        key: 'create',
                        type: 'submit'
                    }
                ]}
            />
        </DForm>
    )
}
