import { useContext } from 'react'
import { useHistory } from 'react-router'
import { Box } from '@intermine/chromatin/box'
import { Tooltip } from '@intermine/chromatin/tooltip'
import { IconButton } from '@intermine/chromatin/icon-button'
import ProgressIcon from '@intermine/chromatin/icons/System/refresh-line'
import PreferencesIcon from '@intermine/chromatin/icons/Design/tools-line'
import EditProfileIcon from '@intermine/chromatin/icons/user/user-settings-line'
import LogoutIcon from '@intermine/chromatin/icons/Device/shut-down-line'
import { createStyle } from '@intermine/chromatin/styles'

import { AppContext } from '../../../context'
import { LOGIN_PATH } from '../../../routes'
import { AdditionalSidebarTabs } from '../../../constants/additional-sidebar'
import { AuthStates } from '../../../constants/auth'

import { Progress } from './progress'
import { EditProfile } from './edit-profile'
import { Preferences } from './preferences'

type TUseStyleProps = {
    isOpen: boolean
}

const { EditProfileTab, PreferencesTab, ProgressTab, None } =
    AdditionalSidebarTabs

const actions = [
    {
        id: 'progress',
        Icon: <ProgressIcon />,
        activeTab: ProgressTab,
        tooltip: 'Progress'
    },
    {
        id: 'preferences',
        Icon: <PreferencesIcon />,
        activeTab: PreferencesTab,
        tooltip: 'Preferences'
    },
    {
        id: 'edit-profile',
        Icon: <EditProfileIcon />,
        activeTab: EditProfileTab,
        tooltip: 'Edit Profile'
    }
]

const useStyles = createStyle((theme) => {
    const { spacing } = theme
    return {
        root: {
            display: 'flex',
            flexWrap: 'nowrap',
            height: '100%',
            overflow: 'hidden'
        },

        actionContainer: {
            alignItems: 'center',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            width: '3rem'
        },

        button: {
            margin: spacing(1, 0)
        },

        actionSection: (props: TUseStyleProps) => ({
            flex: '1',
            width: props.isOpen ? 'auto' : 0,
            opacity: props.isOpen ? 1 : 0,
            transition: '0.23s'
        })
    }
})

export const AdditionalSidebar = () => {
    const history = useHistory()

    const store = useContext(AppContext)

    const {
        additionalSidebarReducer: {
            updateState,
            state: { isOpen, activeTab }
        },
        authReducer: { updateAuthState }
    } = store

    const classes = useStyles({
        isOpen
    })

    const getComponent = (): JSX.Element => {
        switch (activeTab) {
            case PreferencesTab:
                return <Preferences />

            case EditProfileTab:
                return <EditProfile />

            case ProgressTab:
                return <Progress />

            default:
                return <></>
        }
    }

    const onClickActionIcon = (activeTab: AdditionalSidebarTabs) => {
        updateState({
            isOpen: true,
            activeTab
        })
    }

    const handleLogout = () => {
        updateAuthState(AuthStates.NotAuthorize)
        updateState({
            isOpen: false,
            activeTab: None
        })
        history.push(LOGIN_PATH)
    }

    return (
        <Box className={classes.root}>
            <Box className={classes.actionContainer}>
                {actions.map(({ tooltip, Icon, activeTab, id }) => (
                    <Tooltip message={tooltip} placement="left" key={id}>
                        <IconButton
                            className={classes.button}
                            onClick={() => onClickActionIcon(activeTab)}
                            Icon={Icon}
                        />
                    </Tooltip>
                ))}
                <Tooltip message="Logout" placement="left">
                    <IconButton
                        className={classes.button}
                        Icon={<LogoutIcon />}
                        onClick={handleLogout}
                    />
                </Tooltip>
            </Box>
            <Box className={classes.actionSection}>{getComponent()}</Box>
        </Box>
    )
}
