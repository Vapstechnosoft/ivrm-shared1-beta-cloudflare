'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTableColumnHeader as ColumnHeader } from '@/components/ui/data-table-column-header';
import type { ColumnDef } from '@tanstack/react-table';
import { Eye } from 'lucide-react';

interface GetColumnsProps {
    onViewProfile: (id: number, name: string) => void;
}

export const getColumns = ({ onViewProfile }: GetColumnsProps): ColumnDef<any>[] => [
    {
        id: 'select',
        header: ({ table }) => {
            const allRows = table.getRowModel().rows;
            const selectableRows = allRows.filter((r) => !r.original.checktru);
            const isAllSelected = selectableRows.length > 0 && selectableRows.every((r) => r.getIsSelected());
            const isSomeSelected = selectableRows.some((r) => r.getIsSelected());
            return (
                <div className='flex justify-center'>
                    <Checkbox
                        checked={isAllSelected || (isSomeSelected && 'indeterminate')}
                        onCheckedChange={(value) => {
                            const currentSelection = table.getState().rowSelection;
                            const newSelection = { ...currentSelection };

                            allRows.forEach((row) => {
                                if (!row.original.checktru) {
                                    if (value) {
                                        newSelection[row.id] = true;
                                    } else {
                                        delete newSelection[row.id];
                                    }
                                }
                            });

                            table.setRowSelection(newSelection);
                        }}
                        disabled={selectableRows.length === 0}
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
                    disabled={row.original.checktru}
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
        header: ({ column }) => <ColumnHeader column={column} title='Sl.No' className='text-left font-bold text-black' />,
        cell: ({ row, table }) => {
            const pageIndex = table.getState().pagination.pageIndex;
            const pageSize = table.getState().pagination.pageSize;
            return <div className='text-left'>{pageIndex * pageSize + row.index + 1}</div>;
        },
        enableSorting: false,
        enableHiding: false
    },
    {
        accessorKey: 'studentname',
        header: ({ column }) => <ColumnHeader column={column} title='Alumni Name' className='text-center font-bold text-black' />
    },
    {
        accessorKey: 'ASMAY_Year',
        header: ({ column }) => <ColumnHeader column={column} title='Batch' className='text-center font-bold text-black' />
    },
    {
        accessorKey: 'Status',
        header: ({ column }) => <ColumnHeader column={column} title='Status' className='text-center font-bold text-black' />,
        cell: ({ row }) => {
            const acceptFlag = row.original.ALSFRND_AcceptFlag;
            const requestDate = row.original.ALSFRND_RequestDate;

            if (acceptFlag === 'ACCEPT') {
                return (
                    <span className='font-medium text-green-600 italic' title='Accepted'>
                        Accepted
                    </span>
                );
            }
            if (acceptFlag === 'REJECT') {
                return (
                    <span className='font-medium text-red-600 italic' title='Rejected'>
                        Rejected
                    </span>
                );
            }
            if (requestDate) {
                return (
                    <span className='font-medium text-pink-600 italic' title='Requesting...'>
                        Requesting...
                    </span>
                );
            }
            return <span className='text-muted-foreground text-xs italic'>-</span>;
        }
    },
    {
        id: 'actions',
        header: ({ column }) => <ColumnHeader column={column} title='View' className='text-center font-bold text-black' />,
        cell: ({ row }) => {
            const acceptFlag = row.original.ALSFRND_AcceptFlag;
            const isAccepted = acceptFlag === 'ACCEPT';

            if (!isAccepted) return null;

            return (
                <div className='flex justify-center'>
                    <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => onViewProfile(row.original.ALMST_Id, row.original.studentname)}
                        className='text-primary hover:bg-primary/5 hover:text-primary/80'>
                        <Eye className='mr-1 h-4 w-4' /> View
                    </Button>
                </div>
            );
        }
    }
];
