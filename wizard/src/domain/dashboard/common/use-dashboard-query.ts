import { useState } from 'react'
import shortid from 'shortid'

import axios, { AxiosResponse } from 'axios'

import { useGlobalAlertReducer } from '../../../context'
import {
    getResponseMessageUsingResponseStatus,
    getResponseStatus,
} from '../../../utils/get'

export type TUseDashboardQuery<T = unknown> = {
    queryFn: (...params: any[]) => Promise<T>
    onError?: (response: unknown) => void
    onSuccessful?: (response: T) => void
    /**
     * @default true
     */
    hasToShowAlertOnError?: boolean
}

export const useDashboardQuery = <T>(props: TUseDashboardQuery<T>) => {
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
            const responseFromServer = await queryFn(...params)
            setResponse(responseFromServer)

            if (typeof onSuccessful === 'function') {
                onSuccessful(responseFromServer as any)
            }
        } catch (error) {
            if (process.env.NODE_ENV === 'development') {
                console.error('useDashboardQuery:', error)
            }

            const _error = {
                message: 'Unknown error',
                response: {},
                ...(typeof error === 'object' ? error : undefined),
            }

            if (hasToShowAlertOnError) {
                const status = getResponseStatus(_error.response)
                addAlert({
                    id: shortid.generate(),
                    message: getResponseMessageUsingResponseStatus(
                        _error.response,
                        status
                    ),
                    isOpen: true,
                    title: 'Error',
                    type: 'error',
                })
            }

            if (typeof onError === 'function') {
                onError(_error.response)
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
