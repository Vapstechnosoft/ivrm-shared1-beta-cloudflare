'use client';

import { Button } from '@/components/ui/button';
import type { GatePassTransactionData } from '@/types/visitors-management/transactions';
import type { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown, Edit } from 'lucide-react';

interface ColumnProps {
    onEdit: (data: GatePassTransactionData) => void;
}

export const getColumns = ({ onEdit }: ColumnProps): ColumnDef<GatePassTransactionData>[] => [
    {
        accessorKey: 'type',
        header: 'Type',
        cell: ({ row }) => <span className='capitalize'>{row.getValue('type')}</span>
    },
    {
        accessorKey: 'name',
        header: ({ column }) => {
            return (
                <Button variant='ghost' onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                    Name
                    <ArrowUpDown className='ml-2 h-4 w-4' />
                </Button>
            );
        }
    },
    {
        accessorKey: 'code',
        header: 'Adm No / Emp Code'
    },
    {
        accessorKey: 'department',
        header: 'Class / Department'
    },
    {
        accessorKey: 'designation',
        header: 'Section / Designation'
    },
    {
        accessorKey: 'dateTime',
        header: 'Date Time',
        cell: ({ row }) => {
            const raw = row.getValue('dateTime') as string;
            if (!raw) return '-';
            try {
                const date = new Date(raw);
                return Number.isNaN(date.getTime()) ? raw : date.toLocaleString();
            } catch {
                return raw;
            }
        }
    },
    {
        accessorKey: 'remarks',
        header: 'Remarks'
    },
    {
        id: 'actions',
        cell: ({ row }) => {
            const record = row.original;
            // Gate Pass usually only has 'View' or 'Edit Remarks'. Since no delete API yet, just Edit.
            return (
                <div className='flex gap-2'>
                    <Button variant='ghost' size='icon' onClick={() => onEdit(record)}>
                        <Edit className='h-4 w-4' />
                    </Button>
                </div>
            );
        }
    }
];
