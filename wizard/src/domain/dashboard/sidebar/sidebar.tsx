import { useLocation, useHistory } from 'react-router-dom'

import { Box } from '@intermine/chromatin/box'
import { List } from '@intermine/chromatin/list'
import { ListItem } from '@intermine/chromatin/list-item'
import { Button, ButtonCommonProps } from '@intermine/chromatin/button'
import { Tooltip } from '@intermine/chromatin/tooltip'
import { createStyle } from '@intermine/chromatin/styles'
import OverviewIcon from '@intermine/chromatin/icons/System/apps-fill'
import DataIcon from '@intermine/chromatin/icons/Device/database-2-fill'
import MinesIcon from '@intermine/chromatin/icons/Business/bubble-chart-fill'
import CollapseIcon from '@intermine/chromatin/icons/System/arrow-left-line'

import { useSidebarReducer } from '../../../context'
import {
    DASHBOARD_OVERVIEW_PATH,
    DASHBOARD_DATA_PATH,
    DASHBOARD_MINES_PATH
} from '../../../routes'
import { Logo } from '../../../components/logo'

const sidebarItems = [
    {
        id: 'overview',
        to: DASHBOARD_OVERVIEW_PATH,
        text: 'Overview',
        icon: <OverviewIcon />
    },
    {
        id: 'data',
        to: DASHBOARD_DATA_PATH,
        text: 'Data',
        icon: <DataIcon />
    },
    {
        id: 'mine',
        to: DASHBOARD_MINES_PATH,
        text: 'Mines',
        icon: <MinesIcon />
    }
]

type TUseStyleProps = {
    isOpen: boolean
}

const useStyles = createStyle((theme) => {
    const { spacing } = theme

    return {
        container: (props: TUseStyleProps) => ({
            padding: props.isOpen ? spacing(10, 6) : spacing(10, 3)
        }),
        buttonContent: (props: TUseStyleProps) => ({
            width: !props.isOpen ? 0 : '10rem',
            overflow: 'hidden',
            textAlign: 'left',
            transition: '0.230s',
            transitionDelay: '0.1s'
        }),
        listItem: {
            '&&': {
                marginBottom: spacing(1)
            }
        },
        logo: (props: TUseStyleProps) => ({
            height: '5rem',
            padding: props.isOpen ? spacing(0, 0, 10, 7) : spacing(0, 0, 10, 4),
            width: '20rem',
            transition: '0.23s'
        })
    }
})

export const Sidebar = () => {
    const location = useLocation()
    const history = useHistory()
    const sidebarReducer = useSidebarReducer()
    const {
        state: {
            isOpen,
            isPageSwitchingAllowed,
            onSidebarItemClick: _onSidebarItemClick
        },
        updateSidebarState
    } = sidebarReducer

    const classes = useStyles({ isOpen })

    const isCurrentPath = (path: string): boolean => {
        return location.pathname.startsWith(path)
    }

    const onSidebarItemClick = (to: string) => {
        _onSidebarItemClick(to)
        if (isPageSwitchingAllowed) {
            history.push(to)
        }
    }

    const getButtonCSX = (rotateIcons?: boolean): ButtonCommonProps['csx'] => {
        return {
            root: {
                textOverflow: 'clip',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                justifyContent: isOpen ? 'flex-start' : 'center',
                ...(!isOpen && {
                    padding: '1rem',
                    transition: 'font-size 0'
                })
            },
            iconContainerLeft: {
                transition: '0.230s',
                transform: 'rotate(0)',
                ...(!isOpen && {
                    margin: 0,
                    ...(rotateIcons && {
                        transform: 'rotate(180deg)'
                    })
                })
            }
        }
    }

    return (
        <Box className={classes.container}>
            <Logo className={classes.logo} hasText={isOpen} />
            <List csx={{ root: { background: 'transparent' } }}>
                {sidebarItems.map(({ id, text, icon, to }) => {
                    const isActive = isCurrentPath(to)
                    return (
                        <ListItem
                            tabIndex={-1}
                            key={id}
                            hasPadding={false}
                            className={classes.listItem}
                        >
                            <Tooltip
                                message={text}
                                placement="right"
                                isDisabled={isOpen}
                            >
                                <Button
                                    variant="ghost"
                                    onClick={() => onSidebarItemClick(to)}
                                    LeftIcon={icon}
                                    hasFullWidth
                                    isHovered={isActive}
                                    hasHighlightOnFocus={false}
                                    hasHoverEffectOnFocus
                                    csx={getButtonCSX()}
                                >
                                    <div className={classes.buttonContent}>
                                        {text}
                                    </div>
                                </Button>
                            </Tooltip>
                        </ListItem>
                    )
                })}
                <ListItem hasPadding={false} className={classes.listItem}>
                    <Tooltip
                        message="Expand Sidebar"
                        placement="bottom-start"
                        isDisabled={isOpen}
                    >
                        <Button
                            variant="ghost"
                            onClick={() =>
                                updateSidebarState({ isOpen: !isOpen })
                            }
                            LeftIcon={<CollapseIcon />}
                            hasFullWidth
                            hasHighlightOnFocus={false}
                            csx={getButtonCSX(true)}
                        >
                            <div className={classes.buttonContent}>
                                Collapse Sidebar
                            </div>
                        </Button>
                    </Tooltip>
                </ListItem>
            </List>
        </Box>
    )
}
