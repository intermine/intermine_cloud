export const isAnyValueNull = (
    ...values: (string | null | undefined)[]
): boolean => {
    for (const val in values) {
        if (typeof val !== 'string') {
            return false
        }
    }
    return true
}

export const isValueSame = (
    val1: string | null | undefined,
    val2: string | null | undefined
): boolean => {
    if (!val1 && !val2) return true
    if (!val1) return false
    if (!val2) return false

    if (val1 === val2) return true
    return false
}
