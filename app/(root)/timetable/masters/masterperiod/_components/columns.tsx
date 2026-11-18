'use client';

import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import type { IMasterPeriodDetailsList } from '@/types/timetable/masters/masters';
import type { ColumnDef } from '@tanstack/react-table';
import { useCallback } from 'react';

export const masterPeriodColumns: ColumnDef<IMasterPeriodDetailsList>[] = [
    {
        accessorKey: 'impcM_Id',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Sl.No' className='font-bold text-black' />,
        cell: ({ row, table }) => {
            const pageIndex = table.getState().pagination.pageIndex;
            const pageSize = table.getState().pagination.pageSize;
            const continuousIndex = pageIndex * pageSize + row.index + 1;
            return <div className='pl-6'>{continuousIndex}</div>;
        },
        enableSorting: true,
        enableHiding: false
    },
    {
        accessorKey: 'categoryName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Category Name' className='font-bold text-black' />,
        cell: ({ row }) => <div>{row.getValue('categoryName')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'imP_PeriodName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Period Name' className='font-bold text-black' />,
        cell: ({ row }) => <div>{row.getValue('imP_PeriodName')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'imP_PeriodOrder',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Period Order' className='font-bold text-black' />,
        cell: ({ row }) => <div>{row.getValue('imP_PeriodOrder')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'half',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Type' className='font-bold text-black' />,
        cell: ({ row }) => <div>{row.getValue('half')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        id: 'actions',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Actions' className='font-bold text-black' />,
        cell: ({ row }) => <ActionButtonsCell rowData={row.original} />
    }
];

function ActionButtonsCell({ rowData }: { rowData: IMasterPeriodDetailsList }) {
    const { openToggleForm, openDeleteForm, openEditForm } = useFormContext<IMasterPeriodDetailsList>();

    const handleToggle = useCallback(
        (data: IMasterPeriodDetailsList) => {
            openToggleForm(data);
        },
        [openToggleForm]
    );

    const handleDelete = useCallback(
        (data: IMasterPeriodDetailsList) => {
            openDeleteForm(data);
        },
        [openDeleteForm]
    );

    const handleEdit = useCallback(
        (data: IMasterPeriodDetailsList) => {
            openEditForm(data);
        },
        [openEditForm]
    );

    return (
        <ActionButtons
            rowData={rowData}
            buttons={{ toggle: false, delete: true, edit: true }}
            onToggle={handleToggle}
            onDelete={handleDelete}
            onEdit={handleEdit}
            toggleConditionKey='ttmP_ActiveFlag'
        />
    );
}
