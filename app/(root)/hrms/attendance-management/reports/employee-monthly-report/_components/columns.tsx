'use client';
import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import type { ColumnDef } from '@tanstack/react-table';
import { format, parseISO } from 'date-fns';

const formatDate = (date: unknown): string => {
    if (typeof date !== 'string') return 'N/A';
    if (!date) return 'N/A';
    try {
        return format(parseISO(date), 'dd-MM-yyyy');
    } catch (e) {
        return 'Invalid Date';
    }
};

export interface MonthlyRow {
    ecode?: string;
    ename?: string;
    designation?: string;
    hrme_doj?: string;
    tpdays?: number;
    hwkdays?: number;
    hrme_id?: number;
    attendance_data?: string | any;
    [key: string]: any;
}

export const getStatusBadge = (status: any) => {
    const s = String(status);
    switch (s) {
        case '1':
            return <Badge className='bg-green-100 text-green-700 hover:bg-green-100'>P</Badge>;
        case '0':
            return <Badge className='bg-red-100 text-red-700 hover:bg-red-100'>A</Badge>;
        case '2':
            return <Badge className='bg-blue-100 text-blue-700 hover:bg-blue-100'>H</Badge>;
        case '3':
            return <Badge className='bg-yellow-100 text-yellow-700 hover:bg-yellow-100'>AL</Badge>;
        case '4':
            return <Badge className='bg-purple-100 text-purple-700 hover:bg-purple-100'>OD</Badge>;
        case '5':
            return <Badge className='bg-orange-100 text-orange-700 hover:bg-orange-100'>HD</Badge>;
        default:
            return <span className='text-gray-400'>-</span>;
    }
};

export const employeeMonthlyReportBaseColumns: ColumnDef<MonthlyRow>[] = [
    // {
    //     id: 'select',
    //     header: ({ table }) => (
    //         <Checkbox
    //             checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
    //             onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
    //             aria-label='Select all'
    //         />
    //     ),
    //     cell: ({ row }) => (
    //         <Checkbox checked={row.getIsSelected()} onCheckedChange={(value) => row.toggleSelected(!!value)} aria-label='Select row' />
    //     ),
    //     enableSorting: false,
    //     enableHiding: false,
    //     size: 24
    // },
    {
        accessorKey: 'slNo',
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
        header: ({ column }) => <DataTableColumnHeader column={column} title='Emp. Code' />,
        cell: ({ row }) => <div>{row.getValue('ecode')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'ename',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Employee Name' />,
        cell: ({ row }) => <div>{row.getValue('ename')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'designation',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Designation' />,
        cell: ({ row }) => <div>{row.getValue('designation')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'hrme_doj',
        header: ({ column }) => <DataTableColumnHeader column={column} title='DOJ' />,
        cell: ({ row }) => <div>{formatDate(row.getValue('hrme_doj'))}</div>,
        enableSorting: true,
        enableHiding: true
    }
];

export const getDynamicDateColumns = (dates: string[]): ColumnDef<MonthlyRow>[] => {
    return dates.sort().map((date) => ({
        accessorKey: `attendance_${date}`,
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title={format(parseISO(date), 'dd MMM yyyy')} className='min-w-[40px] text-center' />
        ),
        cell: ({ row }) => <div className='text-center uppercase'>{getStatusBadge(row.original[`attendance_${date}`])}</div>,
        enableSorting: false,
        enableHiding: true
    }));
};

export const summaryColumns: ColumnDef<MonthlyRow>[] = [
    {
        accessorKey: 'hwkdays',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Working Days' />,
        cell: ({ row }) => <div className='text-center'>{row.getValue('hwkdays')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'tpdays',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Present Days' />,
        cell: ({ row }) => <div className='text-center'>{row.getValue('tpdays')}</div>,
        enableSorting: true,
        enableHiding: true
    }
];

// For Format One (Transposed)
export const formatOneColumns: ColumnDef<any>[] = [
    {
        accessorKey: 'date',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Date' />,
        cell: ({ row }) => <div>{formatDate(row.getValue('date'))}</div>,
        enableSorting: true,
        enableHiding: false
    }
];

export const getFormatOneEmployeeColumns = (employees: { ecode: string; ename: string; hrme_id: number }[]): ColumnDef<any>[] => {
    return employees.map((emp) => ({
        accessorKey: `emp_${emp.hrme_id}`,
        header: ({ column }) => <DataTableColumnHeader column={column} title={`${emp.ename}`} className='min-w-[100px]' />,
        cell: ({ row }) => <div className='text-center uppercase'>{getStatusBadge(row.original[`emp_${emp.hrme_id}`])}</div>,
        enableSorting: false,
        enableHiding: true
    }));
};
