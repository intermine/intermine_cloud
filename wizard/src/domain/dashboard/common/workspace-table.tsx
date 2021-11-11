import { useEffect } from 'react'
import { Box } from '@intermine/chromatin/box'
import { Table } from '@intermine/chromatin/table'
import { TableHead } from '@intermine/chromatin/table-head'
import { TableBody } from '@intermine/chromatin/table-body'
import { TableRow, TableRowProps } from '@intermine/chromatin/table-row'
import { TableCell, TableCellProps } from '@intermine/chromatin/table-cell'
import { createStyle } from '@intermine/chromatin/styles'
import { useDebouncedCallback } from '@intermine/chromatin/utils'

import { DomElementIDs } from '../../../constants/ids'
import { RouteLoadingSpinner } from '../../../components/route-loading-spinner'

const {
    WorkspacePageContainer,
    WorkspaceHeadingContainer,
    WorkspaceTableContainer
} = DomElementIDs

export type TCellValue = React.ReactChild | React.ReactChild[]

export type TTableCellData = {
    id: string | number
    value: TCellValue
    onClick?: TableCellProps['onClick']
}

export type TTableRowData = {
    id: string
    onClick?: TableRowProps['onClick']
    cells: TTableCellData[]
}

export type TTableHeaderData = {
    id: string | number
    row: TTableRowData
}

export type TTableBodyData = {
    id: string | number
    rows: TTableRowData[]
}

export type TTableData = {
    header: TTableHeaderData
    body: TTableBodyData
}

export type TWorkspaceTableProps = {
    data: TTableData
    emptyTableMessage?: React.ReactChild | React.ReactChild[]
    isFetchingData?: boolean
}

const useStyles = createStyle((theme) => {
    const {
        palette: {
            grey,
            darkGrey,
            themeType,
            neutral,
            common: { white }
        },
        spacing
    } = theme

    return {
        shape: {
            borderRadius: '0.5rem',
            overflow: 'hidden',
            position: 'relative'
        },

        emptyTableMessage: {
            color: neutral[30],
            height: '100%',
            padding: spacing(5),
            textAlign: 'center'
        },

        container: {
            overflow: 'auto'
        },

        row: {
            cursor: 'pointer',
            '&:hover td': {
                background: themeType === 'dark' ? darkGrey[50] : grey[20],
                transition: '0.3s'
            },
            '&:active td': {
                background: themeType === 'dark' ? darkGrey[40] : white,
                transition: '0.3s'
            }
        },
        cell: {
            '&&': {
                background: themeType === 'dark' ? darkGrey[40] : '#fefefe',
                borderBottom: `1px solid ${
                    themeType === 'dark' ? darkGrey[30] : grey[20]
                }`,
                color: neutral[40]
            }
        },
        headCell: {
            '&&': {
                background: themeType === 'dark' ? neutral[10] : grey[10],
                border: 0,
                color: neutral[40],
                padding: spacing(6, 5)
            }
        }
    }
})

export const WorkspaceTable = (props: TWorkspaceTableProps) => {
    const classes = useStyles()

    const {
        data: { header, body },
        emptyTableMessage,
        isFetchingData
    } = props
    const resizeTableContainer = () => {
        const pageContainer: HTMLDivElement | null = document.querySelector(
            '#' + WorkspacePageContainer
        )
        const heading: HTMLDivElement | null = document.querySelector(
            '#' + WorkspaceHeadingContainer
        )
        const tableContainer: HTMLDivElement | null = document.querySelector(
            '#' + WorkspaceTableContainer
        )

        if (pageContainer && heading && tableContainer) {
            console.log(pageContainer.clientHeight, heading.clientHeight)
            tableContainer.style.height = `${pageContainer.clientHeight - 96}px`
        }
    }

    const debouncedResizeTableContainer = useDebouncedCallback(
        resizeTableContainer,
        1000
    )

    useEffect(() => {
        resizeTableContainer()
        window.addEventListener('resize', debouncedResizeTableContainer)
        return () => {
            window.removeEventListener('resize', debouncedResizeTableContainer)
        }
    }, [])

    const getComponentToRender = () => {
        if (isFetchingData) {
            return <RouteLoadingSpinner hasBackground={false} />
        }

        if (body.rows.length === 0) {
            return (
                <Box isContentCenter className={classes.emptyTableMessage}>
                    {emptyTableMessage}
                </Box>
            )
        }
        return (
            <Table hasStickyHeader className={classes.shape}>
                <TableHead>
                    <TableRow onClick={header.row.onClick}>
                        {header.row.cells.map(({ id, value, onClick }) => {
                            return (
                                <TableCell
                                    className={classes.headCell}
                                    key={id}
                                    Component="th"
                                    onClick={onClick}
                                >
                                    {value}
                                </TableCell>
                            )
                        })}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {body.rows.map(({ id, onClick, cells }) => {
                        return (
                            <TableRow
                                className={classes.row}
                                key={id}
                                onClick={onClick}
                            >
                                {cells.map(({ id, value, onClick }) => {
                                    return (
                                        <TableCell
                                            key={id}
                                            className={classes.cell}
                                            onClick={onClick}
                                        >
                                            {value}
                                        </TableCell>
                                    )
                                })}
                            </TableRow>
                        )
                    })}
                </TableBody>
            </Table>
        )
    }

    return (
        <Box className={classes.shape}>
            <Box className={classes.container} id={WorkspaceTableContainer}>
                {getComponentToRender()}
            </Box>
        </Box>
    )
}
