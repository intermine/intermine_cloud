import { useState } from 'react'
import shortid from 'shortid'

import { AxiosError, AxiosResponse } from 'axios'

import { useGlobalAlertReducer } from '../../../context'
import {
    getResponseMessageUsingResponseStatus,
    getResponseStatus,
} from '../../../utils/get'

export type TUseDashboardQuery = {
    queryFn: () => Promise<unknown>
    onError?: (response: unknown) => void
    onSuccessful?: (response: AxiosResponse<any, any>) => void
    /**
     * @default true
     */
    hasToShowAlertOnError?: boolean
}

export const useDashboardQuery = (props: TUseDashboardQuery) => {
    const [isLoading, setIsLoading] = useState(false)
    const [response, setResponse] = useState<unknown>()
    const { addAlert } = useGlobalAlertReducer()

    const {
        queryFn,
        onError,
        onSuccessful,
        hasToShowAlertOnError = true,
    } = props

    const query = async () => {
        setIsLoading(true)
        try {
            const responseFromServer = await queryFn()
            setResponse(responseFromServer)

            if (typeof onSuccessful === 'function') {
                onSuccessful(responseFromServer as any)
            }
        } catch (error) {
            const errorResponse = (error as AxiosError).response

            if (hasToShowAlertOnError) {
                const status = getResponseStatus(errorResponse)
                addAlert({
                    id: shortid.generate(),
                    message: getResponseMessageUsingResponseStatus(
                        errorResponse,
                        status
                    ),
                    isOpen: true,
                    title: 'Error',
                    type: 'error',
                })
            }

            if (typeof onError === 'function') {
                onError(errorResponse)
            }
        }
        setIsLoading(false)
    }

    return {
        isLoading,
        response,
        query,
    }
}
