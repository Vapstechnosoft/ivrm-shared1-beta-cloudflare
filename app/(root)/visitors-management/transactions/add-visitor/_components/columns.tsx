'use client';

import { Button } from '@/components/ui/button';
import type { VisitorTransactionData } from '@/types/visitors-management/transactions';
import type { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { Eye, Users } from 'lucide-react';

export const visitorColumns: ColumnDef<VisitorTransactionData>[] = [
    {
        id: 'serialNumber',
        header: 'Sl.No.',
        cell: ({ row }) => row.index + 1
    },
    {
        accessorKey: 'vmmV_VisitorName',
        header: 'Visitor Name',
        cell: ({ row }) => <div className='font-medium text-foreground'>{row.getValue('vmmV_VisitorName') || '-'}</div>
    },
    {
        accessorKey: 'vmmV_VisitorContactNo',
        header: 'Contact No.',
        cell: ({ row }) => row.getValue('vmmV_VisitorContactNo') || '-'
    },
    {
        accessorKey: 'vmmV_VisitorEmailid',
        header: 'Email Id',
        cell: ({ row }) => (
            <div className='max-w-[140px] truncate text-muted-foreground' title={row.getValue('vmmV_VisitorEmailid') || ''}>
                {row.getValue('vmmV_VisitorEmailid') || '-'}
            </div>
        )
    },
    {
        accessorKey: 'empname',
        header: 'To Meet',
        cell: ({ row }) => <div className='font-medium text-foreground'>{row.getValue('empname') || '-'}</div>
    },
    {
        accessorKey: 'vmmV_MeetingDateTime',
        header: 'Date',
        cell: ({ row }) => {
            const date = row.getValue('vmmV_MeetingDateTime') as string;
            return date ? format(new Date(date), 'dd-MM-yyyy') : '-';
        }
    },
    {
        accessorKey: 'vmmV_EntryDateTime',
        header: 'Time',
        cell: ({ row }) => row.getValue('vmmV_EntryDateTime') || '-'
    },
    {
        accessorKey: 'vmmV_MeetingPurpose',
        header: 'Purpose',
        cell: ({ row }) => (
            <div className='max-w-[120px] truncate' title={row.getValue('vmmV_MeetingPurpose') || ''}>
                {row.getValue('vmmV_MeetingPurpose') || '-'}
            </div>
        )
    },
    {
        id: 'multiVisitorDetails',
        header: 'Multi Visitor Details',
        cell: ({ row }) => {
            const count = row.original.multivisitor?.length || 0;
            return (
                <div className='flex justify-center'>
                    <Button
                        variant='ghost'
                        size='icon'
                        className='text-blue-600 hover:bg-blue-50 hover:text-blue-800'
                        title={count > 0 ? `${count} Visitors` : 'View Multi Visitors'}>
                        <Users className='h-4 w-4' />
                    </Button>
                </div>
            );
        }
    },
    {
        accessorKey: 'vmmV_BlockedFlg',
        header: 'Blocked Status',
        cell: ({ row }) => {
            const isBlocked = !!row.original.vmmV_BlockedFlg;
            return (
                <div className='flex justify-center'>
                    <Button
                        variant='ghost'
                        size='sm'
                        className={
                            isBlocked
                                ? 'font-medium text-red-600 hover:bg-red-50 hover:text-red-800'
                                : 'font-medium text-blue-600 hover:bg-blue-50 hover:text-blue-800'
                        }
                        title={isBlocked ? 'Blocked' : 'Block'}>
                        {isBlocked ? 'Blocked' : 'Block'}
                    </Button>
                </div>
            );
        }
    },
    {
        id: 'updateIdCard',
        header: 'Update Id Card Details',
        cell: () => (
            <div className='flex justify-center'>
                <Button variant='ghost' size='icon' className='text-blue-600 hover:bg-blue-50 hover:text-blue-800' title='Update ID Card'>
                    <Eye className='h-4 w-4' />
                </Button>
            </div>
        )
    },
    {
        id: 'viewDocuments',
        header: 'View Documents',
        cell: () => (
            <div className='flex justify-center'>
                <Button variant='ghost' size='icon' className='text-blue-600 hover:bg-blue-50 hover:text-blue-800' title='View Documents'>
                    <Eye className='h-4 w-4' />
                </Button>
            </div>
        )
    },
    {
        id: 'assignDetails',
        header: 'Assign Details',
        cell: () => (
            <div className='flex justify-center'>
                <Button variant='ghost' size='icon' className='text-blue-600 hover:bg-blue-50 hover:text-blue-800' title='Assign Details'>
                    <Eye className='h-4 w-4' />
                </Button>
            </div>
        )
    },
    {
        accessorKey: 'vmmV_CkeckedInOutStatus',
        header: 'Update Status',
        cell: ({ row }) => {
            const status = row.original.vmmV_CkeckedInOutStatus || 'Checked Out';
            const isCheckedOut = status.toLowerCase().includes('out');
            return (
                <div className='flex justify-center text-center'>
                    <span className={`cursor-pointer font-medium hover:underline ${isCheckedOut ? 'text-green-600' : 'text-blue-600'}`}>
                        {status}
                    </span>
                </div>
            );
        }
    }
];
