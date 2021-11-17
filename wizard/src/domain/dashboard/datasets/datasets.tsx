import { Switch, Route } from 'react-router'

import {
    DASHBOARD_DATASETS_LANDING_PATH,
    DASHBOARD_UPLOAD_DATASET_PATH
} from '../../../routes'
import { Landing } from './landing'
import { UploadDataset } from './upload-dataset'

const pages = [
    {
        id: 'landing',
        path: DASHBOARD_DATASETS_LANDING_PATH,
        Component: Landing
    },
    {
        id: 'upload-dataset',
        path: DASHBOARD_UPLOAD_DATASET_PATH,
        Component: UploadDataset
    }
]

export const Datasets = () => {
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
