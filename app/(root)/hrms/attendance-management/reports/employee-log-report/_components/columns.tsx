'use client';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import type { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';

const formatDate = (date: unknown): string => {
    if (typeof date !== 'string') return 'N/A';
    if (!date) return 'N/A';
    return format(new Date(date), 'dd-MM-yyyy');
};

export interface LogRow {
    hrmE_Id?: number;
    ecode?: string;
    ename?: string;
    depname?: string;
    desgname?: string;
    gtype?: string;
    punchdate?: string;
    punchday?: string;
    intime?: string;
    outtime?: string;
    workingtime?: string;
    lateby?: string;
    earlyby?: string;
    intemperature?: string;
    [key: string]: any;
}

export const logReportColumns: ColumnDef<LogRow>[] = [
    {
        accessorKey: 'slno',
        header: ({ column }) => (
            <div>
                <DataTableColumnHeader column={column} title='Sl.No' className='w-full' />{' '}
            </div>
        ),
        cell: ({ row, table }) => {
            const pageIndex = table.getState().pagination.pageIndex;
            const pageSize = table.getState().pagination.pageSize;
            const continuousIndex = pageIndex * pageSize + row.index + 1;
            return <div className='text-center'>{continuousIndex}</div>;
        },
        size: 50,
        enableSorting: true,
        enableHiding: false
    },
    {
        accessorKey: 'ecode',
        header: ({ column }) => (
            <div className='flex justify-center '>
                <DataTableColumnHeader column={column} title='Employee Code' />{' '}
            </div>
        ),
        cell: ({ row }) => <div className='text-center'>{row.getValue('ecode')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'ename',
        header: ({ column }) => (
            <div className='flex justify-center '>
                <DataTableColumnHeader column={column} title='Employee Name' />{' '}
            </div>
        ),
        cell: ({ row }) => <div className='text-left'>{row.getValue('ename')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'gtype',
        header: ({ column }) => (
            <div className='flex justify-center '>
                <DataTableColumnHeader column={column} title='Type' />{' '}
            </div>
        ),
        cell: ({ row }) => <div className='text-center'>{row.getValue('gtype')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'depname',
        header: ({ column }) => (
            <div className='flex justify-center '>
                <DataTableColumnHeader column={column} title='Department' />{' '}
            </div>
        ),
        cell: ({ row }) => <div className='text-center'>{row.getValue('depname')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'desgname',
        header: ({ column }) => (
            <div className='flex justify-center '>
                <DataTableColumnHeader column={column} title='Designation' />{' '}
            </div>
        ),
        cell: ({ row }) => <div className='text-center'>{row.getValue('desgname')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'intime',
        header: ({ column }) => (
            <div className='flex justify-center '>
                <DataTableColumnHeader column={column} title='Time In' />{' '}
            </div>
        ),
        cell: ({ row }) => {
            const val = row.getValue('intime');
            let color = '';
            if (val === null || val === '' || val === 'A' || val === '00:00')
                return <div className='text-center font-semibold text-red-500'>A</div>;
            if (val === 'H') color = 'text-green-600 font-semibold';
            else if (val === 'A') color = 'text-red-500 font-semibold';
            return <div className={`text-center ${color}`}>{val as string}</div>;
        },
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'outtime',
        header: ({ column }) => (
            <div className='flex justify-center '>
                <DataTableColumnHeader column={column} title='Time Out' />{' '}
            </div>
        ),
        cell: ({ row }) => {
            const val = row.getValue('outtime');
            let color = '';
            if (val === null || val === '' || val === 'A' || val === '00:00')
                return <div className='text-center font-semibold text-red-500'>A</div>;
            if (val === 'H') color = 'text-green-600 font-semibold';
            else if (val === 'A') color = 'text-red-500 font-semibold';
            return <div className={`text-center ${color}`}>{val as string}</div>;
        },
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'workingtime',
        header: ({ column }) => (
            <div className='flex justify-center '>
                <DataTableColumnHeader column={column} title='Worked Hrs' />{' '}
            </div>
        ),
        cell: ({ row }) => {
            const val = row.getValue('workingtime');
            let color = '';
            if (val === null || val === '' || val === 'A' || val === '00:00')
                return <div className='text-center font-semibold text-red-500'>A</div>;
            if (val === 'H') color = 'text-green-600 font-semibold';
            else if (val === 'A') color = 'text-red-500 font-semibold';
            return <div className={`text-center ${color}`}>{val as string}</div>;
        },
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'lateby',
        header: ({ column }) => (
            <div className='flex justify-center '>
                <DataTableColumnHeader column={column} title='Late In' />{' '}
            </div>
        ),
        cell: ({ row }) => {
            const val = row.getValue('lateby');
            let color = '';
            if (val === null || val === '' || val === 'A' || val === '00:00')
                return <div className='text-center font-semibold text-red-500'>A</div>;
            if (val === 'H') color = 'text-green-600 font-semibold';
            else if (val === 'A') color = 'text-red-500 font-semibold';
            return <div className={`text-center ${color}`}>{val as string}</div>;
        },
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'earlyby',
        header: ({ column }) => (
            <div className='flex justify-center '>
                <DataTableColumnHeader column={column} title='Early Out' />{' '}
            </div>
        ),
        cell: ({ row }) => {
            const val = row.getValue('earlyby');
            let color = '';
            if (val === null || val === '' || val === 'A' || val === '00:00')
                return <div className='text-center font-semibold text-red-500'>A</div>;
            if (val === 'H') color = 'text-green-600 font-semibold';
            else if (val === 'A') color = 'text-red-500 font-semibold';
            return <div className={`text-center ${color}`}>{val as string}</div>;
        },
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'intemperature',
        header: ({ column }) => (
            <div className='flex justify-center '>
                <DataTableColumnHeader column={column} title='Temperature' />{' '}
            </div>
        ),
        cell: ({ row }) => {
            const val = row.getValue('intemperature');
            let color = '';
            if (val === null || val === '' || val === 'A' || val === '00:00')
                return <div className='text-center font-semibold text-red-500'>A</div>;
            if (val === 'H') color = 'text-green-600 font-semibold';
            else if (val === 'A') color = 'text-red-500 font-semibold';
            return <div className={`text-center ${color}`}>{val as string}</div>;
        },
        enableSorting: true,
        enableHiding: true
    }
];
