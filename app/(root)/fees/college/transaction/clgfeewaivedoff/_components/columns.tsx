'use client';

import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import type { ICollegeFeeWaivedOffGrid } from '@/types/fees/college/transaction/clgfeewaivedoff';
import type { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { useCallback } from 'react';

export const collegeFeeWaivedOffColumns: ColumnDef<ICollegeFeeWaivedOffGrid>[] = [
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
        cell: ({ row }) => (
            <div className='font-medium text-foreground'>
                {row.original.amcsT_FirstName || row.original.AMCST_FirstName || row.original.studentName || 'N.A'}
            </div>
        ),
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'fmH_FeeName',
        id: 'fmH_FeeName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Fee Name' />,
        cell: ({ row }) => <div>{row.original.fmH_FeeName || row.original.FMH_FeeName || row.original.feeName || 'N.A'}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'ftI_Name',
        id: 'ftI_Name',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Installment' />,
        cell: ({ row }) => {
            const installment = row.original.ftI_Name || row.original.FTI_Name || row.original.installmentName || 'N.A';
            return (
                <div className='inline-flex items-center rounded-md bg-secondary/60 px-2.5 py-0.5 font-medium text-secondary-foreground text-xs'>
                    {installment}
                </div>
            );
        },
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'fcswO_WaivedOffAmount',
        id: 'fcswO_WaivedOffAmount',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Amount' />,
        cell: ({ row }) => {
            const amount = row.original.fcswO_WaivedOffAmount ?? row.original.FCSWO_WaivedOffAmount ?? 0;
            return (
                <div className='font-semibold text-emerald-600 dark:text-emerald-400'>
                    ₹ {Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
            );
        },
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'fcswO_Date',
        id: 'fcswO_Date',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Date' />,
        cell: ({ row }) => {
            const rawDate = row.original.fcswO_Date || row.original.FCSWO_Date;
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
        cell: ({ row }) => <CollegeFeeWaivedOffActionButtonsCell rowData={row.original} />,
        enableSorting: false,
        enableHiding: false
    }
];

function CollegeFeeWaivedOffActionButtonsCell({ rowData }: { rowData: ICollegeFeeWaivedOffGrid }) {
    const { openEditForm, openDeleteForm } = useFormContext<ICollegeFeeWaivedOffGrid>();

    const handleEdit = useCallback(() => openEditForm(rowData), [openEditForm, rowData]);
    const handleDelete = useCallback((data: ICollegeFeeWaivedOffGrid) => openDeleteForm(data), [openDeleteForm]);

    return (
        <div className='flex justify-center'>
            <ActionButtons
                rowData={rowData}
                buttons={{ edit: true, toggle: false, delete: true }}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />
        </div>
    );
}
