import { useEffect, useState } from 'react'
import { Link, useHistory } from 'react-router-dom'
import { useMachine } from '@xstate/react'
import { InlineAlert } from '@intermine/chromatin/inline-alert'
import { Button } from '@intermine/chromatin/button'
import { clone } from '@intermine/chromatin/utils'

import { useAuthReducer } from '../../../context'
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
import { Logo } from '../../../components/logo'
import { authMachine } from '../machine/auth-machine'

import { TInputField, updateError, updateValue } from '../utils'
import { scrollIntoView } from '../../../utils/misc'

type TInputFields = {
    email: TInputField
    password: TInputField
}

const defaultFieldValue: TInputField = {
    errorMessage: '',
    value: '',
    isError: false
}

export const Login = () => {
    const authReducer = useAuthReducer()
    const history = useHistory()

    const { updateAuthState } = authReducer

    const [{ password, email }, setFields] = useState<TInputFields>({
        password: clone(defaultFieldValue),
        email: clone(defaultFieldValue)
    })

    const [authMachineState, dispatch] = useMachine(authMachine)
    const [isInlineAlertOpen, setIsInlineAlertOpen] = useState(false)

    const handleLoginClick = () => {
        setIsInlineAlertOpen(false)

        const errorFields: [keyof TInputFields, string][] = []

        if (email.value.length === 0) {
            errorFields.push(['email', 'EmaIL is required'])
        }

        if (password.value.length === 0) {
            errorFields.push(['password', 'Password is required'])
        }

        /**
         * If error then not proceeding.
         */
        if (errorFields.length > 0) {
            updateError(setFields, errorFields)
            scrollIntoView(DomElementIDs.LoginForm)
            return
        }

        dispatch('LOGIN', { email: email.value, password: password.value })
    }

    useEffect(() => {
        if (authMachineState.value === 'end') {
            updateAuthState(AuthStates.Authorize)
            history.push(DASHBOARD_OVERVIEW_PATH)
        }
        if (authMachineState.context.isRequestFailed) {
            /**
             * Failed request.
             */
            scrollIntoView(DomElementIDs.LoginForm)

            setIsInlineAlertOpen(true)
        }
    }, [authMachineState.value])

    const isMakingLoginRequest = authMachineState.value === 'login'

    return (
        <Form id={DomElementIDs.LoginForm}>
            <FormHeader logo={<Logo />} />
            <FormBody>
                <InlineAlert
                    message={authMachineState.context.errorMessage}
                    type="error"
                    isOpen={isInlineAlertOpen}
                    onClose={() => setIsInlineAlertOpen(false)}
                    isDense
                    csx={{
                        root: ({ spacing }) => ({ marginBottom: spacing(5) })
                    }}
                />
                <FormGroup
                    isDisabled={isMakingLoginRequest}
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

                <FormGroup
                    isDisabled={isMakingLoginRequest}
                    label="Password"
                    isError={password.isError}
                    inputProps={{
                        type: 'password',
                        placeholder: 'Password',
                        value: password.value,
                        onChange: (event) =>
                            updateValue(setFields, 'password', event)
                    }}
                    errorMessage={password.errorMessage}
                >
                    <Button
                        isDisabled={isMakingLoginRequest}
                        Component={Link}
                        to={FORGOT_PASSWORD_PATH}
                        type="button"
                        variant="ghost"
                        isDense
                        isTextUppercase={false}
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
                    isDisabled: isMakingLoginRequest,
                    isLoading: isMakingLoginRequest,
                    onClick: handleLoginClick
                }}
                secondaryAction={{
                    children: 'Create account',
                    Component: Link,
                    to: REGISTER_PATH,
                    isDisabled: isMakingLoginRequest
                }}
            />
        </Form>
    )
}
