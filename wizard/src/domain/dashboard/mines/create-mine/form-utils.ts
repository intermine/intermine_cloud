import {
    TUseDashboardFormField,
    TUseDashboardFormFields,
    TUseDashboardFormState,
} from '../../common/dashboard-form/utils'

export type TCreateMineFormFields =
    | 'name'
    | 'template'
    | 'datasets'
    | 'description'
    | 'subDomain'

type State = TUseDashboardFormState<
    Record<TCreateMineFormFields, TUseDashboardFormField>
>

// eslint-disable-next-line max-len
export const initialFormFieldsValue: TUseDashboardFormFields<
    TCreateMineFormFields,
    State
> = {
    name: {
        value: '',
        options: { isRequired: true },
    },
    datasets: {
        value: [],
        options: {
            isRequired: true,
            validator: (v) => {
                if (v.length === 0) {
                    return {
                        isError: true,
                        errorMsg: `Please select at least one Dataset`,
                    }
                }
                return { isError: false }
            },
        },
    },
    subDomain: {
        value: '',
        options: {
            isRequired: true,
            validator: (v: string) => {
                if (v.length === 0) {
                    return {
                        isError: true,
                        errorMsg: 'Sub Domain is required',
                    }
                }

                if (v.length < 3) {
                    return {
                        isError: true,
                        errorMsg: `Sub Domain length should be
                        at least 3 character long.`,
                    }
                }

                if (v.search(/^[\dA-Za-z][\d.A-Za-z-]+[\dA-Za-z]$/) !== 0) {
                    return {
                        isError: true,
                        errorMsg: `Please enter a valid sub domain.
                        Don't add special characters.`,
                    }
                }
                return {
                    isError: false,
                }
            },
        },
    },
    description: {
        value: '',
        options: {},
    },
    template: {
        value: { value: '', label: '' },
        options: {
            isRequired: true,
            validator: (v) => {
                if (v.label === '') {
                    return {
                        isError: true,
                        errorMsg: 'Template is required',
                    }
                }
                return {
                    isError: false,
                }
            },
        },
    },
}
