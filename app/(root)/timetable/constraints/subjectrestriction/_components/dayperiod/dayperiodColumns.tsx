'use client';

import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import type { SubjectRestrictionDayPeriodGridData } from '@/types/timetable/constraints/subjectRestrictions';
import type { ColumnDef } from '@tanstack/react-table';
import { useCallback } from 'react';

export type IDayPeriodList = SubjectRestrictionDayPeriodGridData;

export const dayPeriodColumns: ColumnDef<IDayPeriodList>[] = [
    {
        accessorKey: 'ttrdP_Id',
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
        accessorKey: 'ttmC_CategoryName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Category' className='font-bold text-black' />,
        cell: ({ row }) => <div>{row.getValue('ttmC_CategoryName')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'asmcL_ClassName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Class' className='font-bold text-black' />,
        cell: ({ row }) => <div>{row.getValue('asmcL_ClassName')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'asmC_SectionName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Section' className='font-bold text-black' />,
        cell: ({ row }) => <div>{row.getValue('asmC_SectionName')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'staffName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Staff' className='font-bold text-black' />,
        cell: ({ row }) => <div>{row.getValue('staffName')}</div>,
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
        accessorKey: 'ttmD_DayName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Day' className='font-bold text-black' />,
        cell: ({ row }) => <div>{row.getValue('ttmD_DayName')}</div>,
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
        id: 'actions',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Actions' className='font-bold text-black' />,
        accessorFn: (row) => row,
        enableSorting: false,
        cell: ({ row }) => <ActionButtonsCell rowData={row.original} />
    }
];

function ActionButtonsCell({ rowData }: { rowData: IDayPeriodList }) {
    const { openEditForm, openToggleForm } = useFormContext<IDayPeriodList>();

    const handleEdit = useCallback(
        (data: IDayPeriodList) => {
            openEditForm(data);
        },
        [openEditForm]
    );

    const handleToggle = useCallback(
        (data: IDayPeriodList) => {
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
            toggleConditionKey='ttrdP_ActiveFlag'
        />
    );
}
