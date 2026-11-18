'use client';

import { Button } from '@/components/ui/button';
import { useOutward } from '@/hooks/visitors-management/transactions/useOutward';
import type { OutwardTransactionData } from '@/types/visitors-management/transactions';
import type { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown, Edit, Trash2 } from 'lucide-react';

interface ColumnProps {
    onEdit: (data: OutwardTransactionData) => void;
}

export const getColumns = ({ onEdit }: ColumnProps): ColumnDef<OutwardTransactionData>[] => [
    {
        accessorKey: 'foouT_Discription',
        header: ({ column }) => {
            return (
                <Button variant='ghost' onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                    Description
                    <ArrowUpDown className='ml-2 h-4 w-4' />
                </Button>
            );
        }
    },
    {
        accessorKey: 'foouT_From',
        header: 'From'
    },
    {
        accessorKey: 'foouT_To',
        header: 'To'
    },
    {
        accessorKey: 'foouT_Address',
        header: 'Address'
    },
    {
        accessorKey: 'foouT_DateTime',
        header: 'Date',
        cell: ({ row }) => {
            const date = new Date(row.getValue('foouT_DateTime'));
            return date.toLocaleDateString();
        }
    },
    {
        accessorKey: 'foouT_OutwardNo',
        header: 'Outward No'
    },
    {
        accessorKey: 'foouT_PhoneNo',
        header: 'Phone No'
    },
    // {
    //     accessorKey: 'foouT_EmailId',
    //     header: 'Email Id',
    // },
    {
        accessorKey: 'hrmE_EmployeeFirstName',
        header: 'Dispatched By'
    },
    {
        accessorKey: 'foouT_DispatchedThrough',
        header: 'Via'
    },
    {
        id: 'actions',
        cell: ({ row }) => {
            const record = row.original;
            const { deleteOutward } = useOutward();

            return (
                <div className='flex gap-2'>
                    <Button variant='ghost' size='icon' onClick={() => onEdit(record)}>
                        <Edit className='h-4 w-4' />
                    </Button>
                    <Button variant='ghost' size='icon' onClick={() => deleteOutward(record.foouT_Id)}>
                        <Trash2 className='h-4 w-4' />
                    </Button>
                </div>
            );
        }
    }
];
