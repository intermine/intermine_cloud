import { Box } from '@intermine/chromatin/box'
import { List } from '@intermine/chromatin/list'
import { ListItem } from '@intermine/chromatin/list-item'
import { Button } from '@intermine/chromatin/button'
import { NavLink, useLocation } from 'react-router-dom'
import OverviewIcon from '@intermine/chromatin/icons/System/apps-fill'
import DataIcon from '@intermine/chromatin/icons/Device/database-2-fill'
import MinesIcon from '@intermine/chromatin/icons/Business/bubble-chart-fill'

import {
    DASHBOARD_OVERVIEW_PATH,
    DASHBOARD_DATA_PATH,
    DASHBOARD_MINES_PATH
} from '../../../routes'
import { createStyle } from '@intermine/chromatin/styles'

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

const useStyles = createStyle((theme) => {
    const { spacing } = theme

    return {
        container: {
            padding: spacing(10, 6)
        },
        listItem: {
            '&&': {
                marginBottom: spacing(1)
            }
        },
        button: {
            '&&': {
                justifyContent: 'flex-start'
            }
        }
    }
})

export const Sidebar = () => {
    const classes = useStyles()
    const location = useLocation()

    const isCurrentPath = (path: string): boolean => {
        return location.pathname.startsWith(path)
    }

    return (
        <Box className={classes.container}>
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
                            <Button
                                variant="ghost"
                                Component={NavLink}
                                to={to}
                                LeftIcon={icon}
                                hasFullWidth
                                className={classes.button}
                                isHovered={isActive}
                                hasHighlightOnFocus={false}
                                hasHoverEffectOnFocus
                            >
                                {text}
                            </Button>
                        </ListItem>
                    )
                })}
            </List>
        </Box>
    )
}
