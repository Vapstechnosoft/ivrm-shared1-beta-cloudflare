'use client';

import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import { IClgMasterBatch } from '@/types/college/masters';
import { type ColumnDef } from '@tanstack/react-table';
import { useCallback } from 'react';

export const clgMasterBatchColumns: ColumnDef<IClgMasterBatch>[] = [
    {
        id: 'slNo',
        header: () => <div className='text-center font-bold text-black'>Sl.No</div>,
        cell: ({ row }) => <div className='text-center'>{row.index + 1}</div>,
        enableSorting: false,
        size: 80
    },
    {
        accessorKey: 'acmsN_SessionName',
        header: () => <div className='text-center font-bold text-black'>Batch Name</div>,
        cell: ({ row }) => <div className='text-center font-medium'>{row.original.acmsN_SessionName}</div>,
        size: 250
    },
    {
        accessorKey: 'acmnS_Order',
        header: () => <div className='text-center font-bold text-black'>Batch Order</div>,
        cell: ({ row }) => <div className='text-center'>{row.original.acmnS_Order}</div>,
        size: 130
    },
    {
        id: 'actions',
        header: () => <div className='font-bold text-black'>Actions</div>,
        cell: ({ row }) => <ActionButtonsCell rowData={row.original} />,
        size: 100
    }
];

function ActionButtonsCell({ rowData }: { rowData: IClgMasterBatch }) {
    const { openEditForm, openToggleForm } = useFormContext<IClgMasterBatch>();

    const handleEdit = useCallback(
        (data: IClgMasterBatch) => openEditForm(data),
        [openEditForm]
    );

    const handleToggle = useCallback(
        (data: IClgMasterBatch) => openToggleForm(data),
        [openToggleForm]
    );

    return (
        <ActionButtons
            rowData={rowData}
            buttons={{ edit: true, toggle: true, delete: false }}
            onEdit={handleEdit}
            onToggle={handleToggle}
            toggleConditionKey='acmsN_ActiveFlag'
        />
    );
}
