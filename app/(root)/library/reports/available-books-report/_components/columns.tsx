'use client';

import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import type { IAvailableBooksReportGridData } from '@/types/library/reports/available-books-report';
import type { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';

export const AvailableBooksReportColumns: ColumnDef<IAvailableBooksReportGridData>[] = [
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
        accessorKey: 'lmB_EntryDate',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Entry Date' />,
        cell: ({ row }) => {
            const raw: any = row.original;
            const date = row.getValue('lmB_EntryDate') || raw?.lmB_EntryDate || raw?.LMB_EntryDate || raw?.entryDate;
            if (!date) return <div>-</div>;
            try {
                const d = new Date(date as string);
                return <div>{!Number.isNaN(d.getTime()) ? format(d, 'dd/MM/yyyy') : String(date)}</div>;
            } catch {
                return <div>{String(date)}</div>;
            }
        },
        enableSorting: true
    },
    {
        accessorKey: 'lmbanO_AccessionNo',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Accession No' />,
        cell: ({ row }) => {
            const raw: any = row.original;
            const val =
                row.getValue('lmbanO_AccessionNo') ?? raw?.lmbanO_AccessionNo ?? raw?.LMBANO_AccessionNo ?? raw?.lmbano_AccessionNo ?? '-';
            return <div>{val}</div>;
        },
        enableSorting: true
    },
    {
        accessorKey: 'lmB_BookTitle',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Title' />,
        cell: ({ row }) => {
            const raw: any = row.original;
            const val = row.getValue('lmB_BookTitle') ?? raw?.lmB_BookTitle ?? raw?.LMB_BookTitle ?? raw?.bookTitle ?? '-';
            return <div>{val}</div>;
        },
        enableSorting: true
    },
    {
        accessorKey: 'lmB_BookType',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Book Type' />,
        cell: ({ row }) => {
            const raw: any = row.original;
            const val = row.getValue('lmB_BookType') ?? raw?.lmB_BookType ?? raw?.LMB_BookType ?? raw?.bookType ?? '-';
            return <div>{val}</div>;
        },
        enableSorting: true
    },
    {
        accessorKey: 'lmD_DepartmentName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Department' />,
        cell: ({ row }) => {
            const raw: any = row.original;
            const val =
                row.getValue('lmD_DepartmentName') ?? raw?.lmD_DepartmentName ?? raw?.LMD_DepartmentName ?? raw?.departmentName ?? '-';
            return <div>{val}</div>;
        },
        enableSorting: true
    },
    {
        accessorKey: 'authorName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Author' />,
        cell: ({ row }) => {
            const raw: any = row.original;
            const val = row.getValue('authorName') ?? raw?.authorName ?? raw?.AuthorName ?? raw?.lma_AuthorName ?? '-';
            return <div>{val}</div>;
        },
        enableSorting: true
    },
    {
        accessorKey: 'lmP_PublisherName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Publisher' />,
        cell: ({ row }) => {
            const raw: any = row.original;
            const val = row.getValue('lmP_PublisherName') ?? raw?.lmP_PublisherName ?? raw?.LMP_PublisherName ?? raw?.publisherName ?? '-';
            return <div>{val}</div>;
        },
        enableSorting: true
    },
    {
        accessorKey: 'lmL_LanguageName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Language' />,
        cell: ({ row }) => {
            const raw: any = row.original;
            const val = row.getValue('lmL_LanguageName') ?? raw?.lmL_LanguageName ?? raw?.LML_LanguageName ?? raw?.languageName ?? '-';
            return <div>{val}</div>;
        },
        enableSorting: true
    },
    {
        accessorKey: 'lmS_SubjectName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Subject' />,
        cell: ({ row }) => {
            const raw: any = row.original;
            const val = row.getValue('lmS_SubjectName') ?? raw?.lmS_SubjectName ?? raw?.LMS_SubjectName ?? raw?.subjectName ?? '-';
            return <div>{val}</div>;
        },
        enableSorting: true
    },
    {
        accessorKey: 'lmB_PurOrDonated',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Purchased/Donated' />,
        cell: ({ row }) => {
            const raw: any = row.original;
            const val = row.getValue('lmB_PurOrDonated') ?? raw?.lmB_PurOrDonated ?? raw?.LMB_PurOrDonated ?? raw?.purOrDonated ?? '-';
            return <div>{val}</div>;
        },
        enableSorting: true
    }
];
