import { useHistory } from 'react-router-dom'
import { Box } from '@intermine/chromatin/box'
import { Typography } from '@intermine/chromatin/typography'
import { Label } from '@intermine/chromatin/label'
import { InputBase } from '@intermine/chromatin/input-base'
import UploadIcon from '@intermine/chromatin/icons/System/upload-cloud-2-line'
import { Button } from '@intermine/chromatin/button'
import { InlineAlert } from '@intermine/chromatin/inline-alert'
import { createStyle } from '@intermine/chromatin/styles'

import { DASHBOARD_DATA_LANDING_PATH } from '../../../routes'
import { WorkspaceHeading } from '../common/workspace-heading'

const useStyles = createStyle((theme) => {
    const {
        palette: { neutral, info, themeType },
        spacing
    } = theme
    return {
        uploadBox: {
            border: '5px dashed ' + neutral[themeType === 'dark' ? 20 : 10],
            borderRadius: '0.5rem',
            cursor: 'pointer',
            flexDirection: 'column',
            height: '8rem',
            margin: spacing(10),
            maxWidth: '25rem',
            width: '100%'
        },
        label: {
            alignItems: 'center',
            cursor: 'inherit',
            display: 'flex',
            textAlign: 'center',
            padding: spacing(5),
            fill: info.main
        },
        dragAndDrop: {
            alignItems: 'center',
            display: 'inline-flex',
            color: info.main
        },
        icon: {
            fill: info.main,
            marginRight: spacing(2)
        }
    }
})
export const UploadData = () => {
    const history = useHistory()
    const classes = useStyles()

    return (
        <Box>
            <WorkspaceHeading
                heading={{ variant: 'h2', children: 'Data' }}
                backAction={{
                    onClick: () => {
                        history.push(DASHBOARD_DATA_LANDING_PATH)
                    }
                }}
            />
            <Box isContentCenter csx={{ root: { flexDirection: 'column' } }}>
                <InlineAlert
                    isOpen={true}
                    message="Please select a file first"
                    type="error"
                    hasFullWidth
                />
                <Typography variant="h4">Upload New Data</Typography>
                <Typography variant="bodySm" color="neutral.30">
                    You can select .fasta, .tsv, .csv, .etc
                </Typography>
                <Box isContentCenter className={classes.uploadBox}>
                    <Label className={classes.label}>
                        <UploadIcon
                            className={classes.icon}
                            height="1.5rem"
                            width="1.5rem"
                        />
                        <Typography>
                            <Typography Component="span" color="info">
                                Drag and Drop&nbsp;
                            </Typography>
                            or browse file
                        </Typography>
                        <InputBase type="file" isHidden />
                    </Label>
                </Box>
                <Button color="primary">Upload Data</Button>
            </Box>
        </Box>
    )
}
