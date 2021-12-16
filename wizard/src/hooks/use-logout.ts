import { useAuthReducer } from '../context'
import { AuthStates } from '../constants/auth'
import { authApi } from '../services/api'
import { getResponseStatus } from '../utils/get'
import { AxiosError, AxiosResponse } from 'axios'

export const useLogout = () => {
    const { updateAuthState } = useAuthReducer()

    type TLogoutReturn = AxiosResponse

    const logout = async (): Promise<TLogoutReturn> => {
        try {
            const response = await authApi.authDelete()
            updateAuthState(AuthStates.NotAuthorize)
            return {
                ...response,
                status: getResponseStatus(response),
            }

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: unknown) {
            return {
                data: {},
                config: {},
                headers: {},
                statusText: '',
                ...((error as AxiosError) && (error as AxiosError).response),
                status: getResponseStatus((error as AxiosError).response),
            }
        }
    }

    return {
        logout,
    }
}
