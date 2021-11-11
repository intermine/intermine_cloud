import { Component } from 'react'
import { Box } from '@intermine/chromatin/box'

type TState = {
    hasError: boolean
}

type TProps = {
    children?: React.ReactChild | React.ReactChild[]
}

export class DashboardErrorBoundary extends Component<TProps, TState> {
    constructor(props: TProps) {
        super(props)
        this.state = { hasError: false }
    }

    static getDerivedStateFromError() {
        return { hasError: true }
    }

    render() {
        if (this.state.hasError) {
            return (
                <Box
                    isContentCenter
                    csx={{ root: { height: '100%', padding: '2rem' } }}
                >
                    Something Went Wrong! Try to refresh this page.
                </Box>
            )
        }
        return this.props.children
    }
}
