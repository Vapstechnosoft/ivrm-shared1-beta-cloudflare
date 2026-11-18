'use client';

import { getStatusBadge } from '@/components/extras/helpers/helper';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import type { IMasterClassList } from '@/types/admission/preadmission/masters';
import type { ColumnDef } from '@tanstack/react-table';
import { useCallback } from 'react';

export const masterClassColumns: ColumnDef<IMasterClassList>[] = [
    {
        accessorKey: 'asmcL_Id',
        header: ({ column }) => <DataTableColumnHeader column={column} title='SL. No.' className='w-full pl-6 font-bold text-black' />,
        cell: ({ row, table }) => {
            const pageIndex = table.getState().pagination.pageIndex;
            const pageSize = table.getState().pagination.pageSize;
            const continuousIndex = pageIndex * pageSize + row.index + 1;
            return <div className='w-full pl-6'>{continuousIndex}</div>;
        },
        enableSorting: true,
        enableHiding: false
    },
    {
        accessorKey: 'asmcL_ClassName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Class Name' className='font-bold text-black' />,
        cell: ({ row }) => <div>{row.getValue('asmcL_ClassName')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'asmcL_ClassCode',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Class Code' className='font-bold text-black' />,
        cell: ({ row }) => <div>{row.getValue('asmcL_ClassCode')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'asmcL_MaxCapacity',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Class Capacity' className='font-bold text-black' />,
        cell: ({ row }) => <div>{row.getValue('asmcL_MaxCapacity')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'asmcL_Order',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Class Order' className='font-bold text-black' />,
        cell: ({ row }) => <div>{row.getValue('asmcL_Order')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'asmcL_MaxAgeYear',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Class Max Year' className='font-bold text-black' />,
        cell: ({ row }) => <div>{row.getValue('asmcL_MaxAgeYear')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'asmcL_MaxAgeMonth',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Class Max Month' className='font-bold text-black' />,
        cell: ({ row }) => <div>{row.getValue('asmcL_MaxAgeMonth')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'asmcL_MaxAgeDays',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Class Max Days' className='font-bold text-black' />,
        cell: ({ row }) => <div>{row.getValue('asmcL_MaxAgeDays')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'asmcL_MinAgeYear',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Class Min Year' className='font-bold text-black' />,
        cell: ({ row }) => <div>{row.getValue('asmcL_MinAgeYear')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'asmcL_MinAgeMonth',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Class Min Month' className='font-bold text-black' />,
        cell: ({ row }) => <div>{row.getValue('asmcL_MinAgeMonth')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'asmcL_MinAgeDays',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Class Min Days' className='font-bold text-black' />,
        cell: ({ row }) => <div>{row.getValue('asmcL_MinAgeDays')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        id: 'active_inactive',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Active/InActive' className='text-center font-bold text-black' />,
        accessorFn: (row: any) => row,
        enableSorting: false,
        cell: ({ row }) => <ActiveToggleCell rowData={row.original} />
    },
    {
        id: 'actions',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Action' className='text-center font-bold text-black' />,
        accessorFn: (row: any) => row,
        enableSorting: false,
        cell: ({ row }) => <ActionButtonsCell rowData={row.original} />
    }
];

function ActiveToggleCell({ rowData }: { rowData: IMasterClassList }) {
    const { openToggleForm } = useFormContext<IMasterClassList>();

    const handleToggle = useCallback(
        (data: IMasterClassList) => {
            openToggleForm(data);
        },
        [openToggleForm]
    );

    return (
        <ActionButtons
            rowData={rowData}
            buttons={{ edit: false, toggle: true, delete: false }}
            onToggle={handleToggle}
            toggleConditionKey='asmcL_ActiveFlag'
        />
    );
}

function ActionButtonsCell({ rowData }: { rowData: IMasterClassList }) {
    const { openEditForm } = useFormContext<IMasterClassList>();

    const handleEdit = useCallback(
        (data: IMasterClassList) => {
            openEditForm(data);
            window.history.pushState(null, '', `?asmcl_id=${data.asmcL_Id}`);
        },
        [openEditForm]
    );

    return (
        <ActionButtons
            rowData={rowData}
            buttons={{ edit: true, toggle: false, delete: false }}
            onEdit={handleEdit}
        />
    );
}
