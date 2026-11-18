'use client';

import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import type { EmployeeLoanItem } from '@/types/hrms/employee-loan';
import type { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { useCallback } from 'react';

export const columns: ColumnDef<EmployeeLoanItem>[] = [
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
        accessorKey: 'EmployeeFullName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Employee' className='whitespace-nowrap' />,
        cell: ({ row }) => {
            const employeeName = row.original.EmployeeFullName || row.original.HRME_EmployeeFirstName || 'N/A';
            const employeeCode = row.original.HRME_EmployeeCode;
            return (
                <div>
                    <div className='font-medium'>{employeeName}</div>
                    {employeeCode && <div className='text-muted-foreground text-xs'>{employeeCode}</div>}
                </div>
            );
        }
    },
    {
        accessorKey: 'HRML_LoanType',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Loan Type' className='whitespace-nowrap' />,
        cell: ({ row }) => <div>{row.getValue('HRML_LoanType') || 'N/A'}</div>
    },
    {
        accessorKey: 'HREL_LoanAmount',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Amount' className='whitespace-nowrap' />,
        cell: ({ row }) => {
            const val = row.getValue('HREL_LoanAmount');
            return <div>{val !== undefined && val !== null ? `₹${Number(val).toLocaleString()}` : '-'}</div>;
        }
    },
    {
        accessorKey: 'HREL_LoanInsallments',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Loan Installments' className='whitespace-nowrap' />,
        cell: ({ row }) => <div>{row.getValue('HREL_LoanInsallments') || '-'}</div>
    },
    {
        accessorKey: 'HREL_LaonEMI',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Loan EMI' className='whitespace-nowrap' />,
        cell: ({ row }) => {
            const val = row.getValue('HREL_LaonEMI');
            return <div>{val !== undefined && val !== null && val !== '' ? `₹${Number(val).toLocaleString()}` : '-'}</div>;
        }
    },
    {
        accessorKey: 'HREL_AppliedDate',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Applied Date' className='whitespace-nowrap' />,
        cell: ({ row }) => {
            const date = row.getValue('HREL_AppliedDate') as string;
            return <div>{date ? format(new Date(date), 'dd/MM/yyyy') : '-'}</div>;
        }
    },
    {
        accessorKey: 'HREL_TotalPending',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Total Pending' className='whitespace-nowrap' />,
        cell: ({ row }) => {
            const val = row.getValue('HREL_TotalPending');
            return <div>{val !== undefined && val !== null ? `₹${Number(val).toLocaleString()}` : '-'}</div>;
        }
    },
    {
        id: 'actions',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Actions' className='whitespace-nowrap text-start' />,
        cell: ({ row }) => <ActionButtonsCell rowData={row.original} />,
        enableSorting: false
    }
];

function ActionButtonsCell({ rowData }: { rowData: EmployeeLoanItem }) {
    const { openEditForm, openToggleForm } = useFormContext<EmployeeLoanItem>();

    const handleEdit = useCallback(
        (data: EmployeeLoanItem) => {
            openEditForm(data as any);
        },
        [openEditForm]
    );

    const handleToggle = useCallback(
        (data: EmployeeLoanItem) => {
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
            toggleConditionKey='HREL_ActiveFlag'
        />
    );
}
