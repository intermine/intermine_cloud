const { localStorage } = window

export const setValueToLocalStorage = (key: string, value: string): void => {
    localStorage.setItem(key, value)
}

export const getValueFromLocalStorage = (key: string): string | null => {
    const val = localStorage.getItem(key)
    return val
}

export const clearFromLocalStorage = (key: string): void => {
    localStorage.removeItem(key)
}
