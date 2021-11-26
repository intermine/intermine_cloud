import { createMachine, assign } from 'xstate'
import { clone } from '@intermine/chromatin/utils'

import { AuthStates } from '../../../constants/auth'

import { TUserDetails } from '../../../context/types'

export type TAuthMachineContext = {
    errorMessage?: string
    userDetails?: TUserDetails
    authState?: AuthStates
    isRequestFailed?: boolean
}

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
    | { type: 'LOGIN' }
    | { type: 'REGISTER' }
    | { type: 'RESET_PASSWORD' }
    | { type: 'END' }
    | { type: 'START' }
    | { type: 'RESET' }

const authMachineInitialContext: TAuthMachineContext = {
    errorMessage: '',
    userDetails: {},
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
                errorMessage: (ctx, event) => {
                    console.log(event)
                    return 'Failed to load response'
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
            login: () => {
                return new Promise((resolve, reject) => setTimeout(resolve, 0))
            },
        },
    }
)
