'use client';

import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import type { ICollegeFeeTransaction } from '@/types/fees/college/transaction/transaction';
import type { ColumnDef } from '@tanstack/react-table';
import { Eye } from 'lucide-react';
import { useCallback } from 'react';

export const collegeFeeTransactionColumns: ColumnDef<ICollegeFeeTransaction>[] = [
    {
        accessorKey: 'fyp_Id',
        header: ({ column }) => <DataTableColumnHeader column={column} title='SL.NO' className='w-full pl-4' />,
        cell: ({ row, table }) => {
            const pageIndex = table.getState().pagination.pageIndex;
            const pageSize = table.getState().pagination.pageSize;
            return <div className='w-full pl-4 font-medium text-muted-foreground'>{pageIndex * pageSize + row.index + 1}</div>;
        },
        enableSorting: false,
        enableHiding: false
    },
    {
        accessorKey: 'amcst_FirstName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Student Name' />,
        cell: ({ row }) => {
            const first = row.original.amcst_FirstName || '';
            const middle = row.original.amcst_MiddleName || '';
            const last = row.original.amcst_LastName || '';
            const fullName = `${first} ${middle} ${last}`.trim() || row.original.studentName || '-';

            return <div className='font-semibold text-foreground uppercase'>{fullName}</div>;
        }
    },
    {
        accessorKey: 'amco_CourseName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Course Name' />,
        cell: ({ row }) => <div className='font-medium text-blue-700'>{row.getValue('amco_CourseName') || '-'}</div>
    },
    {
        accessorKey: 'amB_BranchName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Branch Name' />,
        cell: ({ row }) => <div>{row.getValue('amB_BranchName') || '-'}</div>
    },
    {
        accessorKey: 'amcst_AdmNo',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Adm No.' />,
        cell: ({ row }) => <div className='font-mono text-sm'>{row.getValue('amcst_AdmNo') || '-'}</div>
    },
    {
        accessorKey: 'fyp_Receipt_No',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Receipt No.' />,
        cell: ({ row }) => <div className='font-mono text-sm font-semibold text-primary'>{row.getValue('fyp_Receipt_No') || '-'}</div>
    },
    {
        accessorKey: 'fyp_Date',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Paid Date' />,
        cell: ({ row }) => {
            const val = row.getValue('fyp_Date');
            if (!val) return <div>-</div>;
            try {
                return (
                    <div>
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
        accessorKey: 'fyp_Tot_Amount',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Paid Amount' />,
        cell: ({ row }) => (
            <div className='font-semibold text-right text-emerald-700 pr-4'>
                ₹{Number(row.getValue('fyp_Tot_Amount') || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
        )
    },
    {
        accessorKey: 'fyp_Bank_Or_Cash',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Mode of Payment' />,
        cell: ({ row }) => (
            <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-800 border border-blue-200'>
                {row.getValue('fyp_Bank_Or_Cash') || '-'}
            </span>
        )
    },
    {
        accessorKey: 'status',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Status' />,
        cell: ({ row }) => {
            const status = row.original.status || 'Active';
            const isActive = status.toLowerCase() === 'active';
            return (
                <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                        isActive
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}>
                    {status}
                </span>
            );
        }
    },
    {
        id: 'actions',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Action' className='text-center' />,
        accessorFn: (row) => row,
        enableSorting: false,
        cell: ({ row }) => <ActionButtonsCell rowData={row.original} />
    }
];

function ActionButtonsCell({ rowData }: { rowData: ICollegeFeeTransaction }) {
    const { openEditForm, openDeleteForm, openDetailsView } = useFormContext<ICollegeFeeTransaction>();

    const handleEdit = useCallback((data: ICollegeFeeTransaction) => openEditForm(data), [openEditForm]);
    const handleDelete = useCallback((data: ICollegeFeeTransaction) => openDeleteForm(data), [openDeleteForm]);
    const handleView = useCallback(() => {
        openDetailsView(rowData);
    }, [openDetailsView, rowData]);

    return (
        <div className='flex items-center justify-center gap-1'>
            <button
                type='button'
                onClick={handleView}
                className='rounded-md p-1.5 text-blue-600 transition hover:bg-blue-50 hover:text-blue-700'
                title='View Receipt / Details'>
                <Eye className='h-4 w-4' />
            </button>
            <ActionButtons
                rowData={rowData}
                buttons={{ edit: true, toggle: false, delete: true }}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />
        </div>
    );
}
