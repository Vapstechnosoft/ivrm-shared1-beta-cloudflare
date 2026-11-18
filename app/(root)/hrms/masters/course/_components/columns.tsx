'use client';

import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import type { IMasterCourseList } from '@/types/hrms/hrms-config/master';
import type { ColumnDef } from '@tanstack/react-table';
import { Check, X } from 'lucide-react';
import { useCallback } from 'react';

export const columns: ColumnDef<IMasterCourseList>[] = [
    {
        id: 'slNo',
        header: () => <div className='text-center font-medium'>Sl No</div>,
        cell: ({ row, table }) => {
            const pageIndex = table.getState().pagination.pageIndex;
            const pageSize = table.getState().pagination.pageSize;
            const continuousIndex = pageIndex * pageSize + row.index + 1;
            return <div className='text-center'>{continuousIndex}</div>;
        },
        enableSorting: false,
        size: 60
    },
    {
        accessorKey: 'hrmC_QulaificationName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Qualification Name' className='whitespace-nowrap' />,
        meta: { title: 'Qualification Name' }
    },
    {
        accessorKey: 'hrmC_QualificationDesc',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Description' className='whitespace-nowrap' />,
        meta: { title: 'Qualification Description' }
    },
    
    {
        accessorKey: 'hrmC_DefaultQualFag',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Default' className='whitespace-nowrap' />,
        meta: { title: 'Default Qual', disableSearch: true },
        cell: ({ row }) => (
            <div className='flex justify-center'>
                {row.original.hrmC_DefaultQualFag ? (
                    <span className='rounded-full bg-green-100 p-1 text-green-600 dark:bg-green-900/30 dark:text-green-400'>
                        <Check className='h-4 w-4' />
                    </span>
                ) : (
                    <span className='rounded-full bg-red-100 p-1 text-red-600 dark:bg-red-900/30 dark:text-red-400'>
                        <X className='h-4 w-4' />
                    </span>
                )}
            </div>
        )
    },
    {
        accessorKey: 'hrmC_SpecialisationFlag',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Has Specialization' className='whitespace-nowrap' />,
        meta: { title: 'Specialisation', disableSearch: true },
        cell: ({ row }) => (
            <div className='flex justify-center'>
                {row.original.hrmC_SpecialisationFlag ? (
                    <span className='rounded-full bg-green-100 p-1 text-green-600 dark:bg-green-900/30 dark:text-green-400'>
                        <Check className='h-4 w-4' />
                    </span>
                ) : (
                    <span className='rounded-full bg-red-100 p-1 text-red-600 dark:bg-red-900/30 dark:text-red-400'>
                        <X className='h-4 w-4' />
                    </span>
                )}
            </div>
        )
    },
    {
        accessorKey: 'hrmC_Order',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Order' className='whitespace-nowrap' />,
        meta: { title: 'Order' },
        filterFn: 'equalsString',
        cell: ({ row }) => {
            const orderValue = row.original.hrmC_Order;
            return <div>{orderValue ?? '-'}</div>;
        }
    },
    {
        id: 'actions',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Actions' className='whitespace-nowrap text-start' />,
        cell: ({ row }) => <ActionButtonsCell rowData={row.original} />,
        enableSorting: false
    }
];

function ActionButtonsCell({ rowData }: { rowData: IMasterCourseList }) {
    const { openEditForm, openToggleForm } = useFormContext<IMasterCourseList>();

    const handleEdit = useCallback(
        (data: IMasterCourseList) => {
            openEditForm(data as any);
        },
        [openEditForm]
    );

    const handleToggle = useCallback(
        (data: IMasterCourseList) => {
            openToggleForm(data);
        },
        [openToggleForm]
    );

    return (
        <ActionButtons
            rowData={rowData}
            buttons={{ edit: true, toggle: true, delete: false }}
            onEdit={handleEdit}
            onToggle={handleToggle}
            toggleConditionKey='hrmC_ActiveFlag'
        />
    );
}
