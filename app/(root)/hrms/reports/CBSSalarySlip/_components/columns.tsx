'use client';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import type { ColumnDef } from '@tanstack/react-table';
export interface EmployeeSalarySlipDisplay {
    id: number;
    employeeCode: string;
    employeeName: string;
    groupTypeId: number;
    departmentId: number;
    designationId: number;
    HRME_Id: number;
    isSelected: boolean;
}
interface SalarySlipColumnsProps {
    onSelectAll: (checked: boolean) => void;
    onSelectEmployee: (employeeId: number, checked: boolean) => void;
    selectedEmployeeIds: Set<number>;
    isAllSelected: boolean;
    isSomeSelected: boolean;
}
export const getSalarySlipColumns = ({
    onSelectAll,
    onSelectEmployee,
    selectedEmployeeIds,
    isAllSelected,
    isSomeSelected
}: SalarySlipColumnsProps): ColumnDef<EmployeeSalarySlipDisplay>[] => [
    {
        accessorKey: 'id',
        header: ({ column }) => <DataTableColumnHeader column={column} title='SL. No' />,
        cell: ({ row, table }) => {
            const pageIndex = table.getState().pagination.pageIndex;
            const pageSize = table.getState().pagination.pageSize;
            const continuousIndex = pageIndex * pageSize + row.index + 1;
            return <div className='text-center'>{continuousIndex}</div>;
        },
        enableSorting: false,
        enableHiding: false,
        size: 80
    },
    {
        accessorKey: 'employeeCode',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Employee Code' />,
        cell: ({ row }) => <div className='font-medium'>{row.getValue('employeeCode')}</div>,
        enableSorting: true,
        enableHiding: true,
        size: 80
    },
    {
        accessorKey: 'employeeName',
        header: ({ column }) => <DataTableColumnHeader column={column} title='Employee Name' />,
        cell: ({ row }) => <div>{row.getValue('employeeName')}</div>,
        enableSorting: true,
        enableHiding: true
    },
    {
        id: 'select',
        header: ({ table }) => (
            <Checkbox
                checked={isAllSelected ? true : isSomeSelected ? 'indeterminate' : false}
                onCheckedChange={(value) => {
                    onSelectAll(!!value);
                }}
                aria-label='Select all'
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={selectedEmployeeIds.has(row.original.id)}
                onCheckedChange={(value) => onSelectEmployee(row.original.id, !!value)}
                aria-label='Select row'
            />
        ),
        enableSorting: false,
        enableHiding: false,
        size: 24
    }
];
