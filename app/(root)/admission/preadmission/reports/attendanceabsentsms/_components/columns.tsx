'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import type { ColumnDef } from '@tanstack/react-table';

export const summaryColumns: ColumnDef<any>[] = [
    {
        accessorKey: 'RowNo',
        header: ({ column }) => <DataTableColumnHeader column={column} title='SL. No.' className='w-full pl-6 font-bold text-black' />,
        cell: ({ row, table }) => {
            const pageIndex = table.getState().pagination.pageIndex;
            const pageSize = table.getState().pagination.pageSize;
            return <div className='w-full pl-6 text-center'>{pageIndex * pageSize + row.index + 1}</div>;
        },
        enableSorting: false,
        enableHiding: false
    },
    {
        id: 'ClassName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Class' className='text-center font-bold text-black' />,
        cell: ({ row }) => <div className='text-center'>{row.original.ASMCL_ClassName}</div>,
        enableSorting: true,
        enableHiding: false
    },
    {
        id: 'SectionName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Section' className='text-center font-bold text-black' />,
        cell: ({ row }) => <div className='text-center'>{row.original.ASMC_SectionName}</div>,
        enableSorting: true,
        enableHiding: false
    },
    {
        accessorKey: 'TOTAL',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Strength' className='text-center font-bold text-black' />,
        cell: ({ row }) => <div className='text-center'>{row.getValue('TOTAL')}</div>,
        enableSorting: true,
        enableHiding: false
    },
    {
        accessorKey: 'PRESENT',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Present' className='text-center font-bold text-black' />,
        cell: ({ row }) => <div className='text-center'>{row.getValue('PRESENT')}</div>,
        enableSorting: true,
        enableHiding: false
    },
    {
        accessorKey: 'ABSENT',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Absent' className='text-center font-bold text-black' />,
        cell: ({ row }) => <div className='text-center'>{row.getValue('ABSENT')}</div>,
        enableSorting: true,
        enableHiding: false
    },
    {
        accessorKey: 'HALFDAY',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Half Day' className='text-center font-bold text-black' />,
        cell: ({ row }) => <div className='text-center'>{row.getValue('HALFDAY')}</div>,
        enableSorting: true,
        enableHiding: false
    }
];

export const getStudentColumns = (frequency: string): ColumnDef<any>[] => {
    const columns: ColumnDef<any>[] = [
        {
            id: 'select',
            header: ({ table }) => (
                <div className='flex w-full items-center justify-center'>
                    <Checkbox
                        checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
                        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                        aria-label='Select all'
                    />
                </div>
            ),
            cell: ({ row }) => (
                <div className='flex w-full items-center justify-center'>
                    <Checkbox
                        checked={row.getIsSelected()}
                        onCheckedChange={(value) => row.toggleSelected(!!value)}
                        aria-label='Select row'
                    />
                </div>
            ),
            enableSorting: false,
            enableHiding: false,
            size: 40
        }
    ];

    if (frequency === '1') {
        columns.push(
            {
                id: 'firstHalf',
                header: ({ column }) => (
                    <DataTableColumnHeader column={column} title='I Half' className='text-center font-bold text-black' />
                ),
                cell: ({ row }) => (
                    <div className='flex items-center justify-center'>
                        <Checkbox checked={row.original.FirstHalfflag} disabled />
                    </div>
                ),
                enableSorting: false,
                enableHiding: false
            },
            {
                id: 'secondHalf',
                header: ({ column }) => (
                    <DataTableColumnHeader column={column} title='II Half' className='text-center font-bold text-black' />
                ),
                cell: ({ row }) => (
                    <div className='flex items-center justify-center'>
                        <Checkbox checked={row.original.SecondHalfflag} disabled />
                    </div>
                ),
                enableSorting: false,
                enableHiding: false
            }
        );
    }

    columns.push(
        {
            accessorKey: 'RowNo',
            header: ({ column }) => <DataTableColumnHeader column={column} title='SL.No.' className='text-center font-bold text-black' />,
            cell: ({ row, table }) => {
                const pageIndex = table.getState().pagination.pageIndex;
                const pageSize = table.getState().pagination.pageSize;
                return <div className='text-center'>{pageIndex * pageSize + row.index + 1}</div>;
            },
            enableSorting: false,
            enableHiding: false
        },
        {
            accessorKey: 'class',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Class' className='text-center font-bold text-black' />,
            cell: ({ row }) => {
                const parts = ((row.getValue('classsection') as string) || '').split('-');
                return <div className='text-center'>{parts[0]}</div>;
            },
            enableSorting: true,
            enableHiding: false
        },
        {
            accessorKey: 'section',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Section' className='text-center font-bold text-black' />,
            cell: ({ row }) => {
                const parts = ((row.getValue('classsection') as string) || '').split('-');
                return <div className='text-center'>{parts[1] || ''}</div>;
            },
            enableSorting: true,
            enableHiding: false
        },
        {
            accessorKey: 'AMST_AdmNo',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Adm.No.' className='text-center font-bold text-black' />,
            cell: ({ row }) => <div className='text-center'>{row.getValue('AMST_AdmNo')}</div>,
            enableSorting: true,
            enableHiding: false
        },
        {
            accessorKey: 'studentname',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Student Name' className='font-bold text-black' />,
            cell: ({ row }) => <div>{row.getValue('studentname')}</div>,
            enableSorting: true,
            enableHiding: false
        }
    );

    return columns;
};
