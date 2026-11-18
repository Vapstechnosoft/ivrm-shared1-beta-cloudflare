'use client';

import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import { IClgMasterCombination } from '@/types/college/masters';
import { type ColumnDef } from '@tanstack/react-table';
import { useCallback } from 'react';

export const combinationColumns: ColumnDef<IClgMasterCombination>[] = [
    {
        id: 'slNo',
        header: () => <div className='text-center font-bold text-black'>Sl.No</div>,
        cell: ({ row }) => <div className='text-center'>{row.index + 1}</div>,
        enableSorting: false,
        size: 80
    },
    {
        accessorKey: 'admcB_NAME',
        header: () => <div className='text-center font-bold text-black'>Combination Name</div>,
        cell: ({ row }) => <div className='text-left font-medium'>{row.original.admcB_NAME}</div>,
    },
    {
        id: 'actions',
        header: () => <div className='font-bold text-black text-center'>Actions</div>,
        cell: ({ row }) => <ActionButtonsCell rowData={row.original} />,
        size: 100
    }
];

function ActionButtonsCell({ rowData }: { rowData: IClgMasterCombination }) {
    const { openEditForm, openToggleForm } = useFormContext<IClgMasterCombination>();

    const handleEdit = useCallback(
        (data: IClgMasterCombination) => openEditForm(data),
        [openEditForm]
    );

    const handleToggle = useCallback(
        (data: IClgMasterCombination) => openToggleForm(data),
        [openToggleForm]
    );

    return (
        <ActionButtons
            rowData={rowData}
            buttons={{ edit: true, toggle: true, delete: false }}
            onEdit={handleEdit}
            onToggle={handleToggle}
            toggleConditionKey='admcB_Activeflag'
        />
    );
}
