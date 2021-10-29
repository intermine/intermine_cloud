import { Box } from '@intermine/chromatin/box'
import { Button, ButtonCommonProps } from '@intermine/chromatin/button'

export type TFormActionProps = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    primaryAction?: ButtonCommonProps & { to?: string; Component?: any }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    secondaryAction?: ButtonCommonProps & { to?: string; Component?: any }
}

export const FormAction = (props: TFormActionProps) => {
    const { primaryAction = {}, secondaryAction = {} } = props
    const { children: _primaryChildren } = primaryAction
    const { children: _secondaryChildren } = secondaryAction

    return (
        <Box
            csx={{
                root: ({ spacing, breakingPoints: { mixin } }) => ({
                    display: 'flex',
                    padding: spacing(2, 0, 10, 0),
                    ...mixin({ sm: { flexDirection: 'column-reverse' } }, 'max')
                })
            }}
        >
            {_secondaryChildren && (
                <Button variant="ghost" color="primary" {...secondaryAction}>
                    {_secondaryChildren}
                </Button>
            )}
            <Box
                csx={{
                    root: ({ spacing }) => ({ flex: 1, margin: spacing(2) })
                }}
            />
            {_primaryChildren && (
                <Button color="primary" {...primaryAction}>
                    {_primaryChildren}
                </Button>
            )}
        </Box>
    )
}
