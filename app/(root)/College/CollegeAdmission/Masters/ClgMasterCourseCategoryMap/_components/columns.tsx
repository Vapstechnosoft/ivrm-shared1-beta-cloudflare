'use client';

import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import { IClgMasterCourseCategoryMap } from '@/types/college/masters';
import { type ColumnDef } from '@tanstack/react-table';
import { useCallback } from 'react';

export const courseCategoryMapColumns: ColumnDef<IClgMasterCourseCategoryMap>[] = [
    {
        id: 'slNo',
        header: () => <div className='text-center text-black font-bold'>Sl.No</div>,
        cell: ({ row }) => <div className='text-center'>{row.index + 1}</div>,
        enableSorting: false,
        size: 80
    },
    {
        accessorKey: 'amcO_CourseName',
        header: () => <div className='text-center text-black font-bold'>Course Name</div>,
        cell: ({ row }) => <div className='text-center font-medium'>{row.original.amcO_CourseName}</div>,
        size: 200
    },
    {
        accessorKey: 'amcoC_Name',
        header: () => <div className='text-center text-black font-bold'>Category Name</div>,
        cell: ({ row }) => <div className='text-center'>{row.original.amcoC_Name}</div>,
        size: 200
    },
    {
        id: 'actions',
        header: () => <div className='text-center text-black font-bold'>Actions</div>,
        cell: ({ row }) => (
            <div className='flex justify-center'>
                <ActionButtonsCell rowData={row.original} />
            </div>
        ),
        size: 100
    }
];

function ActionButtonsCell({ rowData }: { rowData: IClgMasterCourseCategoryMap }) {
    const { openEditForm, openToggleForm } = useFormContext<IClgMasterCourseCategoryMap>();

    const handleEdit = useCallback(
        (data: IClgMasterCourseCategoryMap) => {
            openEditForm(data);
        },
        [openEditForm]
    );

    const handleToggle = useCallback(
        (data: IClgMasterCourseCategoryMap) => {
            openToggleForm(data);
        },
        [openToggleForm]
    );

    return (
        <ActionButtons
            rowData={rowData}
            buttons={{ edit: true, toggle: true, delete: false }}
            onEdit={handleEdit}
            onToggle={handleToggle}
            toggleConditionKey='amcocM_ActiveFlg'
        />
    );
}
