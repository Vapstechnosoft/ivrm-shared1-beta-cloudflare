'use client';

import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import { IMasterQuota } from '@/types/college/masters';
import { type ColumnDef } from '@tanstack/react-table';
import { useCallback } from 'react';

export const masterQuotaColumns: ColumnDef<IMasterQuota>[] = [
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
        accessorKey: 'acQ_QuotaCode',
        header: () => <div className='text-center font-bold text-black'>Quota Code</div>,
        cell: ({ row }) => <div className='text-center'>{row.original.acQ_QuotaCode}</div>,
    },
    {
        accessorKey: 'acQ_QuotaInfo',
        header: () => <div className='text-center font-bold text-black'>Quota Info</div>,
        cell: ({ row }) => <div className='text-center'>{row.original.acQ_QuotaInfo}</div>,
    },
    {
        id: 'actions',
        header: () => <div className='font-bold text-black text-left'>Actions</div>,
        cell: ({ row }) => <ActionButtonsCell rowData={row.original} />,
        size: 100
    }
];

function ActionButtonsCell({ rowData }: { rowData: IMasterQuota }) {
    const { openEditForm, openToggleForm } = useFormContext<IMasterQuota>();

    const handleEdit = useCallback(
        (data: IMasterQuota) => openEditForm(data),
        [openEditForm]
    );

    const handleToggle = useCallback(
        (data: IMasterQuota) => openToggleForm(data),
        [openToggleForm]
    );

    return (
        <ActionButtons
            rowData={rowData}
            buttons={{ edit: true, toggle: true, delete: false }}
            onEdit={handleEdit}
            onToggle={handleToggle}
            toggleConditionKey='acQ_ActiveFlg'
        />
    );
}
