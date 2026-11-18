'use client';

import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import { IClgMasterBranch } from '@/types/college/masters';
import { type ColumnDef } from '@tanstack/react-table';
import { useCallback } from 'react';

export const clgMasterBranchColumns: ColumnDef<IClgMasterBranch>[] = [
    {
        id: 'slNo',
        header: () => <div className='text-center font-bold text-black'>Sl.No</div>,
        cell: ({ row }) => <div className='text-center'>{row.index + 1}</div>,
        enableSorting: false,
        size: 80
    },
    {
        accessorKey: 'amB_BranchName',
        header: () => <div className='text-center font-bold text-black'>Branch Name</div>,
        cell: ({ row }) => <div className='text-center font-medium'>{row.original.amB_BranchName}</div>,
    },
    {
        accessorKey: 'amB_BranchCode',
        header: () => <div className='text-center font-bold text-black'>Branch Code</div>,
        cell: ({ row }) => <div className='text-center'>{row.original.amB_BranchCode}</div>,
    },
    {
        accessorKey: 'amB_StudentCapacity',
        header: () => <div className='text-center font-bold text-black'>Capacity</div>,
        cell: ({ row }) => <div className='text-center'>{row.original.amB_StudentCapacity}</div>,
    },
    {
        accessorKey: 'amB_Order',
        header: () => <div className='text-center font-bold text-black'>Order</div>,
        cell: ({ row }) => <div className='text-center'>{row.original.amB_Order}</div>,
    },
    {
        accessorKey: 'amB_BranchType',
        header: () => <div className='text-center font-bold text-black'>Branch Type</div>,
        cell: ({ row }) => <div className='text-center'>{row.original.amB_BranchType}</div>,
    },
    {
        accessorKey: 'amB_BranchInfo',
        header: () => <div className='text-center font-bold text-black'>Branch Info</div>,
        cell: ({ row }) => <div className='text-center'>{row.original.amB_BranchInfo}</div>,
    },
    {
        accessorKey: 'amB_AidedUnAided',
        header: () => <div className='text-center font-bold text-black'>Aided/Unaided</div>,
        cell: ({ row }) => <div className='text-center'>{row.original.amB_AidedUnAided}</div>,
    },
    {
        id: 'actions',
        header: () => <div className='font-bold text-black text-center'>Actions</div>,
        cell: ({ row }) => <ActionButtonsCell rowData={row.original} />,
        size: 100
    }
];

function ActionButtonsCell({ rowData }: { rowData: IClgMasterBranch }) {
    const { openEditForm, openToggleForm } = useFormContext<IClgMasterBranch>();

    const handleEdit = useCallback(
        (data: IClgMasterBranch) => openEditForm(data),
        [openEditForm]
    );

    const handleToggle = useCallback(
        (data: IClgMasterBranch) => openToggleForm(data),
        [openToggleForm]
    );

    return (
        <ActionButtons
            rowData={rowData}
            buttons={{ edit: true, toggle: true, delete: false }}
            onEdit={handleEdit}
            onToggle={handleToggle}
            toggleConditionKey='amB_ActiveFlag'
        />
    );
}
