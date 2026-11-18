'use client';
import { getStatusBadge } from '@/components/extras/helpers/helper';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import type { IMasterInstDocumentList } from '@/types/admission/AI/masterInstDocument';
import type { ColumnDef } from '@tanstack/react-table';
import { useCallback } from 'react';

export const masterInstDocumentColumns: ColumnDef<IMasterInstDocumentList>[] = [
    {
        accessorKey: 'aiD_Id',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Sl.No' className='w-full pl-6 font-bold text-black' />,
        cell: ({ row, table }) => {
            const pageIndex = table.getState().pagination.pageIndex;
            const pageSize = table.getState().pagination.pageSize;
            const continuousIndex = pageIndex * pageSize + row.index + 1;
            return <div className='w-full pl-6'>{continuousIndex}</div>;
        },
        enableSorting: true,
        enableHiding: false
    },
    {
        accessorKey: 'fileName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='File Name' className='font-bold text-black' />,
        cell: ({ row }) => <div>{row.getValue('fileName')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'documentType',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Document Name' className='font-bold text-black' />,
        cell: ({ row }) => <div>{row.getValue('documentType')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'description',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Description' className='font-bold text-black' />,
        cell: ({ row }) => <div>{row.getValue('description')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'activeFlag',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Status' className='font-bold text-black' />,
        cell: ({ row }) => <div>{getStatusBadge((row.getValue('activeFlag') as boolean) === true ? 'active' : 'inactive')}</div>,
        enableSorting: false,
        enableHiding: true
    },
    {
        id: 'actions',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Actions' className='text-start font-bold text-black' />,
        accessorFn: (row: any) => row,
        enableSorting: false,
        cell: ({ row }) => <ActionButtonsCell rowData={row.original} />
    }
];

function ActionButtonsCell({ rowData }: { rowData: IMasterInstDocumentList }) {
    const { openEditForm, openToggleForm, openDeleteForm } = useFormContext<IMasterInstDocumentList>();

    const handleEdit = useCallback(
        (data: IMasterInstDocumentList) => {
            openEditForm(data);
        },
        [openEditForm]
    );

    const handleToggle = useCallback(
        (data: IMasterInstDocumentList) => {
            openToggleForm(data);
        },
        [openToggleForm]
    );

    const handleDelete = useCallback(
        (data: IMasterInstDocumentList) => {
            openDeleteForm(data);
        },
        [openDeleteForm]
    );

    return (
        <ActionButtons
            rowData={rowData}
            buttons={{ edit: true, toggle: true, delete: true }}
            onEdit={handleEdit}
            onToggle={handleToggle}
            onDelete={handleDelete}
            toggleConditionKey='activeFlag'
        />
    );
}
