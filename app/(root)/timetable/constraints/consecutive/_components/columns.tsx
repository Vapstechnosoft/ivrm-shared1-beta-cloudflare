'use client';

import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import type { IConsecutiveConstraintDetails } from '@/types/timetable/constraints/bifurcationconstraints';

import type { ColumnDef } from '@tanstack/react-table';
import { useCallback } from 'react';

export const columns: ColumnDef<IConsecutiveConstraintDetails>[] = [
    {
        id: 'slno',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Sl.No' className='pl-6' />,
        cell: ({ row, table }) => {
            const pageIndex = table.getState().pagination.pageIndex;
            const pageSize = table.getState().pagination.pageSize;
            return <div className='pl-6'>{pageIndex * pageSize + row.index + 1}</div>;
        },
        size: 50
    },
    {
        accessorKey: 'asmayYear',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Academic Year' />
    },
    {
        accessorKey: 'categoryName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Category' />
    },
    {
        accessorKey: 'className',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Class' />
    },
    {
        accessorKey: 'sectionName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Section' />
    },
    {
        accessorKey: 'staffName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Staff' />
    },
    {
        accessorKey: 'subjectName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Subject' />
    },
    {
        accessorKey: 'noOfPeriods',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Total Periods' />
    },
    {
        id: 'actions',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Actions' />,
        cell: ({ row }) => <ActionButtonsCell rowData={row.original} />
    }
];

function ActionButtonsCell({ rowData }: { rowData: IConsecutiveConstraintDetails }) {
    const { openEditForm, openToggleForm } = useFormContext<IConsecutiveConstraintDetails>();

    const handleEdit = useCallback(
        (data: IConsecutiveConstraintDetails) => {
            openEditForm(data);
        },
        [openEditForm]
    );

    const handleToggle = useCallback(
        (data: IConsecutiveConstraintDetails) => {
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
            toggleConditionKey='ttC_ActiveFlag'
        />
    );
}
