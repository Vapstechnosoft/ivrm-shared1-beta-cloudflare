'use client';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import type { IExamTTSession } from '@/types/exam/exam-module/exam-mapping';
import type { ColumnDef } from '@tanstack/react-table';
import { Eye } from 'lucide-react';
import { useCallback } from 'react';

export const ExamTTSessionColumns: ColumnDef<IExamTTSession>[] = [
    {
        id: 'serialNumber',
        header: 'SL NO',
        cell: ({ row }) => <div className='text-center'>{row.index + 1}</div>,
        enableSorting: false,
        enableHiding: false,
        size: 60
    },
    {
        accessorKey: 'ettS_SessionName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Session Name' />,
        cell: ({ row }) => <div className='font-medium'>{row.original.ettS_SessionName}</div>,
        size: 200
    },
    {
        accessorKey: 'ettS_StartTime',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Start Time' />,
        cell: ({ row }) => <div>{row.original.ettS_StartTime}</div>,
        size: 150
    },
    {
        accessorKey: 'ettS_EndTime',
        header: ({ column }) => <DataTableColumnHeader column={column} title='End Time' />,
        cell: ({ row }) => <div>{row.original.ettS_EndTime}</div>,
        size: 150
    },
    {
        id: 'actions',
        header: () => <div className='text-center'>Actions</div>,
        cell: ({ row }) => <ActionButtonsCell rowData={row.original} />,
        size: 100,
        enableSorting: false,
        enableHiding: false
    }
];

function ActionButtonsCell({ rowData }: { rowData: IExamTTSession }) {
    const { openEditForm, openDeleteForm, openToggleForm, openDetailsView } = useFormContext<IExamTTSession>();

    const handleEdit = useCallback(() => openEditForm(rowData), [openEditForm, rowData]);
    const handleDelete = useCallback(() => openDeleteForm(rowData), [openDeleteForm, rowData]);
    const handleToggle = useCallback(() => openToggleForm(rowData), [openToggleForm, rowData]);
    const handleView = useCallback(() => openDetailsView(rowData), [openDetailsView, rowData]);

    return (
        <div className='flex justify-center gap-2'>
            {/*  View button */}
            <button type='button' onClick={handleView} className='rounded-md p-2 transition hover:bg-muted' title='View Mapping Details'>
                <Eye className='h-4 w-4 text-blue-600' />
            </button>

            {/*  Edit,  Toggle,  Delete buttons */}
            <ActionButtons
                rowData={rowData}
                buttons={{ edit: true, delete: false, toggle: true }}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onToggle={handleToggle}
                toggleConditionKey='eTTS_Activeflag'
            />
        </div>
    );
}
