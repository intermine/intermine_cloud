import { AxiosResponse } from 'axios'

import { ResponseStatus } from '../constants/response'

const { UserOffline, ServerUnavailable, UnknownError, Ok } = ResponseStatus

export const getDataSize = (size: number): string => {
    if (size < 1024) {
        /**
         * Less than 1KB
         */
        return `${size} B`
    }

    if (size < 1_048_576) {
        /**
         * Less than 1MB
         */
        return `${(size / 1024).toFixed(2)} KB`
    }

    if (size < 1_073_741_824) {
        /**
         * Less than 1GB
         */
        return `${(size / 1_048_576).toFixed(2)} MB`
    }

    if (size < 1_099_511_627_776) {
        /**
         * Less than 1TB
         */
        return `${(size / 1_073_741_824).toFixed(2)} GB`
    }

    return `${(size / 1_099_511_627_776).toFixed(2)} TB`
}

export const getResponseStatus = (
    response: AxiosResponse | undefined
): ResponseStatus | number => {
    if (typeof response !== 'object') {
        if (!window.navigator.onLine) {
            // User is offline
            return UserOffline
        }

        // Server is offline/unavailable
        return ServerUnavailable
    }

    if (typeof response.status === 'number') {
        if (response.status < 400) {
            return Ok
        }
        return response.status as number
    }

    return UnknownError
}

export const getResponseMessageUsingResponseStatus = (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    response: any,
    status: ResponseStatus
): string => {
    if (status === UserOffline) {
        return 'Please check your internet connection.'
    }

    if (status === ServerUnavailable) {
        return `We are currently offline. Please try after some time.`
    }

    if (status === UnknownError) {
        return `
        Something bad happened. We are trying to fix it.
        Please come back after some time.
        `
    }

    try {
        if (response.data.msg) {
            return response.data.msg
        }
    } catch {}

    return 'Unknown error occurred'
}
