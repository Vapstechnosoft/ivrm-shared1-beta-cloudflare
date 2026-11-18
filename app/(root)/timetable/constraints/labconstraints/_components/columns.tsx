'use client';

import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import type { labConstraints as ILabConstraintList } from '@/types/timetable/constraints/labconstraints';
import type { ColumnDef } from '@tanstack/react-table';
import { useCallback } from 'react';

export type { ILabConstraintList };

export const labConstraintsColumns: ColumnDef<ILabConstraintList>[] = [
    {
        accessorKey: 'asmayYear',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Academic Year' />,
        cell: ({ row }) => <div>{row.getValue('asmayYear')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'categoryName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Category' />,
        cell: ({ row }) => <div>{row.getValue('categoryName')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'ttlaB_LABLIBName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Lab Name' />,
        cell: ({ row }) => <div>{row.getValue('ttlaB_LABLIBName')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        id: 'actions',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Actions' />,
        accessorFn: (row) => row,
        enableSorting: false,
        cell: ({ row }) => <ActionButtonsCell rowData={row.original} />
    }
];

function ActionButtonsCell({ rowData }: { rowData: ILabConstraintList }) {
    const { openEditForm, openToggleForm, openDeleteForm } = useFormContext<ILabConstraintList>();

    const handleEdit = useCallback(
        (data: ILabConstraintList) => {
            openEditForm(data);
        },
        [openEditForm]
    );

    const handleToggle = useCallback(
        (data: ILabConstraintList) => {
            openToggleForm(data);
        },
        [openToggleForm]
    );

    const handleDelete = useCallback(
        (data: ILabConstraintList) => {
            if (openDeleteForm) openDeleteForm(data);
        },
        [openDeleteForm]
    );

    return (
        <ActionButtons
            rowData={rowData}
            buttons={{ edit: true, toggle: true, delete: true }}
            onEdit={handleEdit}
            onToggle={handleToggle}
            onDelete={handleDelete}
            toggleConditionKey='ttlaB_ActiveFlag'
        />
    );
}
