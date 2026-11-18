'use client';

import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import { IMasterQuotaCategory } from '@/types/college/masters';
import { type ColumnDef } from '@tanstack/react-table';
import { useCallback } from 'react';

export const quotaCategoryColumns: ColumnDef<IMasterQuotaCategory>[] = [
    {
        id: 'slNo',
        header: () => <div className='text-center font-bold text-black'>Sl.No</div>,
        cell: ({ row }) => <div className='text-center'>{row.index + 1}</div>,
        enableSorting: false,
        size: 80
    },
    {
        accessorKey: 'acqC_CategoryName',
        header: () => <div className='text-center font-bold text-black'>Category Name</div>,
        cell: ({ row }) => <div className='text-center font-medium'>{row.original.acqC_CategoryName}</div>,
    },
    {
        accessorKey: 'acqC_CategoryCode',
        header: () => <div className='text-center font-bold text-black'>Category Code</div>,
        cell: ({ row }) => <div className='text-center'>{row.original.acqC_CategoryCode}</div>,
    },
    {
        accessorKey: 'acqC_CategoryInfo',
        header: () => <div className='text-center font-bold text-black'>Category Info</div>,
        cell: ({ row }) => <div className='text-center'>{row.original.acqC_CategoryInfo}</div>,
    },
    {
        id: 'actions',
        header: () => <div className='font-bold text-black text-left'>Actions</div>,
        cell: ({ row }) => <ActionButtonsCell rowData={row.original} />,
        size: 100
    }
];

function ActionButtonsCell({ rowData }: { rowData: IMasterQuotaCategory }) {
    const { openEditForm, openToggleForm } = useFormContext<IMasterQuotaCategory>();

    const handleEdit = useCallback(
        (data: IMasterQuotaCategory) => openEditForm(data),
        [openEditForm]
    );

    const handleToggle = useCallback(
        (data: IMasterQuotaCategory) => openToggleForm(data),
        [openToggleForm]
    );

    return (
        <ActionButtons
            rowData={rowData}
            buttons={{ edit: true, toggle: true, delete: false }}
            onEdit={handleEdit}
            onToggle={handleToggle}
            toggleConditionKey='acqC_ActiveFlg'
        />
    );
}
