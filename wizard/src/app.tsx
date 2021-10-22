import { ThemeProvider, createTheme } from '@intermine/chromatin/styles'
import { Box } from '@intermine/chromatin/box'

const theme = createTheme()

export const App = () => {
    return (
        <ThemeProvider theme={theme}>
            <Box>Intermine Cloud - Wizard</Box>
        </ThemeProvider>
    )
}
