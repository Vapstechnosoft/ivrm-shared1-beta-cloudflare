'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import type { EmployeeDetail } from '@/types/hrms/salary-approval';
import type { ColumnDef } from '@tanstack/react-table';
import type React from 'react';
import { useEffect, useState } from 'react';

/* ============================================
   Types for Dynamic Columns
   ============================================ */
export type SalaryHeadMeta = {
    headId: number;
    headName: string;
    isEarning: boolean;
};

/* ============================================
   AmountInputCell
   - Shared component for editable amounts
   ============================================ */
function AmountInputCell({
    value,
    onChange,
    placeholder,
    disabled
}: {
    value: number | '' | string | undefined;
    onChange: (v: number | '') => void;
    placeholder?: string;
    disabled?: boolean;
}) {
    const [local, setLocal] = useState<string>(value === '' || value === undefined ? '' : String(value));

    useEffect(() => {
        setLocal(value === '' || value === undefined ? '' : String(value));
    }, [value]);

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        const raw = e.target.value;
        if (raw.trim() === '') {
            setLocal('');
            onChange('');
            return;
        }
        if (!/^\d*\.?\d*$/.test(raw.trim())) return;
        setLocal(raw);
        onChange(Number(raw));
    }

    return (
        <input
            className={`w-[100px] rounded border border-gray-300 px-2 py-1 text-right text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${disabled ? 'cursor-not-allowed bg-gray-100 text-gray-400' : 'bg-white'}`}
            placeholder={placeholder ?? '0.00'}
            value={local}
            onChange={handleChange}
            disabled={disabled}
        />
    );
}

/* ============================================
   getSalaryApprovalColumns
   Static + Dynamic Columns for Salary Approval
   ============================================ */
export function getSalaryApprovalColumns({
    earningHeads,
    deductionHeads,
    selectedEmployees,
    onEmployeeSelect,
    onSelectAll,
    onUpdateAmount,
    employeesCount
}: {
    earningHeads: SalaryHeadMeta[];
    deductionHeads: SalaryHeadMeta[];
    selectedEmployees: number[];
    onEmployeeSelect: (employeeId: number, selected: boolean) => void;
    onSelectAll: (selected: boolean) => void;
    onUpdateAmount: (employeeId: number, headId: number, isEarning: boolean, amount: number | '') => void;
    employeesCount: number;
}): ColumnDef<EmployeeDetail>[] {
    const isAllSelected = employeesCount > 0 && selectedEmployees.length === employeesCount;
    const isIndeterminate = selectedEmployees.length > 0 && selectedEmployees.length < employeesCount;

    const baseColumns: ColumnDef<EmployeeDetail>[] = [
        {
            id: 'select',
            header: () => (
                <div className='flex items-center justify-center'>
                    <Checkbox
                        checked={isAllSelected || (isIndeterminate && 'indeterminate')}
                        onCheckedChange={(checked) => onSelectAll(!!checked)}
                    />
                </div>
            ),
            cell: ({ row }) => {
                const empId = row.original.hrmE_Id ?? row.original.HRME_Id;
                return (
                    <div className='flex items-center justify-center'>
                        <Checkbox
                            checked={selectedEmployees.includes(empId)}
                            onCheckedChange={(checked) => onEmployeeSelect(empId, !!checked)}
                        />
                    </div>
                );
            },
            size: 40
        },
        {
            id: 'slNo',
            header: ({ column }) => <DataTableColumnHeader column={column} title='SL NO' />,
            cell: ({ row }) => <span className='pl-2'>{row.index + 1}</span>,
            size: 60
        },
        {
            accessorKey: 'HRME_EmployeeCode',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Code' />,
            cell: ({ row }) => <span className='font-medium'>{row.original.hrmE_EmployeeCode ?? row.original.HRME_EmployeeCode}</span>,
            size: 100
        },
        {
            id: 'employeeName',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Employee Name' />,
            cell: ({ row }) => {
                const emp = row.original;
                const firstName = emp.hrmE_EmployeeFirstName ?? emp.HRME_EmployeeFirstName ?? '';
                const middleName = emp.hrmE_EmployeeMiddleName ?? emp.HRME_EmployeeMiddleName ?? '';
                const lastName = emp.hrmE_EmployeeLastName ?? emp.HRME_EmployeeLastName ?? '';
                const fullName = `${firstName}${middleName ? ' ' + middleName : ''}${lastName ? ' ' + lastName : ''}`;
                return <span className='font-semibold uppercase'>{fullName || 'UNDEFINED'}</span>;
            }
            // size: 200
        },
        {
            accessorKey: 'hrmdeS_DesignationName',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Designation' />,
            cell: ({ row }) => <span>{row.original.hrmdeS_DesignationName || row.original.HRMDES_DesignationName}</span>,
            size: 350
        }
    ];

    // --- EARNINGS GROUP ---
    if (earningHeads.length > 0) {
        const earningGroup: ColumnDef<EmployeeDetail> = {
            id: 'earnings_group',
            header: () => <div className='rounded-t-sm bg-green-600 py-1 text-center font-bold text-white text-xs'>EARNINGS</div>,
            columns: earningHeads.map((head) => ({
                id: `earning_${head.headId}`,
                header: () => (
                    <div
                        className='bg-green-600 py-1 text-center font-semibold text-[10px] text-white'
                        style={{ borderLeft: '1px solid rgba(255,255,255,0.2)' }}>
                        {head.headName}
                    </div>
                ),
                cell: ({ row }) => {
                    const emp = row.original;
                    const empId = emp.hrmE_Id ?? emp.HRME_Id;
                    const results = emp.earningResult || [];
                    const found = results.find((e: any) => e.HRMED_Id === head.headId);
                    const val = found ? found.HREED_Amount : '';
                    const isSelected = selectedEmployees.includes(empId);

                    return (
                        <div className='flex justify-center px-1'>
                            <AmountInputCell
                                value={val}
                                onChange={(newVal) => onUpdateAmount(empId, head.headId, true, newVal)}
                                disabled={!isSelected}
                            />
                        </div>
                    );
                }
                // size: 250
            }))
        };
        baseColumns.push(earningGroup);
    }

    // --- DEDUCTIONS GROUP ---
    if (deductionHeads.length > 0) {
        const deductionGroup: ColumnDef<EmployeeDetail> = {
            id: 'deductions_group',
            header: () => <div className='rounded-t-sm bg-red-600 py-1 text-center font-bold text-white text-xs'>DEDUCTIONS</div>,
            columns: deductionHeads.map((head) => ({
                id: `deduction_${head.headId}`,
                header: () => (
                    <div
                        className='bg-red-600 py-1 text-center font-semibold text-[10px] text-white'
                        style={{ borderLeft: '1px solid rgba(255,255,255,0.2)' }}>
                        {head.headName}
                    </div>
                ),
                cell: ({ row }) => {
                    const emp = row.original;
                    const empId = emp.hrmE_Id ?? emp.HRME_Id;
                    const results = emp.deductionResult || [];
                    const found = results.find((d: any) => d.HRMED_Id === head.headId);
                    const val = found ? found.HREED_Amount : '';
                    const isSelected = selectedEmployees.includes(empId);

                    return (
                        <div className='flex justify-center px-1'>
                            <AmountInputCell
                                value={val}
                                onChange={(newVal) => onUpdateAmount(empId, head.headId, false, newVal)}
                                disabled={!isSelected}
                            />
                        </div>
                    );
                },
                size: 110
            }))
        };
        baseColumns.push(deductionGroup);
    }

    // --- SUMMARY COLUMNS ---
    baseColumns.push(
        {
            accessorKey: 'hreS_WorkingDays',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Days' />,
            cell: ({ row }) => (
                <span className='text-center font-medium'>{row.original.hreS_WorkingDays ?? row.original.HRES_WorkingDays ?? 0}</span>
            ),
            size: 60
        },
        {
            accessorKey: 'empGrossSal',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Gross Salary' />,
            cell: ({ row }) => (
                <div className='text-right font-bold text-blue-600'>
                    {(row.original.empGrossSal ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
            ),
            size: 110
        },
        {
            accessorKey: 'grossEarning',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Total Earn' />,
            cell: ({ row }) => {
                const results = row.original.earningResult || [];
                const total = results.reduce((sum: number, e: any) => sum + (e.HREED_Amount ?? 0), 0);
                return <div className='text-right font-semibold text-green-600'>₹{total.toFixed(2)}</div>;
            },
            size: 100
        },
        {
            accessorKey: 'grossDeduction',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Total Ded' />,
            cell: ({ row }) => {
                const results = row.original.deductionResult || [];
                const total = results.reduce((sum: number, d: any) => sum + (d.HREED_Amount ?? 0), 0);
                return <div className='text-right font-semibold text-red-600'>₹{total.toFixed(2)}</div>;
            },
            size: 100
        },
        {
            accessorKey: 'netSalary',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Net Salary' />,
            cell: ({ row }) => {
                const eResults = row.original.earningResult || [];
                const dResults = row.original.deductionResult || [];
                const tEarn = eResults.reduce((sum: number, e: any) => sum + (e.HREED_Amount ?? 0), 0);
                const tDed = dResults.reduce((sum: number, d: any) => sum + (d.HREED_Amount ?? 0), 0);
                const net = tEarn - tDed;
                return (
                    <div className='text-right'>
                        <span className='rounded bg-blue-50 px-2 py-1 font-bold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'>
                            ₹{net.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                    </div>
                );
            },
            size: 120
        }
    );

    return baseColumns;
}
