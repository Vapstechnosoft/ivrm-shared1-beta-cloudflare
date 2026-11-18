'use client';

import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import type { ColumnDef } from '@tanstack/react-table';
import { useCallback } from 'react';

export interface IPeriodSubjectList {
    ttrpsU_Id: number;
    asmaY_Year: string;
    ttmP_PeriodName: string;
    ismS_SubjectName: string;
    ttrpsU_ActiveFlag: boolean;
    ttrpsU_SUbSelcFlag: boolean;
}

export const periodSubjectColumns: ColumnDef<IPeriodSubjectList>[] = [
    {
        accessorKey: 'ttrpsU_Id',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Sl.No' className='font-bold text-black' />,
        cell: ({ row, table }) => {
            const pageIndex = table.getState().pagination.pageIndex;
            const pageSize = table.getState().pagination.pageSize;
            const continuousIndex = pageIndex * pageSize + row.index + 1;
            return <div className='px-4 py-2'>{continuousIndex}</div>;
        },
        enableSorting: true,
        enableHiding: false
    },
    {
        accessorKey: 'asmaY_Year',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Academic Year' className='font-bold text-black' />,
        cell: ({ row }) => <div>{row.getValue('asmaY_Year')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'ttmP_PeriodName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Period' className='font-bold text-black' />,
        cell: ({ row }) => <div>{row.getValue('ttmP_PeriodName')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'ismS_SubjectName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Subject' className='font-bold text-black' />,
        cell: ({ row }) => <div>{row.getValue('ismS_SubjectName')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'ttrpsU_SUbSelcFlag',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Restriction Level' className='font-bold text-black' />,
        cell: ({ row }) => (
            <div className={`font-medium ${row.original.ttrpsU_SUbSelcFlag ? 'text-blue-600' : 'text-green-600'}`}>
                {row.original.ttrpsU_SUbSelcFlag ? 'Class-Section Wise' : 'General'}
            </div>
        ),
        enableSorting: true,
        enableHiding: true
    },
    {
        id: 'actions',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Actions' className='font-bold text-black' />,
        accessorFn: (row) => row,
        enableSorting: false,
        cell: ({ row }) => <ActionButtonsCell rowData={row.original} />
    }
];

function ActionButtonsCell({ rowData }: { rowData: IPeriodSubjectList }) {
    const { openEditForm, openToggleForm } = useFormContext<IPeriodSubjectList>();

    const handleEdit = useCallback(
        (data: IPeriodSubjectList) => {
            openEditForm(data);
        },
        [openEditForm]
    );

    const handleToggle = useCallback(
        (data: IPeriodSubjectList) => {
            if (openToggleForm) openToggleForm(data);
        },
        [openToggleForm]
    );

    return (
        <ActionButtons
            rowData={rowData}
            buttons={{ edit: true, toggle: true }}
            onEdit={handleEdit}
            onToggle={handleToggle}
            toggleConditionKey='ttrpsU_ActiveFlag'
        />
    );
}
