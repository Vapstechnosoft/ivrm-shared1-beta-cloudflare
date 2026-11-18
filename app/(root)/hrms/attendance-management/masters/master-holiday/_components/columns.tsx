'use client';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import type { IMasterHolidayList } from '@/types/hrms/attendance-management/masters';
import type { ColumnDef } from '@tanstack/react-table';
import { useCallback } from 'react';

export const masterHolidayColumns: ColumnDef<IMasterHolidayList>[] = [
    {
        accessorKey: 'fomhwdD_Id',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Sl.No' className='w-full pl-6' />,
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
        accessorKey: 'fomhwdD_Name',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Name' />,
        cell: ({ row }) => {
            const data = row.original as any;
            return <div>{data.fomhwdD_Name || data.FOMHWDD_Name || '-'}</div>;
        },
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'fohtwD_HolidayWDType',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Holiday Type' />,
        cell: ({ row }) => {
            const data = row.original as any;
            return <div>{data.fohtwD_HolidayWDType || data.FOHTWD_HolidayWDType || '-'}</div>;
        },
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'hrmD_DepartmentName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Department' />,
        cell: ({ row }) => {
            const data = row.original as any;
            const deptName = data.hrmD_DepartmentName || data.HRMD_DepartmentName || data.hrm_DepartmentName || data.hrmd_DepartmentName;
            return <div>{deptName || '-'}</div>;
        },
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'fomhwdD_FromDate',
        header: ({ column }) => <DataTableColumnHeader column={column} title='From Date' />,
        cell: ({ row }) => {
            const data = row.original as any;
            const date = data.fomhwdD_FromDate || data.FOMHWDD_FromDate;
            return <div>{date ? new Date(date).toLocaleDateString() : '-'}</div>;
        },
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'fomhwdD_ToDate',
        header: ({ column }) => <DataTableColumnHeader column={column} title='To Date' />,
        cell: ({ row }) => {
            const data = row.original as any;
            const date = data.fomhwdD_ToDate || data.FOMHWDD_ToDate;
            return <div>{date ? new Date(date).toLocaleDateString() : '-'}</div>;
        },
        enableSorting: true,
        enableHiding: true
    },
    {
        id: 'actions',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Action' className='text-center' />,
        cell: ({ row }) => <ActionButtonsCell rowData={row.original} />,
        enableSorting: false,
        enableHiding: false
    }
];

function ActionButtonsCell({ rowData }: { rowData: IMasterHolidayList }) {
    const { openDeleteForm } = useFormContext<IMasterHolidayList>();

    const handleDelete = useCallback(
        (data: IMasterHolidayList) => {
            openDeleteForm(data);
        },
        [openDeleteForm]
    );

    return (
        <div className='flex justify-center'>
            <ActionButtons rowData={rowData} buttons={{ edit: false, toggle: false, delete: true }} onDelete={handleDelete} />
        </div>
    );
}
