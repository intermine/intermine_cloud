import clsx from 'clsx'
import { createStyle } from '@intermine/chromatin/styles'

import { FormSelect } from './select'
import {
    FormInput,
    FormActions,
    FormHeading,
    FormLabel,
    FormWrapper
} from './components'
import { Upload } from './upload'
import { UploadBox } from './upload-box'
import { UploadFileInfo } from './upload-file-info'

export type TDashboardFormProps = React.FormHTMLAttributes<HTMLFormElement>

const useStyles = createStyle((theme) => {
    const { spacing } = theme

    return {
        form: {
            alignItems: 'center',
            display: 'flex',
            justifyContent: 'center',
            padding: spacing(0, 12),
            width: '100%'
        }
    }
})

export const DashboardForm = (props: TDashboardFormProps) => {
    const classes = useStyles()
    const { className, ...rest } = props
    return <form className={clsx(classes.form, className)} {...rest} />
}

DashboardForm.Wrapper = FormWrapper
DashboardForm.Label = FormLabel
DashboardForm.Select = FormSelect
DashboardForm.Input = FormInput
DashboardForm.Actions = FormActions
DashboardForm.Heading = FormHeading
DashboardForm.Upload = Upload
DashboardForm.UploadBox = UploadBox
DashboardForm.UploadFileInfo = UploadFileInfo
