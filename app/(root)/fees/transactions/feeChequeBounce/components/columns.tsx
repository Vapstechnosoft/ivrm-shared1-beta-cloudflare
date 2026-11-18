// app/fee-preadmission-transaction/_components/columns.tsx
'use client';

import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import type { ColumnDef } from '@tanstack/react-table';
import { useCallback } from 'react';

export const feeChequeBounceColumns: ColumnDef<any>[] = [
    {
        accessorKey: 'fcB_Id',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Sl. No' className='w-full pl-6' />,
        cell: ({ row, table }) => {
            const pageIndex = table.getState().pagination.pageIndex;
            const pageSize = table.getState().pagination.pageSize;
            return <div className='w-full pl-6'>{pageIndex * pageSize + row.index + 1}</div>;
        },
        enableSorting: false,
        enableHiding: false
    },
    {
        accessorKey: 'asmaY_Year',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Academic Year' />,
        cell: ({ row }) => <div>{row.getValue('asmaY_Year')}</div>
    },
    {
        accessorKey: 'fcB_DATE',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Date' />,
        cell: ({ row }) => (
            <div>
                {new Date(row.getValue('fcB_DATE')).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                })}
            </div>
        )
    },
    {
        accessorKey: 'aamsT_FirstName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Student Name' />,
        cell: ({ row }) => {
            const first = row.original.amsT_FirstName || '';
            const middle = row.original.amsT_MiddleName || '';
            const last = row.original.amsT_LastName || '';

            return <div>{`${first} ${middle} ${last}`.trim()}</div>;
        }
    },

    {
        accessorKey: 'fyP_Receipt_No',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Receipt No.' />,
        cell: ({ row }) => <div>{row.getValue('fyP_Receipt_No')}</div>
    },
    {
        id: 'actions',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Actions' className='text-center' />,
        accessorFn: (row: any) => row,
        enableSorting: false,
        cell: ({ row }) => <ActionButtonsCell rowData={row.original} />
    }
];

function ActionButtonsCell({ rowData }: { rowData: any }) {
    const { openEditForm, openDeleteForm } = useFormContext<any>();

    const handleEdit = useCallback((data: any) => openEditForm(data), [openEditForm]);

    const handleDelete = useCallback((data: any) => openDeleteForm(data), [openDeleteForm]);

    return (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
            <ActionButtons
                rowData={rowData}
                buttons={{ edit: false, toggle: false, delete: true }}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />
        </div>
    );
}
