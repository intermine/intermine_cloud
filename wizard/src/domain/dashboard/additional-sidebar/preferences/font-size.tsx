import { Typography } from '@intermine/chromatin/typography'
import { Box } from '@intermine/chromatin/box'
import { IconButton } from '@intermine/chromatin/icon-button'
import FontSizeIcon from '@intermine/chromatin/icons/Editor/font-size-2'
import IncreaseIcon from '@intermine/chromatin/icons/System/add-fill'
import DecreaseIcon from '@intermine/chromatin/icons/System/subtract-fill'

import { ActionSection } from '../action-section'

export type TThemeToggle = {
    fontSize: number
    onFontSizeUpdate: (fontSize: number) => void
}

export const FontSize = (props: TThemeToggle) => {
    const { fontSize, onFontSizeUpdate } = props

    const onIncrement = () => {
        if (fontSize < 30) {
            onFontSizeUpdate(fontSize + 1)
        }
    }

    const onDecrement = () => {
        if (fontSize > 10) {
            onFontSizeUpdate(fontSize - 1)
        }
    }

    return (
        <Box
            isContentCenter
            csx={{
                root: ({ spacing }) => ({
                    justifyContent: 'space-between',
                    marginTop: spacing(4)
                })
            }}
        >
            <ActionSection.Label labelText="Font Size" Icon={FontSizeIcon} />
            <Box isContentCenter>
                <IconButton
                    isDense
                    color="neutral"
                    Icon={<DecreaseIcon />}
                    onClick={onDecrement}
                    isDisabled={fontSize < 11}
                    hasHighlightOnFocus={false}
                    hasHoverEffectOnFocus
                />
                <Typography variant="title">{fontSize}px</Typography>
                <IconButton
                    isDense
                    color="neutral"
                    hasHoverEffectOnFocus
                    Icon={<IncreaseIcon />}
                    onClick={onIncrement}
                    isDisabled={fontSize > 29}
                    hasHighlightOnFocus={false}
                />
            </Box>
        </Box>
    )
}
