'use client';

import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import type { BookRegisterPayload } from '@/types/library/masters/bookRegister';
import type { ColumnDef } from '@tanstack/react-table';
import { useCallback } from 'react';

export const BookRegisterColumns: ColumnDef<BookRegisterPayload>[] = [
    {
        id: 'slNo',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Sl. No' className='w-full pl-4' />,
        cell: ({ row, table }) => {
            const pageIndex = table.getState().pagination.pageIndex;
            const pageSize = table.getState().pagination.pageSize;
            const continuousIndex = pageIndex * pageSize + row.index + 1;
            return <div className='w-full pl-4'>{continuousIndex}</div>;
        },
        size: 70,
        enableSorting: false,
        enableHiding: false,
        enableGlobalFilter: false
    },
    {
        id: 'lmB_BookTitle',
        accessorFn: (row: any) => row.lmB_BookTitle || row.LMB_BookTitle || row.lmb_BookTitle || '',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Book Title' />,
        cell: ({ row }) => <div className='min-w-[150px]'>{(row.getValue('lmB_BookTitle') as string) || '-'}</div>
    },
    {
        id: 'lmbanO_AccessionNo',
        accessorFn: (row: any) => row.lmbanO_AccessionNo || row.LMBANO_AccessionNo || row.lmbano_AccessionNo || '',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Accession No' />,
        cell: ({ row }) => <div>{(row.getValue('lmbanO_AccessionNo') as string) || '-'}</div>,
        size: 100
    },
    {
        id: 'lmP_PublisherName',
        accessorFn: (row: any) => row.lmP_PublisherName || row.LMP_PublisherName || row.lmp_PublisherName || '',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Publisher Name' />,
        cell: ({ row }) => <div>{(row.getValue('lmP_PublisherName') as string) || '-'}</div>
    },
    {
        id: 'lmD_DepartmentName',
        accessorFn: (row: any) => row.lmD_DepartmentName || row.LMD_DepartmentName || row.lmd_DepartmentName || '',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Dept Name' />,
        cell: ({ row }) => <div>{(row.getValue('lmD_DepartmentName') as string) || '-'}</div>
    },
    {
        id: 'lmS_SubjectName',
        accessorFn: (row: any) => row.lmS_SubjectName || row.LMS_SubjectName || row.lms_SubjectName || '',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Subject Name' />,
        cell: ({ row }) => <div>{(row.getValue('lmS_SubjectName') as string) || '-'}</div>
    },
    {
        id: 'lmL_LanguageName',
        accessorFn: (row: any) => row.lmL_LanguageName || row.LML_LanguageName || row.lml_LanguageName || '',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Language' />,
        cell: ({ row }) => <div>{(row.getValue('lmL_LanguageName') as string) || '-'}</div>
    },
    {
        id: 'lmrA_RackName',
        accessorFn: (row: any) => row.lmrA_RackName || row.LMRA_RackName || row.lmra_RackName || '',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Rack name' />,
        cell: ({ row }) => <div>{(row.getValue('lmrA_RackName') as string) || '-'}</div>
    },
    {
        id: 'lmbanO_AvialableStatus',
        accessorFn: (row: any) =>
            row.lmbanO_AvialableStatus ||
            row.LMBANO_AvialableStatus ||
            row.lmbanO_AvailableStatus ||
            row.LMBANO_AvailableStatus ||
            'Available',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Status' />,
        cell: ({ row }) => {
            const status = (row.getValue('lmbanO_AvialableStatus') || 'Available') as string;
            return (
                <Badge
                    variant={
                        status === 'Available'
                            ? 'default'
                            : status === 'lost'
                              ? 'destructive'
                              : status === 'Issued'
                                ? 'secondary'
                                : 'outline'
                    }>
                    {status}
                </Badge>
            );
        }
    },
    {
        id: 'authoR_FullName',
        accessorFn: (row: any) =>
            row.authoR_FullName ||
            row.AUTHOR_FullName ||
            row.author_FullName ||
            row.lmaU_AuthorFirstName ||
            row.LMAU_AuthorFirstName ||
            row.lmB_AuthorFirstName ||
            row.LMB_AuthorFirstName ||
            '',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Author Name' />,
        cell: ({ row }) => {
            const author = (row.getValue('authoR_FullName') as string) || '-';
            return <div>{author}</div>;
        }
    },
    {
        id: 'mB_Remarks',
        accessorFn: (row: any) => row.mB_Remarks || row.MB_Remarks || row.mb_Remarks || '',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Remark' />,
        cell: ({ row }) => <div>{(row.getValue('mB_Remarks') as string) || '-'}</div>
    },
    {
        id: 'actions',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Action' className='text-start' />,
        accessorFn: (row: any) => row,
        enableSorting: false,
        enableGlobalFilter: false,
        cell: ({ row }) => <ActionButtonsCell rowData={row.original} />,
        size: 150
    }
];

function ActionButtonsCell({ rowData }: { rowData: BookRegisterPayload }) {
    const { openToggleForm, openEditForm, openCopyForm } = useFormContext<BookRegisterPayload>();

    const handleToggle = useCallback(
        (data: BookRegisterPayload) => {
            openToggleForm(data);
        },
        [openToggleForm]
    );

    const handleEdit = useCallback((data: BookRegisterPayload) => openEditForm(data), [openEditForm]);

    const handleCopy = useCallback(
        (data: BookRegisterPayload) => {
            openCopyForm(data);
        },
        [openCopyForm]
    );

    const accFlag =
        rowData.lmbanO_ActiveFlag ??
        (rowData as any).LMBANO_ActiveFlag ??
        (rowData as any).lmbanO_activeFlag ??
        (rowData as any).LMBANO_activeFlag ??
        rowData.mB_ActiveFlag ??
        (rowData as any).MB_ActiveFlag;

    const normalizedRowData = {
        ...rowData,
        lmbanO_ActiveFlag: accFlag === true || accFlag === 1 || accFlag === 'true' || accFlag === '1'
    };

    return (
        <ActionButtons
            rowData={normalizedRowData}
            buttons={{ edit: true, toggle: true, delete: false, copy: true }}
            onToggle={handleToggle}
            onEdit={handleEdit}
            onCopy={handleCopy}
            toggleConditionKey='lmbanO_ActiveFlag'
            className='justify-start'
        />
    );
}
