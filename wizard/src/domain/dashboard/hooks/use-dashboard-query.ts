import { useEffect, useState } from 'react'
import shortid from 'shortid'

import { useStoreDispatch, globalAlertActions } from '../../../store'
import {
    getResponseMessageUsingResponseStatus,
    getResponseStatus,
} from '../../../utils/get'

export type TUseDashboardQuery<T = unknown> = {
    queryFn: (...params: unknown[]) => Promise<T>
    onError?: (response: unknown) => void
    onSuccessful?: (response: T) => void
    /**
     * @default true
     */
    hasToShowAlertOnError?: boolean
    /**
     * If set then query will re run after
     * refetchInterval.
     */
    refetchInterval?: number
}

export type TUseDashboardQueryState = {
    isFetched: boolean
    isLoading: boolean
    isRefetching: boolean
    response: unknown
    isFailed: boolean
}

const { addGlobalAlert } = globalAlertActions

export const useDashboardQuery = <T>(props: TUseDashboardQuery<T>) => {
    const storeDispatch = useStoreDispatch()

    const [state, setState] = useState<TUseDashboardQueryState>({
        isFetched: false,
        isLoading: true,
        isRefetching: false,
        response: {} as unknown,
        isFailed: false,
    })

    const updateState = (val: Partial<TUseDashboardQueryState>) => {
        setState((prev) => ({ ...prev, ...val }))
    }

    const {
        queryFn,
        onError,
        onSuccessful,
        hasToShowAlertOnError = true,
        refetchInterval,
    } = props

    const query = async (...params: unknown[]) => {
        /**
         * TODO: Refactor this or use useQuery instead.
         *
         * The way we are using to distinguish between
         * refetching or fetching for the first time is
         * not promising.
         */

        if (state.response) {
            /**
             * if we already have a response, it means we
             * are refetching.
             **/

            updateState({ isRefetching: true })
        } else updateState({ isLoading: true })
        try {
            const responseFromServer = await queryFn(...params)
            updateState({
                response: responseFromServer,
                isLoading: false,
                isFailed: false,
                isRefetching: false,
            })

            if (typeof onSuccessful === 'function') {
                onSuccessful(responseFromServer)
            }
        } catch (error) {
            updateState({
                isLoading: false,
                isFailed: true,
                isRefetching: false,
            })

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
                storeDispatch(
                    addGlobalAlert({
                        id: shortid.generate(),
                        message: getResponseMessageUsingResponseStatus(
                            _error.response,
                            status
                        ),
                        isOpen: true,
                        title: 'Error',
                        type: 'error',
                    })
                )
            }

            if (typeof onError === 'function') {
                onError(_error.response)
            }
        }
    }

    useEffect(() => {
        let interval: NodeJS.Timer

        if (refetchInterval !== undefined) {
            interval = setInterval(query, refetchInterval)
        }

        return () => {
            clearInterval(interval)
        }
    }, [refetchInterval])

    return {
        ...state,
        query,
    }
}
