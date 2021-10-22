import {
    getAuthStateFromLocalStorage,
    setAuthStateToLocalStorage,
} from './auth'

import { AuthStates } from '../../constants/auth'

describe('Testing local-storage/auth', () => {
    beforeEach(() => {
        window.localStorage.clear()
    })

    test('Should set and get auth state from local storage', () => {
        /**
         * If nothing is there, then it should return false.
         */
        expect(getAuthStateFromLocalStorage()).toBe(AuthStates.NotAuthorize)

        setAuthStateToLocalStorage(AuthStates.Authorize)
        expect(getAuthStateFromLocalStorage()).toBe(AuthStates.Authorize)
        setAuthStateToLocalStorage(AuthStates.NotAuthorize)
        expect(getAuthStateFromLocalStorage()).toBe(AuthStates.NotAuthorize)
    })
})
