'use client';

import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import type { IRackReportGridData } from '@/types/library/reports/rack-report';
import type { ColumnDef } from '@tanstack/react-table';

export const RackReportColumns: ColumnDef<IRackReportGridData>[] = [
    {
        id: 'slNo',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Sl. No.' />,
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
        header: ({ column }) => <DataTableColumnHeader column={column} title='Accession No' />,
        cell: ({ row }) => {
            const d = row.original as any;
            return <div>{d.lmbanO_AccessionNo || d.lmbano_AccessionNo || d.accessionNo || ''}</div>;
        },
        enableSorting: true
    },
    {
        accessorKey: 'lmB_BookTitle',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Book Title' />,
        cell: ({ row }) => {
            const d = row.original as any;
            return <div>{d.lmB_BookTitle || d.lmb_BookTitle || d.bookTitle || ''}</div>;
        },
        enableSorting: true
    },
    {
        accessorKey: 'rack_Name',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Rack Name' />,
        cell: ({ row }) => {
            const d = row.original as any;
            return <div>{d.rack_Name || d.lmrA_RackName || d.rackName || ''}</div>;
        },
        enableSorting: true
    },
    {
        accessorKey: 'lmrA_FloorName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Floor Name' />,
        cell: ({ row }) => {
            const d = row.original as any;
            return <div>{d.lmrA_FloorName || d.lmra_FloorName || d.floorName || ''}</div>;
        },
        enableSorting: true
    },
    {
        accessorKey: 'lmB_BookType',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Book Type' />,
        cell: ({ row }) => {
            const d = row.original as any;
            return <div>{d.lmB_BookType || d.lmb_BookType || d.bookType || ''}</div>;
        },
        enableSorting: true
    },
    {
        accessorKey: 'rack_Location',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Location' />,
        cell: ({ row }) => {
            const d = row.original as any;
            return <div>{d.rack_Location || d.location || ''}</div>;
        },
        enableSorting: true
    },
    {
        accessorKey: 'lmbanO_AvialableStatus',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Book Status' />,
        cell: ({ row }) => {
            const d = row.original as any;
            return <div>{d.lmbanO_AvialableStatus || d.lmbano_AvialableStatus || d.bookStatus || d.status || ''}</div>;
        },
        enableSorting: true
    }
];
