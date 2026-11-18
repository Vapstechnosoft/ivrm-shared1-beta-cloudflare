'use client';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import type { ColumnDef } from '@tanstack/react-table';

export interface EmployeeMonthReportRow {
    hrmE_Id: number;
    hrmE_EmployeeFirstName: string;
    hrmE_EmployeeLastName: string | null;
    hrmE_EmployeeCode: string;
}

export const employeeMonthReportColumns: ColumnDef<EmployeeMonthReportRow>[] = [
    {
        id: 'slNo',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Sl.No' className='w-full pl-6' />,
        cell: ({ row, table }) => {
            const pageIndex = table.getState().pagination.pageIndex;
            const pageSize = table.getState().pagination.pageSize;
            const continuousIndex = pageIndex * pageSize + row.index + 1;
            return <div className='w-full pl-6'>{continuousIndex}</div>;
        },
        enableSorting: false,
        enableHiding: false
    },
    {
        accessorKey: 'hrmE_EmployeeCode',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Employee Code' />,
        cell: ({ row }) => <div className='font-medium'>{row.getValue('hrmE_EmployeeCode')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'hrmE_EmployeeFirstName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Employee Name' />,
        cell: ({ row }) => {
            const first = row.original.hrmE_EmployeeFirstName || '';
            const last = row.original.hrmE_EmployeeLastName || '';
            return <div>{`${first} ${last}`.trim()}</div>;
        },
        enableSorting: true,
        enableHiding: true
    }
];
