'use client';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import type { ColumnDef } from '@tanstack/react-table';
import { useCallback } from 'react';

export const getProductColumns = (onEdit: (data: any) => void): ColumnDef<any>[] => [
    {
        accessorKey: 'index',
        header: ({ column }) => <DataTableColumnHeader column={column} title='SL NO' />,
        cell: ({ row, table }) => table.getState().pagination.pageIndex * table.getState().pagination.pageSize + row.index + 1
    },
    {
        accessorKey: 'invmP_ProductName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Product Name' />
    },
    {
        accessorKey: 'invmP_ProductCode',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Product Code' />
    },
    {
        accessorKey: 'invmP_ProductPrice',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Product Price' />
    },
    {
        id: 'actions',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Action' className='text-center' />,
        cell: ({ row }) => <ProductActionButtons rowData={row.original} onEdit={onEdit} toggleConditionKey='invmP_ActiveFlg' />,
        enableSorting: false
    }
];

export const getProductQtyColumns = (onEdit: (data: any) => void): ColumnDef<any>[] => [
    {
        accessorKey: 'index',
        header: ({ column }) => <DataTableColumnHeader column={column} title='SL NO' />,
        cell: ({ row, table }) => table.getState().pagination.pageIndex * table.getState().pagination.pageSize + row.index + 1
    },
    {
        accessorKey: 'invmP_ProductName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Product Name' />
    },
    {
        accessorKey: 'invmI_ItemName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Item Name' />
    },
    {
        accessorKey: 'invmpI_ItemQty',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Quantity' />
    },
    {
        id: 'actions',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Action' className='text-center' />,
        cell: ({ row }) => <ProductActionButtons rowData={row.original} onEdit={onEdit} toggleConditionKey='invmpI_ActiveFlg' />,
        enableSorting: false
    }
];

function ProductActionButtons({
    rowData,
    onEdit,
    toggleConditionKey
}: { rowData: any; onEdit: (data: any) => void; toggleConditionKey: string }) {
    const { openToggleForm } = useFormContext<any>();

    const handleEdit = useCallback(() => {
        onEdit(rowData);
    }, [onEdit, rowData]);

    const handleToggle = useCallback(() => {
        openToggleForm(rowData);
    }, [openToggleForm, rowData]);

    return (
        <div className='flex justify-center gap-2'>
            <ActionButtons
                rowData={rowData}
                buttons={{ edit: true, toggle: true, delete: false }}
                onEdit={handleEdit}
                onToggle={handleToggle}
                toggleConditionKey={toggleConditionKey}
            />
        </div>
    );
}
