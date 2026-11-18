'use client';

import { Button } from '@/components/ui/button';
import { DataTableColumnHeader as ColumnHeader } from '@/components/ui/data-table-column-header';
import type { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';

export const studentRequestConfirmColumns = (onApprove: (data: any) => void): ColumnDef<any>[] => [
    {
        accessorKey: 'sn',
        header: ({ column }) => <ColumnHeader column={column} title='SL.No.' />,
        cell: ({ row, table }) => {
            const pageIndex = table.getState().pagination.pageIndex;
            const pageSize = table.getState().pagination.pageSize;
            return <div>{pageIndex * pageSize + row.index + 1}</div>;
        },
        enableSorting: false,
        enableHiding: false
    },
    {
        accessorKey: 'studentName',
        header: ({ column }) => <ColumnHeader column={column} title='Student Name' />
    },
    {
        accessorKey: 'AMCO_CourseName',
        header: ({ column }) => <ColumnHeader column={column} title='Course' />
    },
    {
        accessorKey: 'AMCST_RegistrationNo',
        header: ({ column }) => <ColumnHeader column={column} title='Registration No' />
    },
    {
        accessorKey: 'HLMH_Name',
        header: ({ column }) => <ColumnHeader column={column} title='Hostel' />
    },
    {
        accessorKey: 'HLMRCA_RoomCategory',
        header: ({ column }) => <ColumnHeader column={column} title='Room Category' />
    },
    {
        accessorKey: 'HLHSREQ_RequestDate',
        header: ({ column }) => <ColumnHeader column={column} title='Request Date' />,
        cell: ({ row }) => {
            const date = row.original.HLHSREQ_RequestDate;
            return date ? format(new Date(date), 'dd/MM/yyyy') : '';
        }
    },
    {
        accessorKey: 'HLHSREQ_BookingStatus',
        header: ({ column }) => <ColumnHeader column={column} title='Status' />,
        cell: ({ row }) => {
            const status = row.original.HLHSREQ_BookingStatus;
            return <div className='font-semibold text-xs'>{status}</div>;
        }
    },
    {
        id: 'actions',
        header: ({ column }) => <ColumnHeader column={column} title='Action' className='text-center' />,
        cell: ({ row }) =>
            row.original.HLHSREQ_BookingStatus === 'Waiting' && (
                <div className='text-center'>
                    <Button
                        variant='link'
                        size='sm'
                        onClick={() => onApprove(row.original)}
                        className='font-bold text-blue-600 hover:underline'>
                        Process
                    </Button>
                </div>
            )
    }
];
