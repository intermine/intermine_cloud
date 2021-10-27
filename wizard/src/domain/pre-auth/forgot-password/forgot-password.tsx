import { Link } from 'react-router-dom'
import GoBackIcon from '@intermine/chromatin/icons/System/arrow-left-line'

import { LOGIN_PATH } from '../../../routes'
import {
    Form,
    FormHeader,
    FormGroup,
    FormBody,
    FormAction
} from '../../../components/form'

export const ForgotPassword = () => {
    return (
        <Form id="forgot-password">
            <FormHeader heading="Forgot Password" />
            <FormBody>
                <FormGroup
                    label="Email"
                    inputProps={{ placeholder: 'Email' }}
                />
            </FormBody>
            <FormAction
                primaryAction={{ children: 'Send Reset Link' }}
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
