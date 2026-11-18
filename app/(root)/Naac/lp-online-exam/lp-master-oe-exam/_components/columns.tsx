'use client';

import { getStatusBadge } from '@/components/extras/helpers/helper';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import type { IMasterOEExam } from '@/types/naac/lp-online-exam/masters';
import type { ColumnDef } from '@tanstack/react-table';
import { useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Link2 } from 'lucide-react';

export const masterOEExamColumns = (onMapOpen: (exam: IMasterOEExam) => void): ColumnDef<IMasterOEExam>[] => [
    {
        accessorKey: 'slNo',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Sl.No' />,
        cell: ({ row, table }) => {
            const pageIndex = table.getState().pagination.pageIndex;
            const pageSize = table.getState().pagination.pageSize;
            return <div className='font-medium'>{pageIndex * pageSize + row.index + 1}</div>;
        },
        enableSorting: false,
        size: 70
    },
    {
        accessorKey: 'lpmoeeX_ExamName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Exam Name' />,
        cell: ({ row }) => (
            <div className='font-semibold text-primary'>
                {row.getValue('lpmoeeX_ExamName') || (row.original as any).LPMOEEX_ExamName || 'N/A'}
            </div>
        ),
        enableSorting: true
    },
    {
        accessorKey: 'asmaY_Year',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Academic Year' />,
        cell: ({ row }) => <div>{row.getValue('asmaY_Year') || (row.original as any).ASMAY_Year || '-'}</div>,
        enableSorting: true
    },
    {
        accessorKey: 'asmcL_ClassName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Class' />,
        cell: ({ row }) => <div>{row.getValue('asmcL_ClassName') || (row.original as any).ASMCL_ClassName || '-'}</div>,
        enableSorting: true
    },
    {
        accessorKey: 'ismS_SubjectName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Subject' />,
        cell: ({ row }) => <div>{row.getValue('ismS_SubjectName') || (row.original as any).ISMS_SubjectName || '-'}</div>,
        enableSorting: true
    },
    {
        accessorKey: 'lpmoeeX_TotalMarks',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Total Marks' className='text-center' />,
        cell: ({ row }) => (
            <div className='text-center font-medium'>
                {row.getValue('lpmoeeX_TotalMarks') ?? (row.original as any).LPMOEEX_TotalMarks ?? '-'}
            </div>
        ),
        enableSorting: true,
        size: 120
    },
    {
        accessorKey: 'lpmoeeX_NoOfQuestion',
        header: ({ column }) => <DataTableColumnHeader column={column} title='No. of Questions' className='text-center' />,
        cell: ({ row }) => (
            <div className='text-center font-medium'>
                {row.getValue('lpmoeeX_NoOfQuestion') ?? (row.original as any).LPMOEEX_NoOfQuestion ?? '-'}
            </div>
        ),
        enableSorting: true,
        size: 140
    },
    {
        accessorKey: 'lpmoeeX_ActiveFlg',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Status' />,
        cell: ({ row }) => getStatusBadge((row.getValue('lpmoeeX_ActiveFlg') ?? (row.original as any).LPMOEEX_ActiveFlg) ? 'active' : 'inactive'),
        enableSorting: true,
        size: 100
    },
    {
        id: 'actions',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Actions' className='text-center' />,
        accessorFn: (row: any) => row,
        enableSorting: false,
        size: 150,
        cell: ({ row }) => <ActionButtonsCell rowData={row.original} onMapOpen={onMapOpen} />
    }
];

function ActionButtonsCell({ rowData, onMapOpen }: { rowData: IMasterOEExam, onMapOpen: (exam: IMasterOEExam) => void }) {
    const { openEditForm, openToggleForm } = useFormContext<IMasterOEExam>();

    const handleEdit = useCallback(
        (data: IMasterOEExam) => openEditForm(data),
        [openEditForm]
    );

    const handleToggle = useCallback(
        (data: IMasterOEExam) => openToggleForm(data),
        [openToggleForm]
    );

    return (
        <div className="flex items-center justify-center gap-1">
            <Button
                variant="ghost"
                size="icon"
                onClick={() => onMapOpen(rowData)}
                title="Map Questions"
                className="h-8 w-8 text-primary hover:bg-primary/10 hover:text-primary"
            >
                <Link2 className="h-4 w-4" />
            </Button>
            <ActionButtons
                rowData={rowData}
                onEdit={handleEdit}
                onToggle={handleToggle}
                isActive={rowData.lpmoeeX_ActiveFlg}
                showView={false}
                showDelete={false}
            />
        </div>
    );
}
