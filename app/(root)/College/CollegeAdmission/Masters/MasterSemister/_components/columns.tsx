'use client';

import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import { IClgMasterSemester } from '@/types/college/masters';
import { type ColumnDef } from '@tanstack/react-table';
import { useCallback } from 'react';

export const masterSemesterColumns: ColumnDef<IClgMasterSemester>[] = [
    {
        id: 'slNo',
        header: () => <div className='text-center font-bold text-black'>Sl.No</div>,
        cell: ({ row }) => <div className='text-center'>{row.index + 1}</div>,
        enableSorting: false,
        size: 80
    },
    {
        accessorKey: 'amsE_SEMName',
        header: () => <div className='text-center font-bold text-black'>Semester Name</div>,
        cell: ({ row }) => <div className='text-center font-medium'>{row.original.amsE_SEMName}</div>,
    },
    {
        accessorKey: 'amsE_SEMCode',
        header: () => <div className='text-center font-bold text-black'>Semester Code</div>,
        cell: ({ row }) => <div className='text-center'>{row.original.amsE_SEMCode}</div>,
    },
    {
        accessorKey: 'amsE_SEMOrder',
        header: () => <div className='text-center font-bold text-black'>Semester Order</div>,
        cell: ({ row }) => <div className='text-center'>{row.original.amsE_SEMOrder}</div>,
    },
    {
        accessorKey: 'amsE_SEMInfo',
        header: () => <div className='text-center font-bold text-black'>Semester Info</div>,
        cell: ({ row }) => <div className='text-center'>{row.original.amsE_SEMInfo}</div>,
    },
    {
        accessorKey: 'amsE_Year',
        header: () => <div className='text-center font-bold text-black'>Semester Year</div>,
        cell: ({ row }) => <div className='text-center'>{row.original.amsE_Year}</div>,
    },
    {
        accessorKey: 'amsE_SEMTypeFlag',
        header: () => <div className='text-center font-bold text-black'>Semester Type</div>,
        cell: ({ row }) => <div className='text-center'>{row.original.amsE_SEMTypeFlag}</div>,
    },
    {
        accessorKey: 'amsE_EvenOdd',
        header: () => <div className='text-center font-bold text-black'>Odd/Even</div>,
        cell: ({ row }) => <div className='text-center'>{row.original.amsE_EvenOdd}</div>,
    },
    {
        id: 'actions',
        header: () => <div className='font-bold text-black text-center'>Actions</div>,
        cell: ({ row }) => <div className='flex justify-center'><ActionButtonsCell rowData={row.original} /></div>,
        size: 100
    }
];

function ActionButtonsCell({ rowData }: { rowData: IClgMasterSemester }) {
    const { openEditForm, openToggleForm } = useFormContext<IClgMasterSemester>();

    const handleEdit = useCallback(
        (data: IClgMasterSemester) => openEditForm(data),
        [openEditForm]
    );

    const handleToggle = useCallback(
        (data: IClgMasterSemester) => openToggleForm(data),
        [openToggleForm]
    );

    return (
        <ActionButtons
            rowData={rowData}
            buttons={{ edit: true, toggle: true, delete: false }}
            onEdit={handleEdit}
            onToggle={handleToggle}
            toggleConditionKey='amsE_ActiveFlg'
        />
    );
}
