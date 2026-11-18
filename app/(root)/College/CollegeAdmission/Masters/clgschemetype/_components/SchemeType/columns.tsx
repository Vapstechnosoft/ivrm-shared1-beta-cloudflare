'use client';

import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import { IClgSubjectSchemeType } from '@/types/college/masters';
import { type ColumnDef } from '@tanstack/react-table';
import { useCallback } from 'react';

export const schemeTypeColumns: ColumnDef<IClgSubjectSchemeType>[] = [
    {
        id: 'slNo',
        header: () => <div className='text-center font-bold text-black'>Sl.No</div>,
        cell: ({ row }) => <div className='text-center'>{row.index + 1}</div>,
        enableSorting: false,
        size: 80
    },
    {
        accessorKey: 'acsT_SchmeType',
        header: () => <div className='text-center font-bold text-black'>Scheme Type</div>,
        cell: ({ row }) => <div className='text-left font-medium'>{row.original.acsT_SchmeType}</div>,
    },
    {
        id: 'actions',
        header: () => <div className='font-bold text-black text-center'>Actions</div>,
        cell: ({ row }) => <ActionButtonsCell rowData={row.original} />,
        size: 100
    }
];

function ActionButtonsCell({ rowData }: { rowData: IClgSubjectSchemeType }) {
    const { openEditForm, openToggleForm } = useFormContext<IClgSubjectSchemeType>();

    const handleEdit = useCallback(
        (data: IClgSubjectSchemeType) => openEditForm(data),
        [openEditForm]
    );

    const handleToggle = useCallback(
        (data: IClgSubjectSchemeType) => openToggleForm(data),
        [openToggleForm]
    );

    return (
        <ActionButtons
            rowData={rowData}
            buttons={{ edit: true, toggle: true, delete: false }}
            onEdit={handleEdit}
            onToggle={handleToggle}
            toggleConditionKey='acsT_ActiveFlg'
        />
    );
}
