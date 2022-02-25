import { useContext, useEffect, useRef, useState } from 'react'
import clsx from 'clsx'
import { Button } from '@intermine/chromatin'
import { Box } from '@intermine/chromatin/box'
import { Typography } from '@intermine/chromatin/typography'
import { IconButton } from '@intermine/chromatin/icon-button'
import { Collapsible } from '@intermine/chromatin/collapsible'
import { createStyle } from '@intermine/chromatin/styles'
import { useDebouncedCallback } from '@intermine/chromatin/utils'
import DownArrow from '@intermine/chromatin/icons/System/arrow-down-s-line'

import { DomElementIDs } from '../../../../constants/ids'
// eslint-disable-next-line max-len
import { RouteLoadingSpinner } from '../../../../components/route-loading-spinner'
import { AccordionListContext } from './context'

const {
    WorkspacePageContainer,
    WorkspaceHeadingContainer,
    WorkspacePageListContainer
} = DomElementIDs

type TElement = React.ReactChild | React.ReactChild[]
type TID = string

export type TAccordionListHeaderItem = {
    id: TID
    heading: TElement
    body: TElement
}

export type TAccordionListBodyItem = {
    content: TElement
}

export type TAccordionListDatum = {
    id: TID
    file_id: TID
    headerItems: Array<TAccordionListHeaderItem>
    bodyItem: TAccordionListBodyItem
}

const useStyles = createStyle((theme) => {
    const {
        palette: { neutral, themeType, grey, darkGrey },
        spacing
    } = theme
    return {
        accordionList: {
            padding: spacing(2, 4),
            transition: '0.3s',
            ...(themeType === 'dark' && {
                background: neutral[10],
                margin: '0 0 1px 0'
            }),
            ...(themeType === 'light' && {
                border: '1px solid ' + neutral[10],
                margin: '-1px 0 0 0'
            })
        },
        accordionListIsOpen: {
            borderRadius: '0.5rem',
            '&&': {
                margin: spacing(2, 0)
            }
        },
        topCornerRound: {
            borderTopRightRadius: '0.5rem',
            borderTopLeftRadius: '0.5rem'
        },
        bottomCornerRound: {
            borderBottomRightRadius: '0.5rem',
            borderBottomLeftRadius: '0.5rem'
        },
        header: {
            display: 'flex',
            paddingRight: spacing(7),
            position: 'relative'
        },
        accordionToggler: {
            transition: '0.3s'
        },
        rotate: {
            transform: 'rotate(180deg)'
        },
        body: {
            borderTop:
                '1px solid ' + (themeType === 'dark' ? darkGrey[50] : grey[30]),
            display: 'flex',
            flexDirection: 'column',
            marginTop: spacing(3),
            maxHeight: '12rem',
            minHeight: '5rem',
            overflow: 'auto',
            padding: spacing(3, 2)
        },
        headerChild: {
            display: 'inline-flex',
            flexDirection: 'column',
            justifyContent: 'center',
            overflow: 'hidden',
            paddingRight: spacing(3)
        },
        emptyListMessage: {
            color: neutral[30],
            height: '100%',
            padding: spacing(5),
            textAlign: 'center'
        }
    }
})

export type TAccordionListContainerProps = {
    /**
     * @default true
     */
    isLoading?: boolean
    /**
     * @default false
     */
    isEmpty?: boolean
    /**
     * @default ''
     */
    msgIfListIsEmpty?: TElement
    children: TElement
}

export const AccordionListContainer = (props: TAccordionListContainerProps) => {
    const {
        isLoading = true,
        isEmpty = false,
        children,
        msgIfListIsEmpty = ''
    } = props

    const resizeAccordionListContainer = () => {
        const pageContainer: HTMLDivElement | null = document.querySelector(
            '#' + WorkspacePageContainer
        )
        const heading: HTMLDivElement | null = document.querySelector(
            '#' + WorkspaceHeadingContainer
        )
        const listContainer: HTMLDivElement | null = document.querySelector(
            '#' + WorkspacePageListContainer
        )

        if (pageContainer && heading && listContainer) {
            listContainer.style.height = `${pageContainer.clientHeight - 130}px`
        }
    }

    const debouncedResizeAccordionListContainer = useDebouncedCallback(
        resizeAccordionListContainer,
        1000
    )

    useEffect(() => {
        resizeAccordionListContainer()
        window.addEventListener('resize', debouncedResizeAccordionListContainer)
        return () => {
            window.removeEventListener(
                'resize',
                debouncedResizeAccordionListContainer
            )
        }
    }, [])

    const getComponentToRender = () => {
        if (isLoading) {
            return <RouteLoadingSpinner hasBackground={false} />
        }

        if (isEmpty) {
            return msgIfListIsEmpty
        }

        return <Box csx={{ root: { minWidth: '50rem' } }}>{children}</Box>
    }

    return (
        <Box
            id={WorkspacePageListContainer}
            csx={{
                root: ({ spacing, palette: { neutral } }) => ({
                    borderRadius: '0.5rem',
                    marginTop: spacing(15),
                    paddingTop: spacing(1),
                    overflow: 'auto',
                    ...(isEmpty && {
                        color: neutral[30],
                        textAlign: 'center'
                    })
                })
            }}
            isContentCenter={isEmpty}
        >
            {getComponentToRender()}
        </Box>
    )
}

type TAccordionListProps = {
    key: string
    isFirstItem: boolean
    isLastItem: boolean
    children: TElement
}

export const AccordionList = (props: TAccordionListProps) => {
    const { isFirstItem, isLastItem, children } = props

    const [isAccordionOpen, setIsAccordionOpen] = useState(false)
    const ref = useRef<null | HTMLDivElement>(null)

    const classes = useStyles()

    const onAccordionTogglerClick = () => {
        const accordionNextState = !isAccordionOpen

        if (ref.current) {
            const prevListItem = ref.current.previousSibling as HTMLDivElement
            const nextListItem = ref.current.nextSibling as HTMLDivElement

            if (prevListItem) {
                if (accordionNextState) {
                    prevListItem.classList.add(classes.bottomCornerRound)
                } else {
                    prevListItem.classList.remove(classes.bottomCornerRound)
                }
            }

            if (nextListItem) {
                if (accordionNextState) {
                    nextListItem.classList.add(classes.topCornerRound)
                } else {
                    nextListItem.classList.remove(classes.topCornerRound)
                }
            }
        }

        setIsAccordionOpen(accordionNextState)
    }

    return (
        <AccordionListContext.Provider
            value={{ isAccordionOpen, onAccordionTogglerClick, classes }}
        >
            <Box
                ref={ref}
                className={clsx(classes.accordionList, {
                    [classes.topCornerRound]: isFirstItem,
                    [classes.bottomCornerRound]: isLastItem,
                    [classes.accordionListIsOpen]: isAccordionOpen
                })}
            >
                {children}
            </Box>
        </AccordionListContext.Provider>
    )
}

type THeaderProps = {
    children: TElement
}
const Header = (props: THeaderProps) => {
    const { classes, onAccordionTogglerClick, isAccordionOpen } =
        useContext(AccordionListContext)
    const { header, accordionToggler, rotate } = classes

    const { children } = props

    return (
        <Box className={header}>
            <Box display="flex" csx={{ root: { flex: '1', width: '100%' } }}>
                {children}
            </Box>
            <Box
                csx={{
                    root: {
                        position: 'absolute',
                        right: '0'
                    }
                }}
            >
                <IconButton
                    className={clsx(accordionToggler, {
                        [rotate]: isAccordionOpen
                    })}
                    onClick={onAccordionTogglerClick}
                    Icon={<DownArrow />}
                    isDense
                />
            </Box>
        </Box>
    )
}

const HeaderChild = (props: {
    data: TAccordionListHeaderItem
    totalItems: number
    key: string
}) => {
    const { data, totalItems } = props
    const { heading, body } = data

    const { classes } = useContext(AccordionListContext)

    return (
        <Box
            className={classes.headerChild}
            csx={{
                root: {
                    flex: `0 0 ${100 / totalItems}%`
                }
            }}
        >
            <Typography color="neutral.50" variant="caption">
                {heading}
            </Typography>
            <Typography isTruncateText>{body}</Typography>
        </Box>
    )
}

type TBodyProps = {
    content: TElement
    children: TElement
}

const Body = (props: TBodyProps) => {
    const { content, children } = props
    const { isAccordionOpen, classes } = useContext(AccordionListContext)

    const getContent = () => {
        if (!content) {
            return (
                <Typography Component="div" variant="bodySm" color="neutral.30">
                    No description available.
                </Typography>
            )
        }

        return (
            <Typography Component="div" variant="body" color="neutral.40">
                {content}
            </Typography>
        )
    }
    return (
        <Box>
            <Collapsible in={isAccordionOpen}>
                <Box className={classes.body}>
                    {getContent()}
                    <Box
                        csx={{
                            root: { alignSelf: 'flex-end', marginTop: 'auto' }
                        }}
                    >
                        {children}
                    </Box>
                </Box>
            </Collapsible>
        </Box>
    )
}

type TActionButton = {
    onClick: () => void
    color?: string
    isLoading?: boolean
    children: TElement
    Icon?: TElement
}

const ActionButton = (props: TActionButton) => {
    const { isLoading, color, onClick, children, Icon } = props

    return (
        <Button
            isTextUppercase={false}
            isDense
            variant={isLoading ? 'normal' : 'ghost'}
            color={color}
            onClick={onClick}
            isLoading={isLoading}
            LeftIcon={Icon}
        >
            {children}
        </Button>
    )
}

AccordionList.Header = Header
AccordionList.HeaderChild = HeaderChild
AccordionList.Body = Body
AccordionList.ActionButton = ActionButton
