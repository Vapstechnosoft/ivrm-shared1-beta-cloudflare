'use client';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import type { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';

const formatDate = (date: unknown): string => {
    if (typeof date !== 'string') return 'N/A';
    if (!date) return 'N/A';
    return format(new Date(date), 'dd-MM-yyyy');
};

export interface YearRow {
    ecode?: string;
    ename?: string;
    designation?: string;
    doj?: string;
    tpdays?: number;
    hwkdays?: number;
    [key: string]: any;
}

export const getEmployeeYearlyReportColumns = (dynamicMonths: string[] = [], modes: string[] = []): ColumnDef<YearRow>[] => {
    const columns: ColumnDef<YearRow>[] = [
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
            accessorKey: 'slno',
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
            accessorKey: 'ecode',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Employee Code' />,
            cell: ({ row }) => <div>{row.getValue('ecode')}</div>,
            enableSorting: false,
            enableHiding: false
        },
        {
            accessorKey: 'ename',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Employee Name' />,
            cell: ({ row }) => <div>{row.getValue('ename')}</div>,
            enableSorting: false,
            enableHiding: false
        },
        {
            accessorKey: 'designation',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Employee Designation' />,
            cell: ({ row }) => <div>{row.getValue('designation')}</div>,
            enableSorting: false,
            enableHiding: false
        }
    ];

    // Add dynamic month columns
    dynamicMonths.forEach((month) => {
        columns.push({
            accessorKey: month,
            header: ({ column }) => <DataTableColumnHeader column={column} title={month.replace('_', ' ')} />,
            cell: ({ row }) => <div>{row.original[month]}</div>,
            enableSorting: false,
            enableHiding: false
        });
    });

    if (modes.includes('Total working Day')) {
        columns.push({
            accessorKey: 'tpdays',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Total Working Day' />,
            cell: ({ row }) => <div>{row.getValue('tpdays')}</div>,
            enableSorting: false,
            enableHiding: false
        });
    }

    // Add Total Worked on Holidays if mode selected
    if (modes.includes('Show Holiday Punch')) {
        columns.push({
            accessorKey: 'hwkdays',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Total Worked on Holidays' />,
            cell: ({ row }) => <div>{row.getValue('hwkdays')}</div>,
            enableSorting: false,
            enableHiding: false
        });
    }

    // Add Date of Joining if mode selected
    if (modes.includes('Date Of Joining')) {
        columns.push({
            accessorKey: 'doj',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Date of Joining' />,
            cell: ({ row }) => {
                const date = row.getValue('doj') as string;
                return <div>{formatDate(date)}</div>;
            },
            enableSorting: false,
            enableHiding: false
        });
    }

    return columns;
};

// Default columns for initialization
export const employeeYearlyReportColumns = getEmployeeYearlyReportColumns();
