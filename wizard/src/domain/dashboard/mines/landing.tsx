import { useState, useEffect } from 'react'
import { useHistory } from 'react-router-dom'
import { Box } from '@intermine/chromatin/box'
import { WorkspaceHeading } from '../common/workspace-heading'
import UploadIcon from '@intermine/chromatin/icons/System/upload-line'

import { DASHBOARD_CREATE_MINE_PATH } from '../../../routes'
import { WorkspaceTable } from '../common/workspace-table'
import { DashboardErrorBoundary } from '../common/error-boundary'

export const Landing = () => {
    const history = useHistory()
    const [isLoadingData, setIsLoadingData] = useState(true)

    const handleUploadClick = () => {
        history.push(DASHBOARD_CREATE_MINE_PATH)
    }

    useEffect(() => {
        setTimeout(() => setIsLoadingData(false), 5000)
    }, [])

    return (
        <Box>
            <WorkspaceHeading
                heading={{ children: 'Mines' }}
                primaryAction={{
                    children: 'Create New Mine',
                    RightIcon: <UploadIcon />,
                    onClick: handleUploadClick
                }}
            />

            <DashboardErrorBoundary errorMessage="Unable to load table.">
                <WorkspaceTable
                    data={{
                        header: {
                            id: 'header 1',
                            row: {
                                id: 'header row',
                                cells: [
                                    { id: 'head1', value: 'Header 1' },
                                    { id: 'head2', value: 'Header 2' },
                                    { id: 'head3', value: 'Header 3' },
                                    { id: 'head4', value: 'Header 4' },
                                    { id: 'head5', value: 'Header 5' }
                                ]
                            }
                        },
                        body: {
                            id: 'body1',
                            rows: [
                                {
                                    id: 'row 1',
                                    cells: [
                                        { id: 'row1cell1', value: 'Cell 1' },
                                        { id: 'row1cell2', value: 'Cell 2' },
                                        { id: 'row1cell3', value: 'Cell 3' },
                                        { id: 'row1cell4', value: 'Cell 4' },
                                        { id: 'row1cell5', value: 'Cell 5' }
                                    ]
                                },
                                {
                                    id: 'row 2',
                                    cells: [
                                        { id: 'row2cell1', value: 'Cell 1' },
                                        { id: 'row2cell2', value: 'Cell 2' },
                                        { id: 'row2cell3', value: 'Cell 3' },
                                        { id: 'row2cell4', value: 'Cell 4' },
                                        { id: 'row2cell5', value: 'Cell 5' }
                                    ]
                                },
                                {
                                    id: 'row 3',
                                    cells: [
                                        { id: 'row3cell1', value: 'Cell 1' },
                                        { id: 'row3cell2', value: 'Cell 2' },
                                        { id: 'row3cell3', value: 'Cell 3' },
                                        { id: 'row3cell4', value: 'Cell 4' },
                                        { id: 'row3cell5', value: 'Cell 5' }
                                    ]
                                },
                                {
                                    id: 'row 4',
                                    cells: [
                                        { id: 'row4cell1', value: 'Cell 1' },
                                        { id: 'row4cell2', value: 'Cell 2' },
                                        { id: 'row4cell3', value: 'Cell 3' },
                                        {
                                            id: 'row4cell4',
                                            value: 'Cell 4'
                                        },
                                        { id: 'row4cell5', value: 'Cell 5' }
                                    ]
                                },
                                {
                                    id: 'row 5',
                                    cells: [
                                        { id: 'row5cell1', value: 'Cell 1' },
                                        { id: 'row5cell2', value: 'Cell 2' },
                                        { id: 'row5cell3', value: 'Cell 3' },
                                        { id: 'row5cell4', value: 'Cell 4' },
                                        { id: 'row5cell5', value: 'Cell 5' }
                                    ]
                                },
                                {
                                    id: 'row 6',
                                    cells: [
                                        { id: 'row6cell1', value: 'Cell 1' },
                                        { id: 'row6cell2', value: 'Cell 2' },
                                        { id: 'row6cell3', value: 'Cell 3' },
                                        { id: 'row6cell4', value: 'Cell 4' },
                                        { id: 'row6cell5', value: 'Cell 5' }
                                    ]
                                },
                                {
                                    id: 'row 7',
                                    cells: [
                                        { id: 'row7cell1', value: 'Cell 1' },
                                        { id: 'row7cell2', value: 'Cell 2' },
                                        { id: 'row7cell3', value: 'Cell 3' },
                                        { id: 'row7cell4', value: 'Cell 4' },
                                        { id: 'row7cell5', value: 'Cell 5' }
                                    ]
                                },
                                {
                                    id: 'row 8',
                                    cells: [
                                        { id: 'row8cell1', value: 'Cell 1' },
                                        { id: 'row8cell2', value: 'Cell 2' },
                                        { id: 'row8cell3', value: 'Cell 3' },
                                        { id: 'row8cell4', value: 'Cell 4' },
                                        { id: 'row8cell5', value: 'Cell 5' }
                                    ]
                                },
                                {
                                    id: 'row 9',
                                    cells: [
                                        { id: 'row9cell1', value: 'Cell 1' },
                                        { id: 'row9cell2', value: 'Cell 2' },
                                        { id: 'row9cell3', value: 'Cell 3' },
                                        { id: 'row9cell4', value: 'Cell 4' },
                                        { id: 'row9cell5', value: 'Cell 5' }
                                    ]
                                },
                                {
                                    id: 'row 10',
                                    cells: [
                                        { id: 'row10cell1', value: 'Cell 1' },
                                        { id: 'row10cell2', value: 'Cell 2' },
                                        { id: 'row10cell3', value: 'Cell 3' },
                                        { id: 'row10cell4', value: 'Cell 4' },
                                        { id: 'row10cell5', value: 'Cell 5' }
                                    ]
                                },
                                {
                                    id: 'row 11',
                                    cells: [
                                        { id: 'row11cell1', value: 'Cell 1' },
                                        { id: 'row11cell2', value: 'Cell 2' },
                                        { id: 'row11cell3', value: 'Cell 3' },
                                        { id: 'row11cell4', value: 'Cell 4' },
                                        { id: 'row11cell5', value: 'Cell 5' }
                                    ]
                                }
                            ]
                        }
                    }}
                    emptyTableMessage={
                        <div>
                            You haven't uploaded any data yet! <br /> Use the
                            'Upload New Data' button to upload new data.
                        </div>
                    }
                    isFetchingData={false}
                />
            </DashboardErrorBoundary>
        </Box>
    )
}
