'use client';

import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Save, X, Filter } from 'lucide-react';
import {
    getCategoryByYear,
    getSubjectsByCategory,
    getExamConditionByExam,
    getConditionTypeByCondition,
    savePassFailCondition
} from '@/server/exam/exam-module/reports/Hutching/exam-pass-fail-condition';

interface FormValues {
    EPFRC_Id: number;
    rdo_ipe: 'IE' | 'PE';
    ASMAY_Id: number | string;
    EMCA_Id: number | string;
    EME_Id: number | string;
    ECM_Id: number | string;
    fromno: number | string;
    tono: number | string;
    rdo_passfail: 'Pass' | 'Fail';
    rdo_rank: '1' | '0';
    oppercentage: string;
    perc?: string;
}

interface AddFormProps {
    yearList: any[];
    examConditionList: any[];
    editingRecord: any | null;
    onFormSubmitted: (savedData?: any, optimisticRecord?: any) => void;
    onCancelEdit: () => void;
}

const DEFAULT_CONDITIONS = [
    { ecM_Id: 1, ecM_ConditionName: 'Condition 1' },
    { ecM_Id: 2, ecM_ConditionName: 'Condition 2' },
    { ecM_Id: 3, ecM_ConditionName: 'Condition 3' },
    { ecM_Id: 4, ecM_ConditionName: 'Condition 4' },
    { ecM_Id: 5, ecM_ConditionName: 'Condition 5' }
];

export function AddForm({
    yearList,
    examConditionList: initialExamConditions,
    editingRecord,
    onFormSubmitted,
    onCancelEdit
}: AddFormProps) {
    const [categoryList, setCategoryList] = useState<any[]>([]);
    const [examList, setExamList] = useState<any[]>([]);
    const [examConditionList, setExamConditionList] = useState<any[]>(
        initialExamConditions && initialExamConditions.length > 0 ? initialExamConditions : DEFAULT_CONDITIONS
    );
    
    const [loadingCategories, setLoadingCategories] = useState(false);
    const [loadingExams, setLoadingExams] = useState(false);
    const [loadingConditions, setLoadingConditions] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const numberOptions = Array.from({ length: 21 }, (_, i) => String(i));

    const {
        control,
        handleSubmit,
        watch,
        setValue,
        reset,
        formState: { errors }
    } = useForm<FormValues>({
        defaultValues: {
            EPFRC_Id: 0,
            rdo_ipe: 'IE',
            ASMAY_Id: '',
            EMCA_Id: '',
            EME_Id: '',
            ECM_Id: '',
            fromno: '',
            tono: '',
            rdo_passfail: 'Pass',
            rdo_rank: '1',
            oppercentage: ''
        }
    });

    const watchExamFlag = watch('rdo_ipe');
    const watchYear = watch('ASMAY_Id');
    const watchCategory = watch('EMCA_Id');
    const watchExam = watch('EME_Id');

    // Sync initial examConditionList if passed from parent
    useEffect(() => {
        if (initialExamConditions && initialExamConditions.length > 0) {
            setExamConditionList(initialExamConditions);
        } else {
            setExamConditionList(DEFAULT_CONDITIONS);
        }
    }, [initialExamConditions]);

    // Handle Exam Flag change (IE vs PE)
    useEffect(() => {
        if (watchExamFlag === 'PE') {
            setValue('EME_Id', '');
        }
    }, [watchExamFlag, setValue]);

    // Fetch categories on Academic Year change
    useEffect(() => {
        if (!watchYear) {
            setCategoryList([]);
            setValue('EMCA_Id', '');
            return;
        }
        (async () => {
            try {
                setLoadingCategories(true);
                const res = await getCategoryByYear(Number(watchYear));
                const raw = res?.data ?? res;
                const list = Array.isArray(raw)
                    ? raw
                    : Array.isArray(raw?.$values)
                      ? raw.$values
                      : Array.isArray(raw?.data)
                        ? raw.data
                        : Array.isArray(raw?.data?.$values)
                          ? raw.data.$values
                          : (raw?.categorylist || raw?.categoryList || raw?.category_list || raw?.data || []);
                const parsedList = Array.isArray(list) ? list : (Array.isArray(list?.$values) ? list.$values : []);
                setCategoryList(parsedList);
                if (parsedList.length === 0) {
                    toast.info('No Categories mapped to selected Academic Year');
                }
            } catch (err) {
                toast.error('Failed to load categories');
            } finally {
                setLoadingCategories(false);
            }
        })();
    }, [watchYear, setValue]);

    // Fetch exams on Category change
    useEffect(() => {
        if (!watchYear || !watchCategory) {
            setExamList([]);
            setValue('EME_Id', '');
            return;
        }
        (async () => {
            try {
                setLoadingExams(true);
                const res = await getSubjectsByCategory(Number(watchYear), Number(watchCategory));
                const raw = res?.data ?? res;
                const list = Array.isArray(raw)
                    ? raw
                    : Array.isArray(raw?.$values)
                      ? raw.$values
                      : Array.isArray(raw?.data)
                        ? raw.data
                        : Array.isArray(raw?.data?.$values)
                          ? raw.data.$values
                          : (
                                raw?.examlist ||
                                raw?.examList ||
                                raw?.exam_list ||
                                raw?.get_exam ||
                                raw?.getexam ||
                                raw?.get_exams ||
                                raw?.get_subjects ||
                                raw?.subjectlist ||
                                raw?.masterExam ||
                                raw?.examMasterList ||
                                raw?.data?.examlist ||
                                raw?.data?.get_exam ||
                                raw?.data ||
                                []
                            );
                const parsedList = Array.isArray(list) ? list : (Array.isArray(list?.$values) ? list.$values : []);
                setExamList(parsedList);
                if (parsedList.length === 0) {
                    toast.info('No Exams found for selected Category');
                }
            } catch (err) {
                toast.error('Failed to load exams');
            } finally {
                setLoadingExams(false);
            }
        })();
    }, [watchYear, watchCategory, setValue]);

    // Fetch exam conditions on Exam change
    useEffect(() => {
        if (!watchYear || !watchExam || watchExamFlag === 'PE') {
            if (initialExamConditions && initialExamConditions.length > 0) {
                setExamConditionList(initialExamConditions);
            } else {
                setExamConditionList(DEFAULT_CONDITIONS);
            }
            return;
        }
        (async () => {
            try {
                setLoadingConditions(true);
                const res = await getExamConditionByExam(Number(watchYear), Number(watchExam), Number(watchCategory));
                const raw = res?.data ?? res;
                const list = Array.isArray(raw)
                    ? raw
                    : Array.isArray(raw?.$values)
                      ? raw.$values
                      : Array.isArray(raw?.data)
                        ? raw.data
                        : (
                            raw?.examconditionlist ||
                            raw?.examconditionList ||
                            raw?.examcondition_list ||
                            raw?.conditionlist ||
                            raw?.condition_list ||
                            raw?.get_condition ||
                            raw?.data?.examconditionlist ||
                            []
                        );
                const parsedList = Array.isArray(list) ? list : (Array.isArray(list?.$values) ? list.$values : []);
                if (parsedList.length > 0) {
                    setExamConditionList(parsedList);
                } else if (initialExamConditions && initialExamConditions.length > 0) {
                    setExamConditionList(initialExamConditions);
                } else {
                    setExamConditionList(DEFAULT_CONDITIONS);
                }
            } catch (err) {
                console.error('Failed to load exam conditions:', err);
                if (initialExamConditions && initialExamConditions.length > 0) {
                    setExamConditionList(initialExamConditions);
                } else {
                    setExamConditionList(DEFAULT_CONDITIONS);
                }
            } finally {
                setLoadingConditions(false);
            }
        })();
    }, [watchYear, watchExam, watchExamFlag, initialExamConditions]);

    // Populate form when editingRecord changes
    useEffect(() => {
        if (editingRecord) {
            const editObj = Array.isArray(editingRecord) ? editingRecord[0] : editingRecord;
            if (editObj) {
                const yearId = editObj.asmaY_Id || editObj.ASMAY_Id || '';
                const categoryId = editObj.emcA_Id || editObj.EMCA_Id || '';
                const examId = editObj.emE_Id || editObj.EME_Id || '';
                const conditionId = editObj.ecM_Id || editObj.ECM_Id || '';

                setValue('EPFRC_Id', editObj.epfrC_Id || editObj.EPFRC_Id || 0);
                setValue('rdo_ipe', (editObj.epfrC_ExamFlag || editObj.EPFRC_ExamFlag) === 'PE' ? 'PE' : 'IE');
                setValue('ASMAY_Id', yearId ? String(yearId) : '');
                setValue('fromno', editObj.epfrC_From !== undefined && editObj.epfrC_From !== null ? String(editObj.epfrC_From) : '');
                setValue('tono', editObj.epfrC_To !== undefined && editObj.epfrC_To !== null ? String(editObj.epfrC_To) : '');
                setValue('rdo_passfail', (editObj.epfrC_PassFailFlag || editObj.EPFRC_PassFailFlag) === 'Fail' ? 'Fail' : 'Pass');
                setValue('rdo_rank', (editObj.epfrC_RankFlag === false || editObj.epfrC_RankFlag === '0') ? '0' : '1');
                setValue('oppercentage', editObj.epfrC_OverallPercentage !== undefined && editObj.epfrC_OverallPercentage !== null ? String(editObj.epfrC_OverallPercentage) : '');

                // Delay setting category, exam, condition so cascades trigger properly
                setTimeout(() => {
                    setValue('EMCA_Id', categoryId ? String(categoryId) : '');
                }, 300);

                setTimeout(() => {
                    setValue('EME_Id', examId ? String(examId) : '');
                    setValue('ECM_Id', conditionId ? String(conditionId) : '');
                }, 600);
            }
        } else {
            reset({
                EPFRC_Id: 0,
                rdo_ipe: 'IE',
                ASMAY_Id: '',
                EMCA_Id: '',
                EME_Id: '',
                ECM_Id: '',
                fromno: '',
                tono: '',
                rdo_passfail: 'Pass',
                rdo_rank: '1',
                oppercentage: ''
            });
        }
    }, [editingRecord, setValue, reset]);

    const onSubmit = async (values: FormValues) => {
        try {
            setIsSaving(true);
            const rankFlagBool = values.rdo_rank === '1';
            const percentageNum = parseFloat(values.oppercentage) || 0;
            const payload: any = {
                ASMAY_Id: Number(values.ASMAY_Id),
                asmaY_Id: Number(values.ASMAY_Id),
                EME_Id: values.rdo_ipe === 'PE' ? 0 : Number(values.EME_Id || 0),
                emE_Id: values.rdo_ipe === 'PE' ? 0 : Number(values.EME_Id || 0),
                EPFRC_From: Number(values.fromno),
                epfrC_From: Number(values.fromno),
                EPFRC_To: Number(values.tono),
                epfrC_To: Number(values.tono),
                EPFRC_PassFailFlag: values.rdo_passfail,
                epfrC_PassFailFlag: values.rdo_passfail,
                EPFRC_ExamFlag: values.rdo_ipe,
                epfrC_ExamFlag: values.rdo_ipe,
                EPFRC_Percentage: percentageNum,
                epfrC_Percentage: percentageNum,
                ECM_Id: Number(values.ECM_Id),
                ecM_Id: Number(values.ECM_Id),
                EMCA_Id: Number(values.EMCA_Id),
                emcA_Id: Number(values.EMCA_Id),
                EPFRC_Condition: Number(values.ECM_Id),
                epfrC_Condition: Number(values.ECM_Id),
                EPFRC_RankFlag: rankFlagBool,
                epfrC_RankFlag: rankFlagBool ? 1 : 0,
                EPFRC_RankFlg: rankFlagBool,
                epfrC_RankFlg: rankFlagBool,
                EPFRC_Id: Number(values.EPFRC_Id || 0),
                epfrC_Id: Number(values.EPFRC_Id || 0),
                EPFRC_OverallPercentage: percentageNum,
                epfrC_OverallPercentage: percentageNum
            };

            const res = await savePassFailCondition(payload);
            const data = res?.data ?? res;

            if (
                data?.already_cnt === true ||
                data?.returnval === false ||
                data?.message?.toLowerCase()?.includes('already') ||
                data?.message?.toLowerCase()?.includes('duplicate')
            ) {
                toast.error(data?.message || 'This condition combination already exists in the system.');
            } else if (data?.returnval === true || res?.success) {
                toast.success(
                    values.EPFRC_Id > 0
                        ? 'Record updated successfully'
                        : 'Record saved successfully'
                );

                const selectedYear = yearList.find((y: any) => String(y.asmaY_Id || y.ASMAY_Id || y.id) === String(values.ASMAY_Id));
                const selectedExam = examList.find((e: any) => String(e.emE_Id || e.EME_Id || e.id) === String(values.EME_Id));
                const selectedCat = categoryList.find((c: any) => String(c.emcA_Id || c.EMCA_Id || c.id) === String(values.EMCA_Id));
                const selectedCond = examConditionList.find((ec: any) => String(ec.ecM_Id || ec.ECM_Id || ec.id) === String(values.ECM_Id));

                const optimisticRecord = {
                    epfrC_Id: values.EPFRC_Id || (data?.epfrC_Id || data?.EPFRC_Id || Date.now()),
                    asmaY_Id: Number(values.ASMAY_Id),
                    asmaY_Year: selectedYear?.asmaY_Year || selectedYear?.ASMAY_Year || selectedYear?.year || '',
                    emE_Id: values.rdo_ipe === 'PE' ? 0 : Number(values.EME_Id || 0),
                    emE_ExamName: values.rdo_ipe === 'PE' ? '-' : (selectedExam?.emE_ExamName || selectedExam?.EME_ExamName || selectedExam?.examName || '-'),
                    epfrC_ExamFlag: values.rdo_ipe,
                    emcA_Id: Number(values.EMCA_Id),
                    emcA_CategoryName: selectedCat?.emcA_CategoryName || selectedCat?.EMCA_CategoryName || selectedCat?.categoryName || '',
                    ecM_Id: Number(values.ECM_Id),
                    ecM_ConditionName: selectedCond?.ecM_ConditionName || selectedCond?.ECM_ConditionName || selectedCond?.conditionName || '',
                    epfrC_From: Number(values.fromno),
                    epfrC_To: Number(values.tono),
                    epfrC_RankFlag: values.rdo_rank === '1',
                    epfrC_PassFailFlag: values.rdo_passfail,
                    epfrC_OverallPercentage: percentageNum,
                    epfrC_ActiveFlag: true
                };

                onFormSubmitted(data, optimisticRecord);
                reset({
                    EPFRC_Id: 0,
                    rdo_ipe: 'IE',
                    ASMAY_Id: '',
                    EMCA_Id: '',
                    EME_Id: '',
                    ECM_Id: '',
                    fromno: '',
                    tono: '',
                    rdo_passfail: 'Pass',
                    rdo_rank: '1',
                    oppercentage: ''
                });
            } else {
                toast.error(res?.message || data?.message || 'Failed to save/update record');
            }
        } catch (err: any) {
            toast.error(err?.message || 'An error occurred while saving');
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        reset({
            EPFRC_Id: 0,
            rdo_ipe: 'IE',
            ASMAY_Id: '',
            EMCA_Id: '',
            EME_Id: '',
            ECM_Id: '',
            fromno: '',
            tono: '',
            rdo_passfail: 'Pass',
            rdo_rank: '1',
            oppercentage: ''
        });
        onCancelEdit();
    };

    return (
        <Card className="border shadow-sm">
            <CardHeader className="pb-4">
                <CardTitle className="text-xl font-semibold flex items-center gap-2">
                    <Filter className="h-5 w-5 text-primary" />
                    Exam-Pass Fail Condition
                </CardTitle>
                <CardDescription>
                    Configure pass/fail flags, rank applicability, and overall percentages by category and exam condition.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* Exam Type Radio */}
                    <div className="rounded-lg border p-4 bg-muted/20">
                        <Controller
                            name="rdo_ipe"
                            control={control}
                            render={({ field }) => (
                                <RadioGroup
                                    onValueChange={field.onChange}
                                    value={field.value}
                                    className="flex flex-wrap justify-center gap-8"
                                >
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="IE" id="rdo_ie" />
                                        <Label htmlFor="rdo_ie" className="font-semibold cursor-pointer">
                                            INDIVIDUAL EXAM
                                        </Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="PE" id="rdo_pe" />
                                        <Label htmlFor="rdo_pe" className="font-semibold cursor-pointer">
                                            PROMOTIONAL EXAM
                                        </Label>
                                    </div>
                                </RadioGroup>
                            )}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Left Column */}
                        <div className="space-y-4">
                            {/* Academic Year */}
                            <div className="space-y-2">
                                <Label htmlFor="ASMAY_Id" className="font-medium">
                                    Academic Year <span className="text-destructive">*</span>
                                </Label>
                                <Controller
                                    name="ASMAY_Id"
                                    control={control}
                                    rules={{ required: 'Academic Year is required' }}
                                    render={({ field }) => (
                                        <Select
                                            onValueChange={field.onChange}
                                            value={field.value ? String(field.value) : ''}
                                        >
                                            <SelectTrigger id="ASMAY_Id">
                                                <SelectValue placeholder="-- Select Academic Year --" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {yearList.length === 0 ? (
                                                    <div className="p-2 text-center text-xs text-muted-foreground">
                                                        No Academic Years Found
                                                    </div>
                                                ) : (
                                                    yearList.map((y: any, idx: number) => {
                                                        const id = y.asmaY_Id ?? y.ASMAY_Id ?? y.asmaY_id ?? y.id ?? y.ASMAY_ID;
                                                        const name = y.asmaY_Year ?? y.ASMAY_Year ?? y.year ?? y.academicYear ?? y.asmaY_YearName ?? y.academic_year ?? '';
                                                        return (
                                                            <SelectItem key={id || idx} value={String(id)}>
                                                                {name}
                                                            </SelectItem>
                                                        );
                                                    })
                                                )}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {errors.ASMAY_Id && (
                                    <p className="text-xs text-destructive">{errors.ASMAY_Id.message}</p>
                                )}
                            </div>

                            {/* Exam (Disabled when PE) */}
                            <div className="space-y-2">
                                <Label htmlFor="EME_Id" className="font-medium">
                                    Exam {watchExamFlag === 'IE' && <span className="text-destructive">*</span>}
                                </Label>
                                <Controller
                                    name="EME_Id"
                                    control={control}
                                    rules={{
                                        required: watchExamFlag === 'IE' ? 'Exam is required' : false
                                    }}
                                    render={({ field }) => (
                                        <Select
                                            onValueChange={field.onChange}
                                            value={field.value ? String(field.value) : ''}
                                            disabled={watchExamFlag === 'PE' || loadingExams || !watchCategory}
                                        >
                                            <SelectTrigger id="EME_Id">
                                                <SelectValue placeholder={loadingExams ? 'Loading exams...' : '-- Select Exam --'} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {examList.length === 0 ? (
                                                    <div className="p-2 text-center text-xs text-muted-foreground">
                                                        No Exams Available
                                                    </div>
                                                ) : (
                                                    examList.map((e: any, idx: number) => {
                                                        const id = e.emE_Id ?? e.EME_Id ?? e.id ?? e.eme_id ?? e.exm_id ?? e.ismS_Id ?? e.ISMS_Id;
                                                        const name = e.emE_ExamName ?? e.EME_ExamName ?? e.examName ?? e.exam_name ?? e.name ?? e.emE_ExamCode ?? e.EME_ExamCode ?? e.ismS_SubjectName ?? e.subjectName ?? '';
                                                        return (
                                                            <SelectItem key={id || idx} value={String(id)}>
                                                                {name}
                                                            </SelectItem>
                                                        );
                                                    })
                                                )}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {errors.EME_Id && (
                                    <p className="text-xs text-destructive">{errors.EME_Id.message}</p>
                                )}
                            </div>

                            {/* From Number */}
                            <div className="space-y-2">
                                <Label htmlFor="fromno" className="font-medium">
                                    From Number <span className="text-destructive">*</span>
                                </Label>
                                <Controller
                                    name="fromno"
                                    control={control}
                                    rules={{ required: 'From Number is required' }}
                                    render={({ field }) => (
                                        <Select
                                            onValueChange={field.onChange}
                                            value={field.value !== undefined && field.value !== null ? String(field.value) : ''}
                                        >
                                            <SelectTrigger id="fromno">
                                                <SelectValue placeholder="-- Select From Number --" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {numberOptions.map((num) => (
                                                    <SelectItem key={num} value={num}>
                                                        {num}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {errors.fromno && (
                                    <p className="text-xs text-destructive">{errors.fromno.message}</p>
                                )}
                            </div>

                            {/* Pass / Fail Radio */}
                            <div className="space-y-2">
                                <Label className="font-medium">
                                    Pass / Fail <span className="text-destructive">*</span>
                                </Label>
                                <div className="rounded-md border p-3">
                                    <Controller
                                        name="rdo_passfail"
                                        control={control}
                                        render={({ field }) => (
                                            <RadioGroup
                                                onValueChange={field.onChange}
                                                value={field.value}
                                                className="flex gap-6"
                                            >
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="Pass" id="rdo_pass" />
                                                    <Label htmlFor="rdo_pass" className="cursor-pointer font-medium text-emerald-600 dark:text-emerald-400">
                                                        PASS
                                                    </Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="Fail" id="rdo_fail" />
                                                    <Label htmlFor="rdo_fail" className="cursor-pointer font-medium text-rose-600 dark:text-rose-400">
                                                        FAIL
                                                    </Label>
                                                </div>
                                            </RadioGroup>
                                        )}
                                    />
                                </div>
                            </div>

                            {/* Over All Percentage */}
                            <div className="space-y-2">
                                <Label htmlFor="oppercentage" className="font-medium">
                                    Over All Percentage <span className="text-destructive">*</span>
                                </Label>
                                <Controller
                                    name="oppercentage"
                                    control={control}
                                    rules={{
                                        required: 'Over All Percentage is required',
                                        pattern: {
                                            value: /^[0-9]+(\.[0-9]{1,2})?$/,
                                            message: 'Enter valid format (e.g., 10, 10.5, 75.25)'
                                        }
                                    }}
                                    render={({ field }) => (
                                        <Input
                                            {...field}
                                            id="oppercentage"
                                            placeholder="e.g. 35.0"
                                            maxLength={5}
                                        />
                                    )}
                                />
                                {errors.oppercentage && (
                                    <p className="text-xs text-destructive">{errors.oppercentage.message}</p>
                                )}
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-4">
                            {/* Category */}
                            <div className="space-y-2">
                                <Label htmlFor="EMCA_Id" className="font-medium">
                                    Category <span className="text-destructive">*</span>
                                </Label>
                                <Controller
                                    name="EMCA_Id"
                                    control={control}
                                    rules={{ required: 'Category is required' }}
                                    render={({ field }) => (
                                        <Select
                                            onValueChange={field.onChange}
                                            value={field.value ? String(field.value) : ''}
                                            disabled={loadingCategories || !watchYear}
                                        >
                                            <SelectTrigger id="EMCA_Id">
                                                <SelectValue placeholder={loadingCategories ? 'Loading categories...' : '-- Select Category --'} />
                                            </SelectTrigger>
                                             <SelectContent>
                                                {categoryList.length === 0 ? (
                                                    <div className="p-2 text-center text-xs text-muted-foreground">
                                                        No Categories Available
                                                    </div>
                                                ) : (
                                                    categoryList.map((c: any, idx: number) => {
                                                        const id = c.emcA_Id ?? c.EMCA_Id ?? c.id ?? c.emca_id ?? c.emC_Id;
                                                        const name = c.emcA_CategoryName ?? c.EMCA_CategoryName ?? c.categoryName ?? c.category_name ?? c.emC_CategoryName ?? c.name ?? '';
                                                        return (
                                                            <SelectItem key={id || idx} value={String(id)}>
                                                                {name}
                                                            </SelectItem>
                                                        );
                                                    })
                                                )}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {errors.EMCA_Id && (
                                    <p className="text-xs text-destructive">{errors.EMCA_Id.message}</p>
                                )}
                            </div>

                            {/* Exam Condition */}
                            <div className="space-y-2">
                                <Label htmlFor="ECM_Id" className="font-medium">
                                    Exam Condition <span className="text-destructive">*</span>
                                </Label>
                                <Controller
                                    name="ECM_Id"
                                    control={control}
                                    rules={{ required: 'Exam Condition is required' }}
                                    render={({ field }) => (
                                        <Select
                                            onValueChange={field.onChange}
                                            value={field.value ? String(field.value) : ''}
                                            disabled={loadingConditions}
                                        >
                                            <SelectTrigger id="ECM_Id">
                                                <SelectValue placeholder="-- Select Exam Condition --" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {examConditionList.length === 0 ? (
                                                    <div className="p-2 text-center text-xs text-muted-foreground">
                                                        No Conditions Available
                                                    </div>
                                                ) : (
                                                    examConditionList.map((ec: any, idx: number) => {
                                                        const id = ec.ecM_Id ?? ec.ECM_Id ?? ec.id ?? ec.ecm_id;
                                                        const name = ec.ecM_ConditionName ?? ec.ECM_ConditionName ?? ec.conditionName ?? ec.condition_name ?? ec.name ?? '';
                                                        return (
                                                            <SelectItem key={id || idx} value={String(id)}>
                                                                {name}
                                                            </SelectItem>
                                                        );
                                                    })
                                                )}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {errors.ECM_Id && (
                                    <p className="text-xs text-destructive">{errors.ECM_Id.message}</p>
                                )}
                            </div>

                            {/* To Number */}
                            <div className="space-y-2">
                                <Label htmlFor="tono" className="font-medium">
                                    To Number <span className="text-destructive">*</span>
                                </Label>
                                <Controller
                                    name="tono"
                                    control={control}
                                    rules={{ required: 'To Number is required' }}
                                    render={({ field }) => (
                                        <Select
                                            onValueChange={field.onChange}
                                            value={field.value !== undefined && field.value !== null ? String(field.value) : ''}
                                        >
                                            <SelectTrigger id="tono">
                                                <SelectValue placeholder="-- Select To Number --" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {numberOptions.map((num) => (
                                                    <SelectItem key={num} value={num}>
                                                        {num}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {errors.tono && (
                                    <p className="text-xs text-destructive">{errors.tono.message}</p>
                                )}
                            </div>

                            {/* Rank Applicable Radio */}
                            <div className="space-y-2">
                                <Label className="font-medium">
                                    Rank Applicable <span className="text-destructive">*</span>
                                </Label>
                                <div className="rounded-md border p-3">
                                    <Controller
                                        name="rdo_rank"
                                        control={control}
                                        render={({ field }) => (
                                            <RadioGroup
                                                onValueChange={field.onChange}
                                                value={field.value}
                                                className="flex flex-col sm:flex-row gap-4"
                                            >
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="1" id="rdo_rank_1" />
                                                    <Label htmlFor="rdo_rank_1" className="cursor-pointer font-medium">
                                                        Rank Applicable
                                                    </Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="0" id="rdo_rank_0" />
                                                    <Label htmlFor="rdo_rank_0" className="cursor-pointer font-medium text-muted-foreground">
                                                        Rank Not Applicable
                                                    </Label>
                                                </div>
                                            </RadioGroup>
                                        )}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t">
                        <Button type="submit" disabled={isSaving}>
                            {isSaving ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    Save
                                </>
                            )}
                        </Button>
                        <Button type="button" variant="outline" onClick={handleCancel} disabled={isSaving}>
                            <X className="mr-2 h-4 w-4" />
                            Cancel
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
