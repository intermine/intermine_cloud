import { lazy, Suspense, useContext } from 'react'
import { Switch, Route } from 'react-router-dom'
import { Box } from '@intermine/chromatin/box'
import { createStyle } from '@intermine/chromatin/styles'

import { AppContext } from '../../context'
import { DomElementIDs } from '../../constants/ids'
import {
    DASHBOARD_OVERVIEW_PATH,
    DASHBOARD_DATA_PATH,
    DASHBOARD_MINES_PATH
} from '../../routes'
import { RouteLoadingSpinner } from '../../components/route-loading-spinner'

import { Sidebar } from './sidebar'
import { Navbar } from './navbar'
import { AdditionalSidebar } from './additional-sidebar'

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

type TUseStyleProps = {
    isAdditionalSidebarOpen: boolean
}

const useStyles = createStyle((theme) => {
    const { themeType, palette } = theme
    const {
        themeBackground: { light, dark },
        grey,
        darkGrey
    } = palette

    const transitionDuration = '0.23s'

    return {
        rootContainer: {
            height: '100%',
            backgroundColor: themeType === 'dark' ? dark.hex : grey[20]
        },

        sidebarContainer: {
            padding: '4.75rem 0 3rem',
            width: '20rem'
        },

        workspaceContainer: (props: TUseStyleProps) => ({
            backgroundColor: themeType === 'dark' ? darkGrey[30] : light.hex,
            borderRadius: '1rem',
            margin: '1rem',
            marginRight: props.isAdditionalSidebarOpen ? '22rem' : '5rem',
            padding: '6rem 2rem 3rem',
            flex: 1,
            transition: transitionDuration
        }),

        pageContainer: {
            position: 'relative',
            height: '100%',
            overflow: 'auto'
        },

        additionalSidebarContainer: (props: TUseStyleProps) => ({
            backgroundColor: themeType === 'dark' ? darkGrey[30] : light.hex,
            bottom: '1rem',
            top: '1rem',
            width: props.isAdditionalSidebarOpen ? '20rem' : '3rem',
            borderRadius: '1rem',
            right: '1rem',
            position: 'fixed',
            transition: transitionDuration
        }),

        navbarContainer: (props: TUseStyleProps) => ({
            left: 0,
            position: 'fixed',
            right: props.isAdditionalSidebarOpen ? '21rem' : '4rem',
            top: 0,
            transition: transitionDuration,
            zIndex: 10
        })
    }
})

const Dashboard = () => {
    const store = useContext(AppContext)
    const {
        additionalSidebarReducer: {
            state: { isOpen: isAdditionalSidebarOpen }
        }
    } = store

    const classes = useStyles({ isAdditionalSidebarOpen })

    return (
        <Box className={classes.rootContainer}>
            <Box className={classes.navbarContainer}>
                <Navbar />
            </Box>
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

                <Box className={classes.additionalSidebarContainer}>
                    <AdditionalSidebar />
                </Box>
            </Box>
        </Box>
    )
}

export default Dashboard
