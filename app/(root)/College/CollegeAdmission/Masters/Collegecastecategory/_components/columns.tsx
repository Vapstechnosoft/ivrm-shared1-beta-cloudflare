'use client';

import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import { ICollegeCasteCategory } from '@/types/college/masters';
import { type ColumnDef } from '@tanstack/react-table';
import { useCallback } from 'react';

export const collegeCasteCategoryColumns: ColumnDef<ICollegeCasteCategory>[] = [
    {
        id: 'slNo',
        header: () => <div className='text-center font-bold text-black'>SL.No</div>,
        cell: ({ row }) => <div className='text-center'>{row.index + 1}</div>,
        enableSorting: false,
        size: 80
    },
    {
        accessorKey: 'imcC_CategoryName',
        header: () => <div className='font-bold text-black'>Caste Category Name</div>,
        cell: ({ row }) => <div>{row.original.imcC_CategoryName}</div>,
        size: 200
    },
    {
        accessorKey: 'imcC_CategoryDesc',
        header: () => <div className='font-bold text-black'>Description</div>,
        cell: ({ row }) => <div>{row.original.imcC_CategoryDesc}</div>,
        size: 250
    },
    {
        id: 'actions',
        header: () => <div className='text-center font-bold text-black'>Action</div>,
        cell: ({ row }) => <div className='flex justify-center'><ActionButtonsCell rowData={row.original} /></div>,
        size: 100
    }
];

function ActionButtonsCell({ rowData }: { rowData: ICollegeCasteCategory }) {
    const { openEditForm, openDeleteForm } = useFormContext<ICollegeCasteCategory>();

    const handleEdit = useCallback(
        (data: ICollegeCasteCategory) => {
            openEditForm(data);
        },
        [openEditForm]
    );

    const handleDelete = useCallback(
        (data: ICollegeCasteCategory) => {
            openDeleteForm(data);
        },
        [openDeleteForm]
    );

    return (
        <ActionButtons
            rowData={rowData}
            buttons={{ edit: true, toggle: false, delete: true }}
            onEdit={handleEdit}
            onDelete={handleDelete}
        />
    );
}
