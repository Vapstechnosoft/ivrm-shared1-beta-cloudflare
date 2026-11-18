// app/dashboard/transaction/lostbook/_components/columns.tsx
'use client';

import { Badge } from '@/components/ui/badge';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import type { ILostBookList } from '@/types/library/transactions/transactions';
import type { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { useCallback } from 'react';

export const lostBookColumns: ColumnDef<ILostBookList>[] = [
    {
        accessorKey: 'index',
        header: 'SL.No.',
        cell: ({ row }) => {
            return row.index + 1;
        },
        size: 80
    },
    {
        accessorKey: 'lmbanO_AccessionNo',
        header: 'Accession No.',
        cell: ({ row }) => {
            return <div className='font-medium text-blue-600'>{row.getValue('lmbanO_AccessionNo')}</div>;
        }
    },
    {
        accessorKey: 'lmB_BookTitle',
        header: 'Book Title',
        cell: ({ row }) => {
            return (
                <div className='max-w-xs truncate' title={row.getValue('lmB_BookTitle')}>
                    {row.getValue('lmB_BookTitle')}
                </div>
            );
        }
    },
    {
        accessorKey: 'lmbanO_AvialableStatus',
        header: 'Book Status',
        cell: ({ row }) => {
            const status = row.getValue('lmbanO_AvialableStatus') as string;
            return (
                <Badge variant={status === 'lost' ? 'destructive' : 'outline'} className='capitalize'>
                    {status}
                </Badge>
            );
        }
    },
    {
        accessorKey: 'lmbanO_AmountCollected',
        header: 'Fine Amount',
        cell: ({ row }) => {
            const amount = row.getValue('lmbanO_AmountCollected') as number;
            return <div className='font-medium'>₹{amount?.toLocaleString('en-IN') || '0'}</div>;
        }
    },
    {
        accessorKey: 'lmbanO_ModeOfPayment',
        header: 'Payment',
        cell: ({ row }) => {
            const mode = row.getValue('lmbanO_ModeOfPayment') as string;
            return <Badge variant='secondary'>{mode}</Badge>;
        }
    },
    {
        accessorKey: 'lmbanO_LostDamagedReason',
        header: 'Reason',
        cell: ({ row }) => {
            return <div className='max-w-xs truncate'>{row.getValue('lmbanO_LostDamagedReason') || '-'}</div>;
        }
    },
    {
        accessorKey: 'lmbanO_LostDamagedDate',
        header: 'Lost Date',
        cell: ({ row }) => {
            const date = row.getValue('lmbanO_LostDamagedDate') as string;
            return date ? format(new Date(date), 'dd/MM/yyyy') : '-';
        }
    },
    {
        accessorKey: 'borrowerType',
        header: 'Status',
        cell: ({ row }) => {
            const book = row.original;
            let type = '';
            if (book.std) type = 'Student';
            else if (book.staff) type = 'Staff';
            else if (book.dept) type = 'Department';

            return type ? (
                <Badge variant='outline' className='border-blue-200 bg-blue-50 text-blue-700'>
                    {type}
                </Badge>
            ) : (
                '-'
            );
        }
    },
    {
        accessorKey: 'borrowerName',
        header: 'Name',
        cell: ({ row }) => {
            const book = row.original;
            let name = '';
            if (book.std) {
                name = book.std.includes(':') ? book.std.split(':')[0].trim() : book.std;
            } else if (book.staff) name = book.staff;
            else if (book.dept) name = book.dept;

            return <div className='font-medium text-gray-700'>{name || '-'}</div>;
        }
    },
    {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => <ActionButtonsCell rowData={row.original} />,
        size: 120
    }
];

function ActionButtonsCell({ rowData }: { rowData: ILostBookList }) {
    const { openEditForm, openDeleteForm, openToggleForm } = useFormContext<ILostBookList>();

    const handleEdit = useCallback(() => {
        openEditForm(rowData);
    }, [openEditForm, rowData]);

    const handleDelete = useCallback(() => {
        openDeleteForm(rowData);
    }, [openDeleteForm, rowData]);

    const handleToggle = useCallback(() => {
        openToggleForm(rowData);
    }, [openToggleForm, rowData]);

    return (
        <ActionButtons
            rowData={rowData}
            buttons={{ edit: true, toggle: true, delete: true }}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onToggle={handleToggle}
            toggleConditionKey='lmB_ActiveFlag'
        />
    );
}
