'use client';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import type { ColumnDef } from '@tanstack/react-table';

export interface EmployeeAbsentReportRow {
    hrme_id?: number;
    ecode?: string;
    ename?: string;
    designation?: string;
    workday?: number;
    absentdays?: number;
    presence_breakdown?: string;
    [key: string]: any;
}

export const employeeAbsentReportColumns: ColumnDef<EmployeeAbsentReportRow>[] = [
    {
        accessorKey: 'hrme_id',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Sl.No' className='ml-4 text-center' />,
        cell: ({ row, table }) => {
            const pageIndex = table.getState().pagination.pageIndex;
            const pageSize = table.getState().pagination.pageSize;
            const continuousIndex = pageIndex * pageSize + row.index + 1;
            return <div className='text-center'>{continuousIndex}</div>;
        },

        enableSorting: false,
        enableHiding: false
    },
    {
        accessorKey: 'ecode',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Employee Code' />,
        cell: ({ row }) => <div className='w-fit'>{row.getValue('ecode')}</div>,
        enableSorting: false,
        enableHiding: false
    },
    {
        accessorKey: 'ename',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Employee Name' />,
        cell: ({ row }) => <div className='w-fit'>{row.getValue('ename')}</div>,
        enableSorting: false,
        enableHiding: false
    },
    {
        accessorKey: 'designation',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Designation' className='text-center' />,
        cell: ({ row }) => <div className='text-center'>{row.getValue('designation')}</div>,
        enableSorting: false,
        enableHiding: false
    },
    {
        accessorKey: 'absentdays',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Total Absent' className='text-center' />,
        cell: ({ row }) => <div className='font-bold text-destructive text-center'>{row.getValue('absentdays')}</div>,
        enableSorting: false,
        enableHiding: false
    }
];
