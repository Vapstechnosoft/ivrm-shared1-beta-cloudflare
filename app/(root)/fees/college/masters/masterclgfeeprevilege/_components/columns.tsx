'use client';

import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import type { ICollegeFeePrivilegeList } from '@/types/fees/college/masters/masterclgfeeprevilege';
import type { ColumnDef } from '@tanstack/react-table';
import { useCallback } from 'react';

export const collegeFeePrivilegeColumns: ColumnDef<ICollegeFeePrivilegeList>[] = [
    {
        accessorKey: 'sno',
        header: ({ column }) => <DataTableColumnHeader column={column} title='SLNO' className='pl-4' />,
        cell: ({ row, table }) => {
            const pageIndex = table.getState().pagination.pageIndex;
            const pageSize = table.getState().pagination.pageSize;
            const continuousIndex = pageIndex * pageSize + row.index + 1;
            return <div className='pl-4 font-medium text-muted-foreground'>{continuousIndex}</div>;
        },
        enableSorting: false,
        enableHiding: false
    },
    {
        accessorKey: 'normalizedUserName',
        id: 'NormalizedUserName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='UserName' />,
        cell: ({ row }) => (
            <div className='font-medium'>
                {row.original.normalizedUserName ||
                    row.original.NormalizedUserName ||
                    row.original.userName ||
                    row.getValue('NormalizedUserName') ||
                    row.getValue('normalizedUserName') ||
                    'N.A'}
            </div>
        ),
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'fmG_GroupName',
        id: 'FMG_GroupName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Group' />,
        cell: ({ row }) => (
            <div>
                {row.original.fmG_GroupName ||
                    row.original.FMG_GroupName ||
                    row.original.groupName ||
                    row.getValue('FMG_GroupName') ||
                    row.getValue('fmG_GroupName') ||
                    'N.A'}
            </div>
        ),
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'fmH_FeeName',
        id: 'FMH_FeeName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Head' />,
        cell: ({ row }) => (
            <div>
                {row.original.fmH_FeeName ||
                    row.original.FMH_FeeName ||
                    row.original.feeName ||
                    row.getValue('FMH_FeeName') ||
                    row.getValue('fmH_FeeName') ||
                    'N.A'}
            </div>
        ),
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'ivrmrT_Role',
        id: 'IVRMRT_Role',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Role' />,
        cell: ({ row }) => {
            const role =
                row.original.ivrmrT_Role ||
                row.original.IVRMRT_Role ||
                row.original.roleName ||
                row.getValue('IVRMRT_Role') ||
                row.getValue('ivrmrT_Role') ||
                'N.A';
            return (
                <div className='inline-flex items-center rounded-md bg-secondary/60 px-2.5 py-0.5 font-semibold text-secondary-foreground text-xs'>
                    {role}
                </div>
            );
        },
        enableSorting: true,
        enableHiding: true
    },
    {
        id: 'actions',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Action' className='text-center' />,
        cell: ({ row }) => <CollegeFeePrivilegeActionButtonsCell rowData={row.original} />,
        enableSorting: false,
        enableHiding: false
    }
];

function CollegeFeePrivilegeActionButtonsCell({ rowData }: { rowData: ICollegeFeePrivilegeList }) {
    const { openEditForm, openDeleteForm } = useFormContext<ICollegeFeePrivilegeList>();

    const handleEdit = useCallback(() => openEditForm(rowData), [openEditForm, rowData]);
    const handleDelete = useCallback((data: ICollegeFeePrivilegeList) => openDeleteForm(data), [openDeleteForm]);

    return (
        <div className='flex justify-center'>
            <ActionButtons
                rowData={rowData}
                buttons={{ edit: true, toggle: false, delete: true }}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />
        </div>
    );
}
