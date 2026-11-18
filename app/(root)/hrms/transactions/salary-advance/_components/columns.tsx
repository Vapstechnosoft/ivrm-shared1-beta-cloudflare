'use client';

import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import { cn } from '@/lib/utils';
import type { SalaryAdvanceGridItem } from '@/types/hrms/salary-advance';
import type { ColumnDef } from '@tanstack/react-table';
import { useCallback } from 'react';

export const columns: ColumnDef<SalaryAdvanceGridItem>[] = [
    {
        id: 'slNo',
        header: () => <div className='text-center font-medium'>Sl No</div>,
        cell: ({ row, table }) => {
            const pageIndex = table.getState().pagination.pageIndex;
            const pageSize = table.getState().pagination.pageSize;
            const continuousIndex = pageIndex * pageSize + row.index + 1;
            return <div className='text-center'>{continuousIndex}</div>;
        },
        enableSorting: false,
        size: 60
    },
    {
        accessorKey: 'hrmE_Id',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Employee ID' className='whitespace-nowrap' />,
        cell: ({ row }) => <div>{row.getValue('hrmE_Id')}</div>
    },
    {
        accessorKey: 'hrmE_EmpName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Employee Name' className='whitespace-nowrap' />,
        cell: ({ row }) => <div>{row.getValue('hrmE_EmpName') || '-'}</div>
    },
    {
        accessorKey: 'hresA_AdvYear',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Advance Year' className='whitespace-nowrap' />,
        cell: ({ row }) => <div>{row.getValue('hresA_AdvYear')}</div>
    },
    {
        accessorKey: 'hresA_AdvMonth',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Advance Month' className='whitespace-nowrap' />,
        cell: ({ row }) => <div>{row.getValue('hresA_AdvMonth')}</div>
    },
    {
        accessorKey: 'hresA_ReferenceNo',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Reference No' className='whitespace-nowrap' />,
        cell: ({ row }) => <div>{row.getValue('hresA_ReferenceNo') || '-'}</div>
    },
    {
        accessorKey: 'hresA_AppliedAmount',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Applied Amount' className='whitespace-nowrap' />,
        cell: ({ row }) => {
            const amount = row.getValue('hresA_AppliedAmount');
            return <div>{amount !== undefined && amount !== null ? `₹${Number(amount).toLocaleString()}` : '-'}</div>;
        }
    },
    {
        accessorKey: 'hresA_Remarks',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Remarks' className='whitespace-nowrap' />,
        cell: ({ row }) => (
            <div className='max-w-[200px] overflow-hidden truncate text-ellipsis'>{row.getValue('hresA_Remarks') || '-'}</div>
        )
    },
    {
        accessorKey: 'hresA_AdvStatus',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Status' className='whitespace-nowrap' />,
        cell: ({ row }) => {
            const status = row.getValue('hresA_AdvStatus') as string;
            return (
                <span
                    className={cn(
                        'rounded-full px-2 py-1 font-medium text-xs',
                        status === 'Approved'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            : status === 'Rejected'
                              ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                    )}>
                    {status || 'Pending'}
                </span>
            );
        }
    },
    {
        id: 'actions',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Actions' className='whitespace-nowrap text-center' />,
        cell: ({ row }) => <ActionButtonsCell rowData={row.original} />,
        enableSorting: false
    }
];

function ActionButtonsCell({ rowData }: { rowData: SalaryAdvanceGridItem }) {
    const { openEditForm, openToggleForm } = useFormContext<SalaryAdvanceGridItem>();

    const handleEdit = useCallback(
        (data: SalaryAdvanceGridItem) => {
            openEditForm(data as any);
        },
        [openEditForm]
    );

    const handleToggle = useCallback(
        (data: SalaryAdvanceGridItem) => {
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
            toggleConditionKey='hresA_ActiveFlag'
        />
    );
}
