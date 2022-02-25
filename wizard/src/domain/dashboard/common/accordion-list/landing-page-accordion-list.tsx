import { AccordionList, TAccordionListDatum } from './accordion-list'

export type TLandingPageAccordionListProps = {
    key?: string
    isFirstItem: boolean
    isLastItem: boolean
    item: TAccordionListDatum
}

export const LandingPageAccordionList = (
    props: TLandingPageAccordionListProps
) => {
    const { isLastItem, isFirstItem, item } = props

    return (
        <AccordionList
            key={item.id}
            isFirstItem={isFirstItem}
            isLastItem={isLastItem}
        >
            <AccordionList.Header>
                {item.headerItems.map((header) => {
                    return (
                        <AccordionList.HeaderChild
                            key={header.id}
                            data={header}
                            totalItems={item.headerItems.length}
                        />
                    )
                })}
            </AccordionList.Header>
            <AccordionList.Body content={item.bodyItem.content}>
                {/* Area for action */}
            </AccordionList.Body>
        </AccordionList>
    )
}
