'use client';

import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import type { IPDAMasterHead } from '@/types/pda/master/master-head';
import type { ColumnDef } from '@tanstack/react-table';
import { useCallback } from 'react';

export const pdaMasterHeadColumns: ColumnDef<IPDAMasterHead>[] = [
    {
        accessorKey: 'pdamH_Id',
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
        accessorKey: 'pdamH_HeadName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='PDA Expenditure Head' />,
        cell: ({ row }) => <div>{row.getValue('pdamH_HeadName')}</div>
    },
    {
        accessorKey: 'pdamH_ActiveFlag',
        header: ({ column }) => <DataTableColumnHeader column={column} title='PDA Active Flag' />,
        cell: ({ row }) => <div>{row.getValue('pdamH_ActiveFlag') ? 'True' : 'False'}</div>
    },

    {
        id: 'actions',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Actions' className='text-start' />,
        cell: ({ row }) => <ActionButtonsCell rowData={row.original} />,
        enableSorting: false
    }
];

function ActionButtonsCell({ rowData }: { rowData: IPDAMasterHead }) {
    const { openEditForm, openToggleForm } = useFormContext<IPDAMasterHead>();

    const handleEdit = useCallback((data: IPDAMasterHead) => openEditForm(data), [openEditForm]);
    const handleToggle = useCallback((data: IPDAMasterHead) => openToggleForm(data), [openToggleForm]);

    return (
        <ActionButtons
            rowData={rowData}
            buttons={{ edit: true, toggle: true, delete: false }}
            toggleConditionKey='pdamH_ActiveFlag'
            onToggle={handleToggle}
            onEdit={handleEdit}
        />
    );
}
