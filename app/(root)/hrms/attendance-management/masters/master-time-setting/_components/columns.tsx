'use client';

import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import type { IMasterTimeSetting } from '@/types/hrms/attendance-management/masters';
import type { ColumnDef } from '@tanstack/react-table';
import { useCallback } from 'react';

export const masterTimeSettingColumns: ColumnDef<IMasterTimeSetting>[] = [
    {
        id: 'sl',
        header: ({ column }) => <DataTableColumnHeader column={column} title='SL.NO' />,
        cell: ({ row, table }) => {
            const pageIndex = table.getState().pagination.pageIndex;
            const pageSize = table.getState().pagination.pageSize;
            const continuousIndex = pageIndex * pageSize + row.index + 1;
            return <div className='font-medium'>{continuousIndex}</div>;
        },
        enableSorting: false,
        enableHiding: false
    },
    {
        accessorKey: 'fomtS_IHalfLoginTime',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Morning Login' />,
        cell: ({ row }) => <div>{row.getValue('fomtS_IHalfLoginTime')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'fomtS_IhalfLogoutTime',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Morning Logout' />,
        cell: ({ row }) => <div>{row.getValue('fomtS_IhalfLogoutTime')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'fomtS_FDWHrMin',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Total Working Hours' />,
        cell: ({ row }) => <div>{row.getValue('fomtS_FDWHrMin')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'fomtS_IIHalfLoginTime',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Afternoon Login' />,
        cell: ({ row }) => <div>{row.getValue('fomtS_IIHalfLoginTime')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'fomtS_IIHalfLogoutTime',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Afternoon Logout' />,
        cell: ({ row }) => <div>{row.getValue('fomtS_IIHalfLogoutTime')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'fomtS_HDWHrMin',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Half Day Hours' />,
        cell: ({ row }) => <div>{row.getValue('fomtS_HDWHrMin')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'fomtS_FixTimings',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Min Time(Two Punching)' />,
        cell: ({ row }) => <div>{row.getValue('fomtS_FixTimings')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'fomtS_DelayPerShiftHrMin',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Daily Per Shift' />,
        cell: ({ row }) => <div>{row.getValue('fomtS_DelayPerShiftHrMin')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'fomtS_EarlyPerShiftHrMin',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Early Per Shift' />,
        cell: ({ row }) => <div>{row.getValue('fomtS_EarlyPerShiftHrMin')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'fomtS_LunchHoursDuration',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Lunch Hours' />,
        cell: ({ row }) => <div>{row.getValue('fomtS_LunchHoursDuration')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        id: 'actions',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Actions' className='text-start' />,
        accessorFn: (row: any) => row,
        enableSorting: false,
        cell: ({ row }) => <ActionButtonsCell rowData={row.original} />
    }
];

function ActionButtonsCell({ rowData }: { rowData: IMasterTimeSetting }) {
    const { openEditForm, openDeleteForm } = useFormContext<IMasterTimeSetting>();

    const handleEdit = useCallback(
        (data: IMasterTimeSetting) => {
            openEditForm(data);
        },
        [openEditForm]
    );

    const handleDelete = useCallback(
        (data: IMasterTimeSetting) => {
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
