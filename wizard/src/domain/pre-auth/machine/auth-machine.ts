/* eslint-disable @typescript-eslint/no-explicit-any */
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
    | { value: 'unauthorized'; context: TAuthMachineContext }
    | { value: 'authorized'; context: TAuthMachineContext }

export type TAuthMachineEvents =
    | { type: 'LOGIN' }
    | { type: 'REGISTER' }
    | { type: 'RESET_PASSWORD' }
    | { type: 'AUTHORIZED' }
    | { type: 'UNAUTHORIZED' }

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
        initial: 'unauthorized',
        context: clone(authMachineInitialContext),
        states: {
            unauthorized: {
                entry: 'unauthorizeUser',
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
                        target: 'authorized',
                    },

                    onError: {
                        target: 'unauthorized',
                        actions: 'requestFailed',
                    },
                },
            },
            register: {},
            resetPassword: {},
            authorized: {},
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
            unauthorizeUser: assign<TAuthMachineContext, TAuthMachineEvents>({
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
                return new Promise((resolve) => setTimeout(resolve, 1000))
            },
        },
    }
)
/* eslint-enable */
