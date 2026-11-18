'use client';

import { Checkbox } from '@/components/ui/checkbox';
import type { ColumnDef } from '@tanstack/react-table';

export const getStudentColumns = (studentType: string): ColumnDef<any>[] => {
    const baseColumns: ColumnDef<any>[] = [
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
            accessorKey: 'courseName',
            header: 'Course',
        },
        {
            accessorKey: 'branchName',
            header: 'Branch',
        },
        {
            accessorKey: 'semName',
            header: 'Semester',
        }
    ];

    if (studentType === 'Student') {
        baseColumns.push({
            accessorKey: 'section',
            header: 'Section',
        });
    }

    return baseColumns;
};
