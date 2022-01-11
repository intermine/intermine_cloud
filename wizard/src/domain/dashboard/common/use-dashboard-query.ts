import { useState } from 'react'
import shortid from 'shortid'

import axios, { AxiosResponse } from 'axios'

import { useGlobalAlertReducer } from '../../../context'
import {
    getResponseMessageUsingResponseStatus,
    getResponseStatus,
} from '../../../utils/get'

export type TUseDashboardQuery = {
    queryFn: (...params: any[]) => Promise<unknown>
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

    const query = async (...params: any[]) => {
        setIsLoading(true)
        try {
            console.log('params', params)
            const responseFromServer = await queryFn(...params)
            setResponse(responseFromServer)

            if (typeof onSuccessful === 'function') {
                onSuccessful(responseFromServer as any)
            }
        } catch (error) {
            if (!axios.isAxiosError(error)) {
                console.log(error)
                throw new Error('Non-axios error at useDashboardQuery.')
            }

            if (hasToShowAlertOnError) {
                const status = getResponseStatus(error.response)
                addAlert({
                    id: shortid.generate(),
                    message: getResponseMessageUsingResponseStatus(
                        error.response,
                        status
                    ),
                    isOpen: true,
                    title: 'Error',
                    type: 'error',
                })
            }

            if (typeof onError === 'function') {
                onError(error.response)
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
