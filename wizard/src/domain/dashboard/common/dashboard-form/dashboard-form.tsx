import { useContext, useEffect } from 'react'
import { useHistory } from 'react-router'
import { FormSelect } from './select'
import {
    FormInput,
    FormActions,
    FormHeading,
    FormLabel,
    FormWrapper,
    FormInlineAlert
} from './components'
import { UploadBox } from './upload-box'
import { UploadFileInfo } from './upload-file-info'
import { WorkspaceHeading } from '../workspace-heading'
import { DashboardFormContext } from './dashboard-form-context'
import { useDashboardWarningModal } from '../../utils/hooks'
import { useSidebarReducer } from '../../../../context'
import { handleOnBeforeUnload } from '../../utils/misc'

export type TDashboardFormProps = React.FormHTMLAttributes<HTMLFormElement> & {
    isDirty: boolean
}

const _handleOnBeforeUnload = (event: Event) => {
    handleOnBeforeUnload(event)
}

export const DashboardForm = (props: TDashboardFormProps) => {
    const { isDirty, ...rest } = props

    const { updateSidebarState } = useSidebarReducer()
    const { showWarningModal } = useDashboardWarningModal()

    useEffect(() => {
        if (isDirty) {
            updateSidebarState({
                isPageSwitchingAllowed: false,
                onSidebarItemClick: (to) => showWarningModal({ to })
            })
            window.addEventListener('beforeunload', _handleOnBeforeUnload)
        }

        return () => {
            updateSidebarState({
                isPageSwitchingAllowed: true,
                onSidebarItemClick: () => false
            })

            window.removeEventListener('beforeunload', _handleOnBeforeUnload)
        }
    }, [isDirty])
    return (
        <DashboardFormContext.Provider value={{ isDirty }}>
            <form {...rest} />
        </DashboardFormContext.Provider>
    )
}

type TFormPageHeading = {
    landingPageUrl: string
    pageHeading: string
}

export const FormPageHeading = (props: TFormPageHeading) => {
    const { landingPageUrl, pageHeading } = props
    const history = useHistory()
    const { isDirty } = useContext(DashboardFormContext)
    const { showWarningModal } = useDashboardWarningModal()

    const handleOnClickBack = () => {
        if (isDirty) {
            showWarningModal({ to: landingPageUrl })
        } else {
            history.push(landingPageUrl)
        }
    }

    return (
        <WorkspaceHeading
            heading={{ variant: 'h2', children: pageHeading }}
            backAction={{ onClick: handleOnClickBack }}
        />
    )
}

DashboardForm.PageHeading = FormPageHeading
DashboardForm.Wrapper = FormWrapper
DashboardForm.Label = FormLabel
DashboardForm.Select = FormSelect
DashboardForm.Input = FormInput
DashboardForm.Actions = FormActions
DashboardForm.Heading = FormHeading
DashboardForm.UploadBox = UploadBox
DashboardForm.UploadFileInfo = UploadFileInfo
DashboardForm.InlineAlert = FormInlineAlert
