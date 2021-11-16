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

/* eslint-disable @typescript-eslint/no-explicit-any, max-len, prefer-rest-params, unicorn/no-this-assignment, @typescript-eslint/no-this-alias */
export type ThrottledFunction<T extends (...args: any) => any> = (
    ...args: Parameters<T>
) => ReturnType<T>
export function throttle<T extends (...args: any) => any>(
    func: T,
    timeout: number
): ThrottledFunction<T> {
    let inThrottle: boolean
    let lastResult: ReturnType<T>

    return function (this: any): ReturnType<T> {
        const args = arguments as any
        const context = this

        if (!inThrottle) {
            inThrottle = true

            setTimeout(() => (inThrottle = false), timeout)

            lastResult = func.apply(context, args)
        }

        return lastResult
    }
}
/* eslint-enable */
