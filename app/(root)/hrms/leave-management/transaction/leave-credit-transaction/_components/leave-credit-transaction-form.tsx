'use client';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { FormError } from '@/components/ui/extension/field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MultiSelect } from '@/components/ui/multi-select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { differenceInDays } from 'date-fns';
import { Save, X } from 'lucide-react';
import { useEffect } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import type { LeaveCreditTransaction } from './columns';

interface LeaveCreditTransactionFormProps {
    editingRow: LeaveCreditTransaction | null;
    onSubmit: (data: LeaveCreditTransaction) => void;
    onCancel: () => void;
    types: Array<{ id: number; name: string }>;
    departments: Array<{ id: number; name: string }>;
    designations: Array<{ id: number; name: string }>;
    employees: Array<{ id: number; employeeCode: string; employeeName: string }>;
    years: Array<{ id: number; year: string; fromDate: string; toDate: string; isActive: boolean }>;
    activeYearId: number;
    isLoadingTypes: boolean;
    isLoadingDepartments: boolean;
    isLoadingDesignations: boolean;
    isLoadingEmployees: boolean;
    onFilterChange: (type: 'types' | 'departments' | 'designations', values: number[]) => void;
}

type FormData = LeaveCreditTransaction & {
    selectedTypeIds: string[];
    selectedDeptIds: string[];
    selectedDesignationIds: string[];
    lossOfPayType?: string;
    lossOfPayAmount?: number;
};

export function LeaveCreditTransactionForm({
    editingRow,
    onSubmit,
    onCancel,
    types,
    departments,
    designations,
    employees,
    years,
    activeYearId,
    isLoadingTypes,
    isLoadingDepartments,
    isLoadingDesignations,
    isLoadingEmployees,
    onFilterChange
}: LeaveCreditTransactionFormProps) {
    const {
        control,
        handleSubmit,
        watch,
        setValue,
        reset,
        formState: { errors }
    } = useForm<FormData>({
        defaultValues: (editingRow
            ? {
                ...editingRow,
                selectedTypeIds: [],
                selectedDeptIds: [],
                selectedDesignationIds: [],
                lossOfPayType: '',
                lossOfPayAmount: 0
            }
            : {
                employeeId: 0,
                leaveName: '',
                hrmL_LeaveType: '',
                hrmlY_Id: activeYearId,
                fromDate: undefined,
                toDate: undefined,
                totalDays: 0,
                id: 0,
                transactionId: 0,
                isActive: true,
                employeeName: '',
                createdAt: new Date(),
                selectedTypeIds: [],
                selectedDeptIds: [],
                selectedDesignationIds: [],
                lossOfPayType: '',
                lossOfPayAmount: 0
            }) as unknown as FormData
    });

    const fromDate = watch('fromDate');
    const toDate = watch('toDate');
    const totalDays = watch('totalDays');
    const lossOfPayType = watch('lossOfPayType');
    const lossOfPayAmount = watch('lossOfPayAmount');

    /* ---------------- TOTAL DAYS CALCULATION ---------------- */
    useEffect(() => {
        if (fromDate && toDate) {
            const start = new Date(fromDate);
            const end = new Date(toDate);
            start.setHours(0, 0, 0, 0);
            end.setHours(0, 0, 0, 0);
            if (end >= start) {
                setValue('totalDays', differenceInDays(end, start) + 1);
            } else {
                setValue('totalDays', 0);
            }
        } else {
            setValue('totalDays', 0);
        }
    }, [fromDate, toDate, setValue]);

    /* ---------------- LOSS OF PAY CALCULATION ---------------- */
    useEffect(() => {
        if (lossOfPayType && totalDays > 0) {
            let multiplier = 0;
            switch (lossOfPayType) {
                case 'full':
                    multiplier = 0;
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
            }
            setValue('lossOfPayAmount', Number.parseFloat((totalDays - multiplier).toFixed(2)));
        } else {
            setValue('lossOfPayAmount', 0);
        }
    }, [lossOfPayType, totalDays, setValue]);

    // Automatically set Leave Year based on Date Range
    useEffect(() => {
        if (fromDate && years && years.length > 0) {
            try {
                const date = new Date(fromDate);
                // Find year where fromDate falls within [year.fromDate, year.toDate]
                const matchingYear = years.find((y) => {
                    if (!y.fromDate || !y.toDate) return false;
                    const start = new Date(y.fromDate);
                    const end = new Date(y.toDate);
                    // Reset times for accurate comparison
                    date.setHours(0, 0, 0, 0);
                    start.setHours(0, 0, 0, 0);
                    end.setHours(0, 0, 0, 0);
                    return date >= start && date <= end;
                });

                if (matchingYear) {
                    setValue('hrmlY_Id', matchingYear.id);
                } else {
                    if (!editingRow) {
                        setValue('hrmlY_Id', activeYearId);
                    }
                }
            } catch (e) {
                console.error('Error matching leave year', e);
            }
        }
    }, [fromDate, years, setValue, activeYearId, editingRow]);

    const handleCancel = () => {
        reset({
            employeeId: 0,
            leaveName: '',
            hrmL_LeaveType: '',
            hrmlY_Id: activeYearId,
            fromDate: undefined,
            toDate: undefined,
            totalDays: 0,
            id: 0,
            transactionId: 0,
            isActive: true,
            employeeName: '',
            createdAt: new Date(),
            selectedTypeIds: [],
            selectedDeptIds: [],
            selectedDesignationIds: [],
            lossOfPayType: '',
            lossOfPayAmount: 0
        } as unknown as FormData);
    };

    const onSubmitForm: SubmitHandler<FormData> = (data) => {
        console.log('data', data);

        // Strip out the auxiliary filter fields and UI state
        const { selectedTypeIds, selectedDeptIds, selectedDesignationIds, lossOfPayType, lossOfPayAmount, ...transactionData } = data;
        console.log('transactionData', transactionData);
        const submitData = {
            ...transactionData,
            hrmlY_Id: data.hrmlY_Id || activeYearId || 0,
            transactionId: editingRow?.transactionId || 0
        };
        onSubmit(submitData as unknown as LeaveCreditTransaction);
    };

    return (
        <form onSubmit={handleSubmit(onSubmitForm)} className='space-y-6'>
            {/* Filters Section */}
            <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
                {/* Type Filter */}
                <div className='space-y-2'>
                    <Label className='font-medium text-sm'>Filter by Type: <span className='text-red-500'>*</span></Label>

                    <Controller
                        control={control}
                        name='selectedTypeIds'
                        render={({ field }) => (
                            <MultiSelect
                                options={types.map((t) => ({ label: t.name, value: String(t.id) }))}
                                onValueChange={(vals) => {
                                    field.onChange(vals);
                                    onFilterChange('types', vals.map(Number));
                                    setValue('employeeId', 0); // Reset employee selection
                                }}
                                defaultValue={field.value}
                                placeholder={isLoadingTypes ? 'Loading...' : 'Select Types'}
                                className='w-full'
                                maxHeight={200}
                            />
                        )}
                    />
                </div>
                {/* Department Filter */}
                <div className='space-y-2'>
                    <Label className='font-medium text-sm'>
                        Filter by Department: <span className='text-red-500'>*</span>
                    </Label>

                    <Controller
                        control={control}
                        name='selectedDeptIds'
                        render={({ field }) => (
                            <MultiSelect
                                options={departments.map((d) => ({ label: d.name, value: String(d.id) }))}
                                onValueChange={(vals) => {
                                    field.onChange(vals);
                                    onFilterChange('departments', vals.map(Number));
                                    setValue('employeeId', 0); // Reset employee selection
                                }}
                                defaultValue={field.value}
                                placeholder={isLoadingDepartments ? 'Loading...' : 'Select Departments'}
                                className='w-full'
                                maxHeight={200}
                                disabled={isLoadingDepartments || departments?.length === 0}
                            />
                        )}
                    />
                </div>
                {/* Designation Filter */}
                <div className='space-y-2'>
                    <Label className='font-medium text-sm'>
                        Filter by Designation: <span className='text-red-500'>*</span>
                    </Label>

                    <Controller
                        control={control}
                        name='selectedDesignationIds'
                        render={({ field }) => (
                            <MultiSelect
                                options={designations.map((d) => ({ label: d.name, value: String(d.id) }))}
                                onValueChange={(vals) => {
                                    field.onChange(vals);
                                    onFilterChange('designations', vals.map(Number));
                                    setValue('employeeId', 0); // Reset employee selection
                                }}
                                defaultValue={field.value}
                                placeholder={isLoadingDesignations ? 'Loading...' : 'Select Designations'}
                                className='w-full'
                                maxHeight={200}
                                disabled={isLoadingDesignations || designations.length === 0}
                            />
                        )}
                    />
                </div>
            </div>

            {/* Leave Details Section */}
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                <div>
                    <Label className='font-medium text-sm'>
                        Employee <span className='text-red-500'>*</span>
                    </Label>

                    <Controller
                        name='employeeId'
                        control={control}
                        rules={{ required: 'Employee is required', min: { value: 1, message: 'Employee is required' } }}
                        render={({ field }) => (
                            <Select value={field.value ? String(field.value) : ''} onValueChange={(val) => field.onChange(Number(val))}>
                                <SelectTrigger
                                    className={errors.employeeId ? 'border-red-500' : ''}
                                    disabled={isLoadingEmployees || employees.length === 0}>
                                    <SelectValue placeholder={isLoadingEmployees ? 'Loading...' : 'Select employee'} />
                                </SelectTrigger>
                                <SelectContent>
                                    {employees.length > 0 ? (
                                        employees.map((option: any) => (
                                            <SelectItem key={option.id} value={String(option.id)}>
                                                {option.employeeName} ({option.employeeCode})
                                            </SelectItem>
                                        ))
                                    ) : (
                                        <div className='p-2 text-center text-muted-foreground text-sm'>No employees found</div>
                                    )}
                                </SelectContent>
                            </Select>
                        )}
                    />

                    {errors.employeeId && <FormError>{errors.employeeId.message}</FormError>}
                </div>

                <div>
                    <Label className='font-medium text-sm'>
                        Year <span className='text-red-500'>*</span>
                    </Label>
                    <Controller
                        name='hrmlY_Id'
                        control={control}
                        rules={{ required: 'Year is required', min: { value: 1, message: 'Year is required' } }}
                        render={({ field }) => (
                            <Select value={field.value ? String(field.value) : ''} onValueChange={(val) => field.onChange(Number(val))}>
                                <SelectTrigger className={errors.hrmlY_Id ? 'border-red-500' : ''}>
                                    <SelectValue placeholder='Select Year' />
                                </SelectTrigger>
                                <SelectContent>
                                    {years.map((option) => (
                                        <SelectItem key={option.id} value={String(option.id)}>
                                            {option.year}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                    {errors.hrmlY_Id && <FormError>{errors.hrmlY_Id.message}</FormError>}
                </div>

                <div>
                    <Label className='font-medium text-sm'>
                        From Date <span className='text-red-500'>*</span>
                    </Label>
                    <Controller
                        name='fromDate'
                        control={control}
                        rules={{ required: 'From Date is required' }}
                        render={({ field }) => (
                            <DatePicker
                                date={field.value ? new Date(field.value) : undefined}
                                setDate={field.onChange}
                                placeholder='Select date'
                                className={cn('w-full', errors.fromDate && 'border-red-500')}
                            />
                        )}
                    />
                    {errors.fromDate && <FormError>{errors.fromDate.message}</FormError>}
                </div>

                <div>
                    <Label className='font-medium text-sm'>
                        To Date <span className='text-red-500'>*</span>
                    </Label>
                    <Controller
                        name='toDate'
                        control={control}
                        rules={{
                            required: 'To Date is required',
                            validate: (value) => {
                                if (!fromDate || !value) return true;
                                const start = new Date(fromDate);
                                const end = new Date(value);
                                start.setHours(0, 0, 0, 0);
                                end.setHours(0, 0, 0, 0);
                                return end >= start || 'To Date must be greater than or equal to From Date';
                            }
                        }}
                        render={({ field }) => (
                            <DatePicker
                                date={field.value ? new Date(field.value) : undefined}
                                setDate={field.onChange}
                                placeholder='Select date'
                                className={cn('w-full', errors.toDate && 'border-red-500')}
                            />
                        )}
                    />
                    {errors.toDate && <FormError>{errors.toDate.message}</FormError>}
                </div>

                <div>
                    <Label className='font-medium text-sm'>
                        Total Days <span className='text-red-500'>*</span>
                    </Label>
                    <Input
                        {...control.register('totalDays', { valueAsNumber: true, required: 'Total Days is required', min: 0.5 })}
                        type='text'
                        step='0.5'
                        disabled={true}
                        className={errors.totalDays ? 'border-red-500' : ''}
                    />
                    {errors.totalDays && <FormError>{errors.totalDays.message}</FormError>}
                </div>
            </div>

            {/* Loss of Pay Options and Calculated Field */}
            <div className='space-y-3'>
                <Label className={cn('font-medium text-sm', !fromDate || !toDate ? 'text-muted-foreground' : '')}>Loss Of Pay :</Label>
                <Controller
                    name='lossOfPayType'
                    control={control}
                    render={({ field }) => (
                        <RadioGroup
                            value={field.value || ''}
                            onValueChange={field.onChange}
                            className='space-y-2'
                            disabled={!fromDate || !toDate || totalDays <= 0}>
                            <div className='flex items-center space-x-2'>
                                <RadioGroupItem value='full' id='loss-of-pay-full' />
                                <Label
                                    htmlFor='loss-of-pay-full'
                                    className={cn(
                                        'font-normal',
                                        !fromDate || !toDate ? 'cursor-not-allowed text-muted-foreground' : 'cursor-pointer'
                                    )}>
                                    Loss Of Pay
                                </Label>
                            </div>
                            <div className='flex items-center space-x-2'>
                                <RadioGroupItem value='half' id='loss-of-pay-half' />
                                <Label
                                    htmlFor='loss-of-pay-half'
                                    className={cn(
                                        'font-normal',
                                        !fromDate || !toDate ? 'cursor-not-allowed text-muted-foreground' : 'cursor-pointer'
                                    )}>
                                    Loss Of Pay Half Day
                                </Label>
                            </div>
                            <div className='flex items-center space-x-2'>
                                <RadioGroupItem value='oneFourth' id='loss-of-pay-one-fourth' />
                                <Label
                                    htmlFor='loss-of-pay-one-fourth'
                                    className={cn(
                                        'font-normal',
                                        !fromDate || !toDate ? 'cursor-not-allowed text-muted-foreground' : 'cursor-pointer'
                                    )}>
                                    Loss Of Pay One Fourth Day
                                </Label>
                            </div>
                            <div className='flex items-center space-x-2'>
                                <RadioGroupItem value='threeFourth' id='loss-of-pay-three-fourth' />
                                <Label
                                    htmlFor='loss-of-pay-three-fourth'
                                    className={cn(
                                        'font-normal',
                                        !fromDate || !toDate ? 'cursor-not-allowed text-muted-foreground' : 'cursor-pointer'
                                    )}>
                                    Loss Of Pay Three Fourth Day
                                </Label>
                            </div>
                        </RadioGroup>
                    )}
                />
                {fromDate && toDate && totalDays > 0 && lossOfPayType && (
                    <div>
                        <Input
                            type='number'
                            step='0.01'
                            readOnly
                            value={watch('lossOfPayAmount') || ''}
                            className='w-full md:w-1/2'
                            placeholder='Auto-calculated'
                        />
                    </div>
                )}
            </div>

            {/* Action Buttons */}
            <div className='flex justify-center gap-2 pt-4'>
                <Button type='submit' variant='default' className='min-w-[120px]'>
                    <Save className='mr-2 h-4 w-4' />
                    SAVE
                </Button>
                <Button type='button' variant='outline' onClick={handleCancel}>
                    <X className='mr-2 h-4 w-4' />
                    CANCEL
                </Button>
            </div>
        </form>
    );
}
