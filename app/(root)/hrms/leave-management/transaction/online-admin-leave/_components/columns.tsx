'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { cn } from '@/lib/utils';
import type { OnlineAdminLeaveApplication } from '@/types/hrms/leave-management/online-admin-leave';
import type { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { Calendar, Eye, Trash2 } from 'lucide-react';

interface OnlineAdminLeaveColumnsProps {
    onView: (row: OnlineAdminLeaveApplication) => void;
    onDelete: (id: number) => void;
    onEdit: (row: OnlineAdminLeaveApplication) => void;
}

export const getOnlineAdminLeaveColumns = ({
    onView,
    onDelete,
    onEdit
}: OnlineAdminLeaveColumnsProps): ColumnDef<OnlineAdminLeaveApplication>[] => [
    {
        id: 'slNo',
        header: ({ column }) => <DataTableColumnHeader column={column} title='SNO' />,
        cell: ({ row }) => <div className='font-mono text-muted-foreground text-xs'>{row.index + 1}</div>
    },
    {
        accessorKey: 'hrmL_LeaveName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='LEAVE NAME' />,
        cell: ({ row }) => (
            <div className='flex flex-col'>
                <span className='font-medium'>{row.getValue('hrmL_LeaveName')}</span>
            </div>
        )
    },
    {
        accessorKey: 'hrelaP_LeaveReason',
        header: ({ column }) => <DataTableColumnHeader column={column} title='LEAVE REASON' />,
        cell: ({ row }) => (
            <div className='max-w-[150px] truncate text-muted-foreground text-xs italic' title={row.getValue('hrelaP_LeaveReason')}>
                {row.getValue('hrelaP_LeaveReason') || '---'}
            </div>
        )
    },

    {
        accessorKey: 'hrelaP_FromDate',
        header: ({ column }) => <DataTableColumnHeader column={column} title='FROM DATE' />,
        cell: ({ row }) => {
            const date = row.getValue('hrelaP_FromDate') as string;
            return (
                <div className='flex items-center gap-1 font-medium text-xs'>
                    <Calendar className='h-3 w-3 text-orange-500' /> {format(new Date(date), 'dd-MM-yyyy')}
                </div>
            );
        }
    },
    {
        accessorKey: 'hrelaP_ToDate',
        header: ({ column }) => <DataTableColumnHeader column={column} title='TO DATE' />,
        cell: ({ row }) => {
            const date = row.getValue('hrelaP_ToDate') as string;
            return (
                <div className='flex items-center gap-1 font-medium text-xs'>
                    <Calendar className='h-3 w-3 text-blue-500' /> {format(new Date(date), 'dd-MM-yyyy')}
                </div>
            );
        }
    },
    {
        accessorKey: 'hreltD_TotDays',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Total' />,
        cell: ({ row }) => <div className='w-fit rounded bg-muted px-2 py-0.5 font-bold text-xs'>{row.getValue('hreltD_TotDays')}</div>
    },

    {
        accessorKey: 'hrelaP_ApplicationStatus',
        header: ({ column }) => <DataTableColumnHeader column={column} title='STATUS' />,
        cell: ({ row }) => {
            const status = row.getValue('hrelaP_ApplicationStatus') as string;
            let className = '';

            if (status === 'Applied' || status === 'Requested') {
                className = 'bg-blue-100 text-blue-700 border-blue-200';
            } else if (status === 'Approved') {
                className = 'bg-green-100 text-green-700 border-green-200';
            } else if (status === 'Rejected') {
                className = 'bg-red-100 text-red-700 border-red-200';
            }

            return (
                <Badge variant='outline' className={cn('font-bold text-[10px] uppercase tracking-wide', className)}>
                    {status}
                </Badge>
            );
        }
    },
    {
        accessorKey: 'hrelaP_SupportingDocument',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Document' />,
        cell: ({ row }) => {
            const doc = row.getValue('hrelaP_SupportingDocument') as string;
            return doc ? (
                <Button
                    variant='ghost'
                    size='icon'
                    className='h-8 w-8 text-primary'
                    title='View Document'
                    onClick={() => window.open(doc, '_blank')}>
                    <Eye className='h-4 w-4' />
                </Button>
            ) : (
                <span className='text-[10px] text-muted-foreground'>No Doc</span>
            );
        }
    },
    {
        id: 'action',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Action' />,
        cell: ({ row }) => (
            <div className='flex items-center gap-1'>
                <Button
                    variant='ghost'
                    size='icon'
                    className='h-7 w-7 text-destructive hover:bg-red-50 hover:text-destructive'
                    onClick={() => onDelete(row.original.hrelaP_Id)}
                    title='Delete'>
                    <Trash2 className='h-3.5 w-3.5' />
                </Button>
            </div>
        )
    }
];
