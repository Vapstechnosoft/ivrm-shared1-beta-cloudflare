'use client';

import { Button } from '@/components/ui/button';
import { FormError, Label } from '@/components/ui/extension/field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAcademicYearDropdown } from '@/hooks/fees/useMasters';
import { promotionCalculationSchemaSchema } from '@/schemas/exam/exam-module/promotion-calculation';
import { promotionCalculation } from '@/server/exam/exam-module/calculation/promotion-calculation';
import {
    getClassDropDownByAcademicYearlist,
    getSectionsDropDownByAcademicYearandClasslist
} from '@/server/exam/exam-module/reports/cumulative-report';
import { zodResolver } from '@hookform/resolvers/zod';
import { Calculator, RotateCcw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, FormProvider, useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';
// biome-ignore lint/style/useImportType: <explanation>
import { z } from 'zod';
import FeedbackModal from './feedback-modal';
import NotEnteredSubjectsModal from './not-entered-subjects-modal';

type FormFields = z.infer<typeof promotionCalculationSchemaSchema.addOrUpdate>;

export default function ExamMarksCalculationForm() {
    const [notEnteredSubjects, setNotEnteredSubjects] = useState<any[]>([]);
    const [showNotEnteredModal, setShowNotEnteredModal] = useState(false);
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [selectedInfo, setSelectedInfo] = useState<any>({});

    const methods = useForm<FormFields>({
        resolver: zodResolver(promotionCalculationSchemaSchema.addOrUpdate),
        defaultValues: {
            asmaY_Id: 0,
            asmcL_Id: 0,
            asmS_Id: 0
        }
    });

    const { control, handleSubmit, reset, setValue, formState } = methods;
    const { isSubmitting } = formState;

    const selectedYear = useWatch({ control, name: 'asmaY_Id' });
    const selectedClass = useWatch({ control, name: 'asmcL_Id' });
    const _selectedSection = useWatch({ control, name: 'asmS_Id' });

    const [academicYears, setAcademicYears] = useState<any[]>([]);
    const [classes, setClasses] = useState<any[]>([]);
    const [sections, setSections] = useState<any[]>([]);
    const [isLoadingClasses, setIsLoadingClasses] = useState(false);
    const [isLoadingSections, setIsLoadingSections] = useState(false);

    const { data: academicData } = useAcademicYearDropdown();

    useEffect(() => {
        if (academicData?.data) {
            setAcademicYears(academicData.data);
        }
    }, [academicData]);

    // Load Classes
    useEffect(() => {
        if (!selectedYear || selectedYear === 0) {
            setClasses([]);
            setSections([]);
            setValue('asmcL_Id', 0);
            setValue('asmS_Id', 0);
            return;
        }
        (async () => {
            setIsLoadingClasses(true);
            try {
                const { data } = await getClassDropDownByAcademicYearlist(selectedYear);
                setClasses(Array.isArray(data) ? data : []);
            } catch {
                toast.error('Failed to load classes');
                setClasses([]);
            } finally {
                setIsLoadingClasses(false);
            }
        })();
    }, [selectedYear, setValue]);

    // Load Sections
    useEffect(() => {
        if (!selectedYear || !selectedClass || selectedClass === 0) {
            setSections([]);
            setValue('asmS_Id', 0);
            return;
        }
        (async () => {
            setIsLoadingSections(true);
            try {
                const { data } = await getSectionsDropDownByAcademicYearandClasslist(selectedYear, selectedClass);
                setSections(Array.isArray(data) ? data : []);
            } catch {
                toast.error('Failed to load sections');
                setSections([]);
            } finally {
                setIsLoadingSections(false);
            }
        })();
    }, [selectedYear, selectedClass, setValue]);

    // Load Exams

    const onSubmit = async (data: FormFields) => {
        try {
            const response = await promotionCalculation(data.asmaY_Id, data.asmcL_Id, data.asmS_Id);

            if (response.notEnteredSubjects && response.notEnteredSubjects.length > 0) {
                setNotEnteredSubjects(response.notEnteredSubjects);
                setSelectedInfo({
                    asmaY_Year: academicYears.find((y) => y.asmaY_Id === data.asmaY_Id)?.asmaY_Year,
                    asmcL_ClassName: classes.find((c) => c.asmcL_Id === data.asmcL_Id)?.asmcL_ClassName,
                    asmC_SectionName: sections.find((s) => s.asmS_Id === data.asmS_Id)?.asmC_SectionName
                });
                setShowNotEnteredModal(true);
            } else {
                toast.success('Exam marks calculated successfully!');
            }
        } catch (error: any) {
            if (error.response?.data?.requiresFeedback) {
                setShowFeedbackModal(true);
            } else {
                toast.error(error.message || 'Calculation failed');
            }
        }
    };

    const handleCancel = () => {
        reset();
        toast.info('Form cleared');
    };

    return (
        <>
            <div className='rounded-lg border bg-card text-card-foreground shadow-sm'>
                <div className='p-6'>
                    <FormProvider {...methods}>
                        <form onSubmit={handleSubmit(onSubmit)} className='space-y-6' noValidate>
                            {/* biome-ignore lint/nursery/useSortedClasses: <explanation> */}
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
                                <div className='space-y-6'>
                                    <Controller
                                        name='asmaY_Id'
                                        control={control}
                                        render={({ field, fieldState }) => (
                                            // biome-ignore lint/nursery/useSortedClasses: <explanation>
                                            <div className='flex flex-col sm:flex-row gap-3'>
                                                <Label className='w-32 font-medium'>
                                                    Academic Year <span className='text-red-500'>*</span>
                                                </Label>
                                                <div className='flex-1'>
                                                    <Select
                                                        onValueChange={(v) => field.onChange(Number(v))}
                                                        value={field.value ? String(field.value) : ''}>
                                                        <SelectTrigger>
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

                                    <Controller
                                        name='asmcL_Id'
                                        control={control}
                                        render={({ field, fieldState }) => (
                                            // biome-ignore lint/nursery/useSortedClasses: <explanation>
                                            <div className='flex flex-col sm:flex-row gap-3'>
                                                <Label className='w-32 font-medium'>
                                                    Class <span className='text-red-500'>*</span>
                                                </Label>
                                                <div className='flex-1'>
                                                    <Select
                                                        disabled={!selectedYear || selectedYear === 0}
                                                        onValueChange={(v) => field.onChange(Number(v))}
                                                        value={field.value ? String(field.value) : ''}>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder='Select Class' />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {isLoadingClasses ? (
                                                                <SelectItem value='loading' disabled>
                                                                    Loading classes...
                                                                </SelectItem>
                                                            ) : classes.length === 0 ? (
                                                                <SelectItem value='none' disabled>
                                                                    No classes found
                                                                </SelectItem>
                                                            ) : (
                                                                classes.map((c) => (
                                                                    <SelectItem key={c.asmcL_Id} value={String(c.asmcL_Id)}>
                                                                        {c.asmcL_ClassName}
                                                                    </SelectItem>
                                                                ))
                                                            )}
                                                        </SelectContent>
                                                    </Select>
                                                    {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                                </div>
                                            </div>
                                        )}
                                    />

                                    <Controller
                                        name='asmS_Id'
                                        control={control}
                                        render={({ field, fieldState }) => (
                                            // biome-ignore lint/nursery/useSortedClasses: <explanation>
                                            <div className='flex flex-col sm:flex-row gap-3'>
                                                <Label className='w-32 font-medium'>
                                                    Section <span className='text-red-500'>*</span>
                                                </Label>
                                                <div className='flex-1'>
                                                    <Select
                                                        disabled={!selectedClass || selectedClass === 0}
                                                        onValueChange={(v) => field.onChange(Number(v))}
                                                        value={field.value ? String(field.value) : ''}>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder='Select Section' />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {isLoadingSections ? (
                                                                <SelectItem value='loading' disabled>
                                                                    Loading sections...
                                                                </SelectItem>
                                                            ) : sections.length === 0 ? (
                                                                <SelectItem value='none' disabled>
                                                                    No sections found
                                                                </SelectItem>
                                                            ) : (
                                                                sections.map((s) => (
                                                                    <SelectItem key={s.asmS_Id} value={String(s.asmS_Id)}>
                                                                        {s.asmC_SectionName}
                                                                    </SelectItem>
                                                                ))
                                                            )}
                                                        </SelectContent>
                                                    </Select>
                                                    {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                                                </div>
                                            </div>
                                        )}
                                    />
                                </div>

                                <div className='flex items-center justify-center'>
                                    <div className='text-center text-muted-foreground'>
                                        <Calculator className='mx-auto h-16 w-16 text-gray-400' />
                                        <p className='mt-4'>Select all fields to calculate exam marks</p>
                                    </div>
                                </div>
                            </div>

                            <hr className='my-8' />

                            <div className='flex justify-center gap-4'>
                                <Button type='submit' disabled={isSubmitting} className='min-w-[160px]'>
                                    <Calculator className='mr-2 h-4 w-4' />
                                    {isSubmitting ? 'Calculating...' : 'Calculation'}
                                </Button>
                                <Button type='button' variant='outline' onClick={handleCancel}>
                                    <RotateCcw className='mr-2 h-4 w-4' />
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </FormProvider>
                </div>
            </div>

            <NotEnteredSubjectsModal
                open={showNotEnteredModal}
                onClose={() => setShowNotEnteredModal(false)}
                data={notEnteredSubjects}
                info={selectedInfo}
            />

            <FeedbackModal
                open={showFeedbackModal}
                onClose={() => setShowFeedbackModal(false)}
                onSubmit={() => {
                    toast.success('Feedback submitted');
                    setShowFeedbackModal(false);
                }}
            />
        </>
    );
}
