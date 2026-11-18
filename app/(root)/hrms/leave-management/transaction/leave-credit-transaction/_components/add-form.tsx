'use client';
import { Button } from '@/components/ui/button';
import { DatePickerWithYear } from '@/components/ui/date-picker-year';
import { FormError, Label } from '@/components/ui/extension/field';
import { Input } from '@/components/ui/input';
import { MultiSelect } from '@/components/ui/multi-select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLeaveCreditTransaction, useSaveLeaveCreditTransaction } from '@/hooks/hrms/leave-management/useTransactions';
import { useLeaveReportDesignations, useMasterDepartments, usePeriodLeaveReportEmployees } from '@/hooks/hrms/useReports';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Save, X } from 'lucide-react';
import { CalendarIcon } from 'lucide-react';
import { useEffect, useMemo } from 'react';
import { useState } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import type { LeaveCreditTransaction } from './columns';

interface LeaveCreditTransactionFormData extends Partial<LeaveCreditTransaction> {
    type: string[];
    department: number[];
    designation: number[];
    leaveYear: string;
    employee: number | string; // Allow both for transition but prefer number (ID)
    lossOfPayType: string;
    lossOfPayAmount: number;
    availed: number;
}

interface AddLeaveCreditTransactionFormProps {
    onSuccess?: () => void;
    className?: string;
}

const typeOptions = [
    { label: 'VKS', value: 'VKS' },
    { label: 'Permanent', value: 'Permanent' },
    { label: 'ELearning', value: 'ELearning' },
    { label: 'Robotic', value: 'Robotic' },
    { label: 'Internship', value: 'Internship' },
    { label: 'Management Admin', value: 'Management Admin' }
];

export default function AddLeaveCreditTransactionForm({ onSuccess, className = '' }: AddLeaveCreditTransactionFormProps) {
    const { refetchAll } = useLeaveCreditTransaction();
    const { mutate: saveTransaction, isPending } = useSaveLeaveCreditTransaction();
    const [fromDateOpen, setFromDateOpen] = useState(false);
    const [toDateOpen, setToDateOpen] = useState(false);

    // State for cascading filters
    const [selectedDepartmentIds, setSelectedDepartmentIds] = useState<number[]>([]);
    const [selectedDesignationIds, setSelectedDesignationIds] = useState<number[]>([]);

    // Report Hooks
    const { data: departmentsData, isLoading: isLoadingDepartments } = useMasterDepartments();
    const { data: designationsData, isLoading: isLoadingDesignations } = useLeaveReportDesignations(selectedDepartmentIds);
    const { data: employeesData, isLoading: isLoadingEmployees } = usePeriodLeaveReportEmployees(
        selectedDepartmentIds,
        selectedDesignationIds
    );

    const departmentOptions = useMemo(() => {
        const raw = departmentsData?.data || departmentsData || [];
        return (Array.isArray(raw) ? raw : [])
            .map((item: any) => ({
                label: item.hrmD_DepartmentName || item.hrmd_departmentName || item.value || '',
                value: String(item.hrmD_Id || item.hrmd_id || item.key)
            }))
            .filter((i: any) => i.value);
    }, [departmentsData]);

    const designationOptions = useMemo(() => {
        const raw = designationsData || [];
        return (Array.isArray(raw) ? raw : [])
            .map((item: any) => ({
                label: item.hrmdeS_DesignationName || item.hrmdes_designationName || item.value || '',
                value: String(item.hrmdeS_Id || item.hrmdes_id || item.key)
            }))
            .filter((i: any) => i.value);
    }, [designationsData]);

    const employeeOptions = useMemo(() => {
        if (!employeesData || !Array.isArray(employeesData)) return [];
        return employeesData
            .map((item: any) => {
                const id = item.HRME_Id || item.hrmE_Id || item.id || item.key;
                const name = item.HRME_EmployeeFirstName || item.hrmE_EmployeeFirstName || item.value || item.employeeName || '';
                const code = item.HRME_EmployeeCode || item.hrmE_EmployeeCode || item.employeeCode || '';
                return {
                    label: code ? `${name} (${code})` : name,
                    value: Number(id)
                };
            })
            .filter((i: any) => i.value);
    }, [employeesData]);

    const {
        register,
        handleSubmit,
        control,
        watch,
        setValue,
        trigger,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<LeaveCreditTransactionFormData>({
        mode: 'onChange',
        defaultValues: {
            type: [],
            department: [],
            designation: [],
            leaveYear: '2025',
            fromDate: '',
            toDate: '',
            totalDays: 0,
            employee: '',
            lossOfPayType: 'none',
            lossOfPayAmount: 0,
            leaveName: 'CL',
            availed: 0
        }
    });
    const fromDate = watch('fromDate');
    const toDate = watch('toDate');
    const totalDays = watch('totalDays');
    const lossOfPayType = watch('lossOfPayType');
    // Calculate total days from dates
    useEffect(() => {
        if (fromDate && toDate) {
            const from = new Date(fromDate);
            const to = new Date(toDate);
            if (to >= from) {
                const diffTime = Math.abs(to.getTime() - from.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end dates
                setValue('totalDays', diffDays);
            } else {
                setValue('totalDays', 0);
            }
        } else {
            setValue('totalDays', 0);
        }
    }, [fromDate, toDate, setValue]);
    // Calculate loss of pay amount based on type and total days
    useEffect(() => {
        if (lossOfPayType && lossOfPayType !== 'none' && totalDays && totalDays > 0) {
            let multiplier = 0;
            switch (lossOfPayType) {
                case 'full':
                    multiplier = 1.0;
                    break;
                case 'half':
                    multiplier = 0.5;
                    break;
                case 'oneFourth':
                    multiplier = 0.25;
                    break;
                case 'threeFourth':
                    multiplier = 0.75;
                    break;
                default:
                    multiplier = 0;
            }
            setValue('lossOfPayAmount', Number.parseFloat(((totalDays || 0) * multiplier).toFixed(2)));
        } else {
            setValue('lossOfPayAmount', 0);
        }
    }, [lossOfPayType, totalDays, setValue]);
    const onSubmit: SubmitHandler<LeaveCreditTransactionFormData> = async (data) => {
        saveTransaction(data as any, {
            onSuccess: () => {
                reset();
                refetchAll();
                onSuccess?.();
            }
        });
    };
    const handleReset = () => {
        reset();
    };
    return (
        <div className={`${className}`}>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
                {/* Type, Department, Designation - First Row */}
                <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                    <div>
                        <Label htmlFor='type-multiselect' className='mb-2 block'>
                            Type :
                        </Label>
                        <Controller
                            name='type'
                            control={control}
                            render={({ field }) => (
                                <MultiSelect
                                    id='type-multiselect'
                                    options={typeOptions}
                                    onValueChange={field.onChange}
                                    defaultValue={field.value || []}
                                    placeholder='Select Type'
                                />
                            )}
                        />
                    </div>
                    <div>
                        <Label htmlFor='department-multiselect' className='mb-2 block'>
                            Department :
                        </Label>
                        <Controller
                            name='department'
                            control={control}
                            render={({ field }) => (
                                <MultiSelect
                                    id='department-multiselect'
                                    options={departmentOptions}
                                    onValueChange={(vals) => {
                                        const numVals = vals.map(Number);
                                        field.onChange(numVals);
                                        setSelectedDepartmentIds(numVals);
                                    }}
                                    defaultValue={field.value?.map(String) || []}
                                    placeholder='Select Department'
                                />
                            )}
                        />
                    </div>
                    <div>
                        <Label htmlFor='designation-multiselect' className='mb-2 block'>
                            Designation :
                        </Label>
                        <Controller
                            name='designation'
                            control={control}
                            render={({ field }) => (
                                <MultiSelect
                                    id='designation-multiselect'
                                    options={designationOptions}
                                    onValueChange={(vals) => {
                                        const numVals = vals.map(Number);
                                        field.onChange(numVals);
                                        setSelectedDesignationIds(numVals);
                                    }}
                                    defaultValue={field.value?.map(String) || []}
                                    placeholder='Select Designation'
                                />
                            )}
                        />
                    </div>
                </div>
                {/* Leave Year, Employee, From Date, To Date, Total Days - Second Row */}
                <div className='grid grid-cols-1 gap-4 md:grid-cols-5'>
                    <Controller
                        name='leaveYear'
                        control={control}
                        rules={{ required: 'Leave Year is required' }}
                        render={({ field }) => (
                            <div>
                                <Label htmlFor='leave-year-select'>
                                    Leave Year :<span className='text-red-500'>*</span>
                                </Label>
                                <Select value={field.value} onValueChange={field.onChange}>
                                    <SelectTrigger id='leave-year-select' className={(errors as any).leaveYear ? 'border-red-500' : ''}>
                                        <SelectValue placeholder='Year' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {['2019', '2020', '2021', '2022', '2023', '2024', '2025'].map((y) => (
                                            <SelectItem key={y} value={y}>
                                                {y}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {(errors as any).leaveYear && <FormError>{(errors as any).leaveYear.message}</FormError>}
                            </div>
                        )}
                    />
                    <Controller
                        name='employee'
                        control={control}
                        rules={{ required: 'Employee is required' }}
                        render={({ field }) => (
                            <div>
                                <Label htmlFor='employee-select'>
                                    Employee :<span className='text-red-500'>*</span>
                                </Label>
                                <Select value={String(field.value || '')} onValueChange={(val) => field.onChange(Number(val))}>
                                    <SelectTrigger id='employee-select' className={(errors as any).employee ? 'border-red-500' : ''}>
                                        <SelectValue placeholder='Select employee...' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {employeeOptions.map((e: any) => (
                                            <SelectItem key={e.value} value={String(e.value)}>
                                                {e.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {(errors as any).employee && <FormError>{(errors as any).employee.message}</FormError>}
                            </div>
                        )}
                    />
                    <Controller
                        name='fromDate'
                        control={control}
                        rules={{ required: 'From Date is required' }}
                        render={({ field }) => (
                            <div>
                                <Label htmlFor='from-date-input'>
                                    From Date :<span className='text-red-500'>*</span>
                                </Label>
                                <Popover open={fromDateOpen} onOpenChange={setFromDateOpen}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant='outline'
                                            id='from-date-input'
                                            className={cn(
                                                'w-full justify-start text-left font-normal',
                                                !field.value && 'text-muted-foreground',
                                                (errors as any).fromDate && 'border-red-500'
                                            )}>
                                            <CalendarIcon className='mr-2 h-4 w-4' />
                                            {field.value ? format(new Date(field.value), 'PPP') : <span>Pick from date</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className='w-auto p-0' align='start'>
                                        <DatePickerWithYear
                                            mode='single'
                                            selected={field.value ? new Date(field.value) : undefined}
                                            onSelect={(date) => {
                                                if (date) {
                                                    const dateStr = format(date, 'yyyy-MM-dd');
                                                    field.onChange(dateStr);
                                                    setValue('fromDate', dateStr, { shouldValidate: true });
                                                    trigger('fromDate');
                                                    setFromDateOpen(false);
                                                }
                                            }}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                                {(errors as any).fromDate && <FormError>{(errors as any).fromDate.message}</FormError>}
                            </div>
                        )}
                    />
                    <Controller
                        name='toDate'
                        control={control}
                        rules={{ required: 'To Date is required' }}
                        render={({ field }) => (
                            <div>
                                <Label htmlFor='to-date-input'>
                                    To Date :<span className='text-red-500'>*</span>
                                </Label>
                                <Popover open={toDateOpen} onOpenChange={setToDateOpen}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant='outline'
                                            id='to-date-input'
                                            className={cn(
                                                'w-full justify-start text-left font-normal',
                                                !field.value && 'text-muted-foreground',
                                                (errors as any).toDate && 'border-red-500'
                                            )}>
                                            <CalendarIcon className='mr-2 h-4 w-4' />
                                            {field.value ? format(new Date(field.value), 'PPP') : <span>Pick to date</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className='w-auto p-0' align='start'>
                                        <DatePickerWithYear
                                            mode='single'
                                            selected={field.value ? new Date(field.value) : undefined}
                                            onSelect={(date) => {
                                                if (date) {
                                                    const dateStr = format(date, 'yyyy-MM-dd');
                                                    field.onChange(dateStr);
                                                    setValue('toDate', dateStr, { shouldValidate: true });
                                                    trigger('toDate');
                                                    setToDateOpen(false);
                                                }
                                            }}
                                            fromDate={fromDate ? new Date(fromDate) : undefined}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                                {(errors as any).toDate && <FormError>{(errors as any).toDate.message}</FormError>}
                            </div>
                        )}
                    />
                    <div>
                        <Label htmlFor='total-days-input'>
                            Total Days :<span className='text-red-500'>*</span>
                        </Label>
                        <Input id='total-days-input' type='number' disabled={true} readOnly value={totalDays || 0} className='bg-muted' />
                    </div>
                </div>
                {/* Loss of Pay Options and Calculated Field */}
                {/* <div className='space-y-3 '>
                    <Label>Loss Of Pay :</Label>
                    <Controller
                        name='lossOfPayType'
                        control={control}
                        render={({ field }) => (
                            <RadioGroup value={field.value || 'none'} onValueChange={field.onChange} className='space-y-2'>
                                <div className='flex items-center space-x-2'>
                                    <RadioGroupItem value='full' id='loss-of-pay-full' />
                                    <Label htmlFor='loss-of-pay-full' className='cursor-pointer font-normal'>
                                        Loss Of Pay
                                    </Label>
                                </div>
                                <div className='flex items-center space-x-2'>
                                    <RadioGroupItem value='half' id='loss-of-pay-half' />
                                    <Label htmlFor='loss-of-pay-half' className='cursor-pointer font-normal'>
                                        Loss Of Pay Half Day
                                    </Label>
                                </div>
                                <div className='flex items-center space-x-2'>
                                    <RadioGroupItem value='oneFourth' id='loss-of-pay-one-fourth' />
                                    <Label htmlFor='loss-of-pay-one-fourth' className='cursor-pointer font-normal'>
                                        Loss Of Pay One Fourth Day
                                    </Label>
                                </div>
                                <div className='flex items-center space-x-2'>
                                    <RadioGroupItem value='threeFourth' id='loss-of-pay-three-fourth' />
                                    <Label htmlFor='loss-of-pay-three-fourth' className='cursor-pointer font-normal'>
                                        Loss Of Pay Three Fourth Day
                                    </Label>
                                </div>
                            </RadioGroup>
                        )}
                    />
                    <div>
                        <Input
                            type='number'
                            step='0.01'
                            readOnly
                            value={watch('lossOfPayAmount') || 0}
                            className='bg-muted'
                            placeholder='Auto-calculated'
                        />
                    </div>
                </div> */}
                {/* Action Buttons */}
                <div className='flex justify-center gap-4 pt-4'>
                    <Button type='submit' disabled={isPending || isSubmitting} variant='default'>
                        <Save className='mr-2 h-4 w-4' />
                        {isPending || isSubmitting ? 'Saving...' : 'SAVE'}
                    </Button>
                    <Button type='button' variant='outline' onClick={handleReset} disabled={isPending || isSubmitting}>
                        <X className='mr-2 h-4 w-4' />
                        CANCEL
                    </Button>
                </div>
            </form>
        </div>
    );
}
