'use client';

import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import type { ICollegeMasterCaste } from '@/types/college/masters';
import type { ColumnDef } from '@tanstack/react-table';
import { useCallback } from 'react';

export const collegeMasterCasteColumns: ColumnDef<ICollegeMasterCaste>[] = [
    {
        id: 'slNo',
        header: () => <div className='text-center font-bold text-black'>SL.No.</div>,
        cell: ({ row }) => <div className='text-center'>{row.index + 1}</div>,
        enableSorting: false,
        size: 80
    },
    {
        accessorKey: 'iC_CasteName',
        header: () => <div className='font-bold text-black'>Caste Name</div>,
        cell: ({ row }) => <div>{row.original.iC_CasteName || row.original.imC_CasteName}</div>,
        size: 200
    },
    {
        accessorKey: 'iC_CasteDesc',
        header: () => <div className='font-bold text-black'>Caste Description</div>,
        cell: ({ row }) => <div>{row.original.iC_CasteDesc || row.original.imC_CasteDesc}</div>,
        size: 250
    },
    {
        accessorKey: 'categoryName',
        header: () => <div className='font-bold text-black'>Caste Category</div>,
        cell: ({ row }) => <div>{row.original.categoryName || row.original.imcC_CategoryName}</div>,
        size: 200
    },
    {
        id: 'actions',
        header: () => <div className='text-center font-bold text-black'>Action</div>,
        cell: ({ row }) => (
            <div className='flex justify-center'>
                <ActionButtonsCell rowData={row.original} />
            </div>
        ),
        size: 100
    }
];

function ActionButtonsCell({ rowData }: { rowData: ICollegeMasterCaste }) {
    const { openEditForm, openDeleteForm } = useFormContext<ICollegeMasterCaste>();

    const handleEdit = useCallback(
        (data: ICollegeMasterCaste) => {
            openEditForm(data);
        },
        [openEditForm]
    );

    const handleDelete = useCallback(
        (data: ICollegeMasterCaste) => {
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
