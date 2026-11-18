'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { type PercentageWiseDetailsReportSchema, percentageWiseDetailsReportSchema } from '@/schemas/exam/exam-module/reports';
import {
    getCategoryDropDownByAcademicYearlist,
    getExamGroupsByCategory
} from '@/server/exam/exam-module/exam-mapping/exam-subject-group-mapping';
import { getReportDetails } from '@/server/exam/exam-module/reports/percentagewise-details-report';
import {
    getClassDropDownByYearCategoryList,
    getSectionDropDownByYearCategoryClassList
} from '@/server/exam/exam-module/reports/vvehpc_exam-report-card';
import { getAcademicYearDropdown } from '@/server/fees/masters/class_yearly_category';
import { zodResolver } from '@hookform/resolvers/zod';
import { FileSpreadsheet, Printer } from 'lucide-react';
import type React from 'react';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';

interface ReportFormProps {
    onReportGenerated: (data: any, payload: any) => void;
    onPrint?: () => void;
    onExcel?: () => void;
}

const percentageArray = [
    { id: '1', value: '80-100' },
    { id: '2', value: '60-80' },
    { id: '3', value: '40-60' },
    { id: '4', value: '30-40' },
    { id: '5', value: 'Less Than 30' }
];

export const ReportForm: React.FC<ReportFormProps> = ({ onReportGenerated, onPrint, onExcel }) => {
    const [loading, setLoading] = useState(false);
    const [academicYears, setAcademicYears] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [classes, setClasses] = useState<any[]>([]);
    const [sections, setSections] = useState<any[]>([]);
    const [exams, setExams] = useState<any[]>([]);

    const form = useForm<PercentageWiseDetailsReportSchema>({
        resolver: zodResolver(percentageWiseDetailsReportSchema),
        defaultValues: {
            qualification_type: 'all',
            ASMAY_Id: 0,
            EMCA_Id: 0,
            ASMCL_Id: 0,
            ASMS_Id: 0,
            EME_Id: 0,
            percent: ''
        }
    });

    const { watch, setValue, resetField, handleSubmit, control } = form;
    const qualificationType = watch('qualification_type');
    const selectedYear = watch('ASMAY_Id');
    const selectedCategory = watch('EMCA_Id');
    const selectedClass = watch('ASMCL_Id');
    const _selectedSection = watch('ASMS_Id');

    const [loadingCategories, setLoadingCategories] = useState(false);
    const [loadingClasses, setLoadingClasses] = useState(false);
    const [loadingSections, setLoadingSections] = useState(false);
    const [loadingExams, setLoadingExams] = useState(false);

    // Initial Data
    useEffect(() => {
        const fetchInitialData = async () => {
            const response = await getAcademicYearDropdown();
            if (response.success) {
                setAcademicYears(response.data || []);
            }
        };
        fetchInitialData();
    }, []);

    // On Year Change
    useEffect(() => {
        if (selectedYear > 0) {
            const fetchData = async () => {
                setLoadingCategories(true);
                try {
                    const { data: cats } = await getCategoryDropDownByAcademicYearlist(selectedYear);
                    const validCats = Array.isArray(cats) ? cats : [];
                    if (validCats.length === 0) {
                        toast.info('No categories found for this academic year');
                    }
                    setCategories(validCats);
                } catch {
                    // handle error
                } finally {
                    setLoadingCategories(false);
                }
            };
            fetchData();
        } else {
            setCategories([]);
        }
    }, [selectedYear]);

    // On Category Change
    useEffect(() => {
        if (selectedYear > 0 && selectedCategory > 0) {
            const fetchData = async () => {
                setLoadingExams(true);
                setLoadingClasses(true);
                try {
                    const [examRes, classesRes] = await Promise.all([
                        getExamGroupsByCategory(selectedYear, selectedCategory),
                        getClassDropDownByYearCategoryList(selectedYear, selectedCategory)
                    ]);

                    const safeClasses = Array.isArray(classesRes) ? classesRes : [];
                    setClasses(safeClasses);

                    if (examRes?.success) {
                        setExams(examRes.data || []);
                    } else if (Array.isArray(examRes)) {
                        setExams(examRes);
                    } else {
                        setExams([]);
                    }
                } catch (error) {
                    console.error('Error fetching exams and classes:', error);
                } finally {
                    setLoadingExams(false);
                    setLoadingClasses(false);
                }
            };
            fetchData();
        } else {
            setClasses([]);
            setExams([]);
        }
    }, [selectedYear, selectedCategory]);

    // On Class Change
    useEffect(() => {
        if (selectedClass && selectedClass > 0 && selectedYear > 0 && selectedCategory > 0) {
            const fetchData = async () => {
                setLoadingSections(true);
                try {
                    const response = await getSectionDropDownByYearCategoryClassList(selectedYear, selectedCategory, selectedClass);
                    const safeSections = Array.isArray(response) ? response : [];
                    setSections(safeSections);
                } catch (error) {
                    console.error('Error fetching sections:', error);
                    setSections([]);
                } finally {
                    setLoadingSections(false);
                }
            };
            fetchData();
        } else {
            setSections([]);
        }
    }, [selectedClass, selectedYear, selectedCategory]);

    const onSubmit = async (data: PercentageWiseDetailsReportSchema) => {
        setLoading(true);

        try {
            const classId = data.ASMCL_Id || 0;
            const sectionId = data.ASMS_Id !== undefined && data.ASMS_Id !== null ? data.ASMS_Id : 0;

            const selected_Year = academicYears.find((y: any) => y.asmaY_Id === Number(data.ASMAY_Id))?.asmaY_Year;
            const select_Exam = exams.find((e: any) => e.emE_Id === Number(data.EME_Id))?.emE_ExamName;

            const payload = {
                mI_Id: 0, // usually institution id (set from session later if needed)
                asmaY_Id: data.ASMAY_Id,
                emcA_Id: data.EMCA_Id,
                asmcL_Id: classId,
                asmS_Id: sectionId,
                emE_Id: data.EME_Id,

                // Student related fields (not used for report, send defaults)
                amsT_Id: 0,
                amsT_FirstName: '',
                amsT_AdmNo: '',

                // Marks related fields (calculated server-side)
                estmP_TotalMaxMarks: 0,
                estmP_TotalObtMarks: 0,
                estmP_Percentage: 0,

                report_type: data.qualification_type,
                percent: data.percent
            };
            const response = await getReportDetails(payload);

            if (response.success) {
                if (response.data.length === 0) {
                    toast.info('No records found');
                }
                onReportGenerated(response, { selected_Year, select_Exam });
            } else {
                toast.error(response.message || 'Failed to generate report');
            }
        } catch (error) {
            console.error(error);
            toast.error('An unexpected error occurred.');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        form.reset({
            qualification_type: 'all',
            ASMAY_Id: 0,
            EMCA_Id: 0,
            ASMCL_Id: 0,
            ASMS_Id: 0,
            EME_Id: 0,
            percent: ''
        });
        onReportGenerated(null, null);
    };

    return (
        <Card className='mb-6'>
            <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                    <div className='mt-6 mb-6 flex justify-center'>
                        <Controller
                            control={control}
                            name='qualification_type'
                            render={({ field }) => (
                                <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className='flex space-x-4'>
                                    <div className='flex items-center space-x-2'>
                                        <RadioGroupItem value='all' id='r1' />
                                        <Label htmlFor='r1'>All</Label>
                                    </div>
                                    <div className='flex items-center space-x-2'>
                                        <RadioGroupItem value='individual' id='r2' />
                                        <Label htmlFor='r2'>Individual</Label>
                                    </div>
                                </RadioGroup>
                            )}
                        />
                    </div>

                    <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                        {/* Academic Year */}
                        <div className='space-y-2'>
                            <Label>
                                Academic Year <span className='text-red-500'>*</span>
                            </Label>
                            <Controller
                                control={control}
                                name='ASMAY_Id'
                                render={({ field }) => (
                                    <Select
                                        key={`${field.value}-${academicYears.length}`}
                                        onValueChange={(val) => field.onChange(Number(val))}
                                        value={field.value && field.value !== 0 ? String(field.value) : undefined}>
                                        <SelectTrigger>
                                            <SelectValue placeholder='Select Academic Year' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {academicYears.map((item) => (
                                                <SelectItem key={item.asmaY_Id} value={String(item.asmaY_Id)}>
                                                    {item.asmaY_Year}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {form.formState.errors.ASMAY_Id && (
                                <p className='text-red-500 text-sm'>{form.formState.errors.ASMAY_Id.message}</p>
                            )}
                        </div>

                        {/* Category */}
                        <div className='space-y-2'>
                            <Label>
                                Category <span className='text-red-500'>*</span>
                            </Label>
                            <Controller
                                control={control}
                                name='EMCA_Id'
                                render={({ field }) => (
                                    <Select
                                        key={`${field.value}-${categories.length}-${loadingCategories}`}
                                        onValueChange={(val) => field.onChange(Number(val))}
                                        value={field.value && field.value !== 0 ? String(field.value) : undefined}>
                                        <SelectTrigger>
                                            <SelectValue placeholder='Select Category' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {loadingCategories ? (
                                                <SelectItem value='0' disabled>
                                                    Categories are loading...
                                                </SelectItem>
                                            ) : categories.length === 0 ? (
                                                <SelectItem value='0' disabled>
                                                    No Categories found
                                                </SelectItem>
                                            ) : (
                                                categories.map((item) => (
                                                    <SelectItem key={item.emcA_Id} value={String(item.emcA_Id)}>
                                                        {item.emcA_CategoryName}
                                                    </SelectItem>
                                                ))
                                            )}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {form.formState.errors.EMCA_Id && (
                                <p className='text-red-500 text-sm'>{form.formState.errors.EMCA_Id.message}</p>
                            )}
                        </div>

                        {/* Class */}
                        <div className='space-y-2'>
                            <Label>
                                Class <span className='text-red-500'>*</span>
                            </Label>
                            <Controller
                                control={control}
                                name='ASMCL_Id'
                                render={({ field }) => (
                                    <Select
                                        key={`${field.value}-${classes.length}-${loadingClasses}`}
                                        onValueChange={(val) => field.onChange(Number(val))}
                                        value={field.value && field.value !== 0 ? String(field.value) : undefined}
                                        disabled={!selectedCategory || loadingClasses}>
                                        <SelectTrigger>
                                            <SelectValue placeholder='Select Class' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {loadingClasses ? (
                                                 <SelectItem value='0' disabled>
                                                     Classes are loading...
                                                 </SelectItem>
                                             ) : classes.length === 0 ? (
                                                 <SelectItem value='0' disabled>
                                                     No Classes found
                                                 </SelectItem>
                                             ) : (
                                                 classes.map((item) => {
                                                     const classId = item.asmcL_Id ?? item.ASMCL_Id ?? item.id;
                                                     const className = item.asmcL_ClassName ?? item.ASMCL_ClassName ?? item.className ?? item.name ?? `Class ${classId}`;
                                                     if (!classId) return null;
                                                     return (
                                                         <SelectItem key={String(classId)} value={String(classId)}>
                                                             {className}
                                                         </SelectItem>
                                                     );
                                                 })
                                             )}
                                         </SelectContent>
                                     </Select>
                                 )}
                            />
                            {form.formState.errors.ASMCL_Id && (
                                <p className='text-red-500 text-sm'>{form.formState.errors.ASMCL_Id.message}</p>
                            )}
                        </div>

                        {/* Section */}
                        <div className='space-y-2'>
                            <Label>
                                Section <span className='text-red-500'>*</span>
                            </Label>
                            <Controller
                                control={control}
                                name='ASMS_Id'
                                render={({ field }) => (
                                    <Select
                                        key={`${field.value}-${sections.length}-${loadingSections}`}
                                        onValueChange={(val) => field.onChange(Number(val))}
                                        value={field.value !== undefined && field.value !== null ? String(field.value) : undefined}
                                        disabled={!selectedClass || loadingSections}>
                                        <SelectTrigger>
                                            <SelectValue placeholder='Select Section' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value='0'>All</SelectItem>
                                            {loadingSections ? (
                                                 <SelectItem value='loading' disabled>
                                                     Sections are loading...
                                                 </SelectItem>
                                             ) : sections.length === 0 ? (
                                                 <SelectItem value='empty' disabled>
                                                     No Sections found
                                                 </SelectItem>
                                             ) : (
                                                 sections.map((item) => {
                                                     const secId = item.asmS_Id ?? item.ASMS_Id ?? item.id;
                                                     const secName = item.asmC_SectionName ?? item.ASMC_SectionName ?? item.sectionName ?? item.name ?? `Section ${secId}`;
                                                     if (!secId) return null;
                                                     return (
                                                         <SelectItem key={String(secId)} value={String(secId)}>
                                                             {secName}
                                                         </SelectItem>
                                                     );
                                                 })
                                             )}
                                        </SelectContent>
                                    </Select>
                                 )}
                            />
                            {form.formState.errors.ASMS_Id && (
                                <p className='text-red-500 text-sm'>{form.formState.errors.ASMS_Id.message}</p>
                            )}
                        </div>

                        {/* Exam */}
                        <div className='space-y-2'>
                            <Label>
                                Exam <span className='text-red-500'>*</span>
                            </Label>
                            <Controller
                                control={control}
                                name='EME_Id'
                                render={({ field }) => (
                                    <Select
                                        key={`${field.value}-${exams.length}-${loadingExams}`}
                                        onValueChange={(val) => field.onChange(Number(val))}
                                        value={field.value && field.value !== 0 ? String(field.value) : undefined}>
                                        <SelectTrigger>
                                            <SelectValue placeholder='Select Exam' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {loadingExams ? (
                                                <SelectItem value='0' disabled>
                                                    Exams are loading...
                                                </SelectItem>
                                            ) : exams.length === 0 ? (
                                                <SelectItem value='0' disabled>
                                                    No Exams found
                                                </SelectItem>
                                            ) : (
                                                exams.map((item) => (
                                                    <SelectItem key={item.emE_Id} value={String(item.emE_Id)}>
                                                        {item.emE_ExamName}
                                                    </SelectItem>
                                                ))
                                            )}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {form.formState.errors.EME_Id && <p className='text-red-500 text-sm'>{form.formState.errors.EME_Id.message}</p>}
                        </div>

                        {/* Percentage */}
                        <div className='space-y-2'>
                            <Label>
                                Percentage <span className='text-red-500'>*</span>
                            </Label>
                            <Controller
                                control={control}
                                name='percent'
                                render={({ field }) => (
                                    <Select key={field.value} onValueChange={field.onChange} value={field.value || undefined}>
                                        <SelectTrigger>
                                            <SelectValue placeholder='Select Percentage' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {percentageArray.map((item) => (
                                                <SelectItem key={item.id} value={item.id}>
                                                    {item.value}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {form.formState.errors.percent && (
                                <p className='text-red-500 text-sm'>{form.formState.errors.percent.message}</p>
                            )}
                        </div>
                    </div>

                    <div className='flex justify-center space-x-4'>
                        <Button type='submit' disabled={loading} isLoading={loading}>
                            Report
                        </Button>
                        <Button type='button' variant='outline' onClick={handleCancel}>
                            Clear
                        </Button>
                        <Button
                            type='button'
                            variant='outline'
                            onClick={onExcel}
                            className='border-primary text-primary hover:bg-primary/10'>
                            <FileSpreadsheet className='mr-2 h-4 w-4' />
                            Excel
                        </Button>
                        <Button
                            type='button'
                            variant='outline'
                            onClick={onPrint}
                            className='border-primary text-primary hover:bg-primary/10'>
                            <Printer className='mr-2 h-4 w-4' />
                            Print
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
};
