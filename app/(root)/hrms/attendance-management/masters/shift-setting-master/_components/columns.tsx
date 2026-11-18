'use client';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import type { IMasterShiftSettingList } from '@/types/hrms/attendance-management/masters';
import type { ColumnDef } from '@tanstack/react-table';
import { useCallback } from 'react';

export const shiftSettingColumns: ColumnDef<IMasterShiftSettingList>[] = [
    {
        accessorKey: 'fomS_Id',
        size: 10,
        header: ({ column }) => <DataTableColumnHeader column={column} title='Sl.No' className='w-fit pl-6' />,
        cell: ({ row, table }) => {
            const pageIndex = table.getState().pagination.pageIndex;
            const pageSize = table.getState().pagination.pageSize;
            const continuousIndex = pageIndex * pageSize + row.index + 1;
            return <div className='w-fit pl-6'>{continuousIndex}</div>;
        },
        enableSorting: true,
        enableHiding: false
    },
    {
        accessorKey: 'fomS_ShiftName',
        header: ({ column }) => (
            <div className='w-fit'>
                <DataTableColumnHeader column={column} title='Shift Name' />
            </div>
        ),
        cell: ({ row }) => <div className='w-fit'>{row.getValue('fomS_ShiftName')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'fomsT_IHalfLoginTime',
        header: ({ column }) => (
            <div className='w-fit'>
                <DataTableColumnHeader column={column} title='Shift Start Time' />
            </div>
        ),
        cell: ({ row }) => <div className='w-fit'>{row.getValue('fomsT_IHalfLoginTime') || '-'}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'fomsT_IIHalfLogoutTime',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Shift End Time' />,
        cell: ({ row }) => <div>{row.getValue('fomsT_IIHalfLogoutTime') || '-'}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        id: 'actions',
        header: ({ column }) => (
            <div className='flex w-full justify-center'>
                <DataTableColumnHeader column={column} title='Actions' />
            </div>
        ),
        accessorFn: (row: any) => row,
        enableSorting: false,
        cell: ({ row }) => (
            <div className='flex w-full justify-center'>
                <ActionButtonsCell rowData={row.original} />
            </div>
        )
    }
];

function ActionButtonsCell({ rowData }: { rowData: IMasterShiftSettingList }) {
    const { openEditForm, openToggleForm, openDetailsView } = useFormContext<IMasterShiftSettingList>();

    const handleEdit = useCallback(
        (data: IMasterShiftSettingList) => {
            openEditForm(data);
        },
        [openEditForm]
    );

    const handleToggle = useCallback(
        (data: IMasterShiftSettingList) => {
            openToggleForm(data);
        },
        [openToggleForm]
    );

    const handleView = useCallback(
        (data: IMasterShiftSettingList) => {
            openDetailsView(data);
        },
        [openDetailsView]
    );

    return (
        <ActionButtons
            rowData={rowData}
            buttons={{ edit: true, toggle: true, delete: false, view: true }}
            onEdit={handleEdit}
            onToggle={handleToggle}
            onView={handleView}
            toggleConditionKey='fomS_ActiveFlg'
        />
    );
}
