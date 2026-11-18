'use client';

import { Button } from '@/components/ui/button';
import { useFormContext } from '@/components/ui/form/form-provider';
import type { AppointmentStatusVisitorData } from '@/types/visitors-management/transactions';
import type { ColumnDef } from '@tanstack/react-table';
import { Edit } from 'lucide-react';

export const visitorColumns: ColumnDef<AppointmentStatusVisitorData>[] = [
    {
        accessorKey: 'vmmV_VisitorName',
        header: 'Visitor Name',
        cell: ({ row }) => <div className='font-medium'>{row.original.vmmV_VisitorName}</div>
    },
    {
        accessorKey: 'vmmV_CkeckedInOutStatus',
        header: 'Status',
        cell: ({ row }) => (
            <div className='flex items-center'>
                <span
                    className={`rounded-full px-2 py-1 font-semibold text-xs ${
                        row.original.vmmV_CkeckedInOutStatus === 'Checked In' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                    {row.original.vmmV_CkeckedInOutStatus || 'Pending'}
                </span>
            </div>
        )
    },
    {
        id: 'actions',
        header: 'Actions',
        cell: function ActionCell({ row }) {
            const { openEditForm } = useFormContext<AppointmentStatusVisitorData>();

            return (
                <div className='flex justify-end pr-4'>
                    <Button
                        variant='ghost'
                        size='sm'
                        className='text-blue-600 hover:bg-blue-50 hover:text-blue-800'
                        onClick={() => openEditForm(row.original)}>
                        <Edit className='mr-1 h-4 w-4' /> Update Status
                    </Button>
                </div>
            );
        }
    }
];
