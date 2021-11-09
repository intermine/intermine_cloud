import { clone } from '@intermine/chromatin/utils'
import React from 'react'

export type TInputField = {
    value: string
    isError: boolean
    errorMessage: string
}

export const updateError = <T>(
    setFields: React.Dispatch<React.SetStateAction<T>>,
    errorFields: [keyof T, string][]
) => {
    setFields((prev) => {
        const newPrev: T = clone(prev)

        for (const keyVal of errorFields) {
            newPrev[keyVal[0]] = {
                ...newPrev[keyVal[0]],
                isError: true,
                errorMessage: keyVal[1],
            }
        }
        return newPrev
    })
}

export const updateValue = <T>(
    setFields: React.Dispatch<React.SetStateAction<T>>,
    key: keyof T,
    event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>
) => {
    const { value } = event.currentTarget

    setFields((prev) => ({
        ...prev,
        [key]: {
            isError: false,
            errorMessage: '',
            value,
        },
    }))
}

export const scrollTo = (id: string) => {
    const element = document.querySelector('#' + id)

    if (element) {
        element.scrollIntoView()
    }
}
