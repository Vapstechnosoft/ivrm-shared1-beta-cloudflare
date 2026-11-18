'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { CollapsibleContent } from '@/components/ui/collapsible';
import { FormError, Label } from '@/components/ui/extension/field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAcademicYearDropdown } from '@/hooks/fees/useMasters';
import { getNDS9ProgressCardReport } from '@/server/exam/exam-module/reports/NDS9ProgressCardReport';
import {
    getClassDropDownByAcademicYearlist,
    getSectionsDropDownByAcademicYearandClasslist,
    getStudentsDropDownByAcademicYearandClassandSectionlist
} from '@/server/exam/exam-module/reports/cumulative-report';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { Controller, FormProvider, useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const schema = z.object({
    asmaY_Id: z.number().min(1, 'Select Academic Year'),
    asmcL_Id: z.number().min(1, 'Select Class'),
    asmS_Id: z.number().min(1, 'Select Section'),
    studentList: z.array(z.object({ amsT_Id: z.number() })).min(1, 'Select at least one student')
});
type Schema = z.infer<typeof schema>;

export default function NDS9ProgressCardForm({ onSuccess }: { onSuccess?: (data: any) => void }) {
    const methods = useForm<Schema>({
        resolver: zodResolver(schema),
        mode: 'all',
        defaultValues: { asmaY_Id: 0, asmcL_Id: 0, asmS_Id: 0, studentList: [] } as any
    });
    const {
        control,
        handleSubmit,
        reset,
        setValue,
        formState: { isSubmitting }
    } = methods;

    const [academicYears, setAcademicYears] = useState<any[]>([]);
    const [classes, setClasses] = useState<any[]>([]);
    const [sections, setSections] = useState<any[]>([]);
    const [students, setStudents] = useState<any[]>([]);
    const [loadingCls, setLoadingCls] = useState(false);
    const [loadingSec, setLoadingSec] = useState(false);
    const [loadingStu, setLoadingStu] = useState(false);

    const { data: academicData } = useAcademicYearDropdown();
    const selectedYear = useWatch({ control, name: 'asmaY_Id' });
    const selectedClass = useWatch({ control, name: 'asmcL_Id' });
    const selectedSection = useWatch({ control, name: 'asmS_Id' });
    const selectedStudentsList = useWatch({ control, name: 'studentList' });

    useEffect(() => {
        if (academicData?.data) setAcademicYears(academicData.data.map((i: any) => ({ asmaY_Id: i.asmaY_Id, asmaY_Year: i.asmaY_Year })));
    }, [academicData]);

    useEffect(() => {
        if (!selectedYear) return;
        (async () => {
            setLoadingCls(true);
            try {
                const res: any = await getClassDropDownByAcademicYearlist(selectedYear);
                const list = Array.isArray(res)
                    ? res
                    : Array.isArray(res?.data)
                      ? res.data
                      : Array.isArray(res?.$values)
                        ? res.$values
                        : [];
                setClasses(list);
            } catch {
                toast.error('Failed to load classes');
            } finally {
                setValue('asmcL_Id', 0);
                setValue('asmS_Id', 0);
                setValue('studentList', []);
                setStudents([]);
                setLoadingCls(false);
            }
        })();
    }, [selectedYear, setValue]);

    useEffect(() => {
        if (!selectedYear || !selectedClass) return;
        (async () => {
            setLoadingSec(true);
            try {
                const res: any = await getSectionsDropDownByAcademicYearandClasslist(selectedYear, selectedClass);
                const list = Array.isArray(res)
                    ? res
                    : Array.isArray(res?.data)
                      ? res.data
                      : Array.isArray(res?.$values)
                        ? res.$values
                        : [];
                setSections(list);
            } catch {
                toast.error('Failed to load sections');
            } finally {
                setValue('asmS_Id', 0);
                setValue('studentList', []);
                setStudents([]);
                setLoadingSec(false);
            }
        })();
    }, [selectedYear, selectedClass, setValue]);

    useEffect(() => {
        if (!selectedYear || !selectedClass || !selectedSection) return;
        (async () => {
            setLoadingStu(true);
            try {
                const res: any = await getStudentsDropDownByAcademicYearandClassandSectionlist(
                    selectedYear,
                    selectedClass,
                    selectedSection
                );
                const list = Array.isArray(res)
                    ? res
                    : Array.isArray(res?.data)
                      ? res.data
                      : Array.isArray(res?.$values)
                        ? res.$values
                        : [];
                setStudents(
                    list.map((item: any) => ({
                        amsT_Id: item.amsT_Id,
                        studentName:
                            item.studentName ||
                            item.studentname ||
                            `${item.amsT_FirstName || ''} ${item.amsT_MiddleName || ''} ${item.amsT_LastName || ''}`.trim(),
                        amsT_AdmNo: item.amsT_AdmNo || ''
                    }))
                );
            } catch {
                toast.error('Failed to load students');
            } finally {
                setValue('studentList', []);
                setLoadingStu(false);
            }
        })();
    }, [selectedYear, selectedClass, selectedSection, setValue]);

    const onSubmit = async (data: Schema) => {
        try {
            const payload = {
                ASMAY_Id: data.asmaY_Id,
                ASMCL_Id: data.asmcL_Id,
                ASMS_Id: data.asmS_Id,
                Temp_AmstIds: data.studentList.map((s) => ({
                    amsT_Id: s.amsT_Id,
                    AMST_Id: s.amsT_Id
                }))
            };
            const response: any = await getNDS9ProgressCardReport(payload as any);
            console.log('nds9 progressCardReport', response);
            const reportData = response?.data || response;
            if (reportData && (reportData.getstudentdetails || reportData.getstudentdetails?.$values)) {
                if (onSuccess) onSuccess({ apiData: reportData, payload });
            } else {
                toast.error(response?.message || 'Failed to fetch report data');
            }
        } catch (err: any) {
            toast.error(err?.message || 'Unexpected error occurred');
        }
    };

    return (
        <div className='rounded-lg border bg-card text-card-foreground shadow-sm'>
            <CollapsibleContent className='p-6'>
                <FormProvider {...methods}>
                    <form onSubmit={handleSubmit(onSubmit)} className='space-y-6' noValidate>
                        <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                            <div className='space-y-6'>
                                {/* Academic Year */}
                                <Controller
                                    control={control}
                                    name='asmaY_Id'
                                    render={({ field, fieldState }) => (
                                        <div className='flex flex-col gap-2 sm:flex-row sm:items-center'>
                                            <Label className='font-medium text-sm sm:w-32'>
                                                Academic Year <span className='text-red-500'>*</span>
                                            </Label>
                                            <div className='flex-1'>
                                                <Select
                                                    onValueChange={(v) => field.onChange(Number(v))}
                                                    value={field.value ? String(field.value) : ''}>
                                                    <SelectTrigger className='w-full'>
                                                        <SelectValue placeholder='Select Academic Year' />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {academicYears.map((y) => (
                                                            <SelectItem key={y.asmaY_Id} value={String(y.asmaY_Id)}>
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
                                    name='asmcL_Id'
                                    render={({ field, fieldState }) => (
                                        <div className='flex flex-col gap-2 sm:flex-row sm:items-center'>
                                            <Label className='font-medium text-sm sm:w-32'>
                                                Class <span className='text-red-500'>*</span>
                                            </Label>
                                            <div className='flex-1'>
                                                <Select
                                                    onValueChange={(v) => field.onChange(Number(v))}
                                                    value={field.value ? String(field.value) : ''}>
                                                    <SelectTrigger className='w-full'>
                                                        <SelectValue placeholder={loadingCls ? 'Loading...' : 'Select Class'} />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {classes.map((c) => (
                                                            <SelectItem key={c.asmcL_Id} value={String(c.asmcL_Id)}>
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
                                    name='asmS_Id'
                                    render={({ field, fieldState }) => (
                                        <div className='flex flex-col gap-2 sm:flex-row sm:items-center'>
                                            <Label className='font-medium text-sm sm:w-32'>
                                                Section <span className='text-red-500'>*</span>
                                            </Label>
                                            <div className='flex-1'>
                                                <Select
                                                    onValueChange={(v) => field.onChange(Number(v))}
                                                    value={field.value ? String(field.value) : ''}>
                                                    <SelectTrigger className='w-full'>
                                                        <SelectValue placeholder={loadingSec ? 'Loading...' : 'Select Section'} />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {sections.map((s) => (
                                                            <SelectItem key={s.asmS_Id} value={String(s.asmS_Id)}>
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

                            {/* Students */}
                            <div className='space-y-6'>
                                <div className='flex flex-col gap-2 sm:flex-row sm:items-start'>
                                    <Label className='flex items-center gap-2 font-medium text-sm sm:w-32'>
                                        <Checkbox
                                            checked={selectedStudentsList?.length === students.length && students.length > 0}
                                            onCheckedChange={(checked) =>
                                                setValue('studentList', checked ? students.map((e) => ({ amsT_Id: e.amsT_Id })) : [], {
                                                    shouldValidate: true
                                                })
                                            }
                                        />
                                        Students <span className='text-red-500'>*</span>
                                    </Label>
                                    <div className='flex-1'>
                                        <Controller
                                            control={control}
                                            name='studentList'
                                            render={({ field, fieldState }) => (
                                                <div className='flex flex-col gap-2'>
                                                    <div className='flex max-h-[280px] flex-col gap-3 overflow-y-auto rounded-md border p-4'>
                                                        {loadingStu ? (
                                                            <span className='text-muted-foreground text-sm'>Loading...</span>
                                                        ) : students.length === 0 ? (
                                                            <span className='text-muted-foreground text-sm'>No Students found</span>
                                                        ) : (
                                                            students.map((e) => {
                                                                const isChecked =
                                                                    field.value?.some((v) => v.amsT_Id === e.amsT_Id) || false;
                                                                return (
                                                                    <div key={e.amsT_Id} className='flex items-center space-x-2'>
                                                                        <Checkbox
                                                                            id={`nds9-stu-${e.amsT_Id}`}
                                                                            checked={isChecked}
                                                                            onCheckedChange={(checked) => {
                                                                                if (checked)
                                                                                    field.onChange([
                                                                                        ...(field.value || []),
                                                                                        { amsT_Id: e.amsT_Id }
                                                                                    ]);
                                                                                else
                                                                                    field.onChange(
                                                                                        (field.value || []).filter(
                                                                                            (v) => v.amsT_Id !== e.amsT_Id
                                                                                        )
                                                                                    );
                                                                            }}
                                                                        />
                                                                        <Label
                                                                            htmlFor={`nds9-stu-${e.amsT_Id}`}
                                                                            className='text-sm leading-none'>
                                                                            {e.studentName}
                                                                            {e.amsT_AdmNo ? ` / ${e.amsT_AdmNo}` : ''}
                                                                        </Label>
                                                                    </div>
                                                                );
                                                            })
                                                        )}
                                                    </div>
                                                    {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                                </div>
                                            )}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <hr className='my-4 border-gray-300' />
                        <div className='flex justify-center gap-3'>
                            <Button
                                type='submit'
                                isLoading={isSubmitting}
                                disabled={isSubmitting || !selectedStudentsList?.length}
                                className='min-w-[140px]'>
                                {isSubmitting ? 'Generating...' : 'Report'}
                            </Button>
                            <Button type='button' variant='outline' onClick={() => reset()} className='min-w-[100px]'>
                                Clear
                            </Button>
                        </div>
                    </form>
                </FormProvider>
            </CollapsibleContent>
        </div>
    );
}
