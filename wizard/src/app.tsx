import { useContext, lazy, Suspense } from 'react'
import { ThemeProvider } from '@intermine/chromatin/styles'
import { Box } from '@intermine/chromatin/box'
import { createStyle } from '@intermine/chromatin/styles'

import { AuthStates } from './constants/auth'
import { AppContext } from './context'
import { RouteLoadingSpinner } from './components/route-loading-spinner'
import { darkTheme, lightTheme } from './constants/theme'
import { Navbar } from './components/navbar'

const Dashboard = lazy(() => import('./domain/dashboard'))
const PreAuth = lazy(() => import('./domain/pre-auth'))

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
            /**
             * It may be risky to set overflow hidden on body.
             * Doing so to avoid unintentional overflow.
             */
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

export const App = () => {
    const store = useContext(AppContext)
    const {
        authReducer: { state: auth },
        preferencesReducer: {
            state: { themeType }
        }
    } = store

    /**
     * Activate global styles
     */
    useStyles()

    return (
        <ThemeProvider theme={themeType === 'dark' ? darkTheme : lightTheme}>
            <Box
                csx={{
                    root: ({
                        palette: {
                            themeType,
                            themeBackground: { light, dark },
                            neutral
                        }
                    }) => ({
                        background: themeType === 'dark' ? dark.hex : light.hex,
                        color: neutral[90],
                        height: '100%',
                        width: '100%',
                        position: 'relative'
                    })
                }}
            >
                <Navbar />
                <Suspense fallback={<RouteLoadingSpinner />}>
                    {auth.authState === AuthStates.Authorize && <Dashboard />}
                    {auth.authState === AuthStates.NotAuthorize && <PreAuth />}
                </Suspense>
            </Box>
        </ThemeProvider>
    )
}
