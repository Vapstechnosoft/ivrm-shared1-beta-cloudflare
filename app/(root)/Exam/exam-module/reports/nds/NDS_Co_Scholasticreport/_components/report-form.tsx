'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { FormError, Label } from '@/components/ui/extension/field';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAcademicYearDropdown } from '@/hooks/fees/useMasters';
import { type NDSCoScholasticReportSchema, ndsCoScholasticReportSchema } from '@/schemas/exam/exam-module/reports';
import {
    getClassDropDownByAcademicYearlist,
    getSectionsDropDownByAcademicYearandClasslist,
    getStudentsDropDownByAcademicYearandClassandSectionlist
} from '@/server/exam/exam-module/reports/cumulative-report';
import { getGmvpsProgressCardIXReport } from '@/server/exam/exam-module/reports/nds-co-scholastic-report';
import { zodResolver } from '@hookform/resolvers/zod';
import { FileText, Loader2, RefreshCcw, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, FormProvider, useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';

interface ReportFormProps {
    onReportGenerated: (data: any, academicYear: string) => void;
    onReset: () => void;
}

export const ReportForm = ({ onReportGenerated, onReset }: ReportFormProps) => {
    const [years, setYears] = useState<any[]>([]);
    const [classes, setClasses] = useState<any[]>([]);
    const [sections, setSections] = useState<any[]>([]);
    const [students, setStudents] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    const { data: academicData, error: academicError, isLoading: academicYearLoading } = useAcademicYearDropdown();

    const [loadingClasses, setLoadingClasses] = useState(false);
    const [loadingSections, setLoadingSections] = useState(false);
    const [loadingStudents, setLoadingStudents] = useState(false);

    const methods = useForm<NDSCoScholasticReportSchema>({
        resolver: zodResolver(ndsCoScholasticReportSchema),
        defaultValues: {
            selectedStudents: []
        }
    });

    const { control, handleSubmit, setValue, reset, formState } = methods;
    const { isSubmitting } = formState;

    const watchYear = useWatch({ control, name: 'ASMAY_Id' });
    const watchClass = useWatch({ control, name: 'ASMCL_Id' });
    const watchSection = useWatch({ control, name: 'ASMS_Id' });
    const watchSelectedStudents = useWatch({ control, name: 'selectedStudents' }) || [];

    // Load Academic Years
    useEffect(() => {
        if (academicError) {
            toast.error(academicError.message || 'Failed to load academic years');
            setYears([]);
        } else if (academicData?.data) {
            const formatted = academicData.data.map((i: any) => ({
                asmaY_Id: i.asmaY_Id ?? 0,
                asmaY_Year: i.asmaY_Year ?? ''
            }));
            setYears(formatted);
        }
    }, [academicData, academicError]);

    // Load Classes on Year Change
    useEffect(() => {
        if (watchYear) {
            (async () => {
                try {
                    setLoadingClasses(true);
                    const response = await getClassDropDownByAcademicYearlist(Number(watchYear));
                    if (response?.success && Array.isArray(response.data)) {
                        setClasses(response.data);
                    }
                } catch (err) {
                    console.error(err);
                    toast.error('Failed to load classes');
                } finally {
                    setLoadingClasses(false);
                }
            })();
            setValue('ASMCL_Id', '');
            setValue('ASMS_Id', '');
            setValue('selectedStudents', []);
        } else {
            setClasses([]);
        }
    }, [watchYear, setValue]);

    // Load Sections on Class Change
    useEffect(() => {
        if (watchYear && watchClass) {
            (async () => {
                try {
                    setLoadingSections(true);
                    const response = await getSectionsDropDownByAcademicYearandClasslist(Number(watchYear), Number(watchClass));
                    const secData = response?.data || response;
                    const rawList = Array.isArray(secData)
                        ? secData
                        : secData?.sectionList || secData?.sectionlist || secData?.getsectionlist || secData?.fillsection || [];
                    const secList = Array.isArray(rawList) ? rawList : [];
                    setSections(secList);
                } catch (err) {
                    console.error(err);
                    toast.error('Failed to load sections');
                } finally {
                    setLoadingSections(false);
                }
            })();
            setValue('ASMS_Id', '');
            setValue('selectedStudents', []);
        } else {
            setSections([]);
        }
    }, [watchYear, watchClass, setValue]);

    // Load Students on Section Change
    useEffect(() => {
        if (watchYear && watchClass && watchSection) {
            (async () => {
                try {
                    setLoadingStudents(true);
                    const response = await getStudentsDropDownByAcademicYearandClassandSectionlist(
                        Number(watchYear),
                        Number(watchClass),
                        Number(watchSection)
                    );
                    if (response?.success && Array.isArray(response.data)) {
                        setStudents(response.data);
                        // Auto-select all students
                        setValue(
                            'selectedStudents',
                            response.data.map((s: any) => String(s.amsT_Id))
                        );
                    }
                } catch (err) {
                    console.error(err);
                    toast.error('Failed to load students');
                } finally {
                    setLoadingStudents(false);
                }
            })();
        } else {
            setStudents([]);
            setValue('selectedStudents', []);
        }
    }, [watchYear, watchClass, watchSection, setValue]);

    const onSubmit = async (data: NDSCoScholasticReportSchema) => {
        try {
            const payload = {
                ASMAY_Id: Number(data.ASMAY_Id),
                ASMCL_Id: Number(data.ASMCL_Id),
                ASMS_Id: Number(data.ASMS_Id),
                Temp_AmstIds: data.selectedStudents.map((id) => ({ amsT_Id: Number(id) }))
            };

            const response = await getGmvpsProgressCardIXReport(payload);
            const academicYear = years.find((y: any) => String(y.asmaY_Id) === data.ASMAY_Id)?.asmaY_Year || '';

            if (response?.success && response.data) {
                onReportGenerated(response.data, academicYear);
                toast.success('Report generated successfully');
            } else {
                toast.error(response?.message || 'Failed to generate report');
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('Failed to generate report');
        }
    };

    const handleClear = () => {
        reset();
        setSearchQuery('');
        onReset();
    };

    const filteredStudents = students.filter((s) => (s.studentName || s.studentname)?.toLowerCase().includes(searchQuery.toLowerCase()));

    const toggleSelectAll = (checked: boolean) => {
        if (checked) {
            setValue(
                'selectedStudents',
                students.map((s) => String(s.amsT_Id))
            );
        } else {
            setValue('selectedStudents', []);
        }
    };

    if (academicYearLoading) {
        return (
            <div className='flex justify-center p-8'>
                <Loader2 className='h-8 w-8 animate-spin text-primary' />
            </div>
        );
    }

    return (
        <div className='w-full overflow-hidden rounded-xl border bg-white shadow-sm transition-all duration-300 hover:shadow-md'>
            <div className='border-b bg-primary/5 px-6 py-4'>
                <h3 className='flex items-center gap-2 font-semibold text-lg text-primary'>
                    <FileText className='h-5 w-5' />
                    NDS_CO_SCHOLASTIC REPORT
                </h3>
            </div>

            <FormProvider {...methods}>
                <form onSubmit={handleSubmit(onSubmit)} className='space-y-6 p-6'>
                    <div className='grid grid-cols-1 gap-8 md:grid-cols-2'>
                        {/* Left Column: Dropdowns */}
                        <div className='space-y-4'>
                            {/* Academic Year */}
                            <div className='space-y-2'>
                                <Label className='font-medium text-sm'>
                                    Academic Year <span className='text-destructive'>*</span>
                                </Label>
                                <Controller
                                    control={control}
                                    name='ASMAY_Id'
                                    render={({ field, fieldState }) => (
                                        <>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <SelectTrigger className='w-full'>
                                                    <SelectValue placeholder='--Select--' />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {years.map((year) => (
                                                        <SelectItem key={year.asmaY_Id} value={String(year.asmaY_Id)}>
                                                            {year.asmaY_Year}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                        </>
                                    )}
                                />
                            </div>

                            {/* Class */}
                            <div className='space-y-2'>
                                <Label className='font-medium text-sm'>
                                    Class <span className='text-destructive'>*</span>
                                </Label>
                                <Controller
                                    control={control}
                                    name='ASMCL_Id'
                                    render={({ field, fieldState }) => (
                                        <>
                                            <Select
                                                onValueChange={field.onChange}
                                                value={field.value}
                                                disabled={!watchYear || loadingClasses}>
                                                <SelectTrigger className='w-full'>
                                                    {loadingClasses ? (
                                                        <Loader2 className='mx-auto h-4 w-4 animate-spin' />
                                                    ) : (
                                                        <SelectValue placeholder='--Select--' />
                                                    )}
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {classes.map((cls) => (
                                                        <SelectItem key={cls.asmcL_Id} value={String(cls.asmcL_Id)}>
                                                            {cls.asmcL_ClassName}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                        </>
                                    )}
                                />
                            </div>

                            {/* Section */}
                            <div className='space-y-2'>
                                <Label className='font-medium text-sm'>
                                    Section <span className='text-destructive'>*</span>
                                </Label>
                                <Controller
                                    control={control}
                                    name='ASMS_Id'
                                    render={({ field, fieldState }) => (
                                        <>
                                            <Select
                                                onValueChange={field.onChange}
                                                value={field.value}
                                                disabled={!watchClass || loadingSections}>
                                                <SelectTrigger className='w-full'>
                                                    {loadingSections ? (
                                                        <Loader2 className='mx-auto h-4 w-4 animate-spin' />
                                                    ) : (
                                                        <SelectValue placeholder='--Select--' />
                                                    )}
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {sections.map((sec) => (
                                                        <SelectItem key={sec.asmS_Id} value={String(sec.asmS_Id)}>
                                                            {sec.asmC_SectionName}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                        </>
                                    )}
                                />
                            </div>
                        </div>

                        {/* Right Column: Student Selection */}
                        <div className='space-y-3 rounded-lg border bg-slate-50/50 p-4'>
                            <div className='flex items-center justify-between'>
                                <div className='flex items-center gap-2'>
                                    <Checkbox
                                        id='selectAll'
                                        checked={students.length > 0 && watchSelectedStudents.length === students.length}
                                        onCheckedChange={(checked) => toggleSelectAll(!!checked)}
                                        disabled={students.length === 0}
                                    />
                                    <Label htmlFor='selectAll' className='cursor-pointer font-semibold text-sm'>
                                        Student : <span className='text-destructive'>*</span>
                                    </Label>
                                </div>
                                <div className='relative w-48'>
                                    <Search className='absolute top-2.5 left-2 h-3.5 w-3.5 text-muted-foreground' />
                                    <Input
                                        placeholder='search here...'
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className='h-8 pl-8 text-xs'
                                    />
                                </div>
                            </div>

                            <ScrollArea className='h-[200px] w-full rounded-md border bg-white'>
                                <div className='space-y-1 p-2'>
                                    {loadingStudents ? (
                                        <div className='flex h-[180px] flex-col items-center justify-center text-muted-foreground'>
                                            <Loader2 className='mb-2 h-6 w-6 animate-spin' />
                                            <span className='text-xs'>Loading students...</span>
                                        </div>
                                    ) : filteredStudents.length > 0 ? (
                                        filteredStudents.map((student) => (
                                            <div
                                                key={student.amsT_Id}
                                                className='flex items-center space-x-2 rounded-sm p-1.5 transition-colors hover:bg-slate-50'>
                                                <Controller
                                                    control={control}
                                                    name='selectedStudents'
                                                    render={({ field }) => (
                                                        <Checkbox
                                                            id={`student-${student.amsT_Id}`}
                                                            checked={field.value?.includes(String(student.amsT_Id))}
                                                            onCheckedChange={(checked) => {
                                                                const current = field.value || [];
                                                                const updated = checked
                                                                    ? [...current, String(student.amsT_Id)]
                                                                    : current.filter((id) => id !== String(student.amsT_Id));
                                                                field.onChange(updated);
                                                            }}
                                                        />
                                                    )}
                                                />
                                                <Label
                                                    htmlFor={`student-${student.amsT_Id}`}
                                                    className='flex-1 cursor-pointer py-1 font-medium text-xs'>
                                                    {student.studentName || student.studentname}
                                                </Label>
                                            </div>
                                        ))
                                    ) : (
                                        <div className='flex h-[180px] items-center justify-center text-muted-foreground text-xs italic'>
                                            {watchSection ? 'No students found' : 'Select Section to load students'}
                                        </div>
                                    )}
                                </div>
                            </ScrollArea>
                            <Controller
                                control={control}
                                name='selectedStudents'
                                render={({ fieldState }) =>
                                    fieldState.error ? <FormError className='text-xs'>{fieldState.error.message}</FormError> : <></>
                                }
                            />
                        </div>
                    </div>

                    <div className='flex items-center justify-center gap-4 border-t pt-6'>
                        <Button type='submit' disabled={isSubmitting} className='min-w-[120px] bg-indigo-600 shadow-sm hover:bg-indigo-700'>
                            {isSubmitting ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : <FileText className='mr-2 h-4 w-4' />}
                            REPORT
                        </Button>
                        <Button
                            type='button'
                            variant='destructive'
                            onClick={handleClear}
                            disabled={isSubmitting}
                            className='min-w-[120px] border-none bg-orange-500 hover:bg-orange-600'>
                            <RefreshCcw className='mr-2 h-4 w-4' />
                            CANCEL
                        </Button>
                    </div>
                </form>
            </FormProvider>
        </div>
    );
};
