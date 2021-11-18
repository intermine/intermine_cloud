import { Switch, Route } from 'react-router'

import {
    DASHBOARD_TEMPLATES_LANDING_PATH,
    DASHBOARD_UPLOAD_TEMPLATE_PATH
} from '../../../routes'
import { Landing } from './landing'
import { UploadTemplate } from './upload-template'

const pages = [
    {
        id: 'landing',
        path: DASHBOARD_TEMPLATES_LANDING_PATH,
        Component: Landing
    },
    {
        id: 'upload-template',
        path: DASHBOARD_UPLOAD_TEMPLATE_PATH,
        Component: UploadTemplate
    }
]

export const Templates = () => {
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
