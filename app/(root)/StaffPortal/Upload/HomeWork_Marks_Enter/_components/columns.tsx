'use client';

import { Button } from '@/components/ui/button';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { useFormContext } from '@/components/ui/form/form-provider';
import type { IHomeWorkMarksList } from '@/schemas/upload/transactions/ivrm-homework.schema';
import type { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { Database, Pencil } from 'lucide-react';

/**
 * Columns for the Bottom Grid (Verified Records/HomeWork Details)
 */
export const verifiedRecordsColumns: ColumnDef<any>[] = [
    {
        id: 'slno',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title='SLNO' className='justify-center font-black text-black text-xs uppercase' />
        ),
        cell: ({ row, table }) => {
            const pageIndex = table.getState().pagination.pageIndex;
            const pageSize = table.getState().pagination.pageSize;
            return <div className='w-full text-center font-bold text-slate-700'>{pageIndex * pageSize + row.index + 1}</div>;
        },
        enableSorting: false
    },
    {
        accessorKey: 'studentname',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title='Student Name' className='justify-left font-black text-black text-xs uppercase' />
        ),
        cell: ({ row }) => <div className='font-bold text-[11px] text-slate-600 uppercase'>{row.getValue('studentname')}</div>
    },
    {
        accessorKey: 'ISMS_SubjectName',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title='Subject' className='justify-left font-black text-black text-xs uppercase' />
        ),
        cell: ({ row }) => <div className='font-medium text-[11px] text-slate-600'>{row.getValue('ISMS_SubjectName')}</div>
    },
    {
        accessorKey: 'IHW_Topic',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title='Topic' className='justify-left font-black text-black text-xs uppercase' />
        ),
        cell: ({ row }) => <div className='font-medium text-[11px] text-slate-600'>{row.getValue('IHW_Topic')}</div>
    },
    {
        accessorKey: 'UpdatedDate',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title='Date' className='justify-center font-black text-black text-xs uppercase' />
        ),
        cell: ({ row }) => {
            const date = row.getValue('UpdatedDate');
            return (
                <div className='text-center font-bold text-[11px] text-slate-600'>
                    {date ? format(new Date(date as string), 'dd-MM-yyyy') : '---'}
                </div>
            );
        }
    },
    {
        id: 'time',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title='Time' className='justify-center font-black text-black text-xs uppercase' />
        ),
        cell: ({ row }) => {
            const date = row.original.UpdatedDate;
            return (
                <div className='text-center font-medium text-[11px] text-slate-400'>{date ? format(new Date(date), 'HH:mm') : '---'}</div>
            );
        }
    },
    {
        accessorKey: 'IHW_Assignment',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title='Assignment' className='justify-left font-black text-black text-xs uppercase' />
        ),
        cell: ({ row }) => (
            <div className='max-w-[150px] truncate text-[11px] text-slate-500 italic' title={row.getValue('IHW_Assignment')}>
                {row.getValue('IHW_Assignment') || '---'}
            </div>
        )
    },
    {
        accessorKey: 'IHWUPL_Marks',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title='Marks' className='justify-center font-black text-black text-xs uppercase' />
        ),
        cell: ({ row }) => <div className='text-center font-black text-[11px] text-blue-600'>{row.getValue('IHWUPL_Marks') ?? '---'}</div>
    },
    {
        id: 'actions',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title='Action' className='justify-center font-black text-black text-xs uppercase' />
        ),
        cell: ({ row }) => <VerifiedActionCell rowData={row.original} />
    }
];

function VerifiedActionCell({ rowData }: { rowData: any }) {
    const { openDetailsView } = useFormContext<IHomeWorkMarksList>();

    return (
        <div className='flex justify-center'>
            <Button
                variant='ghost'
                size='icon'
                onClick={() => openDetailsView({ ihW_Id: rowData.IHW_Id, students: [rowData] })}
                className='text-blue-600 hover:bg-blue-50 hover:text-blue-700'
                title='Edit Mark'>
                <Pencil className='h-4 w-4' />
            </Button>
        </div>
    );
}

/**
 * Columns for Search Results Grid (HomeWork Update List)
 */
export const verifyGridColumns: ColumnDef<any>[] = [
    {
        id: 'slno',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title='SLNO' className='justify-center font-black text-black text-xs uppercase' />
        ),
        cell: ({ row }) => <div className='text-center font-bold text-slate-600'>{row.index + 1}</div>
    },
    {
        accessorKey: 'ismS_SubjectName',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title='Subject' className='justify-left font-black text-black text-xs uppercase' />
        ),
        cell: ({ row }) => <div className='font-bold text-[11px] text-slate-600 uppercase'>{row.getValue('ismS_SubjectName')}</div>
    },
    {
        accessorKey: 'ihW_Topic',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title='Topic' className='justify-left font-black text-black text-xs uppercase' />
        ),
        cell: ({ row }) => <div className='font-medium text-[11px] text-slate-600'>{row.getValue('ihW_Topic')}</div>
    },
    {
        accessorKey: 'ihW_Assignment',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title='Assignment' className='justify-left font-black text-black text-xs uppercase' />
        ),
        cell: ({ row }) => (
            <div className='max-w-[150px] truncate text-[11px] text-slate-500 italic'>{row.getValue('ihW_Assignment') || '---'}</div>
        )
    },
    {
        id: 'actions',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title='Action' className='justify-center font-black text-black text-xs uppercase' />
        ),
        cell: ({ row }) => <ActionButtonsCell rowData={row.original} />
    }
];

function ActionButtonsCell({ rowData }: { rowData: any }) {
    const { openDetailsView } = useFormContext<any>();

    return (
        <div className='flex justify-center'>
            <Button
                variant='ghost'
                size='icon'
                onClick={() => openDetailsView(rowData)}
                className='text-blue-600 hover:bg-blue-50'
                title='Enter Marks'>
                <Database className='h-4 w-4' />
            </Button>
        </div>
    );
}
