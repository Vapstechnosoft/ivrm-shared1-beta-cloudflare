'use client';

import { Checkbox } from '@/components/ui/checkbox';
import type { ColumnDef } from '@tanstack/react-table';

export const studentColumns: ColumnDef<any>[] = [
    {
        id: 'select',
        header: ({ table }) => (
            <Checkbox
                checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Select all"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: 'sno',
        header: 'SNO',
    },
    {
        accessorKey: 'studentName',
        header: 'Student Name',
    },
    {
        accessorKey: 'admno',
        header: 'Admno',
    },
    {
        accessorKey: 'section',
        header: 'Section',
    },
    {
        accessorKey: 'username',
        header: 'User Name',
    },
    {
        accessorKey: 'password',
        header: 'Password',
    },
    {
        accessorKey: 'mobileNo',
        header: 'Mobile No',
    },
    {
        accessorKey: 'emailId',
        header: 'Email Id',
    },
];
