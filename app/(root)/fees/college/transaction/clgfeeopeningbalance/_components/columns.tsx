'use client';

import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import type { ICollegeFeeOpeningBalanceGrid } from '@/types/fees/college/transaction/clgfeeopeningbalance';
import type { ColumnDef } from '@tanstack/react-table';
import { useCallback } from 'react';

export const clgFeeOpeningBalanceColumns: ColumnDef<ICollegeFeeOpeningBalanceGrid>[] = [
    {
        accessorKey: 'sno',
        header: ({ column }) => <DataTableColumnHeader column={column} title='SL NO' className='pl-4' />,
        cell: ({ row, table }) => {
            const pageIndex = table.getState().pagination.pageIndex;
            const pageSize = table.getState().pagination.pageSize;
            const continuousIndex = pageIndex * pageSize + row.index + 1;
            return <div className='pl-4 font-medium text-muted-foreground'>{continuousIndex}</div>;
        },
        enableSorting: false,
        enableHiding: false
    },
    {
        accessorKey: 'asmaY_Year',
        id: 'asmaY_Year',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Academic Year' />,
        cell: ({ row }) => <div className='font-medium text-foreground'>{row.original.asmaY_Year || 'N.A'}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'amcsT_FirstName',
        id: 'amcsT_FirstName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Student Name' />,
        cell: ({ row }) => {
            const first = row.original.amcsT_FirstName || '';
            const middle = row.original.amcsT_MiddleName || '';
            const last = row.original.amcsT_LastName || '';
            const fullName = [first, middle, last].filter(Boolean).join(' ') || 'N.A';
            return <div className='font-medium text-foreground'>{fullName}</div>;
        },
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'fmG_GroupName',
        id: 'fmG_GroupName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Fee Group' />,
        cell: ({ row }) => <div className='font-medium text-foreground'>{row.original.fmG_GroupName || 'N.A'}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'fmH_FeeName',
        id: 'fmH_FeeName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Fee Head' />,
        cell: ({ row }) => <div className='font-medium text-foreground'>{row.original.fmH_FeeName || 'N.A'}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'ftI_Name',
        id: 'ftI_Name',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Installment' />,
        cell: ({ row }) => <div className='font-medium text-foreground'>{row.original.ftI_Name || 'N.A'}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'fcmoB_Student_Due',
        id: 'fcmoB_Student_Due',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Student Due' />,
        cell: ({ row }) => {
            const due = row.original.fcmoB_Student_Due ?? 0;
            return (
                <div className='font-semibold text-emerald-600 dark:text-emerald-400'>
                    &#8377; {Number(due).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
            );
        },
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'fcmoB_Institution_Due',
        id: 'fcmoB_Institution_Due',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Institution Due' />,
        cell: ({ row }) => {
            const due = row.original.fcmoB_Institution_Due ?? 0;
            return (
                <div className='font-semibold text-amber-600 dark:text-amber-400'>
                    &#8377; {Number(due).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
            );
        },
        enableSorting: true,
        enableHiding: true
    },
    {
        id: 'actions',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Action' className='text-center' />,
        cell: ({ row }) => <CollegeFeeOpeningBalanceActionButtonsCell rowData={row.original} />,
        enableSorting: false,
        enableHiding: false
    }
];

function CollegeFeeOpeningBalanceActionButtonsCell({ rowData }: { rowData: ICollegeFeeOpeningBalanceGrid }) {
    const { openDeleteForm } = useFormContext<ICollegeFeeOpeningBalanceGrid>();

    const handleDelete = useCallback((data: ICollegeFeeOpeningBalanceGrid) => openDeleteForm(data), [openDeleteForm]);

    return (
        <div className='flex justify-center'>
            <ActionButtons rowData={rowData} buttons={{ edit: false, toggle: false, delete: true }} onDelete={handleDelete} />
        </div>
    );
}
