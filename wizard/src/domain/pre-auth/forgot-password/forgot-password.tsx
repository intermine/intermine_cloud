import { useEffect, useState } from 'react'
import { useMachine } from '@xstate/react'
import {
    InlineAlert,
    InlineAlertProps
} from '@intermine/chromatin/inline-alert'
import { clone } from '@intermine/chromatin/utils'

import { Link, useHistory } from 'react-router-dom'
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
import { authMachine } from '../machine/auth-machine'

import { scrollIntoView } from '../../../utils/misc'
import { isValidEmail } from '../../../components/form/utils'
import { TInputField, updateError, updateValue } from '../utils'

type TInputFields = {
    email: TInputField
}

const defaultFieldValue: TInputField = {
    errorMessage: '',
    value: '',
    isError: false
}

export const ForgotPassword = () => {
    const history = useHistory()
    const [{ email }, setFields] = useState<TInputFields>({
        email: clone(defaultFieldValue)
    })

    const [authMachineState, dispatch] = useMachine(authMachine)
    const [inlineAlertProps, setInlineAlertProps] = useState({
        message: '',
        type: 'other' as InlineAlertProps['type'],
        isOpen: false
    })

    const handleResetClick = () => {
        setInlineAlertProps((prev) => ({
            ...prev,
            isOpen: false
        }))

        if (email.value.length === 0) {
            updateError(setFields, [['email', 'Email is required']])
            scrollIntoView(DomElementIDs.ForgotPasswordForm)
            return
        }

        if (!isValidEmail(email.value)) {
            updateError(setFields, [
                ['email', 'Please enter a valid email address.']
            ])
            scrollIntoView(DomElementIDs.ForgotPasswordForm)
            return
        }

        dispatch('RESET_PASSWORD')
    }

    useEffect(() => {
        if (authMachineState.value === 'end') {
            setInlineAlertProps({
                message: 'Reset link has been sent.',
                type: 'success',
                isOpen: true
            })
            /**
             * Resetting machine
             */
            dispatch('RESET')
        }

        if (authMachineState.context.isRequestFailed) {
            /**
             * Failed request.
             */
            setInlineAlertProps({
                message: authMachineState.context.errorMessage ?? '',
                type: 'error',
                isOpen: true
            })
            scrollIntoView(DomElementIDs.ForgotPasswordForm)
        }
    }, [authMachineState.value])

    const isMakingRequest = authMachineState.value === 'resetPassword'
    return (
        <Form id={DomElementIDs.ForgotPasswordForm}>
            <FormHeader logo={<Logo />} />
            <FormBody>
                <InlineAlert
                    {...inlineAlertProps}
                    isDense
                    csx={{
                        root: ({ spacing }) => ({ marginBottom: spacing(5) })
                    }}
                    onClose={() =>
                        setInlineAlertProps((prev) => ({
                            ...prev,
                            isOpen: false
                        }))
                    }
                />
                <FormGroup
                    isDisabled={isMakingRequest}
                    label="Email"
                    isError={email.isError}
                    inputProps={{
                        placeholder: 'Email',
                        value: email.value,
                        onChange: (event) =>
                            updateValue(setFields, 'email', event)
                    }}
                    errorMessage={email.errorMessage}
                />
            </FormBody>
            <FormAction
                primaryAction={{
                    children: 'Send Password Reset Link',
                    onClick: handleResetClick,
                    isDisabled: isMakingRequest,
                    isLoading: isMakingRequest
                }}
                secondaryAction={{
                    children: 'Login',
                    Component: Link,
                    to: {
                        pathname: LOGIN_PATH,
                        search: history.location.search
                    },
                    LeftIcon: <GoBackIcon />,
                    isDisabled: isMakingRequest
                }}
            />
        </Form>
    )
}
