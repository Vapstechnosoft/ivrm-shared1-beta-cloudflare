'use client';

import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import { IClgMasterCategory } from '@/types/college/masters';
import { type ColumnDef } from '@tanstack/react-table';
import { useCallback } from 'react';

export const getColumns = (): ColumnDef<IClgMasterCategory>[] => [
    {
        id: 'slNo',
        header: () => <div className='text-center font-bold text-black'>Sl.No</div>,
        cell: ({ row }) => <div className='text-center'>{row.index + 1}</div>,
        enableSorting: false,
        size: 80
    },
    {
        accessorKey: 'amcoC_Name',
        header: () => <div className='text-center font-bold text-black'>Category Name</div>,
        cell: ({ row }) => <div className='text-left font-medium'>{row.original.amcoC_Name}</div>,
    },
    {
        accessorKey: 'amcoC_Address',
        header: () => <div className='text-center font-bold text-black'>Address</div>,
        cell: ({ row }) => <div className='text-left'>{row.original.amcoC_Address}</div>,
    },
    {
        accessorKey: 'amcoC_Details',
        header: () => <div className='text-center font-bold text-black'>Details</div>,
        cell: ({ row }) => <div className='text-left'>{row.original.amcoC_Details}</div>,
    },
    {
        accessorKey: 'amcoC_Type',
        header: () => <div className='text-center font-bold text-black'>Type</div>,
        cell: ({ row }) => <div className='text-left'>{row.original.amcoC_Type}</div>,
    },
    {
        id: 'actions',
        header: () => <div className='font-bold text-black text-center'>Actions</div>,
        cell: ({ row }) => <ActionButtonsCell rowData={row.original} />,
        size: 100
    }
];

function ActionButtonsCell({ rowData }: { rowData: IClgMasterCategory }) {
    const { openEditForm, openToggleForm } = useFormContext<IClgMasterCategory>();

    const handleEdit = useCallback(
        (data: IClgMasterCategory) => openEditForm(data),
        [openEditForm]
    );

    const handleToggle = useCallback(
        (data: IClgMasterCategory) => openToggleForm(data),
        [openToggleForm]
    );

    return (
        <ActionButtons
            rowData={rowData}
            buttons={{ edit: true, toggle: true, delete: false }}
            onEdit={handleEdit}
            onToggle={handleToggle}
            toggleConditionKey='acmC_ActiveFlag'
        />
    );
}
