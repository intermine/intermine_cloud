import { useContext, useEffect } from 'react'
import clsx from 'clsx'
import { Button } from '@intermine/chromatin'
import { Box, BoxBaseProps } from '@intermine/chromatin/box'
import { Typography } from '@intermine/chromatin/typography'
import { IconButton } from '@intermine/chromatin/icon-button'
import { Collapsible } from '@intermine/chromatin/collapsible'
import { createStyle } from '@intermine/chromatin/styles'
import { useDebouncedCallback } from '@intermine/chromatin/utils'
import DownArrow from '@intermine/chromatin/icons/System/arrow-down-s-line'
import EditIcon from '@intermine/chromatin/icons/Design/pencil-fill'
import DeleteIcon from '@intermine/chromatin/icons/System/delete-bin-fill'

import { LandingPageListContext } from './landing-page-context'
import { DomElementIDs } from '../../../../constants/ids'
// eslint-disable-next-line max-len
import { RouteLoadingSpinner } from '../../../../components/route-loading-spinner'

import { TLandingPageListDatum, TLandingPageListHeaderItem } from './types'

const {
    WorkspacePageContainer,
    WorkspaceHeadingContainer,
    WorkspacePageListContainer
} = DomElementIDs

const useStyles = createStyle((theme) => {
    const {
        palette: { neutral, themeType, grey, darkGrey },
        spacing
    } = theme
    return {
        listIsOpen: {
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
        listItem: {
            padding: spacing(2, 5),
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
        listItemHeader: {
            display: 'flex'
        },
        iconButton: {
            transition: '0.3s'
        },
        rotate: {
            transform: 'rotate(180deg)'
        },
        listItemBodyItem: {
            borderTop:
                '1px solid ' + (themeType === 'dark' ? darkGrey[50] : grey[30]),
            display: 'flex',
            flexDirection: 'column',
            marginTop: spacing(3),
            minHeight: '10rem',
            padding: spacing(3, 2)
        },
        listItemHeaderItem: {
            display: 'inline-block',
            flex: '0 0 25%',
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

export const LandingPageListContainer = () => {
    const { lists, emptyListMsg, isLoading } = useContext(
        LandingPageListContext
    )

    const resizeTableContainer = () => {
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

    const debouncedResizeTableContainer = useDebouncedCallback(
        resizeTableContainer,
        1000
    )

    useEffect(() => {
        resizeTableContainer()
        window.addEventListener('resize', debouncedResizeTableContainer)
        return () => {
            window.removeEventListener('resize', debouncedResizeTableContainer)
        }
    }, [])

    const getComponentToRender = () => {
        if (isLoading) {
            return <RouteLoadingSpinner hasBackground={false} />
        }

        if (lists.length === 0) {
            return emptyListMsg
        }

        return lists.map((item, idx) => (
            <LandingPageListItem
                isFirst={idx === 0}
                isLast={idx + 1 === lists.length}
                id={item.id}
                key={item.id}
                data={item}
            />
        ))
    }

    const isNotRenderList = () => {
        return lists.length === 0
    }

    return (
        <Box
            id={WorkspacePageListContainer}
            csx={{
                root: ({ spacing, palette: { neutral } }) => ({
                    borderRadius: '0.5rem',
                    marginTop: spacing(15),
                    padding: spacing(1, 0),
                    overflow: 'auto',
                    ...(isNotRenderList() && {
                        color: neutral[30],
                        textAlign: 'center'
                    })
                })
            }}
            isContentCenter={isNotRenderList()}
        >
            {getComponentToRender()}
        </Box>
    )
}

type TLandingPageListItemProps = {
    data: TLandingPageListDatum
    id: string
    isFirst: boolean
    isLast: boolean
}

const LandingPageListItem = (props: TLandingPageListItemProps) => {
    const { data, id, isFirst, isLast } = props
    const { activeItemId, upItemId, downItemId, listsObj, updateState } =
        useContext(LandingPageListContext)

    const classes = useStyles()

    const handleIconButtonClick = () => {
        if (activeItemId === id) {
            updateState({ activeItemId: '', upItemId: '', downItemId: '' })
            return
        }
        const currentList = listsObj[id]
        if (currentList) {
            updateState({
                activeItemId: currentList.id,
                upItemId: currentList.upItemId,
                downItemId: currentList.downItemId
            })
        }
    }

    return (
        <Box
            className={clsx(classes.listItem, {
                [classes.topCornerRound]: downItemId === id || isFirst,
                [classes.bottomCornerRound]: upItemId === id || isLast,
                [classes.listIsOpen]: activeItemId === id
            })}
        >
            <LandingPageListItemHeader
                onIconButtonClick={handleIconButtonClick}
                containerClassName={classes.listItemHeader}
                iconButtonClassName={clsx(classes.iconButton, {
                    [classes.rotate]: activeItemId === id
                })}
            >
                {data.headerItems.map((item) => (
                    <LandingPageListItemHeaderItem
                        className={classes.listItemHeaderItem}
                        key={item.id}
                        data={item}
                    />
                ))}
            </LandingPageListItemHeader>
            <LandingPageListItemBody>
                <LandingPageListContent
                    className={classes.listItemBodyItem}
                    content={data.bodyItem.content}
                    isOpen={activeItemId === id}
                />
            </LandingPageListItemBody>
        </Box>
    )
}

type TLandingPageListItemHeaderProps = {
    onIconButtonClick: () => void
    containerClassName: string
    iconButtonClassName: string
    children: BoxBaseProps['children']
}
const LandingPageListItemHeader = (props: TLandingPageListItemHeaderProps) => {
    const {
        containerClassName,
        iconButtonClassName,
        children,
        onIconButtonClick
    } = props

    return (
        <Box className={containerClassName}>
            <Box display="flex" csx={{ root: { flex: '1' } }}>
                {children}
            </Box>
            <Box>
                <IconButton
                    className={iconButtonClassName}
                    onClick={onIconButtonClick}
                    Icon={<DownArrow />}
                    isDense
                />
            </Box>
        </Box>
    )
}

const LandingPageListItemBody = (props: BoxBaseProps) => {
    return <Box {...props} />
}

const LandingPageListItemHeaderItem = (props: {
    data: TLandingPageListHeaderItem
    className: string
    key: string
}) => {
    const { heading, body } = props.data

    return (
        <Box className={props.className}>
            <Typography color="neutral.50" variant="caption">
                {heading}
            </Typography>
            <Typography isTruncateText>{body}</Typography>
        </Box>
    )
}

type TLandingPageListContentProps = {
    className: string
    isOpen: boolean
    content: React.ReactChild | React.ReactChild[]
}

const LandingPageListContent = (props: TLandingPageListContentProps) => {
    const { className, isOpen, content } = props

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
        <Collapsible in={isOpen}>
            <Box className={className}>
                {getContent()}
                <Box
                    csx={{ root: { alignSelf: 'flex-end', marginTop: 'auto' } }}
                >
                    <Button
                        isTextUppercase={false}
                        isDense
                        variant="ghost"
                        color="error"
                        LeftIcon={<DeleteIcon />}
                    >
                        Delete
                    </Button>
                    <Button
                        isTextUppercase={false}
                        isDense
                        variant="ghost"
                        color="info"
                        LeftIcon={<EditIcon />}
                    >
                        Edit
                    </Button>
                </Box>
            </Box>
        </Collapsible>
    )
}
