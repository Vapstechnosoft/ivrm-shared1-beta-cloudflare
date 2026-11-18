'use client';

import { Button } from '@/components/ui/button';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { DatePicker } from '@/components/ui/date-picker';
import { FormError, Label } from '@/components/ui/extension/field';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { FormProvider } from '@/components/ui/form/form-provider';
import { MultiSelect } from '@/components/ui/multi-select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLeaveYearDropdown } from '@/hooks/hrms/useMasters';
import {
    useContributionEmployees,
    useMasterMonths,
    useReportDepartments,
    useReportDesignations,
    useReportGroupTypes
} from '@/hooks/hrms/useReports';
import { useContributionReport } from '@/hooks/hrms/useReports';
import { exportToExcel } from '@/lib/export-to-file';
import { ContributionReportPageSchema } from '@/schemas/hrms/report';
import { getHeadDropdown } from '@/server/hrms/hrmsConfig/transaction/salary-updation';
import { getMasterInstitution } from '@/server/hrms/master-dropdown';
import { zodResolver } from '@hookform/resolvers/zod';
import { Download, Loader2, Printer, Search as SearchIcon, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';

interface FilterFormValues {
    groupType: string[];
    department: string[];
    designation: string[];
    earningDeduction: 'Earning' | 'Deduction';
    earningHead: string;
    deductionHead: string;
    monthBetweenDates: 'Month' | 'BetweenDates';
    month: string;
    year: string;
    fromDate: Date | undefined;
    toDate: Date | undefined;
    formatType: 'Format1' | 'Format2';
    employee: number;
}

export default function ContributionReportPage() {
    return (
        <FormProvider>
            <ContributionReportContent />
        </FormProvider>
    );
}

function ContributionReportContent() {
    const [reportData, setReportData] = useState<any | null>(null);
    const [isSearching, setIsSearching] = useState(false);
    const [headers, setHeaders] = useState<any[]>([]);
    const [headerLoading, setHeaderLoading] = useState(false);
    const [employeesDataTransformed, setEmployeesDataTransformed] = useState<any[]>([]);
    const [institution, setInstitution] = useState<any>(null);
    const [resetKey, setResetKey] = useState(0);
    const tableRef = useRef<HTMLDivElement>(null);

    const {
        control,
        handleSubmit,
        watch,
        reset,
        setValue,
        formState: { errors }
    } = useForm<FilterFormValues>({
        resolver: zodResolver(ContributionReportPageSchema),
        defaultValues: {
            groupType: [],
            department: [],
            designation: [],
            earningDeduction: 'Earning',
            earningHead: '',
            deductionHead: '',
            monthBetweenDates: 'Month',
            month: '',
            year: '',
            fromDate: undefined,
            toDate: undefined,
            formatType: 'Format2',
            employee: 0
        }
    });

    const watchedEarningDeduction = watch('earningDeduction');
    const watchedMonthBetweenDates = watch('monthBetweenDates');
    const watchedFormatType = watch('formatType');
    const watchedGroupType = watch('groupType');
    const watchedDepartment = watch('department');
    const watchedDesignation = watch('designation');
    const watchedEarningHead = watch('earningHead');
    const watchedDeductionHead = watch('deductionHead');
    const watchedMonth = watch('month');
    const watchedYear = watch('year');
    const watchedFromDate = watch('fromDate');
    const watchedToDate = watch('toDate');

    // const { data: masterGroupTypes } = useMasterGroupTypes();
    // const { data: masterDepartments } = useMasterDepartments();
    // const { data: masterDesignations } = useMasterDesignations();
    const { data: masterGroupTypes, isLoading: groupTypeLoading } = useReportGroupTypes();

    const groupTypeIds = watchedGroupType?.join(',') || '';
    const { data: masterDepartments, isLoading: departmentLoading } = useReportDepartments(groupTypeIds);

    const deptIds = watchedDepartment?.join(',') || '';
    const { data: masterDesignations, isLoading: designationLoading } = useReportDesignations(groupTypeIds, deptIds);
    const { data: masterMonths } = useMasterMonths();
    const { data: masterYears } = useLeaveYearDropdown();

    const { mutateAsync: getContributionEmployees } = useContributionEmployees();

    const { mutateAsync: getContributionReport } = useContributionReport();

    const groupTypeOptions =
        masterGroupTypes?.data?.map((item: any) => ({
            label: item.value || item.hrmgT_EmployeeGroupType,
            value: (item.key ?? item.hrmgT_Id)?.toString() ?? ''
        })) || [];

    const departmentsOptions =
        masterDepartments?.data?.map((item: any) => ({
            label: item.hrmD_DepartmentName || item.value,
            value: (item.hrmD_Id ?? item.key)?.toString() ?? ''
        })) || [];

    const designationsOptions =
        masterDesignations?.data?.map((item: any) => ({
            label: item.value || item.hrmdeS_DesignationName,
            value: (item.key ?? item.hrmdeS_Id)?.toString() ?? ''
        })) || [];

    const yearOptions = useMemo(() => {
        const rawData = masterYears as any;
        if (!rawData) return [];
        const list = Array.isArray(rawData) ? rawData : Array.isArray(rawData.data) ? rawData.data : [];

        return list.map((year: any) => ({
            label: year.hrmlY_LeaveYear || '',
            value: String(year.hrmlY_Id || '')
        }));
    }, [masterYears]);

    const earningDropdownOptions = useMemo(() => {
        return headers
            .filter((h) => h.HRMED_EarnDedFlag === 'Earning' || h.hrmeD_EarnDedFlag === 'Earning')
            .map((h) => ({
                ...h,
                hrmeD_Id: h.HRMED_Id ?? h.hrmeD_Id,
                hrmeD_Name: h.HRMED_Name ?? h.hrmeD_Name
            }));
    }, [headers]);

    const deductionDropdownOptions = useMemo(() => {
        return headers
            .filter((h) => h.HRMED_EarnDedFlag === 'Deduction' || h.hrmeD_EarnDedFlag === 'Deduction')
            .map((h) => ({
                ...h,
                hrmeD_Id: h.HRMED_Id ?? h.hrmeD_Id,
                hrmeD_Name: h.HRMED_Name ?? h.hrmeD_Name
            }));
    }, [headers]);

    useEffect(() => {
        const getInstitution = async () => {
            try {
                const res = await getMasterInstitution();
                if (res?.data) {
                    setInstitution(Array.isArray(res.data) ? res.data[0] : res.data);
                } else {
                    setInstitution(null);
                }
            } catch (error) {
                console.log('error :', error);
            }
        };
        getInstitution();
    }, []);

    useEffect(() => {
        const getHeaders = async () => {
            try {
                setHeaderLoading(true);
                const res = await getHeadDropdown();
                if (res?.headdropdown?.length > 0) {
                    setHeaders(res.headdropdown);
                } else {
                    setHeaders([]);
                }
            } catch (error) {
                console.log('error :', error);
            } finally {
                setHeaderLoading(false);
            }
        };
        getHeaders();
    }, []);

    useEffect(() => {
        if (reportData && tableRef.current) {
            tableRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [reportData]);

    useEffect(() => {
        const fetchEmployees = async () => {
            if (watchedGroupType.length > 0 && watchedDepartment.length > 0 && watchedDesignation.length > 0) {
                try {
                    const res = await getContributionEmployees({
                        formatType: watchedFormatType,
                        hrmdeS_Ids: watchedDesignation.join(','),
                        hrmD_Ids: watchedDepartment.join(','),
                        hrmgT_Ids: watchedGroupType.join(','),
                        monthBetweenDates: watchedMonthBetweenDates,
                        hreS_Month: watchedMonthBetweenDates === 'Month' ? watchedMonth : '',
                        hreS_Year:
                            watchedMonthBetweenDates === 'Month'
                                ? yearOptions.find((item: any) => item.value === watchedYear)?.label || ''
                                : '',
                        fromDate:
                            watchedMonthBetweenDates === 'BetweenDates'
                                ? watchedFromDate
                                    ? new Date(watchedFromDate).toISOString()
                                    : new Date().toISOString()
                                : new Date().toISOString(),
                        toDate:
                            watchedMonthBetweenDates === 'BetweenDates'
                                ? watchedToDate
                                    ? new Date(watchedToDate).toISOString()
                                    : new Date().toISOString()
                                : new Date().toISOString()
                    });

                    console.log('Employees API response :', res);

                    const list = res?.data || res?.data?.employeeNames || [];

                    if (!list || !Array.isArray(list)) {
                        setEmployeesDataTransformed([]);
                        return;
                    }

                    const formattedList = list
                        .map((emp: any) => {
                            const id = emp.hrmE_Id || emp.id;
                            if (!id) return null;

                            return {
                                id: Number(id),
                                employeeName: emp.employeeFullName || emp.employeeName || 'Unknown Employee',
                                employeeCode: id.toString()
                            };
                        })
                        .filter(Boolean);

                    setEmployeesDataTransformed(formattedList);
                } catch (error) {
                    console.error('Failed to fetch contribution employees', error);
                    setEmployeesDataTransformed([]);
                }
            } else {
                setEmployeesDataTransformed([]);
            }
        };

        fetchEmployees();
    }, [
        watchedGroupType,
        watchedDepartment,
        watchedDesignation,
        watchedMonthBetweenDates,
        watchedMonth,
        watchedYear,
        watchedFromDate,
        watchedToDate,
        watchedFormatType,
        yearOptions
    ]);

    const onSubmit = async (data: FilterFormValues) => {
        console.log('Form data :', data);
        console.log('year', yearOptions.find((item: any) => item.value === data.year)?.label || '');

        const payload = {
            hrmdeS_Ids: data.designation.join(','),
            hrmD_Ids: data.department.join(','),
            hrmgT_Ids: data.groupType.join(','),
            monthBetweenDates: data.monthBetweenDates,
            hreS_Month: data.monthBetweenDates === 'Month' ? data.month : '',
            hreS_Year: data.monthBetweenDates === 'Month' ? yearOptions.find((item: any) => item.value === data.year)?.label || '' : '',
            fromDate:
                data.monthBetweenDates === 'BetweenDates'
                    ? data.fromDate
                        ? new Date(data.fromDate).toISOString()
                        : new Date().toISOString()
                    : new Date().toISOString(),
            toDate:
                data.monthBetweenDates === 'BetweenDates'
                    ? data.toDate
                        ? new Date(data.toDate).toISOString()
                        : new Date().toISOString()
                    : new Date().toISOString(),
            formatType: 'Format1',
            hrmE_Id: data.formatType === 'Format1' ? Number(data.employee) : 0,
            earningDeduction: data.earningDeduction,
            earningHead: data.earningDeduction === 'Earning' ? (data.earningHead === 'all' ? 999 : Number(data.earningHead)) : 0,
            deductionHead: data.earningDeduction === 'Deduction' ? (data.deductionHead === 'all' ? 999 : Number(data.deductionHead)) : 0
        };

        console.log('payload :', payload);

        setIsSearching(true);
        try {
            const res = await getContributionReport(payload);
            if (res.success && res.data.employees?.length > 0) {
                console.log('Report API response :', res);
                setReportData(res.data);
                toast.success('Report generated successfully!');
            } else {
                toast.error(res.message || 'No data found for the selected criteria');
                setReportData(null);
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to generate report');
            setReportData(null);
        } finally {
            setIsSearching(false);
        }
    };

    const handleCancel = () => {
        reset({
            groupType: [],
            department: [],
            designation: [],
            earningDeduction: 'Earning',
            earningHead: '',
            deductionHead: '',
            monthBetweenDates: 'Month',
            month: '',
            year: '',
            fromDate: undefined,
            toDate: undefined,
            formatType: 'Format2',
            employee: 0
        });
        setReportData(null);
        setResetKey((prev) => prev + 1);
    };

    const handleExport = () => {
        if (!reportData || reportData.length === 0) {
            toast.error('No data to export');
            return;
        }

        const isMultiCol =
            (watchedEarningDeduction === 'Deduction' && watchedDeductionHead === 'all') ||
            (watchedEarningDeduction === 'Earning' && watchedEarningHead === 'all');

        let columnsForExport: any = [];
        let exportData: any = [];

        if (!isMultiCol) {
            const headName =
                watchedEarningDeduction === 'Earning'
                    ? earningDropdownOptions.find((o) => o.hrmeD_Id.toString() === watchedEarningHead)?.hrmeD_Name || 'Earning Amount'
                    : deductionDropdownOptions.find((o) => o.hrmeD_Id.toString() === watchedDeductionHead)?.hrmeD_Name ||
                      'Deduction Amount';

            columnsForExport = [
                { label: 'Sl.No', value: 'index' },
                { label: 'Employee Code', value: 'employeeCode' },
                { label: 'Employee Name', value: 'employeeFullName' },
                { label: 'Department', value: 'departmentName' },
                { label: 'Designation', value: 'designationName' },
                { label: headName, value: 'selectedHeadAmount' }
            ];

            exportData = reportData.map((row: any, i: number) => ({
                index: i + 1,
                employeeCode: row.employeeCode,
                employeeFullName:
                    `${row.hrmE_EmployeeFirstName || ''} ${row.hrmE_EmployeeMiddleName || ''} ${row.hrmE_EmployeeLastName || ''}`.trim(),
                departmentName: row.departmentName,
                designationName: row.designationName,
                selectedHeadAmount: row.selectedHeadAmount
            }));
        } else {
            const heads = watchedEarningDeduction === 'Earning' ? earningDropdownOptions : deductionDropdownOptions;
            columnsForExport = [
                { label: 'Sl.No', value: 'index' },
                { label: 'Employee Code', value: 'employeeCode' },
                { label: 'Employee Name', value: 'employeeFullName' },
                { label: 'Department', value: 'departmentName' },
                { label: 'Designation', value: 'designationName' }
            ];

            heads.forEach((h) => {
                columnsForExport.push({
                    label: h.hrmeD_Name,
                    value: `head_${h.hrmeD_Name}`
                });
            });

            exportData = reportData?.employees?.map((row: any, i: number) => {
                const item: any = {
                    index: i + 1,
                    employeeCode: row.employeeCode,
                    employeeFullName:
                        `${row.hrmE_EmployeeFirstName || ''} ${row.hrmE_EmployeeMiddleName || ''} ${row.hrmE_EmployeeLastName || ''}`.trim(),
                    departmentName: row.departmentName,
                    designationName: row.designationName
                };

                heads.forEach((h) => {
                    const matchedDetail = row.employeeContributionDetails?.find((d: any) => d.earningDeduction === h.hrmeD_Name);
                    item[`head_${h.hrmeD_Name}`] = matchedDetail ? matchedDetail.selectedHeadAmount : 0;
                });

                return item;
            });
        }

        exportToExcel('EmployeeContributionReport', JSON.stringify(columnsForExport), JSON.stringify(exportData));
    };

    const handlePrint = () => {
        window.print();
    };

    const columns = useMemo(() => {
        const isMultiCol =
            (watchedEarningDeduction === 'Deduction' && watchedDeductionHead === 'all') ||
            (watchedEarningDeduction === 'Earning' && watchedEarningHead === 'all');

        const cols: any[] = [
            {
                id: 'serialNumber',
                header: 'Sl.No',
                cell: ({ row }: any) => row.index + 1
            },
            {
                accessorKey: 'employeeCode',
                header: 'Employee Code'
            },
            {
                id: 'employeeName',
                header: 'Employee Name',
                cell: ({ row }: any) => {
                    const o = row.original;
                    return `${o.hrmE_EmployeeFirstName || ''} ${o.hrmE_EmployeeMiddleName || ''} ${o.hrmE_EmployeeLastName || ''}`.trim();
                }
            },
            {
                accessorKey: 'departmentName',
                header: 'Department'
            },
            {
                accessorKey: 'designationName',
                header: 'Designation'
            }
        ];

        if (!isMultiCol) {
            const headName =
                watchedEarningDeduction === 'Earning'
                    ? earningDropdownOptions.find((o) => o.hrmeD_Id.toString() === watchedEarningHead)?.hrmeD_Name || 'Amount'
                    : deductionDropdownOptions.find((o) => o.hrmeD_Id.toString() === watchedDeductionHead)?.hrmeD_Name || 'Amount';

            cols.push({
                accessorKey: 'selectedHeadAmount',
                header: headName,
                cell: ({ row }: any) => row.original.selectedHeadAmount?.toFixed(2) || '0.00'
            });
        } else {
            const heads = watchedEarningDeduction === 'Earning' ? earningDropdownOptions : deductionDropdownOptions;
            heads.forEach((h) => {
                cols.push({
                    id: `head_${h.hrmeD_Id}`,
                    header: h.hrmeD_Name,
                    cell: ({ row }: any) => {
                        const matchedDetail = row.original.employeeContributionDetails?.find(
                            (d: any) => d.earningDeduction === h.hrmeD_Name
                        );
                        return matchedDetail?.selectedHeadAmount?.toFixed(2) || '0.00';
                    }
                });
            });
        }

        return cols;
    }, [watchedEarningDeduction, watchedEarningHead, watchedDeductionHead, earningDropdownOptions, deductionDropdownOptions]);

    const processedGridData = useMemo(() => {
        return reportData?.employees || [];
    }, [reportData]);

    return (
        <>
            <style>
                {`
                @media print {
                body * {
                visibility: hidden;
                }

                #printable-report,
                #printable-report * {
                visibility: visible;
                }

                #printable-report {
                  position: absolute;
                  top: 0;
                  left: 0;
                  width: 100%;
              }
            
            `}
            </style>
            <div className='container min-h-screen space-y-4 p-2'>
                <CollapsibleSection title='Contribution Report Configuration' defaultOpen={true} variant='outline'>
                    <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                        {/* Basic Filters */}
                        <div className='grid grid-cols-1 gap-6 rounded-md border bg-slate-50 p-4 lg:grid-cols-3 dark:bg-slate-900/50'>
                            <div className='space-y-2'>
                                <Label>
                                    Group Type <span className='text-destructive'>*</span>
                                </Label>
                                <Controller
                                    key={resetKey}
                                    name='groupType'
                                    control={control}
                                    render={({ field }) => (
                                        <MultiSelect
                                            options={groupTypeOptions}
                                            defaultValue={field.value}
                                            onValueChange={field.onChange}
                                            placeholder={groupTypeLoading ? 'Loading...' : 'Select Group Types'}
                                            disabled={groupTypeLoading}
                                        />
                                    )}
                                />
                                {errors.groupType && <FormError>{errors.groupType?.message}</FormError>}
                            </div>
                            <div className='space-y-2'>
                                <Label>
                                    Department <span className='text-destructive'>*</span>
                                </Label>
                                <Controller
                                    key={resetKey}
                                    name='department'
                                    control={control}
                                    render={({ field }) => (
                                        <MultiSelect
                                            options={departmentsOptions}
                                            defaultValue={field.value}
                                            onValueChange={field.onChange}
                                            placeholder={departmentLoading ? 'Loading...' : 'Select Departments'}
                                            disabled={departmentLoading || watchedGroupType.length === 0}
                                        />
                                    )}
                                />
                                {errors.department && <FormError>{errors.department?.message}</FormError>}
                            </div>
                            <div className='space-y-2'>
                                <Label>
                                    Designation <span className='text-destructive'>*</span>
                                </Label>
                                <Controller
                                    key={resetKey}
                                    name='designation'
                                    control={control}
                                    render={({ field }) => (
                                        <MultiSelect
                                            options={designationsOptions}
                                            defaultValue={field.value}
                                            onValueChange={field.onChange}
                                            placeholder={designationLoading ? 'Loading...' : 'Select Designations'}
                                            disabled={designationLoading || watchedDepartment.length === 0}
                                        />
                                    )}
                                />
                                {errors.designation && <FormError>{errors.designation?.message}</FormError>}
                            </div>
                        </div>

                        {/* Earning / Deduction Selection */}
                        <div className='rounded-md border bg-slate-50 p-4 dark:bg-slate-900/50'>
                            <div className='mb-4 flex justify-center'>
                                <Controller
                                    name='earningDeduction'
                                    control={control}
                                    render={({ field }) => (
                                        <RadioGroup
                                            value={field.value}
                                            onValueChange={(val) => {
                                                field.onChange(val);
                                            }}
                                            className='flex space-x-6'>
                                            <div className='flex items-center space-x-2'>
                                                <RadioGroupItem value='Earning' id='earning' />
                                                <Label htmlFor='earning'>
                                                    Earning <span className='text-destructive'>*</span>
                                                </Label>
                                            </div>
                                            <div className='flex items-center space-x-2'>
                                                <RadioGroupItem value='Deduction' id='deduction' />
                                                <Label htmlFor='deduction'>
                                                    Deduction <span className='text-destructive'>*</span>
                                                </Label>
                                            </div>
                                        </RadioGroup>
                                    )}
                                />
                            </div>

                            <div className='flex justify-center'>
                                {watchedEarningDeduction === 'Earning' && (
                                    <div className='w-full max-w-sm space-y-2'>
                                        <Label>
                                            Earning Head <span className='text-destructive'>*</span>
                                        </Label>
                                        <Controller
                                            key={resetKey}
                                            name='earningHead'
                                            control={control}
                                            render={({ field }) => (
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder='Select Head' />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {headerLoading ? (
                                                            <SelectItem value='loading'>Loading...</SelectItem>
                                                        ) : (
                                                            <SelectItem value='all'>All</SelectItem>
                                                        )}
                                                        {earningDropdownOptions?.map((item, index) => (
                                                            <SelectItem
                                                                key={`${item.hrmeD_Id || 'earn'}-${index}`}
                                                                value={item.hrmeD_Id?.toString() || `earn-val-${index}`}>
                                                                {item.hrmeD_Name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        />
                                        {errors.earningHead && <FormError>{errors.earningHead?.message}</FormError>}
                                    </div>
                                )}

                                {watchedEarningDeduction === 'Deduction' && (
                                    <div className='w-full max-w-sm space-y-2'>
                                        <Label>
                                            Deduction Head <span className='text-destructive'>*</span>
                                        </Label>
                                        <Controller
                                            key={resetKey}
                                            name='deductionHead'
                                            control={control}
                                            render={({ field }) => (
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder='Select Head' />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {headerLoading ? (
                                                            <SelectItem value='loading'>Loading...</SelectItem>
                                                        ) : (
                                                            <SelectItem value='all'>All</SelectItem>
                                                        )}
                                                        {deductionDropdownOptions?.map((item, index) => (
                                                            <SelectItem
                                                                key={`${item.hrmeD_Id || 'ded'}-${index}`}
                                                                value={item.hrmeD_Id?.toString() || `ded-val-${index}`}>
                                                                {item.hrmeD_Name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        />
                                        {errors.deductionHead && <FormError>{errors.deductionHead?.message}</FormError>}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Month / Between Dates Selection */}
                        <div className='rounded-md border bg-slate-50 p-4 dark:bg-slate-900/50'>
                            <div className='mb-4 flex justify-center'>
                                <Controller
                                    name='monthBetweenDates'
                                    control={control}
                                    render={({ field }) => (
                                        <RadioGroup
                                            value={field.value}
                                            onValueChange={(val) => {
                                                field.onChange(val);
                                                setValue('month', '');
                                                setValue('year', '');
                                                setValue('fromDate', undefined);
                                                setValue('toDate', undefined);
                                            }}
                                            className='flex space-x-6'>
                                            <div className='flex items-center space-x-2'>
                                                <RadioGroupItem value='Month' id='selMonth' />
                                                <Label htmlFor='selMonth'>
                                                    Month <span className='text-destructive'>*</span>
                                                </Label>
                                            </div>
                                            <div className='flex items-center space-x-2'>
                                                <RadioGroupItem value='BetweenDates' id='selDates' />
                                                <Label htmlFor='selDates'>
                                                    Between Dates <span className='text-destructive'>*</span>
                                                </Label>
                                            </div>
                                        </RadioGroup>
                                    )}
                                />
                            </div>

                            {watchedMonthBetweenDates === 'Month' ? (
                                <div className='flex justify-center space-x-6'>
                                    <div className='w-full max-w-xs space-y-2'>
                                        <Label>
                                            Month <span className='text-destructive'>*</span>
                                        </Label>
                                        <Controller
                                            key={resetKey}
                                            name='month'
                                            control={control}
                                            render={({ field }) => (
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder='Select Month' />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {masterMonths?.data?.map((item: any, index: number) => (
                                                            <SelectItem
                                                                key={`${item.key || 'month'}-${index}`}
                                                                value={item.value || `month-val-${index}`}>
                                                                {item.value}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        />
                                        {errors.month && <FormError>{errors.month?.message}</FormError>}
                                    </div>
                                    <div className='w-full max-w-xs space-y-2'>
                                        <Label>
                                            Year <span className='text-destructive'>*</span>
                                        </Label>
                                        <Controller
                                            key={resetKey}
                                            name='year'
                                            control={control}
                                            render={({ field }) => (
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder='Select Year' />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {yearOptions.map((item: any, index: number) => (
                                                            <SelectItem
                                                                key={`${item.value || 'year'}-${index}`}
                                                                value={item.value?.toString() ?? `year-val-${index}`}>
                                                                {item.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        />
                                        {errors.year && <FormError>{errors.year?.message}</FormError>}
                                    </div>
                                </div>
                            ) : (
                                <div className='flex justify-center space-x-6'>
                                    <div className='w-full max-w-xs space-y-2'>
                                        <Label>
                                            From Date <span className='text-destructive'>*</span>
                                        </Label>
                                        <Controller
                                            key={resetKey}
                                            name='fromDate'
                                            control={control}
                                            render={({ field }) => <DatePicker date={field.value} setDate={field.onChange} />}
                                        />
                                        {errors.fromDate && <FormError>{errors.fromDate?.message}</FormError>}
                                    </div>
                                    <div className='w-full max-w-xs space-y-2'>
                                        <Label>
                                            To Date <span className='text-destructive'>*</span>
                                        </Label>
                                        <Controller
                                            key={resetKey}
                                            name='toDate'
                                            control={control}
                                            render={({ field }) => <DatePicker date={field.value} setDate={field.onChange} />}
                                        />
                                        {errors.toDate && <FormError>{errors.toDate?.message}</FormError>}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Format Type */}
                        <div className='rounded-md border bg-slate-50 p-4 dark:bg-slate-900/50'>
                            <div className='mb-4 flex justify-center'>
                                <Controller
                                    name='formatType'
                                    control={control}
                                    render={({ field }) => (
                                        <RadioGroup
                                            value={field.value}
                                            onValueChange={(val) => {
                                                field.onChange(val);
                                                if (val === 'Format2') setValue('employee', 0);
                                            }}
                                            className='flex space-x-6'>
                                            <div className='flex items-center space-x-2'>
                                                <RadioGroupItem value='Format2' id='format2' />
                                                <Label htmlFor='format2'>
                                                    All <span className='text-destructive'>*</span>
                                                </Label>
                                            </div>
                                            <div className='flex items-center space-x-2'>
                                                <RadioGroupItem value='Format1' id='format1' />
                                                <Label htmlFor='format1'>
                                                    Individual <span className='text-destructive'>*</span>
                                                </Label>
                                            </div>
                                        </RadioGroup>
                                    )}
                                />
                            </div>

                            {watchedFormatType === 'Format1' && (
                                <div className='flex justify-center'>
                                    <div className='w-full max-w-sm space-y-2'>
                                        <Label>
                                            Employee <span className='text-destructive'>*</span>
                                        </Label>
                                        <Controller
                                            key={resetKey}
                                            name='employee'
                                            control={control}
                                            render={({ field }) => (
                                                <Select
                                                    onValueChange={(val) => field.onChange(Number(val))}
                                                    value={field.value?.toString()}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder='Select Employee' />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {employeesDataTransformed.map((item: any) => (
                                                            <SelectItem key={item.id} value={item.id.toString()}>
                                                                {item.employeeName}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        />
                                        {errors.employee && <FormError>{errors.employee?.message}</FormError>}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className='flex justify-center gap-4'>
                            <Button type='submit' disabled={isSearching} className='w-32'>
                                {isSearching ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : <SearchIcon className='mr-2 h-4 w-4' />}
                                Search
                            </Button>
                            <Button type='button' variant='destructive' onClick={handleCancel} className='w-32'>
                                <X className='mr-2 h-4 w-4' />
                                Cancel
                            </Button>
                        </div>
                    </form>
                </CollapsibleSection>

                {reportData && reportData?.employees?.length > 0 && (
                    <div ref={tableRef}>
                        <CollapsibleSection
                            title='Employee Contribution Report Details'
                            defaultOpen={true}
                            className=' shadow-md'
                            rightElement={
                                <div className='flex gap-4'>
                                    <Button variant='destructive' size='sm' onClick={handleExport} className='gap-2'>
                                        <Download className='h-4 w-4' />
                                        Export to Excel
                                    </Button>
                                    <Button variant='destructive' size='sm' onClick={handlePrint} className='gap-2'>
                                        <Printer className='h-4 w-4' />
                                        Print
                                    </Button>
                                    <Button variant='destructive' size='sm' onClick={handleCancel}>
                                        <X className='h-4 w-4' />
                                        Cancel
                                    </Button>
                                </div>
                            }>
                            <div className='h-[500px] overflow-y-auto print:h-auto print:overflow-visible' id='printable-report'>
                                <div className='w-full'>
                                    <p className='text-center font-bold text-2xl'>{institution?.mI_Name}</p>
                                    <p className='text-center font-semibold'>
                                        {institution?.mI_Address1} , {institution?.mI_Address2} , {institution?.mI_Address3},{' '}
                                        {institution?.mI_Pincode}
                                    </p>
                                    <p className='text-center font-semibold'>
                                        {institution?.mI_Address3}, {institution?.mI_Pincode}
                                    </p>
                                </div>
                                <div className='text-center'>
                                    <h2 className='mt-8 font-bold text-xl'>Employee Contribution Report</h2>
                                </div>
                                <GenericDataTable
                                    data={processedGridData}
                                    columns={columns}
                                    totalItems={processedGridData.length}
                                    isLoading={false}
                                    showViewOptions={false}
                                    isSearchRequired={false}
                                    isPaginationRequired={false}
                                    // scrollable={true}
                                    // maxHeight="600px"
                                />
                            </div>
                        </CollapsibleSection>
                    </div>
                )}
            </div>
        </>
    );
}
