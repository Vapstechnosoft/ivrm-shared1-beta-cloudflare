'use client';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import type { EmployeeDropdown } from '@/types/hrms/reports/employee-profile-report';
import type { ColumnDef } from '@tanstack/react-table';
export interface Employee extends Omit<Partial<EmployeeDropdown>, 'HRME_EmployeeLastName'> {
    HRME_Id: number;
    HRME_EmployeeFirstName: string;
    HRME_EmployeeLastName: string | null;
    HRMGT_Id: number;
    HRMD_Id: number;
    HRMDES_Id: number;
    calculationStatus: 'Not Calculated' | 'Calculated' | 'Recalculated';
    calculatedDate?: string;
    basicSalary?: number;
    allowances?: number;
    deductions?: number;
    netSalary?: number;
    imC_Id?: number;
    type?: string;
}
interface SalaryCalculationColumnsProps {
    employees: Employee[];
    selectedEmployees: number[];
    onEmployeeSelect: (employeeId: number, selected: boolean) => void;
    onSelectAll: (selected: boolean) => void;
}
export function getSalaryCalculationColumns({
    employees,
    selectedEmployees,
    onEmployeeSelect,
    onSelectAll
}: SalaryCalculationColumnsProps): ColumnDef<Employee>[] {
    return [
        {
            id: 'select',
            size: 40,
            header: () => (
                <div className='flex justify-center'>
                    <Checkbox
                        checked={employees.length > 0 && employees.every((emp) => selectedEmployees.includes(emp.HRME_Id))}
                        onCheckedChange={(value) => onSelectAll(!!value)}
                        aria-label='Select all'
                    />
                </div>
            ),
            cell: ({ row }) => (
                <div className='flex justify-center'>
                    <Checkbox
                        checked={selectedEmployees.includes(row.original.HRME_Id)}
                        onCheckedChange={(value) => onEmployeeSelect(row.original.HRME_Id, !!value)}
                        aria-label='Select row'
                    />
                </div>
            ),
            enableSorting: false,
            enableHiding: false
        },
        {
            accessorKey: 'SL.NO',
            size: 60,
            header: ({ column }) => <DataTableColumnHeader column={column} title='SL.NO' />,
            cell: ({ row, table }) => {
                const index = table.getSortedRowModel().rows.findIndex((r) => r.id === row.id);
                return <div>{index + 1}</div>;
            }
        },
        {
            accessorKey: 'HRME_EmployeeCode',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Employee Code' />,
            cell: ({ row }) => <div>{row.getValue('HRME_EmployeeCode')}</div>,
            enableSorting: false,
            enableHiding: false
        },
        {
            id: 'employeeName',
            accessorFn: (row) =>
                `${row.HRME_EmployeeFirstName || ''} ${row.HRME_EmployeeMiddleName || ''} ${row.HRME_EmployeeLastName || ''}`.trim(),
            header: ({ column }) => <DataTableColumnHeader column={column} title='Employee Name' />,
            cell: ({ row }) => {
                const employee = row.original;
                const fullName =
                    `${employee.HRME_EmployeeFirstName || ''} ${employee.HRME_EmployeeMiddleName || ''} ${employee.HRME_EmployeeLastName || ''}`.trim();
                return <div>{fullName}</div>;
            },
            enableSorting: false,
            enableHiding: false
        }
    ];
}
