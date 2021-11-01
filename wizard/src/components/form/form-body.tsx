import { CardContent } from '@intermine/chromatin/card-content'

export type TFormBodyProps = {
    children: React.ReactChild | React.ReactChild[]
}

export const FormBody = (props: TFormBodyProps) => {
    const { children } = props
    return (
        <CardContent
            csx={{
                root: ({ breakingPoints: { mixin } }) => ({
                    ...mixin({ sm: { minHeight: '20rem' } }, 'min')
                })
            }}
        >
            {children}
        </CardContent>
    )
}
