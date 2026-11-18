'use client';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import { Switch } from '@/components/ui/switch';
import type { IMasterCategoryList } from '@/types/library/masters/masters';
import type { ColumnDef } from '@tanstack/react-table';
import { useCallback } from 'react';

export const masterCategoryColumns: ColumnDef<IMasterCategoryList>[] = [
    {
        accessorKey: 'lmC_Id',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Sl. No' className='pl-4' />,
        cell: ({ row, table }) => {
            const pageIndex = table.getState().pagination.pageIndex;
            const pageSize = table.getState().pagination.pageSize;

            return <div className='pl-4'>{pageIndex * pageSize + row.index + 1}</div>;
        },
        size: 80,
        enableSorting: false,
        enableHiding: false
    },
    {
        accessorKey: 'lmC_CategoryName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Category Name' />,
        cell: ({ row }) => <div className='min-w-[200px] truncate'>{row.getValue('lmC_CategoryName')}</div>
    },
    {
        accessorKey: 'lmC_CategoryCode',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Category Code' />,
        cell: ({ row }) => <div className='min-w-[120px] truncate'>{row.getValue('lmC_CategoryCode')}</div>
    },
    {
        accessorKey: 'lmC_BNBFlg',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Category Type' />,
        cell: ({ row }) => <div className='min-w-[100px]'>{row.getValue('lmC_BNBFlg')}</div>
    },
    {
        accessorKey: 'lmC_ActiveFlag',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Status' />,
        cell: ({ row }) => <StatusToggleCell rowData={row.original} />,
        size: 100
    },
    {
        id: 'actions',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Actions' className='pl-2' />,
        cell: ({ row }) => <ActionButtonsCell rowData={row.original} />,
        size: 180,
        enableSorting: false
    }
];

function StatusToggleCell({ rowData }: { rowData: IMasterCategoryList }) {
    const { openToggleForm } = useFormContext<IMasterCategoryList>();

    return (
        <div className='flex items-center space-x-2'>
            <Switch checked={rowData.lmC_ActiveFlag} onCheckedChange={() => openToggleForm(rowData)} aria-label='Toggle status' />
            <span className={`font-medium text-xs ${rowData.lmC_ActiveFlag ? 'text-green-600' : 'text-red-600'}`}>
                {rowData.lmC_ActiveFlag ? 'Active' : 'Inactive'}
            </span>
        </div>
    );
}

function ActionButtonsCell({ rowData }: { rowData: IMasterCategoryList }) {
    const { openToggleForm, openEditForm } = useFormContext<IMasterCategoryList>();

    const handleToggle = useCallback((data: IMasterCategoryList) => openToggleForm(data), [openToggleForm]);
    const handleEdit = useCallback((data: IMasterCategoryList) => openEditForm(data), [openEditForm]);

    return (
        <ActionButtons
            rowData={rowData}
            buttons={{ edit: true, toggle: false, delete: false }}
            onToggle={handleToggle}
            onEdit={handleEdit}
            toggleConditionKey='lmC_ActiveFlag'
            className='justify-start'
        />
    );
}
