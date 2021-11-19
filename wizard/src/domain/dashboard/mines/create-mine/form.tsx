import { Select } from '@intermine/chromatin/select'
import { Box } from '@intermine/chromatin/box'
import { createStyle } from '@intermine/chromatin/styles'
import { Label } from '@intermine/chromatin/label'
import {
    Typography,
    TypographyBaseProps
} from '@intermine/chromatin/typography'

const dummySelectOptions = [
    { label: 'HumanMine', value: 'template-1' },
    { label: 'CovidMine', value: 'template-2' },
    { label: 'FlyMine', value: 'template-3' },
    { label: 'RatMine', value: 'template-4' }
]

const useStyles = createStyle((theme) => {
    const { spacing } = theme

    return {
        form: {
            alignItems: 'center',
            display: 'flex',
            justifyContent: 'center',
            padding: spacing(0, 12),
            width: '100%'
        },
        formWrapper: {
            maxWidth: '120rem',
            width: '100%'
        },
        formGroupContainer: {
            margin: spacing(6, 0)
        },
        formGroup: {
            display: 'block',
            margin: spacing(0, 0, 8, 0),
            maxWidth: '35rem',
            width: '100%'
        }
    }
})

const FormTypography = (props: TypographyBaseProps) => {
    return <Typography csx={{ root: { fontWeight: 100 } }} {...props} />
}

export const Form = () => {
    const classes = useStyles()

    return (
        <form id="create-mine-form" className={classes.form}>
            <Box className={classes.formWrapper}>
                <FormTypography variant="h1">Create a Mine</FormTypography>
                <Box className={classes.formGroupContainer}>
                    <Label className={classes.formGroup}>
                        <FormTypography variant="h3">
                            Select a template
                        </FormTypography>
                        <FormTypography variant="body" color="neutral.20">
                            Make sure you have already uploaded the template.
                            There are also some of the pre-existing templates.
                        </FormTypography>
                        <Select options={dummySelectOptions} />
                    </Label>
                    <Label className={classes.formGroup}>
                        <FormTypography variant="h3">
                            Select dataset(s)
                        </FormTypography>
                        <FormTypography variant="body" color="neutral.20">
                            Make sure you have already uploaded the dataset. You
                            can select multiple dataset.
                        </FormTypography>
                        <Select options={dummySelectOptions} isMulti />
                    </Label>
                </Box>
            </Box>
        </form>
    )
}
