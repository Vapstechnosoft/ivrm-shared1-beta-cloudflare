'use client';

import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import type { IOnlineExamReportRow } from '@/types/exam/online-exam/reports';
import type { ColumnDef } from '@tanstack/react-table';
import { useMemo } from 'react';

interface OnlineExamReportTableProps {
    reportData: IOnlineExamReportRow[];
    isLoading?: boolean;
}

export default function OnlineExamReportTable({ reportData = [], isLoading }: OnlineExamReportTableProps) {
    const tableProps = useDataTableProps(reportData);

    const columns: ColumnDef<IOnlineExamReportRow>[] = useMemo(
        () => [
            {
                accessorKey: 'slNo',
                header: ({ column }) => <DataTableColumnHeader column={column} title='Sl.No' />,
                cell: ({ row, table }) => {
                    const pageIndex = table.getState().pagination.pageIndex;
                    const pageSize = table.getState().pagination.pageSize;
                    return <div className='font-medium'>{pageIndex * pageSize + row.index + 1}</div>;
                },
                size: 70
            },
            {
                accessorKey: 'studentName',
                header: ({ column }) => <DataTableColumnHeader column={column} title='Student Name' />,
                cell: ({ row }) => <div className='font-semibold text-foreground'>{row.getValue('studentName')}</div>,
                enableSorting: true
            },
            {
                accessorKey: 'admNo',
                header: ({ column }) => <DataTableColumnHeader column={column} title='Adm No' />,
                cell: ({ row }) => <div>{row.getValue('admNo')}</div>,
                enableSorting: true
            },
            {
                accessorKey: 'rollNo',
                header: ({ column }) => <DataTableColumnHeader column={column} title='Roll No' />,
                cell: ({ row }) => <div className='text-center'>{row.getValue('rollNo') || 'N/A'}</div>,
                enableSorting: true,
                size: 90
            },
            {
                accessorKey: 'className',
                header: ({ column }) => <DataTableColumnHeader column={column} title='Class' />,
                cell: ({ row }) => <div>{row.getValue('className')}</div>,
                enableSorting: true
            },
            {
                accessorKey: 'totalQuestions',
                header: ({ column }) => <DataTableColumnHeader column={column} title='Total Qs' />,
                cell: ({ row }) => <div className='text-center'>{row.getValue('totalQuestions')}</div>,
                size: 90
            },
            {
                accessorKey: 'attemptedQuestions',
                header: ({ column }) => <DataTableColumnHeader column={column} title='Attempted' />,
                cell: ({ row }) => <div className='text-center'>{row.getValue('attemptedQuestions')}</div>,
                size: 100
            },
            {
                accessorKey: 'correctAnswers',
                header: ({ column }) => <DataTableColumnHeader column={column} title='Correct' />,
                cell: ({ row }) => (
                    <div className='text-center font-semibold text-emerald-600 dark:text-emerald-400'>{row.getValue('correctAnswers')}</div>
                ),
                size: 90
            },
            {
                accessorKey: 'wrongAnswers',
                header: ({ column }) => <DataTableColumnHeader column={column} title='Wrong' />,
                cell: ({ row }) => <div className='text-center font-semibold text-destructive'>{row.getValue('wrongAnswers')}</div>,
                size: 90
            },
            {
                accessorKey: 'marksObtained',
                header: ({ column }) => <DataTableColumnHeader column={column} title='Marks' />,
                cell: ({ row }) => (
                    <div className='text-center font-bold text-primary'>
                        {row.original.marksObtained} / {row.original.maxMarks}
                    </div>
                ),
                enableSorting: true,
                size: 100
            },
            {
                accessorKey: 'percentage',
                header: ({ column }) => <DataTableColumnHeader column={column} title='Percentage' />,
                cell: ({ row }) => <div className='text-center font-bold'>{row.getValue('percentage')}%</div>,
                enableSorting: true,
                size: 100
            },
            {
                accessorKey: 'resultStatus',
                header: ({ column }) => <DataTableColumnHeader column={column} title='Result' />,
                cell: ({ row }) => {
                    const status = row.getValue('resultStatus') as string;
                    const pass = status === 'Pass';
                    return (
                        <Badge variant={pass ? 'success' : 'destructive'} className='font-medium'>
                            {status}
                        </Badge>
                    );
                },
                enableSorting: true,
                size: 90
            },
            {
                accessorKey: 'rank',
                header: ({ column }) => <DataTableColumnHeader column={column} title='Rank' />,
                cell: ({ row }) => (
                    <div className='text-center font-bold text-foreground'>{row.getValue('rank') ? `#${row.getValue('rank')}` : '-'}</div>
                ),
                size: 80
            }
        ],
        []
    );

    return <GenericDataTable<IOnlineExamReportRow> columns={columns} {...tableProps} isLoading={Boolean(isLoading)} />;
}
