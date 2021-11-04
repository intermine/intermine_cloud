type TInputValue = string | null | undefined

export const isAnyValueNull = (...values: TInputValue[]): boolean => {
    for (const val in values) {
        if (typeof val !== 'string') {
            return false
        }
    }
    return true
}

export const isValueSame = (val1: TInputValue, val2: TInputValue): boolean => {
    if (!val1 && !val2) return true
    if (!val1) return false
    if (!val2) return false

    if (val1 === val2) return true
    return false
}

export const isValidEmail = (val: TInputValue): boolean => {
    if (typeof val !== 'string') return false
    const emailRegex = new RegExp(
        // eslint-disable-next-line max-len
        /^(([^\s"(),.:;<>@[\\\]]+(\.[^\s"(),.:;<>@[\\\]]+)*)|(".+"))@((\[(?:\d{1,3}\.){3}\d{1,3}])|(([\dA-Za-z\-]+\.)+[A-Za-z]{2,}))$/
    )

    return val.search(emailRegex) === 0
}
