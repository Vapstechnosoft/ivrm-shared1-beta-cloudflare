'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTableColumnHeader as ColumnHeader } from '@/components/ui/data-table-column-header';
import type { ColumnDef } from '@tanstack/react-table';
import { CheckCircle, Eye, XCircle } from 'lucide-react';

interface GetColumnsProps {
    onViewProfile: (id: number, name: string) => void;
}

export const getColumns = ({ onViewProfile }: GetColumnsProps): ColumnDef<any>[] => [
    {
        id: 'select',
        header: ({ table }) => {
            const allRows = table.getRowModel().rows;
            const isAllSelected = allRows.length > 0 && allRows.every((r) => r.getIsSelected());
            const isSomeSelected = allRows.some((r) => r.getIsSelected());

            return (
                <div className='flex justify-center'>
                    <Checkbox
                        checked={isAllSelected || (isSomeSelected && 'indeterminate')}
                        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                        disabled={allRows.length === 0}
                        aria-label='Select all'
                        className='translate-y-[2px]'
                    />
                </div>
            );
        },
        cell: ({ row }) => (
            <div className='flex justify-center'>
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label='Select row'
                    className='translate-y-[2px]'
                />
            </div>
        ),
        enableSorting: false,
        enableHiding: false
    },
    {
        accessorKey: 'sn',
        header: ({ column }) => <ColumnHeader column={column} title='SL No' className='text-center font-bold text-black' />,
        cell: ({ row, table }) => {
            const pageIndex = table.getState().pagination.pageIndex;
            const pageSize = table.getState().pagination.pageSize;
            return <div className='text-center'>{pageIndex * pageSize + row.index + 1}</div>;
        },
        enableSorting: false,
        enableHiding: false
    },
    {
        accessorKey: 'studentname',
        header: ({ column }) => <ColumnHeader column={column} title='Alumni Name' className='font-bold text-black' />
    },
    {
        accessorKey: 'ASMAY_Year',
        header: ({ column }) => <ColumnHeader column={column} title='Batch' className='font-bold text-black' />
    },
    {
        accessorKey: 'ALSFRND_AcceptFlag',
        header: ({ column }) => <ColumnHeader column={column} title='Status' className='font-bold text-black' />,
        cell: ({ row }) => {
            const acceptedDate = row.original.ALSFRND_AcceptedDate;
            const acceptFlag = row.original.ALSFRND_AcceptFlag;

            if (acceptedDate) {
                if (acceptFlag === 'ACCEPT') {
                    return (
                        <Badge variant='outline' className='border-green-200 bg-green-50 text-green-600'>
                            <CheckCircle className='mr-1 h-3 w-3' /> Accepted
                        </Badge>
                    );
                } else {
                    return (
                        <Badge variant='outline' className='border-destructive/20 bg-destructive/5 text-destructive'>
                            <XCircle className='mr-1 h-3 w-3' /> Rejected
                        </Badge>
                    );
                }
            } else {
                return (
                    <Badge variant='outline' className='border-amber-200 bg-amber-50 text-amber-600'>
                        In Progress
                    </Badge>
                );
            }
        }
    },
    {
        id: 'actions',
        header: ({ column }) => <ColumnHeader column={column} title='Action' className='text-center font-bold text-black' />,
        cell: ({ row }) => (
            <div className='flex justify-center'>
                <Button
                    variant='ghost'
                    size='icon'
                    onClick={() => onViewProfile(row.original.ALMST_Id, row.original.studentname)}
                    title='View Profile'>
                    <Eye className='h-4 w-4 text-primary' />
                </Button>
            </div>
        )
    }
];
