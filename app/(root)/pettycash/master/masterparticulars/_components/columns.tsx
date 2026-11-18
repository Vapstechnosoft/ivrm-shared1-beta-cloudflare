'use client';

import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import type { IMasterParticulars } from '@/types/pettycash/master/masters';
import type { ColumnDef } from '@tanstack/react-table';
import { useCallback } from 'react';

export const masterParticularsColumns: ColumnDef<IMasterParticulars>[] = [
    {
        accessorKey: 'pcmparT_Id',
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
        accessorKey: 'pcmparT_ParticularName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Particular Name' />,
        cell: ({ row }) => <div>{row.getValue('pcmparT_ParticularName')}</div>
    },
    {
        accessorKey: 'pcmparT_ParticularDesc',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Particular Description' />,
        cell: ({ row }) => <div>{row.getValue('pcmparT_ParticularDesc')}</div>
    },

    {
        id: 'pcmparT_ActiveFlg',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Actions' className='text-start' />,
        cell: ({ row }) => <ActionButtonsCell rowData={row.original} />,
        enableSorting: false
    }
];

function ActionButtonsCell({ rowData }: { rowData: IMasterParticulars }) {
    const { openDeleteForm, openEditForm, openToggleForm } = useFormContext<IMasterParticulars>();

    const handleDelete = useCallback((data: IMasterParticulars) => openDeleteForm(data), [openDeleteForm]);
    const handleEdit = useCallback((data: IMasterParticulars) => openEditForm(data), [openEditForm]);
    const handleToggle = useCallback((data: IMasterParticulars) => openToggleForm(data), [openToggleForm]);

    return (
        <ActionButtons
            rowData={rowData}
            buttons={{ edit: true, toggle: true, delete: false }}
            toggleConditionKey='pcmparT_ActiveFlg'
            onDelete={handleDelete}
            onToggle={handleToggle}
            onEdit={handleEdit}
        />
    );
}
