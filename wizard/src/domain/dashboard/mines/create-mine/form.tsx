import { Box } from '@intermine/chromatin/box'
import { createStyle } from '@intermine/chromatin/styles'
import { Label } from '@intermine/chromatin/label'
import { Input, InputProps } from '@intermine/chromatin/input'
import {
    Typography,
    TypographyBaseProps
} from '@intermine/chromatin/typography'
import { FormSelect } from '../../../../components/form/form-select'
import { Button } from '@intermine/chromatin'
import clsx from 'clsx'

const dummyTemplateOptions = [
    { label: 'HumanMine', value: 'template-1' },
    { label: 'CovidMine', value: 'template-2' },
    { label: 'FlyMine', value: 'template-3' },
    { label: 'RatMine', value: 'template-4' }
]

const dummyDatasetsOptions = [
    { label: 'Dataset 1', value: 'template-1' },
    { label: 'Dataset 2', value: 'template-2' },
    { label: 'Dataset 3', value: 'template-3' },
    { label: 'Dataset 4', value: 'template-4' },
    { label: 'Dataset 5', value: 'template-5' },
    { label: 'Dataset 6', value: 'template-6' },
    { label: 'Dataset 7', value: 'template-7' },
    { label: 'Dataset 8', value: 'template-8' },
    { label: 'Dataset 9', value: 'template-9' },
    { label: 'Dataset 10', value: 'template-10' }
]

const useStyles = createStyle((theme) => {
    const {
        spacing,
        palette: { neutral, grey, themeType }
    } = theme

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
        },
        subdomainInput: {
            '&&': {
                borderRadius: '0.25rem 0 0 0.25rem',
                textAlign: 'right'
            }
        },
        intermineBox: {
            flex: 1,
            background: themeType === 'dark' ? neutral[10] : grey[20],
            borderRadius: '0 0.25rem 0.25rem 0',
            padding: spacing(1, 2, 1, 1)
        },
        actionContainer: {
            display: 'flex',
            justifyContent: 'flex-end',
            paddingTop: spacing(20)
        }
    }
})

const FormTypography = (props: TypographyBaseProps) => {
    return <Typography csx={{ root: { fontWeight: 100 } }} {...props} />
}

const FormInput = (props: InputProps) => {
    return (
        <Input
            hasFullWidth
            hasTransparentBackground
            csx={{
                inputRoot: {
                    ':hover': { background: 'transparent' }
                }
            }}
            {...props}
        />
    )
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
                        <FormSelect options={dummyTemplateOptions} />
                    </Label>
                    <Label className={classes.formGroup}>
                        <FormTypography variant="h3">
                            Select dataset(s)
                        </FormTypography>
                        <FormTypography variant="body" color="neutral.20">
                            Make sure you have already uploaded the dataset. You
                            can select multiple dataset.
                        </FormTypography>
                        <FormSelect
                            closeMenuOnSelect={false}
                            options={dummyDatasetsOptions}
                            isMulti
                        />
                    </Label>
                    <Label className={classes.formGroup}>
                        <FormTypography variant="h3">
                            Name your new Mine
                        </FormTypography>
                        <FormTypography variant="body" color="neutral.20">
                            This will be the name under which your mine is
                            publicly available. Some examples are HumanMine,
                            FlyMine, CovidMine, etc.
                        </FormTypography>
                        <FormInput placeholder="Enter mine name" />
                    </Label>
                    <Label className={classes.formGroup}>
                        <FormTypography variant="h3">
                            Description of your Mine
                        </FormTypography>
                        <FormTypography variant="body" color="neutral.20">
                            This will help other users to get an idea about your
                            mine. You can write something like: An integrated
                            data warehouse for...
                        </FormTypography>
                        <FormInput
                            rows={5}
                            Component="textarea"
                            placeholder="Description of your mine"
                        />
                    </Label>
                    <Label className={classes.formGroup}>
                        <FormTypography variant="h3">Sub Domain</FormTypography>
                        <FormTypography variant="body" color="neutral.20">
                            We will host your newly built mine under this
                            sub-domain. Please don't include any special
                            character.
                        </FormTypography>
                        <Box display="flex">
                            <FormInput
                                classes={{ inputRoot: classes.subdomainInput }}
                                placeholder="my-first-intermine-database"
                            />
                            <Box
                                isContentCenter
                                className={classes.intermineBox}
                            >
                                .intermine.org
                            </Box>
                        </Box>
                    </Label>
                    <Box
                        className={clsx(
                            classes.actionContainer,
                            classes.formGroup
                        )}
                    >
                        <Button
                            color="warning"
                            csx={{
                                root: ({ spacing }) => ({
                                    marginRight: spacing(10)
                                })
                            }}
                        >
                            Reset
                        </Button>
                        <Button color="primary">Create Mine</Button>
                    </Box>
                </Box>
            </Box>
        </form>
    )
}
