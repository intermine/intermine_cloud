import { lazy, Suspense } from 'react'
import { Switch, Route } from 'react-router-dom'
import { Box } from '@intermine/chromatin/box'
import { createStyle } from '@intermine/chromatin/styles'

import { Navbar } from '../../components/navbar'
import { DomElementIDs } from '../../constants/ids'
import {
    DASHBOARD_OVERVIEW_PATH,
    DASHBOARD_DATA_PATH,
    DASHBOARD_MINES_PATH
} from '../../routes'
import { RouteLoadingSpinner } from '../../components/route-loading-spinner'

import { Sidebar } from './sidebar'
import { Progress } from './progress'

const Overview = lazy(() => import('./overview'))
const Data = lazy(() => import('./data'))
const Mines = lazy(() => import('./mines'))

const pages = [
    {
        id: 'overview',
        path: DASHBOARD_OVERVIEW_PATH,
        Component: Overview
    },
    {
        id: 'data',
        path: DASHBOARD_DATA_PATH,
        Component: Data
    },
    {
        id: 'mines',
        path: DASHBOARD_MINES_PATH,
        Component: Mines
    }
]

const useStyles = createStyle((theme) => {
    const { themeType, palette } = theme
    const {
        themeBackground: { light, dark },
        grey,
        darkGrey
    } = palette

    return {
        rootContainer: {
            height: '100%',
            flexWrap: 'wrap',
            backgroundColor: themeType === 'dark' ? dark.hex : grey[20]
        },

        sidebarContainer: {
            padding: '4.75rem 0 3rem',
            width: '23rem'
        },
        workspaceContainer: {
            background: themeType === 'dark' ? darkGrey[30] : light.hex,
            borderRadius: '3rem 0 0 3rem',
            padding: '4.75rem 0 3rem',
            flex: 1
        },
        pageContainer: {
            padding: '3rem',
            position: 'relative',
            height: '100%',
            overflow: 'auto'
        },

        progressContainer: {
            background: themeType === 'dark' ? darkGrey[40] : grey[40],
            bottom: '0',
            borderRadius: '1rem 0 0 1rem',
            left: '3rem',
            minHeight: '3rem',
            right: 0,
            position: 'fixed'
        }
    }
})

const Dashboard = () => {
    const classes = useStyles()

    return (
        <Box className={classes.rootContainer}>
            <Navbar />
            <Box
                id={DomElementIDs.WorkspaceContainer}
                csx={{ root: { display: 'flex', height: '100%' } }}
            >
                <Box className={classes.sidebarContainer}>
                    <Sidebar />
                </Box>
                <Box className={classes.workspaceContainer}>
                    <Box className={classes.pageContainer}>
                        <Suspense
                            fallback={
                                <RouteLoadingSpinner hasBackground={false} />
                            }
                        >
                            {/* TODO: Add Page not found */}
                            <Switch>
                                {pages.map(({ id, path, Component }) => (
                                    <Route path={path} key={id}>
                                        <Component />
                                    </Route>
                                ))}
                            </Switch>
                        </Suspense>
                    </Box>
                </Box>

                <Box className={classes.progressContainer}>
                    <Progress />
                </Box>
            </Box>
        </Box>
    )
}

export default Dashboard
