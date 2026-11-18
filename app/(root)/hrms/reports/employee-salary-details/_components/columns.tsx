'use client';
import { Button } from '@/components/ui/button';
import type { BaseEntity } from '@/lib/localdb';
import type { ColumnDef } from '@tanstack/react-table';
import { Eye } from 'lucide-react';
export interface MonthlySalaryDetail extends BaseEntity {
    id: number;
    month: string;
    year: string;
    netSalary: number;
}
export const getMonthlySalaryDetailColumns = (
    onViewDetails: (monthData: MonthlySalaryDetail) => void
): ColumnDef<MonthlySalaryDetail>[] => [
    {
        accessorKey: 'id',
        header: 'SL. No.',
        cell: ({ row, table }) => {
            const pageIndex = table.getState().pagination.pageIndex;
            const pageSize = table.getState().pagination.pageSize;
            const continuousIndex = pageIndex * pageSize + row.index + 1;
            return <div className='text-center'>{continuousIndex}</div>;
        },
        enableSorting: false,
        enableHiding: false,
        size: 80
    },
    {
        accessorKey: 'month',
        header: 'Month',
        cell: ({ row }) => <div className='font-medium'>{row.getValue('month')}</div>,
        enableSorting: false,
        enableHiding: true
    },
    {
        accessorKey: 'netSalary',
        header: 'Net Salary',
        cell: ({ row }) => <div className='font-semibold'>₹{(row.getValue('netSalary') as number).toLocaleString()}</div>,
        enableSorting: false,
        enableHiding: true
    },
    {
        id: 'viewDetails',
        header: () => <div className='text-center'>View Details</div>,
        cell: ({ row }) => (
            <div className='flex justify-center'>
                <Button variant='ghost' size='sm' onClick={() => onViewDetails(row.original)} className='text-blue-600 hover:text-blue-700'>
                    <Eye className='h-4 w-4' />
                </Button>
            </div>
        ),
        enableSorting: false,
        enableHiding: false
    }
];
