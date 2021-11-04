import { useEffect, useState } from 'react'
import { Link, useHistory } from 'react-router-dom'
import { useMachine } from '@xstate/react'
import {
    InlineAlert,
    InlineAlertProps
} from '@intermine/chromatin/inline-alert'
import GoBackIcon from '@intermine/chromatin/icons/System/arrow-left-line'
import { clone } from '@intermine/chromatin/utils'

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

import { TInputField, updateError, updateValue } from '../utils'
import { isValidEmail, isValueSame } from '../../../components/form/utils'

type TInputFields = {
    name: TInputField
    organisation: TInputField
    email: TInputField
    username: TInputField
    password: TInputField
    confirmPassword: TInputField
}

const defaultFieldValue: TInputField = {
    errorMessage: '',
    value: '',
    isError: false
}

export const Register = () => {
    const history = useHistory()

    const [authMachineState, dispatch] = useMachine(authMachine)
    const [
        { name, organisation, email, username, password, confirmPassword },
        setFields
    ] = useState<TInputFields>({
        name: clone(defaultFieldValue),
        organisation: clone(defaultFieldValue),
        email: clone(defaultFieldValue),
        username: clone(defaultFieldValue),
        password: clone(defaultFieldValue),
        confirmPassword: clone(defaultFieldValue)
    })

    const [inlineAlertProps, setInlineAlertProps] = useState({
        message: '',
        type: 'other' as InlineAlertProps['type'],
        isOpen: false
    })

    const handleRegisterClick = () => {
        setInlineAlertProps((prev) => ({
            ...prev,
            isOpen: false
        }))
        const errorFields: [keyof TInputFields, string][] = []

        if (name.value.length === 0) {
            errorFields.push(['name', 'Name is required'])
        }

        if (organisation.value.length === 0) {
            errorFields.push(['organisation', 'Organisation is required'])
        }

        if (email.value.length === 0) {
            errorFields.push(['email', 'Email is required'])
        }

        if (email.value.length > 0 && !isValidEmail(email.value)) {
            errorFields.push(['email', 'Please enter a valid email address.'])
        }

        if (username.value.length === 0) {
            errorFields.push(['username', 'Username is required'])
        }

        if (password.value.length === 0) {
            errorFields.push(['password', 'Password is required'])
        }

        if (confirmPassword.value.length === 0) {
            errorFields.push([
                'confirmPassword',
                'Confirm Password is required'
            ])
        }

        if (
            password.value.length > 0 &&
            confirmPassword.value.length > 0 &&
            !isValueSame(password.value, confirmPassword.value)
        ) {
            errorFields.push(
                ['password', "Password doesn't match"],
                ['confirmPassword', "Password doesn't match"]
            )
        }

        if (errorFields.length > 0) {
            updateError(setFields, errorFields)
            return
        }

        dispatch('REGISTER')
    }

    useEffect(() => {
        if (authMachineState.value === 'end') {
            setInlineAlertProps({
                message:
                    'User registered successfully. Redirecting to login page.',
                type: 'success',
                isOpen: true
            })
            setTimeout(() => {
                history.push(LOGIN_PATH)
            }, 5000)
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
        }
    }, [authMachineState.value])

    const isMakingRequest = authMachineState.value === 'register'

    return (
        <Form id={DomElementIDs.RegisterForm}>
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
                    label="Name"
                    isError={name.isError}
                    errorMessage={name.errorMessage}
                    inputProps={{
                        placeholder: 'Name',
                        value: name.value,
                        onChange: (event) =>
                            updateValue(setFields, 'name', event)
                    }}
                    hasAsterisk
                />
                <FormGroup
                    isDisabled={isMakingRequest}
                    label="Organisation"
                    isError={organisation.isError}
                    errorMessage={organisation.errorMessage}
                    inputProps={{
                        placeholder: 'Organisation',
                        value: organisation.value,
                        onChange: (event) =>
                            updateValue(setFields, 'organisation', event)
                    }}
                    hasAsterisk
                />
                <FormGroup
                    isDisabled={isMakingRequest}
                    label="Email"
                    isError={email.isError}
                    errorMessage={email.errorMessage}
                    inputProps={{
                        placeholder: 'Email',
                        value: email.value,
                        onChange: (event) =>
                            updateValue(setFields, 'email', event)
                    }}
                    hasAsterisk
                />
                <FormGroup
                    isDisabled={isMakingRequest}
                    label="Username"
                    isError={username.isError}
                    errorMessage={username.errorMessage}
                    inputProps={{
                        placeholder: 'Username',
                        value: username.value,
                        onChange: (event) =>
                            updateValue(setFields, 'username', event)
                    }}
                    hasAsterisk
                />
                <FormGroup
                    isDisabled={isMakingRequest}
                    label="Password"
                    isError={password.isError}
                    errorMessage={password.errorMessage}
                    inputProps={{
                        type: 'password',
                        placeholder: 'Password',
                        value: password.value,
                        onChange: (event) => {
                            updateValue(setFields, 'password', event)
                            if (
                                isValueSame(
                                    event.currentTarget.value,
                                    confirmPassword.value
                                )
                            ) {
                                setFields((prev) => ({
                                    ...prev,
                                    confirmPassword: {
                                        ...prev.confirmPassword,
                                        isError: false
                                    }
                                }))
                            }
                        }
                    }}
                    hasAsterisk
                />
                <FormGroup
                    isDisabled={isMakingRequest}
                    label="Confirm Password"
                    isError={confirmPassword.isError}
                    errorMessage={confirmPassword.errorMessage}
                    inputProps={{
                        type: 'password',
                        placeholder: 'Confirm Password',
                        value: confirmPassword.value,
                        onChange: (event) => {
                            updateValue(setFields, 'confirmPassword', event)
                            if (
                                isValueSame(
                                    event.currentTarget.value,
                                    password.value
                                )
                            ) {
                                setFields((prev) => ({
                                    ...prev,
                                    password: {
                                        ...prev.password,
                                        isError: false
                                    }
                                }))
                            }
                        }
                    }}
                    hasAsterisk
                />
            </FormBody>
            <FormAction
                primaryAction={{
                    children: 'Register',
                    onClick: handleRegisterClick,
                    isLoading: isMakingRequest,
                    isDisabled: isMakingRequest
                }}
                secondaryAction={{
                    children: 'Login',
                    Component: Link,
                    to: LOGIN_PATH,
                    LeftIcon: <GoBackIcon />,
                    isDisabled: isMakingRequest
                }}
            />
        </Form>
    )
}
