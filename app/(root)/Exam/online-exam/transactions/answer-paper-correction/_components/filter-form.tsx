'use client';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { answerPaperFilterSchema } from '@/schemas/exam/online-exam/transactions';
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

type FilterFormValues = z.infer<typeof answerPaperFilterSchema>;

interface FilterFormProps {
    years: IAcademicYearDropdown[];
    classes: IClassDropdown[];
    sections: ISectionDropdown[];
    subjects: ISubjectDropdown[];
    exams: IExamDropdown[];
    onFilterSubmit: (values: FilterFormValues) => void;
    onReset: () => void;
    isLoading?: boolean;
}

export default function AnswerPaperFilterForm({
    years = [],
    classes = [],
    sections = [],
    subjects = [],
    exams = [],
    onFilterSubmit,
    onReset,
    isLoading
}: FilterFormProps) {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors }
    } = useForm<FilterFormValues>({
        resolver: zodResolver(answerPaperFilterSchema),
        mode: 'onChange'
    });

    const handleFormReset = () => {
        reset();
        onReset();
    };

    return (
        <form onSubmit={handleSubmit(onFilterSubmit)} className='space-y-4 rounded-xl border bg-card p-5 shadow-sm'>
            <div className='border-b pb-2'>
                <h3 className='font-semibold text-base text-foreground'>Filter Exam Submissions</h3>
                <p className='text-muted-foreground text-xs'>Select exam parameters to view and evaluate student answer papers</p>
            </div>

            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5'>
                {/* Academic Year */}
                <div className='space-y-1.5'>
                    <Label htmlFor='filter_asmaY_Id' className='font-semibold text-xs'>
                        Academic Year <span className='text-destructive'>*</span>
                    </Label>
                    <select
                        id='filter_asmaY_Id'
                        {...register('asmaY_Id', { valueAsNumber: true })}
                        className='flex h-9 w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'>
                        <option value=''>-- Select Year --</option>
                        {years.map((y: any, idx: number) => {
                            const val = y.asmaY_Id ?? y.ASMAY_Id ?? y.id ?? idx + 1;
                            const label = y.asmaY_Year || y.ASMAY_Year || y.year || `Year ${val}`;
                            return (
                                <option key={val} value={val}>
                                    {label}
                                </option>
                            );
                        })}
                    </select>
                    {errors.asmaY_Id && <p className='text-[11px] text-destructive'>{errors.asmaY_Id.message}</p>}
                </div>

                {/* Class */}
                <div className='space-y-1.5'>
                    <Label htmlFor='filter_asmcL_Id' className='font-semibold text-xs'>
                        Class <span className='text-destructive'>*</span>
                    </Label>
                    <select
                        id='filter_asmcL_Id'
                        {...register('asmcL_Id', { valueAsNumber: true })}
                        className='flex h-9 w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'>
                        <option value=''>-- Select Class --</option>
                        {classes.map((c: any, idx: number) => {
                            const val = c.asmcL_Id ?? c.ASMCL_Id ?? c.id ?? idx + 1;
                            const label = c.asmcL_ClassName || c.ASMCL_ClassName || c.className || `Class ${val}`;
                            return (
                                <option key={val} value={val}>
                                    {label}
                                </option>
                            );
                        })}
                    </select>
                    {errors.asmcL_Id && <p className='text-[11px] text-destructive'>{errors.asmcL_Id.message}</p>}
                </div>

                {/* Section (Optional) */}
                <div className='space-y-1.5'>
                    <Label htmlFor='filter_asmS_Id' className='font-semibold text-xs'>
                        Section (Optional)
                    </Label>
                    <select
                        id='filter_asmS_Id'
                        {...register('asmS_Id', { valueAsNumber: true })}
                        className='flex h-9 w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'>
                        <option value='0'>-- All / Select Section --</option>
                        {(sections || []).map((s: any, idx: number) => {
                            const val = s.asmS_Id ?? s.ASMS_Id ?? s.asmC_Id ?? s.ASMC_Id ?? s.id ?? idx + 1;
                            const label = s.asmC_SectionName || s.ASMC_SectionName || s.asmS_SectionName || s.ASMS_SectionName || s.sectionName || s.section_name || `Section ${val}`;
                            return (
                                <option key={val} value={val}>
                                    {label}
                                </option>
                            );
                        })}
                    </select>
                    {errors.asmS_Id && <p className='text-[11px] text-destructive'>{errors.asmS_Id.message}</p>}
                </div>

                {/* Subject */}
                <div className='space-y-1.5'>
                    <Label htmlFor='filter_ismS_Id' className='font-semibold text-xs'>
                        Subject <span className='text-destructive'>*</span>
                    </Label>
                    <select
                        id='filter_ismS_Id'
                        {...register('ismS_Id', { valueAsNumber: true })}
                        className='flex h-9 w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'>
                        <option value=''>-- Select Subject --</option>
                        {subjects.map((sub: any, idx: number) => {
                            const val = sub.ismS_Id ?? sub.ISMS_Id ?? sub.id ?? idx + 1;
                            const label = sub.ismS_SubjectName || sub.ISMS_SubjectName || sub.subjectName || `Subject ${val}`;
                            return (
                                <option key={val} value={val}>
                                    {label}
                                </option>
                            );
                        })}
                    </select>
                    {errors.ismS_Id && <p className='text-[11px] text-destructive'>{errors.ismS_Id.message}</p>}
                </div>

                {/* Exam Name */}
                <div className='space-y-1.5'>
                    <Label htmlFor='filter_lpmoeeX_Id' className='font-semibold text-xs'>
                        Exam Name <span className='text-destructive'>*</span>
                    </Label>
                    <select
                        id='filter_lpmoeeX_Id'
                        {...register('lpmoeeX_Id', { valueAsNumber: true })}
                        className='flex h-9 w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'>
                        <option value=''>-- Select Exam --</option>
                        {(exams || []).map((ex: any, idx: number) => {
                            const val = ex.lpmoeeX_Id ?? ex.LPMOEEX_Id ?? ex.emE_Id ?? ex.EME_Id ?? ex.lpmoeX_Id ?? ex.LPMOEX_Id ?? ex.id ?? idx + 1;
                            const label = ex.lpmoeeX_ExamName || ex.LPMOEEX_ExamName || ex.emE_ExamName || ex.EME_ExamName || ex.lpmoeX_ExamName || ex.LPMOEX_ExamName || ex.examName || ex.exam_name || `Exam ${val}`;
                            return (
                                <option key={val} value={val}>
                                    {label}
                                </option>
                            );
                        })}
                    </select>
                    {errors.lpmoeeX_Id && <p className='text-[11px] text-destructive'>{errors.lpmoeeX_Id.message}</p>}
                </div>
            </div>

            {/* Submit & Reset Buttons */}
            <div className='flex items-center justify-center sm:justify-end gap-2 pt-2'>
                <Button type='button' variant='outline' size='sm' onClick={handleFormReset} className='h-8 px-3 gap-1.5 text-xs w-auto font-medium'>
                    <RotateCcw className='h-3 w-3' /> Reset
                </Button>
                <Button type='submit' size='sm' disabled={isLoading} className='h-8 px-4 gap-1.5 text-xs w-auto font-medium shadow-sm bg-orange-600 hover:bg-orange-700 text-white'>
                    <Search className='h-3 w-3' /> {isLoading ? 'Searching...' : 'Search Submissions'}
                </Button>
            </div>
        </form>
    );
}
