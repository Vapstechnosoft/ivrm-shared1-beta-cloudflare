'use client';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Label } from '@/components/ui/label';
import { MultiSelect } from '@/components/ui/multi-select';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CustomPaginationTable, type CustomTableColumn } from '@/components/ui/view-data-table/custom-pagination-table';
import { FileText, Loader2, X } from 'lucide-react';
import { useState } from 'react';
import type { EmployeeSalarySlipDisplay } from './columns';

export interface SalarySlipFilters {
    groupType: number[];
    department: number[];
    designation: number[];
    month: string;
    year: string;
    slipPerPage: string;
    options: {
        lopDays: boolean;
        leaveDetails: boolean;
        panCardNo: boolean;
        bankDetails: boolean;
    };
}

interface SalarySlipFiltersProps {
    filters: SalarySlipFilters;
    groupTypes: any[];
    departments: any[];
    designations: any[];
    months: any[];
    years: any[];
    employees: EmployeeSalarySlipDisplay[];
    filteredEmployees: EmployeeSalarySlipDisplay[];
    searchTerm: string;
    selectedCount: number;
    isFiltering: boolean;
    isGenerating: boolean;
    selectedEmployeeIds: Set<number>;
    onFilterChange: (filters: SalarySlipFilters) => void;
    onSearchChange: (searchTerm: string) => void;
    onOptionChange: (option: keyof SalarySlipFilters['options'], checked: boolean) => void;
    onSelectAll: (checked: boolean) => void;
    onSelectEmployee: (employeeId: number, checked: boolean) => void;
    onGenerateSlip: () => void;
    onCancel: () => void;
    onReset: () => void;
    isLoadingGroupTypes: boolean;
    isLoadingDepartments: boolean;
    isLoadingDesignations: boolean;
    isLoadingYears: boolean;
    tableResponse?: any;
}

export function SalarySlipFilters({
    filters,
    groupTypes,
    departments,
    designations,
    months,
    years,
    employees,
    filteredEmployees,
    tableResponse,
    searchTerm,
    selectedCount,
    selectedEmployeeIds,
    isFiltering,
    isGenerating,
    onFilterChange,
    onSearchChange,
    onOptionChange,
    onSelectAll,
    onSelectEmployee,
    onGenerateSlip,
    onCancel,
    onReset,
    isLoadingGroupTypes,
    isLoadingDepartments,
    isLoadingDesignations,
    isLoadingYears
}: SalarySlipFiltersProps) {
    const [resetKey, setResetKey] = useState(0);
    const handleReset = () => {
        onReset();
        setResetKey((prevKey) => prevKey + 1);
    };

    const handleSelectAllWrapper = (checked: boolean, ids: number[]) => {
        // We will just call the parent's onSelectAll, but since we are doing
        // client-side search inside CustomEmployeeList, we'll pass the ids if the parent supports it.
        // We will modify the parent later to accept ids if needed.
        (onSelectAll as any)(checked, ids);
    };

    const columns: CustomTableColumn<EmployeeSalarySlipDisplay>[] = [
        {
            header: <div className='text-center font-medium'>SL. No</div>,
            cell: (_, index, currentPage, itemsPerPage) => (
                <div className='text-center'>{(currentPage - 1) * itemsPerPage + index + 1}</div>
            ),
            className: 'w-20'
        },
        {
            header: 'Employee Code',
            cell: (emp) => <div className='font-medium'>{emp.employeeCode}</div>
        },
        {
            header: 'Employee Name',
            cell: (emp) => <div>{emp.employeeName}</div>
        }
    ];

    return (
        <CollapsibleSection
            title='Salary Slip Configuration'
            description='Configure filters and options for salary slip generation'
            defaultOpen={true}
            variant='default'
            size='lg'
            className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
            {/* Filter Section - Row 1 */}
            <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                {/* Group Type Filter */}
                <div className='space-y-2'>
                    <Label htmlFor='group-type' className='font-medium text-foreground text-sm'>
                        Group Type: <span className='text-red-500'>*</span>
                    </Label>
                    <MultiSelect
                        options={groupTypes.map((gt) => ({
                            label: gt.value || gt.HRMGT_EmployeeGroupType,
                            value: (gt.key || gt.HRMGT_Id).toString()
                        }))}
                        defaultValue={filters.groupType.map((id) => id.toString())}
                        onValueChange={(values) =>
                            onFilterChange({
                                ...filters,
                                groupType: values.map((v) => Number.parseInt(v))
                            })
                        }
                        placeholder={isLoadingGroupTypes ? 'Loading...' : 'Select Group Types'}
                        className='w-full'
                        maxHeight={240}
                        disabled={isLoadingGroupTypes || !groupTypes?.length}
                    />
                </div>
                {/* Department Filter */}
                <div className='space-y-2'>
                    <Label htmlFor='department' className='font-medium text-foreground text-sm'>
                        Department: <span className='text-red-500'>*</span>
                    </Label>
                    <MultiSelect
                        options={departments.map((dept) => ({
                            label: dept.hrmD_DepartmentName || dept.HRMD_DepartmentName,
                            value: (dept.hrmD_Id || dept.HRMD_Id).toString()
                        }))}
                        defaultValue={filters.department.map((id) => id.toString())}
                        onValueChange={(values) =>
                            onFilterChange({
                                ...filters,
                                department: values.map((v) => Number.parseInt(v))
                            })
                        }
                        placeholder={isLoadingDepartments ? 'Loading...' : 'Select Departments'}
                        className='w-full'
                        maxHeight={240}
                        disabled={isLoadingDepartments || !departments?.length}
                    />
                </div>
                {/* Designation Filter */}
                <div className='space-y-2'>
                    <Label htmlFor='designation' className='font-medium text-foreground text-sm'>
                        Designation: <span className='text-red-500'>*</span>
                    </Label>
                    <MultiSelect
                        options={designations.map((desg) => ({
                            label: desg.hrmdeS_DesignationName || desg.HRMDES_DesignationName,
                            value: (desg.hrmdeS_Id || desg.HRMDES_Id).toString()
                        }))}
                        defaultValue={filters.designation.map((id) => id.toString())}
                        onValueChange={(values) =>
                            onFilterChange({
                                ...filters,
                                designation: values.map((v) => Number.parseInt(v))
                            })
                        }
                        placeholder={isLoadingDesignations ? 'Loading...' : 'Select Designations'}
                        className='w-full'
                        maxHeight={240}
                        disabled={isLoadingDesignations || !designations?.length}
                    />
                </div>
            </div>

            <div className='my-10 grid grid-cols-1 gap-8 lg:grid-cols-2'>
                {/* Left Column: Row 2 and Options */}
                <div className='w-full space-y-4' key={resetKey}>
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                        {/* Month Filter */}
                        <div className='mt-3 mb-3 space-y-2'>
                            <Label className='font-medium' htmlFor='month-select'>
                                Month
                            </Label>
                            <Select value={filters.month} onValueChange={(value) => onFilterChange({ ...filters, month: value })}>
                                <SelectTrigger id='month-select' disabled={isLoadingYears || !years?.length}>
                                    <SelectValue placeholder={isLoadingYears ? 'Loading...' : 'Select month'} />
                                </SelectTrigger>
                                <SelectContent>
                                    {months
                                        .filter((month: any) => {
                                            const value =
                                                month.monthName ||
                                                month.IVRM_Month_Name ||
                                                month.value ||
                                                month.name ||
                                                month.monthId?.toString() ||
                                                month.IVRM_Month_Id?.toString();
                                            return value && value.toString().trim() !== '';
                                        })
                                        .map((month: any, index: number) => {
                                            const monthValue =
                                                month.monthName ||
                                                month.IVRM_Month_Name ||
                                                month.value ||
                                                month.name ||
                                                month.monthId?.toString() ||
                                                month.IVRM_Month_Id?.toString();
                                            const monthLabel =
                                                month.monthName ||
                                                month.IVRM_Month_Name ||
                                                month.value ||
                                                month.name ||
                                                month.monthId ||
                                                month.IVRM_Month_Id;
                                            const key = month.monthId || month.IVRM_Month_Id || month.key || index;
                                            return (
                                                <SelectItem key={`month-${index}-${key}`} value={monthValue}>
                                                    {monthLabel}
                                                </SelectItem>
                                            );
                                        })}
                                    {months.length === 0 && (
                                        <div className='px-2 py-1.5 text-muted-foreground text-sm'>No months available</div>
                                    )}
                                </SelectContent>
                            </Select>
                        </div>
                        {/* Year Filter */}
                        <div className='mt-3 mb-3 space-y-2' key={resetKey}>
                            <Label className='font-medium' htmlFor='year-select'>
                                Year
                            </Label>
                            <Select value={filters.year} onValueChange={(value) => onFilterChange({ ...filters, year: value })}>
                                <SelectTrigger id='year-select' disabled={isLoadingYears || !years?.length}>
                                    <SelectValue placeholder={isLoadingYears ? 'Loading...' : 'Select year'} />
                                </SelectTrigger>
                                <SelectContent>
                                    {years.map((year: any, index: number) => {
                                        const yearValue =
                                            year.hrmlY_LeaveYear || year.HRMLY_LeaveYear || year.yearName || year.yearId?.toString();
                                        const yearLabel = year.hrmlY_LeaveYear || year.HRMLY_LeaveYear || year.yearName || year.yearId;
                                        const key = year.hrmlY_Id || year.HRMLY_Id || year.yearId || index;
                                        return (
                                            <SelectItem key={`year-${index}-${key}`} value={yearValue}>
                                                {yearLabel}
                                            </SelectItem>
                                        );
                                    })}
                                    {years.length === 0 && (
                                        <div className='px-2 py-1.5 text-muted-foreground text-sm'>No years available</div>
                                    )}
                                </SelectContent>
                            </Select>
                        </div>
                        {/* Slip/page Filter */}
                        <div className='mt-3 mb-3 space-y-2'>
                            <Label>Slip/page</Label>
                            <Select
                                value={filters.slipPerPage}
                                onValueChange={(value) => onFilterChange({ ...filters, slipPerPage: value })}>
                                <SelectTrigger>
                                    <SelectValue placeholder='Select' />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem key='slip-per-page-1' value='1'>
                                        1 slip per page
                                    </SelectItem>
                                    <SelectItem key='slip-per-page-2' value='2'>
                                        2 slips per page
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    {/* Options Section */}
                    <div className='grid grid-cols-2 gap-4 md:grid-cols-4'>
                        <div className='mt-3 flex cursor-pointer items-center gap-2 text-sm'>
                            <Checkbox
                                id='lop-days-checkbox'
                                checked={filters.options.lopDays}
                                onCheckedChange={(checked) => onOptionChange('lopDays', !!checked)}
                            />
                            <Label htmlFor='lop-days-checkbox'>LOP Days</Label>
                        </div>
                        <div className='mt-3 flex cursor-pointer items-center gap-2 text-sm'>
                            <Checkbox
                                id='leave-details-checkbox'
                                checked={filters.options.leaveDetails}
                                onCheckedChange={(checked) => onOptionChange('leaveDetails', !!checked)}
                            />
                            <Label htmlFor='leave-details-checkbox'>Leave Details</Label>
                        </div>
                        <div className='mt-3 flex cursor-pointer items-center gap-2 text-sm'>
                            <Checkbox
                                id='pan-card-checkbox'
                                checked={filters.options.panCardNo}
                                onCheckedChange={(checked) => onOptionChange('panCardNo', !!checked)}
                            />
                            <Label htmlFor='pan-card-checkbox'>Pan Card No.</Label>
                        </div>
                        <div className='mt-3 flex cursor-pointer items-center gap-2 text-sm'>
                            <Checkbox
                                id='bank-details-checkbox'
                                checked={filters.options.bankDetails}
                                onCheckedChange={(checked) => onOptionChange('bankDetails', !!checked)}
                            />
                            <Label htmlFor='bank-details-checkbox'>Bank Details</Label>
                        </div>
                    </div>
                </div>

                {/* Right Column: Employee Table */}
                <div className='w-full space-y-4'>
                    {/* Custom Employee List with Pagination and Search */}
                    <div className='salary-slip-table-wrapper'>
                        <CustomPaginationTable
                            data={filteredEmployees}
                            columns={columns}
                            searchKeys={['employeeName', 'employeeCode']}
                            idKey='id'
                            selectedIds={selectedEmployeeIds}
                            onSelect={onSelectEmployee}
                            onSelectAll={handleSelectAllWrapper}
                            searchPlaceholder='Search Name or Code...'
                        />
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className='flex flex-col gap-3 border-t pt-4 sm:flex-row sm:justify-end'>
                <Button variant='outline' onClick={handleReset} type='button'>
                    <X className='mr-2 h-4 w-4' />
                    Cancel
                </Button>
                <Button
                    onClick={onGenerateSlip}
                    disabled={
                        isGenerating ||
                        selectedCount === 0 ||
                        filters.groupType.length === 0 ||
                        filters.department.length === 0 ||
                        filters.designation.length === 0
                    }>
                    {isGenerating ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : <FileText className='mr-2 h-4 w-4' />}
                    {isGenerating ? 'Generating...' : 'Generate Slip'}
                </Button>
            </div>
        </CollapsibleSection>
    );
}
