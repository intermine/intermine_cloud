import {
    AuthApi,
    UserApi,
    DataApi,
    FileApi,
    MineApi,
    JobApi,
    TemplateApi,
} from '@intermine/compose-rest-client'

import { composeConfiguration } from '../config'

export const authApi = new AuthApi(composeConfiguration)
export const userApi = new UserApi(composeConfiguration)
export const dataApi = new DataApi(composeConfiguration)
export const fileApi = new FileApi(composeConfiguration)
export const mineApi = new MineApi(composeConfiguration)
export const templateApi = new TemplateApi(composeConfiguration)
export const jobApi = new JobApi(composeConfiguration)
