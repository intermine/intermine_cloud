import { useEffect, useState } from 'react'
import { useHistory } from 'react-router-dom'
import { Box } from '@intermine/chromatin/box'
import AddIcon from '@intermine/chromatin/icons/System/add-fill'

import { WorkspaceHeading } from '../common/workspace-heading'
import { DASHBOARD_CREATE_CLUSTER_PATH } from '../../../routes'
import { DashboardErrorBoundary } from '../common/error-boundary'
import { useDashboardQuery } from '../hooks'
import {
    AccordionListContainer,
    TAccordionListDatum,
    AccordionList
} from '../common/accordion-list/accordion-list'
// eslint-disable-next-line max-len
import { LandingPageAccordionList } from '../common/accordion-list/landing-page-accordion-list'

const MsgIfListEmpty = (
    <Box>
        You haven't created any cluster yet!
        <br />
        Use the 'Create New Cluster' button to create.
    </Box>
)

const MsgIfFailedToLoadList = <Box>Failed to load clusters.</Box>

const fetchClusters = async (): Promise<any> => {
    // TODO: fetch data from server.
    const res = await new Promise((resolve) => resolve([]))
    return res
}

export const Landing = () => {
    const history = useHistory()
    const [data, setData] = useState<TAccordionListDatum[]>([])

    const handleUploadClick = () => {
        history.push(DASHBOARD_CREATE_CLUSTER_PATH)
    }

    const onQuerySuccessful = () => {
        // TODO: Update this function to populate list.
        return
    }

    const { isLoading, isFailed, query } = useDashboardQuery({
        queryFn: () => fetchClusters(),
        onSuccessful: onQuerySuccessful,
        refetchInterval: 10_000
    })

    useEffect(() => {
        query()
    }, [])

    return (
        <Box>
            <WorkspaceHeading
                heading={{ children: 'Clusters' }}
                primaryAction={{
                    children: 'Create New Cluster',
                    RightIcon: <AddIcon />,
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
