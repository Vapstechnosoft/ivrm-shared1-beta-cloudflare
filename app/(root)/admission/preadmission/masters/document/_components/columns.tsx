'use client';
import { getStatusBadge } from '@/components/extras/helpers/helper';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import type { IMasterDocumentList } from '@/types/admission/preadmission/masters';
import type { ColumnDef } from '@tanstack/react-table';
import { useCallback } from 'react';

export const masterClassColumns: ColumnDef<IMasterDocumentList>[] = [
    {
        accessorKey: 'amsmD_Id',
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
        accessorKey: 'amsmD_DocumentName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Name' className='font-bold text-black' />,
        cell: ({ row }) => <div>{row.getValue('amsmD_DocumentName')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'amsmD_Description',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Description' className='font-bold text-black' />,
        cell: ({ row }) => <div>{row.getValue('amsmD_Description')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'amsmD_FLAG',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Mandatory' className='font-bold text-black' />,
        cell: ({ row }) => <div>{getStatusBadge((row.getValue('amsmD_FLAG') as boolean) === true ? 'yes' : 'no')}</div>,
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

function ActionButtonsCell({ rowData }: { rowData: IMasterDocumentList }) {
    const { openEditForm, openToggleForm, openDeleteForm } = useFormContext<IMasterDocumentList>();

    const handleEdit = useCallback(
        (data: IMasterDocumentList) => {
            openEditForm(data);
        },
        [openEditForm]
    );

    const handleToggle = useCallback(
        (data: IMasterDocumentList) => {
            openToggleForm(data);
        },
        [openToggleForm]
    );

    const handleDelete = useCallback(
        (data: IMasterDocumentList) => {
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
            toggleConditionKey='amsmD_ActiveFlag'
        />
    );
}
