import { lazy, Suspense } from 'react'
import { Switch, Route } from 'react-router-dom'
import { Box } from '@intermine/chromatin/box'
import { createStyle } from '@intermine/chromatin/styles'

import { DomElementIDs } from '../../constants/ids'
import {
    DASHBOARD_OVERVIEW_PATH,
    DASHBOARD_DATASETS_PATH,
    DASHBOARD_MINES_PATH
} from '../../routes'
import { RouteLoadingSpinner } from '../../components/route-loading-spinner'

import { Sidebar } from './sidebar'
import { AdditionalSidebar } from './additional-sidebar'
import { DashboardErrorBoundary } from './common/error-boundary'
import { useAdditionalSidebarReducer, useSidebarReducer } from '../../context'

const Overview = lazy(() => import('./overview'))
const Datasets = lazy(() => import('./datasets'))
const Mines = lazy(() => import('./mines'))

const pages = [
    {
        id: 'overview',
        path: DASHBOARD_OVERVIEW_PATH,
        Component: Overview
    },
    {
        id: 'dataset',
        path: DASHBOARD_DATASETS_PATH,
        Component: Datasets
    },
    {
        id: 'mines',
        path: DASHBOARD_MINES_PATH,
        Component: Mines
    }
]

type TUseStyleProps = {
    isAdditionalSidebarOpen: boolean
    isSidebarOpen: boolean
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

        sidebarContainer: (props: TUseStyleProps) => ({
            width: props.isSidebarOpen ? '20rem' : '5rem',
            transition: transitionDuration
        }),

        workspaceContainer: (props: TUseStyleProps) => ({
            backgroundColor: themeType === 'dark' ? darkGrey[30] : light.hex,
            borderRadius: '1rem',
            margin: '1rem 0',
            marginRight: props.isAdditionalSidebarOpen ? '22rem' : '5rem',
            padding: '3rem 2rem',
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
        })
    }
})

const Dashboard = () => {
    const additionalSidebarReducer = useAdditionalSidebarReducer()
    const sidebarReducer = useSidebarReducer()

    const {
        state: { isOpen: isAdditionalSidebarOpen }
    } = additionalSidebarReducer

    const {
        state: { isOpen: isSidebarOpen }
    } = sidebarReducer

    const classes = useStyles({ isAdditionalSidebarOpen, isSidebarOpen })

    return (
        <Box className={classes.rootContainer}>
            <Box
                id={DomElementIDs.WorkspaceContainer}
                csx={{ root: { display: 'flex', height: '100%' } }}
            >
                <Box className={classes.sidebarContainer}>
                    <Sidebar />
                </Box>
                <Box className={classes.workspaceContainer}>
                    <Box
                        className={classes.pageContainer}
                        id={DomElementIDs.WorkspacePageContainer}
                    >
                        <DashboardErrorBoundary>
                            <Suspense
                                fallback={
                                    <RouteLoadingSpinner
                                        hasBackground={false}
                                    />
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
                        </DashboardErrorBoundary>
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
