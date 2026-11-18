'use client';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import type { IPeriodTimeSettingData } from '@/types/timetable/masters/masters';
import type { ColumnDef } from '@tanstack/react-table';
import { useCallback } from 'react';

export const periodTimeSettingColumns: ColumnDef<IPeriodTimeSettingData>[] = [
    {
        accessorKey: 'ttmdpT_Id',
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
        accessorKey: 'asmaY_Year',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Academic year' className='font-bold text-black' />,
        cell: ({ row }) => <div>{row.getValue('asmaY_Year')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'ttmC_CategoryName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Category name' className='font-bold text-black' />,
        cell: ({ row }) => <div>{row.getValue('ttmC_CategoryName')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'ttmP_PeriodName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Period' className='font-bold text-black' />,
        cell: ({ row }) => <div>{row.getValue('ttmP_PeriodName')}</div>,
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
        accessorKey: 'ttmdpT_StartTime',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Start Time' className='font-bold text-black' />,
        cell: ({ row }) => <div>{row.getValue('ttmdpT_StartTime')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'ttmdpT_EndTime',
        header: ({ column }) => <DataTableColumnHeader column={column} title='End Time' className='font-bold text-black' />,
        cell: ({ row }) => <div>{row.getValue('ttmdpT_EndTime')}</div>,
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

function ActionButtonsCell({ rowData }: { rowData: IPeriodTimeSettingData }) {
    const { openEditForm, openToggleForm } = useFormContext<IPeriodTimeSettingData>();

    const handleEdit = useCallback(
        (data: IPeriodTimeSettingData) => {
            openEditForm(data);
        },
        [openEditForm]
    );

    const handleToggle = useCallback(
        (data: IPeriodTimeSettingData) => {
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
            toggleConditionKey='ttmdpT_ActiveFlag'
        />
    );
}
