import { AuthStates } from '../shared/constants'
import { useStoreDispatch, updateAuthState } from '../store'
import { authApi } from '../services/api'
import { getResponseStatus } from '../utils/get'
import { AxiosError, AxiosResponse } from 'axios'

export const useLogout = () => {
    const storeDispatch = useStoreDispatch()

    type TLogoutReturn = AxiosResponse

    const logout = async (): Promise<TLogoutReturn> => {
        try {
            const response = await authApi.authDelete()
            storeDispatch(updateAuthState(AuthStates.NotAuthorize))
            return {
                ...response,
                config: {},
                status: getResponseStatus(response),
            }
        } catch (error: unknown) {
            const status = getResponseStatus((error as AxiosError).response)

            if (status === 401) {
                // Unauthorize means user is already logout.
                // So it is nice to update app state as well.
                storeDispatch(updateAuthState(AuthStates.NotAuthorize))
            }

            return {
                data: {},
                config: {},
                headers: {},
                statusText: '',
                ...((error as AxiosError) && (error as AxiosError).response),
                status,
            }
        }
    }

    return {
        logout,
    }
}
