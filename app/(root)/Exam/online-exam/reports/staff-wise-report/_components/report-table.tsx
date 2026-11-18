'use client';

import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import type { INotSubmittedReportRow, IStaffWiseReportRow } from '@/types/exam/online-exam/reports';
import type { ColumnDef } from '@tanstack/react-table';
import { useMemo } from 'react';

interface StaffWiseReportTableProps {
    reportType: 'not_submitted' | 'staff_wise';
    notSubmittedData?: INotSubmittedReportRow[];
    staffWiseData?: IStaffWiseReportRow[];
    isLoading?: boolean;
}

export default function StaffWiseReportTable({
    reportType,
    notSubmittedData = [],
    staffWiseData = [],
    isLoading
}: StaffWiseReportTableProps) {
    const notSubmittedTableProps = useDataTableProps(notSubmittedData);
    const staffWiseTableProps = useDataTableProps(staffWiseData);

    // Columns for Not Submitted Students
    const notSubmittedColumns: ColumnDef<INotSubmittedReportRow>[] = useMemo(
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
                accessorKey: 'sectionName',
                header: ({ column }) => <DataTableColumnHeader column={column} title='Section' />,
                cell: ({ row }) => <div>{row.getValue('sectionName')}</div>,
                enableSorting: true
            },
            {
                accessorKey: 'attemptStatus',
                header: ({ column }) => <DataTableColumnHeader column={column} title='Status' />,
                cell: ({ row }) => {
                    const status = row.getValue('attemptStatus') as string;
                    return (
                        <Badge variant={status === 'Not Started' ? 'destructive' : 'outline'} className='font-medium'>
                            {status}
                        </Badge>
                    );
                },
                enableSorting: true
            },
            {
                accessorKey: 'mobileNo',
                header: ({ column }) => <DataTableColumnHeader column={column} title='Contact No' />,
                cell: ({ row }) => <div>{row.getValue('mobileNo') || 'N/A'}</div>
            },
            {
                accessorKey: 'remarks',
                header: ({ column }) => <DataTableColumnHeader column={column} title='Remarks' />,
                cell: ({ row }) => <div className='text-muted-foreground text-xs italic'>{row.getValue('remarks') || '-'}</div>
            }
        ],
        []
    );

    // Columns for Staff-Wise Performance
    const staffWiseColumns: ColumnDef<IStaffWiseReportRow>[] = useMemo(
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
                accessorKey: 'staffName',
                header: ({ column }) => <DataTableColumnHeader column={column} title='Staff / Teacher Name' />,
                cell: ({ row }) => <div className='font-semibold text-foreground'>{row.getValue('staffName')}</div>,
                enableSorting: true
            },
            {
                accessorKey: 'employeeCode',
                header: ({ column }) => <DataTableColumnHeader column={column} title='Emp Code' />,
                cell: ({ row }) => <div>{row.getValue('employeeCode')}</div>,
                size: 100
            },
            {
                accessorKey: 'subjectName',
                header: ({ column }) => <DataTableColumnHeader column={column} title='Subject' />,
                cell: ({ row }) => <div className='font-medium text-primary'>{row.getValue('subjectName')}</div>,
                enableSorting: true
            },
            {
                accessorKey: 'className',
                header: ({ column }) => <DataTableColumnHeader column={column} title='Class' />,
                cell: ({ row }) => <div>{row.getValue('className')}</div>
            },
            {
                accessorKey: 'totalStudents',
                header: ({ column }) => <DataTableColumnHeader column={column} title='Total Students' />,
                cell: ({ row }) => <div className='text-center font-semibold'>{row.getValue('totalStudents')}</div>,
                size: 110
            },
            {
                accessorKey: 'totalAppeared',
                header: ({ column }) => <DataTableColumnHeader column={column} title='Appeared' />,
                cell: ({ row }) => <div className='text-center font-semibold text-blue-600'>{row.getValue('totalAppeared')}</div>,
                size: 100
            },
            {
                accessorKey: 'totalNotAppeared',
                header: ({ column }) => <DataTableColumnHeader column={column} title='Absent' />,
                cell: ({ row }) => <div className='text-center font-semibold text-destructive'>{row.getValue('totalNotAppeared')}</div>,
                size: 90
            },
            {
                accessorKey: 'totalPassed',
                header: ({ column }) => <DataTableColumnHeader column={column} title='Passed' />,
                cell: ({ row }) => <div className='text-center font-semibold text-emerald-600'>{row.getValue('totalPassed')}</div>,
                size: 90
            },
            {
                accessorKey: 'passPercentage',
                header: ({ column }) => <DataTableColumnHeader column={column} title='Pass %' />,
                cell: ({ row }) => <div className='text-center font-bold'>{row.getValue('passPercentage')}%</div>,
                enableSorting: true,
                size: 100
            }
        ],
        []
    );

    if (reportType === 'staff_wise') {
        return <GenericDataTable<IStaffWiseReportRow> columns={staffWiseColumns} {...staffWiseTableProps} isLoading={Boolean(isLoading)} />;
    }

    return (
        <GenericDataTable<INotSubmittedReportRow>
            columns={notSubmittedColumns}
            {...notSubmittedTableProps}
            isLoading={Boolean(isLoading)}
        />
    );
}
