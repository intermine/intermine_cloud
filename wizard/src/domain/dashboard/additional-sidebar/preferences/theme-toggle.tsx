import { FormControlLabel } from '@intermine/chromatin/form-control-label'
import { Toggle } from '@intermine/chromatin/toggle'
import DarkThemeIcon from '@intermine/chromatin/icons/Weather/moon-fill'

import { ActionSection } from '../action-section'

export type TThemeToggle = {
    themeType: 'dark' | 'light'
    onThemeToggle: () => void
}

export const ThemeToggle = (props: TThemeToggle) => {
    const { themeType, onThemeToggle } = props

    return (
        <FormControlLabel
            label={
                <ActionSection.Label
                    labelText="Dark Theme"
                    Icon={DarkThemeIcon}
                />
            }
            control={
                <Toggle
                    isDense
                    isChecked={themeType === 'dark'}
                    onChange={onThemeToggle}
                />
            }
            labelPlacement="left"
            spaceBetween="all"
        />
    )
}
