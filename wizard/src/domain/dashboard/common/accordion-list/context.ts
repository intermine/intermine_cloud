import { createContext } from 'react'

type TAccordionListContext = {
    isAccordionOpen: boolean
    onAccordionTogglerClick: () => void
    classes: {
        header: string
        accordionToggler: string
        rotate: string
        headerChild: string
        body: string
    }
}

export const AccordionListContext = createContext<TAccordionListContext>(
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    null!
)
