import { createTheme } from '@intermine/chromatin/styles'

export const lightTheme = createTheme({ themeType: 'light' })
export const darkTheme = createTheme({ themeType: 'dark' })

export enum DomElementIDs {
    Navbar = 'navbar',
    WorkspaceContainer = 'workspace-container',
    WorkspacePageContainer = 'workspace-page-container',
    WorkspaceHeadingContainer = 'workspace-heading-container',
    WorkspaceTableContainer = 'workspace-table-container',
    WorkspacePageListContainer = 'workspace-page-list-container',
    LoginForm = 'login-form',
    RegisterForm = 'register-form',
    ForgotPasswordForm = 'forgot-password-form',
}

export enum OtherIDs {
    UnauthorizeAlert = 'UnauthorizeAlert',
    URLReferer = 'next',
}

export enum AuthStates {
    Authorize = 'Authorize',
    NotAuthorize = 'NotAuthorize',
}

export enum AdditionalSidebarTabs {
    ProgressTab = 'ProgressTab',
    PreferencesTab = 'PreferencesTab',
    EditProfileTab = 'EditProfileTab',
    None = 'None',
}

export enum ProgressItemStatus {
    Running = 'Running',
    Canceled = 'Canceled',
    Completed = 'Completed',
    Failed = 'Failed',
}

export enum ResponseStatus {
    Ok,
    UserOffline,
    ServerUnavailable,
    UnknownError,
    Failed,
}
