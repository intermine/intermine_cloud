import { useState, useReducer } from 'react'
import { clone } from '@intermine/chromatin/utils'

/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any*/
export type TUseDashboardFormState<T extends TUseDashboardFormFields> = {
    [X in keyof T]: {
        value: TUseDashboardFormField<T>['value']
    }
}

export type TUseDashboardFormFieldOptions<T extends TUseDashboardFormFields> = {
    isRequired?: boolean
    validator?: (
        value: any,
        state: TUseDashboardFormState<T>
    ) => {
        isError: boolean
        type?: string
        errorMsg?: string
    }
}

export type TUseDashboardFormErrorFields<T extends TUseDashboardFormFields> =
    Partial<{
        [X in keyof T]: {
            errorMsg: string
            type: string
        }
    }>

export type TUseDashboardFormField<T extends TUseDashboardFormFields = any> = {
    value: any
    options?: TUseDashboardFormFieldOptions<T>
}

export type TUseDashboardFormFields<
    U extends string = string,
    T extends TUseDashboardFormState<any> = any
> = Record<U, TUseDashboardFormField<T>>

export type TUseDashboardFormReturn<T extends TUseDashboardFormFields> = {
    state: TUseDashboardFormState<T>
    errorFields: TUseDashboardFormErrorFields<T>
    updateDashboardFormState: (key: keyof T, value: any) => void
    handleFormSubmit: (
        cb: (state: TUseDashboardFormState<T>) => void
    ) => boolean
    isDirty: boolean
    resetToInitialState: () => void
}

const defaultValidator = (v: any) => {
    if (v === '') {
        return {
            isError: true,
            type: 'isRequired',
            errorMsg: 'Required',
        }
    }
    return {
        isError: false,
        type: '',
        errorMsg: '',
    }
}

const enum FormReducerActionType {
    UpdateInputValue,
}

type TFormReducerAction<T> = {
    type: FormReducerActionType
    payload: T
}

const formReducer = <S, A>(state: S, action: TFormReducerAction<A>): S => {
    const { type, payload } = action

    switch (type) {
        case FormReducerActionType.UpdateInputValue:
            return { ...state, ...payload }
        default:
            throw new Error(`FormReducer: action type is unknown, got: ${type}`)
    }
}

export const useDashboardForm = <T extends TUseDashboardFormFields>(
    fields: T
): TUseDashboardFormReturn<T> => {
    const getInitialValue = () => {
        const newState: TUseDashboardFormReturn<T>['state'] = Object.create({})!

        for (const key of Object.keys(fields)) {
            newState[key as keyof T] = {
                value: fields[key].value,
            }
        }
        return newState
    }

    const [state, setState] = useReducer<
        (
            state: TUseDashboardFormReturn<T>['state'],
            action: any
        ) => TUseDashboardFormReturn<T>['state']
    >(formReducer, getInitialValue())
    const [isDirty, setIsDirty] = useState(false)

    const [errorFields, setErrorFields] = useState<
        TUseDashboardFormReturn<T>['errorFields']
    >({})

    const updateDashboardFormState = (key: keyof T, value: any) => {
        delete errorFields[key]
        setErrorFields(errorFields)
        setIsDirty(true)
        setState((prev) => ({
            ...prev,
            [key]: {
                ...prev[key],
                value,
                isError: false,
            },
        }))
    }

    const handleFormSubmit: TUseDashboardFormReturn<T>['handleFormSubmit'] = (
        cb
    ) => {
        let isValid = true
        const newState: TUseDashboardFormReturn<T>['state'] = clone(state)
        const newErrorFields: TUseDashboardFormReturn<T>['errorFields'] = {}

        for (const key of Object.keys(newState)) {
            const field = { ...fields[key], ...newState[key] }
            if (field.options && field.options.isRequired) {
                const {
                    value,
                    options: { validator: _validator },
                } = field

                const validator = _validator ?? defaultValidator
                const {
                    isError,
                    type = '',
                    errorMsg = '',
                } = validator(value, state)

                if (isError) {
                    isValid = false

                    newErrorFields[key as keyof T] = {
                        errorMsg,
                        type,
                    }
                }
            }
        }

        setErrorFields(newErrorFields)

        if (isValid) {
            cb(newState)
        }
        return isValid
    }

    const resetToInitialState = () => {
        setState(getInitialValue())
        setErrorFields({})
        setIsDirty(false)
    }

    return {
        state,
        errorFields,
        handleFormSubmit,
        updateDashboardFormState,
        isDirty,
        resetToInitialState,
    }
    /* eslint-enable @typescript-eslint/no-non-null-assertion */
    /* eslint-enable @typescript-eslint/no-explicit-any*/
}
