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
                root: ({ spacing }) => ({
                    display: 'flex',
                    padding: spacing(2, 0, 10, 0)
                })
            }}
        >
            {_secondaryChildren && (
                <Button variant="ghost" color="primary" {...secondaryAction}>
                    {_secondaryChildren}
                </Button>
            )}
            <Box csx={{ root: { flex: 1 } }} />
            {_primaryChildren && (
                <Button color="primary" {...primaryAction}>
                    {_primaryChildren}
                </Button>
            )}
        </Box>
    )
}
