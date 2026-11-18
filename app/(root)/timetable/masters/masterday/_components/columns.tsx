'use client';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import type { IMasterDayList } from '@/types/timetable/masters/masters';
import type { ColumnDef } from '@tanstack/react-table';
import { useCallback } from 'react';

export const masterDayColumns: ColumnDef<IMasterDayList>[] = [
    {
        accessorKey: 'ttmD_Id',
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
        accessorKey: 'ttmD_DayName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Day Name' className='font-bold text-black' />,
        cell: ({ row }) => <div>{row.getValue('ttmD_DayName')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'ttmD_DayCode',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Day Code' className='font-bold text-black' />,
        cell: ({ row }) => <div>{row.getValue('ttmD_DayCode')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'order_Id',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Order' className='font-bold text-black' />,
        cell: ({ row }) => <div>{row.getValue('order_Id')}</div>,
        enableSorting: true,
        enableHiding: true
    },

    {
        id: 'actions',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Actions' className='font-bold text-black' />,
        accessorFn: (row: any) => row,
        enableSorting: false,
        cell: ({ row }) => <ActionButtonsCell rowData={row.original} />
    }
];

function ActionButtonsCell({ rowData }: { rowData: IMasterDayList }) {
    const { openEditForm, openToggleForm } = useFormContext<IMasterDayList>();

    const handleEdit = useCallback(
        (data: IMasterDayList) => {
            openEditForm(data);
        },
        [openEditForm]
    );

    const handleToggle = useCallback(
        (data: IMasterDayList) => {
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
            toggleConditionKey='ttmD_ActiveFlag'
        />
    );
}
