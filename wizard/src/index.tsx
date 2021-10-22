import { StrictMode } from 'react'
import ReactDom from 'react-dom'
import { Router } from 'react-router-dom'

import { App } from './app'
import { history } from './utils/history'

ReactDom.render(
    <StrictMode>
        <Router history={history}>
            <App />
        </Router>
    </StrictMode>,
    document.querySelector('#root')
)
