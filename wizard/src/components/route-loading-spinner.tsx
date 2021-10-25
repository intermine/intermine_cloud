import { Spinner } from '@intermine/chromatin/loading'
import { Box } from '@intermine/chromatin/box'

export const RouteLoadingSpinner = () => {
    return (
        <Box
            isContentCenter
            csx={{
                root: ({
                    palette: { recommendedThemeBackground: rtb, themeType }
                }) => ({
                    background: themeType === 'dark' ? rtb.dark : rtb.light,
                    bottom: 0,
                    left: 0,
                    position: 'absolute',
                    right: 0,
                    top: 0
                })
            }}
        >
            <Spinner
                csx={{ root: { display: 'block' } }}
                size={100}
                dotSize={5}
                color="info"
            />
        </Box>
    )
}
