import { Link } from 'react-router-dom'

import { LOGIN_PATH } from '../../../routes'
import {
    Form,
    FormHeader,
    FormGroup,
    FormBody,
    FormAction
} from '../../../components/form'

export const Register = () => {
    return (
        <Form id="register">
            <FormHeader heading="Register" />
            <FormBody>
                <FormGroup label="Name" inputProps={{ placeholder: 'Name' }} />
                <FormGroup
                    label="Organisation"
                    inputProps={{ placeholder: 'Organisation' }}
                />
                <FormGroup
                    label="Email"
                    inputProps={{ placeholder: 'Email' }}
                />
                <FormGroup
                    label="Username"
                    inputProps={{ placeholder: 'Username' }}
                />

                <FormGroup
                    label="Password"
                    inputProps={{ type: 'password', placeholder: 'Password' }}
                />
                <FormGroup
                    label="Confirm Password"
                    inputProps={{
                        type: 'password',
                        placeholder: 'Confirm Password'
                    }}
                />
            </FormBody>
            <FormAction
                primaryAction={{ children: 'Register' }}
                secondaryAction={{
                    children: 'Already have an account',
                    Component: Link,
                    to: LOGIN_PATH
                }}
            />
        </Form>
    )
}
