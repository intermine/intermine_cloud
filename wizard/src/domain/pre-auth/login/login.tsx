import { Link } from 'react-router-dom'
import { Button } from '@intermine/chromatin/button'

import { FORGOT_PASSWORD_PATH, REGISTER_PATH } from '../../../routes'
import {
    Form,
    FormHeader,
    FormGroup,
    FormBody,
    FormAction
} from '../../../components/form'

export const Login = () => {
    return (
        <Form id="login">
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
                primaryAction={{ children: 'Login' }}
                secondaryAction={{
                    children: 'Create account',
                    Component: Link,
                    to: REGISTER_PATH
                }}
            />
        </Form>
    )
}
