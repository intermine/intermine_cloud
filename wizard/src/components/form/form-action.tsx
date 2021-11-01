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
                    padding: spacing(10, 12, 10, 10),
                    ...mixin(
                        {
                            sm: {
                                flexDirection: 'column-reverse',
                                padding: spacing(4)
                            }
                        },
                        'max'
                    )
                })
            }}
        >
            {_secondaryChildren && (
                <Button
                    variant="ghost"
                    color="primary"
                    csx={{ root: ({ spacing }) => ({ padding: spacing(2) }) }}
                    {...secondaryAction}
                >
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
