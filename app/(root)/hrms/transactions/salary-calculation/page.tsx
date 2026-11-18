'use client';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/extension/field';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { MultiSelect } from '@/components/ui/multi-select';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useMasterMonths, useMasterYears, useReportDepartments, useReportDesignations, useReportGroupTypes } from '@/hooks/hrms/useReports';
import { useCalculateEmployeeSalary, useSearchEmployeesBySelection } from '@/hooks/hrms/useTransactions';
import type { MasterDropdown } from '@/server/hrms/master';
import type {
    ApiResponse,
    NewSalaryCalculationGenerateRequest,
    NewSalaryCalculationSearchRequest,
    SelectionEmployee
} from '@/types/hrms/salary-calculation';
import { zodResolver } from '@hookform/resolvers/zod';
import { Calculator, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Loader2, Search, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import type { Employee } from './_components/columns';
import { useQueryState, parseAsString, parseAsInteger } from 'nuqs';
import { tableSearchVariables } from '@/lib/data-table.config';

interface SearchForm {
    groupType: string[];
    department: string[];
    designation: string[];
    salaryMonth: string;
    salaryYear: string;
}

const searchSchema = z.object({
    groupType: z.array(z.string()).min(1, 'Please select at least one group type'),
    department: z.array(z.string()).min(1, 'Please select at least one department'),
    designation: z.array(z.string()).min(1, 'Please select at least one designation'),
    salaryMonth: z.string().min(1, 'Please select a salary month'),
    salaryYear: z.string().min(1, 'Please select a salary year')
});

export default function SalaryCalculationPage() {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [selectedEmployees, setSelectedEmployees] = useState<number[]>([]);
    const [hasSearched, setHasSearched] = useState(false);
    const [fromDate, setFromDate] = useState<string>('');
    const [toDate, setToDate] = useState<string>('');
    const [currentSearchData, setCurrentSearchData] = useState<SearchForm | null>(null);
    const [isFormSearching, setIsFormSearching] = useState(false);

    // URL-synced table params
    const [searchTerm, setSearchTerm] = useQueryState(
        tableSearchVariables.search,
        parseAsString.withOptions({ shallow: false }).withDefault('')
    );
    const [page, setPage] = useQueryState(
        tableSearchVariables.page,
        parseAsInteger.withOptions({ shallow: false }).withDefault(1)
    );
    const [pageSize, setPageSize] = useQueryState(
        tableSearchVariables.page_size,
        parseAsInteger.withOptions({ shallow: false }).withDefault(10)
    );
    const [, setSortColumn] = useQueryState(
        tableSearchVariables.sort_column,
        parseAsString.withOptions({ shallow: false }).withDefault('')
    );
    const [, setSortDirection] = useQueryState(
        tableSearchVariables.sort_direction,
        parseAsString.withOptions({ shallow: false }).withDefault('')
    );

    const {
        handleSubmit,
        reset,
        watch,
        control,
        formState: { isValid }
    } = useForm<SearchForm>({
        resolver: zodResolver(searchSchema),
        mode: 'onChange',
        defaultValues: {
            groupType: [],
            department: [],
            designation: [],
            salaryMonth: '',
            salaryYear: ''
        }
    });
    const [resetkey, setResetKey] = useState(0); // For resetting the form
    const watchedGroupType = watch('groupType');
    const watchedDepartment = watch('department');
    const watchedDesignation = watch('designation');
    const { data: monthOptionsData } = useMasterMonths();
    const { data: yearOptionsData } = useMasterYears();
    const searchMutation = useSearchEmployeesBySelection();
    const calculateMutation = useCalculateEmployeeSalary();

    // Report-based cascading queries
    const { data: groupTypesData, isLoading: isLoadingGroupTypes } = useReportGroupTypes();
    const groupTypeIds = watchedGroupType?.join(',') || '';
    console.log('groupTypeIds', groupTypeIds);
    const { data: departmentsData, isLoading: isLoadingDepartments } = useReportDepartments(groupTypeIds);
    const deptIds = watchedDepartment?.join(',') || '';
    console.log('departmentsData', departmentsData);
    const { data: designationsData, isLoading: isLoadingDesignations } = useReportDesignations(groupTypeIds, deptIds);

    useEffect(() => {
        setHasSearched(false);
    }, [watchedGroupType, watchedDepartment, watchedDesignation]);

    // Clear URL search and pagination params when navigating away (unmount)
    useEffect(() => {
        return () => {
            setSearchTerm(null);
            setPage(null);
            setSortColumn(null);
            setSortDirection(null);
        };
    }, [setSearchTerm, setPage, setSortColumn, setSortDirection]);

    // Clear stale URL search params on fresh mount (when user hasn't searched yet)
    useEffect(() => {
        if (!hasSearched) {
            if (searchTerm) setSearchTerm(null);
            if (page && page !== 1) setPage(null);
        }
    }, [hasSearched, searchTerm, page, setSearchTerm, setPage]);

    // Load the full result set so search, sorting, pagination, and selection are client-side.
    const executeSearch = useCallback(
        (formData: SearchForm) => {
            setIsFormSearching(true);
            const payload: NewSalaryCalculationSearchRequest = {
                hreS_Year: formData.salaryYear,
                hreS_Month: formData.salaryMonth,
                groupTypeIdList: (formData.groupType || []).map((v) => Number(v)),
                hrmD_IdList: (formData.department || []).map((v) => Number(v)),
                hrmdeS_IdList: (formData.designation || []).map((v) => Number(v))
            };

            searchMutation.mutate(payload, {
                onSuccess: (responseData: ApiResponse<SelectionEmployee[]>) => {
                    setIsFormSearching(false);
                    const employeeList = responseData.data || [];
                    const employeesWithStatus: Employee[] = employeeList.map((emp: SelectionEmployee) => {
                        return {
                            ...emp,
                            HRME_Id: emp.hrmE_Id,
                            HRME_EmployeeFirstName: emp.hrmE_FirstName,
                            HRME_EmployeeMiddleName: emp.hrmE_MiddleName,
                            HRME_EmployeeLastName: emp.hrmE_LastName,
                            HRME_EmployeeCode: emp.hrmE_EmployeeCode,
                            HRME_DateOfJoining: emp.hrmE_DOJ,
                            HRME_MobileNo: emp.hrmE_MobileNo || '',
                            HRME_EmailID: emp.hrmE_EmailID || '',
                            MI_Id: 0,
                            HRMGT_Id: emp.hrmgT_Id,
                            HRMD_Id: emp.hrmD_Id,
                            HRMDES_Id: emp.hrmdeS_Id,
                            calculationStatus: 'Not Calculated' as const,
                            basicSalary: 0,
                            allowances: 0,
                            deductions: 0,
                            netSalary: 0
                        } as Employee;
                    });

                    setEmployees(employeesWithStatus);
                    setSelectedEmployees([]);
                    setHasSearched(true);
                    setCurrentSearchData(formData);

                    if (formData.salaryMonth && formData.salaryYear) {
                        setFromDate(`01/${formData.salaryMonth}/${formData.salaryYear}`);
                        setToDate(`Last of ${formData.salaryMonth}/${formData.salaryYear}`);
                    }
                    if (employeesWithStatus.length === 0) {
                        toast.info('No employees found matching criteria');
                    } else {
                        toast.success(`Search completed successfully. Found ${employeesWithStatus.length} employees`);
                    }
                },
                onError: () => {
                    setIsFormSearching(false);
                    setEmployees([]);
                    setHasSearched(true);
                }
            });
        },
        [searchMutation]
    );

    // Reset to page 1 when search term changes
    const prevSearchTermRef = useRef(searchTerm);
    useEffect(() => {
        if (prevSearchTermRef.current !== searchTerm) {
            prevSearchTermRef.current = searchTerm;
            if (page && page !== 1) {
                setPage(1);
            }
        }
    }, [searchTerm, page, setPage]);

    // Memoized options for Select/MultiSelect components
    const groupTypeOptions = useMemo(() => {
        return (
            groupTypesData?.data?.map((gt: any) => ({
                label: gt.value,
                value: gt.key.toString()
            })) || []
        );
    }, [groupTypesData]);

    const departmentOptions = useMemo(() => {
        return (
            departmentsData?.data?.map((d: any) => ({
                label: d.hrmD_DepartmentName,
                value: d.hrmD_Id.toString()
            })) || []
        );
    }, [departmentsData]);

    const designationOptions = useMemo(() => {
        return (
            designationsData?.data?.map((d: any) => ({
                label: d.hrmdeS_DesignationName,
                value: d.hrmdeS_Id.toString()
            })) || []
        );
    }, [designationsData]);

    const monthOptions = useMemo<MasterDropdown[]>(() => (monthOptionsData?.data || []) as MasterDropdown[], [monthOptionsData]);
    const yearOptions = useMemo<MasterDropdown[]>(() => (yearOptionsData?.data || []) as MasterDropdown[], [yearOptionsData]);

    const onSubmit: SubmitHandler<SearchForm> = async (data: SearchForm) => {
        await setSearchTerm(null);
        await setPage(1);
        executeSearch(data);
    };

    const handleEmployeeSelect = (employeeId: number, selected: boolean) => {
        if (selected) {
            setSelectedEmployees((prev) => [...prev, employeeId]);
        } else {
            setSelectedEmployees((prev) => prev.filter((id) => id !== employeeId));
        }
    };
    const handleSelectAll = (selected: boolean) => {
        if (selected) {
            const employeeIds = employees.map((emp) => emp.HRME_Id);
            setSelectedEmployees((prev) => Array.from(new Set([...prev, ...employeeIds])));
        } else {
            const employeeIds = new Set(employees.map((emp) => emp.HRME_Id));
            setSelectedEmployees((prev) => prev.filter((id) => !employeeIds.has(id)));
        }
    };
    const handleGenerateSalary = async () => {
        if (selectedEmployees.length === 0) {
            toast.error('Please select at least one employee to generate salary');
            return;
        }
        if (!currentSearchData) {
            toast.error('Please perform a search first before generating salary');
            return;
        }
        console.log('selected employees', selectedEmployees);
        const payload: NewSalaryCalculationGenerateRequest = {
            hreS_Year: currentSearchData.salaryYear,
            hreS_Month: currentSearchData.salaryMonth,
            comm: 'bank', //"cashbank",
            masterEmployeeList: selectedEmployees.map((empId) => ({
                hrmE_Id: empId,
                type: 'bank',
                imC_Id: 0
            }))
        };
        calculateMutation.mutate(payload, {
            onSuccess: () => {
                setEmployees((prevEmployees) =>
                    prevEmployees.map((emp) =>
                        selectedEmployees.includes(emp.HRME_Id) ? { ...emp, calculationStatus: 'Calculated' as const } : emp
                    )
                );
                setSelectedEmployees([]);
            }
        });
    };

    const handleReset = () => {
        reset({
            groupType: [],
            department: [],
            designation: [],
            salaryMonth: '',
            salaryYear: ''
        });
        setResetKey((prev) => prev + 1); // Reset form
        setEmployees([]);
        setSelectedEmployees([]);
        setHasSearched(false);
        setCurrentSearchData(null);
        setSearchTerm(null);
        setPage(null);
    };

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                {/* Search Form */}
                <CollapsibleSection defaultOpen={true} variant='outline' size='lg' className='shadow-lg' headerClassName=''>
                    <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                        <div className='grid grid-cols-1 gap-6 lg:grid-cols-5'>
                            {/* Group Type */}
                            <div className='space-y-2'>
                                <Label htmlFor='groupType' className='font-medium text-foreground text-sm'>
                                    Group Type: <span className='text-red-500'>*</span>
                                </Label>
                                <Controller
                                    name='groupType'
                                    control={control}
                                    rules={{ required: true }}
                                    render={({ field }) => (
                                        <MultiSelect
                                            options={groupTypeOptions}
                                            onValueChange={field.onChange}
                                            defaultValue={Array.isArray(field.value) ? field.value : []}
                                            placeholder={isLoadingGroupTypes ? 'Loading...' : 'Select Group Types'}
                                            className='w-full'
                                            maxHeight={240}
                                            disabled={isLoadingGroupTypes || !groupTypeOptions?.length}
                                        />
                                    )}
                                />
                            </div>
                            {/* Department */}
                            <div className='space-y-2'>
                                <Label htmlFor='department' className='font-medium text-foreground text-sm'>
                                    Department: <span className='text-red-500'>*</span>
                                </Label>
                                <Controller
                                    name='department'
                                    control={control}
                                    rules={{ required: true }}
                                    render={({ field }) => (
                                        <MultiSelect
                                            options={departmentOptions}
                                            onValueChange={field.onChange}
                                            defaultValue={Array.isArray(field.value) ? field.value : []}
                                            placeholder={isLoadingDepartments ? 'Loading...' : 'Select Departments'}
                                            className='w-full'
                                            maxHeight={240}
                                            disabled={isLoadingDepartments || !departmentOptions?.length}
                                        />
                                    )}
                                />
                            </div>
                            {/* Designation */}
                            <div className='space-y-2'>
                                <Label htmlFor='designation' className='font-medium text-foreground text-sm'>
                                    Designation: <span className='text-red-500'>*</span>
                                </Label>
                                <Controller
                                    name='designation'
                                    control={control}
                                    rules={{ required: true }}
                                    render={({ field }) => (
                                        <MultiSelect
                                            options={designationOptions}
                                            onValueChange={field.onChange}
                                            defaultValue={Array.isArray(field.value) ? field.value : []}
                                            placeholder={isLoadingDesignations ? 'Loading...' : 'Select Designations'}
                                            className='w-full'
                                            maxHeight={240}
                                            disabled={isLoadingDesignations || !designationOptions?.length}
                                        />
                                    )}
                                />
                            </div>
                            {/* Month */}
                            <div className='space-y-2'>
                                <Label htmlFor='salaryMonth' className='font-medium text-foreground text-sm'>
                                    Month: <span className='text-red-500'>*</span>
                                </Label>
                                <Controller
                                    name='salaryMonth'
                                    control={control}
                                    rules={{ required: true }}
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange} key={field.value || 'empty'} value={field.value || ''}>
                                            <SelectTrigger>
                                                <SelectValue placeholder='Select Month' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {monthOptions.map((month) => (
                                                    <SelectItem key={month.key} value={month.value}>
                                                        {month.value}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </div>
                            {/* Year */}
                            <div className='space-y-2'>
                                <Label htmlFor='salaryYear' className='font-medium text-foreground text-sm'>
                                    Year: <span className='text-red-500'>*</span>
                                </Label>
                                <Controller
                                    key={resetkey} // Reset select when resetKey changes
                                    name='salaryYear'
                                    control={control}
                                    rules={{ required: true }}
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <SelectTrigger>
                                                <SelectValue placeholder='Select Year' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {yearOptions.map((year) => (
                                                    <SelectItem key={year.key} value={year.value}>
                                                        {year.value}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </div>
                        </div>
                        {/* Search and Cancel Buttons */}
                        <div className='flex gap-2 pt-4'>
                            <Button type='submit' disabled={!isValid || isFormSearching} className='w-fit transition-all duration-200 hover:scale-105'>
                                {isFormSearching ? (
                                    <>
                                        <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                        SEARCHING...
                                    </>
                                ) : (
                                    <>
                                        <Search className='mr-2 h-4 w-4' />
                                        SEARCH
                                    </>
                                )}
                            </Button>
                            <Button
                                type='button'
                                variant='outline'
                                className='w-fit transition-all duration-200 hover:scale-105'
                                onClick={handleReset}>
                                <X className='mr-2 h-4 w-4' />
                                CANCEL
                            </Button>
                        </div>
                    </form>
                </CollapsibleSection>
                {/* Employee List Table */}
                {hasSearched && (
                    <CollapsibleSection
                        defaultOpen={true}
                        variant='default'
                        size='lg'
                        className='shadow-lg transition-shadow duration-300 hover:shadow-xl'
                        headerClassName=''>
                        <SalaryCalculationTable
                            employees={employees}
                            isLoading={searchMutation.isPending || calculateMutation.isPending}
                            selectedEmployees={selectedEmployees}
                            onEmployeeSelect={handleEmployeeSelect}
                            onSelectAll={handleSelectAll}
                            onGenerateSalary={handleGenerateSalary}
                            handleReset={handleReset}
                            searchTerm={searchTerm}
                            onSearchTermChange={(value) => {
                                setSearchTerm(value || null);
                                setPage(1);
                            }}
                            currentPage={page ?? 1}
                            onPageChange={(newPage) => setPage(newPage)}
                            pageSize={pageSize ?? 10}
                            onPageSizeChange={(newPageSize) => {
                                setPageSize(newPageSize);
                                setPage(1);
                            }}
                        />
                    </CollapsibleSection>
                )}
                {/* Initial State Message */}
                {!hasSearched && (
                    <div className='flex items-center justify-center rounded-lg bg-muted/50 py-12'>
                        <div className='space-y-2 text-center'>
                            <div className='text-lg text-muted-foreground'>
                                Please use the search form above to find employee salary records
                            </div>
                            <div className='text-muted-foreground text-sm'>Select your criteria and click "SEARCH" to view results</div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
interface SalaryCalculationTableProps {
    employees: Employee[];
    isLoading: boolean;
    selectedEmployees: number[];
    onEmployeeSelect: (employeeId: number, selected: boolean) => void;
    onSelectAll: (selected: boolean) => void;
    onGenerateSalary: () => void;
    handleReset: () => void;
    searchTerm: string;
    onSearchTermChange: (value: string) => void;
    currentPage: number;
    onPageChange: (page: number) => void;
    pageSize: number;
    onPageSizeChange: (pageSize: number) => void;
}
function SalaryCalculationTable({
    employees,
    isLoading,
    selectedEmployees,
    onEmployeeSelect,
    onSelectAll,
    onGenerateSalary,
    handleReset,
    searchTerm,
    onSearchTermChange,
    currentPage,
    onPageChange,
    pageSize,
    onPageSizeChange
}: SalaryCalculationTableProps) {
    const safePageSize = Math.max(1, pageSize);
    const filteredEmployees = useMemo(() => {
        const query = searchTerm.trim().toLowerCase();
        if (!query) return employees;
        return employees.filter((employee) => {
            const fullName =
                `${employee.HRME_EmployeeFirstName || ''} ${employee.HRME_EmployeeMiddleName || ''} ${employee.HRME_EmployeeLastName || ''}`
                    .trim()
                    .toLowerCase();
            return (employee.HRME_EmployeeCode || '').toLowerCase().includes(query) || fullName.includes(query);
        });
    }, [employees, searchTerm]);
    const pageCount = Math.max(1, Math.ceil(filteredEmployees.length / safePageSize));
    const safeCurrentPage = Math.min(Math.max(1, currentPage), pageCount);
    const pageEmployees = filteredEmployees.slice((safeCurrentPage - 1) * safePageSize, safeCurrentPage * safePageSize);
    const firstEntry = filteredEmployees.length === 0 ? 0 : (safeCurrentPage - 1) * safePageSize + 1;
    const lastEntry = Math.min(safeCurrentPage * safePageSize, filteredEmployees.length);
    const allEmployeesSelected = employees.length > 0 && employees.every((employee) => selectedEmployees.includes(employee.HRME_Id));
    const someEmployeesSelected = !allEmployeesSelected && employees.some((employee) => selectedEmployees.includes(employee.HRME_Id));

    useEffect(() => {
        if (safeCurrentPage !== currentPage) onPageChange(safeCurrentPage);
    }, [safeCurrentPage, currentPage, onPageChange]);

    return (
        <div className='space-y-4'>
            <div className='space-y-3'>
                <div className='flex items-center justify-between'>
                    <input
                        type='search'
                        value={searchTerm}
                        onChange={(event) => onSearchTermChange(event.target.value)}
                        placeholder='Search employees...'
                        className='h-9 w-full max-w-xs rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm outline-none placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring'
                        aria-label='Search employees'
                    />
                </div>
                <div className='overflow-hidden rounded-md border'>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className='w-12'>
                                    <div className='flex justify-center'>
                                        <Checkbox
                                            checked={someEmployeesSelected ? 'indeterminate' : allEmployeesSelected}
                                            onCheckedChange={(checked) => onSelectAll(!!checked)}
                                            aria-label='Select all employees'
                                            disabled={employees.length === 0}
                                        />
                                    </div>
                                </TableHead>
                                <TableHead className='w-20'>SL.NO</TableHead>
                                <TableHead>Employee Code</TableHead>
                                <TableHead>Employee Name</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={4} className='h-24 text-center text-muted-foreground'>
                                        Loading employees...
                                    </TableCell>
                                </TableRow>
                            ) : pageEmployees.length > 0 ? (
                                pageEmployees.map((employee, index) => {
                                    const fullName =
                                        `${employee.HRME_EmployeeFirstName || ''} ${employee.HRME_EmployeeMiddleName || ''} ${employee.HRME_EmployeeLastName || ''}`
                                            .trim();
                                    return (
                                        <TableRow key={employee.HRME_Id}>
                                            <TableCell>
                                                <div className='flex justify-center'>
                                                    <Checkbox
                                                        checked={selectedEmployees.includes(employee.HRME_Id)}
                                                        onCheckedChange={(checked) => onEmployeeSelect(employee.HRME_Id, !!checked)}
                                                        aria-label={`Select ${fullName || employee.HRME_EmployeeCode}`}
                                                    />
                                                </div>
                                            </TableCell>
                                            <TableCell>{(safeCurrentPage - 1) * safePageSize + index + 1}</TableCell>
                                            <TableCell>{employee.HRME_EmployeeCode}</TableCell>
                                            <TableCell>{fullName}</TableCell>
                                        </TableRow>
                                    );
                                })
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className='h-24 text-center text-muted-foreground'>
                                        {searchTerm ? 'No employees match your search.' : 'No employees found.'}
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
                <div className='flex flex-col items-center justify-between gap-3 text-sm sm:flex-row'>
                    <span className='text-muted-foreground'>
                        Showing {firstEntry} to {lastEntry} of {filteredEmployees.length} entries
                    </span>
                    <div className='flex items-center gap-2'>
                        <span className='whitespace-nowrap text-muted-foreground'>Rows per page</span>
                        <Select value={String(safePageSize)} onValueChange={(value) => onPageSizeChange(Number(value))}>
                            <SelectTrigger className='h-8 w-[72px]'>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {[10, 20, 30, 50].map((size) => (
                                    <SelectItem key={size} value={String(size)}>
                                        {size}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button
                            type='button'
                            variant='outline'
                            size='icon'
                            className='h-8 w-8'
                            onClick={() => onPageChange(1)}
                            disabled={safeCurrentPage <= 1}
                            aria-label='Go to first page'>
                            <ChevronsLeft className='h-4 w-4' />
                        </Button>
                        <Button
                            type='button'
                            variant='outline'
                            size='icon'
                            className='h-8 w-8'
                            onClick={() => onPageChange(safeCurrentPage - 1)}
                            disabled={safeCurrentPage <= 1}
                            aria-label='Go to previous page'>
                            <ChevronLeft className='h-4 w-4' />
                        </Button>
                        <span className='min-w-16 text-center'>
                            {safeCurrentPage} / {pageCount}
                        </span>
                        <Button
                            type='button'
                            variant='outline'
                            size='icon'
                            className='h-8 w-8'
                            onClick={() => onPageChange(safeCurrentPage + 1)}
                            disabled={safeCurrentPage >= pageCount}
                            aria-label='Go to next page'>
                            <ChevronRight className='h-4 w-4' />
                        </Button>
                        <Button
                            type='button'
                            variant='outline'
                            size='icon'
                            className='h-8 w-8'
                            onClick={() => onPageChange(pageCount)}
                            disabled={safeCurrentPage >= pageCount}
                            aria-label='Go to last page'>
                            <ChevronsRight className='h-4 w-4' />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className='flex justify-end gap-2'>
                <Button
                    onClick={onGenerateSalary}
                    disabled={selectedEmployees.length === 0}
                    className='w-fit shadow-md transition-all duration-200 hover:scale-105'>
                    <Calculator className='mr-2 h-4 w-4' />
                    GENERATE PAY
                </Button>
                <Button variant='outline' className='w-fit shadow-sm transition-all duration-200 hover:scale-105' onClick={handleReset}>
                    <X className='mr-2 h-4 w-4' />
                    CANCEL
                </Button>
            </div>
        </div>
    );
}
