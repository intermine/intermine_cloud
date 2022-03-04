import { Box } from '@intermine/chromatin/box'
import { Tooltip } from '@intermine/chromatin/tooltip'
import { IconButton } from '@intermine/chromatin/icon-button'
import ProgressIcon from '@intermine/chromatin/icons/System/refresh-line'
import PreferencesIcon from '@intermine/chromatin/icons/Design/tools-line'
import EditProfileIcon from '@intermine/chromatin/icons/User/user-settings-line'
import { createStyle } from '@intermine/chromatin/styles'

import { AdditionalSidebarTabs } from '../../../shared/constants'
import {
    useStoreSelector,
    additionalSidebarSelector,
    useStoreDispatch,
    updateAdditionalSidebar,
    progressSelector
} from '../../../store'
import { Progress } from './progress'
import { EditProfile } from './edit-profile'
import { Preferences } from './preferences'
import { LogoutIconButton } from '../common/logout-icon-button'
import { TAdditionalSidebarReducer } from '../../../shared/types'

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
    const {
        spacing,
        typography: { small },
        palette: { primary }
    } = theme
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
            opacity: props.isOpen ? 1 : 0,
            overflow: 'hidden',
            transition: '0.23s'
        }),

        badge: {
            '&&': {
                background: primary.main,
                borderRadius: '0.25rem',
                color: primary.text,
                padding: spacing('0.1rem', 1),
                position: 'absolute',
                top: '0.25rem',
                right: '0.25rem',
                ...small
            }
        }
    }
})

export const AdditionalSidebar = () => {
    const storeDispatch = useStoreDispatch()
    const { isOpen, activeTab } = useStoreSelector(additionalSidebarSelector)

    const { activeItems } = useStoreSelector(progressSelector)

    const classes = useStyles({
        isOpen
    })

    const _updateAdditionalSidebar = (payload: TAdditionalSidebarReducer) => {
        storeDispatch(updateAdditionalSidebar(payload))
    }

    const onClickActionIcon = (tab: AdditionalSidebarTabs) => {
        if (isOpen && activeTab === tab) {
            /**
             * If additional sidebar is open and user clicked
             * on the same tab, then we are closing the tab
             */
            _updateAdditionalSidebar({
                isOpen: false,
                activeTab: None
            })
            return
        }

        _updateAdditionalSidebar({
            isOpen: true,
            activeTab: tab
        })
    }

    const onLogout = () => {
        _updateAdditionalSidebar({
            isOpen: false,
            activeTab: None
        })
    }

    return (
        <Box className={classes.root}>
            <Box className={classes.actionContainer}>
                {actions.map(({ tooltip, Icon, activeTab: _activeTab, id }) => (
                    <Tooltip message={tooltip} placement="left" key={id}>
                        <Box csx={{ root: { position: 'relative' } }}>
                            <IconButton
                                className={classes.button}
                                onClick={() => onClickActionIcon(_activeTab)}
                                Icon={Icon}
                                isHovered={activeTab === _activeTab}
                            />
                            {/* 
                                // TODO: Find a better way to show 
                                // TODO: notification badge 
                            */}
                            {_activeTab === ProgressTab &&
                                Object.keys(activeItems).length > 0 && (
                                    <Box className={classes.badge}>
                                        {Object.keys(activeItems).length}
                                    </Box>
                                )}
                        </Box>
                    </Tooltip>
                ))}
                <LogoutIconButton
                    className={classes.button}
                    onLogout={onLogout}
                />
            </Box>
            <Box className={classes.actionSection}>
                <Preferences />
                <EditProfile />
                <Progress />
            </Box>
        </Box>
    )
}
