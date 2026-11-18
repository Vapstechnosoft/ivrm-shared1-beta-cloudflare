'use client';

import { Button } from '@/components/ui/button';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import type { BaseEntity } from '@/lib/localdb';
import type { LeaveOpeningBalanceEntry } from '@/types/hrms/leave-management/transaction/leave-opening-balance';
import type { ColumnDef } from '@tanstack/react-table';
import { Trash2 } from 'lucide-react';

export interface LeaveOpeningBalance extends BaseEntity, LeaveOpeningBalanceEntry {}

interface LeaveOpeningBalanceColumnsProps {
    onEdit: (row: LeaveOpeningBalance) => void;
    onDelete: (row: LeaveOpeningBalance) => void;
}

export const getLeaveOpeningBalanceColumns = ({ onEdit, onDelete }: LeaveOpeningBalanceColumnsProps): ColumnDef<LeaveOpeningBalance>[] => [
    {
        id: 'sl',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Sl No' />,
        cell: ({ row, table }) => {
            const pageIndex = table.getState().pagination.pageIndex;
            const pageSize = table.getState().pagination.pageSize;
            const continuousIndex = pageIndex * pageSize + row.index + 1;
            return <div className='font-medium'>{continuousIndex}</div>;
        },
        enableSorting: false
    },
    {
        accessorKey: 'hrmE_EmployeeName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='EMPLOYEE NAME' />,
        cell: ({ row }) => <div className='font-medium'>{row.getValue('hrmE_EmployeeName')}</div>
    },
    {
        accessorKey: 'hrmL_LeaveName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='LEAVE NAME' />,
        cell: ({ row }) => <div>{row.getValue('hrmL_LeaveName')}</div>
    },
    {
        accessorKey: 'hreobL_OBLeaves',
        header: ({ column }) => <DataTableColumnHeader column={column} title='LEAVE BALANCE' />,
        cell: ({ row }) => <div className='text-center'>{row.getValue('hreobL_OBLeaves')}</div>
    },
    {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
            const entity = row.original;
            return (
                <div className='flex gap-2'>
                    {/* <Button variant='outline' size='sm' onClick={() => onEdit(entity)}>
                        <Edit className='h-4 w-4' />
                    </Button> */}
                    <Button
                        variant='outline'
                        size='sm'
                        onClick={() => onDelete(entity)}
                        className='text-destructive hover:text-destructive'>
                        <Trash2 className='h-4 w-4' />
                    </Button>
                </div>
            );
        },
        enableSorting: false
    }
];
