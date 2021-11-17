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
