import React from 'react'

export type TInputField = {
    value: string
    isError: boolean
    errorMessage: string
}

export const updateError = <T>(
    setFields: React.Dispatch<React.SetStateAction<T>>,
    key: keyof T,
    errorMessage: string
) => {
    setFields((prev) => ({
        ...prev,
        [key]: {
            ...prev[key],
            isError: true,
            errorMessage,
        },
    }))
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
