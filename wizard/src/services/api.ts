import { AuthApi, UserApi } from '@intermine/compose-rest-client'

import { composeConfiguration } from '../config'

export const authApi = new AuthApi(composeConfiguration)
export const userApi = new UserApi(composeConfiguration)
