import { ResponseStatus } from '../constants/response'
import { TUserDetails } from '../context/types'
import { authApi } from './api'

export const getCurrentUserDetails = async () => {
    try {
        const response = await authApi.authCheck()
        const userDetails = response.data.items[0] as unknown as TUserDetails

        return {
            status: ResponseStatus.Ok,
            ...userDetails,
        }
    } catch {
        return {
            status: ResponseStatus.Failed,
            name: '',
            email: '',
            organisation: '',
        }
    }
}
