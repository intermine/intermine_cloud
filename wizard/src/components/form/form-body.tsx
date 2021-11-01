import { CardContent } from '@intermine/chromatin/card-content'

export type TFormBodyProps = {
    children: React.ReactChild | React.ReactChild[]
}

export const FormBody = (props: TFormBodyProps) => {
    const { children } = props
    return (
        <CardContent
            csx={{
                root: ({ breakingPoints: { mixin }, spacing }) => ({
                    padding: spacing(10, 12),
                    ...mixin({ sm: { minHeight: '20rem' } }, 'min'),
                    ...mixin({ sm: { padding: spacing(5) } }, 'max')
                })
            }}
        >
            {children}
        </CardContent>
    )
}
