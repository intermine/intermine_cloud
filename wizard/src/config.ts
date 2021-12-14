import { Configuration } from '@intermine/compose-rest-client'

export const composeConfiguration = new Configuration({
    basePath: process.env.COMPOSE_BASE_URL,
})
