'use client';

import { Checkbox } from '@/components/ui/checkbox';
import type { ColumnDef } from '@tanstack/react-table';

export const attendance100Columns: ColumnDef<any>[] = [
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
        enableHiding: false
    },
    {
        accessorKey: 'serialNo',
        header: 'SL. No.',
        cell: ({ row }) => row.index + 1
    },
    {
        accessorKey: 'namme',
        header: 'Student Name'
    },
    {
        accessorKey: 'AMST_AdmNo',
        header: 'Admission No.'
    },
    {
        accessorKey: 'AMST_RegistrationNo',
        header: 'Registration No.'
    },
    {
        accessorKey: 'ASMCL_ClassName',
        header: 'Class Name'
    },
    {
        accessorKey: 'ASMC_SectionName',
        header: 'Section Name'
    },
    {
        accessorKey: 'classes',
        header: 'No. of Working days'
    },
    {
        accessorKey: 'attendance',
        header: 'No. of Present days'
    },
    {
        accessorKey: 'per',
        header: 'Present %'
    }
];
