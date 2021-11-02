import { useContext, lazy, Suspense, useEffect } from 'react'
import { useHistory, useLocation, Switch, Route } from 'react-router-dom'
import { ThemeProvider } from '@intermine/chromatin/styles'
import { Box } from '@intermine/chromatin/box'
import { createStyle } from '@intermine/chromatin/styles'
import { useDebouncedCallback } from '@intermine/chromatin/utils'

import { AuthStates } from './constants/auth'
import { AppContext } from './context'
import { RouteLoadingSpinner } from './components/route-loading-spinner'
import { darkTheme, lightTheme } from './constants/theme'
import { PageNotFound } from './components/page-not-found'
import {
    isAuthRoute,
    AUTH_PATH_BASE,
    PRE_AUTH_PATH_BASE,
    LOGIN_PATH,
    DASHBOARD_OVERVIEW_PATH
} from './routes'
import { DomElementIDs } from './constants/ids'
import { resizeWorkSpaceContainer } from './utils/resize'

const Dashboard = lazy(() => import('./domain/dashboard'))
const PreAuth = lazy(() => import('./domain/pre-auth'))

const { Authorize } = AuthStates

const useStyles = createStyle({
    '@global': {
        '*': {
            boxSizing: 'border-box',
            margin: 0,
            padding: 0
        },
        html: {
            position: 'relative'
        },
        body: {
            position: 'relative'
        },
        '#root': {
            /**
             * This is a single page application so we don't want height of
             * root component exceeds 100vh.
             */
            height: '100vh'
        }
    }
})

const routes = [
    {
        path: AUTH_PATH_BASE,
        id: 'auth',
        Component: Dashboard
    },
    {
        path: PRE_AUTH_PATH_BASE,
        id: 'pre-auth',
        Component: PreAuth
    }
]

export const App = () => {
    /**
     * Activate global styles
     */
    useStyles()

    const history = useHistory()
    const { pathname } = useLocation()

    const store = useContext(AppContext)
    const {
        authReducer: { state: auth },
        preferencesReducer: {
            state: { themeType }
        }
    } = store

    const onLocationChange = () => {
        if (auth.authState !== Authorize && isAuthRoute(pathname)) {
            /**
             * If not authorize and user tries to navigate to
             * auth page.
             */
            history.push(LOGIN_PATH)
            return
        }
        if (auth.authState === Authorize && !isAuthRoute(pathname)) {
            /**
             * If authorize and user tries to navigate to
             * unauthorize page.
             *
             * Maybe in future there might be use case in which
             * we allow user to navigate to unauthorize pages if user
             * is authorize. In that case we have to update this
             * block.
             */
            history.push(DASHBOARD_OVERVIEW_PATH)
            return
        }

        if (pathname === '/') {
            /**
             * Redirect to login or dashboard
             */
            if (auth.authState === Authorize) {
                history.push(DASHBOARD_OVERVIEW_PATH)
                return
            }

            history.push(LOGIN_PATH)
            return
        }
    }

    const debouncedResizeWorkSpaceContainer = useDebouncedCallback(
        resizeWorkSpaceContainer,
        800
    )

    useEffect(() => {
        onLocationChange()
    }, [pathname])

    useEffect(() => {
        window.addEventListener('resize', debouncedResizeWorkSpaceContainer)
        resizeWorkSpaceContainer()
    }, [])

    return (
        <ThemeProvider theme={themeType === 'dark' ? darkTheme : lightTheme}>
            <Box
                csx={{
                    root: ({ palette: { neutral } }) => ({
                        color: neutral[50],
                        width: '100%',
                        position: 'relative'
                    })
                }}
            >
                <Box
                    id={DomElementIDs.WorkspaceContainer}
                    csx={{ root: { overflow: 'auto' } }}
                >
                    <Suspense fallback={<RouteLoadingSpinner />}>
                        <Switch>
                            {routes.map(({ path, Component, id }) => (
                                <Route key={id} path={path}>
                                    <Component />
                                </Route>
                            ))}
                            <Route path="*">
                                <PageNotFound />
                            </Route>
                        </Switch>
                    </Suspense>
                </Box>
            </Box>
        </ThemeProvider>
    )
}
