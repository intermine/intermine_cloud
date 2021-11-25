import { createContext } from 'react'
type TDashboardFormContext = {
    isDirty: boolean
}

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
export const DashboardFormContext = createContext<TDashboardFormContext>(null!)
