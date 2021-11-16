import { createContext } from 'react'

import type { TAppContext } from './types'

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const AppContext = createContext<TAppContext>(null!)

export { AppContext }
