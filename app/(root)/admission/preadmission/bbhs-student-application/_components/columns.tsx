'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import type { IPreadmissionStudentApplicationList } from '@/types/admission/preadmission/transactions';
import type { ColumnDef } from '@tanstack/react-table';
import { CreditCard, FileEdit, MoreHorizontal, Trash2 } from 'lucide-react';

export const bbhsStudentApplicationColumns: ColumnDef<IPreadmissionStudentApplicationList>[] = [
    {
        accessorKey: 'pasR_RegistrationNo',
        header: 'Reg No',
        cell: ({ row }) => {
            const val = row.getValue('pasR_RegistrationNo') as string;
            return val || <span className='text-muted-foreground italic'>Not Generated</span>;
        }
    },
    {
        accessorKey: 'student_name',
        header: 'Student Name'
    },
    {
        accessorKey: 'pasR_Sex',
        header: 'Gender'
    },
    {
        accessorKey: 'applied_class_name',
        header: 'Class'
    },
    {
        accessorKey: 'payment_status',
        header: 'Payment Status',
        cell: ({ row }) => {
            const status = row.getValue('payment_status') as number;
            return (
                <Badge variant={status === 1 ? 'outline' : 'destructive'} className={status === 1 ? 'border-green-500 text-green-500' : ''}>
                    {status === 1 ? 'Paid' : 'Unpaid'}
                </Badge>
            );
        }
    },
    {
        accessorKey: 'application_status',
        header: 'Status',
        cell: ({ row }) => {
            const status = row.getValue('application_status') as string;
            return <Badge variant='secondary'>{status || 'Unknown'}</Badge>;
        }
    },
    {
        id: 'actions',
        cell: ({ row }) => {
            const app = row.original;
            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant='ghost' className='h-8 w-8 p-0'>
                            <span className='sr-only'>Open menu</span>
                            <MoreHorizontal className='h-4 w-4' />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align='end'>
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => console.log('Edit', app)}>
                            <FileEdit className='mr-2 h-4 w-4' />
                            Edit Application
                        </DropdownMenuItem>
                        {app.payment_status === 0 && (
                            <DropdownMenuItem className='text-primary'>
                                <CreditCard className='mr-2 h-4 w-4' />
                                Pay Application Fee
                            </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className='text-destructive'>
                            <Trash2 className='mr-2 h-4 w-4' />
                            Delete Application
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        }
    }
];
