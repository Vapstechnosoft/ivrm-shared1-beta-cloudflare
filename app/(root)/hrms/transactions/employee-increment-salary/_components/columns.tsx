'use client';

import { Button } from '@/components/ui/button';
import type { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { Trash2 } from 'lucide-react';

export interface EmployeeIncrementGridItem {
    hrmeD_Name: string;
    hreiC_Id: number;
    employeeName: string;
    hrmD_DepartmentName: string;
    amount: number | null;
    flag: string;
    hreiC_IncrementDate?: string | Date;
    hreiceD_PreviousAmount?: number; // Might be in the real API
}

export const getEmployeeIncrementColumns = (onDelete: (id: number) => void): ColumnDef<EmployeeIncrementGridItem>[] => [
    {
        id: 'slNo',
        header: 'SL.No.',
        cell: ({ row }) => <div className='text-center'>{row.index + 1}</div>,
        size: 50
    },
    {
        accessorKey: 'employeeName',
        header: 'Employee Name'
        // size: 200,
    },
    {
        accessorKey: 'hrmD_DepartmentName',
        header: 'Department'
        // size: 150,
    },
    {
        accessorKey: 'hreiC_IncrementDate',
        header: 'Increment Date',
        cell: ({ row }) => {
            const date = row.original.hreiC_IncrementDate;
            if (!date) return '-';
            try {
                return format(new Date(date), 'dd/MM/yyyy');
            } catch {
                return String(date);
            }
        }
        // size: 120,
    },
    {
        accessorKey: 'hrmeD_Name',
        header: 'Earning Head'
        // size: 150,
    },
    {
        accessorKey: 'PreviousAmount',
        header: 'Previous Amount',
        cell: ({ row }) => row.original.hreiceD_PreviousAmount ?? '-'
        // size: 120,
    },
    {
        accessorKey: 'amount',
        header: 'Percentage/Amount',
        cell: ({ row }) => <div className='text-center'>{row.original.amount}</div>
        // size: 120,
    },
    {
        accessorKey: 'flag',
        header: () => <div className='text-center'>Flag</div>,
        cell: ({ row }) => <div className='text-center'>{row.original.flag}</div>,
        size: 100
    },
    {
        id: 'actions',
        header: 'Action',
        cell: ({ row }) => (
            <Button
                variant='ghost'
                size='icon'
                className='text-destructive hover:bg-destructive/50 hover:text-destructive'
                onClick={() => onDelete(row.original.hreiC_Id)}>
                <Trash2 className='h-4 w-4' />
            </Button>
        ),
        size: 80
    }
];
