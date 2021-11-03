import { Spinner } from '@intermine/chromatin/loading'
import { Box } from '@intermine/chromatin/box'

export type TRouteLoadingSpinner = {
    /**
     * @default 'true'
     */
    hasBackground?: boolean
}

export const RouteLoadingSpinner = (props: TRouteLoadingSpinner) => {
    const { hasBackground = true } = props

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
                    ...(hasBackground && {
                        background: themeType === 'dark' ? dark.hex : light.hex
                    }),
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
                dotSize={10}
                color="info"
            />
        </Box>
    )
}
