'use client';

import { IRegisterReportClg } from '@/types/college/reports';
import { type ColumnDef } from '@tanstack/react-table';

export const registerReportClgColumns: ColumnDef<IRegisterReportClg>[] = [
    {
        id: 'slNo',
        header: () => <div className='text-center font-bold'>SL.NO.</div>,
        cell: ({ row }) => <div className='text-center'>{row.index + 1}</div>,
        enableSorting: false,
        enableGlobalFilter: false,
        size: 80
    },
    {
        id: 'name',
        accessorFn: (row) => row.name || '',
        header: () => <div className='text-center font-bold'>Name</div>,
        cell: ({ row }) => <div className='text-center uppercase'>{row.original.name || ''}</div>,
        size: 200
    },
    {
        id: 'user_name',
        accessorFn: (row) => row.user_name || (row as any).user_Name || '',
        header: () => <div className='text-center font-bold'>User Name</div>,
        cell: ({ row }) => <div className='text-center'>{row.original.user_name || (row.original as any).user_Name || ''}</div>,
        size: 150
    },
    {
        id: 'email_id',
        accessorFn: (row) => row.email_id || row.email_Id || '',
        header: () => <div className='text-center font-bold'>EMAIL-ID</div>,
        cell: ({ row }) => <div className='text-center'>{row.original.email_id || row.original.email_Id || ''}</div>,
        size: 250
    },
    {
        id: 'mob_no',
        accessorFn: (row) => row.mob_no || row.mob_No || '',
        header: () => <div className='text-center font-bold'>Mobile Number</div>,
        cell: ({ row }) => <div className='text-center'>{row.original.mob_no || row.original.mob_No || ''}</div>,
        size: 150
    },
    {
        id: 'created_date',
        accessorFn: (row) => {
            const dateVal = row.created_date || row.created_Date;
            if (!dateVal) return '';
            return new Date(dateVal).toLocaleDateString('en-GB').replace(/\//g, '-');
        },
        header: () => <div className='text-center font-bold'>DATE</div>,
        cell: ({ row }) => {
            const dateVal = row.original.created_date || row.original.created_Date;
            if (!dateVal) return <div className='text-center'>-</div>;
            return <div className='text-center'>{new Date(dateVal).toLocaleDateString('en-GB').replace(/\//g, '-')}</div>;
        },
        size: 120
    }
];
