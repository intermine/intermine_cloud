import { Card } from '@intermine/chromatin/card'
import { createStyle } from '@intermine/chromatin/styles'
import React, { useEffect, useRef } from 'react'

export type TFormProps = React.FormHTMLAttributes<HTMLFormElement> & {
    id: string
}

const useStyles = createStyle((theme) => {
    const {
        spacing,
        breakingPoints: { mixin }
    } = theme
    return {
        form: {
            display: 'flex',
            maxWidth: '30rem',
            minWidth: 0,
            overflow: 'auto',
            padding: spacing(1),
            width: '100%',
            ...mixin(
                {
                    sm: {
                        minHeight: '100%',
                        padding: 0
                    }
                },
                'max'
            )
        },

        card: {
            flex: '1',
            '&&': {
                ...mixin({ sm: { borderRadius: 0 } }, 'max')
            }
        }
    }
})

export const Form = (props: TFormProps) => {
    const { children, id, ...rest } = props
    const classes = useStyles()
    const formRef = useRef<HTMLFormElement>(null)

    useEffect(() => {
        if (formRef.current) {
            formRef.current.scrollIntoView()
        }
    }, [])

    return (
        <form ref={formRef} id={id} className={classes.form} {...rest}>
            <Card hoverVariant="none" className={classes.card}>
                {children}
            </Card>
        </form>
    )
}
