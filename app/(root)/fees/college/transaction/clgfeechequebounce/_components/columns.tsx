'use client';

import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import type { ICollegeFeeChequeBounceGrid } from '@/types/fees/college/transaction/clgfeechequebounce';
import type { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { useCallback } from 'react';

export const clgFeeChequeBounceColumns: ColumnDef<ICollegeFeeChequeBounceGrid>[] = [
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
        accessorKey: 'fccB_Date',
        id: 'fccB_Date',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Date' />,
        cell: ({ row }) => {
            const rawDate = row.original.fccB_Date;
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
        accessorKey: 'amcsT_FirstName',
        id: 'amcsT_FirstName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Student Name' />,
        cell: ({ row }) => <div className='font-medium text-foreground'>{row.original.amcsT_FirstName || 'N.A'}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'fyP_ReceiptNo',
        id: 'fyP_ReceiptNo',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Receipt No' />,
        cell: ({ row }) => <div className='font-medium text-foreground'>{row.original.fyP_ReceiptNo || 'N.A'}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'fccB_Amount',
        id: 'fccB_Amount',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Amount' />,
        cell: ({ row }) => {
            const amount = row.original.fccB_Amount ?? 0;
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
        id: 'actions',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Action' className='text-center' />,
        cell: ({ row }) => <CollegeFeeChequeBounceActionButtonsCell rowData={row.original} />,
        enableSorting: false,
        enableHiding: false
    }
];

function CollegeFeeChequeBounceActionButtonsCell({ rowData }: { rowData: ICollegeFeeChequeBounceGrid }) {
    const { openDeleteForm } = useFormContext<ICollegeFeeChequeBounceGrid>();

    const handleDelete = useCallback((data: ICollegeFeeChequeBounceGrid) => openDeleteForm(data), [openDeleteForm]);

    return (
        <div className='flex justify-center'>
            <ActionButtons rowData={rowData} buttons={{ edit: false, toggle: false, delete: true }} onDelete={handleDelete} />
        </div>
    );
}
