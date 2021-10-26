import { Spinner } from '@intermine/chromatin/loading'
import { Box } from '@intermine/chromatin/box'

export const RouteLoadingSpinner = () => {
    return (
        <Box
            isContentCenter
            csx={{
                root: ({
                    palette: {
                        themeBackground: { light, dark },
                        themeType
                    }
                }) => ({
                    background: themeType === 'dark' ? dark.hex : light.hex,
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
