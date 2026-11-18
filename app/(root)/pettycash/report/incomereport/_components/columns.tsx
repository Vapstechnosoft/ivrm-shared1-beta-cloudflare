'use client';

import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import type { IPDAReportExpense, IPDAReportIncome } from '@/types/pettycash/report/PDAReport';
import type { ColumnDef } from '@tanstack/react-table';

export const incomeColumns: ColumnDef<IPDAReportIncome>[] = [
    {
        id: 'slno',
        header: ({ column }) => <DataTableColumnHeader column={column} title='SL.NO' />,
        cell: ({ row }) => <div className='text-center text-xs'>{row.index + 1}</div>
    },
    {
        accessorKey: 'payment_Mode',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Particulars' />,
        cell: ({ row }) => <div className='font-medium text-xs'>{row.original.payment_Mode || (row.original as any).Payment_Mode}</div>
    },
    {
        accessorKey: 'fyP_Tot_Amount',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Total Amount' />,
        cell: ({ row }) => {
            const amount = row.original.fyP_Tot_Amount ?? (row.original as any).FYP_Tot_Amount ?? row.original.cashAmount ?? 0;
            return <div className='text-right font-bold text-xs'>{Number(amount).toFixed(2)}</div>;
        }
    }
];

export const expenseColumns: ColumnDef<IPDAReportExpense>[] = [
    {
        id: 'slno',
        header: ({ column }) => <DataTableColumnHeader column={column} title='SL.NO' />,
        cell: ({ row }) => <div className='text-center text-xs'>{row.index + 1}</div>
    },
    {
        accessorKey: 'particular',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Particulars' />,
        cell: ({ row }) => <div className='font-medium text-xs'>{row.original.particular || (row.original as any).Particular}</div>
    },
    {
        accessorKey: 'pcreqtndeT_Amount',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Amount' />,
        cell: ({ row }) => {
            const amount = row.original.pcreqtndeT_Amount ?? (row.original as any).PCREQTNDET_Amount ?? 0;
            return <div className='text-right font-bold text-xs'>{Number(amount).toFixed(2)}</div>;
        }
    }
];
