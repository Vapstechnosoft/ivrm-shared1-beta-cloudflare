'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import type { ColumnDef } from '@tanstack/react-table';

export const birthCertificateColumns: ColumnDef<any>[] = [
    {
        id: 'select',
        header: ({ table }) => (
            <Checkbox
                checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label='Select all'
            />
        ),
        cell: ({ row }) => (
            <Checkbox checked={row.getIsSelected()} onCheckedChange={(value) => row.toggleSelected(!!value)} aria-label='Select row' />
        ),
        enableSorting: false,
        enableHiding: false,
        size: 24
    },
    {
        accessorKey: 'stuFN',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Student Name' className='font-bold text-black' />,
        cell: ({ row }) => {
            const first = row.original.stuFN || row.original.stufn || '';
            const middle = row.original.stuMN || row.original.stumn || '';
            const last = row.original.stuLN || row.original.stuln || '';
            return <div>{`${first} ${middle} ${last}`.trim() || 'N/A'}</div>;
        },
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'admNo',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Admission No.' className='font-bold text-black' />,
        cell: ({ row }) => <div>{row.original.admNo || row.original.admno || 'N/A'}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'class',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Class' className='font-bold text-black' />,
        cell: ({ row }) => <div>{row.getValue('class') ?? row.original.className ?? 'N/A'}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'dob',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Date of Birth' className='font-bold text-black' />,
        cell: ({ row }) => {
            const dob = row.getValue('dob') ?? row.original.dob;
            if (!dob) return <div>N/A</div>;
            try {
                return <div>{new Date(dob as string).toLocaleDateString()}</div>;
            } catch {
                return <div>{String(dob)}</div>;
            }
        },
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'dobWord',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Date of Birth (Words)' className='font-bold text-black' />,
        cell: ({ row }) => <div>{row.original.dobWord || row.original.dobword || 'N/A'}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'fatherName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Father Name' className='font-bold text-black' />,
        cell: ({ row }) => <div>{row.original.fatherName || row.original.fathername || 'N/A'}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'motherName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Mother Name' className='font-bold text-black' />,
        cell: ({ row }) => <div>{row.original.motherName || row.original.mothername || 'N/A'}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'acadamicyear',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Academic Year' className='font-bold text-black' />,
        cell: ({ row }) => <div>{row.getValue('acadamicyear') ?? 'N/A'}</div>,
        enableSorting: true,
        enableHiding: true
    }
];
