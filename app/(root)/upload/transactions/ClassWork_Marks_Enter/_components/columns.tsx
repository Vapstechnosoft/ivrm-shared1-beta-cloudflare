'use client';

import { Button } from '@/components/ui/button';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { useFormContext } from '@/components/ui/form/form-provider';
import type { IClassWorkMarksList } from '@/schemas/upload/transactions/ivrm-classwork.schema';
import { type ColumnDef, createColumnHelper } from '@tanstack/react-table';
import { format } from 'date-fns';
import { Database, Pencil } from 'lucide-react';

const columnHelper = createColumnHelper<any>();

/**
 * Columns for the Bottom Grid (Verified Classwork Details)
 */
export const verifiedRecordsColumns: ColumnDef<any>[] = [
    {
        id: 'slno',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title='SLNO' className='justify-center font-black text-black text-xs' />
        ),
        cell: ({ row, table }) => {
            const pageIndex = table.getState().pagination.pageIndex;
            const pageSize = table.getState().pagination.pageSize;
            return <div className='w-full text-center font-bold text-slate-700'>{pageIndex * pageSize + row.index + 1}</div>;
        },
        enableSorting: false
    },
    {
        accessorKey: 'ASMCL_ClassName',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title='Class' className='justify-left font-black text-black text-xs' />
        ),
        cell: ({ row }) => <div className='text-left font-bold text-[11px] text-slate-600 uppercase'>{row.getValue('ASMCL_ClassName')}</div>
    },
    {
        accessorKey: 'ASMC_SectionName',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title='Section' className='justify-left font-black text-black text-xs' />
        ),
        cell: ({ row }) => (
            <div className='text-left font-bold text-[11px] text-blue-600 text-slate-600 uppercase'>{row.getValue('ASMC_SectionName')}</div>
        )
    },
    {
        accessorKey: 'ISMS_SubjectName',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title='Subject' className='justify-left font-black text-black text-xs' />
        ),
        cell: ({ row }) => <div className='text-left font-medium text-[11px] text-slate-600'>{row.getValue('ISMS_SubjectName')}</div>
    },
    {
        accessorKey: 'ICW_Topic',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title='Topic' className='justify-left font-black text-black text-xs' />
        ),
        cell: ({ row }) => <div className='text-left font-medium text-[11px] text-slate-600'>{row.getValue('ICW_Topic')}</div>
    },
    {
        accessorKey: 'ICW_Content',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title='Content' className='justify-left font-black text-black text-xs' />
        ),
        cell: ({ row }) => (
            <div className='max-w-[200px] truncate text-left text-[11px] text-slate-600' title={row.getValue('ICW_Content') as string}>
                {row.getValue('ICW_Content')}
            </div>
        )
    },
    {
        accessorKey: 'FilesCount',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title='Files' className='justify-center font-black text-black text-xs' />
        ),
        cell: ({ row }) => <div className='text-center font-black text-[11px] text-emerald-600'>{row.getValue('FilesCount') ?? 0}</div>
    },
    {
        id: 'date',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title='Date' className='justify-center font-black text-black text-xs' />
        ),
        cell: ({ row }) => {
            const date = (row.original as any).ICW_FromDate || (row.original as any).CreatedDate;
            return (
                <div className='text-center font-bold text-[11px] text-slate-600'>
                    {date ? format(new Date(date as string), 'dd-MM-yyyy') : '---'}
                </div>
            );
        }
    },
    {
        id: 'actions',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title='Action' className='justify-center font-black text-black text-xs' />
        ),
        cell: ({ row }) => <VerifiedActionCell rowData={row.original} />
    }
];

function VerifiedActionCell({ rowData }: { rowData: any }) {
    const { openDetailsView } = useFormContext<IClassWorkMarksList>();

    return (
        <div className='flex justify-center'>
            <Button
                variant='ghost'
                size='icon'
                onClick={() => openDetailsView({ icW_Id: rowData.ICW_Id, students: [rowData] } as any)}
                className='text-blue-600 hover:bg-blue-50 hover:text-blue-700'
                title='Edit Mark'>
                <Pencil className='h-4 w-4' />
            </Button>
        </div>
    );
}

/**
 * Columns for Search Results (classworklst)
 */
export const verifyGridColumns: ColumnDef<any>[] = [
    {
        id: 'slno',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title='SLNO' className='justify-center font-black text-black text-xs uppercase' />
        ),
        cell: ({ row }) => <div className='text-center'>{row.index + 1}</div>
    },
    {
        accessorKey: 'ismS_SubjectName',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title='Subject' className='justify-left font-black text-black text-xs uppercase' />
        )
    },
    {
        accessorKey: 'icW_Topic',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title='Topic' className='justify-left font-black text-black text-xs uppercase' />
        )
    },
    {
        accessorKey: 'asmcL_ClassName',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title='Class' className='justify-center font-black text-black text-xs uppercase' />
        )
    },
    {
        accessorKey: 'asmC_SectionName',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title='Section' className='justify-center font-black text-black text-xs uppercase' />
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
            <Button variant='ghost' size='icon' onClick={() => openDetailsView(rowData)} title='Enter Marks' className='hover:text-primary'>
                <Database className='h-4 w-4' />
            </Button>
        </div>
    );
}
