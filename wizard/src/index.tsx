import { StrictMode } from 'react'
import ReactDom from 'react-dom'
import { Router } from 'react-router-dom'

import { App } from './app'
import { history } from './utils/history'
import { AppContextProvider } from './context/app-context-provider'

ReactDom.render(
    <StrictMode>
        <AppContextProvider>
            <Router history={history}>
                <App />
            </Router>
        </AppContextProvider>
    </StrictMode>,
    document.querySelector('#root')
)
