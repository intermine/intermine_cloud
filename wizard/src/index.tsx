import { StrictMode } from 'react'
import ReactDom from 'react-dom'
import { BrowserRouter as Router } from 'react-router-dom'
import { Provider } from 'react-redux'

import { App } from './app'
import { store } from './store'

ReactDom.render(
    <StrictMode>
        <Provider store={store}>
            <Router>
                <App />
            </Router>
        </Provider>
    </StrictMode>,
    document.querySelector('#root')
)
