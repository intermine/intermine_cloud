import { useHistory } from 'react-router-dom'
import { Box } from '@intermine/chromatin/box'
import { Typography } from '@intermine/chromatin/typography'
import { Label } from '@intermine/chromatin/label'
import { Collapsible } from '@intermine/chromatin/collapsible'
import { InputBase } from '@intermine/chromatin/input-base'
import UploadIcon from '@intermine/chromatin/icons/System/upload-cloud-2-line'
import { Button } from '@intermine/chromatin/button'
import {
    InlineAlert,
    InlineAlertProps
} from '@intermine/chromatin/inline-alert'
import { createStyle } from '@intermine/chromatin/styles'

import { DASHBOARD_DATASETS_LANDING_PATH } from '../../../../routes'

import { WorkspaceHeading } from '../../common/workspace-heading'
import { getDataSize } from '../../../../utils/get'

type TUploadDataView = {
    isUploadingFile: boolean
    inlineAlert: InlineAlertProps
    file?: File
    uploadEventHandler: () => void
    onInputChange: (event: React.FormEvent<HTMLInputElement>) => void
}

type TUseStyleProps = {
    isUploadingFile: boolean
}

const useStyles = createStyle((theme) => {
    const {
        palette: { neutral, info, themeType, disable },
        spacing
    } = theme
    return {
        uploadBox: (props: TUseStyleProps) => ({
            border: '5px dashed ' + neutral[themeType === 'dark' ? 20 : 10],
            borderRadius: '0.5rem',
            height: '8rem',
            margin: spacing(10, 0),
            maxWidth: '25rem',
            width: '100%',
            ...(props.isUploadingFile && {
                background: disable.main,
                pointerEvents: 'none'
            })
        }),
        stackCenter: {
            alignItems: 'center',
            display: 'flex',
            flexDirection: 'column',
            width: '100%'
        },
        inlineAlert: {
            marginBottom: spacing(5)
        },
        label: {
            alignItems: 'center',
            cursor: 'pointer',
            justifyContent: 'center',
            display: 'flex',
            height: '100%',
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
        },
        filePropContainer: {
            marginBottom: spacing(4)
        }
    }
})

export const UploadDatasetView = (props: TUploadDataView) => {
    const history = useHistory()
    const {
        isUploadingFile,
        file,
        inlineAlert,
        onInputChange,
        uploadEventHandler
    } = props

    const classes = useStyles({ isUploadingFile })

    return (
        <Box>
            <WorkspaceHeading
                heading={{ variant: 'h2', children: 'Dataset' }}
                backAction={{
                    onClick: () => {
                        history.push(DASHBOARD_DATASETS_LANDING_PATH)
                    }
                }}
            />
            <Box className={classes.stackCenter}>
                <Box csx={{ root: { maxWidth: '26rem', width: '100%' } }}>
                    <InlineAlert
                        hasFullWidth
                        className={classes.inlineAlert}
                        {...inlineAlert}
                    />
                    <Box className={classes.stackCenter}>
                        <Typography variant="h4">Upload New Dataset</Typography>
                        <Typography variant="bodySm" color="neutral.30">
                            You can select .fasta, .tsv, .csv, .etc
                        </Typography>
                    </Box>
                    <Box className={classes.uploadBox}>
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
                            <InputBase
                                type="file"
                                isHidden
                                onChange={onInputChange}
                                isDisabled={isUploadingFile}
                            />
                        </Label>
                    </Box>

                    <Collapsible
                        in={Boolean(file)}
                        className={classes.filePropContainer}
                    >
                        <Box display="flex">
                            <Typography variant="title" Component="span">
                                File:&nbsp;
                            </Typography>
                            <Typography isTruncateText>{file?.name}</Typography>
                        </Box>
                        <Box display="flex">
                            <Typography variant="title" Component="span">
                                Size:&nbsp;
                            </Typography>
                            <Typography variant="body" isTruncateText>
                                {file && getDataSize(file.size)}
                            </Typography>
                        </Box>
                    </Collapsible>
                    <Box isContentCenter>
                        <Button
                            color="primary"
                            onClick={uploadEventHandler}
                            isLoading={isUploadingFile}
                        >
                            Upload Data
                        </Button>
                    </Box>
                </Box>
            </Box>
        </Box>
    )
}
