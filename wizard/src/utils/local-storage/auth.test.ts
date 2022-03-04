import {
    getAuthReducerFromLocalStorage,
    setAuthReducerToLocalStorage,
} from './auth'

import { AuthStates } from '../../shared/constants'

const defaultAuthState = {
    authState: AuthStates.NotAuthorize,
    userDetails: {
        email: '',
        id: '',
        isActive: false,
        name: '',
        organisation: '',
    },
}

const randomUserDetails = {
    email: 'random',
    id: 'random',
    isActive: true,
    name: 'random',
    organisation: 'random',
}

describe('Testing local-storage/auth', () => {
    beforeEach(() => {
        window.localStorage.clear()
    })

    test('Should set and get auth state from local storage', () => {
        /**
         * If nothing is there, then it should return not authorize.
         */
        expect(getAuthReducerFromLocalStorage(defaultAuthState)).toEqual(
            defaultAuthState
        )

        setAuthReducerToLocalStorage({
            userDetails: randomUserDetails,
            authState: AuthStates.Authorize,
        })
        expect(getAuthReducerFromLocalStorage(defaultAuthState)).toEqual({
            userDetails: randomUserDetails,
            authState: AuthStates.Authorize,
        })
    })
})
