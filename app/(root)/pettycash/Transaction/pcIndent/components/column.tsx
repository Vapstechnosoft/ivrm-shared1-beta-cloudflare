'use client';

import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import type { IPcIndent } from '@/types/pettycash/transaction/pcIndent';
import type { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { useCallback } from 'react';

export const pcIndentColumns: ColumnDef<IPcIndent>[] = [
    {
        accessorKey: 'pcindT_Id',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Sl. No' className='w-full pl-6' />,
        cell: ({ row, table }) => {
            const pageIndex = table.getState().pagination.pageIndex;
            const pageSize = table.getState().pagination.pageSize;

            return <div className='w-full pl-6'>{pageIndex * pageSize + row.index + 1}</div>;
        },
        enableSorting: false,
        enableHiding: false
    },
    {
        accessorKey: 'pcindT_IndentNo',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Indent No' />,
        cell: ({ row }) => <div className='font-medium text-primary'>{row.getValue('pcindT_IndentNo')}</div>
    },
    {
        accessorKey: 'departmentname',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Department' />,
        cell: ({ row }) => <div>{row.getValue('departmentname')}</div>
    },
    {
        accessorKey: 'approvedBy',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Approved By' />,
        cell: ({ row }) => <div>{row.getValue('approvedBy') || '-'}</div>
    },
    {
        accessorKey: 'pcindT_Date',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Date' />,
        cell: ({ row }) => {
            const date = row.getValue('pcindT_Date');
            return <div>{date ? format(new Date(date as string), 'dd/MM/yyyy') : '-'}</div>;
        }
    },
    {
        id: 'actions',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Actions' className='text-start' />,
        cell: ({ row }) => <ActionButtonsCell rowData={row.original} />,
        enableSorting: false
    }
];

function ActionButtonsCell({ rowData }: { rowData: IPcIndent }) {
    const { openEditForm, openToggleForm } = useFormContext<IPcIndent>();

    const handleEdit = useCallback((data: IPcIndent) => openEditForm(data), [openEditForm]);
    const handleToggle = useCallback((data: IPcIndent) => openToggleForm(data), [openToggleForm]);

    return (
        <ActionButtons
            rowData={rowData}
            buttons={{ edit: true, toggle: true, delete: false }}
            toggleConditionKey='pcindT_ActiveFlg'
            onToggle={handleToggle}
            onEdit={handleEdit}
        />
    );
}
