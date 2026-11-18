'use client';

import { Button } from '@/components/ui/button';
import { CalendarYear } from '@/components/ui/calendar_year';
import { FormError, Label } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useEmployeeLoan, useEmployeeLoanMasters, useSaveEmployeeLoan } from '@/hooks/hrms/useTransactions';
import { cn } from '@/lib/utils';
import { hrmsTransactionSchemas } from '@/schemas/hrms/transaction';
import { getEmployeeLoanById } from '@/server/hrms/hrmsConfig/transaction/employee-loan';
import type { EmployeeLoanItem, EmployeeLoanMastersResponse } from '@/types/hrms/employee-loan';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { CalendarIcon, Save } from 'lucide-react';
import { useEffect, useMemo } from 'react';
import { Controller, type SubmitHandler, useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

type EmployeeLoanForm = z.infer<typeof hrmsTransactionSchemas.employeeLoan.form>;

interface UpdateFormProps {
    selectedRow: EmployeeLoanItem | null;
    onloadData?: EmployeeLoanMastersResponse | undefined;
    onSuccess?: () => void;
    className?: string;
}

export default function UpdateEmployeeLoanForm({ selectedRow, onloadData, onSuccess, className = '' }: UpdateFormProps) {
    const { refetchAll } = useEmployeeLoan();
    const { mutate: saveLoan, isPending } = useSaveEmployeeLoan();
    const { data: fetchedMasters } = useEmployeeLoanMasters();
    const masters = onloadData || fetchedMasters;

    // Memoize arrays to prevent unnecessary re-renders
    const employees = useMemo(() => masters?.employeedropdown || [], [masters?.employeedropdown]);
    const loanTypes = useMemo(() => masters?.masterloandropdown || [], [masters?.masterloandropdown]);
    const paymentModes = useMemo(() => masters?.modeOfPaymentdropdown || [], [masters?.modeOfPaymentdropdown]);

    const {
        register,
        handleSubmit,
        reset,
        control,
        setValue,
        watch,
        formState: { errors, isSubmitting, isDirty }
    } = useForm<EmployeeLoanForm>({
        resolver: zodResolver(hrmsTransactionSchemas.employeeLoan.form),
        mode: 'onChange',
        defaultValues: {
            employeeId: selectedRow?.HRME_Id || 0,
            loanTypeId: selectedRow?.HRMLN_Id || 0,
            amount: selectedRow?.HREL_LoanAmount || 0,
            installments: Number(selectedRow?.HREL_LoanInsallments) || 0,
            startDate: selectedRow?.HREL_AppliedDate ? format(new Date(selectedRow.HREL_AppliedDate), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
            modeOfPayment: selectedRow?.HREL_ModeOfPayment || '',
            referenceNo: String(selectedRow?.HREL_ReferenceNo || ''),
            loanInterest: selectedRow?.HREL_LoanInterest || 0,
            loanEMI: Number(selectedRow?.HREL_LaonEMI) || 0
        }
    });

    // Watch employeeId to enable/disable loan fields
    const watchedEmployeeId = useWatch({
        control,
        name: 'employeeId',
        defaultValue: selectedRow?.HRME_Id || 0
    });

    const isEmployeeSelected = watchedEmployeeId && watchedEmployeeId > 0;

    useEffect(() => {
        let isMounted = true;
        const fetchLoanDetails = async () => {
            if (selectedRow) {
                try {
                    const response = await getEmployeeLoanById(selectedRow.HREL_Id);

                    if (isMounted && response.success && response.data) {
                        const loan = response.data;
                        reset({
                            employeeId: loan.HRME_Id || 0,
                            loanTypeId: loan.HRMLN_Id || 0,
                            amount: loan.HREL_LoanAmount || 0,
                            installments: Number(loan.HREL_LoanInsallments) || 0,
                            startDate: loan.HREL_AppliedDate ? format(new Date(loan.HREL_AppliedDate), 'yyyy-MM-dd') : '',
                            modeOfPayment: loan.HREL_ModeOfPayment || '',
                            referenceNo: String(loan.HREL_ReferenceNo || ''),
                            loanInterest: loan.HREL_LoanInterest || 0,
                            loanEMI: Number(loan.HREL_LaonEMI || 0)
                        });
                    }
                } catch (error) {
                    console.error('Failed to fetch loan details:', error);
                }
            }
        };

        fetchLoanDetails();

        return () => {
            isMounted = false;
        };
    }, [selectedRow, reset]);

    const onSubmit: SubmitHandler<EmployeeLoanForm> = async (data: EmployeeLoanForm) => {
        if (!selectedRow) {
            toast.error('No row selected for update');
            return;
        }
        const loanData = {
            HREL_Id: selectedRow.HREL_Id,
            MI_Id: selectedRow.MI_Id || 0,
            HRME_Id: data.employeeId,
            HRMLN_Id: data.loanTypeId,
            HREL_AppliedDate: new Date(data.startDate).toISOString(),
            HREL_LoanAmount: data.amount,
            HREL_LoanInsallments: data.installments,
            HREL_LoanStatus: selectedRow.HREL_LoanStatus,
            HREL_SanctionedAmount: selectedRow.HREL_SanctionedAmount,
            HREL_TotalPrincipalPaid: selectedRow.HREL_TotalPrincipalPaid,
            HREL_TotalInterestPaid: selectedRow.HREL_TotalInterestPaid,
            HREL_TotalPending: selectedRow.HREL_TotalPending,
            HREL_LoanInterest: data.loanInterest || 0,
            HREL_LaonEMI: data.loanEMI || 0,
            HREL_ModeOfPayment: data.modeOfPayment || '',
            HREL_ReferenceNo: data.referenceNo || '',
            HREL_ActiveFlag: selectedRow.HREL_ActiveFlag,
            HREL_NoofInstallment: data.installments
        };
        saveLoan(loanData, {
            onSuccess: () => {
                toast.success('Employee loan updated successfully!');
                refetchAll();
                onSuccess?.();
            },
            onError: (error: any) => {
                toast.error(error.message || 'Failed to update employee loan');
            }
        });
    };

    const handleReset = () => {
        reset();
    };

    return (
        <div className={className}>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
                    <Controller
                        name='employeeId'
                        control={control}
                        render={({ field }) => (
                            <div className='space-y-2'>
                                <Label>
                                    Employee <span className='text-destructive'>*</span>
                                </Label>
                                <Select onValueChange={(value) => field.onChange(Number(value))} value={field.value?.toString()}>
                                    <SelectTrigger
                                        className={cn(
                                            'transition-colors focus:ring-2 focus:ring-primary/20',
                                            errors.employeeId && 'border-destructive'
                                        )}>
                                        <SelectValue placeholder='Select or search Employee in the list' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {employees.length > 0 ? (
                                            employees
                                                .filter((emp) => emp?.HRME_Id != null)
                                                .map((employee) => (
                                                    <SelectItem key={employee.HRME_Id} value={employee.HRME_Id.toString()}>
                                                        {employee.employeeName || employee.HRME_EmployeeFirstName}
                                                    </SelectItem>
                                                ))
                                        ) : (
                                            <div className='p-2 text-muted-foreground text-sm'>No employees available</div>
                                        )}
                                    </SelectContent>
                                </Select>
                                {errors.employeeId && <FormError>{errors.employeeId.message}</FormError>}
                            </div>
                        )}
                    />
                    <div className='space-y-2'>
                        <Label>
                            Applied Date <span className='text-destructive'>*</span>
                        </Label>
                        <Controller
                            name='startDate'
                            control={control}
                            render={({ field }) => (
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant='outline'
                                            className={cn(
                                                'w-full justify-start text-left font-normal',
                                                !field.value && 'text-muted-foreground'
                                            )}>
                                            <CalendarIcon className='mr-2 h-4 w-4' />
                                            {field.value ? format(new Date(field.value), 'PPP') : 'Select Date'}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className='w-auto p-0' align='start'>
                                        <CalendarYear
                                            mode='single'
                                            selected={field.value ? new Date(field.value) : undefined}
                                            onDayClick={(day) => field.onChange(format(day, 'yyyy-MM-dd'))}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            )}
                        />
                        {errors.startDate && <FormError>{errors.startDate.message}</FormError>}
                    </div>
                </div>
                <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
                    <div className='space-y-2'>
                        <Label>
                            Loan Type <span className='text-destructive'>*</span>
                        </Label>
                        <Select
                            key={`loan-type-${loanTypes.length}`}
                            onValueChange={(value) => {
                                setValue('loanTypeId', Number(value), { shouldDirty: true });
                            }}
                            value={watch('loanTypeId')?.toString() || ''}>
                            <SelectTrigger>
                                <SelectValue placeholder='Select Loan Type' />
                            </SelectTrigger>
                            <SelectContent>
                                {loanTypes && loanTypes.length > 0 ? (
                                    loanTypes
                                        .filter((type) => type && type.HRMLN_Id !== undefined && type.HRMLN_Id !== null)
                                        .map((loanType) => (
                                            <SelectItem key={`loan-${loanType.HRMLN_Id}`} value={loanType.HRMLN_Id.toString()}>
                                                {`${loanType.HRML_LoanType} `}
                                            </SelectItem>
                                        ))
                                ) : (
                                    <div className='p-2 text-muted-foreground text-sm'>
                                        {masters === undefined ? 'Loading loan types...' : 'No loan types available'}
                                    </div>
                                )}
                            </SelectContent>
                        </Select>
                        {errors.loanTypeId && <FormError>{errors.loanTypeId.message}</FormError>}
                    </div>
                    <Controller
                        name='modeOfPayment'
                        control={control}
                        render={({ field }) => (
                            <div className='space-y-2'>
                                <Label>
                                    Mode Of Payment <span className='text-destructive'>*</span>
                                </Label>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <SelectTrigger>
                                        <SelectValue placeholder='--Select--' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {paymentModes
                                            .filter((mode) => mode?.IVRMMOD_Id != null && mode?.IVRMMOD_ModeOfPayment)
                                            .map((mode) => (
                                                <SelectItem key={mode.IVRMMOD_Id} value={mode.IVRMMOD_ModeOfPayment}>
                                                    {mode.IVRMMOD_ModeOfPayment}
                                                </SelectItem>
                                            ))}
                                    </SelectContent>
                                </Select>
                                {errors.modeOfPayment && <FormError>{errors.modeOfPayment.message}</FormError>}
                            </div>
                        )}
                    />
                </div>
                <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
                    <Controller
                        name='referenceNo'
                        control={control}
                        render={({ field }) => (
                            <div className='space-y-2'>
                                <Label>Reference No.</Label>
                                <InputText
                                    id='referenceNo'
                                    placeholder='Enter reference number (max 20 characters, numbers only)'
                                    {...field}
                                    error={errors.referenceNo?.message}
                                    className='transition-colors focus:ring-2 focus:ring-primary/20'
                                />
                            </div>
                        )}
                    />
                </div>
                <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
                    <InputText
                        label='Loan Amount '
                        type='number'
                        id='amount'
                        step='0.01'
                        placeholder='Enter loan amount (max 10 digits including decimals)'
                        {...register('amount', { valueAsNumber: true })}
                        error={errors.amount?.message}
                        disabled={!isEmployeeSelected}
                        className='transition-colors focus:ring-2 focus:ring-primary/20'
                        required
                    />
                    <InputText
                        label='Loan Interest '
                        type='number'
                        id='loanInterest'
                        step='0.01'
                        placeholder='Enter loan interest (max 5 digits including decimals)'
                        {...register('loanInterest', { valueAsNumber: true })}
                        error={errors.loanInterest?.message}
                        disabled={!isEmployeeSelected}
                        className='transition-colors focus:ring-2 focus:ring-primary/20'
                        required
                    />
                </div>
                <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
                    <InputText
                        label='Loan Installments (IN MONTHS) '
                        type='number'
                        id='installments'
                        placeholder='Enter loan installments (max 4 digits)'
                        {...register('installments', { valueAsNumber: true })}
                        error={errors.installments?.message}
                        disabled={!isEmployeeSelected}
                        className='transition-colors focus:ring-2 focus:ring-primary/20'
                        required
                    />
                    <InputText
                        label='Loan EMI '
                        type='number'
                        id='loanEMI'
                        step='0.01'
                        placeholder='Enter loan EMI (max 10 digits including decimals)'
                        {...register('loanEMI', { valueAsNumber: true })}
                        error={errors.loanEMI?.message}
                        disabled={!isEmployeeSelected}
                        className='transition-colors focus:ring-2 focus:ring-primary/20'
                        required
                    />
                </div>
                <div className='flex flex-col gap-3 border-t pt-4 sm:flex-row sm:justify-start'>
                    <Button
                        type='button'
                        variant='outline'
                        onClick={handleReset}
                        disabled={isSubmitting || isPending}
                        className='order-2 w-fit transition-all duration-200 hover:scale-105 sm:order-1'>
                        Reset
                    </Button>
                    <Button
                        type='submit'
                        disabled={isSubmitting || isPending || !isDirty}
                        className='order-1 w-fit transition-all duration-200 hover:scale-105 sm:order-2'
                        isLoading={isSubmitting || isPending}
                        loadingText='Updating...'>
                        <div className='flex items-center'>
                            <Save className='mr-2 h-4 w-4' />
                            Update Employee Loan
                        </div>
                    </Button>
                    {!isDirty && <span className='flex items-center text-muted-foreground text-sm'>No changes made</span>}
                </div>
            </form>
        </div>
    );
}
