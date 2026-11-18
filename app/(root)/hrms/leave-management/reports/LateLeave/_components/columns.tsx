'use client';

import { Button } from '@/components/ui/button';
import type { ColumnDef } from '@tanstack/react-table';
import { Edit, Trash2 } from 'lucide-react';

export type LateLeaveItem = {
    hrelaP_Id: number;
    hrmE_Id: number;
    hrmL_Id: number;
    leaveName: string;
    hrelS_CBLeaves: number;
    hrelaP_TotalDays: number;
    employeeName: string;
    leaveReason: string;
    month: number;
    monthname: string;
    year: number;
    hrmlY_Id: number;
};

export const getLateLeaveColumns = (
    onEdit: (item: LateLeaveItem) => void,
    onDelete: (item: LateLeaveItem) => void,
    page = 1,
    pageSize = 10
): ColumnDef<LateLeaveItem>[] => [
    {
        header: 'Sno',
        cell: ({ row }) => (page - 1) * pageSize + row.index + 1
    },
    {
        accessorKey: 'year',
        header: 'LEAVE YEAR'
    },
    {
        accessorKey: 'monthname',
        header: 'LEAVE MONTH'
    },
    {
        accessorKey: 'employeeName',
        header: 'EMPLOYEE NAME'
    },
    {
        accessorKey: 'leaveReason',
        header: 'DEDUCTION REASON'
    },
    {
        accessorKey: 'leaveName',
        header: 'LEAVE NAME'
    },
    {
        accessorKey: 'hrelaP_TotalDays',
        header: 'NO. OF DAYS',
        cell: ({ row }) => <div className='text-center'>{row.original.hrelaP_TotalDays}</div>
    },
    {
        accessorKey: 'hrelS_CBLeaves',
        header: 'LEAVE BALANCE',
        cell: ({ row }) => <div className='text-center'>{row.original.hrelS_CBLeaves}</div>
    },
    {
        id: 'actions',
        header: () => <div className='text-center'>Action</div>,
        cell: ({ row }) => {
            const item = row.original;
            return (
                <div className='flex items-center justify-center gap-2'>
                    <Button
                        variant='ghost'
                        size='icon'
                        className='h-8 w-8 p-0 text-primary transition-all duration-200 hover:bg-primary/5 hover:text-primary'
                        title='Edit'
                        onClick={() => onEdit(item)}>
                        <Edit className='h-4 w-4' />
                    </Button>
                    <Button
                        variant='ghost'
                        size='icon'
                        className='h-8 w-8 p-0 text-destructive transition-all duration-200 hover:bg-red-50 hover:text-destructive'
                        title='Delete'
                        onClick={() => onDelete(item)}>
                        <Trash2 className='h-4 w-4' />
                    </Button>
                </div>
            );
        }
    }
];
