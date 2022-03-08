import { AxiosError, AxiosResponse } from 'axios'

import { authApi } from '../services/api'
import { getResponseStatus } from '../utils/get'
import { useAppReset } from './use-app-reset'

export const useLogout = () => {
    const { resetApp } = useAppReset()

    type TLogoutReturn = AxiosResponse

    const logout = async (): Promise<TLogoutReturn> => {
        try {
            const response = await authApi.authDelete()
            resetApp()
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
                resetApp()
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
