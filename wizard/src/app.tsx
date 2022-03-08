import { lazy, Suspense, useEffect } from 'react'
import { useHistory, useLocation, Switch, Route } from 'react-router-dom'
import { ThemeProvider } from '@intermine/chromatin/styles'
import { Box } from '@intermine/chromatin/box'
import { createStyle } from '@intermine/chromatin/styles'
import 'regenerator-runtime'

import { AuthStates, OtherIDs } from './shared/constants'
import {
    authSelector,
    useStoreSelector,
    addGlobalAlert,
    useStoreDispatch,
    preferencesSelector
} from './store'

import { RouteLoadingSpinner } from './components/route-loading-spinner'
import { darkTheme, lightTheme } from './shared/constants'
import { PageNotFound } from './components/page-not-found'
import { GlobalModal } from './components/global-modal'
import {
    isAuthRoute,
    AUTH_PATH_BASE,
    PRE_AUTH_PATH_BASE,
    LOGIN_PATH,
    DASHBOARD_OVERVIEW_PATH
} from './routes'
import { GlobalAlert } from './components/global-alert'
import { TGlobalAlertReducerAlert } from './shared/types'

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
            position: 'relative',
            overflow: 'hidden'
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

    const storeDispatch = useStoreDispatch()

    const auth = useStoreSelector(authSelector)
    const { themeType } = useStoreSelector(preferencesSelector)

    const _addGlobalAlert = (payload: TGlobalAlertReducerAlert) => {
        storeDispatch(addGlobalAlert(payload))
    }

    const onLocationChange = () => {
        if (auth.authState !== Authorize && isAuthRoute(pathname)) {
            /**
             * If not authorize and user tries to navigate to
             * auth page.
             */
            history.push(`${LOGIN_PATH}?${OtherIDs.URLReferer}=${pathname}`)

            /**
             * Showing an alert to user stating why we redirected user to
             * login page.
             */
            _addGlobalAlert({
                id: OtherIDs.UnauthorizeAlert,
                isOpen: true,
                message: `You are not logged in. 
                Please login to continue.`,
                title: 'Unauthorise',
                type: 'warning'
            })

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

    const addOfflineAndOnlineEventListener = () => {
        window.addEventListener('offline', () => {
            _addGlobalAlert({
                isOpen: true,
                id: 'offline-alert',
                title: 'Connectivity Issue',
                message: 'It seems you are offline.',
                type: 'warning'
            })
        })

        window.addEventListener('online', () => {
            _addGlobalAlert({
                isOpen: true,
                id: 'online-alert',
                title: 'Online',
                message: 'You are now online.',
                type: 'info'
            })
        })
    }

    useEffect(() => {
        onLocationChange()
    }, [pathname])

    useEffect(() => {
        addOfflineAndOnlineEventListener()
    }, [])

    return (
        <ThemeProvider theme={themeType === 'dark' ? darkTheme : lightTheme}>
            <Box
                csx={{
                    root: ({ palette: { neutral } }) => ({
                        color: neutral[50],
                        height: '100%',
                        position: 'relative',
                        width: '100%'
                    })
                }}
            >
                <GlobalModal />
                <GlobalAlert />
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
        </ThemeProvider>
    )
}
