'use client';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import type { IMasterGrade } from '@/types/exam/exam-module/masters';
import type { ColumnDef } from '@tanstack/react-table';
import { Eye } from 'lucide-react';
import { useCallback } from 'react';

export const MasterGradeColumns: ColumnDef<IMasterGrade>[] = [
    {
        accessorKey: 'slNo',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Sl.No' />,
        cell: ({ row, table }) => {
            const pageIndex = table.getState().pagination.pageIndex;
            const pageSize = table.getState().pagination.pageSize;
            const continuousIndex = pageIndex * pageSize + row.index + 1;
            return <div>{continuousIndex}</div>;
        },
        enableHiding: false,
        enableSorting: false
    },
    {
        accessorKey: 'emgR_GradeName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Grade Name' />,
        cell: ({ row }) => <div>{row.getValue('emgR_GradeName')}</div>
    },
    {
        id: 'emgR_MarksPerFlag',
        accessorFn: (row) => (row.emgR_MarksPerFlag?.toUpperCase() === 'P' ? 'Percentage' : 'Marks'),
        header: ({ column }) => <DataTableColumnHeader column={column} title='Marks/Percentage Flag' />,
        cell: ({ row }) => <div>{row.getValue('emgR_MarksPerFlag')}</div>
    },
    {
        id: 'actions',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Actions' className='text-center' />,
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => <ActionButtonsCell rowData={row.original} />
    }
];

function ActionButtonsCell({ rowData }: { rowData: IMasterGrade }) {
    const { openToggleForm, openEditForm, openDetailsView } = useFormContext<IMasterGrade>();

    const handleView = useCallback(() => {
        openDetailsView(rowData);
    }, [openDetailsView, rowData]);

    const handleEdit = useCallback(() => {
        openEditForm(rowData);
    }, [openEditForm, rowData]);

    const handleToggle = useCallback(() => {
        openToggleForm(rowData);
    }, [openToggleForm, rowData]);

    return (
        <div className='flex justify-center gap-2'>
            {/* 👁️ Eye icon for viewing grade details */}
            <button type='button' onClick={handleView} className='rounded-md p-2 transition hover:bg-muted' title='View Grade Details'>
                <Eye className='h-4 w-4 text-blue-600' />
            </button>

            <ActionButtons
                rowData={rowData}
                buttons={{ edit: true, toggle: true, delete: false }}
                onEdit={handleEdit}
                onToggle={handleToggle}
                toggleConditionKey='emgR_ActiveFlag'
            />
        </div>
    );
}
