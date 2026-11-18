'use client';

import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import { IClgMasterCourseBranchMap } from '@/types/college/masters';
import { type ColumnDef } from '@tanstack/react-table';
import { useCallback } from 'react';
import ViewSemesterDialog from './view-semester-dialog';

export const courseBranchMapColumns: ColumnDef<IClgMasterCourseBranchMap>[] = [
    {
        id: 'slNo',
        header: () => <div className='text-center font-bold text-black'>Sl.No</div>,
        cell: ({ row }) => <div className='text-center'>{row.index + 1}</div>,
        enableSorting: false,
        size: 70
    },
    {
        accessorKey: 'amcO_CourseName',
        header: () => <div className='text-center font-bold text-black'>Course Name</div>,
        cell: ({ row }) => <div className='text-center font-medium'>{row.original.amcO_CourseName}</div>,
        size: 200
    },
    {
        accessorKey: 'amB_BranchName',
        header: () => <div className='text-center font-bold text-black'>Branch Name</div>,
        cell: ({ row }) => <div className='text-center'>{row.original.amB_BranchName}</div>,
        size: 200
    },
    {
        accessorKey: 'amcobM_Code',
        header: () => <div className='text-center font-bold text-black'>Course-Branch Code</div>,
        cell: ({ row }) => <div className='text-center'>{row.original.amcobM_Code || '-'}</div>,
        size: 160
    },
    {
        id: 'actions',
        header: () => <div className='text-center font-bold text-black'>Actions</div>,
        cell: ({ row }) => <div className='text-center'><ActionButtonsCell rowData={row.original} /></div>,
        size: 100
    }
];

function ActionButtonsCell({ rowData }: { rowData: IClgMasterCourseBranchMap }) {
    const { openEditForm, openToggleForm } = useFormContext<IClgMasterCourseBranchMap>();

    const handleEdit = useCallback(
        (data: IClgMasterCourseBranchMap) => openEditForm(data),
        [openEditForm]
    );

    // const handleToggle = useCallback(
    //     (data: IClgMasterCourseBranchMap) => openToggleForm(data),
    //     [openToggleForm]
    // );

    return (
        <div className='flex items-center justify-center gap-1'>
            <ActionButtons
                rowData={rowData}
                buttons={{ edit: true, toggle: false, delete: false }}
                onEdit={handleEdit}
            //onToggle={handleToggle}
            //toggleConditionKey='amcobM_ActiveFlg'
            />
            <ViewSemesterDialog rowData={rowData} />
        </div>
    );
}
