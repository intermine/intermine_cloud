import { StrictMode } from 'react'
import ReactDom from 'react-dom'
import { BrowserRouter as Router } from 'react-router-dom'

import { App } from './app'
import { AppContextProvider } from './context/app-context-provider'

ReactDom.render(
    <StrictMode>
        <AppContextProvider>
            <Router>
                <App />
            </Router>
        </AppContextProvider>
    </StrictMode>,
    document.querySelector('#root')
)
