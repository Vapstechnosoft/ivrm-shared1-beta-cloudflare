'use client';

import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import { IClgSubjectSchemeName } from '@/types/college/masters';
import { type ColumnDef } from '@tanstack/react-table';
import { useCallback } from 'react';

export const schemeNameColumns: ColumnDef<IClgSubjectSchemeName>[] = [
    {
        id: 'slNo',
        header: () => <div className='text-center font-bold text-black'>Sl.No</div>,
        cell: ({ row }) => <div className='text-center'>{row.index + 1}</div>,
        enableSorting: false,
        size: 80
    },
    {
        accessorKey: 'acsS_SchmeName',
        header: () => <div className='text-center font-bold text-black'>Scheme Name</div>,
        cell: ({ row }) => <div className='text-left font-medium'>{row.original.acsS_SchmeName}</div>,
    },
    {
        id: 'actions',
        header: () => <div className='font-bold text-black text-center'>Actions</div>,
        cell: ({ row }) => <ActionButtonsCell rowData={row.original} />,
        size: 100
    }
];

function ActionButtonsCell({ rowData }: { rowData: IClgSubjectSchemeName }) {
    const { openEditForm, openToggleForm } = useFormContext<IClgSubjectSchemeName>();

    const handleEdit = useCallback(
        (data: IClgSubjectSchemeName) => openEditForm(data),
        [openEditForm]
    );

    const handleToggle = useCallback(
        (data: IClgSubjectSchemeName) => openToggleForm(data),
        [openToggleForm]
    );

    return (
        <ActionButtons
            rowData={rowData}
            buttons={{ edit: true, toggle: true, delete: false }}
            onEdit={handleEdit}
            onToggle={handleToggle}
            toggleConditionKey='acsT_ActiveFlg' // the legacy code binds acsT_ActiveFlg to the name too
        />
    );
}
