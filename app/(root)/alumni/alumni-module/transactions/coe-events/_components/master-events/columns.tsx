'use client';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import type { IMasterEvent } from '@/types/alumni/master-coe';
import type { ColumnDef } from '@tanstack/react-table';
import { useCallback } from 'react';

export const MasterEventsColumns: ColumnDef<IMasterEvent>[] = [
    {
        accessorKey: 'sno',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title='Sl.No' className='justify-center text-center font-bold text-black' />
        ),
        cell: (info) => <div className='text-center'>{info.row.index + 1}</div>,
        enableSorting: false
    },
    {
        accessorKey: 'coemE_EventName',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title='Event Name' className='justify-center text-center font-bold text-black' />
        ),
        cell: (info) => <div className='text-center'>{info.getValue() as string}</div>,
        enableSorting: true
    },
    {
        accessorKey: 'coemE_EventDesc',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title='Description' className='justify-center text-center font-bold text-black' />
        ),
        cell: (info) => {
            const desc = info.getValue() as string | null;
            return <div className='mx-auto max-w-md truncate text-center'>{desc || '-'}</div>;
        }
    },
    {
        id: 'actions',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Actions' className='text-center font-bold text-black' />,
        accessorFn: (row: any) => row,
        enableSorting: false,
        cell: ({ row }) => <ActionButtonsCell rowData={row.original} />
    }
];

function ActionButtonsCell({ rowData }: { rowData: IMasterEvent }) {
    const { openEditForm, openToggleForm, openMappedview } = useFormContext<IMasterEvent>();

    const handleEdit = useCallback(
        (data: IMasterEvent) => {
            openEditForm(data);
        },
        [openEditForm]
    );

    const handleToggle = useCallback(
        (data: IMasterEvent) => {
            openToggleForm(data);
        },
        [openToggleForm]
    );

    const handleDelete = useCallback(
        (data: IMasterEvent) => {
            openToggleForm(data);
        },
        [openToggleForm]
    );

    const handleView = useCallback(
        (data: IMasterEvent) => {
            openMappedview(data);
        },
        [openMappedview]
    );

    return (
        <div className='flex justify-center'>
            <ActionButtons
                rowData={rowData}
                buttons={{ edit: true, toggle: true, delete: true, view: true }}
                onEdit={handleEdit}
                onToggle={handleToggle}
                onDelete={handleDelete}
                onView={handleView}
                toggleConditionKey='coemE_ActiveFlag'
            />
        </div>
    );
}
