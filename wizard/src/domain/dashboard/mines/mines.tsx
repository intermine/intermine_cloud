import { Switch, Route } from 'react-router'

import {
    DASHBOARD_MINES_LANDING_PATH,
    DASHBOARD_CREATE_MINE_PATH
} from '../../../routes'
import { Landing } from './landing'
import { CreateMine } from './create-mine'

const pages = [
    {
        id: 'landing',
        path: DASHBOARD_MINES_LANDING_PATH,
        Component: Landing
    },
    {
        id: 'create-mine',
        path: DASHBOARD_CREATE_MINE_PATH,
        Component: CreateMine
    }
]

export const Mines = () => {
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
