'use client';

import { Button } from '@/components/ui/button';
import { CalendarYear } from '@/components/ui/calendar_year';
import { FormError } from '@/components/ui/extension/field';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    useEmployeeOfferAndExperienceReport,
    useReportDepartments,
    useReportDesignations,
    useReportEmployeesByGroupTypeDeptAndDesignation,
    useReportGroupTypes
} from '@/hooks/hrms/useReports';
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { CalendarIcon, RefreshCw, Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { type EmployeeOfferLaterFields, EmployeeOfferLaterSchema } from './schemas';

export default function SalaryCertificatePage() {
    const [isSearching, setIsSearching] = useState(false);
    const [reportData, setReportData] = useState<any>(null);
    const [currentDate, setCurrentDate] = useState<string>('');
    const [fullName, setFullName] = useState<string>('');
    const [resetKey, setResetKey] = useState<number>(0);

    const {
        control,
        handleSubmit,
        reset,
        watch,
        formState: { errors, isSubmitting }
    } = useForm<EmployeeOfferLaterFields>({
        resolver: zodResolver(EmployeeOfferLaterSchema),
        defaultValues: {
            groupType: '',
            department: '',
            designation: '',
            month: '',
            year: '',
            employee: '',
            mockLetter: '3'
        },
        mode: 'onChange'
    });

    const watchedGroupType = watch('groupType');
    const watchedDepartment = watch('department');
    const watchedDesignation = watch('designation');
    const watchEmployee = watch('employee');

    // Mapped ID arrays for hook dependencies
    const groupTypeIds = useMemo(() => [watchedGroupType].map(Number).filter(Boolean), [watchedGroupType]);
    const deptIds = useMemo(() => [watchedDepartment].map(Number).filter(Boolean), [watchedDepartment]);
    const desigIds = useMemo(() => [watchedDesignation].map(Number).filter(Boolean), [watchedDesignation]);

    // Data Hooks
    const {
        data: groupTypesData,
        isLoading: groupTypesLoading,
        error: groupTypesError,
        isError: groupTypesisError
    } = useReportGroupTypes();
    const {
        data: departmentsData,
        isLoading: departmentsLoading,
        error: departmentsError,
        isError: departmentsisError
    } = useReportDepartments(groupTypeIds.toString());
    const {
        data: designationsData,
        isLoading: designationsLoading,
        error: designationsError,
        isError: designationsisError
    } = useReportDesignations(groupTypeIds.toString(), deptIds.toString());
    const {
        data: employeesData,
        isLoading: employeesLoading,
        error: employeesError,
        isError: employeesisError
    } = useReportEmployeesByGroupTypeDeptAndDesignation(groupTypeIds, deptIds, desigIds);

    const { mutateAsync: generateReport } = useEmployeeOfferAndExperienceReport();

    //   console.log("employeesData", watchedEmployee);

    // Transforms
    const groupTypesDataTransformed = useMemo(() => {
        return (
            groupTypesData?.data?.map((gt: any) => ({
                id: gt.key || gt.hrmgT_Id,
                name: gt.value || gt.hrmgT_EmployeeGroupType
            })) || []
        ).filter((d: any) => d.id != null);
    }, [groupTypesData]);

    const departmentsDataTransformed = useMemo(() => {
        return (
            departmentsData?.data?.map((d: any) => ({
                id: d.hrmD_Id || d.hrmd_id || d.key || d.id,
                name: d.hrmD_DepartmentName || d.hrmd_departmentName || d.value || d.name
            })) || []
        ).filter((d: any) => d.id != null);
    }, [departmentsData]);

    const designationsDataTransformed = useMemo(() => {
        return (
            designationsData?.data?.map((d: any) => ({
                id: d.hrmdeS_Id || d.hrmdes_id || d.key || d.id,
                name: d.hrmdeS_DesignationName || d.hrmdes_designationName || d.value || d.name
            })) || []
        ).filter((d: any) => d.id != null);
    }, [designationsData]);

    const employeesDataTransformed = useMemo(() => {
        const list = employeesData?.data?.employeeNames || employeesData;
        if (!list || !Array.isArray(list)) return [];

        return list
            .map((emp: any) => {
                const id = emp.hrmE_Id || emp.id;
                if (!id) return null;

                return {
                    id: Number(id),
                    employeeName: emp.employeeFullName || 'Unknown Employee',
                    employeeCode: emp.hrmE_EmployeeCode || id.toString()
                };
            })
            .filter(Boolean);
    }, [employeesData]);

    useEffect(() => {
        const today = new Date().toISOString();
        setCurrentDate(today);
    }, []);

    const onSearch = async (data: any) => {
        setIsSearching(true);
        try {
            const payload = {
                HRME_Id: Number(data?.employee),
                HRMGT_Id: Number(data?.groupType),
                HRMD_Id: Number(data?.department),
                HRMDES_Id: Number(data?.designation)
            };
            console.log('payload', payload);
            const response = await generateReport(payload);
            console.log('response', response);
            if (response.success) {
                toast.success(response.message || 'Report generated successfully!');
                const name = response.data.currentemployeeDetails;
                const nameParts = [name?.hrmE_EmployeeFirstName, name?.hrmE_EmployeeMiddleName, name?.hrmE_EmployeeLastName]
                    .map((s) => s?.trim())
                    .filter(Boolean);
                setFullName(nameParts.join(' '));
                setReportData(response.data);
            } else {
                toast.error(response.message || 'Failed to generate report');
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to generate certificate');
        } finally {
            setIsSearching(false);
        }
    };

    const handleReset = () => {
        reset({
            groupType: '',
            department: '',
            designation: '',
            month: '',
            year: '',
            employee: '',
            mockLetter: '3'
        });
        setReportData(null);
        setResetKey((prev) => prev + 1);
        toast.info('Form has been reset');
    };
    const handlePrint = () => {
        window.print();
        toast.success('Print dialog opened');
    };

    const calculateGrossEarning = () => {
        if (!reportData || !reportData.employeeSalaryslipDetails) return 0;
        return reportData.employeeSalaryslipDetails
            .filter((item: any) => item.HRMED_EarnDedFlag === 'Earning')
            .reduce((sum: number, item: any) => sum + item.Amount, 0);
    };

    const calculateTotalDeductions = () => {
        if (!reportData || !reportData.employeeSalaryslipDetails) return 0;
        return reportData.employeeSalaryslipDetails
            .filter((item: any) => item.HRMED_EarnDedFlag === 'Deduction')
            .reduce((sum: number, item: any) => sum + item.Amount, 0);
    };

    const calculateNetSalary = () => {
        return calculateGrossEarning() - calculateTotalDeductions();
    };

    const getTodayDate = () => {
        const today = new Date();
        return today.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const grossEarning = calculateGrossEarning();
    const totalDeductions = calculateTotalDeductions();
    const netSalary = calculateNetSalary();

    const certificateHandler = () => {};

    return (
        <div className='min-h-screen p-8'>
            <div className='container space-y-4 p-1'>
                <CollapsibleSection
                    title='Salary Certificate'
                    defaultOpen={true}
                    variant='outline'
                    size='md'
                    className='slide-in-from-top-4 animate-in shadow-lg duration-300'>
                    <div className='space-y-6'>
                        <div className=''>
                            <div className='grid gap-6 sm:grid-cols-2 md:grid-cols-2'>
                                <div className=''>
                                    <div className='space-y-2'>
                                        <Label htmlFor='groupType' className='font-medium text-sm text-white-900'>
                                            Group Type: <span className='text-red-500'>*</span>
                                        </Label>
                                        <Controller
                                            key={resetKey}
                                            name='groupType'
                                            control={control}
                                            render={({ field }) => (
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <SelectTrigger className='w-full' disabled={groupTypesLoading}>
                                                        <SelectValue placeholder={groupTypesLoading ? 'Loading...' : 'Select GroupType'} />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {groupTypesDataTransformed?.map((opt: any) => (
                                                            <SelectItem key={opt.id} value={String(opt.id)}>
                                                                {opt.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        />
                                        {errors.groupType && <FormError>{errors.groupType.message}</FormError>}
                                    </div>

                                    <div className='mt-3 space-y-2'>
                                        <Label htmlFor='department' className='font-medium text-sm text-white-900'>
                                            Department: <span className='text-red-500'>*</span>
                                        </Label>
                                        <Controller
                                            key={resetKey}
                                            name='department'
                                            control={control}
                                            render={({ field }) => (
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <SelectTrigger className='w-full' disabled={!watchedGroupType || departmentsLoading}>
                                                        <SelectValue
                                                            placeholder={departmentsLoading ? 'Loading...' : 'Select department'}
                                                        />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {departmentsDataTransformed?.map((opt: any) => (
                                                            <SelectItem key={opt.id} value={String(opt.id)}>
                                                                {opt.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        />
                                        {errors.department && <FormError>{errors.department.message}</FormError>}
                                    </div>
                                    <div className='mt-3 space-y-2'>
                                        <Label htmlFor='designation' className='font-medium text-sm text-white-900'>
                                            Designation: <span className='text-red-500'>*</span>
                                        </Label>
                                        <Controller
                                            key={resetKey}
                                            name='designation'
                                            control={control}
                                            render={({ field }) => (
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <SelectTrigger className='w-full' disabled={!watchedDepartment || designationsLoading}>
                                                        <SelectValue
                                                            placeholder={designationsLoading ? 'Loading...' : 'Select designation'}
                                                        />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {designationsDataTransformed?.map((opt: any) => (
                                                            <SelectItem key={opt.id} value={String(opt.id)}>
                                                                {opt.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        />
                                        {errors.designation && <FormError>{errors.designation.message}</FormError>}
                                    </div>

                                    <div className=' mt-3 space-y-2'>
                                        <Label htmlFor='employee' className='font-medium text-sm text-white-900'>
                                            Employee: <span className='text-red-500'>*</span>
                                        </Label>
                                        <Controller
                                            key={resetKey}
                                            name='employee'
                                            control={control}
                                            render={({ field }) => (
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <SelectTrigger className='w-full' disabled={!watchedDepartment || employeesLoading}>
                                                        <SelectValue placeholder={employeesLoading ? 'Loading...' : 'Select Employee'} />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {employeesDataTransformed?.map((opt: any) => (
                                                            <SelectItem key={opt.id} value={String(opt.id)}>
                                                                {opt.employeeName}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                    {/* <SelectContent>
                                                    {masterEmployeeLoading ? (
                                                        <SelectItem value='loading' disabled>
                                                            Loading...
                                                        </SelectItem>
                                                    ) : masterEmployeeError ? (
                                                        <SelectItem value='error' disabled>
                                                            Error loading data
                                                        </SelectItem>
                                                    ) : (
                                                        EmployeeOptions?.map((opt: any) => (
                                                            <SelectItem key={opt.value} value={opt.value}>
                                                                {opt.label}
                                                            </SelectItem>
                                                        ))
                                                    )}
                                                </SelectContent> */}
                                                </Select>
                                            )}
                                        />
                                        {errors.employee && <FormError>{errors.employee.message}</FormError>}
                                    </div>
                                </div>

                                <div className='space-y-6'>
                                    <div className='space-y-3'>
                                        <Label className='font-medium text-sm text-white-900'>
                                            Current Date<span className='text-red-600'>*</span>
                                        </Label>

                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    type='button'
                                                    variant='outline'
                                                    className={cn(
                                                        'w-full justify-start text-left font-normal',
                                                        !currentDate && 'text-muted-foreground'
                                                    )}>
                                                    <CalendarIcon className='mr-2 h-4 w-4' />
                                                    {currentDate ? format(new Date(currentDate), 'dd/MM/yyyy') : 'Current date'}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className='w-auto p-0' align='start'>
                                                <CalendarYear
                                                    mode='single'
                                                    selected={currentDate ? new Date(currentDate) : undefined}
                                                    onSelect={(date: Date | undefined) => setCurrentDate(date?.toISOString() ?? '')}
                                                    captionLayout='dropdown'
                                                    fromYear={2000}
                                                    toYear={2050}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                    <div className='flex flex-row items-center gap-4'>
                                        <input
                                            type='radio'
                                            name='reportType'
                                            className='h-5 w-5'
                                            id='experienceCertificate'
                                            checked
                                            onChange={certificateHandler}
                                        />
                                        <Label className='font-medium text-sm text-white-900' htmlFor='experienceCertificate'>
                                            Experience Certificate<span className='text-red-600'>*</span>
                                        </Label>
                                    </div>
                                    {/* {selectedMockLetter !== '3' &&
                                        selectedMockLetter !== '4' &&
                                        selectedMockLetter !== '10' &&
                                        selectedMockLetter !== '9' && (
                                            <div className='space-y-3'>
                                                {selectedMockLetter !== '8' && (
                                                    <>
                                                        <div>
                                                            <Label className='font-medium text-sm text-white-900'>
                                                                Date Of Joining
                                                                <span className='text-red-600'>*</span>
                                                            </Label>
                                                            <Popover>
                                                                <PopoverTrigger asChild>
                                                                    <Button
                                                                        type='button'
                                                                        variant='outline'
                                                                        className={cn(
                                                                            'w-full justify-start text-left font-normal',
                                                                            !joiningDate && 'text-muted-foreground'
                                                                        )}>
                                                                        <CalendarIcon className='mr-2 h-4 w-4' />
                                                                        {joiningDate
                                                                            ? format(new Date(joiningDate), 'dd/MM/yyyy')
                                                                            : 'joining Date'}
                                                                    </Button>
                                                                </PopoverTrigger>
                                                                <PopoverContent className='w-auto p-0' align='start'>
                                                                    <CalendarYear
                                                                        mode='single'
                                                                        selected={joiningDate ? new Date(joiningDate) : undefined}
                                                                        onSelect={(date: Date | undefined) =>
                                                                            setJoiningDate(date?.toISOString() ?? '')
                                                                        }
                                                                        captionLayout='dropdown'
                                                                        fromYear={2000}
                                                                        toYear={2050}
                                                                    />
                                                                </PopoverContent>
                                                            </Popover>
                                                        </div>
                                                        <div>
                                                            <Label className='font-medium text-sm text-white-900'>
                                                                Date Of Interview
                                                                <span className='text-red-600'>*</span>
                                                            </Label>
                                                            <Popover>
                                                                <PopoverTrigger asChild>
                                                                    <Button
                                                                        type='button'
                                                                        variant='outline'
                                                                        className={cn(
                                                                            'w-full justify-start text-left font-normal',
                                                                            !interviewDate && 'text-muted-foreground'
                                                                        )}>
                                                                        <CalendarIcon className='mr-2 h-4 w-4' />
                                                                        {interviewDate
                                                                            ? format(new Date(interviewDate), 'dd/MM/yyyy')
                                                                            : 'Interview Date'}
                                                                    </Button>
                                                                </PopoverTrigger>
                                                                <PopoverContent className='w-auto p-0' align='start'>
                                                                    <CalendarYear
                                                                        mode='single'
                                                                        selected={interviewDate ? new Date(interviewDate) : undefined}
                                                                        onSelect={(date: Date | undefined) =>
                                                                            setInterviewDate(date?.toISOString() ?? '')
                                                                        }
                                                                        captionLayout='dropdown'
                                                                        fromYear={2000}
                                                                        toYear={2050}
                                                                    />
                                                                </PopoverContent>
                                                            </Popover>
                                                        </div>
                                                    </>
                                                )}
                                                {selectedMockLetter !== '7' && (
                                                    <div>
                                                        {selectedMockLetter !== '8' && (
                                                            <div>
                                                                <div>
                                                                    <Label className='font-medium text-sm text-white-900'>
                                                                        Date Of Response
                                                                        <span className='text-red-600'>*</span>
                                                                    </Label>
                                                                    <Popover>
                                                                        <PopoverTrigger asChild>
                                                                            <Button
                                                                                type='button'
                                                                                variant='outline'
                                                                                className={cn(
                                                                                    'w-full justify-start text-left font-normal',
                                                                                    !responseDate && 'text-muted-foreground'
                                                                                )}>
                                                                                <CalendarIcon className='mr-2 h-4 w-4' />
                                                                                {responseDate
                                                                                    ? format(new Date(responseDate), 'dd/MM/yyyy')
                                                                                    : 'Response Date'}
                                                                            </Button>
                                                                        </PopoverTrigger>
                                                                        <PopoverContent className='w-auto p-0' align='start'>
                                                                            <CalendarYear
                                                                                mode='single'
                                                                                selected={responseDate ? new Date(responseDate) : undefined}
                                                                                onSelect={(date: Date | undefined) =>
                                                                                    setResponseDate(date?.toISOString() ?? '')
                                                                                }
                                                                                captionLayout='dropdown'
                                                                                fromYear={2000}
                                                                                toYear={2050}
                                                                            />
                                                                        </PopoverContent>
                                                                    </Popover>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {selectedMockLetter !== '1' &&
                                                            selectedMockLetter !== '2' &&
                                                            selectedMockLetter !== '5' &&
                                                            selectedMockLetter !== '6' && (
                                                                <div className='space-y-3'>
                                                                    <div>
                                                                        <Label className='font-medium text-sm text-white-900'>
                                                                            Date Of Due
                                                                            <span className='text-red-600'>*</span>
                                                                        </Label>
                                                                        <Popover>
                                                                            <PopoverTrigger asChild>
                                                                                <Button
                                                                                    type='button'
                                                                                    variant='outline'
                                                                                    className={cn(
                                                                                        'w-full justify-start text-left font-normal',
                                                                                        !dueDate && 'text-muted-foreground'
                                                                                    )}>
                                                                                    <CalendarIcon className='mr-2 h-4 w-4' />
                                                                                    {dueDate
                                                                                        ? format(new Date(dueDate), 'dd/MM/yyyy')
                                                                                        : 'Due Date'}
                                                                                </Button>
                                                                            </PopoverTrigger>
                                                                            <PopoverContent className='w-auto p-0' align='start'>
                                                                                <CalendarYear
                                                                                    mode='single'
                                                                                    selected={dueDate ? new Date(dueDate) : undefined}
                                                                                    onSelect={(date: Date | undefined) =>
                                                                                        setDueDate(date?.toISOString() ?? '')
                                                                                    }
                                                                                    captionLayout='dropdown'
                                                                                    fromYear={2000}
                                                                                    toYear={2050}
                                                                                />
                                                                            </PopoverContent>
                                                                        </Popover>
                                                                    </div>

                                                                    <div>
                                                                        <Label className='font-medium text-sm text-white-900'>
                                                                            Last Working Day
                                                                            <span className='text-red-600'>*</span>
                                                                        </Label>
                                                                        <Popover>
                                                                            <PopoverTrigger asChild>
                                                                                <Button
                                                                                    type='button'
                                                                                    variant='outline'
                                                                                    className={cn(
                                                                                        'w-full justify-start text-left font-normal',
                                                                                        !workingDay && 'text-muted-foreground'
                                                                                    )}>
                                                                                    <CalendarIcon className='mr-2 h-4 w-4' />
                                                                                    {workingDay
                                                                                        ? format(new Date(workingDay), 'dd/MM/yyyy')
                                                                                        : 'Working Day'}
                                                                                </Button>
                                                                            </PopoverTrigger>
                                                                            <PopoverContent className='w-auto p-0' align='start'>
                                                                                <CalendarYear
                                                                                    mode='single'
                                                                                    selected={workingDay ? new Date(workingDay) : undefined}
                                                                                    onSelect={(date: Date | undefined) =>
                                                                                        setWorkingDay(date?.toISOString() ?? '')
                                                                                    }
                                                                                    captionLayout='dropdown'
                                                                                    fromYear={2000}
                                                                                    toYear={2050}
                                                                                />
                                                                            </PopoverContent>
                                                                        </Popover>
                                                                    </div>
                                                                    <div>
                                                                        <Label className='font-medium text-sm text-white-900'>
                                                                            Date Of Probation
                                                                            <span className='text-red-600'>*</span>
                                                                        </Label>
                                                                        <Popover>
                                                                            <PopoverTrigger asChild>
                                                                                <Button
                                                                                    type='button'
                                                                                    variant='outline'
                                                                                    className={cn(
                                                                                        'w-full justify-start text-left font-normal',
                                                                                        !probationDate && 'text-muted-foreground'
                                                                                    )}>
                                                                                    <CalendarIcon className='mr-2 h-4 w-4' />
                                                                                    {probationDate
                                                                                        ? format(new Date(probationDate), 'dd/MM/yyyy')
                                                                                        : 'Probation Date'}
                                                                                </Button>
                                                                            </PopoverTrigger>
                                                                            <PopoverContent className='w-auto p-0' align='start'>
                                                                                <CalendarYear
                                                                                    mode='single'
                                                                                    selected={
                                                                                        probationDate ? new Date(probationDate) : undefined
                                                                                    }
                                                                                    onSelect={(date: Date | undefined) =>
                                                                                        setProbationDate(date?.toISOString() ?? '')
                                                                                    }
                                                                                    captionLayout='dropdown'
                                                                                    fromYear={2000}
                                                                                    toYear={2050}
                                                                                />
                                                                            </PopoverContent>
                                                                        </Popover>
                                                                    </div>
                                                                </div>
                                                            )}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    {selectedMockLetter === '9' && (
                                        <div>
                                            <Label className='font-medium text-sm text-white-900'>
                                                Date Of Resignation
                                                <span className='text-red-600'>*</span>
                                            </Label>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        type='button'
                                                        variant='outline'
                                                        className={cn(
                                                            'w-full justify-start text-left font-normal',
                                                            !resignationDate && 'text-muted-foreground'
                                                        )}>
                                                        <CalendarIcon className='mr-2 h-4 w-4' />
                                                        {resignationDate
                                                            ? format(new Date(resignationDate), 'dd/MM/yyyy')
                                                            : 'Probation Date'}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className='w-auto p-0' align='start'>
                                                    <CalendarYear
                                                        mode='single'
                                                        selected={resignationDate ? new Date(resignationDate) : undefined}
                                                        onSelect={(date: Date | undefined) => setResignationDate(date?.toISOString() ?? '')}
                                                        captionLayout='dropdown'
                                                        fromYear={2000}
                                                        toYear={2050}
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                        </div>
                                    )}
                                    {selectedMockLetter === '10' && (
                                        <InputText label='Enter Bank Address' required id='bankAddress' placeholder='Bank Adress' />
                                    )} */}
                                </div>
                                {/* <div className=''>
                                    {masterGroupTypesLoading ? (
                                        <div className='h-10 w-full animate-pulse rounded-md bg-white-200' />
                                    ) : MockLetterOptions.length === 0 ? (
                                        <div className='text-sm text-white-500'>No group types available</div>
                                    ) : masterGroupTypesError ? (
                                        <SelectItem value='error' disabled>
                                            Error loading data
                                        </SelectItem>
                                    ) : (
                                        <>
                                            <Controller
                                                name='mockLetter'
                                                control={control}
                                                render={({ field }) => (
                                                    <RadioGroup
                                                        onValueChange={field.onChange}
                                                        value={field.value}
                                                        className='grid max-h-64 grid-cols-1 gap-4 overflow-y-auto rounded-md border border-purple-500 p-3'>
                                                        {MockLetterOptions.map((option) => (
                                                            <div
                                                                key={option.value}
                                                                className='flex cursor-pointer items-center space-x-3 transition-colors hover:bg-accent/50'>
                                                                <RadioGroupItem value={option.value} id={`letter-${option.value}`} />
                                                                <Label
                                                                    htmlFor={`letter-${option.value}`}
                                                                    className='flex-1 cursor-pointer font-normal text-sm'>
                                                                    {option.label}
                                                                </Label>
                                                            </div>
                                                        ))}
                                                    </RadioGroup>
                                                )}
                                            />
                                            {errors.mockLetter && <FormError>{errors.mockLetter.message}</FormError>}
                                        </>
                                    )}
                                </div> */}
                            </div>
                        </div>

                        <div className='flex flex-col gap-3 border-t pt-4 sm:flex-row sm:justify-center'>
                            <Button
                                type='button'
                                variant='outline'
                                onClick={handleReset}
                                disabled={isSearching || isSubmitting}
                                className='order-2 w-fit transition-all duration-200 hover:scale-105 sm:order-1'>
                                Reset
                            </Button>
                            <Button
                                type='button'
                                onClick={handleSubmit(onSearch)}
                                disabled={isSearching || isSubmitting}
                                className='order-1 w-fit transition-all duration-200 hover:scale-105 sm:order-2'>
                                {isSearching ? (
                                    <>
                                        <RefreshCw className='mr-2 h-4 w-4 animate-spin' />
                                        Searching...
                                    </>
                                ) : (
                                    <div className='flex items-center'>
                                        <Search className='mr-2 h-4 w-4' />
                                        Search
                                    </div>
                                )}
                            </Button>
                        </div>
                    </div>
                </CollapsibleSection>

                {/* {reportData && (
                    <CollapsibleSection
                        title='Salary Certificate'
                        defaultOpen={true}
                        variant='outline'
                        size='md'
                        className='slide-in-from-top-4 animate-in shadow-lg duration-300'>
                        <div className='space-y-6 p-6 '>
                            <div className='space-y-4'>
                                <Label className='mx-auto block text-center text-gray-600 underline'>Salary Certificate</Label>

                                <p className='text-justify leading-relaxed'>
                                    This is to certify that Mr/Ms.{' '}
                                    <span className='font-semibold'>
                                        {reportData.currentemployeeDetails.hrmE_EmployeeFirstName}
                                        {reportData.currentemployeeDetails.hrmE_EmployeeLastName}
                                    </span>{' '}
                                    (Employee Code:{' '}
                                    <span className='font-semibold'>{reportData.currentemployeeDetails.hrmE_EmployeeCode}</span>) is working
                                    in Our Institution as a <span className='font-semibold'>{reportData.designationName}</span> and his/her
                                    monthly emoluments are as follows.
                                </p>
                            </div>

                            
                            <div className='overflow-x-auto rounded-lg border'>
                                <table className='w-full border-collapse'>
                                    <thead>
                                        <tr className='border-white-300 border-b-2 bg-white-100'>
                                            <th className='border border-white-300 px-4 py-3 text-left font-semibold text-sm'>
                                                Pay & Allowance
                                            </th>
                                            <th className='border border-white-300 px-4 py-3 text-right font-semibold text-sm'>Amount</th>
                                            <th className='border border-white-300 px-4 py-3 text-left font-semibold text-sm'>
                                                Deductions
                                            </th>
                                            <th className='border border-white-300 px-4 py-3 text-right font-semibold text-sm'>Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(() => {
                                            const earnings = reportData.employeeSalaryslipDetails.filter(
                                                (item: any) => item.HRMED_EarnDedFlag === 'Earning'
                                            );
                                            const deductions = reportData.employeeSalaryslipDetails.filter(
                                                (item: any) => item.HRMED_EarnDedFlag === 'Deduction'
                                            );
                                            const maxRows = Math.max(earnings.length, deductions.length);

                                            return Array.from({ length: maxRows }).map((_, index) => (
                                                <tr key={index} className='hover:bg-white-50'>
                                                    <td className='border border-white-300 px-4 py-2 text-sm'>
                                                        {earnings[index]?.HRMED_Name || ''}
                                                    </td>
                                                    <td className='border border-white-300 px-4 py-2 text-right text-sm'>
                                                        {earnings[index]
                                                            ? `₹${earnings[index].Amount.toLocaleString('en-IN', {
                                                                minimumFractionDigits: 2,
                                                                maximumFractionDigits: 2
                                                            })}`
                                                            : ''}
                                                    </td>
                                                    <td className='border border-white-300 px-4 py-2 text-sm'>
                                                        {deductions[index]?.HRMED_Name || ''}
                                                    </td>
                                                    <td className='border border-white-300 px-4 py-2 text-right text-sm'>
                                                        {deductions[index]
                                                            ? `₹${deductions[index].Amount.toLocaleString('en-IN', {
                                                                minimumFractionDigits: 2,
                                                                maximumFractionDigits: 2
                                                            })}`
                                                            : ''}
                                                    </td>
                                                </tr>
                                            ));
                                        })()}

                                        <tr className='border-white-400 border-t-2 bg-white-200 font-bold'>
                                            <td className='border border-white-300 px-4 py-3 text-sm'>Gross Earning:</td>
                                            <td className='border border-white-300 px-4 py-3 text-right text-sm'>
                                                ₹
                                                {grossEarning.toLocaleString('en-IN', {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2
                                                })}
                                            </td>
                                            <td className='border border-white-300 px-4 py-3 text-sm'>Gross Deduction:</td>
                                            <td className='border border-white-300 px-4 py-3 text-right text-sm'>
                                                ₹
                                                {totalDeductions.toLocaleString('en-IN', {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2
                                                })}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            <div className='flex justify-end'>
                                <div className='rounded-lg border bg-white-50 px-6 py-4'>
                                    <div className='flex items-center gap-4'>
                                        <span className='font-semibold text-lg'>Net Salary:</span>
                                        <span className='font-bold text-gray-600 text-xl'>
                                            ₹
                                            {netSalary.toLocaleString('en-IN', {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2
                                            })}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className='flex items-end justify-between border-t pt-6'>
                                <div>
                                    <p className='font-medium text-sm'>Date: {getTodayDate()}</p>
                                </div>
                                <div className='text-right'>
                                    <div className='mb-16' />
                                    <p className='font-semibold'>Principal</p>
                                </div>
                            </div>

                            
                            <div className='flex flex-col gap-3 border-t pt-4 sm:flex-row sm:justify-center'>
                                <Button
                                    type='button'
                                    variant='outline'
                                    onClick={handleReset}
                                    className='order-2 w-fit transition-all duration-200 hover:scale-105 sm:order-1'>
                                    Cancel
                                </Button>
                                <Button
                                    type='button'
                                    onClick={handlePrint}
                                    className='no-print order-1 w-fit transition-all duration-200 hover:scale-105 sm:order-2'>
                                    <Printer className='mr-2 h-4 w-4' />
                                    Print
                                </Button>
                            </div>
                        </div>
                    </CollapsibleSection>
                )} */}

                {reportData && (
                    <CollapsibleSection title='Employee service Report' defaultOpen={true}>
                        <div className='mt-20 flex justify-end gap-2 text-sm'>
                            <p className='font-semibold text-gray-600'>Date : {getTodayDate()}</p>
                        </div>
                        <div className='mt-8 flex flex-col justify-center'>
                            <p className='text-center font-semibold text-blue-900 text-lg leading-relaxed'>TO WHOMSOEVER IT MAY CONCERN</p>
                            <p className='mt-6 text-center text-base leading-relaxed'>
                                This is to certify that{' '}
                                {reportData.empgender === 'Female' ? (reportData.maritalstate === 'Married' ? 'Mrs. ' : 'Ms. ') : 'Mr. '}{' '}
                                <span className='font-semibold text-md'>{fullName}</span> is a Permanent/Probationary employee of <br />
                                Our Institution working as a <span className='font-semibold text-md'>{reportData.designationName}</span>{' '}
                                since {reportData?.currentemployeeDetails?.hrmE_DOJ?.split('T')[0]}.
                            </p>
                        </div>
                        <div className='mt-20 flex justify-between'>
                            <p>{}</p>
                            <p>MANAGER</p>
                        </div>
                    </CollapsibleSection>
                )}
            </div>
        </div>
    );
}
