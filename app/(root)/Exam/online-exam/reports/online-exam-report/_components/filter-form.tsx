'use client';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { InputText } from '@/components/ui/extension/input-text';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { onlineExamReportFilterSchema } from '@/schemas/exam/online-exam/reports';
import type { IAcademicYearDropdown, IClassDropdown, IExamDropdown, ISectionDropdown } from '@/types/exam/online-exam/transactions';
import { zodResolver } from '@hookform/resolvers/zod';
import { CalendarDays, FileSpreadsheet, Printer, RotateCcw, Search } from 'lucide-react';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import type { z } from 'zod';

type ReportFilterValues = z.infer<typeof onlineExamReportFilterSchema>;

const DatePickerPopover = ({ value, onChange, placeholder = 'dd-mm-yyyy' }: { value: string; onChange: (val: string) => void; placeholder?: string }) => {
    const [open, setOpen] = useState(false);
    const dateObj = value ? new Date(value.includes('T') ? value : `${value}T00:00:00`) : undefined;

    return (
        <div className='relative flex items-center w-full'>
            <InputText
                type='date'
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className='h-9 text-xs pr-8 w-full bg-background cursor-pointer font-medium'
            />
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <button
                        type='button'
                        tabIndex={-1}
                        title='Open Calendar'
                        className='absolute right-2 z-10 p-1 text-primary hover:text-primary/80 cursor-pointer'
                    >
                        <CalendarDays className='h-4 w-4' />
                    </button>
                </PopoverTrigger>
                <PopoverContent className='w-auto p-0 z-50' align='end'>
                    <Calendar
                        mode='single'
                        selected={dateObj && !isNaN(dateObj.getTime()) ? dateObj : undefined}
                        onSelect={(day) => {
                            if (day) {
                                const year = day.getFullYear();
                                const month = String(day.getMonth() + 1).padStart(2, '0');
                                const date = String(day.getDate()).padStart(2, '0');
                                const formatted = `${year}-${month}-${date}`;
                                onChange(formatted);
                            }
                            setOpen(false);
                        }}
                        initialFocus
                    />
                </PopoverContent>
            </Popover>
        </div>
    );
};

interface OnlineExamReportFilterFormProps {
    years: IAcademicYearDropdown[];
    classes: IClassDropdown[];
    sections: ISectionDropdown[];
    subjects?: any[];
    exams: IExamDropdown[];
    onFilterSubmit: (values: ReportFilterValues) => void;
    onReset: () => void;
    isLoading?: boolean;
    onExportExcel?: () => void;
    onPrint?: () => void;
    hasData?: boolean;
}

export default function OnlineExamReportFilterForm({
    years = [],
    classes = [],
    sections = [],
    subjects = [],
    exams = [],
    onFilterSubmit,
    onReset,
    isLoading,
    onExportExcel,
    onPrint,
    hasData = false
}: OnlineExamReportFilterFormProps) {
    const {
        register,
        control,
        handleSubmit,
        reset,
        formState: { errors }
    } = useForm<ReportFilterValues>({
        resolver: zodResolver(onlineExamReportFilterSchema),
        mode: 'onChange'
    });

    const handleFormReset = () => {
        reset();
        onReset();
    };

    return (
        <form onSubmit={handleSubmit(onFilterSubmit)} className='rounded-lg border bg-card p-4 shadow-sm space-y-4'>
            <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4'>
                {/* Academic Year */}
                <div className='space-y-1.5'>
                    <Label htmlFor='rep_asmaY_Id' className='font-semibold text-xs'>
                        Academic Year <span className='text-destructive'>*</span>
                    </Label>
                    <Controller
                        name='asmaY_Id'
                        control={control}
                        render={({ field }) => (
                            <select
                                id='rep_asmaY_Id'
                                {...field}
                                value={field.value ? String(field.value) : ''}
                                onChange={(e) => field.onChange(Number(e.target.value) || '')}
                                className='h-9 text-xs w-full rounded-md border border-input bg-background px-3 py-1 font-medium shadow-xs focus:border-primary focus:outline-hidden'
                            >
                                <option value=''>-- Select Academic Year --</option>
                                {years.map((y, idx) => {
                                    const val = y.asmaY_Id ?? (y as any).ASMAY_Id ?? idx;
                                    const label = y.asmaY_Year ?? (y as any).ASMAY_Year ?? String(val);
                                    return (
                                        <option key={`year-${val}-${idx}`} value={val}>
                                            {label}
                                        </option>
                                    );
                                })}
                            </select>
                        )}
                    />
                    {errors.asmaY_Id && <p className='text-[11px] text-destructive font-medium'>{errors.asmaY_Id.message}</p>}
                </div>

                {/* Class */}
                <div className='space-y-1.5'>
                    <Label htmlFor='rep_asmcL_Id' className='font-semibold text-xs'>
                        Class <span className='text-destructive'>*</span>
                    </Label>
                    <Controller
                        name='asmcL_Id'
                        control={control}
                        render={({ field }) => (
                            <select
                                id='rep_asmcL_Id'
                                {...field}
                                value={field.value ? String(field.value) : ''}
                                onChange={(e) => field.onChange(Number(e.target.value) || '')}
                                className='h-9 text-xs w-full rounded-md border border-input bg-background px-3 py-1 font-medium shadow-xs focus:border-primary focus:outline-hidden'
                            >
                                <option value=''>-- Select Class --</option>
                                {classes.map((c, idx) => {
                                    const val = c.asmcL_Id ?? (c as any).ASMCL_Id ?? idx;
                                    const label = c.asmcL_ClassName ?? (c as any).ASMCL_ClassName ?? String(val);
                                    return (
                                        <option key={`class-${val}-${idx}`} value={val}>
                                            {label}
                                        </option>
                                    );
                                })}
                            </select>
                        )}
                    />
                    {errors.asmcL_Id && <p className='text-[11px] text-destructive font-medium'>{errors.asmcL_Id.message}</p>}
                </div>

                {/* Section (Optional) */}
                <div className='space-y-1.5'>
                    <Label htmlFor='rep_asmS_Id' className='font-semibold text-xs'>
                        Section (Optional)
                    </Label>
                    <Controller
                        name='asmS_Id'
                        control={control}
                        render={({ field }) => (
                            <select
                                id='rep_asmS_Id'
                                {...field}
                                value={field.value ? String(field.value) : '0'}
                                onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                                className='h-9 text-xs w-full rounded-md border border-input bg-background px-3 py-1 font-medium shadow-xs focus:border-primary focus:outline-hidden'
                            >
                                <option value='0'>-- All / Select Section --</option>
                                {sections.map((s, idx) => {
                                    const val = s.asmS_Id ?? (s as any).ASMS_Id ?? idx;
                                    const label = s.asmC_SectionName ?? s.asmS_SectionName ?? (s as any).ASMC_SectionName ?? (s as any).ASMS_SectionName ?? String(val);
                                    return (
                                        <option key={`sec-${val}-${idx}`} value={val}>
                                            {label}
                                        </option>
                                    );
                                })}
                            </select>
                        )}
                    />
                </div>

                {/* Subject */}
                <div className='space-y-1.5'>
                    <Label htmlFor='rep_ismS_Id' className='font-semibold text-xs'>
                        Subject <span className='text-destructive'>*</span>
                    </Label>
                    <Controller
                        name='ismS_Id'
                        control={control}
                        render={({ field }) => (
                            <select
                                id='rep_ismS_Id'
                                {...field}
                                value={field.value ? String(field.value) : ''}
                                onChange={(e) => field.onChange(Number(e.target.value) || '')}
                                className='h-9 text-xs w-full rounded-md border border-input bg-background px-3 py-1 font-medium shadow-xs focus:border-primary focus:outline-hidden'
                            >
                                <option value=''>-- Select Subject --</option>
                                {subjects.map((s: any, idx: number) => {
                                    const val = s.ismS_Id ?? s.ISMS_Id ?? idx;
                                    const label = s.ismS_SubjectName ?? s.ISMS_SubjectName ?? s.subjectName ?? String(val);
                                    return (
                                        <option key={`sub-${val}-${idx}`} value={val}>
                                            {label}
                                        </option>
                                    );
                                })}
                            </select>
                        )}
                    />
                    {errors.ismS_Id && <p className='text-[11px] text-destructive font-medium'>{errors.ismS_Id.message}</p>}
                </div>

                {/* Exam Name */}
                <div className='space-y-1.5'>
                    <Label htmlFor='rep_lpmoeeX_Id' className='font-semibold text-xs'>
                        Exam Name <span className='text-destructive'>*</span>
                    </Label>
                    <Controller
                        name='lpmoeeX_Id'
                        control={control}
                        render={({ field }) => (
                            <select
                                id='rep_lpmoeeX_Id'
                                {...field}
                                value={field.value ? String(field.value) : ''}
                                onChange={(e) => field.onChange(Number(e.target.value) || '')}
                                className='h-9 text-xs w-full rounded-md border border-input bg-background px-3 py-1 font-medium shadow-xs focus:border-primary focus:outline-hidden'
                            >
                                <option value=''>-- Select Exam Name --</option>
                                {exams.map((e, idx) => {
                                    const val = e.lpmoeeX_Id ?? (e as any).LPMOEEX_Id ?? idx;
                                    const label = e.lpmoeeX_ExamName ?? (e as any).LPMOEEX_ExamName ?? String(val);
                                    return (
                                        <option key={`exam-${val}-${idx}`} value={val}>
                                            {label}
                                        </option>
                                    );
                                })}
                            </select>
                        )}
                    />
                    {errors.lpmoeeX_Id && <p className='text-[11px] text-destructive font-medium'>{errors.lpmoeeX_Id.message}</p>}
                </div>

                {/* From Date */}
                <div className='space-y-1.5'>
                    <Label htmlFor='rep_fromDate' className='font-semibold text-xs'>
                        From Date <span className='text-destructive'>*</span>
                    </Label>
                    <Controller
                        name='fromDate'
                        control={control}
                        render={({ field }) => (
                            <DatePickerPopover
                                value={field.value || ''}
                                onChange={field.onChange}
                                placeholder='dd-mm-yyyy'
                            />
                        )}
                    />
                    {errors.fromDate && <p className='text-[11px] text-destructive font-medium'>{errors.fromDate.message}</p>}
                </div>

                {/* To Date */}
                <div className='space-y-1.5'>
                    <Label htmlFor='rep_toDate' className='font-semibold text-xs'>
                        To Date <span className='text-destructive'>*</span>
                    </Label>
                    <Controller
                        name='toDate'
                        control={control}
                        render={({ field }) => (
                            <DatePickerPopover
                                value={field.value || ''}
                                onChange={field.onChange}
                                placeholder='dd-mm-yyyy'
                            />
                        )}
                    />
                    {errors.toDate && <p className='text-[11px] text-destructive font-medium'>{errors.toDate.message}</p>}
                </div>
            </div>

            {/* Action buttons matching Old App (REPORT, CANCEL, EXPORT TO EXCEL, PRINT) */}
            <div className='flex flex-wrap items-center justify-center sm:justify-end gap-2.5 pt-2'>
                <Button
                    type='submit'
                    size='sm'
                    disabled={isLoading}
                    className='h-8 px-5 gap-1.5 text-xs w-auto font-bold shadow-sm bg-primary hover:bg-primary/90 text-primary-foreground rounded-full'
                >
                    <Search className='h-3.5 w-3.5' /> {isLoading ? 'Loading...' : 'REPORT'}
                </Button>
                <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    onClick={handleFormReset}
                    className='h-8 px-5 gap-1.5 text-xs w-auto font-bold bg-orange-600 hover:bg-orange-700 text-white border-none rounded-full'
                >
                    <RotateCcw className='h-3.5 w-3.5' /> CANCEL
                </Button>
                <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    disabled={!hasData}
                    onClick={onExportExcel}
                    className='h-8 px-5 gap-1.5 text-xs w-auto font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-full shadow-xs'
                >
                    <FileSpreadsheet className='h-3.5 w-3.5 text-emerald-600' /> EXPORT TO EXCEL
                </Button>
                <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    disabled={!hasData}
                    onClick={onPrint}
                    className='h-8 px-5 gap-1.5 text-xs w-auto font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-full shadow-xs'
                >
                    <Printer className='h-3.5 w-3.5 text-blue-600' /> PRINT
                </Button>
            </div>
        </form>
    );
}
