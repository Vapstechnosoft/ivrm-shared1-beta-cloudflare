'use client';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import type { IMasterClassTeacherList } from '@/types/admission/preadmission/masters';
import type { ColumnDef } from '@tanstack/react-table';
import { useCallback } from 'react';

export const masterClassTeacherColumns: ColumnDef<IMasterClassTeacherList>[] = [
    {
        accessorKey: 'imcT_Id',
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
        accessorKey: 'asmaY_Year',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Academic Year' className='font-bold text-black' />,
        cell: ({ row }) => <div>{row.getValue('asmaY_Year')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'asmcL_ClassName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='class' className='font-bold text-black' />,
        cell: ({ row }) => <div>{row.getValue('asmcL_ClassName')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'asmC_SectionName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='section' className='font-bold text-black' />,
        cell: ({ row }) => <div>{row.getValue('asmC_SectionName')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'employee_code',
        header: ({ column }) => <DataTableColumnHeader column={column} title='employee code' className='font-bold text-black' />,
        cell: ({ row }) => <div>{row.getValue('employee_code')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'employee_name',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Employee Name' className='font-bold text-black' />,
        cell: ({ row }) => <div>{row.getValue('employee_name')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    // {
    //   accessorKey: "Employee_Code",
    //   header: ({ column }) => (
    //     <DataTableColumnHeader column={column} title="Employee Code" className='font-bold text-black' />
    //   ),
    //   cell: ({ row }) => <div>{row.getValue("Employee_Code")}</div>,
    //   enableSorting: true,
    //   enableHiding: true,
    // },

    {
        id: 'actions',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Actions' className='text-start font-bold text-black' />,
        accessorFn: (row: any) => row,
        enableSorting: false,
        cell: ({ row }) => <ActionButtonsCell rowData={row.original} />
    }
];

function ActionButtonsCell({ rowData }: { rowData: IMasterClassTeacherList }) {
    const { openToggleForm } = useFormContext<IMasterClassTeacherList>();

    const handleToggle = useCallback(
        (data: IMasterClassTeacherList) => {
            openToggleForm(data);
        },
        [openToggleForm]
    );

    return (
        <ActionButtons
            rowData={rowData}
            buttons={{ edit: false, toggle: true, delete: false }}
            onToggle={handleToggle}
            toggleConditionKey='imcT_ActiveFlag'
        />
    );
}
