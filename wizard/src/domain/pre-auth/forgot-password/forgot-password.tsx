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

export const ForgotPassword = () => {
    return (
        <Form id={DomElementIDs.ForgotPasswordForm}>
            <FormHeader logo={<Logo />} />
            <FormBody>
                <FormGroup
                    label="Email"
                    inputProps={{ placeholder: 'Email' }}
                />
            </FormBody>
            <FormAction
                primaryAction={{ children: 'Send password reset link' }}
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
