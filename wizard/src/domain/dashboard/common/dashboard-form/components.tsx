import { Children, cloneElement } from 'react'
import clsx from 'clsx'
import { Button, ButtonCommonProps } from '@intermine/chromatin/button'
import { Box, BoxBaseProps } from '@intermine/chromatin/box'
import { Label, LabelProps } from '@intermine/chromatin/label'
import {
    Typography,
    TypographyBaseProps
} from '@intermine/chromatin/typography'
import { Input, InputProps } from '@intermine/chromatin/input'
import { createStyle } from '@intermine/chromatin/styles'

export type TDashboardFormProps = React.FormHTMLAttributes<HTMLFormElement>

const useStyles = createStyle((theme) => {
    const { spacing } = theme

    return {
        formWrapper: {
            maxWidth: '120rem',
            width: '100%'
        },
        formHeading: {
            marginBottom: spacing(6)
        },
        formLabel: {
            display: 'block',
            margin: spacing(0, 0, 8, 0),
            maxWidth: '35rem',
            width: '100%'
        },
        actionContainer: {
            display: 'flex',
            justifyContent: 'flex-end',
            paddingTop: spacing(20)
        },
        actionButton: {
            marginRight: spacing(10),
            '&:last-child': {
                marginRight: 0
            }
        }
    }
})

export const FormWrapper = (props: BoxBaseProps) => {
    const { className, ...rest } = props
    const classes = useStyles()
    return <Box className={clsx(className, classes.formWrapper)} {...rest} />
}

type TFormLabelProps = LabelProps & {
    isError?: boolean
    main?: string
    sub?: string
    errorMsg?: string
    hasAsterisk?: boolean
}

const FormTypography = (props: TypographyBaseProps) => {
    return <Typography csx={{ root: { fontWeight: 100 } }} {...props} />
}

export const FormHeading = (props: TypographyBaseProps) => {
    const { className, ...rest } = props
    const classes = useStyles()

    return (
        <FormTypography
            className={clsx(classes.formHeading, className)}
            variant="h1"
            {...rest}
        />
    )
}

export const FormLabel = (props: TFormLabelProps) => {
    const {
        children,
        className,
        main,
        sub,
        errorMsg,
        hasAsterisk,
        isError,
        ...rest
    } = props
    const classes = useStyles()

    return (
        <Label className={clsx(className, classes.formLabel)} {...rest}>
            {main && (
                <FormTypography
                    color={isError ? 'error' : 'undefined'}
                    variant="h3"
                >
                    {main}
                    {hasAsterisk && (
                        <Typography Component="span" variant="h3" color="error">
                            *
                        </Typography>
                    )}
                </FormTypography>
            )}
            {sub && (
                <FormTypography variant="body" color="neutral.20">
                    {sub}
                </FormTypography>
            )}
            {Children.map(children, (child: any) =>
                cloneElement(child, { ...child.props, isError })
            )}
            {isError && (
                <FormTypography color="error" variant="bodySm">
                    {errorMsg}
                </FormTypography>
            )}
        </Label>
    )
}

export const FormInput = (props: InputProps & { isError?: boolean }) => {
    const { ...rest } = props
    return (
        <Input
            hasFullWidth
            hasTransparentBackground
            csx={{
                inputRoot: {
                    ':hover': { background: 'transparent' }
                }
            }}
            color="neutral"
            {...rest}
        />
    )
}

type TFormActionsProps = {
    actions: (ButtonCommonProps & { key: string })[]
}

export const FormActions = (props: TFormActionsProps) => {
    const { actions } = props
    const classes = useStyles()
    return (
        <Box className={clsx(classes.actionContainer, classes.formLabel)}>
            {actions.map((action) => {
                return (
                    <Button
                        {...action}
                        className={clsx(classes.actionButton, action.className)}
                    />
                )
            })}
        </Box>
    )
}
