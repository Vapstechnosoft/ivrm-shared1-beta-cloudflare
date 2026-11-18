'use client';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import type { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';

const formatDate = (date: unknown): string => {
    if (typeof date !== 'string' || !date) return 'N/A';
    try {
        return format(new Date(date), 'dd-MM-yyyy');
    } catch {
        return 'N/A';
    }
};

export interface HolidayReportRow {
    fomhwD_HolidayWDName?: string;
    fomhwdD_Date?: string;
    [key: string]: any;
}

export const holidayReportColumns: ColumnDef<HolidayReportRow>[] = [
    {
        id: 'select',
        header: ({ table }) => (
            <Checkbox
                checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label='Select all'
            />
        ),
        cell: ({ row }) => (
            <Checkbox checked={row.getIsSelected()} onCheckedChange={(value) => row.toggleSelected(!!value)} aria-label='Select row' />
        ),
        enableSorting: false,
        enableHiding: false,
        size: 24
    },
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
        accessorKey: 'fomhwD_HolidayWDName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Holiday Name' />,
        cell: ({ row }) => <div>{row.getValue('fomhwD_HolidayWDName') || 'N/A'}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'fomhwdD_Date',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Date' />,
        cell: ({ row }) => {
            const date = row.getValue('fomhwdD_Date');
            return <div>{formatDate(date)}</div>;
        },
        enableSorting: true,
        enableHiding: true
    }
];
