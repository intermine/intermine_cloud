import { renderHook, act } from '@testing-library/react-hooks'
import { AuthStates } from '../../constants/auth'

import { useAuthReducer } from './auth-reducer'

describe('Testing auth-reducer', () => {
    test('', () => {
        const { result } = renderHook(() => useAuthReducer())

        expect(result.current.state.authState).toBe(AuthStates.NotAuthorize)

        act(() => {
            result.current.updateAuthState(AuthStates.Authorize)
        })
        expect(result.current.state.authState).toBe(AuthStates.Authorize)

        act(() => {
            result.current.updateAuthState(AuthStates.NotAuthorize)
        })
        expect(result.current.state.authState).toBe(AuthStates.NotAuthorize)
    })
})
