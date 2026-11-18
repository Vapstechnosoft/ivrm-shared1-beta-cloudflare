'use client';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import type { IMasterActivityList } from '@/schemas/admission/preadmission/master_activity';
import type { ColumnDef } from '@tanstack/react-table';
import { useCallback } from 'react';

export const masterActivityColumns: ColumnDef<IMasterActivityList>[] = [
    {
        accessorKey: 'amA_Id',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Sl.No' className='w-full pl-6 font-bold text-black' />,
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
        accessorKey: 'amA_Activity',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Activity Name' className='font-bold text-black' />,
        cell: ({ row }) => <div>{row.getValue('amA_Activity')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'amA_Activity_Desc',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Activity Description' className='font-bold text-black' />,
        cell: ({ row }) => (
            <div className='max-w-[200px] overflow-hidden truncate text-ellipsis'>
                {row.getValue('amA_Activity_Desc') === null || row.getValue('amA_Activity_Desc') === undefined
                    ? 'N.A'
                    : row.getValue('amA_Activity_Desc')}
            </div>
        ),
        enableSorting: false,
        enableHiding: true
    },
    {
        id: 'actions',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Actions' className='text-start font-bold text-black' />,
        accessorFn: (row: any) => row,
        enableSorting: false,
        cell: ({ row }) => <ActionButtonsCell rowData={row.original} />
    }
];

function ActionButtonsCell({ rowData }: { rowData: IMasterActivityList }) {
    const { openEditForm, openDeleteForm } = useFormContext<IMasterActivityList>();

    const handleEdit = useCallback(
        (data: IMasterActivityList) => {
            openEditForm(data);
        },
        [openEditForm]
    );

    const handleDelete = useCallback(
        (data: IMasterActivityList) => {
            openDeleteForm(data);
        },
        [openDeleteForm]
    );

    return (
        <ActionButtons
            rowData={rowData}
            buttons={{ edit: true, toggle: false, delete: true }}
            onEdit={handleEdit}
            onDelete={handleDelete}
        />
    );
}
