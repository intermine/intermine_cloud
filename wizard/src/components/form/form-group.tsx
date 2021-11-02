import { Box } from '@intermine/chromatin/box'
import { Input, InputProps } from '@intermine/chromatin/input'
import { Label } from '@intermine/chromatin/label'
import { Typography } from '@intermine/chromatin/typography'

export type TFormGroupProps = {
    children?: React.ReactChild | React.ReactChild[]
    label: string
    inputProps?: InputProps
    isError?: boolean
    isDisabled?: boolean
    errorMessage?: string
    hasAsterisk?: boolean
}

export const FormGroup = (props: TFormGroupProps) => {
    const {
        children,
        label,
        inputProps,
        isError = false,
        isDisabled = false,
        errorMessage,
        hasAsterisk = false
    } = props

    return (
        <Box
            csx={{
                root: ({ spacing }) => ({
                    alignItems: 'flex-start',
                    display: 'flex',
                    flexDirection: 'column',
                    marginBottom: spacing(5)
                })
            }}
        >
            <Label
                color={isError ? 'error' : undefined}
                disabled={isDisabled}
                csx={{
                    root: ({ typography: { title } }) => ({
                        display: 'block',
                        width: '100%',
                        ...title
                    })
                }}
            >
                {label}
                {hasAsterisk && (
                    <Typography color="error" Component="span">
                        *
                    </Typography>
                )}

                <Input
                    csx={{
                        root: ({ spacing }) => ({
                            marginTop: spacing(2)
                        }),
                        inputRoot: {
                            width: '100%',
                            minWidth: 0
                        }
                    }}
                    color="neutral.20"
                    hasFullWidth
                    isError={isError}
                    isDisabled={isDisabled}
                    {...inputProps}
                />
                {isError && (
                    <Typography
                        color="error"
                        variant="bodySm"
                        csx={{
                            root: ({ spacing }) => ({
                                margin: spacing(2, 0)
                            })
                        }}
                    >
                        {errorMessage}
                    </Typography>
                )}
            </Label>
            {children}
        </Box>
    )
}
