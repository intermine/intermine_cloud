import { render } from '@testing-library/react'

import { App } from './app'

describe('Testing App', () => {
    test('Should mount properly', () => {
        render(<App />)
    })
})