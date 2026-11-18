'use client';

import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import type { ICollegeFeeRefundableGrid } from '@/types/fees/college/transaction/clgfeerefundable';
import type { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { useCallback } from 'react';

export const collegeFeeRefundableColumns: ColumnDef<ICollegeFeeRefundableGrid>[] = [
    {
        accessorKey: 'sno',
        header: ({ column }) => <DataTableColumnHeader column={column} title='SLNO' className='pl-4' />,
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
        accessorKey: 'amcsT_FirstName',
        id: 'amcsT_FirstName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Student Name' />,
        cell: ({ row }) => {
            const first = row.original.amcsT_FirstName || row.original.AMCST_FirstName || '';
            const middle = row.original.amcsT_MiddleName || '';
            const last = row.original.amcsT_LastName || '';
            const fullName = [first, middle, last].filter(Boolean).join(' ') || 'N.A';
            return <div className='font-medium text-foreground'>{fullName}</div>;
        },
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'fmH_FeeName',
        id: 'fmH_FeeName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Head Name' />,
        cell: ({ row }) => <div className='font-medium text-foreground'>{row.original.fmH_FeeName || 'N.A'}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'fcR_RefundAmount',
        id: 'fcR_RefundAmount',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Refunded Amount' />,
        cell: ({ row }) => {
            const amount = row.original.fcR_RefundAmount ?? row.original.fR_RefundAmount ?? 0;
            return (
                <div className='font-semibold text-emerald-600 dark:text-emerald-400'>
                    &#8377; {Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
            );
        },
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'fcR_RefundNo',
        id: 'fcR_RefundNo',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Refund No' />,
        cell: ({ row }) => <div className='font-medium text-foreground'>{row.original.fcR_RefundNo || 'N.A'}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'fcR_Date',
        id: 'fcR_Date',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Date' />,
        cell: ({ row }) => {
            const rawDate = row.original.fcR_Date || row.original.fR_Date;
            if (!rawDate) return <div>N.A</div>;
            try {
                const dateObj = new Date(rawDate);
                if (Number.isNaN(dateObj.getTime())) return <div>{String(rawDate)}</div>;
                return <div>{format(dateObj, 'dd-MM-yyyy')}</div>;
            } catch {
                return <div>{String(rawDate)}</div>;
            }
        },
        enableSorting: true,
        enableHiding: true
    },
    {
        id: 'actions',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Action' className='text-center' />,
        cell: ({ row }) => <CollegeFeeRefundableActionButtonsCell rowData={row.original} />,
        enableSorting: false,
        enableHiding: false
    }
];

function CollegeFeeRefundableActionButtonsCell({ rowData }: { rowData: ICollegeFeeRefundableGrid }) {
    const { openDeleteForm } = useFormContext<ICollegeFeeRefundableGrid>();

    const handleDelete = useCallback((data: ICollegeFeeRefundableGrid) => openDeleteForm(data), [openDeleteForm]);

    return (
        <div className='flex justify-center'>
            <ActionButtons rowData={rowData} buttons={{ edit: false, toggle: false, delete: true }} onDelete={handleDelete} />
        </div>
    );
}
