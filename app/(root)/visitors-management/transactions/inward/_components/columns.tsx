'use client';

import { Button } from '@/components/ui/button';
import { useInward } from '@/hooks/visitors-management/transactions/useInward';
import type { InwardTransactionData } from '@/types/visitors-management/transactions';
import type { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown, Edit, Trash2 } from 'lucide-react';

interface ColumnProps {
    onEdit: (data: InwardTransactionData) => void;
}

export const getColumns = ({ onEdit }: ColumnProps): ColumnDef<InwardTransactionData>[] => [
    {
        accessorKey: 'foiN_Discription',
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
        accessorKey: 'foiN_ContactPerson',
        header: 'Contact Person'
    },
    {
        accessorKey: 'foiN_InwardNo',
        header: 'Inward No'
    },
    {
        accessorKey: 'foiN_From',
        header: 'From'
    },
    {
        accessorKey: 'foiN_PhoneNo',
        header: 'Phone No'
    },
    {
        accessorKey: 'foiN_DateTime',
        header: 'Date',
        cell: ({ row }) => {
            const date = new Date(row.getValue('foiN_DateTime'));
            return date.toLocaleDateString();
        }
    },
    {
        accessorKey: 'hrmE_EmployeeFirstName',
        header: 'Person To'
    },
    {
        id: 'actions',
        cell: ({ row }) => {
            const record = row.original;
            const { deleteInward } = useInward();

            return (
                <div className='flex gap-2'>
                    <Button variant='ghost' size='icon' onClick={() => onEdit(record)}>
                        <Edit className='h-4 w-4' />
                    </Button>
                    <Button variant='ghost' size='icon' onClick={() => deleteInward(record.foiN_Id)}>
                        <Trash2 className='h-4 w-4' />
                    </Button>
                </div>
            );
        }
    }
];
