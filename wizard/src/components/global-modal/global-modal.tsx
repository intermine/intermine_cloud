import { useContext } from 'react'
import { Modal } from '@intermine/chromatin/modal'
import { Box } from '@intermine/chromatin/box'
import { Typography } from '@intermine/chromatin/typography'
import { Button } from '@intermine/chromatin/button'
import { createStyle } from '@intermine/chromatin/styles'

import WarningIcon from '@intermine/chromatin/icons/System/alert-line'
import InfoIcon from '@intermine/chromatin/icons/System/information-line'
import SuccessIcon from '@intermine/chromatin/icons/System/check-line'
import ErrorIcon from '@intermine/chromatin/icons/System/error-warning-line'
import { ChromatinIcon } from '@intermine/chromatin/icons/types'

import { AppContext } from '../../context'

const useStyles = createStyle((theme) => {
    const { themeType, palette, elevation, spacing } = theme
    const {
        themeBackground: { light, dark },
        darkGrey,
        neutral
    } = palette

    return {
        content: {
            background: themeType === 'dark' ? darkGrey[30] : light.hex,
            borderRadius: '0.5rem',
            boxShadow: elevation.low,
            color: neutral[30],
            display: 'flex',
            flexDirection: 'column',
            maxWidth: '20rem',
            width: '100%'
        },
        root: {
            background:
                themeType === 'dark' ? light.getRGBA(0.1) : dark.getRGBA(0.1)
        },
        heading: {
            padding: spacing(2, 8)
        },
        iconContainer: {
            display: 'flex',
            justifyContent: 'space-between',
            padding: spacing(6, 8)
        },

        contentWrapper: {
            overflow: 'auto',
            padding: spacing(4, 8)
        },
        actionContainer: {
            display: 'flex',
            justifyContent: 'space-between',
            padding: spacing(6, 8, 8)
        }
    }
})

export const GlobalModal = () => {
    const classes = useStyles()
    const store = useContext(AppContext)
    const {
        globalModalReducer: {
            state: {
                isOpen,
                heading,
                children,
                primaryAction = {},
                secondaryAction = {},
                type = 'warning'
            }
        }
    } = store

    const getIcon = (): JSX.Element => {
        const iconCSX: ChromatinIcon['csx'] = {
            root: ({ palette }) => ({
                fill: palette[type].main,
                height: '2rem'
            })
        }
        switch (type) {
            case 'error':
                return <ErrorIcon csx={iconCSX} />
            case 'info':
                return <InfoIcon csx={iconCSX} />
            case 'success':
                return <SuccessIcon csx={iconCSX} />
            default:
                return <WarningIcon csx={iconCSX} />
        }
    }

    return (
        <Modal isOpen={isOpen} classes={classes}>
            <Box className={classes.iconContainer} variant="h3">
                {getIcon()}
            </Box>
            <Typography variant="h3" className={classes.heading}>
                {heading}
            </Typography>
            <Box
                className={classes.contentWrapper}
                csx={{ root: { lineHeight: '1.2' } }}
            >
                {children}
            </Box>

            <Box className={classes.actionContainer}>
                <Button
                    isTextUppercase={false}
                    color="neutral"
                    {...secondaryAction}
                />
                <Button
                    isTextUppercase={false}
                    color={type}
                    {...primaryAction}
                />
            </Box>
        </Modal>
    )
}
