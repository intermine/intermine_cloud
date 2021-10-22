import {
    clearFromLocalStorage,
    getValueFromLocalStorage,
    setValueToLocalStorage,
} from './common'

describe('Testing local-storage/common', () => {
    beforeEach(() => {
        window.localStorage.clear()
    })

    test('Should set and get value from local storage', () => {
        const key = 'test'
        setValueToLocalStorage(key, 'test')
        expect(getValueFromLocalStorage(key)).toBe('test')
    })
    test('Should remove key from local storage', () => {
        const key = 'test'
        expect(getValueFromLocalStorage(key)).toBeNull()
        setValueToLocalStorage(key, 'test')
        expect(getValueFromLocalStorage(key)).toBe('test')
        clearFromLocalStorage(key)
        expect(getValueFromLocalStorage(key)).toBeNull()
    })
})
