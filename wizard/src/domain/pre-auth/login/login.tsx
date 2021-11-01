import { useContext } from 'react'
import { Link, useHistory } from 'react-router-dom'
import { Button } from '@intermine/chromatin/button'

import { AppContext } from '../../../context'
import { AuthStates } from '../../../constants/auth'
import { DomElementIDs } from '../../../constants/ids'
import {
    FORGOT_PASSWORD_PATH,
    REGISTER_PATH,
    DASHBOARD_OVERVIEW_PATH
} from '../../../routes'
import {
    Form,
    FormHeader,
    FormGroup,
    FormBody,
    FormAction
} from '../../../components/form'

export const Login = () => {
    const store = useContext(AppContext)
    const history = useHistory()
    const {
        authReducer: { updateAuthState }
    } = store

    return (
        <Form id={DomElementIDs.LoginForm}>
            <FormHeader heading="Login" />
            <FormBody>
                <FormGroup
                    label="Username"
                    inputProps={{ placeholder: 'Username' }}
                    errorMessage="Username Required"
                />

                <FormGroup
                    label="Password"
                    inputProps={{ type: 'password', placeholder: 'Password' }}
                >
                    <Button
                        Component={Link}
                        to={FORGOT_PASSWORD_PATH}
                        type="button"
                        variant="ghost"
                        isDense
                        color="primary"
                        csx={{
                            root: ({ spacing }) => ({
                                marginTop: spacing(2),
                                padding: '0.25rem'
                            })
                        }}
                    >
                        Forgot Password?
                    </Button>
                </FormGroup>
            </FormBody>
            <FormAction
                primaryAction={{
                    children: 'Login',
                    onClick: () => {
                        updateAuthState(AuthStates.Authorize)
                        history.push(DASHBOARD_OVERVIEW_PATH)
                    }
                }}
                secondaryAction={{
                    children: 'Create account',
                    Component: Link,
                    to: REGISTER_PATH
                }}
            />
        </Form>
    )
}
