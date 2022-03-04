import { StrictMode } from 'react'
import ReactDom from 'react-dom'
import { BrowserRouter as Router } from 'react-router-dom'
import { Provider } from 'react-redux'

import { App } from './app'
import { AppContextProvider } from './context/app-context-provider'
import { store } from './store'

ReactDom.render(
    <StrictMode>
        <AppContextProvider>
            <Provider store={store}>
                <Router>
                    <App />
                </Router>
            </Provider>
        </AppContextProvider>
    </StrictMode>,
    document.querySelector('#root')
)
