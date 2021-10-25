import { render } from '@testing-library/react'

import { App } from './app'
import { AppContextProvider } from './context/app-context-provider'

const Wrapper = ({ children }) => {
    return <AppContextProvider>{children}</AppContextProvider>
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
