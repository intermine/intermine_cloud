import { Switch, Route, Redirect } from 'react-router-dom'
import { Box } from '@intermine/chromatin/box'

import { Login } from './login'
import { Register } from './register'
import { ForgotPassword } from './forgot-password'
import {
    LOGIN_PATH,
    PRE_AUTH_PATH_BASE,
    REGISTER_PATH,
    FORGOT_PASSWORD_PATH
} from '../../routes'

const routes = [
    {
        path: LOGIN_PATH,
        id: 'login',
        Component: Login
    },
    {
        path: REGISTER_PATH,
        id: 'register',
        Component: Register
    },
    {
        path: FORGOT_PASSWORD_PATH,
        id: 'forgot-password',
        Component: ForgotPassword
    }
]

const PreAuth = () => {
    return (
        <Box
            isContentCenter
            csx={{ root: { height: '100%', flexWrap: 'wrap' } }}
        >
            <Switch>
                <Redirect exact from={PRE_AUTH_PATH_BASE} to={LOGIN_PATH} />
                {routes.map(({ path, id, Component }) => (
                    <Route key={id} path={path}>
                        <Component />
                    </Route>
                ))}
            </Switch>
        </Box>
    )
}

export default PreAuth
