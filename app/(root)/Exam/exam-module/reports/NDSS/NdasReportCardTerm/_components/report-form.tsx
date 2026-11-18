'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { FormError, Label } from '@/components/ui/extension/field';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAcademicYearDropdown } from '@/hooks/fees/useMasters';
import { ndasReportCardTermSchema } from '@/schemas/exam/exam-module/reports';
import {
    getClassDropDownByAcademicYearlist,
    getSectionsDropDownByAcademicYearandClasslist,
    getStudentsDropDownByAcademicYearandClassandSectionlist
} from '@/server/exam/exam-module/reports/cumulative-report';
import { zodResolver } from '@hookform/resolvers/zod';
import { FileText, Printer, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Controller, FormProvider, useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

type FormFields = z.infer<typeof ndasReportCardTermSchema>;

export default function NdasReportCardTermForm({
    onSuccess,
    onCancel,
    onPrint
}: {
    onSuccess?: (payload: any) => Promise<void> | void;
    onCancel?: () => void;
    onPrint?: () => void;
}) {
    const methods = useForm<FormFields>({
        resolver: zodResolver(ndasReportCardTermSchema),
        mode: 'all',
        defaultValues: {
            ASMAY_Id: '',
            ASMCL_Id: '',
            ASMS_Id: '',
            selectedStudents: []
        }
    });

    const { control, handleSubmit, reset, setValue, formState } = methods;
    const { isSubmitting } = formState;

    const { data: academicData, error: academicError, isLoading: academicYearLoading } = useAcademicYearDropdown();

    const [academicYears, setAcademicYears] = useState<{ asmaY_Id: number; asmaY_Year: string }[]>([]);
    const [classes, setClasses] = useState<{ asmcL_Id: number; asmcL_ClassName: string }[]>([]);
    const [sections, setSections] = useState<{ asmS_Id: number; asmC_SectionName: string }[]>([]);
    const [students, setStudents] = useState<{ amsT_Id: number; studentname: string; amsT_AdmNo?: string }[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    const selectedYear = useWatch({ control, name: 'ASMAY_Id' });
    const selectedClass = useWatch({ control, name: 'ASMCL_Id' });
    const selectedSection = useWatch({ control, name: 'ASMS_Id' });
    const selectedStudentsList = useWatch({ control, name: 'selectedStudents' });

    const [loadingClasses, setLoadingClasses] = useState(false);
    const [loadingSections, setLoadingSections] = useState(false);
    const [loadingStudents, setLoadingStudents] = useState(false);

    useEffect(() => {
        if (academicError) {
            toast.error(academicError.message || 'Error loading academic years');
            setAcademicYears([]);
        } else if (academicData?.data) {
            const formatted = academicData.data.map((i: any) => ({
                asmaY_Id: i.asmaY_Id ?? 0,
                asmaY_Year: i.asmaY_Year ?? ''
            }));
            setAcademicYears(formatted);
        }
    }, [academicData, academicError]);

    useEffect(() => {
        if (!selectedYear) {
            setClasses([]);
            return;
        }
        (async () => {
            try {
                setLoadingClasses(true);
                const { data } = await getClassDropDownByAcademicYearlist(Number(selectedYear));
                setClasses(Array.isArray(data) ? data : []);
                setValue('ASMCL_Id', '');
                setValue('ASMS_Id', '');
                setValue('selectedStudents', []);
            } catch {
                toast.error('Failed to load classes');
            } finally {
                setLoadingClasses(false);
            }
        })();
    }, [selectedYear, setValue]);

    useEffect(() => {
        if (!selectedYear || !selectedClass) {
            setSections([]);
            return;
        }
        (async () => {
            try {
                setLoadingSections(true);
                const { data } = await getSectionsDropDownByAcademicYearandClasslist(Number(selectedYear), Number(selectedClass));
                setSections(Array.isArray(data) ? data : []);
                setValue('ASMS_Id', '');
                setValue('selectedStudents', []);
            } catch {
                toast.error('Failed to load sections');
            } finally {
                setLoadingSections(false);
            }
        })();
    }, [selectedYear, selectedClass, setValue]);

    useEffect(() => {
        if (!selectedYear || !selectedClass || !selectedSection) {
            setStudents([]);
            return;
        }
        (async () => {
            try {
                setLoadingStudents(true);
                const { data } = await getStudentsDropDownByAcademicYearandClassandSectionlist(
                    Number(selectedYear),
                    Number(selectedClass),
                    Number(selectedSection)
                );
                const valid = Array.isArray(data) ? data : [];
                const formatted = valid.map((s: any) => ({
                    amsT_Id: s.amsT_Id,
                    studentname: s.studentName || `${s.amsT_FirstName || ''} ${s.amsT_MiddleName || ''} ${s.amsT_LastName || ''}`.trim(),
                    amsT_AdmNo: s.amsT_AdmNo || s.AMST_AdmNo || ''
                }));
                setStudents(formatted);
                setValue(
                    'selectedStudents',
                    formatted.map((s: any) => s.amsT_Id.toString())
                );
            } catch {
                toast.error('Failed to load students');
            } finally {
                setLoadingStudents(false);
            }
        })();
    }, [selectedYear, selectedClass, selectedSection, setValue]);

    const filteredStudents = useMemo(() => {
        if (!searchQuery.trim()) return students;
        const q = searchQuery.toLowerCase();
        return students.filter(
            (s) => s.studentname.toLowerCase().includes(q) || (s.amsT_AdmNo && s.amsT_AdmNo.toLowerCase().includes(q))
        );
    }, [students, searchQuery]);

    const onSubmit = async (data: FormFields) => {
        const selectedClassObj = classes.find((c) => c.asmcL_Id.toString() === data.ASMCL_Id);
        const selectedSectionObj = sections.find((s) => s.asmS_Id.toString() === data.ASMS_Id);

        const payload = {
            ASMAY_Id: Number(data.ASMAY_Id),
            ASMCL_Id: Number(data.ASMCL_Id),
            ASMS_Id: Number(data.ASMS_Id),
            date: new Date().toISOString(),
            Temp_AmstIds: data.selectedStudents.map((id) => ({ AMST_Id: Number(id) })),
            className: selectedClassObj?.asmcL_ClassName || '',
            sectionName: selectedSectionObj?.asmC_SectionName || ''
        };
        if (onSuccess) {
            await onSuccess(payload);
        }
    };

    const handleSelectAllStudents = (checked: boolean) => {
        if (checked) {
            setValue(
                'selectedStudents',
                students.map((s) => s.amsT_Id.toString()),
                { shouldValidate: true }
            );
        } else {
            setValue('selectedStudents', [], { shouldValidate: true });
        }
    };

    return (
        <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-6' noValidate>
                <div className='grid grid-cols-1 gap-6 md:grid-cols-2 items-start'>
                    {/* Left Column Controls: Academic Year, Class, Section */}
                    <div className='space-y-4 pt-1'>
                        {/* Academic Year */}
                        <Controller
                            control={control}
                            name='ASMAY_Id'
                            render={({ field, fieldState }) => (
                                <div className='flex flex-col gap-2 sm:flex-row sm:items-center'>
                                    <Label className='font-medium text-sm sm:w-32 text-gray-800'>
                                        Academic Year:<span className='text-red-500'>*</span>
                                    </Label>
                                    <div className='flex-1'>
                                        <Select key={field.value} onValueChange={field.onChange} value={field.value || undefined}>
                                            <SelectTrigger className='w-full border-blue-400 focus:ring-blue-500 rounded-sm h-9 bg-white'>
                                                <SelectValue placeholder={academicYearLoading ? 'Loading...' : 'Select Academic Year'} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {academicYears.map((y) => (
                                                    <SelectItem key={y.asmaY_Id} value={y.asmaY_Id.toString()}>
                                                        {y.asmaY_Year}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                    </div>
                                </div>
                            )}
                        />

                        {/* Class */}
                        <Controller
                            control={control}
                            name='ASMCL_Id'
                            render={({ field, fieldState }) => (
                                <div className='flex flex-col gap-2 sm:flex-row sm:items-center'>
                                    <Label className='font-medium text-sm sm:w-32 text-gray-800'>
                                        Class:<span className='text-red-500'>*</span>
                                    </Label>
                                    <div className='flex-1'>
                                        <Select
                                            key={field.value}
                                            onValueChange={field.onChange}
                                            value={field.value || undefined}
                                            disabled={!selectedYear || loadingClasses}>
                                            <SelectTrigger className='w-full border-blue-400 focus:ring-blue-500 rounded-sm h-9 bg-white'>
                                                <SelectValue placeholder={loadingClasses ? 'Loading...' : 'Select Class'} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {classes.map((c) => (
                                                    <SelectItem key={c.asmcL_Id} value={c.asmcL_Id.toString()}>
                                                        {c.asmcL_ClassName}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                    </div>
                                </div>
                            )}
                        />

                        {/* Section */}
                        <Controller
                            control={control}
                            name='ASMS_Id'
                            render={({ field, fieldState }) => (
                                <div className='flex flex-col gap-2 sm:flex-row sm:items-center'>
                                    <Label className='font-medium text-sm sm:w-32 text-gray-800'>
                                        Section:<span className='text-red-500'>*</span>
                                    </Label>
                                    <div className='flex-1'>
                                        <Select
                                            key={field.value}
                                            onValueChange={field.onChange}
                                            value={field.value || undefined}
                                            disabled={!selectedClass || loadingSections}>
                                            <SelectTrigger className='w-full border-blue-400 focus:ring-blue-500 rounded-sm h-9 bg-white'>
                                                <SelectValue placeholder={loadingSections ? 'Loading...' : 'Select Section'} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {sections.map((s) => (
                                                    <SelectItem key={s.asmS_Id} value={s.asmS_Id.toString()}>
                                                        {s.asmC_SectionName}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                    </div>
                                </div>
                            )}
                        />
                    </div>

                    {/* Right Column: Student Box matching SS2/SS3 */}
                    <div className='space-y-1.5'>
                        <div className='flex items-center gap-2'>
                            <Checkbox
                                id='select-all-students-box'
                                checked={selectedStudentsList?.length === students.length && students.length > 0}
                                onCheckedChange={(checked) => handleSelectAllStudents(!!checked)}
                            />
                            <Label htmlFor='select-all-students-box' className='font-medium text-sm cursor-pointer text-gray-800'>
                                Student : <span className='text-red-500'>*</span>
                            </Label>
                        </div>

                        <Controller
                            control={control}
                            name='selectedStudents'
                            render={({ field, fieldState }) => (
                                <div className='flex flex-col gap-1'>
                                    <div className='flex flex-col border border-blue-400 bg-white rounded-sm p-2 shadow-sm'>
                                        {/* search here... input */}
                                        <Input
                                            type='text'
                                            placeholder='search here...'
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className='mb-2 h-8 text-xs border-blue-300 focus:ring-blue-400 placeholder:text-gray-400'
                                        />

                                        {/* Scrollable list */}
                                        <div className='flex h-[115px] flex-col gap-1 overflow-y-auto pr-1'>
                                            {loadingStudents ? (
                                                <span className='text-muted-foreground text-xs p-1'>Loading Students...</span>
                                            ) : filteredStudents.length === 0 ? (
                                                <span className='text-muted-foreground text-xs p-1'>No Students Found</span>
                                            ) : (
                                                filteredStudents.map((st) => {
                                                    const idStr = st.amsT_Id.toString();
                                                    const isChecked = field.value?.includes(idStr);
                                                    return (
                                                        <div key={st.amsT_Id} className='flex items-center space-x-2 py-0.5 hover:bg-blue-50 rounded px-1'>
                                                            <Checkbox
                                                                id={`std-${st.amsT_Id}`}
                                                                checked={isChecked}
                                                                onCheckedChange={(checked) => {
                                                                    if (checked) {
                                                                        field.onChange([...(field.value || []), idStr]);
                                                                    } else {
                                                                        field.onChange((field.value || []).filter((val) => val !== idStr));
                                                                    }
                                                                }}
                                                            />
                                                            <Label
                                                                htmlFor={`std-${st.amsT_Id}`}
                                                                className='font-normal text-xs leading-none cursor-pointer uppercase text-gray-800 tracking-tight'>
                                                                {st.studentname} {st.amsT_AdmNo ? `:${st.amsT_AdmNo}` : ''}
                                                            </Label>
                                                        </div>
                                                    );
                                                })
                                            )}
                                        </div>
                                    </div>
                                    {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                </div>
                            )}
                        />
                    </div>
                </div>

                {/* Bottom Action Buttons Row - Fixed centered buttons matching SS2/SS3 */}
                <div className='flex flex-row flex-wrap items-center justify-center gap-3 border-t border-orange-200 pt-5 mt-4'>
                    {/* REPORT */}
                    <Button
                        type='submit'
                        isLoading={isSubmitting}
                        disabled={isSubmitting || !selectedStudentsList?.length}
                        className='!w-[110px] h-[36px] bg-[#3f51b5] hover:bg-[#303f9f] text-white font-semibold uppercase rounded-md shadow text-xs tracking-wider flex items-center justify-center gap-1.5 shrink-0'>
                        <FileText className='h-3.5 w-3.5' />
                        {isSubmitting ? '...' : 'REPORT'}
                    </Button>

                    {/* CANCEL */}
                    <Button
                        type='button'
                        onClick={() => {
                            reset({
                                ASMAY_Id: '',
                                ASMCL_Id: '',
                                ASMS_Id: '',
                                selectedStudents: []
                            });
                            setStudents([]);
                            setClasses([]);
                            setSections([]);
                            if (onCancel) onCancel();
                        }}
                        className='!w-[110px] h-[36px] bg-[#ff5722] hover:bg-[#e64a19] text-white font-semibold uppercase rounded-md shadow text-xs tracking-wider flex items-center justify-center gap-1.5 shrink-0'>
                        <X className='h-3.5 w-3.5' />
                        CANCEL
                    </Button>

                    {/* PRINT */}
                    <Button
                        type='button'
                        onClick={() => {
                            if (onPrint) onPrint();
                            else window.print();
                        }}
                        disabled={!selectedStudentsList?.length}
                        className='!w-[110px] h-[36px] bg-[#3f51b5] hover:bg-[#303f9f] text-white font-semibold uppercase rounded-md shadow text-xs tracking-wider flex items-center justify-center gap-1.5 shrink-0'>
                        <Printer className='h-3.5 w-3.5' />
                        PRINT
                    </Button>

                    {/* UPDATE */}
                    <Button
                        type='button'
                        variant='outline'
                        onClick={() => {
                            toast.info('Updated successfully');
                        }}
                        className='!w-[110px] h-[36px] bg-white text-gray-700 hover:bg-gray-100 font-semibold uppercase rounded-md border border-gray-300 shadow-sm text-xs tracking-wider flex items-center justify-center gap-1.5 shrink-0'>
                        UPDATE
                    </Button>
                </div>
            </form>
        </FormProvider>
    );
}
