import { Select, SelectProps } from '@intermine/chromatin'
import { useTheme } from '@intermine/chromatin/styles'

export interface GroupBase<Option> {
    readonly options: readonly Option[]
    readonly label?: string
}

export const FormSelect = <
    Option,
    IsMulti extends boolean,
    Group extends GroupBase<Option>
>(
    props: SelectProps<Option, IsMulti, Group> & { isError?: boolean }
) => {
    const { csx = {}, isError = false, ...rest } = props
    const theme = useTheme()

    const {
        themeType,
        palette: {
            neutral,
            darkGrey,
            error,
            grey,
            common: { white }
        },
        elevation
    } = theme

    return (
        <Select
            color="neutral"
            csx={{
                control: {
                    ...(isError && {
                        borderColor: error.main,
                        boxShadow: 'none !important',
                        ':hover': {
                            borderColor: error.main
                        },
                        ':focus': {
                            borderColor: error.main
                        }
                    })
                },

                multiValue: {
                    background:
                        themeType === 'dark' ? darkGrey[50] : neutral[10]
                },

                multiValueRemove: {
                    ':hover': {
                        color: error.text,
                        background: error.main
                    }
                },
                option: {
                    borderRadius: '0.25rem',
                    padding: '0.6rem'
                },
                menu: {
                    background: themeType === 'dark' ? darkGrey[40] : white,
                    borderRadius: '0.4rem',
                    boxShadow: elevation.medium,
                    border:
                        '1px solid ' +
                        (themeType === 'dark' ? darkGrey[50] : grey[30]),
                    overflow: 'hidden',
                    padding: '0rem'
                },
                menuList: {
                    padding: '0.5rem'
                },
                ...csx
            }}
            {...rest}
        />
    )
}
