import { TUseDashboardFormFields } from '../../common/dashboard-form/utils'

export type TCreateMineFormFields =
    | 'name'
    | 'template'
    | 'datasets'
    | 'description'
    | 'subDomain'

// eslint-disable-next-line max-len
export const initialFormFieldsValue: TUseDashboardFormFields<TCreateMineFormFields> =
    {
        name: {
            value: '',
            options: { isRequired: true },
        },
        datasets: {
            value: [],
            options: { isRequired: true, validator: (v) => v.length > 0 },
        },
        subDomain: {
            value: '',
            options: {
                isRequired: true,
                validator: (v: string) =>
                    v.search(/^[\dA-Za-z][\d.A-Za-z-]+[\dA-Za-z]$/) === 0,
            },
        },
        description: {
            value: '',
        },
        template: {
            value: { value: '', label: '' },
            options: { isRequired: true, validator: (v) => v.label !== '' },
        },
    }
