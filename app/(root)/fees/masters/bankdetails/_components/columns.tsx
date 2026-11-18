'use client';

import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import type { IFeeBankDetailsList } from '@/types/fees/masters/masters';
import type { ColumnDef } from '@tanstack/react-table';
import { useCallback } from 'react';

export const bankDetailsColumns: ColumnDef<IFeeBankDetailsList>[] = [
    {
        accessorKey: 'fmbanK_Id',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Sl.No' className='pl-6' />,
        cell: ({ row, table }) => {
            const pageIndex = table.getState().pagination.pageIndex;
            const pageSize = table.getState().pagination.pageSize;
            const continuousIndex = pageIndex * pageSize + row.index + 1;
            return <div className='pl-6'>{continuousIndex}</div>;
        },
        enableSorting: true,
        enableHiding: false
    },
    {
        accessorKey: 'fmbanK_BankName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Bank Name' />,
        cell: ({ row }) => <div className='font-medium'>{row.getValue('fmbanK_BankName')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'fmbanK_BankDescription',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Bank Details' />,
        cell: ({ row }) => <div>{row.getValue('fmbanK_BankDescription')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        id: 'actions',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Actions' />,
        accessorFn: (row: any) => row,
        enableSorting: false,
        cell: ({ row }) => <ActionButtonsCell rowData={row.original} />
    }
];

function ActionButtonsCell({ rowData }: { rowData: IFeeBankDetailsList }) {
    const { openEditForm, openToggleForm } = useFormContext<IFeeBankDetailsList>();

    const handleEdit = useCallback(
        (data: IFeeBankDetailsList) => {
            openEditForm(data);
        },
        [openEditForm]
    );

    const handleToggle = useCallback(
        (data: IFeeBankDetailsList) => {
            openToggleForm(data);
        },
        [openToggleForm]
    );

    return (
        <ActionButtons
            rowData={rowData}
            buttons={{ edit: true, toggle: true, delete: false }}
            onEdit={handleEdit}
            onToggle={handleToggle}
            toggleConditionKey='fmbanK_ActiveFlg'
        />
    );
}
