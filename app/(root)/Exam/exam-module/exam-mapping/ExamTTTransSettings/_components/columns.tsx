'use client';

import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import type { IExamTTTransSettings } from '@/types/exam/exam-module/exam-mapping';
import type { ColumnDef } from '@tanstack/react-table';
import { Eye } from 'lucide-react';
import { useCallback } from 'react';

export const ExamTTTransSettingsColumns: ColumnDef<IExamTTTransSettings>[] = [
    {
        accessorKey: 'slno',
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
        accessorKey: 'academicyear',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Academic Year' />,
        cell: ({ row }) => <div>{row.getValue('academicyear')}</div>
    },
    {
        accessorKey: 'classname',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Class' />,
        cell: ({ row }) => <div>{row.getValue('classname')}</div>
    },
    {
        accessorKey: 'sectionname',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Section' />,
        cell: ({ row }) => <div>{row.getValue('sectionname')}</div>
    },
    {
        accessorKey: 'emG_GroupName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Subject Group' />,
        cell: ({ row }) => <div>{row.getValue('emG_GroupName')}</div>
    },
    {
        accessorKey: 'examname',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Exam' />,
        cell: ({ row }) => <div>{row.getValue('examname')}</div>
    },
    {
        accessorKey: 'extT_FromDate',
        header: ({ column }) => <DataTableColumnHeader column={column} title='From Date' />,
        cell: ({ row }) => {
            const val = row.getValue('extT_FromDate') as string | undefined;
            return <div>{val?.split('T')[0] || '-'}</div>;
        }
    },
    {
        accessorKey: 'extT_EndDate',
        header: ({ column }) => <DataTableColumnHeader column={column} title='To Date' />,
        cell: ({ row }) => {
            const val = row.getValue('extT_EndDate') as string | undefined;
            return <div>{val?.split('T')[0] || '-'}</div>;
        }
    },
    {
        id: 'actions',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Actions' className='text-center' />,
        accessorFn: (row) => row,
        enableSorting: false,
        cell: ({ row }) => <ActionButtonsCell rowData={row.original} />
    }
];

function ActionButtonsCell({ rowData }: { rowData: IExamTTTransSettings }) {
    const { openEditForm, openDetailsView } = useFormContext<IExamTTTransSettings>();

    const handleEdit = useCallback(() => openEditForm(rowData), [openEditForm, rowData]);
    const handleView = useCallback(() => openDetailsView(rowData), [openDetailsView, rowData]);

    return (
        <div className='flex justify-center gap-2'>
            <button type='button' onClick={handleView} className='rounded-md p-2 transition hover:bg-muted' title='View Records'>
                <Eye className='h-4 w-4 text-blue-600' />
            </button>
            <ActionButtons rowData={rowData} buttons={{ edit: true, delete: false, toggle: false }} onEdit={handleEdit} />
        </div>
    );
}
