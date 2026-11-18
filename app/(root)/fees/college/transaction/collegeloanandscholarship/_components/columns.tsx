'use client';

import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import type { IClgLoanScholarshipRecord } from '@/types/fees/college/transaction/collegeloanandscholarship';
import type { ColumnDef } from '@tanstack/react-table';
import { useCallback } from 'react';

export const collegeLoanColumns: ColumnDef<IClgLoanScholarshipRecord>[] = [
    {
        accessorKey: 'fcL_Id',
        header: ({ column }) => <DataTableColumnHeader column={column} title='SL.NO' className='w-full pl-3' />,
        cell: ({ row, table }) => {
            const pageIndex = table.getState().pagination.pageIndex;
            const pageSize = table.getState().pagination.pageSize;
            return <div className='w-full pl-3 text-muted-foreground font-medium'>{pageIndex * pageSize + row.index + 1}</div>;
        },
        enableSorting: false,
        enableHiding: false
    },
    {
        accessorKey: 'studentName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Student Name' />,
        cell: ({ row }) => <div className='font-bold uppercase text-foreground'>{row.getValue('studentName')}</div>
    },
    {
        accessorKey: 'amcsT_AdmNo',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Adm No.' />,
        cell: ({ row }) => <div className='font-mono text-xs font-semibold text-gray-700'>{row.getValue('amcsT_AdmNo')}</div>
    },
    {
        accessorKey: 'amcO_CourseName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Course' />,
        cell: ({ row }) => <div className='font-medium text-blue-700'>{row.getValue('amcO_CourseName')}</div>
    },
    {
        accessorKey: 'amB_BranchName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Branch' />,
        cell: ({ row }) => <div>{row.getValue('amB_BranchName')}</div>
    },
    {
        accessorKey: 'amsE_SEMName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Semester' />,
        cell: ({ row }) => (
            <span className='inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800'>
                {row.getValue('amsE_SEMName')}
            </span>
        )
    },
    {
        accessorKey: 'loanAmount',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Loan Amount (₹)' />,
        cell: ({ row }) => (
            <div className='text-right font-semibold text-indigo-700 pr-3'>
                ₹{Number(row.getValue('loanAmount') || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
        )
    },
    {
        accessorKey: 'scholarshipAmount',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Scholarship (₹)' />,
        cell: ({ row }) => (
            <div className='text-right font-semibold text-amber-700 pr-3'>
                ₹{Number(row.getValue('scholarshipAmount') || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
        )
    },
    {
        accessorKey: 'totalAmount',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Total (₹)' />,
        cell: ({ row }) => (
            <div className='text-right font-bold text-emerald-800 pr-3'>
                ₹{Number(row.getValue('totalAmount') || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
        )
    },
    {
        accessorKey: 'createdDate',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Date' />,
        cell: ({ row }) => {
            const val = row.getValue('createdDate');
            if (!val) return <div>-</div>;
            try {
                return (
                    <div className='text-xs text-muted-foreground'>
                        {new Date(val as string).toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                        })}
                    </div>
                );
            } catch {
                return <div>{String(val)}</div>;
            }
        }
    },
    {
        id: 'actions',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Actions' className='text-center' />,
        accessorFn: (row) => row,
        enableSorting: false,
        cell: ({ row }) => <ActionButtonsCell rowData={row.original} />
    }
];

function ActionButtonsCell({ rowData }: { rowData: IClgLoanScholarshipRecord }) {
    const { openEditForm, openDeleteForm } = useFormContext<IClgLoanScholarshipRecord>();

    const handleEdit = useCallback((data: IClgLoanScholarshipRecord) => openEditForm(data), [openEditForm]);
    const handleDelete = useCallback((data: IClgLoanScholarshipRecord) => openDeleteForm(data), [openDeleteForm]);

    return (
        <div className='flex justify-center'>
            <ActionButtons
                rowData={rowData}
                buttons={{ edit: true, toggle: false, delete: true }}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />
        </div>
    );
}
