'use client';

import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import type { ColumnDef } from '@tanstack/react-table';
import { useCallback } from 'react';

export interface IDaySubjectList {
    ttrdsU_Id: number;
    asmaY_Year: string;
    ttmD_DayName: string;
    ismS_SubjectName: string;
    ttrdsU_ActiveFlag: boolean;
    ttrdsU_SUbSelcFlag: boolean;
    asmaY_Id: number;
}

export const daySubjectColumns: ColumnDef<IDaySubjectList>[] = [
    {
        accessorKey: 'ttrdsU_Id',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Sl.No' className='font-bold text-black' />,
        cell: ({ row, table }) => {
            const pageIndex = table.getState().pagination.pageIndex;
            const pageSize = table.getState().pagination.pageSize;
            const continuousIndex = pageIndex * pageSize + row.index + 1;
            return <div className='px-4 py-2'>{continuousIndex}</div>;
        },
        enableSorting: true,
        enableHiding: false
    },
    {
        accessorKey: 'asmaY_Year',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Academic Year' className='font-bold text-black' />,
        cell: ({ row }) => <div>{row.getValue('asmaY_Year')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'ttmD_DayName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Day' className='font-bold text-black' />,
        cell: ({ row }) => <div>{row.getValue('ttmD_DayName')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'ismS_SubjectName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Subject' className='font-bold text-black' />,
        cell: ({ row }) => <div>{row.getValue('ismS_SubjectName')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'ttrdsU_SUbSelcFlag',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Restriction Level' className='font-bold text-black' />,
        cell: ({ row }) => (
            <div className={`font-medium ${row.original.ttrdsU_SUbSelcFlag ? 'text-blue-600' : 'text-green-600'}`}>
                {row.original.ttrdsU_SUbSelcFlag ? 'Class-Section Wise' : 'General'}
            </div>
        ),
        enableSorting: true,
        enableHiding: true
    },
    {
        id: 'actions',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Actions' className='font-bold text-black' />,
        accessorFn: (row) => row,
        enableSorting: false,
        cell: ({ row }) => <ActionButtonsCell rowData={row.original} />
    }
];

function ActionButtonsCell({ rowData }: { rowData: IDaySubjectList }) {
    const { openEditForm, openToggleForm, openDeleteForm } = useFormContext<IDaySubjectList>();

    const handleEdit = useCallback(
        (data: IDaySubjectList) => {
            openEditForm(data);
        },
        [openEditForm]
    );

    const handleToggle = useCallback(
        (data: IDaySubjectList) => {
            if (openToggleForm) openToggleForm(data);
        },
        [openToggleForm]
    );

    const handleDelete = useCallback(
        (data: IDaySubjectList) => {
            if (openDeleteForm) openDeleteForm(data);
        },
        [openDeleteForm]
    );

    return (
        <ActionButtons
            rowData={rowData}
            buttons={{ edit: true, toggle: true, delete: false }}
            onEdit={handleEdit}
            onToggle={handleToggle}
            onDelete={handleDelete}
            toggleConditionKey='ttrdsU_ActiveFlag'
        />
    );
}
