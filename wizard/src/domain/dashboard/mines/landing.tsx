import { useHistory } from 'react-router-dom'
import { Box } from '@intermine/chromatin/box'
import { WorkspaceHeading } from '../common/workspace-heading'
import AddIcon from '@intermine/chromatin/icons/System/add-fill'

import { DASHBOARD_CREATE_MINE_PATH } from '../../../routes'
import { WorkspaceTable } from '../common/workspace-table'
import { DashboardErrorBoundary } from '../common/error-boundary'

export const Landing = () => {
    const history = useHistory()

    const handleUploadClick = () => {
        history.push(DASHBOARD_CREATE_MINE_PATH)
    }

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
                <WorkspaceTable
                    data={{
                        header: { id: '', row: { id: '', cells: [] } },
                        body: { id: '', rows: [] }
                    }}
                    emptyTableMessage={
                        <div>
                            You haven't crated any mine yet! <br /> Use the
                            'Create New Mine' button to create a mine.
                        </div>
                    }
                    isFetchingData={false}
                />
            </DashboardErrorBoundary>
        </Box>
    )
}
