import { useEffect, useState } from 'react'
import { useHistory } from 'react-router-dom'
import { Box } from '@intermine/chromatin/box'
import { WorkspaceHeading } from '../common/workspace-heading'
import UploadIcon from '@intermine/chromatin/icons/System/upload-line'

import { Template, ModelFile } from '@intermine/compose-rest-client'

import { DASHBOARD_UPLOAD_TEMPLATE_PATH } from '../../../routes'
import { DashboardErrorBoundary } from '../common/error-boundary'
import { templateApi } from '../../../services/api'
import { useDashboardQuery } from '../hooks'
import {
    AccordionListContainer,
    TAccordionListDatum
} from '../common/accordion-list/accordion-list'
// eslint-disable-next-line max-len
import { LandingPageAccordionList } from '../common/accordion-list/landing-page-accordion-list'
import { StatusTag } from '../common/status-tag'
import {
    extractAllFileIdsObjFromList,
    fetchAllFileUsingFileIds
} from '../utils/misc'

type TTemplate = Template & {
    file: ModelFile
}

const MsgIfListEmpty = (
    <Box>
        You haven't uploaded any template yet!
        <br />
        Use the 'Upload New Template' button to upload.
    </Box>
)

const MsgIfFailedToLoadList = <Box>Failed to load templates.</Box>

const fetchTemplateAndFiles = async () => {
    const res = await templateApi.templateGet('get_all_templates')
    const { template_list: templateList } = res.data.items

    const fileIds = extractAllFileIdsObjFromList(templateList)
    const fileListObj = await fetchAllFileUsingFileIds(fileIds)

    const templates: TTemplate[] = []

    for (const template of templateList) {
        templates.push({
            ...template,
            file: fileListObj[template.file_id]
        })
    }

    return templates
}

export const Landing = () => {
    const history = useHistory()
    const [data, setData] = useState<TAccordionListDatum[]>([])

    const handleUploadClick = () => {
        history.push(DASHBOARD_UPLOAD_TEMPLATE_PATH)
    }

    const onQuerySuccessful = (templates: TTemplate[]) => {
        const lists: TAccordionListDatum[] = []

        for (const template of templates) {
            lists.push({
                id: template.template_id,
                file_id: template.file_id,
                bodyItem: { content: template.description },
                headerItems: [
                    {
                        id: template.template_id + 'header-name',
                        body: template.name,
                        heading: 'Name'
                    },
                    {
                        id: template.template_id + 'file-upload-status',
                        body: (
                            <StatusTag
                                status={
                                    template.file.uploaded
                                        ? 'success'
                                        : 'warning'
                                }
                                statusText={
                                    template.file.uploaded
                                        ? 'Uploaded'
                                        : 'Pending'
                                }
                            />
                        ),
                        heading: 'File Upload Status'
                    }
                ]
            })
        }

        setData(lists)
    }

    const { isLoading, query, isFailed } = useDashboardQuery({
        queryFn: fetchTemplateAndFiles,
        onSuccessful: onQuerySuccessful,
        refetchInterval: 10_000
    })

    useEffect(() => {
        query()
    }, [])

    return (
        <Box>
            <WorkspaceHeading
                heading={{ children: 'Templates' }}
                primaryAction={{
                    children: 'Upload New Template',
                    RightIcon: <UploadIcon />,
                    onClick: handleUploadClick
                }}
            />

            <DashboardErrorBoundary errorMessage="Unable to load table.">
                <AccordionListContainer
                    isEmpty={data.length === 0}
                    isLoading={isLoading}
                    msgIfListIsEmpty={
                        isFailed ? MsgIfFailedToLoadList : MsgIfListEmpty
                    }
                >
                    {data.map((item, idx) => {
                        return (
                            <LandingPageAccordionList
                                key={item.id}
                                isFirstItem={idx === 0}
                                isLastItem={idx + 1 === data.length}
                                item={item}
                            />
                        )
                    })}
                </AccordionListContainer>
            </DashboardErrorBoundary>
        </Box>
    )
}
