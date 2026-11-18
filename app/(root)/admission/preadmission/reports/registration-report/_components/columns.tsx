'use client';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import type { IRigistrationReportList } from '@/types/admission/preadmission/reports';
import type { ColumnDef } from '@tanstack/react-table';

import { format } from 'date-fns';

export const registrationColumns: ColumnDef<IRigistrationReportList>[] = [
    {
        id: 'sl_no',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Sl.No' className='w-full pl-6 font-bold text-black' />,
        cell: ({ row, table }) => {
            // Get the current page index and page size from the table state
            const pageIndex = table.getState().pagination.pageIndex;
            const pageSize = table.getState().pagination.pageSize;

            // Calculate the continuous index based on the current page and row index
            const continuousIndex = pageIndex * pageSize + row.index + 1;

            return <div className='w-full pl-6'>{continuousIndex}</div>;
        },
        enableSorting: false,
        enableHiding: false
    },
    {
        accessorKey: 'user_Name',
        header: ({ column }) => <DataTableColumnHeader column={column} title='User Name' className='font-bold text-black' />,
        cell: ({ row }) => <div>{row.getValue('user_Name')}</div>,
        enableSorting: true,
        enableHiding: true
    },

    {
        accessorKey: 'name',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Name' className='font-bold text-black' />,
        cell: ({ row }) => <div>{row.getValue('name')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'email_Id',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Email' className='font-bold text-black' />,
        cell: ({ row }) => <div>{row.getValue('email_Id')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'mob_No',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Mobile No' className='font-bold text-black' />,
        cell: ({ row }) => <div>{row.getValue('mob_No')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'created_Date',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Date' className='font-bold text-black' />,
        cell: ({ row }) => {
            const raw = row.getValue('created_Date');
            const dateStr = typeof raw === 'string' || typeof raw === 'number' ? raw : '';

            // Format the date if it's valid
            const formattedDate = dateStr ? format(new Date(dateStr), 'dd-MM-yyyy') : '';

            return <div>{formattedDate}</div>;
        },
        enableSorting: true,
        enableHiding: true
    }
];
