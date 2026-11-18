'use client';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { staffWiseReportFilterSchema } from '@/schemas/exam/online-exam/reports';
import type {
    IAcademicYearDropdown,
    IClassDropdown,
    IExamDropdown,
    ISectionDropdown,
    ISubjectDropdown
} from '@/types/exam/online-exam/transactions';
import { zodResolver } from '@hookform/resolvers/zod';
import { RotateCcw, Search } from 'lucide-react';
import { useForm } from 'react-hook-form';
import type { z } from 'zod';

type StaffWiseFilterValues = z.infer<typeof staffWiseReportFilterSchema>;

interface StaffWiseReportFilterFormProps {
    years: IAcademicYearDropdown[];
    classes: IClassDropdown[];
    sections: ISectionDropdown[];
    subjects: ISubjectDropdown[];
    exams: IExamDropdown[];
    onFilterSubmit: (values: StaffWiseFilterValues) => void;
    onReset: () => void;
    isLoading?: boolean;
}

export default function StaffWiseReportFilterForm({
    years = [],
    classes = [],
    sections = [],
    subjects = [],
    exams = [],
    onFilterSubmit,
    onReset,
    isLoading
}: StaffWiseReportFilterFormProps) {
    const {
        register,
        handleSubmit,
        reset,
        watch,
        formState: { errors }
    } = useForm<StaffWiseFilterValues>({
        resolver: zodResolver(staffWiseReportFilterSchema),
        defaultValues: {
            reportType: 'not_submitted'
        },
        mode: 'onChange'
    });

    const reportType = watch('reportType');

    const handleFormReset = () => {
        reset({ reportType: 'not_submitted' });
        onReset();
    };

    return (
        <form onSubmit={handleSubmit(onFilterSubmit)} className='space-y-4 rounded-xl border bg-card p-5 shadow-sm'>
            <div className='flex flex-wrap items-center justify-between gap-3 border-b pb-3'>
                <div>
                    <h3 className='font-semibold text-base text-foreground'>Report Search Filters</h3>
                    <p className='text-muted-foreground text-xs'>
                        Select report category and academic filters to inspect examination status
                    </p>
                </div>

                {/* Report Type Selector */}
                <div className='flex items-center gap-4 rounded-lg border bg-muted/50 p-1.5 font-semibold text-xs'>
                    <label className='flex cursor-pointer items-center gap-1.5 rounded-md px-2 py-1 transition-all hover:bg-background'>
                        <input type='radio' value='not_submitted' {...register('reportType')} className='h-3.5 w-3.5 text-primary' />
                        Student Not-Submitted Report
                    </label>
                    <label className='flex cursor-pointer items-center gap-1.5 rounded-md px-2 py-1 transition-all hover:bg-background'>
                        <input type='radio' value='staff_wise' {...register('reportType')} className='h-3.5 w-3.5 text-primary' />
                        Staff-Wise Performance Report
                    </label>
                </div>
            </div>

            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5'>
                {/* Academic Year */}
                <div className='space-y-1.5'>
                    <Label htmlFor='staff_rep_asmaY_Id' className='font-semibold text-xs'>
                        Academic Year <span className='text-destructive'>*</span>
                    </Label>
                    <select
                        id='staff_rep_asmaY_Id'
                        {...register('asmaY_Id', { valueAsNumber: true })}
                        className='flex h-9 w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'>
                        <option value=''>-- Select Year --</option>
                        {years.map((y, idx) => {
                            const val = y.asmaY_Id ?? (y as any).ASMAY_Id ?? idx;
                            return (
                                <option key={`staff-year-${val}-${idx}`} value={val}>
                                    {y.asmaY_Year ?? (y as any).ASMAY_Year}
                                </option>
                            );
                        })}
                    </select>
                    {errors.asmaY_Id && <p className='text-[11px] text-destructive'>{errors.asmaY_Id.message}</p>}
                </div>

                {/* Class */}
                <div className='space-y-1.5'>
                    <Label htmlFor='staff_rep_asmcL_Id' className='font-semibold text-xs'>
                        Class {reportType === 'not_submitted' && <span className='text-destructive'>*</span>}
                    </Label>
                    <select
                        id='staff_rep_asmcL_Id'
                        {...register('asmcL_Id', { valueAsNumber: true })}
                        className='flex h-9 w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'>
                        <option value=''>-- All Classes --</option>
                        {classes.map((c, idx) => {
                            const val = c.asmcL_Id ?? (c as any).ASMCL_Id ?? idx;
                            return (
                                <option key={`staff-class-${val}-${idx}`} value={val}>
                                    {c.asmcL_ClassName ?? (c as any).ASMCL_ClassName}
                                </option>
                            );
                        })}
                    </select>
                </div>

                {/* Section */}
                <div className='space-y-1.5'>
                    <Label htmlFor='staff_rep_asmS_Id' className='font-semibold text-xs'>
                        Section
                    </Label>
                    <select
                        id='staff_rep_asmS_Id'
                        {...register('asmS_Id', { valueAsNumber: true })}
                        className='flex h-9 w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'>
                        <option value=''>-- All Sections --</option>
                        {sections.map((s, idx) => {
                            const val = s.asmS_Id ?? (s as any).ASMS_Id ?? idx;
                            return (
                                <option key={`staff-sec-${val}-${idx}`} value={val}>
                                    {s.asmC_SectionName ?? (s as any).asmS_SectionName}
                                </option>
                            );
                        })}
                    </select>
                </div>

                {/* Subject */}
                <div className='space-y-1.5'>
                    <Label htmlFor='staff_rep_ismS_Id' className='font-semibold text-xs'>
                        Subject
                    </Label>
                    <select
                        id='staff_rep_ismS_Id'
                        {...register('ismS_Id', { valueAsNumber: true })}
                        className='flex h-9 w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'>
                        <option value=''>-- All Subjects --</option>
                        {subjects.map((sub, idx) => {
                            const val = sub.ismS_Id ?? (sub as any).ISMS_Id ?? idx;
                            return (
                                <option key={`staff-sub-${val}-${idx}`} value={val}>
                                    {sub.ismS_SubjectName ?? (sub as any).ISMS_SubjectName}
                                </option>
                            );
                        })}
                    </select>
                </div>

                {/* Exam Name */}
                <div className='space-y-1.5'>
                    <Label htmlFor='staff_rep_lpmoeeX_Id' className='font-semibold text-xs'>
                        Exam Name <span className='text-destructive'>*</span>
                    </Label>
                    <select
                        id='staff_rep_lpmoeeX_Id'
                        {...register('lpmoeeX_Id', { valueAsNumber: true })}
                        className='flex h-9 w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'>
                        <option value=''>-- Select Exam --</option>
                        {exams.map((ex, idx) => {
                            const val = ex.lpmoeeX_Id ?? (ex as any).LPMOEEX_Id ?? idx;
                            return (
                                <option key={`staff-exam-${val}-${idx}`} value={val}>
                                    {ex.lpmoeeX_ExamName ?? (ex as any).LPMOEEX_ExamName}
                                </option>
                            );
                        })}
                    </select>
                    {errors.lpmoeeX_Id && <p className='text-[11px] text-destructive'>{errors.lpmoeeX_Id.message}</p>}
                </div>
            </div>

            {/* Action buttons */}
            <div className='flex items-center justify-center sm:justify-end gap-2 pt-2'>
                <Button type='button' variant='outline' size='sm' onClick={handleFormReset} className='h-8 px-3 gap-1.5 text-xs w-auto font-medium'>
                    <RotateCcw className='h-3 w-3' /> Reset
                </Button>
                <Button type='submit' size='sm' disabled={isLoading} className='h-8 px-4 gap-1.5 text-xs w-auto font-medium shadow-sm bg-orange-600 hover:bg-orange-700 text-white'>
                    <Search className='h-3 w-3' /> {isLoading ? 'Generating...' : 'Generate Report'}
                </Button>
            </div>
        </form>
    );
}
