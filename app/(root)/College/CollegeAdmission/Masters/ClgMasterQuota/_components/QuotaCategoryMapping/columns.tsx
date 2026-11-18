'use client';

import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import { IMasterQuotaCategoryMapping } from '@/types/college/masters';
import { type ColumnDef } from '@tanstack/react-table';
import { useCallback } from 'react';

export const quotaCategoryMappingColumns: ColumnDef<IMasterQuotaCategoryMapping>[] = [
    {
        id: 'slNo',
        header: () => <div className='text-center font-bold text-black'>Sl.No</div>,
        cell: ({ row }) => <div className='text-center'>{row.index + 1}</div>,
        enableSorting: false,
        size: 80
    },
    {
        accessorKey: 'acQ_QuotaName',
        header: () => <div className='text-center font-bold text-black'>Quota Name</div>,
        cell: ({ row }) => <div className='text-center font-medium'>{row.original.acQ_QuotaName}</div>,
    },
    {
        accessorKey: 'acqC_CategoryName',
        header: () => <div className='text-center font-bold text-black'>Quota Category</div>,
        cell: ({ row }) => <div className='text-center'>{row.original.acqC_CategoryName}</div>,
    },
    {
        id: 'actions',
        header: () => <div className='font-bold text-black text-left'>Actions</div>,
        cell: ({ row }) => <ActionButtonsCell rowData={row.original} />,
        size: 100
    }
];

function ActionButtonsCell({ rowData }: { rowData: IMasterQuotaCategoryMapping }) {
    const { openToggleForm } = useFormContext<IMasterQuotaCategoryMapping>();

    const handleToggle = useCallback(
        (data: IMasterQuotaCategoryMapping) => openToggleForm(data),
        [openToggleForm]
    );

    return (
        <ActionButtons
            rowData={rowData}
            buttons={{ edit: false, toggle: true, delete: false }} // Legacy code doesn't show edit for mapping
            onToggle={handleToggle}
            toggleConditionKey='acqcM_ActiveFlg'
        />
    );
}
