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
import {
    RestrictLogoutRestrictions,
    useDashboardWarningModal,
    useDashboardLogout
} from '../../hooks'
import { updateSidebarState, useStoreDispatch } from '../../../../store'
import { handleOnBeforeUnload } from '../../utils/misc'

export type TDashboardFormProps = React.FormHTMLAttributes<HTMLFormElement> & {
    isDirty: boolean
}

const _handleOnBeforeUnload = (event: Event) => {
    handleOnBeforeUnload(event)
}

export const DashboardForm = (props: TDashboardFormProps) => {
    const { isDirty, ...rest } = props

    const storeDispatch = useStoreDispatch()

    const { showWarningModal } = useDashboardWarningModal()
    const {
        removeAdditionalSidebarLogoutWithModalRestriction,
        restrictAdditionalSidebarLogoutWithModal
    } = useDashboardLogout()

    useEffect(() => {
        if (isDirty) {
            storeDispatch(
                updateSidebarState({
                    isPageSwitchingAllowed: false,
                    onSidebarItemClick: (to) =>
                        showWarningModal({ redirectTo: to })
                })
            )
            window.addEventListener('beforeunload', _handleOnBeforeUnload)
            restrictAdditionalSidebarLogoutWithModal({
                type: RestrictLogoutRestrictions.FormIsDirty
            })
        }

        return () => {
            storeDispatch(
                updateSidebarState({
                    isPageSwitchingAllowed: true,
                    onSidebarItemClick: () => false
                })
            )

            removeAdditionalSidebarLogoutWithModalRestriction({
                type: RestrictLogoutRestrictions.FormIsDirty
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
            showWarningModal({ redirectTo: landingPageUrl })
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
