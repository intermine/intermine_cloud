import { render } from '@testing-library/react'
import { BrowserRouter as Router } from 'react-router-dom'

import { App } from './app'
import { AppContextProvider } from './context/app-context-provider'

const Wrapper = ({ children }) => {
    return (
        <AppContextProvider>
            <Router>{children}</Router>
        </AppContextProvider>
    )
}

describe('Testing App', () => {
    test('Should mount properly', () => {
        render(
            <Wrapper>
                <App />
            </Wrapper>
        )
    })
})
