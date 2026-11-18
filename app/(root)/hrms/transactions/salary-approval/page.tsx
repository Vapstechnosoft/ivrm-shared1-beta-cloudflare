'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable, useDataTableProps } from '@/components/ui/data-table/generic-data-table';
import { FormError } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Label } from '@/components/ui/label';
import { MultiSelect } from '@/components/ui/multi-select';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { HRMS_MI_ID } from '@/constants/hrms-config';
import { useLeaveYearDropdown } from '@/hooks/hrms/useMasters';
import { useCumulativeSalaryReport, useReportDepartments, useReportDesignations, useReportGroupTypes } from '@/hooks/hrms/useReports';
import { useApproveSalaries, useUpdateEmployeesEarningsAndDeductions } from '@/hooks/hrms/useTransactions';
import type { EmployeeDetail, SalaryApprovalRequest } from '@/types/hrms/salary-approval';
import { RefreshCw, Save, X, XCircle } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { type SalaryHeadMeta, getSalaryApprovalColumns } from './_components/columns';

const MONTH_LIST = [
    { id: '1', name: 'January' },
    { id: '2', name: 'February' },
    { id: '3', name: 'March' },
    { id: '4', name: 'April' },
    { id: '5', name: 'May' },
    { id: '6', name: 'June' },
    { id: '7', name: 'July' },
    { id: '8', name: 'August' },
    { id: '9', name: 'September' },
    { id: '10', name: 'October' },
    { id: '11', name: 'November' },
    { id: '12', name: 'December' }
];

interface SearchForm {
    salaryYear: string;
    salaryMonth: string;
    groupType: string[];
    department: string[];
    designation: string[];
}

export default function SalaryApprovalPage() {
    const [employees, setEmployees] = useState<EmployeeDetail[]>([]);
    const [selectedEmployees, setSelectedEmployees] = useState<number[]>([]);
    const [earningHeads, setEarningHeads] = useState<SalaryHeadMeta[]>([]);
    const [deductionHeads, setDeductionHeads] = useState<SalaryHeadMeta[]>([]);
    const [hasSearched, setHasSearched] = useState(false);
    const [fromDate, setFromDate] = useState<string>('');
    const [toDate, setToDate] = useState<string>('');
    const [currentSearchData, setCurrentSearchData] = useState<SearchForm | null>(null);

    const {
        control,
        handleSubmit,
        watch,
        setValue,
        reset,
        formState: { errors }
    } = useForm<SearchForm>({
        defaultValues: {
            salaryYear: '',
            salaryMonth: '',
            groupType: [],
            department: [],
            designation: []
        }
    });

    const watchedGroupType = watch('groupType');
    const watchedDepartment = watch('department');

    // Cascading dropdowns logic
    const { data: yearsData } = useLeaveYearDropdown();
    const groupTypesData = useReportGroupTypes();
    console.log('groupTypesData', groupTypesData);
    const departmentsData = useReportDepartments(watchedGroupType.join(','));
    const designationsData = useReportDesignations(watchedGroupType.join(','), watchedDepartment.join(','));

    // Memoize options to prevent unnecessary re-renders
    const yearOptions = useMemo(() => yearsData?.data || [], [yearsData]);
    const groupTypeOptions = useMemo(() => groupTypesData.data?.data || [], [groupTypesData.data]);
    const departmentOptions = useMemo(() => departmentsData.data?.data || [], [departmentsData.data]);
    const designationOptions = useMemo(() => designationsData.data?.data || [], [designationsData.data]);

    const searchMutation = useCumulativeSalaryReport();
    const approveMutation = useApproveSalaries();
    const { mutate: updateEarningsDeductions, isPending: isSaving } = useUpdateEmployeesEarningsAndDeductions();

    // Reset subordinate fields when parent fields change
    useEffect(() => {
        setValue('department', []);
        setValue('designation', []);
    }, [watchedGroupType, setValue]);

    useEffect(() => {
        setValue('designation', []);
    }, [watchedDepartment, setValue]);

    const handleSearch: SubmitHandler<SearchForm> = (data) => {
        const yearString =
            yearOptions.find((y: any) => String(y.hrmlY_Id || y.HRMLY_Id || '') === data.salaryYear)?.hrmlY_LeaveYear ||
            yearOptions.find((y: any) => String(y.hrmlY_Id || y.HRMLY_Id || '') === data.salaryYear)?.HRMLY_LeaveYear;
        const monthName = MONTH_LIST.find((m) => m.id === data.salaryMonth)?.name;

        if (!yearString || !monthName) {
            toast.error('Invalid year or month selection');
            return;
        }

        const payload = {
            hreS_Year: yearString,
            hreS_Month: monthName,
            hrmdeS_IdList: data.designation.map(Number),
            hrmdeS_Ids: 'string',
            groupTypeIdList: data.groupType.map(Number),
            hrmD_IdList: data.department.map(Number),
        };
        console.log('form data', data);

        console.log('payload', payload);

        searchMutation.mutate(payload as any, {
            onSuccess: (response) => {
                console.log('📡 [API RESPONSE] Salary Approval Search Response:', response);
                const employeeList = response.data || [];
                console.log('📊 [DATA] Employee List:', employeeList);

                if (employeeList.length > 0) {
                    console.log('🔍 [DATA] First Employee Sample:', employeeList[0]);
                } else {
                    console.warn('⚠️ [DATA] Employee list is empty!');
                }

                const formattedEmployees = employeeList.map((emp: any) => {
                    const { earningresult, earningResult, deductionresult, deductionResult, ...rest } = emp;
                    return {
                        ...rest,
                        earningResult: (earningresult || earningResult || []).map((e: any) => ({
                            HREED_Id: e.HREED_Id || 0,
                            MI_Id: e.mI_Id || e.MI_Id || HRMS_MI_ID,
                            HRME_Id: emp.hrmE_Id || e.hrmE_Id || e.HRME_Id || emp.hrmE_Id || emp.HRME_Id,
                            HRMED_Id: e.hrmeD_Id || e.HRMED_Id,
                            HREED_Amount: e.hresD_Amount ?? e.HREED_Amount ?? 0,
                            HREED_Percentage: e.hresD_Percentage ?? e.HREED_Percentage ?? '0',
                            HREED_ActiveFlag: e.hresD_ActiveFlag ?? e.HREED_ActiveFlag ?? true,
                            HREED_MaxApplicableFlg: e.hresD_MaxApplicableFlg ?? e.HREED_MaxApplicableFlg ?? false,
                            HREED_ApplicableMaxValue: e.hresD_ApplicableMaxValue ?? e.HREED_ApplicableMaxValue ?? 0,
                            hrmeD_Name: e.hrmeD_Name
                        })),
                        deductionResult: (deductionresult || deductionResult || []).map((d: any) => ({
                            HREED_Id: d.HREED_Id || 0,
                            MI_Id: d.mI_Id || d.MI_Id || HRMS_MI_ID,
                            HRME_Id: emp.hrmE_Id || d.hrmE_Id || d.HRME_Id || emp.hrmE_Id || emp.HRME_Id,
                            HRMED_Id: d.hrmeD_Id || d.HRMED_Id,
                            HREED_Amount: d.hresD_Amount ?? d.HREED_Amount ?? 0,
                            HREED_Percentage: d.hresD_Percentage ?? d.HREED_Percentage ?? '0',
                            HREED_ActiveFlag: d.hresD_ActiveFlag ?? d.HREED_ActiveFlag ?? true,
                            HREED_MaxApplicableFlg: d.hresD_MaxApplicableFlg ?? d.HREED_MaxApplicableFlg ?? false,
                            HREED_ApplicableMaxValue: d.hresD_ApplicableMaxValue ?? d.HREED_ApplicableMaxValue ?? 0,
                            hrmeD_Name: d.hrmeD_Name
                        }))
                    };
                });

                setEmployees(formattedEmployees);
                setHasSearched(true);
                setCurrentSearchData(data);

                // Extract unique heads (using mapped HRMED_Id)
                const uniqueEarnings = new Map<number, SalaryHeadMeta>();
                const uniqueDeductions = new Map<number, SalaryHeadMeta>();

                formattedEmployees.forEach((emp: any) => {
                    (emp.earningResult || []).forEach((e: any) => {
                        if (!uniqueEarnings.has(e.HRMED_Id)) {
                            uniqueEarnings.set(e.HRMED_Id, {
                                headId: e.HRMED_Id,
                                headName: e.hrmeD_Name || 'Earning',
                                isEarning: true
                            });
                        }
                    });
                    (emp.deductionResult || []).forEach((d: any) => {
                        if (!uniqueDeductions.has(d.HRMED_Id)) {
                            uniqueDeductions.set(d.HRMED_Id, {
                                headId: d.HRMED_Id,
                                headName: d.hrmeD_Name || 'Deduction',
                                isEarning: false
                            });
                        }
                    });
                });

                setEarningHeads(Array.from(uniqueEarnings.values()));
                setDeductionHeads(Array.from(uniqueDeductions.values()));

                const monthIndex = Number.parseInt(data.salaryMonth) - 1;
                const yearNum = Number.parseInt(yearString.split('-')[0]); // Handle 2024-2025 formats
                const toDateStr = `${String(new Date(yearNum, monthIndex + 1, 0).getDate()).padStart(2, '0')}/${String(monthIndex + 1).padStart(2, '0')}/${yearNum}`;
                const fromDateStr = `01/${String(monthIndex + 1).padStart(2, '0')}/${yearNum}`;

                setFromDate(fromDateStr);
                setToDate(toDateStr);

                toast.success(`Search completed successfully. Found ${employeeList.length} employees`);
            }
        });
    };

    const handleEmployeeSelect = (employeeId: number, selected: boolean) => {
        console.log(`✅ [SELECT] Employee ID: ${employeeId}, Selected: ${selected}`);
        if (employeeId === undefined || employeeId === null) {
            console.error('❌ [SELECT ERROR] Attempted to select employee with undefined/null ID!');
            return;
        }
        setSelectedEmployees((prev) => (selected ? [...prev, employeeId] : prev.filter((id) => id !== employeeId)));
    };

    const handleSelectAll = (selected: boolean) => {
        console.log(`✅ [SELECT ALL] Selected: ${selected}`);
        const allIds = employees.map((emp) => emp.hrmE_Id ?? emp.HRME_Id).filter((id): id is number => id !== undefined && id !== null);
        setSelectedEmployees(selected ? allIds : []);
    };

    const handleUpdateAmount = useCallback((empId: number, headId: number, isEarning: boolean, newAmount: number | '') => {
        setEmployees((prev) =>
            prev.map((emp) => {
                const currentEmpId = emp.hrmE_Id ?? emp.HRME_Id;
                if (currentEmpId !== empId) return emp;

                const amount = newAmount === '' ? 0 : newAmount;

                if (isEarning) {
                    const existing = (emp.earningResult || []).find((x: any) => x.HRMED_Id === headId);
                    let newEarnings = emp.earningResult || [];
                    if (existing) {
                        newEarnings = newEarnings.map((x: any) => (x.HRMED_Id === headId ? { ...x, HREED_Amount: amount } : x));
                    } else {
                        // Add new entry
                        newEarnings = [
                            ...newEarnings,
                            {
                                HREED_Id: 0,
                                MI_Id: HRMS_MI_ID,
                                HRME_Id: empId,
                                HRMED_Id: headId,
                                HREED_Amount: amount,
                                HREED_Percentage: '0',
                                HREED_ActiveFlag: true,
                                HREED_MaxApplicableFlg: false,
                                HREED_ApplicableMaxValue: 0
                            }
                        ];
                    }
                    return { ...emp, earningResult: newEarnings };
                } else {
                    const existing = (emp.deductionResult || []).find((x: any) => x.HRMED_Id === headId);
                    let newDeductions = emp.deductionResult || [];
                    if (existing) {
                        newDeductions = newDeductions.map((x: any) => (x.HRMED_Id === headId ? { ...x, HREED_Amount: amount } : x));
                    } else {
                        // Add new entry
                        newDeductions = [
                            ...newDeductions,
                            {
                                HREED_Id: 0,
                                MI_Id: HRMS_MI_ID,
                                HRME_Id: empId,
                                HRMED_Id: headId,
                                HREED_Amount: amount,
                                HREED_Percentage: '0',
                                HREED_ActiveFlag: true,
                                HREED_MaxApplicableFlg: false,
                                HREED_ApplicableMaxValue: 0
                            }
                        ];
                    }
                    return { ...emp, deductionResult: newDeductions };
                }
            })
        );
    }, []);

    const handleSaveUpdates = async () => {
        console.log('💾 [SAVE] handleSaveUpdates called. Selected IDs:', selectedEmployees);
        if (selectedEmployees.length === 0) {
            toast.error('Please select at least one employee');
            return;
        }

        const selectedEmployeeData = employees.filter((emp) => selectedEmployees.includes(emp.hrmE_Id ?? emp.HRME_Id));
        console.log('📊 [SAVE] Selected Employee Data for Saving:', selectedEmployeeData);

        const earningResult: any[] = [];
        const deductionResult: any[] = [];

        selectedEmployeeData.forEach((emp) => {
            // Map the internal state to the external API's expected structure
            // Use existing HREED_Id from backend to ensure correct transactional updates
            if (emp.earningResult) {
                earningResult.push(...(emp.earningResult || []));
            }
            if (emp.deductionResult) {
                deductionResult.push(...(emp.deductionResult || []));
            }
        });

        console.log('📤 [SAVE] Final Earning Result Payload:', earningResult);
        console.log('📤 [SAVE] Final Deduction Result Payload:', deductionResult);

        updateEarningsDeductions(
            {
                earningResult: earningResult.length > 0 ? earningResult : undefined,
                deductionResult: deductionResult.length > 0 ? deductionResult : undefined,
                LoginUserId: 0
            },
            {
                onSuccess: () => {
                    console.log('✅ [SAVE] Salary updates saved successfully');
                    setSelectedEmployees([]);
                    toast.success('Salary updates saved successfully');
                    // Refetch data to ensure UI is in sync with DB
                },
                onError: (err: any) => {
                    console.error('❌ [SAVE ERROR] Save failed:', err);
                    toast.error(err.message || 'Save failed');
                }
            }
        );
    };

    const handleApprove = (status: string) => {
        if (selectedEmployees.length === 0) {
            toast.error('Please select at least one employee');
            return;
        }
        if (!currentSearchData) return;

        const yearString =
            yearOptions.find((y: any) => String(y.hrmlY_Id || y.HRMLY_Id || '') === currentSearchData.salaryYear)?.hrmlY_LeaveYear ||
            yearOptions.find((y: any) => String(y.hrmlY_Id || y.HRMLY_Id || '') === currentSearchData.salaryYear)?.HRMLY_LeaveYear ||
            '';
        const monthName = MONTH_LIST.find((m) => m.id === currentSearchData.salaryMonth)?.name || '';

        const payload: SalaryApprovalRequest = {
            MI_Id: 0,
            HRES_Year: yearString,
            HRES_Month: monthName,
            employeeIdList: selectedEmployees,
            LogInUserId: 0,
            approvalStatus: status as any
        };

        approveMutation.mutate(payload, {
            onSuccess: () => {
                setSelectedEmployees([]);
                handleSearch(currentSearchData);
            }
        });
    };

    const handleClear = () => {
        reset();
        setEmployees([]);
        setHasSearched(false);
        setSelectedEmployees([]);
    };

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                <CollapsibleSection
                    title='Search Filters'
                    defaultOpen={true}
                    variant='outline'
                    size='lg'
                    className='shadow-lg'
                    headerClassName=''>
                    <form onSubmit={handleSubmit(handleSearch)} className='space-y-6'>
                        <div className='grid grid-cols-1 gap-6 lg:grid-cols-5'>
                            <div className='space-y-3'>
                                <Label className='font-semibold'>Year<span className='text-destructive'>*</span></Label>
                                <Controller
                                    name='salaryYear'
                                    control={control}
                                    rules={{ required: 'Year is required' }}
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <SelectTrigger className={errors.salaryYear ? 'border-destructive' : ''}>
                                                <SelectValue placeholder='Select Year' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {yearOptions.map((year: any) => (
                                                    <SelectItem
                                                        key={year.hrmlY_Id || year.HRMLY_Id}
                                                        value={String(year.hrmlY_Id || year.HRMLY_Id || '')}>
                                                        {year.hrmlY_LeaveYear}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {errors.salaryYear && <FormError>{errors.salaryYear.message}</FormError>}
                            </div>

                            <div className='space-y-3'>
                                <Label className='font-semibold'>Month<span className='text-destructive'>*</span></Label>
                                <Controller
                                    name='salaryMonth'
                                    control={control}
                                    rules={{ required: 'Month is required' }}
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <SelectTrigger className={errors.salaryMonth ? 'border-destructive' : ''}>
                                                <SelectValue placeholder='Select Month' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {MONTH_LIST.map((month) => (
                                                    <SelectItem key={month.id} value={month.id}>
                                                        {month.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {errors.salaryMonth && <FormError>{errors.salaryMonth.message}</FormError>}
                            </div>

                            <div className='space-y-3'>
                                <Label className='font-semibold'>Group Type<span className='text-destructive'>*</span></Label>
                                <Controller
                                    name='groupType'
                                    control={control}
                                    rules={{ required: 'At least one group type must be selected' }}
                                    render={({ field }) => (
                                        <MultiSelect
                                            options={groupTypeOptions?.map((gt: any) => ({
                                                label: gt.value,
                                                value: gt.key.toString()
                                            }))}
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                            placeholder='Select Group Types'
                                            maxCount={1}
                                            className={errors.groupType ? 'border-destructive' : ''}
                                        />
                                    )}
                                />
                                {errors.groupType && <FormError>{errors.groupType.message}</FormError>}
                            </div>

                            <div className='space-y-3'>
                                <Label className='font-semibold'>Department<span className='text-destructive'>*</span></Label>
                                <Controller
                                    name='department'
                                    control={control}
                                    rules={{ required: 'At least one department must be selected' }}
                                    render={({ field }) => (
                                        <MultiSelect
                                            options={departmentOptions.map((dept: any) => ({
                                                label: dept.hrmD_DepartmentName || dept.HRMD_DepartmentName,
                                                value: String(dept.hrmD_Id || dept.HRMD_Id || '')
                                            }))}
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                            placeholder='Select Departments'
                                            maxCount={1}
                                            // disabled={watchedGroupType.length === 0}
                                            className={errors.department ? 'border-destructive' : ''}
                                        />
                                    )}
                                />
                                {errors.department && <FormError>{errors.department.message}</FormError>}
                            </div>

                            <div className='space-y-3'>
                                <Label className='font-semibold'>Designation<span className='text-destructive'>*</span></Label>
                                <Controller
                                    name='designation'
                                    control={control}
                                    rules={{ required: 'At least one designation must be selected' }}
                                    render={({ field }) => (
                                        <MultiSelect
                                            options={designationOptions.map((desig: any) => ({
                                                label: desig.hrmdeS_DesignationName || desig.HRMDES_DesignationName,
                                                value: String(desig.hrmdeS_Id || desig.HRMDES_Id || '')
                                            }))}
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                            placeholder='Select Designations'
                                            maxCount={1}
                                            // disabled={watchedDepartment.length === 0}
                                            className={errors.designation ? 'border-destructive' : ''}
                                        />
                                    )}
                                />
                                {errors.designation && <FormError>{errors.designation.message}</FormError>}
                            </div>
                        </div>

                        <div className='flex justify-center gap-4 pt-4'>
                            <Button
                                type='submit'
                                className='w-fit font-semibold transition-all hover:shadow-lg'
                                disabled={searchMutation.isPending}>
                                {searchMutation.isPending ? (
                                    <RefreshCw className='mr-2 h-4 w-4 animate-spin' />
                                ) : (
                                    <RefreshCw className='mr-2 h-4 w-4' />
                                )}
                                SEARCH
                            </Button>
                            <Button
                                type='button'
                                variant='outline'
                                onClick={handleClear}
                                className='w-fit font-semibold transition-all hover:shadow-lg'>
                                <X className='mr-2 h-4 w-4' /> CANCEL
                            </Button>
                        </div>
                    </form>
                </CollapsibleSection>

                {hasSearched && (
                    <div className='mt-8'>
                        <SalaryApprovalTable
                            employees={employees}
                            earningHeads={earningHeads}
                            deductionHeads={deductionHeads}
                            isLoading={searchMutation.isPending}
                            selectedEmployees={selectedEmployees}
                            onEmployeeSelect={handleEmployeeSelect}
                            onSelectAll={handleSelectAll}
                            onApprove={handleApprove}
                            onReject={handleApprove}
                            onSaveUpdates={handleSaveUpdates}
                            onUpdateAmount={handleUpdateAmount}
                            fromDate={fromDate}
                            toDate={toDate}
                        />
                    </div>
                )}

                {!hasSearched && (
                    <div className='flex flex-col items-center justify-center rounded-xl border-2 border-muted border-dashed p-20 text-center opacity-60'>
                        <RefreshCw className='mb-4 h-12 w-12 text-muted-foreground' />
                        <h3 className='font-semibold text-lg'>No Data to Display</h3>
                        <p className='text-muted-foreground'>
                            Please use the filters above and click Search to fetch employee salary details.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

interface SalaryApprovalTableProps {
    employees: EmployeeDetail[];
    earningHeads: SalaryHeadMeta[];
    deductionHeads: SalaryHeadMeta[];
    isLoading: boolean;
    selectedEmployees: number[];
    onEmployeeSelect: (employeeId: number, selected: boolean) => void;
    onSelectAll: (selected: boolean) => void;
    onApprove: (status: string) => void;
    onReject: (status: string) => void;
    onSaveUpdates: () => void;
    onUpdateAmount: (employeeId: number, headId: number, isEarning: boolean, amount: number | '') => void;
    fromDate: string;
    toDate: string;
}

function SalaryApprovalTable({
    employees,
    earningHeads,
    deductionHeads,
    isLoading,
    selectedEmployees,
    onEmployeeSelect,
    onSelectAll,
    onApprove,
    onReject,
    onSaveUpdates,
    onUpdateAmount,
    fromDate,
    toDate
}: SalaryApprovalTableProps) {
    const [localSearch, setLocalSearch] = useState('');

    const filteredEmployees = useMemo(() => {
        if (!localSearch) return employees;
        const lower = localSearch.toLowerCase();
        return employees.filter((emp: any) => {
            const firstName = emp.hrmE_EmployeeFirstName ?? emp.HRME_EmployeeFirstName ?? '';
            const middleName = emp.hrmE_EmployeeMiddleName ?? emp.HRME_EmployeeMiddleName ?? '';
            const lastName = emp.hrmE_EmployeeLastName ?? emp.HRME_EmployeeLastName ?? '';
            const code = emp.hrmE_EmployeeCode ?? emp.HRME_EmployeeCode ?? '';

            return (
                (firstName + ' ' + (middleName ? middleName + ' ' : '') + lastName).toLowerCase().includes(lower) ||
                code.toLowerCase().includes(lower)
            );
        });
    }, [employees, localSearch]);

    const tableResponse = useMemo(
        () => ({
            success: true,
            data: filteredEmployees,
            total: filteredEmployees.length,
            page: 1,
            page_size: filteredEmployees.length
        }),
        [filteredEmployees]
    );

    const tableProps = useDataTableProps(tableResponse);

    const columns = useMemo(
        () =>
            getSalaryApprovalColumns({
                earningHeads,
                deductionHeads,
                selectedEmployees,
                onEmployeeSelect,
                onSelectAll,
                onUpdateAmount,
                employeesCount: filteredEmployees.length
            }),
        [earningHeads, deductionHeads, selectedEmployees, onEmployeeSelect, onSelectAll, onUpdateAmount, filteredEmployees.length]
    );

    return (
        <CollapsibleSection title='Salary Details' defaultOpen={true} variant='outline' className='shadow-lg'>
            <div className='space-y-4'>
                <div className='flex items-center justify-between px-2 pt-2'>
                    {/* {fromDate && toDate ? (
                        <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                            <span className='rounded-md bg-blue-50 px-2 py-1 font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'>
                                Period: {fromDate} to {toDate}
                            </span>
                        </div>
                    ) : (
                        <div />
                    )} */}
                    <InputText
                        placeholder='Search by name or code...'
                        value={localSearch}
                        onChange={(e) => setLocalSearch(e.target.value)}
                        className='w-72'
                    />
                </div>

                <div className='rounded-md border p-1'>
                    <GenericDataTable
                        {...tableProps}
                        columns={columns}
                        isLoading={isLoading}
                        isPaginationRequired={false}
                        isSearchRequired={false}
                        scrollable={true}
                        maxHeight='450px'
                        columnPinning={{ left: ['select', 'slNo', 'HRME_EmployeeCode', 'employeeName', 'hrmdeS_DesignationName'] }}
                    />
                </div>

                <div className='mt-2 flex justify-end gap-3 rounded-b-lg border-t bg-muted/20 p-4'>
                    <Button
                        onClick={onSaveUpdates}
                        disabled={selectedEmployees.length === 0}
                        className='bg-blue-600 transition-all duration-200 hover:scale-105 hover:bg-blue-700'>
                        <Save className='mr-2 h-4 w-4' /> SAVE UPDATES
                    </Button>
                    {/* <Button
                        onClick={() => onApprove('Approved')}
                        disabled={selectedEmployees.length === 0}
                        className='bg-green-600 transition-all duration-200 hover:scale-105 hover:bg-green-700'>
                        <CheckCircle2 className='mr-2 h-4 w-4' /> APPROVE
                    </Button> */}
                    <Button
                        onClick={() => onReject('Rejected')}
                        disabled={selectedEmployees.length === 0}
                        variant='destructive'
                        className='transition-all duration-200 hover:scale-105'>
                        <XCircle className='mr-2 h-4 w-4' /> Reject
                    </Button>
                </div>
            </div>
        </CollapsibleSection>
    );
}
