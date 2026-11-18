import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import type { ILoginPrivilege } from '@/types/admission/preadmission/login_privilege';
import type { ColumnDef } from '@tanstack/react-table';
import { useCallback } from 'react';

export const loginPrivilegeColumns: ColumnDef<ILoginPrivilege>[] = [
    {
        accessorKey: 'id',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Sl.No' className='w-full pl-6 font-bold text-black' />,
        cell: ({ row, table }) => {
            const pageIndex = table.getState().pagination.pageIndex;
            const pageSize = table.getState().pagination.pageSize;
            const continuousIndex = pageIndex * pageSize + row.index + 1;
            return <div className='w-full pl-6'>{continuousIndex}</div>;
        },
        enableSorting: false,
        enableHiding: false
    },
    {
        accessorKey: 'asmaY_Year',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Year' className='font-bold text-black' />,
        cell: ({ row }) => <div>{row.getValue('asmaY_Year')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'userName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Staff Name' className='font-bold text-black' />,
        cell: ({ row }) => <div className='font-medium'>{row.getValue('userName')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'asmcL_ClassName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Class' className='font-bold text-black' />,
        cell: ({ row }) => <div>{row.getValue('asmcL_ClassName')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'asmC_SectionName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Section' className='font-bold text-black' />,
        cell: ({ row }) => <div className='text-center'>{row.getValue('asmC_SectionName')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    // {
    //     accessorKey: 'pamS_SubjectName',
    //     header: ({ column }) => <DataTableColumnHeader column={column} title='Subject' className='font-bold text-black' />,
    //     cell: ({ row }) => <div className='text-center'>{row.getValue('pamS_SubjectName') || '-'}</div>,
    //     enableSorting: true,
    //     enableHiding: true
    // },
    {
        id: 'actions',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Action' className='text-center font-bold text-black' />,
        accessorFn: (row: any) => row,
        enableSorting: false,
        cell: ({ row }) => <ActionButtonsCell rowData={row.original} />
    }
];

function ActionButtonsCell({ rowData }: { rowData: ILoginPrivilege }) {
    const { openEditForm, openDeleteForm, openToggleForm } = useFormContext<ILoginPrivilege>();

    const handleEdit = useCallback(
        (data: ILoginPrivilege) => {
            openEditForm(data); // This populates selectedRow in context
        },
        [openEditForm]
    );

    const handleToggle = useCallback(
        (data: ILoginPrivilege) => {
            openToggleForm(data);
        },
        [openToggleForm]
    );

    const handleDelete = useCallback(
        (data: ILoginPrivilege) => {
            openDeleteForm(data);
        },
        [openDeleteForm]
    );

    return (
        <ActionButtons
            rowData={rowData}
            buttons={{ edit: true, toggle: false, delete: true }}
            disabled={{ edit: false }}
            onEdit={handleEdit}
            onToggle={handleToggle}
            onDelete={handleDelete}
        />
    );
}
