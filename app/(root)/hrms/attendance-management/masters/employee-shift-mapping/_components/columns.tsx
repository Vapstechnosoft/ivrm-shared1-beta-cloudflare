'use client';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import { ActionButtons } from '@/components/ui/form/action-buttons';
import { useFormContext } from '@/components/ui/form/form-provider';
import type { IMasterEmployeeShiftMappingList } from '@/types/hrms/attendance-management/masters';
import type { ColumnDef } from '@tanstack/react-table';
import { useCallback } from 'react';

export const employeeShiftMappingColumns: ColumnDef<IMasterEmployeeShiftMappingList>[] = [
    {
        accessorKey: 'foesT_Id',
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
        accessorKey: 'fomS_ShiftName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Shift Name' />,
        cell: ({ row }) => <div>{row.getValue('fomS_ShiftName') || '-'}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'hrmE_EmployeeFirstName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Employee' />,
        cell: ({ row }) => <div>{row.getValue('hrmE_EmployeeFirstName') || '-'}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'fohtwD_HolidayWDType',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Day Type' />,
        cell: ({ row }) => <div>{row.getValue('fohtwD_HolidayWDType') || '-'}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'foesT_Date',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Date' />,
        cell: ({ row }) => {
            const date = row.getValue('foesT_Date') as string;
            return (
                <div>{date ? new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}</div>
            );
        },
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'foesT_FDWHrMin',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Total Work Hour' />,
        cell: ({ row }) => <div>{row.getValue('foesT_FDWHrMin') || '-'}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'foesT_HDWHrMin',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Half Day Work Hour' />,
        cell: ({ row }) => <div>{row.getValue('foesT_HDWHrMin') || '-'}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'foesT_IHalfLoginTime',
        header: ({ column }) => <DataTableColumnHeader column={column} title='First Half Login' />,
        cell: ({ row }) => <div>{row.getValue('foesT_IHalfLoginTime') || '-'}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'foesT_IHalfLogoutTime',
        header: ({ column }) => <DataTableColumnHeader column={column} title='First Half Logout' />,
        cell: ({ row }) => <div>{row.getValue('foesT_IHalfLogoutTime') || '-'}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'foesT_IIHalfLoginTime',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Second Half Login' />,
        cell: ({ row }) => <div>{row.getValue('foesT_IIHalfLoginTime') || '-'}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'foesT_IIHalfLogoutTime',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Second Half Logout' />,
        cell: ({ row }) => <div>{row.getValue('foesT_IIHalfLogoutTime') || '-'}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'foesT_DelayPerShiftHrMin',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Delay Per Shift' />,
        cell: ({ row }) => <div>{row.getValue('foesT_DelayPerShiftHrMin') || '-'}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'foesT_EarlyPerShiftHrMin',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Early Per Shift' />,
        cell: ({ row }) => <div>{row.getValue('foesT_EarlyPerShiftHrMin') || '-'}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        accessorKey: 'foesT_LunchHoursDuration',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Lunch Duration' />,
        cell: ({ row }) => <div>{row.getValue('foesT_LunchHoursDuration') || '-'}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        id: 'actions',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Actions' className='text-center' />,
        accessorFn: (row: any) => row,
        enableSorting: false,
        cell: ({ row }) => <ActionButtonsCell rowData={row.original} />
    }
];

function ActionButtonsCell({ rowData }: { rowData: IMasterEmployeeShiftMappingList }) {
    const { openEditForm, openDeleteForm } = useFormContext<IMasterEmployeeShiftMappingList>();

    const handleEdit = useCallback(
        (data: IMasterEmployeeShiftMappingList) => {
            openEditForm(data);
        },
        [openEditForm]
    );

    const handleDelete = useCallback(
        (data: IMasterEmployeeShiftMappingList) => {
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
// Dropdown options are now fetched from API via useEmployeeShiftMappingDropdowns hook
// These exports are kept for backward compatibility but should be replaced with API data
export const employeeTypeOptions: string[] = [];
export const dayTypeOptions: string[] = [];
export const typeOptions: string[] = [];
export const departmentOptions: string[] = [];
export const designationOptions: string[] = [];
export const shiftNames: string[] = [];
export const employeeOptions: Array<{ label: string; value: string }> = [];
