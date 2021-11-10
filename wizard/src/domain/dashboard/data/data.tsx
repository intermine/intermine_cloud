import { Switch, Route } from 'react-router'

import {
    DASHBOARD_DATA_LANDING_PATH,
    DASHBOARD_DATA_UPLOAD_DATA_PATH
} from '../../../routes'
import { Landing } from './landing'
import { UploadData } from './upload-data'

const pages = [
    {
        id: 'landing',
        path: DASHBOARD_DATA_LANDING_PATH,
        Component: Landing
    },
    {
        id: 'upload-data',
        path: DASHBOARD_DATA_UPLOAD_DATA_PATH,
        Component: UploadData
    }
]

export const Data = () => {
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
