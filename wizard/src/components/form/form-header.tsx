import { CardHeader } from '@intermine/chromatin/card-header'

export type TFormHeader = {
    heading: string
}

export const FormHeader = (props: TFormHeader) => {
    const { heading } = props

    return (
        <CardHeader
            csx={{
                root: ({ spacing }) => ({
                    fontSize: '1.5rem',
                    justifyContent: 'center',
                    padding: spacing(10)
                })
            }}
        >
            {heading}
        </CardHeader>
    )
}
