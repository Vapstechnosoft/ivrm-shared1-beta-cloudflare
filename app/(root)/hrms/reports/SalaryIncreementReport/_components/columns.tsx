'use client';

import type { SalaryIncrementReportItem } from '@/types/hrms/reports/salary-increment-report';
import type { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';

export const columns: ColumnDef<SalaryIncrementReportItem>[] = [
    {
        accessorKey: 'sno',
        header: 'SL.No.',
        cell: ({ row }) => row.index + 1
    },
    {
        accessorKey: 'employeeName',
        header: 'Employee Name'
    },
    {
        accessorKey: 'hrmeD_Name',
        header: 'Head Name'
    },
    {
        accessorKey: 'hreiC_IncrementDate',
        header: 'Increment Date',
        cell: ({ row }) => {
            const date = row.getValue('hreiC_IncrementDate') as string;
            return date ? format(new Date(date), 'dd/MM/yyyy') : '-';
        }
    },
    {
        accessorKey: 'hreiC_NextIncrementGivenDate',
        header: 'Next Increment Date',
        cell: ({ row }) => {
            const date = row.getValue('hreiC_NextIncrementGivenDate') as string;
            return date ? format(new Date(date), 'dd/MM/yyyy') : '-';
        }
    },
    {
        accessorKey: 'hreiceD_PreviousAmount',
        header: 'Previous Amount',
        cell: ({ row }) => {
            const amount = row.getValue('hreiceD_PreviousAmount') as number;
            return amount?.toLocaleString() || '0';
        }
    },
    {
        accessorKey: 'hreiceD_Amount',
        header: 'Amount',
        cell: ({ row }) => {
            const amount = row.getValue('hreiceD_Amount') as number;
            return amount?.toLocaleString() || '0';
        }
    },
    {
        accessorKey: 'hreiceD_Percentage',
        header: 'Percentage',
        cell: ({ row }) => {
            const percentage = row.getValue('hreiceD_Percentage') as string;
            return percentage ? `${percentage}%` : '0%';
        }
    },
    {
        accessorKey: 'incrementamount',
        header: 'Amount Incremented',
        cell: ({ row }) => {
            const amount = row.getValue('incrementamount') as number;
            return amount?.toLocaleString() || '0';
        }
    },
    {
        accessorKey: 'hreeD_Amount',
        header: 'Total Amount',
        cell: ({ row }) => {
            const amount = row.getValue('hreeD_Amount') as number;
            return amount?.toLocaleString() || '0';
        }
    }
];
