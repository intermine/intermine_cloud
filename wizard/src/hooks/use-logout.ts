import { useAuthReducer } from '../context'
import { AuthStates } from '../constants/auth'
import { authApi } from '../services/api'

export const useLogout = () => {
    const { updateAuthState } = useAuthReducer()

    const logout = async () => {
        try {
            await authApi.authDelete()
            updateAuthState(AuthStates.NotAuthorize)
            return true
        } catch {
            return false
        }
    }

    return {
        logout,
    }
}
