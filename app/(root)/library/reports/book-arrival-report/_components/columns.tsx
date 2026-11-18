'use client';

import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import type { IBookArrivalReportGridData } from '@/types/library/reports/book-arrival-report';
import type { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';

export const BookArrivalReportColumns: ColumnDef<IBookArrivalReportGridData>[] = [
    {
        id: 'slNo',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Sl.No' />,
        cell: ({ row, table }) => {
            const pageIndex = table.getState().pagination.pageIndex;
            const pageSize = table.getState().pagination.pageSize;
            const continuousIndex = pageIndex * pageSize + row.index + 1;
            return <div>{continuousIndex}</div>;
        },
        enableHiding: true,
        enableSorting: false
    },
    {
        accessorKey: 'lmbanO_AccessionNo',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Accession No.' />,
        cell: ({ row }) => <div>{row.getValue('lmbanO_AccessionNo')}</div>,
        enableSorting: true
    },
    {
        accessorKey: 'lmB_BookTitle',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Book Title' />,
        cell: ({ row }) => <div>{row.getValue('lmB_BookTitle')}</div>,
        enableSorting: true
    },
    {
        accessorKey: 'lmD_DepartmentName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Department Name' />,
        cell: ({ row }) => <div>{row.getValue('lmD_DepartmentName')}</div>,
        enableSorting: true
    },
    {
        accessorKey: 'authorName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Author Name' />,
        cell: ({ row }) => <div>{row.getValue('authorName')}</div>,
        enableSorting: true
    },
    {
        accessorKey: 'lmB_BookType',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Book Type' />,
        cell: ({ row }) => <div>{row.getValue('lmB_BookType')}</div>,
        enableSorting: true
    },
    {
        accessorKey: 'lmB_CallNo',
        header: ({ column }) => <DataTableColumnHeader column={column} title='CallNo' />,
        cell: ({ row }) => <div>{row.getValue('lmB_CallNo')}</div>,
        enableSorting: true
    },
    {
        accessorKey: 'lmB_PurchaseDate',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Purchase Date' />,
        cell: ({ row }) => {
            const date = row.getValue('lmB_PurchaseDate') as string;
            if (!date) return <div>-</div>;
            try {
                const d = new Date(date);
                return <div>{!Number.isNaN(d.getTime()) ? format(d, 'dd-MM-yyyy') : date}</div>;
            } catch {
                return <div>{date}</div>;
            }
        },
        enableSorting: true
    },
    {
        accessorKey: 'lmB_EntryDate',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Entry Date' />,
        cell: ({ row }) => {
            const date = row.getValue('lmB_EntryDate') as string;
            if (!date) return <div>-</div>;
            try {
                const d = new Date(date);
                return <div>{!Number.isNaN(d.getTime()) ? format(d, 'dd-MM-yyyy') : date}</div>;
            } catch {
                return <div>{date}</div>;
            }
        },
        enableSorting: true
    },
    {
        accessorKey: 'lmL_LanguageName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Language Name' />,
        cell: ({ row }) => <div>{row.getValue('lmL_LanguageName')}</div>,
        enableSorting: true
    }
];
