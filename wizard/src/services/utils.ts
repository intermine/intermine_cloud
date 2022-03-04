import { Model200UserResponseAllOfItems } from '@intermine/compose-rest-client'
import { ResponseStatus } from '../shared/constants'
import { TAuthReducerUserDetails } from '../shared/types'
import { authApi } from './api'

const defaultUser = {
    name: '',
    email: '',
    organisation: '',
    id: '#',
    isActive: false,
}

export type TGetUserFromUserListOption = {
    userList?: Model200UserResponseAllOfItems['user_list']
    /**
     * @default 0
     */
    userIndex?: number
}

export const getUserFromUserList = (
    options: TGetUserFromUserListOption
): Omit<TAuthReducerUserDetails, 'status'> => {
    const { userIndex = 0, userList } = options

    if (!Array.isArray(userList)) {
        if (process.env.NODE_ENV) {
            console.error('userList is not an array. Given userList:', userList)
        }

        return defaultUser
    }

    const user = userList[userIndex]

    if (user) {
        return {
            name: user.name,
            email: user.email,
            organisation: user.organisation,
            isActive: user.active,
            id: user.user_id,
        }
    }

    if (process.env.NODE_ENV) {
        console.error('User not found at index', userIndex)
    }

    return defaultUser
}

export const getCurrentUserDetails = async (): Promise<
    TAuthReducerUserDetails & { status: ResponseStatus }
> => {
    try {
        const response = await authApi.authCheck()

        const userDetails = getUserFromUserList({
            userList: response.data.items.user_list,
        })

        return {
            status: ResponseStatus.Ok,
            ...userDetails,
        }
    } catch {
        return {
            status: ResponseStatus.Failed,
            ...defaultUser,
        }
    }
}
