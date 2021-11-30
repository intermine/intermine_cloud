import { createContext } from 'react'
import { TLandingPageListContext } from './types'

export const LandingPageListContext = createContext<TLandingPageListContext>(
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    null!
)
