import { createMachine, assign } from 'xstate'
import { clone } from '@intermine/chromatin/utils'
import { AuthStates } from '../../../constants/auth'
import { authApi, userApi } from '../../../services/api'

import { TUserDetails } from '../../../context/types'
import {
    getResponseMessageUsingResponseStatus,
    getResponseStatus,
} from '../../../utils/get'
import { AxiosResponse } from 'axios'

export type TLoginPayload = {
    email: string
    password: string
}

export type TRegisterPayload = {
    email: string
    password: string
    name: string
    organisation: string
}

export type TResetPasswordPayload = {
    email: string
}

export type TAuthMachineContext = {
    errorMessage?: string
    userDetails?: TUserDetails
    authState?: AuthStates
    isRequestFailed?: boolean
}

type TResponse = AxiosResponse

export type TAuthMachineState =
    | {
          value: 'login'
          context: TAuthMachineContext
      }
    | { value: 'resetPassword'; context: TAuthMachineContext }
    | { value: 'register'; context: TAuthMachineContext }
    | { value: 'start'; context: TAuthMachineContext }
    | { value: 'end'; context: TAuthMachineContext }
    | { value: 'reset'; context: TAuthMachineContext }

export type TAuthMachineEvents =
    | ({ type: 'LOGIN' } & TLoginPayload)
    | ({ type: 'REGISTER' } & TRegisterPayload)
    | ({ type: 'RESET_PASSWORD' } & TResetPasswordPayload)
    | { type: 'END' }
    | { type: 'START' }
    | { type: 'RESET' }
    | { type: 'error.platform.login'; data: { response: TResponse } }
    | { type: 'error.platform.register'; data: { response: TResponse } }

const authMachineInitialContext: TAuthMachineContext = {
    errorMessage: '',
    authState: AuthStates.NotAuthorize,
    isRequestFailed: false,
}

export const authMachine = createMachine<
    TAuthMachineContext,
    TAuthMachineEvents,
    TAuthMachineState
>(
    {
        id: 'pre-auth-machine',
        initial: 'start',
        context: clone(authMachineInitialContext),
        states: {
            start: {
                entry: 'resetAuthState',
                on: {
                    LOGIN: 'login',
                    REGISTER: 'register',
                    RESET_PASSWORD: 'resetPassword',
                },
                exit: 'resetRequestStatus',
            },
            login: {
                invoke: {
                    src: 'login',
                    onDone: {
                        target: 'end',
                    },

                    onError: {
                        target: 'start',
                        actions: 'requestFailed',
                    },
                },
            },
            register: {
                invoke: {
                    src: 'register',
                    onDone: {
                        target: 'end',
                    },
                    onError: {
                        target: 'start',
                        actions: 'requestFailed',
                    },
                },
            },
            resetPassword: {
                invoke: {
                    src: 'login',
                    onDone: {
                        target: 'end',
                    },
                    onError: {
                        target: 'start',
                        actions: 'requestFailed',
                    },
                },
            },
            end: {
                on: {
                    RESET: 'start',
                },
            },
        },
    },
    {
        actions: {
            requestFailed: assign<TAuthMachineContext, TAuthMachineEvents>({
                isRequestFailed: true,
                errorMessage: (_, event) => {
                    if (
                        event.type === 'error.platform.login' ||
                        event.type === 'error.platform.register'
                    ) {
                        const status = getResponseStatus(event.data.response)

                        return getResponseMessageUsingResponseStatus(
                            event.data.response,
                            status
                        )
                    }

                    return getResponseMessageUsingResponseStatus({}, 500)
                },
            }),
            resetAuthState: assign<TAuthMachineContext, TAuthMachineEvents>({
                authState: AuthStates.NotAuthorize,
            }),
            resetRequestStatus: assign<TAuthMachineContext, TAuthMachineEvents>(
                {
                    isRequestFailed: false,
                }
            ),
        },
        services: {
            login: (_, event) => {
                if (event.type === 'LOGIN') {
                    const { email, password } = event
                    return authApi.authPost({ email, password })
                }

                throw new Error(
                    'event.type should be LOGIN. Got: '.concat(event.type)
                )
            },
            register: (_, event) => {
                if (event.type === 'REGISTER') {
                    const { email, name, password, organisation } = event
                    return userApi.userPost([
                        { user: { email, name, organisation }, password },
                    ])
                }
                throw new Error(
                    'event.type should be REGISTER. Got: '.concat(event.type)
                )
            },
        },
    }
)
