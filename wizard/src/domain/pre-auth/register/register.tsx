import { Link } from 'react-router-dom'
import GoBackIcon from '@intermine/chromatin/icons/System/arrow-left-line'

import { DomElementIDs } from '../../../constants/ids'
import { LOGIN_PATH } from '../../../routes'
import {
    Form,
    FormHeader,
    FormGroup,
    FormBody,
    FormAction
} from '../../../components/form'
import { Logo } from '../../../components/logo'

export const Register = () => {
    return (
        <Form id={DomElementIDs.RegisterForm}>
            <FormHeader logo={<Logo />} />
            <FormBody>
                <FormGroup
                    label="Name"
                    inputProps={{ placeholder: 'Name' }}
                    hasAsterisk
                />
                <FormGroup
                    label="Organisation"
                    inputProps={{ placeholder: 'Organisation' }}
                    hasAsterisk
                />
                <FormGroup
                    label="Email"
                    inputProps={{ placeholder: 'Email' }}
                    hasAsterisk
                />
                <FormGroup
                    label="Username"
                    inputProps={{ placeholder: 'Username' }}
                    hasAsterisk
                />

                <FormGroup
                    label="Password"
                    inputProps={{ type: 'password', placeholder: 'Password' }}
                    hasAsterisk
                />
                <FormGroup
                    label="Confirm Password"
                    inputProps={{
                        type: 'password',
                        placeholder: 'Confirm Password'
                    }}
                    hasAsterisk
                />
            </FormBody>
            <FormAction
                primaryAction={{ children: 'Register' }}
                secondaryAction={{
                    children: 'Login',
                    Component: Link,
                    to: LOGIN_PATH,
                    LeftIcon: <GoBackIcon />
                }}
            />
        </Form>
    )
}
