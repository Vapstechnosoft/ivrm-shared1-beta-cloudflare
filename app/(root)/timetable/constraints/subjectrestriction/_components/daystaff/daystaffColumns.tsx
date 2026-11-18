'use client';

import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import type { ColumnDef } from '@tanstack/react-table';
import { useCallback } from 'react';

export interface IDayStaffList {
    ttrdS_Id: number;
    asmaY_Year: string;
    ttmD_DayName: string;
    staffName: string;
    ttrdS_ActiveFlag: boolean;
}

export const dayStaffColumns: ColumnDef<IDayStaffList>[] = [
    {
        accessorKey: 'ttrdS_Id',
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
        accessorKey: 'staffName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Staff Name' className='font-bold text-black' />,
        cell: ({ row }) => <div>{row.getValue('staffName')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'ttrdS_ActiveFlag',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Active' className='font-bold text-black' />,
        cell: ({ row }) => (
            <div>
                {row.original.ttrdS_ActiveFlag ? (
                    <span className='rounded bg-green-100 px-2 py-1 font-semibold text-green-800 text-xs'>Active</span>
                ) : (
                    <span className='rounded bg-red-100 px-2 py-1 font-semibold text-red-800 text-xs'>Inactive</span>
                )}
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

function ActionButtonsCell({ rowData }: { rowData: IDayStaffList }) {
    const { openEditForm, openToggleForm } = useFormContext<IDayStaffList>();

    const handleEdit = useCallback(
        (data: IDayStaffList) => {
            openEditForm(data);
        },
        [openEditForm]
    );

    const handleToggle = useCallback(
        (data: IDayStaffList) => {
            if (openToggleForm) openToggleForm(data);
        },
        [openToggleForm]
    );

    return (
        <ActionButtons
            rowData={rowData}
            buttons={{ edit: true, toggle: true, delete: false }}
            onEdit={handleEdit}
            onToggle={handleToggle}
            toggleConditionKey='ttrdS_ActiveFlag'
        />
    );
}
