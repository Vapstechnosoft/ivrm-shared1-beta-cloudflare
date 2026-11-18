'use client';

import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import { IClgMasterSection } from '@/types/college/masters';
import { type ColumnDef } from '@tanstack/react-table';
import { useCallback } from 'react';

export const masterSectionColumns: ColumnDef<IClgMasterSection>[] = [
    {
        id: 'slNo',
        header: () => <div className='text-center font-bold text-black'>Sl.No</div>,
        cell: ({ row }) => <div className='text-center'>{row.index + 1}</div>,
        enableSorting: false,
        size: 80
    },
    {
        accessorKey: 'acmS_SectionName',
        header: () => <div className='text-center font-bold text-black'>Section Name</div>,
        cell: ({ row }) => <div className='text-center font-medium'>{row.original.acmS_SectionName}</div>,
    },
    {
        accessorKey: 'acmS_MaxCapacity',
        header: () => <div className='text-center font-bold text-black'>Section Capacity</div>,
        cell: ({ row }) => <div className='text-center'>{row.original.acmS_MaxCapacity}</div>,
    },
    {
        accessorKey: 'acmS_SectionCode',
        header: () => <div className='text-center font-bold text-black'>Section Code</div>,
        cell: ({ row }) => <div className='text-center'>{row.original.acmS_SectionCode}</div>,
    },
    {
        accessorKey: 'acmS_Order',
        header: () => <div className='text-center font-bold text-black'>Section Order</div>,
        cell: ({ row }) => <div className='text-center'>{row.original.acmS_Order}</div>,
    },
    {
        id: 'actions',
        header: () => <div className='font-bold text-black '>Actions</div>,
        cell: ({ row }) => <ActionButtonsCell rowData={row.original} />,
        size: 100
    }
];

function ActionButtonsCell({ rowData }: { rowData: IClgMasterSection }) {
    const { openEditForm, openToggleForm } = useFormContext<IClgMasterSection>();

    const handleEdit = useCallback(
        (data: IClgMasterSection) => openEditForm(data),
        [openEditForm]
    );

    const handleToggle = useCallback(
        (data: IClgMasterSection) => openToggleForm(data),
        [openToggleForm]
    );

    return (
        <ActionButtons
            rowData={rowData}
            buttons={{ edit: true, toggle: true, delete: false }}
            onEdit={handleEdit}
            onToggle={handleToggle}
            toggleConditionKey='acmS_ActiveFlag'
        />
    );
}
