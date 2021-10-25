import {
    getAuthStateFromLocalStorage,
    setAuthStateToLocalStorage,
} from './auth'

import { AuthStates, DEFAULT_AUTH } from '../../constants/auth'

describe('Testing local-storage/auth', () => {
    beforeEach(() => {
        window.localStorage.clear()
    })

    test('Should set and get auth state from local storage', () => {
        /**
         * If nothing is there, then it should return not authorize.
         */
        expect(getAuthStateFromLocalStorage()).toEqual(DEFAULT_AUTH)

        setAuthStateToLocalStorage({
            userDetails: {},
            authState: AuthStates.Authorize,
        })
        expect(getAuthStateFromLocalStorage()).toEqual({
            userDetails: {},
            authState: AuthStates.Authorize,
        })
    })
})
