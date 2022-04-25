import { useEffect, useState } from 'react'
import { useHistory } from 'react-router-dom'
import { Box } from '@intermine/chromatin/box'
import AddIcon from '@intermine/chromatin/icons/System/add-fill'

import { Mine } from '@intermine/compose-rest-client'

import { WorkspaceHeading } from '../common/workspace-heading'
import { DASHBOARD_CREATE_MINE_PATH } from '../../../routes'
import { DashboardErrorBoundary } from '../common/error-boundary'
import { mineApi } from '../../../services/api'
import { useDashboardQuery } from '../hooks'
import {
    AccordionListContainer,
    TAccordionListDatum,
    AccordionList
} from '../common/accordion-list/accordion-list'
// eslint-disable-next-line max-len
import { LandingPageAccordionList } from '../common/accordion-list/landing-page-accordion-list'

type TMines = Mine[]
const MsgIfListEmpty = (
    <Box>
        You haven't created any mine yet!
        <br />
        Use the 'Create New Mine' button to create.
    </Box>
)

const MsgIfFailedToLoadList = <Box>Failed to load mines.</Box>

const fetchMines = async (): Promise<TMines> => {
    const res = await mineApi.mineGet('get_all_mines')
    return res.data.items.mine_list
}

export const Landing = () => {
    const history = useHistory()
    const [data, setData] = useState<TAccordionListDatum[]>([])

    const handleUploadClick = () => {
        history.push(DASHBOARD_CREATE_MINE_PATH)
    }

    const getAction = (mine: Mine) => {
        return (
            <AccordionList.ActionButton color="secondary">
                Deploy
            </AccordionList.ActionButton>
        )
    }

    const onQuerySuccessful = (mines: TMines) => {
        const lists: TAccordionListDatum[] = []
        for (const mine of mines) {
            lists.push({
                id: mine.mine_id,
                bodyItem: { content: mine.description },
                headerItems: [
                    {
                        id: mine.mine_id + 'header-name',
                        body: mine.name,
                        heading: 'Name'
                    },
                    {
                        id: mine.mine_id + 'header-sub-domain',
                        body: mine.subdomain,
                        heading: 'File Type'
                    },
                    {
                        id: mine.mine_id + 'action',
                        body: (
                            <Box csx={{ root: { padding: '0.25rem' } }}>
                                {getAction(mine)}
                            </Box>
                        ),
                        heading: ''
                    }
                ]
            })
        }
        setData(lists)
    }

    const { isLoading, isFailed, query } = useDashboardQuery({
        queryFn: () => fetchMines(),
        onSuccessful: onQuerySuccessful,
        refetchInterval: 10_000
    })

    useEffect(() => {
        query()
    }, [])

    return (
        <Box>
            <WorkspaceHeading
                heading={{ children: 'Mines' }}
                primaryAction={{
                    children: 'Create New Mine',
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
