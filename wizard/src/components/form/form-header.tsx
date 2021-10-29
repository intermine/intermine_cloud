import { CardHeader } from '@intermine/chromatin/card-header'

export type TFormHeader = {
    heading: string
}

export const FormHeader = (props: TFormHeader) => {
    const { heading } = props

    return (
        <CardHeader
            csx={{
                root: ({ spacing, breakingPoints: { mixin } }) => ({
                    fontSize: '1.5rem',
                    justifyContent: 'center',
                    padding: spacing(10),
                    ...mixin(
                        {
                            sm: {
                                justifyContent: 'flex-start',
                                padding: spacing(10, 0, 5, 5)
                            }
                        },
                        'max'
                    )
                })
            }}
        >
            {heading}
        </CardHeader>
    )
}
