'use client';

import { Button } from '@/components/ui/button';
import type { VisitorAppointmentData } from '@/types/visitors-management/transactions';
import type { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { ArrowUpDown, Edit, Eye } from 'lucide-react';

interface ColumnProps {
    onEdit: (record: VisitorAppointmentData) => void;
}

export const getColumns = ({ onEdit }: ColumnProps): ColumnDef<VisitorAppointmentData>[] => [
    {
        accessorKey: 'vmaP_VisitorName',
        header: ({ column }) => {
            return (
                <Button variant='ghost' onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                    Visitor Name
                    <ArrowUpDown className='ml-2 h-4 w-4' />
                </Button>
            );
        }
    },
    {
        accessorKey: 'vmaP_VisitorContactNo',
        header: 'Contact No'
    },
    {
        accessorKey: 'vmaP_VisitorEmailid',
        header: 'Email'
    },
    {
        accessorKey: 'EMPNAME',
        header: 'To Meet'
    },
    {
        accessorKey: 'vmaP_FromPlace',
        header: 'From'
    },
    {
        accessorKey: 'vmaP_VisitTypeFlg',
        header: 'Type'
    },
    {
        accessorKey: 'vmaP_EntryDateTime',
        header: 'Entry Date',
        cell: ({ row }) => {
            const date = row.getValue('vmaP_EntryDateTime') as string;
            return date ? format(new Date(date), 'dd/MM/yyyy') : '';
        }
    },
    {
        accessorKey: 'vmaP_MeetingPurpose',
        header: 'Purpose'
    },
    {
        accessorKey: 'vmaP_MeetingLocation',
        header: 'Location'
    },
    {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
            const data = row.original;
            return (
                <div className='flex gap-2'>
                    {data.vmaP_Status === 'Waiting' && (
                        <Button variant='ghost' size='icon' className='h-8 w-8 text-blue-500' onClick={() => onEdit(data)}>
                            <Edit className='h-4 w-4' />
                        </Button>
                    )}
                    {data.RCNT && data.RCNT > 0 && (
                        <Button variant='ghost' size='icon' className='h-8 w-8 text-green-500'>
                            <Eye className='h-4 w-4' />
                        </Button>
                    )}
                    {/* Placeholder for Activate/Deactivate */}
                    <Button variant='ghost' size='sm' className={data.vmaP_ActiveFlag ? 'text-red-500' : 'text-green-500'}>
                        {data.vmaP_ActiveFlag ? 'Deactivate' : 'Activate'}
                    </Button>
                </div>
            );
        }
    }
];

export const columns = getColumns({ onEdit: () => {} });
