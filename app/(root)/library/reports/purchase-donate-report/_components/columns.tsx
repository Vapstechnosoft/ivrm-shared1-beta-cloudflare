'use client';

import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import type { IPurchaseDonateReportGridData } from '@/types/library/reports/purchase-donate-report';
import type { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';

export const columns: ColumnDef<IPurchaseDonateReportGridData>[] = [
    {
        id: 'slNo',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Sl.No' />,
        cell: ({ row, table }) => {
            const pageIndex = table.getState().pagination.pageIndex;
            const pageSize = table.getState().pagination.pageSize;
            return <div>{pageIndex * pageSize + row.index + 1}</div>;
        },
        enableHiding: true,
        enableSorting: false
    },
    {
        accessorKey: 'lmB_BookType',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Book Type' />,
        cell: ({ row }) => <div>{row.original.lmB_BookType || '-'}</div>,
        enableSorting: true
    },
    {
        accessorKey: 'lmbanO_AccessionNo',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Accession No' />,
        cell: ({ row }) => <div>{row.original.lmbanO_AccessionNo || '-'}</div>,
        enableSorting: true
    },
    {
        accessorKey: 'lmB_BookTitle',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Book Title' />,
        cell: ({ row }) => <div>{row.original.lmB_BookTitle || '-'}</div>,
        enableSorting: true
    },
    {
        accessorKey: 'name',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Author Name' />,
        cell: ({ row }) => <div>{row.original.name || '-'}</div>,
        enableSorting: true
    },
    {
        accessorKey: 'lmV_VendorName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Vendor / Donor Name' />,
        cell: ({ row }) => <div>{row.original.lmV_VendorName || '-'}</div>,
        enableSorting: true
    },
    {
        accessorKey: 'lmB_PurchaseDate',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Date' />,
        cell: ({ row }) => {
            const date = row.original.lmB_PurchaseDate;
            if (!date) return <div>-</div>;
            try {
                const parsed = new Date(date);
                if (Number.isNaN(parsed.getTime())) return <div>{String(date)}</div>;
                return <div>{format(parsed, 'dd/MM/yyyy')}</div>;
            } catch {
                return <div>{String(date)}</div>;
            }
        },
        enableSorting: true
    },
    {
        accessorKey: 'lmB_NoOfCopies',
        header: ({ column }) => <DataTableColumnHeader column={column} title='No. of Copies' />,
        cell: ({ row }) => <div>{row.original.lmB_NoOfCopies ?? 0}</div>,
        enableSorting: true
    },
    {
        accessorKey: 'lmB_Price',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Price' />,
        cell: ({ row }) => <div>{row.original.lmB_Price ?? 0}</div>,
        enableSorting: true
    },
    {
        accessorKey: 'lmB_Discount',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Discount' />,
        cell: ({ row }) => <div>{row.original.lmB_Discount ?? 0}</div>,
        enableSorting: true
    },
    {
        accessorKey: 'lmB_NetPrice',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Net Amount' />,
        cell: ({ row }) => <div>{row.original.lmB_NetPrice ?? 0}</div>,
        enableSorting: true
    }
];
