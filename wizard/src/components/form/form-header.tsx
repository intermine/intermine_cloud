import { CardHeader } from '@intermine/chromatin/card-header'

export type TFormHeader = {
    heading?: string
    logo?: JSX.Element
}

export const FormHeader = (props: TFormHeader) => {
    const { heading, logo = <></> } = props

    return (
        <CardHeader
            csx={{
                root: ({ spacing, breakingPoints: { mixin } }) => ({
                    alignItems: 'center',
                    flexDirection: 'column',
                    fontSize: '1.25rem',
                    padding: spacing(10),
                    ...mixin(
                        {
                            sm: {
                                alignItems: 'flex-start',
                                padding: spacing(10, 0, 5, 5)
                            }
                        },
                        'max'
                    )
                })
            }}
        >
            {logo}
            {heading}
        </CardHeader>
    )
}
