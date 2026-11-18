'use client';
import { TimeSpinnerField } from './add-form';

import { Button } from '@/components/ui/button';
import { CalendarYear } from '@/components/ui/calendar_year';
import { Checkbox } from '@/components/ui/checkbox';
import { FormError, Label } from '@/components/ui/extension/field';
import { InputNumber } from '@/components/ui/extension/input-number';
import { InputText } from '@/components/ui/extension/input-text';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { usePreAdmissionAcademicYear } from '@/hooks/admission/preadmission/useConfigurations';
import { cn } from '@/lib/utils';
import { PreAdmissionAcademicYearSchema } from '@/schemas/admission/preadmission/academic-year';
import { addOrUpdatePreAdmissionYear } from '@/server/admission/preadmission/configuration/academic_year_master';
import type { IMasterAcademicYearMasterList } from '@/types/admission/preadmission/configaration';
import { zodResolver } from '@hookform/resolvers/zod';
import { addDays, format } from 'date-fns';
import { CalendarIcon, Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, type SubmitHandler, useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';
import Swal from 'sweetalert2';
import type { z } from 'zod';

type FormFields = z.infer<typeof PreAdmissionAcademicYearSchema.addOrUpdate>;

interface UpdateMasterAcademicYearFormProps {
    onSuccess?: () => void;
    className?: string;
    selectedRow: IMasterAcademicYearMasterList;
    institutionList?: { mI_Id: number; mI_Name: string }[];
}

export default function UpdateMasterAcademicYearForm({
    onSuccess,
    className = '',
    selectedRow: row,
    institutionList = []
}: UpdateMasterAcademicYearFormProps) {
    const { refetchAll } = usePreAdmissionAcademicYear();
    const [openPopover, setOpenPopover] = useState<string | null>(null);
    const {
        control,
        register,
        handleSubmit,
        reset,
        setValue,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(PreAdmissionAcademicYearSchema.addOrUpdate),
        mode: 'onChange'
    });

    // Watch all "From" dates to restrict "To" dates
    const academicFromDate = useWatch({ control, name: 'asmaY_From_Date' });
    const preAdmFromDate = useWatch({ control, name: 'asmaY_PreAdm_F_Date' });
    const transportFromDate = useWatch({ control, name: 'asmaY_TransportSDate' });
    const regularFeeFromDate = useWatch({
        control,
        name: 'asmaY_RegularFeeFDate'
    });
    const academicFromYear = useWatch({ control, name: 'academicFromYear' });
    const academicToYear = useWatch({ control, name: 'academicToYear' });

    // Auto-increment logic: when From Year changes, set To Year to From Year + 1 if From Year is a valid number
    useEffect(() => {
        if (academicFromYear && academicFromYear.length === 4 && !Number.isNaN(Number(academicFromYear))) {
            const fromYearNum = Number(academicFromYear);
            const toYearNum = Number(academicToYear);
            // Only auto-set if To Year is empty or not matching From+1
            if (!academicToYear || toYearNum !== fromYearNum + 1) {
                setValue('academicToYear', String(fromYearNum + 1), {
                    shouldValidate: true
                });
            }
        }
    }, [academicFromYear, academicToYear, setValue]);

    // Auto-generate asmaY_Year like "2024-2025"
    useEffect(() => {
        if (
            academicFromYear &&
            academicFromYear.length === 4 &&
            !Number.isNaN(Number(academicFromYear)) &&
            academicToYear &&
            academicToYear.length === 4 &&
            !Number.isNaN(Number(academicToYear))
        ) {
            setValue('asmaY_Year', `${academicFromYear}-${academicToYear}`, {
                shouldValidate: true
            });
        }
    }, [academicFromYear, academicToYear, setValue]);

    useEffect(() => {
        if (row) {
            // Extract from and to years from asmaY_Year (e.g., "1199-1200")
            const [fromYear = '', toYear = ''] = row.asmaY_Year?.split('-') || [];

            reset({
                asmaY_Id: Number(row.asmaY_Id),
                mI_Id: Number(row.mI_Id) || 0,
                academicFromYear: fromYear,
                academicToYear: toYear,
                asmaY_Year: row.asmaY_Year,
                asmaY_From_Date: row.asmaY_From_Date,
                asmaY_To_Date: row.asmaY_To_Date,
                asmaY_PreAdm_F_Date: row.asmaY_PreAdm_F_Date,
                asmaY_PreAdm_T_Date: row.asmaY_PreAdm_T_Date,
                asmaY_PreAdm_F_Time: row.asmaY_PreAdm_F_Time || (row as any).ASMAY_PreAdm_F_Time || '00:00',
                asmaY_PreAdm_T_Time: row.asmaY_PreAdm_T_Time || (row as any).ASMAY_PreAdm_T_Time || '23:59',
                asmaY_Order: Number(row.asmaY_Order),
                asmaY_ActiveFlag: Number(row.asmaY_ActiveFlag),
                asmaY_Cut_Of_Date: row.asmaY_Cut_Of_Date,
                asmaY_Pre_ActiveFlag: Number(row.asmaY_Pre_ActiveFlag) === 1 || String(row.asmaY_Pre_ActiveFlag).toLowerCase() === 'true',
                asmaY_ReggularFlg:
                    Number(row.asmaY_ReggularFlg) === 1 ||
                    row.asmaY_ReggularFlg === true ||
                    String(row.asmaY_ReggularFlg).toLowerCase() === 'true',
                asmaY_NewFlg:
                    Number(row.asmaY_NewFlg) === 1 || row.asmaY_NewFlg === true || String(row.asmaY_NewFlg).toLowerCase() === 'true',
                asmaY_NewAdmissionFlg:
                    Number(row.asmaY_NewAdmissionFlg) === 1 ||
                    row.asmaY_NewAdmissionFlg === true ||
                    String(row.asmaY_NewAdmissionFlg).toLowerCase() === 'true',
                asmaY_TransportSDate: row.asmaY_TransportSDate || (row as any).ASMAY_TransportSDate || '',
                asmaY_TransportEDate: row.asmaY_TransportEDate || (row as any).ASMAY_TransportEDate || '',
                asmaY_ReferenceDate: row.asmaY_ReferenceDate || (row as any).ASMAY_ReferenceDate || '',
                asmaY_AcademicYearCode: row.asmaY_AcademicYearCode,
                asmaY_AdvanceFeeDate: row.asmaY_AdvanceFeeDate || (row as any).ASMAY_AdvanceFeeDate || '',
                asmaY_RegularFeeFDate: row.asmaY_RegularFeeFDate || (row as any).ASMAY_RegularFeeFDate || '',
                asmaY_RegularFeeTDate: row.asmaY_RegularFeeTDate || (row as any).ASMAY_RegularFeeTDate || '',
                asmaY_ArrearFeeDate: row.asmaY_ArrearFeeDate || (row as any).ASMAY_ArrearFeeDate || ''
            });
        }
    }, [row, reset]);

    const onSubmit: SubmitHandler<FormFields | any> = async (data: FormFields) => {
        try {
            const sanitizeDate = (val: any) => (val && val !== '' ? val : null);
            const formatTimeWithSeconds = (timeStr: string | null | undefined) => {
                if (!timeStr) return null;
                const parts = timeStr.split(':');
                if (parts.length === 2) {
                    return `${timeStr}:00`;
                }
                return timeStr;
            };

            const payload = {
                ASMAY_Id: Number(row.asmaY_Id),
                MI_Id: Number(data.mI_Id),
                ASMAY_Year: data.asmaY_Year,
                asmaY_From_Year: data.academicFromYear,
                asmaY_To_Year: data.academicToYear,
                ASMAY_From_Date: data.asmaY_From_Date,
                ASMAY_To_Date: data.asmaY_To_Date,
                ASMAY_PreAdm_F_Date: data.asmaY_PreAdm_F_Date,
                ASMAY_PreAdm_T_Date: data.asmaY_PreAdm_T_Date,
                ASMAY_PreAdm_F_Time: formatTimeWithSeconds(data.asmaY_PreAdm_F_Time),
                asmaY_PreAdm_F_Time: formatTimeWithSeconds(data.asmaY_PreAdm_F_Time),
                ASMAY_PreAdm_T_Time: formatTimeWithSeconds(data.asmaY_PreAdm_T_Time),
                asmaY_PreAdm_T_Time: formatTimeWithSeconds(data.asmaY_PreAdm_T_Time),
                ASMAY_Order: Number(data.asmaY_Order),
                ASMAY_ActiveFlag: Number(data.asmaY_ActiveFlag),
                ASMAY_Cut_Of_Date: data.asmaY_Cut_Of_Date,
                ASMAY_Pre_ActiveFlag: data.asmaY_Pre_ActiveFlag === true ? 1 : 0,
                ASMAY_ReggularFlg: Boolean(data.asmaY_ReggularFlg),
                ASMAY_NewFlg: Boolean(data.asmaY_NewFlg),
                ASMAY_NewAdmissionFlg: Boolean(data.asmaY_NewAdmissionFlg),

                ASMAY_TransportSDate: sanitizeDate(data.asmaY_TransportSDate),
                asmaY_TransportSDate: sanitizeDate(data.asmaY_TransportSDate),
                ASMAY_TransportEDate: sanitizeDate(data.asmaY_TransportEDate),
                asmaY_TransportEDate: sanitizeDate(data.asmaY_TransportEDate),
                ASMAY_ReferenceDate: sanitizeDate(data.asmaY_ReferenceDate),
                asmaY_ReferenceDate: sanitizeDate(data.asmaY_ReferenceDate),
                ASMAY_AcademicYearCode: data.asmaY_AcademicYearCode,
                ASMAY_AdvanceFeeDate: sanitizeDate(data.asmaY_AdvanceFeeDate),
                asmaY_AdvanceFeeDate: sanitizeDate(data.asmaY_AdvanceFeeDate),
                ASMAY_RegularFeeFDate: sanitizeDate(data.asmaY_RegularFeeFDate),
                asmaY_RegularFeeFDate: sanitizeDate(data.asmaY_RegularFeeFDate),
                ASMAY_RegularFeeTDate: sanitizeDate(data.asmaY_RegularFeeTDate),
                asmaY_RegularFeeTDate: sanitizeDate(data.asmaY_RegularFeeTDate),
                ASMAY_ArrearFeeDate: sanitizeDate(data.asmaY_ArrearFeeDate),
                asmaY_ArrearFeeDate: sanitizeDate(data.asmaY_ArrearFeeDate)
            };

            const response = await addOrUpdatePreAdmissionYear(payload);

            if (response.success) {
                Swal.fire({
                    title: 'Success!',
                    text: 'Academic year updated successfully',
                    icon: 'success',
                    confirmButtonText: 'OK',
                    allowOutsideClick: true
                }).then(() => {
                    window.location.reload();
                });
                reset();
                refetchAll();
                onSuccess?.();
            } else {
                Swal.fire({
                    title: 'Error!',
                    text: response.message || 'Not updated successfully',
                    icon: 'error',
                    confirmButtonText: 'OK',
                    allowOutsideClick: true
                }).then(() => {
                    window.location.reload();
                });
            }
        } catch (error: any) {
            toast.error(typeof error === 'string' ? error : error?.message || 'An unexpected error occurred');
        }
    };

    const handleReset = () => {
        reset();
        window.location.reload();
    };
    return (
        <div className={`${className}`}>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                <div className='space-y-4'>
                    {/* Basic Information */}
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-4'>
                        <InputText
                            label='Academic From Year'
                            required
                            id='academicFromYear'
                            placeholder='e.g., 2024'
                            {...register('academicFromYear')}
                            error={errors.academicFromYear?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />
                        <InputText
                            label='Academic To Year'
                            required
                            id='academicToYear'
                            placeholder='e.g., 2025'
                            {...register('academicToYear')}
                            error={errors.academicToYear?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />
                        <InputText
                            label='Academic Year Code'
                            required
                            id='asmaY_AcademicYearCode'
                            placeholder='Enter Code'
                            {...register('asmaY_AcademicYearCode', {
                                onChange: (e) => {
                                    e.target.value = e.target.value.replace(/[^a-zA-Z0-9-]/g, '');
                                }
                            })}
                            defaultValue={row.asmaY_AcademicYearCode}
                            error={errors.asmaY_AcademicYearCode?.message}
                            className='transition-colors focus:ring-2 focus:ring-primary/20'
                        />
                        <div className='flex flex-col gap-1.5'>
                            <Controller
                                name='asmaY_Order'
                                control={control}
                                render={({ field }) => (
                                    <InputNumber
                                        label='Academic Year Order'
                                        id='asmaY_Order'
                                        required
                                        value={field.value || 0}
                                        onChange={(value) => field.onChange(Number.isNaN(value) ? 0 : value)}
                                        minValue={0}
                                    />
                                )}
                            />
                            {errors.asmaY_Order && <FormError>{errors.asmaY_Order.message}</FormError>}
                        </div>
                    </div>

                    {/* Institution */}
                    <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                        <div className='flex flex-col gap-1.5'>
                            <Label>
                                Institution <span className='text-red-600'>*</span>
                            </Label>
                            <Controller
                                name='mI_Id'
                                control={control}
                                render={({ field }) => (
                                    <select
                                        id='mI_Id'
                                        value={field.value || ''}
                                        onChange={(e) => field.onChange(Number(e.target.value))}
                                        className={cn(
                                            'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors',
                                            'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
                                            errors.mI_Id && 'border-red-500'
                                        )}>
                                        <option value=''>--Select Institution--</option>
                                        {institutionList.map((inst) => (
                                            <option key={inst.mI_Id} value={inst.mI_Id}>
                                                {inst.mI_Name}
                                            </option>
                                        ))}
                                    </select>
                                )}
                            />
                            {errors.mI_Id && <p className='text-red-500 text-sm'>{errors.mI_Id.message}</p>}
                        </div>
                    </div>

                    {/* Academic Year Dates */}
                    <div className='space-y-4'>
                        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                            <Controller
                                name='asmaY_From_Date'
                                control={control}
                                render={({ field }) => (
                                    <div className='flex flex-col gap-1.5'>
                                        <Label>
                                            Start Date <span className='text-red-600'>*</span>
                                        </Label>
                                        <Popover
                                            open={openPopover === 'asmaY_From_Date'}
                                            onOpenChange={(open) => setOpenPopover(open ? 'asmaY_From_Date' : null)}>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    type='button'
                                                    variant='outline'
                                                    className={cn(
                                                        'w-full justify-start text-left font-normal',
                                                        !field.value && 'text-muted-foreground',
                                                        errors.asmaY_From_Date && 'border-red-500'
                                                    )}>
                                                    <CalendarIcon className='mr-2 h-4 w-4' />
                                                    {field.value ? format(new Date(field.value), 'dd/MM/yyyy') : 'Select date'}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className='w-auto p-0' align='start'>
                                                <CalendarYear
                                                    mode='single'
                                                    selected={field.value ? new Date(field.value) : undefined}
                                                    onSelect={(date) => {
                                                        field.onChange(date?.toISOString());
                                                        setOpenPopover(null);
                                                    }}
                                                    defaultMonth={academicFromYear ? new Date(Number(academicFromYear), 0, 1) : undefined}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        {errors.asmaY_From_Date && <p className='text-red-500 text-sm'>{errors.asmaY_From_Date.message}</p>}
                                    </div>
                                )}
                            />

                            <Controller
                                name='asmaY_To_Date'
                                control={control}
                                render={({ field }) => (
                                    <div className='flex flex-col gap-1.5'>
                                        <Label>
                                            End Date <span className='text-red-600'>*</span>
                                        </Label>
                                        <Popover
                                            open={openPopover === 'asmaY_To_Date'}
                                            onOpenChange={(open) => setOpenPopover(open ? 'asmaY_To_Date' : null)}>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    type='button'
                                                    variant='outline'
                                                    className={cn(
                                                        'w-full justify-start text-left font-normal',
                                                        !field.value && 'text-muted-foreground',
                                                        errors.asmaY_To_Date && 'border-red-500'
                                                    )}>
                                                    <CalendarIcon className='mr-2 h-4 w-4' />
                                                    {field.value ? format(new Date(field.value), 'dd/MM/yyyy') : 'Select date'}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className='w-auto p-0' align='start'>
                                                <CalendarYear
                                                    mode='single'
                                                    selected={field.value ? new Date(field.value) : undefined}
                                                    onSelect={(date) => {
                                                        field.onChange(date?.toISOString());
                                                        setOpenPopover(null);
                                                    }}
                                                    fromDate={academicFromDate ? addDays(new Date(academicFromDate), 1) : undefined}
                                                    defaultMonth={academicFromYear ? new Date(Number(academicFromYear), 0, 1) : undefined}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        {errors.asmaY_To_Date && <p className='text-red-500 text-sm'>{errors.asmaY_To_Date.message}</p>}
                                    </div>
                                )}
                            />
                        </div>
                    </div>

                    {/* Pre-Admission Dates */}
                    <div className='space-y-4'>
                        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                            <Controller
                                name='asmaY_PreAdm_F_Date'
                                control={control}
                                render={({ field }) => (
                                    <div className='flex flex-col gap-1.5'>
                                        <Label>
                                            Pre Admission Start Date <span className='text-red-600'>*</span>
                                        </Label>
                                        <Popover
                                            open={openPopover === 'asmaY_PreAdm_F_Date'}
                                            onOpenChange={(open) => setOpenPopover(open ? 'asmaY_PreAdm_F_Date' : null)}>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    type='button'
                                                    variant='outline'
                                                    className={cn(
                                                        'w-full justify-start text-left font-normal',
                                                        !field.value && 'text-muted-foreground',
                                                        errors.asmaY_PreAdm_F_Date && 'border-red-500'
                                                    )}>
                                                    <CalendarIcon className='mr-2 h-4 w-4' />
                                                    {field.value ? format(new Date(field.value), 'dd/MM/yyyy') : 'Select date'}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className='w-auto p-0' align='start'>
                                                <CalendarYear
                                                    mode='single'
                                                    selected={field.value ? new Date(field.value) : undefined}
                                                    onSelect={(date) => {
                                                        field.onChange(date?.toISOString());
                                                        setOpenPopover(null);
                                                    }}
                                                    defaultMonth={academicFromYear ? new Date(Number(academicFromYear), 0, 1) : undefined}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        {errors.asmaY_PreAdm_F_Date && (
                                            <p className='text-red-500 text-sm'>{errors.asmaY_PreAdm_F_Date.message}</p>
                                        )}
                                    </div>
                                )}
                            />

                            <Controller
                                name='asmaY_PreAdm_T_Date'
                                control={control}
                                render={({ field }) => (
                                    <div className='flex flex-col gap-1.5'>
                                        <Label>
                                            Pre Admission End Date <span className='text-red-600'>*</span>
                                        </Label>
                                        <Popover
                                            open={openPopover === 'asmaY_PreAdm_T_Date'}
                                            onOpenChange={(open) => setOpenPopover(open ? 'asmaY_PreAdm_T_Date' : null)}>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    type='button'
                                                    variant='outline'
                                                    className={cn(
                                                        'w-full justify-start text-left font-normal',
                                                        !field.value && 'text-muted-foreground',
                                                        errors.asmaY_PreAdm_T_Date && 'border-red-500'
                                                    )}>
                                                    <CalendarIcon className='mr-2 h-4 w-4' />
                                                    {field.value ? format(new Date(field.value), 'dd/MM/yyyy') : 'Select date'}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className='w-auto p-0' align='start'>
                                                <CalendarYear
                                                    mode='single'
                                                    selected={field.value ? new Date(field.value) : undefined}
                                                    onSelect={(date) => {
                                                        field.onChange(date?.toISOString());
                                                        setOpenPopover(null);
                                                    }}
                                                    fromDate={preAdmFromDate ? addDays(new Date(preAdmFromDate), 1) : undefined}
                                                    defaultMonth={academicFromYear ? new Date(Number(academicFromYear), 0, 1) : undefined}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        {errors.asmaY_PreAdm_T_Date && (
                                            <p className='text-red-500 text-sm'>{errors.asmaY_PreAdm_T_Date.message}</p>
                                        )}
                                    </div>
                                )}
                            />
                        </div>
                    </div>

                    {/* Pre-Admission Times */}
                    <div className='space-y-4'>
                        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                            <Controller
                                name='asmaY_PreAdm_F_Time'
                                control={control}
                                render={({ field }) => (
                                    <TimeSpinnerField
                                        label='Pre Admission Start Time'
                                        value={field.value ?? ''}
                                        onChange={field.onChange}
                                        error={errors.asmaY_PreAdm_F_Time?.message}
                                    />
                                )}
                            />
                            <Controller
                                name='asmaY_PreAdm_T_Time'
                                control={control}
                                render={({ field }) => (
                                    <TimeSpinnerField
                                        label='Pre Admission End Time'
                                        value={field.value ?? ''}
                                        onChange={field.onChange}
                                        error={errors.asmaY_PreAdm_T_Time?.message}
                                    />
                                )}
                            />
                        </div>
                    </div>

                    {/* Cut-off & Reference Dates */}
                    <div className='space-y-4'>
                        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                            <Controller
                                name='asmaY_Cut_Of_Date'
                                control={control}
                                render={({ field }) => (
                                    <div className='flex flex-col gap-1.5'>
                                        <Label>
                                            Pre Admission Age Cut off Date
                                            <span className='text-red-600'> *</span>
                                        </Label>
                                        <Popover
                                            open={openPopover === 'asmaY_Cut_Of_Date'}
                                            onOpenChange={(open) => setOpenPopover(open ? 'asmaY_Cut_Of_Date' : null)}>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    type='button'
                                                    variant='outline'
                                                    className={cn(
                                                        'w-full justify-start text-left font-normal',
                                                        !field.value && 'text-muted-foreground',
                                                        errors.asmaY_Cut_Of_Date && 'border-red-500'
                                                    )}>
                                                    <CalendarIcon className='mr-2 h-4 w-4' />
                                                    {field.value ? format(new Date(field.value), 'dd/MM/yyyy') : 'Select date'}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className='w-auto p-0' align='start'>
                                                <CalendarYear
                                                    mode='single'
                                                    selected={field.value ? new Date(field.value) : undefined}
                                                    onSelect={(date) => {
                                                        field.onChange(date?.toISOString());
                                                        setOpenPopover(null);
                                                    }}
                                                    defaultMonth={academicFromYear ? new Date(Number(academicFromYear), 0, 1) : undefined}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        {errors.asmaY_Cut_Of_Date && (
                                            <p className='text-red-500 text-sm'>{errors.asmaY_Cut_Of_Date.message}</p>
                                        )}
                                    </div>
                                )}
                            />

                            <Controller
                                name='asmaY_ReferenceDate'
                                control={control}
                                render={({ field }) => (
                                    <div className='flex flex-col gap-1.5'>
                                        <Label>Reference Date</Label>
                                        <Popover
                                            open={openPopover === 'asmaY_ReferenceDate'}
                                            onOpenChange={(open) => setOpenPopover(open ? 'asmaY_ReferenceDate' : null)}>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    type='button'
                                                    variant='outline'
                                                    className={cn(
                                                        'w-full justify-start text-left font-normal',
                                                        !field.value && 'text-muted-foreground'
                                                    )}>
                                                    <CalendarIcon className='mr-2 h-4 w-4' />
                                                    {field.value ? format(new Date(field.value), 'dd/MM/yyyy') : 'Select date'}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className='w-auto p-0' align='start'>
                                                <CalendarYear
                                                    mode='single'
                                                    selected={field.value ? new Date(field.value) : undefined}
                                                    onSelect={(date) => {
                                                        field.onChange(date?.toISOString());
                                                        setOpenPopover(null);
                                                    }}
                                                    defaultMonth={academicFromYear ? new Date(Number(academicFromYear), 0, 1) : undefined}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                )}
                            />
                        </div>
                    </div>

                    {/* Transport Dates */}
                    <div className='space-y-4'>
                        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                            <Controller
                                name='asmaY_TransportSDate'
                                control={control}
                                render={({ field }) => (
                                    <div className='flex flex-col gap-1.5'>
                                        <Label>Transport Start Date</Label>
                                        <Popover
                                            open={openPopover === 'asmaY_TransportSDate'}
                                            onOpenChange={(open) => setOpenPopover(open ? 'asmaY_TransportSDate' : null)}>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    type='button'
                                                    variant='outline'
                                                    className={cn(
                                                        'w-full justify-start text-left font-normal',
                                                        !field.value && 'text-muted-foreground'
                                                    )}>
                                                    <CalendarIcon className='mr-2 h-4 w-4' />
                                                    {field.value ? format(new Date(field.value), 'dd/MM/yyyy') : 'Select date'}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className='w-auto p-0' align='start'>
                                                <CalendarYear
                                                    mode='single'
                                                    selected={field.value ? new Date(field.value) : undefined}
                                                    onSelect={(date) => {
                                                        field.onChange(date?.toISOString());
                                                        setOpenPopover(null);
                                                    }}
                                                    defaultMonth={academicFromYear ? new Date(Number(academicFromYear), 0, 1) : undefined}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                )}
                            />

                            <Controller
                                name='asmaY_TransportEDate'
                                control={control}
                                render={({ field }) => (
                                    <div className='flex flex-col gap-1.5'>
                                        <Label>Transport End Date</Label>
                                        <Popover
                                            open={openPopover === 'asmaY_TransportEDate'}
                                            onOpenChange={(open) => setOpenPopover(open ? 'asmaY_TransportEDate' : null)}>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    type='button'
                                                    variant='outline'
                                                    className={cn(
                                                        'w-full justify-start text-left font-normal',
                                                        !field.value && 'text-muted-foreground'
                                                    )}>
                                                    <CalendarIcon className='mr-2 h-4 w-4' />
                                                    {field.value ? format(new Date(field.value), 'dd/MM/yyyy') : 'Select date'}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className='w-auto p-0' align='start'>
                                                <CalendarYear
                                                    mode='single'
                                                    selected={field.value ? new Date(field.value) : undefined}
                                                    onSelect={(date) => {
                                                        field.onChange(date?.toISOString());
                                                        setOpenPopover(null);
                                                    }}
                                                    fromDate={transportFromDate ? addDays(new Date(transportFromDate), 1) : undefined}
                                                    defaultMonth={academicFromYear ? new Date(Number(academicFromYear), 0, 1) : undefined}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                )}
                            />
                        </div>
                    </div>

                    {/* Financial Year Dates */}
                    <div className='space-y-4'>
                        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                            <Controller
                                name='asmaY_RegularFeeFDate'
                                control={control}
                                render={({ field }) => (
                                    <div className='flex flex-col gap-1.5'>
                                        <Label>Financial Year Start Date</Label>
                                        <Popover
                                            open={openPopover === 'asmaY_RegularFeeFDate'}
                                            onOpenChange={(open) => setOpenPopover(open ? 'asmaY_RegularFeeFDate' : null)}>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    type='button'
                                                    variant='outline'
                                                    className={cn(
                                                        'w-full justify-start text-left font-normal',
                                                        !field.value && 'text-muted-foreground'
                                                    )}>
                                                    <CalendarIcon className='mr-2 h-4 w-4' />
                                                    {field.value ? format(new Date(field.value), 'dd/MM/yyyy') : 'Select date'}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className='w-auto p-0' align='start'>
                                                <CalendarYear
                                                    mode='single'
                                                    selected={field.value ? new Date(field.value) : undefined}
                                                    onSelect={(date) => {
                                                        field.onChange(date?.toISOString());
                                                        setOpenPopover(null);
                                                    }}
                                                    defaultMonth={academicFromYear ? new Date(Number(academicFromYear), 0, 1) : undefined}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                )}
                            />

                            <Controller
                                name='asmaY_RegularFeeTDate'
                                control={control}
                                render={({ field }) => (
                                    <div className='flex flex-col gap-1.5'>
                                        <Label>Financial Year End Date</Label>
                                        <Popover
                                            open={openPopover === 'asmaY_RegularFeeTDate'}
                                            onOpenChange={(open) => setOpenPopover(open ? 'asmaY_RegularFeeTDate' : null)}>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    type='button'
                                                    variant='outline'
                                                    className={cn(
                                                        'w-full justify-start text-left font-normal',
                                                        !field.value && 'text-muted-foreground'
                                                    )}>
                                                    <CalendarIcon className='mr-2 h-4 w-4' />
                                                    {field.value ? format(new Date(field.value), 'dd/MM/yyyy') : 'Select date'}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className='w-auto p-0' align='start'>
                                                <CalendarYear
                                                    mode='single'
                                                    selected={field.value ? new Date(field.value) : undefined}
                                                    onSelect={(date) => {
                                                        field.onChange(date?.toISOString());
                                                        setOpenPopover(null);
                                                    }}
                                                    fromDate={regularFeeFromDate ? addDays(new Date(regularFeeFromDate), 1) : undefined}
                                                    defaultMonth={academicFromYear ? new Date(Number(academicFromYear), 0, 1) : undefined}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                )}
                            />
                        </div>

                        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                            <Controller
                                name='asmaY_AdvanceFeeDate'
                                control={control}
                                render={({ field }) => (
                                    <div className='flex flex-col gap-1.5'>
                                        <Label>Advance Date</Label>
                                        <Popover
                                            open={openPopover === 'asmaY_AdvanceFeeDate'}
                                            onOpenChange={(open) => setOpenPopover(open ? 'asmaY_AdvanceFeeDate' : null)}>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    type='button'
                                                    variant='outline'
                                                    className={cn(
                                                        'w-full justify-start text-left font-normal',
                                                        !field.value && 'text-muted-foreground'
                                                    )}>
                                                    <CalendarIcon className='mr-2 h-4 w-4' />
                                                    {field.value ? format(new Date(field.value), 'dd/MM/yyyy') : 'Select date'}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className='w-auto p-0' align='start'>
                                                <CalendarYear
                                                    mode='single'
                                                    selected={field.value ? new Date(field.value) : undefined}
                                                    onSelect={(date) => {
                                                        field.onChange(date?.toISOString());
                                                        setOpenPopover(null);
                                                    }}
                                                    defaultMonth={academicFromYear ? new Date(Number(academicFromYear), 0, 1) : undefined}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                )}
                            />

                            <Controller
                                name='asmaY_ArrearFeeDate'
                                control={control}
                                render={({ field }) => (
                                    <div className='flex flex-col gap-1.5'>
                                        <Label>Arrear Date</Label>
                                        <Popover
                                            open={openPopover === 'asmaY_ArrearFeeDate'}
                                            onOpenChange={(open) => setOpenPopover(open ? 'asmaY_ArrearFeeDate' : null)}>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    type='button'
                                                    variant='outline'
                                                    className={cn(
                                                        'w-full justify-start text-left font-normal',
                                                        !field.value && 'text-muted-foreground'
                                                    )}>
                                                    <CalendarIcon className='mr-2 h-4 w-4' />
                                                    {field.value ? format(new Date(field.value), 'dd/MM/yyyy') : 'Select date'}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className='w-auto p-0' align='start'>
                                                <CalendarYear
                                                    mode='single'
                                                    selected={field.value ? new Date(field.value) : undefined}
                                                    onSelect={(date) => {
                                                        field.onChange(date?.toISOString());
                                                        setOpenPopover(null);
                                                    }}
                                                    defaultMonth={academicFromYear ? new Date(Number(academicFromYear), 0, 1) : undefined}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                )}
                            />
                        </div>
                    </div>

                    {/* Boolean Flags */}
                    <div className='space-y-4'>
                        <h3 className='font-medium text-lg'>Flags</h3>
                        <div className='flex flex-wrap gap-6'>
                            <div className='flex items-center space-x-2'>
                                <Controller
                                    name='asmaY_NewAdmissionFlg'
                                    control={control}
                                    render={({ field }) => (
                                        <Checkbox id='asmaY_NewAdmissionFlg' checked={!!field.value} onCheckedChange={field.onChange} />
                                    )}
                                />
                                <Label htmlFor='asmaY_NewAdmissionFlg' className='cursor-pointer'>
                                    New Admission Flag
                                </Label>
                            </div>
                            <div className='flex items-center space-x-2'>
                                <Controller
                                    name='asmaY_ReggularFlg'
                                    control={control}
                                    render={({ field }) => (
                                        <Checkbox id='asmaY_ReggularFlg' checked={!!field.value} onCheckedChange={field.onChange} />
                                    )}
                                />
                                <Label htmlFor='asmaY_ReggularFlg' className='cursor-pointer'>
                                    Regular Flag
                                </Label>
                            </div>
                            <div className='flex items-center space-x-2'>
                                <Controller
                                    name='asmaY_NewFlg'
                                    control={control}
                                    render={({ field }) => (
                                        <Checkbox id='asmaY_NewFlg' checked={!!field.value} onCheckedChange={field.onChange} />
                                    )}
                                />
                                <Label htmlFor='asmaY_NewFlg' className='cursor-pointer'>
                                    New Flag
                                </Label>
                            </div>
                            <div className='flex items-center space-x-2'>
                                <Controller
                                    name='asmaY_Pre_ActiveFlag'
                                    control={control}
                                    render={({ field }) => (
                                        <Checkbox id='asmaY_Pre_ActiveFlag' checked={!!field.value} onCheckedChange={field.onChange} />
                                    )}
                                />
                                <Label htmlFor='asmaY_Pre_ActiveFlag' className='cursor-pointer'>
                                    Preadmission Active Flag
                                </Label>
                            </div>
                        </div>
                    </div>

                    {/* Root Error */}
                    {errors.root && <FormError>{errors.root.message}</FormError>}
                </div>

                {/* Action Buttons */}
                <div className='flex flex-col gap-3 border-t pt-4 sm:flex-row sm:justify-start'>
                    <Button
                        type='button'
                        variant='outline'
                        onClick={handleReset}
                        disabled={isSubmitting}
                        className='order-2 w-fit transition-all duration-200 hover:scale-105 sm:order-1'>
                        Reset
                    </Button>
                    <Button
                        type='submit'
                        disabled={isSubmitting}
                        className='order-1 w-fit transition-all duration-200 hover:scale-105 sm:order-2'
                        isLoading={isSubmitting}
                        loadingText='Saving...'>
                        <div className='flex items-center'>
                            <Save className='mr-2 h-4 w-4' />
                            Update Academic Year
                        </div>
                    </Button>
                </div>
            </form>
        </div>
    );
}
