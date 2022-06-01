import { Switch, Route } from 'react-router'

import {
    DASHBOARD_CLUSTERS_LANDING_PATH,
    DASHBOARD_CREATE_CLUSTER_PATH
} from '../../../routes'
import { Landing } from './landing'
import { CreateCluster } from './create-cluster'

const pages = [
    {
        id: 'landing',
        path: DASHBOARD_CLUSTERS_LANDING_PATH,
        Component: Landing
    },
    {
        id: 'create-cluster',
        path: DASHBOARD_CREATE_CLUSTER_PATH,
        Component: CreateCluster
    }
]

export const Cluster = () => {
    return (
        <Switch>
            {pages.map(({ id, path, Component }) => (
                <Route path={path} key={id} exact>
                    <Component />
                </Route>
            ))}
        </Switch>
    )
}
