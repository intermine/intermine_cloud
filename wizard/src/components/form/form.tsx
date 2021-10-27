import { Card } from '@intermine/chromatin/card'
import { createStyle } from '@intermine/chromatin/styles'
export type TFormProps = {
    children: React.ReactChild | React.ReactChild[]
    id: string
}

const useStyles = createStyle((theme) => {
    const { spacing } = theme
    return {
        form: {
            height: '100%',
            maxHeight: '35rem',
            maxWidth: '30rem',
            overflow: 'auto',
            padding: spacing(1),
            width: '100%'
        },

        card: {
            height: '100%',
            padding: spacing(0, 5)
        }
    }
})

export const Form = (props: TFormProps) => {
    const { children, id } = props
    const classes = useStyles()

    return (
        <form id={id} className={classes.form}>
            <Card hoverVariant="none" className={classes.card}>
                {children}
            </Card>
        </form>
    )
}
