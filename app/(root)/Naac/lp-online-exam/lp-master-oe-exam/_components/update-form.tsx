'use client';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { CustomMultiSelectBox } from '@/components/ui/custom-multiselect';
import { InputText } from '@/components/ui/extension/input-text';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { useMasterOEExam, useSaveMasterOEExam } from '@/hooks/naac/lp-online-exam/useMasters';
import type { IMasterOEExam, IMasterOEExamClass, IMasterOEExamMasterExamOption, IMasterOEExamSection, IMasterOEExamSectionOption, IMasterOEExamSubject, IMasterOEExamYear } from '@/types/naac/lp-online-exam/masters';
import { zodResolver } from '@hookform/resolvers/zod';
import { CalendarDays, ChevronDown, Clock, ExternalLink, Eye, Layers, Plus, ShoppingCart, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const formSchema = z.object({
    creationType: z.enum(['manual', 'question_bank']).default('manual'),
    ASMAY_Id: z.string().min(1, 'Academic Year is required'),
    ASMCL_Id: z.string().min(1, 'Class is required'),
    ASMS_Id: z.string().optional(),
    ISMS_Id: z.string().min(1, 'Subject is required'),
    EME_Id: z.string().optional(),
    LPMOEEX_ExamName: z.string().min(1, 'Exam Name is required'),
    LPMOEEX_NoOfQuestion: z.string().optional(),
    LPMOEEX_TotalMarks: z.string().optional(),
    LPMOEEX_TotalDuration: z.string().optional(),
    LPMOEEX_ExamStartDate: z.string().optional(),
    LPMOEEX_ExamStartTime: z.string().optional(),
    LPMOEEX_ExamEndDate: z.string().optional(),
    LPMOEEX_ExamEndTime: z.string().optional(),
    LPMOEEX_RandomQnsFlg: z.boolean().default(false),
    LPMOEEX_AutoPublishFlg: z.boolean().default(false),
    LPMOEEX_UploadQnsFlg: z.boolean().default(false),
    LPMOEEX_AllowDownloadFlg: z.boolean().default(false),
    LPMOEEX_DurationFlg: z.string().optional(),
    LPMOEEX_Duration: z.string().optional()
});

type FormFields = z.infer<typeof formSchema>;

interface UpdateMasterOEExamFormProps {
    rowData: IMasterOEExam;
    years: IMasterOEExamYear[];
    classes: IMasterOEExamClass[];
    sections?: IMasterOEExamSectionOption[];
    subjects: IMasterOEExamSubject[];
    exams?: IMasterOEExamMasterExamOption[];
    topics?: any[];
    onSuccess: () => void;
    onCancel: () => void;
}

const DatePickerPopover = ({ value, onChange, placeholder = 'Enter date' }: { value: string; onChange: (val: string) => void; placeholder?: string }) => {
    const [open, setOpen] = useState(false);
    const dateObj = value ? new Date(value.includes('T') ? value : `${value}T00:00:00`) : undefined;

    return (
        <div className='relative flex items-center w-full'>
            <InputText
                type='date'
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className='h-8 text-xs pr-8 w-full bg-background cursor-pointer font-medium'
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

const TimePickerPopover = ({ value, onChange, placeholder = 'Select Time' }: { value: string; onChange: (val: string) => void; placeholder?: string }) => {
    const [open, setOpen] = useState(false);
    const times = [
        '07:00', '07:30', '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
        '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
        '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30',
        '19:00', '19:30', '20:00', '20:30', '21:00'
    ];

    return (
        <div className='relative flex items-center w-full'>
            <InputText
                type='time'
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className='h-8 text-xs pr-8 w-full bg-background cursor-pointer'
            />
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <button
                        type='button'
                        tabIndex={-1}
                        title='Open Time Picker'
                        className='absolute right-2 z-10 p-1 text-primary hover:text-primary/80 cursor-pointer'
                    >
                        <Clock className='h-4 w-4' />
                    </button>
                </PopoverTrigger>
                <PopoverContent className='w-36 p-1 z-50 max-h-48 overflow-y-auto' align='end'>
                    <div className='flex flex-col gap-0.5'>
                        {times.map((t) => (
                            <button
                                key={t}
                                type='button'
                                className={`text-xs py-1 px-2 text-left rounded hover:bg-primary/10 ${value === t ? 'bg-primary text-primary-foreground font-semibold' : ''}`}
                                onClick={() => {
                                    onChange(t);
                                    setOpen(false);
                                }}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    );
};

export default function UpdateMasterOEExamForm({ rowData, years, classes, sections = [], subjects, exams = [], topics = [], onSuccess, onCancel }: UpdateMasterOEExamFormProps) {
    const { refetchAll } = useMasterOEExam();
    const saveMutation = useSaveMasterOEExam();

    const [sectionRows, setSectionRows] = useState<IMasterOEExamSection[]>(
        rowData.section_list && rowData.section_list.length > 0
            ? rowData.section_list
            : [{ lpmoeeXSEC_SectionName: '', lpmoeeXSEC_SectionOrder: 1, lpmoeeXSEC_MaxQns: 0, lpmoeeXSEC_TotalQns: 0, lpmoeeXSEC_Marks: 0 }]
    );

    // Manual Create Questions State
    const [qnsTextType, setQnsTextType] = useState(true);
    const [qnsMathType, setQnsMathType] = useState(false);
    const [qnsChemType, setQnsChemType] = useState(false);
    const [questionText, setQuestionText] = useState('');
    const [noOfOptions, setNoOfOptions] = useState('4');
    const [noOfMarks, setNoOfMarks] = useState('');
    const [isSubjective, setIsSubjective] = useState(false);
    const [correctAnswerText, setCorrectAnswerText] = useState('');
    const [isMatchTheFollowing, setIsMatchTheFollowing] = useState(false);
    const [mfRows, setMfRows] = useState('4');
    const [mfCols, setMfCols] = useState('4');
    const [createdQuestionsList, setCreatedQuestionsList] = useState<any[]>([]);

    // Question Bank Filtration State
    const [topicSearch, setTopicSearch] = useState('');
    const [customTopics, setCustomTopics] = useState<string[]>([]);
    const [qbSubjective, setQbSubjective] = useState(false);
    const [selectedComplexities, setSelectedComplexities] = useState<string[]>([]);

    // File Attachment State
    const [fileRows, setFileRows] = useState<any[]>([{ id: 1, file: null, name: '' }]);

    const activeSectionOptions = (sections || []);
    const activeExamOptions = (exams || []);

    const resolveAsmsId = (row: any) => {
        if (!row) return '1';

        const sectionRaw = (sections || []);

        // Check if section_list exists on row
        if (row.section_list && Array.isArray(row.section_list) && row.section_list.length > 0) {
            const ids = row.section_list.map((s: any) => (s.asmS_Id ?? s.ASMS_Id ?? s.id ?? '').toString()).filter(Boolean);
            if (ids.length > 0) return ids.join(',');
        }

        const val = row.asmS_Id ?? row.ASMS_Id ?? row.asmC_Id ?? row.ASMC_Id;
        const sName = (row.asmC_SectionName || row.ASMC_SectionName || row.asmS_SectionName || row.sectionName || '').toString().toUpperCase().trim();

        for (let idx = 0; idx < sectionRaw.length; idx++) {
            const sec = sectionRaw[idx];
            const secId = (sec.asmS_Id ?? sec.ASMS_Id ?? sec.id ?? idx + 1).toString();
            const secName = (sec.asmC_SectionName || sec.ASMC_SectionName || sec.asmS_SectionName || sec.sectionName || sec.name || '').toString().toUpperCase().trim();

            if (val && val.toString() === secId) return secId;
            if (sName && (secName === sName || secName.includes(sName) || sName.includes(secName))) return secId;
        }

        const firstOptId = (sectionRaw[0]?.asmS_Id ?? sectionRaw[0]?.ASMS_Id ?? 1).toString();
        return val ? val.toString() : firstOptId;
    };

    const resolveEmeId = (row: any) => {
        if (!row) return '';
        const val = row.emE_Id ?? row.EME_Id ?? row.eme_Id ?? row.eme_id ?? row.lpmoeeX_EME_Id ?? row.LPMOEEX_EME_Id;
        if (val !== undefined && val !== null && val !== 0 && val !== '0' && val !== '') {
            const valStr = val.toString();
            const exists = activeExamOptions.some((e: any, idx: number) => (e.emE_Id ?? e.EME_Id ?? e.id ?? idx + 1).toString() === valStr);
            if (exists) return valStr;
        }
        const eName = (row.lpmoeeX_ExamName || row.LPMOEEX_ExamName || row.emE_ExamName || row.EME_ExamName || '').toUpperCase().trim();
        if (eName) {
            const found = activeExamOptions.find((e: any) => {
                const name = (e.emE_ExamName || e.EME_ExamName || e.examName || e.name || '').toUpperCase().trim();
                return name === eName || eName.includes(name) || name.includes(eName);
            });
            if (found) {
                return (found.emE_Id ?? found.EME_Id ?? found.id ?? 1).toString();
            }
        }
        return val ? val.toString() : '';
    };

    const extractDateFromRow = (row: any, ...keys: string[]) => {
        if (!row) return '';
        for (const key of keys) {
            const val = row[key];
            if (val) {
                const dateStr = String(val);
                if (dateStr.includes('T')) return dateStr.split('T')[0];
                if (dateStr.includes('-') && dateStr.length >= 10) return dateStr.substring(0, 10);
                const d = new Date(dateStr);
                if (!isNaN(d.getTime())) return d.toISOString().split('T')[0];
            }
        }
        return '';
    };

    const extractTimeFromRow = (row: any, fallback: string, ...keys: string[]) => {
        if (!row) return fallback;
        for (const key of keys) {
            const val = row[key];
            if (val) {
                const timeStr = String(val);
                if (timeStr.includes('T')) {
                    const timePart = timeStr.split('T')[1];
                    if (timePart) return timePart.substring(0, 5);
                }
                if (timeStr.includes(':')) return timeStr.substring(0, 5);
            }
        }
        return fallback;
    };

    const {
        register,
        control,
        handleSubmit,
        reset,
        watch,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            creationType: rowData.creationType || 'manual',
            ASMAY_Id: rowData.asmaY_Id?.toString() || rowData.ASMAY_Id?.toString() || '',
            ASMCL_Id: rowData.asmcL_Id?.toString() || rowData.ASMCL_Id?.toString() || '',
            ASMS_Id: resolveAsmsId(rowData),
            ISMS_Id: rowData.ismS_Id?.toString() || rowData.ISMS_Id?.toString() || '',
            EME_Id: resolveEmeId(rowData),
            LPMOEEX_ExamName: rowData.lpmoeeX_ExamName || rowData.LPMOEEX_ExamName || '',
            LPMOEEX_NoOfQuestion: rowData.lpmoeeX_NoOfQuestion?.toString() || rowData.LPMOEEX_NoOfQuestion?.toString() || '',
            LPMOEEX_TotalMarks: rowData.lpmoeeX_TotalMarks?.toString() || rowData.LPMOEEX_TotalMarks?.toString() || '',
            LPMOEEX_TotalDuration: rowData.lpmoeeX_TotalDuration?.toString() || rowData.LPMOEEX_TotalDuration?.toString() || '',
            LPMOEEX_ExamStartDate: extractDateFromRow(rowData, 'lpmoeeX_ExamStartDate', 'LPMOEEX_ExamStartDate', 'lpmoeeX_ExamStartDateTime', 'LPMOEEX_ExamStartDateTime', 'lpmoeX_ExamStartDate'),
            LPMOEEX_ExamStartTime: extractTimeFromRow(rowData, '09:00', 'lpmoeeX_ExamStartTime', 'LPMOEEX_ExamStartTime', 'lpmoeeX_ExamStartDateTime', 'LPMOEEX_ExamStartDateTime'),
            LPMOEEX_ExamEndDate: extractDateFromRow(rowData, 'lpmoeeX_ExamEndDate', 'LPMOEEX_ExamEndDate', 'lpmoeeX_ExamEndDateTime', 'LPMOEEX_ExamEndDateTime', 'lpmoeX_ExamEndDate'),
            LPMOEEX_ExamEndTime: extractTimeFromRow(rowData, '17:00', 'lpmoeeX_ExamEndTime', 'LPMOEEX_ExamEndTime', 'lpmoeeX_ExamEndDateTime', 'LPMOEEX_ExamEndDateTime'),
            LPMOEEX_RandomQnsFlg: rowData.lpmoeeX_RandomQnsFlg ?? rowData.LPMOEEX_RandomQnsFlg ?? false,
            LPMOEEX_AutoPublishFlg: rowData.lpmoeeX_AutoPublishFlg ?? rowData.LPMOEEX_AutoPublishFlg ?? false,
            LPMOEEX_UploadQnsFlg: rowData.lpmoeeX_UploadQnsFlg ?? rowData.LPMOEEX_UploadQnsFlg ?? false,
            LPMOEEX_AllowDownloadFlg: rowData.lpmoeeX_AllowDownloadFlg ?? rowData.LPMOEEX_AllowDownloadFlg ?? false,
            LPMOEEX_DurationFlg: rowData.lpmoeeX_DurationFlg || rowData.LPMOEEX_DurationFlg || '',
            LPMOEEX_Duration: rowData.lpmoeeX_Duration?.toString() || rowData.LPMOEEX_Duration?.toString() || ''
        },
        mode: 'onChange'
    });

    const currentCreationType = watch('creationType');

    useEffect(() => {
        reset({
            creationType: rowData.creationType || 'manual',
            ASMAY_Id: rowData.asmaY_Id?.toString() || rowData.ASMAY_Id?.toString() || '',
            ASMCL_Id: rowData.asmcL_Id?.toString() || rowData.ASMCL_Id?.toString() || '',
            ASMS_Id: resolveAsmsId(rowData),
            ISMS_Id: rowData.ismS_Id?.toString() || rowData.ISMS_Id?.toString() || '',
            EME_Id: resolveEmeId(rowData),
            LPMOEEX_ExamName: rowData.lpmoeeX_ExamName || rowData.LPMOEEX_ExamName || '',
            LPMOEEX_NoOfQuestion: rowData.lpmoeeX_NoOfQuestion?.toString() || rowData.LPMOEEX_NoOfQuestion?.toString() || '',
            LPMOEEX_TotalMarks: rowData.lpmoeeX_TotalMarks?.toString() || rowData.LPMOEEX_TotalMarks?.toString() || '',
            LPMOEEX_TotalDuration: rowData.lpmoeeX_TotalDuration?.toString() || rowData.LPMOEEX_TotalDuration?.toString() || '',
            LPMOEEX_ExamStartDate: extractDateFromRow(rowData, 'lpmoeeX_ExamStartDate', 'LPMOEEX_ExamStartDate', 'lpmoeeX_ExamStartDateTime', 'LPMOEEX_ExamStartDateTime', 'lpmoeX_ExamStartDate'),
            LPMOEEX_ExamStartTime: extractTimeFromRow(rowData, '09:00', 'lpmoeeX_ExamStartTime', 'LPMOEEX_ExamStartTime', 'lpmoeeX_ExamStartDateTime', 'LPMOEEX_ExamStartDateTime'),
            LPMOEEX_ExamEndDate: extractDateFromRow(rowData, 'lpmoeeX_ExamEndDate', 'LPMOEEX_ExamEndDate', 'lpmoeeX_ExamEndDateTime', 'LPMOEEX_ExamEndDateTime', 'lpmoeX_ExamEndDate'),
            LPMOEEX_ExamEndTime: extractTimeFromRow(rowData, '17:00', 'lpmoeeX_ExamEndTime', 'LPMOEEX_ExamEndTime', 'lpmoeeX_ExamEndDateTime', 'LPMOEEX_ExamEndDateTime'),
            LPMOEEX_RandomQnsFlg: rowData.lpmoeeX_RandomQnsFlg ?? rowData.LPMOEEX_RandomQnsFlg ?? false,
            LPMOEEX_AutoPublishFlg: rowData.lpmoeeX_AutoPublishFlg ?? rowData.LPMOEEX_AutoPublishFlg ?? false,
            LPMOEEX_UploadQnsFlg: rowData.lpmoeeX_UploadQnsFlg ?? rowData.LPMOEEX_UploadQnsFlg ?? false,
            LPMOEEX_AllowDownloadFlg: rowData.lpmoeeX_AllowDownloadFlg ?? rowData.LPMOEEX_AllowDownloadFlg ?? false,
            LPMOEEX_DurationFlg: rowData.lpmoeeX_DurationFlg || rowData.LPMOEEX_DurationFlg || '',
            LPMOEEX_Duration: rowData.lpmoeeX_Duration?.toString() || rowData.LPMOEEX_Duration?.toString() || ''
        });

        if (rowData.section_list && rowData.section_list.length > 0) {
            setSectionRows(rowData.section_list);
        }
    }, [rowData, reset]);

    const addSectionRow = () => {
        setSectionRows((prev) => [
            ...prev,
            {
                lpmoeeXSEC_SectionName: '',
                lpmoeeXSEC_SectionOrder: prev.length + 1,
                lpmoeeXSEC_MaxQns: 0,
                lpmoeeXSEC_TotalQns: 0,
                lpmoeeXSEC_Marks: 0
            }
        ]);
    };

    const removeSectionRow = (index: number) => {
        if (sectionRows.length <= 1) {
            toast.warning('At least one section row is required.');
            return;
        }
        setSectionRows((prev) => prev.filter((_, i) => i !== index));
    };

    const updateSectionRow = (index: number, field: keyof IMasterOEExamSection, value: any) => {
        setSectionRows((prev) =>
            prev.map((row, i) => (i === index ? { ...row, [field]: value } : row))
        );
    };

    const handleAddQuestionToExam = () => {
        if (!questionText.trim()) {
            toast.error('Please enter question text');
            return;
        }
        if (!noOfMarks || Number(noOfMarks) <= 0) {
            toast.error('Please enter valid question marks');
            return;
        }

        const newQns = {
            id: Date.now(),
            question: questionText,
            noOfOptions: Number(noOfOptions),
            marks: Number(noOfMarks),
            isSubjective,
            correctAnswerText,
            isMatchTheFollowing,
            mfRows: Number(mfRows),
            mfCols: Number(mfCols),
            qnsTextType,
            qnsMathType,
            qnsChemType,
            files: fileRows.filter((f) => f.file)
        };

        setCreatedQuestionsList((prev) => [...prev, newQns]);
        toast.success('Question added to Exam successfully!');
        
        // Reset question input fields
        setQuestionText('');
        setCorrectAnswerText('');
        setIsSubjective(false);
        setIsMatchTheFollowing(false);
        setFileRows([{ id: 1, file: null, name: '' }]);
    };

    const removeCreatedQuestion = (id: number) => {
        setCreatedQuestionsList((prev) => prev.filter((q) => q.id !== id));
    };

    const addFileRow = () => {
        setFileRows((prev) => [...prev, { id: Date.now(), file: null, name: '' }]);
    };

    const removeFileRow = (idx: number) => {
        if (fileRows.length <= 1) return;
        setFileRows((prev) => prev.filter((_, i) => i !== idx));
    };

    const onSubmit = async (data: FormFields) => {
        try {
            const selectedSectionIds = data.ASMS_Id
                ? data.ASMS_Id.split(',').map((id: string) => Number(id)).filter((n: number) => !isNaN(n))
                : [];

            const firstSectionId = selectedSectionIds[0] || 0;
            const sectionListPayload = selectedSectionIds.map((id: number) => ({
                ASMS_Id: id,
                asmS_Id: id,
                asmC_Id: id
            }));

            const payload = {
                LPMOEEX_Id: rowData.lpmoeeX_Id || rowData.LPMOEEX_Id || 0,
                ASMAY_Id: Number(data.ASMAY_Id),
                ASMCL_Id: Number(data.ASMCL_Id),
                ASMS_Id: firstSectionId,
                asmS_Id: firstSectionId,
                asmC_Id: firstSectionId,
                ISMS_Id: Number(data.ISMS_Id),
                EME_Id: data.EME_Id ? Number(data.EME_Id) : 0,
                emE_Id: data.EME_Id ? Number(data.EME_Id) : 0,
                LPMOEEX_ExamName: data.LPMOEEX_ExamName,
                LPMOEEX_NoOfQuestion: data.LPMOEEX_NoOfQuestion ? Number(data.LPMOEEX_NoOfQuestion) : 0,
                LPMOEEX_TotalMarks: data.LPMOEEX_TotalMarks ? Number(data.LPMOEEX_TotalMarks) : 0,
                LPMOEEX_TotalDuration: data.LPMOEEX_TotalDuration ? Number(data.LPMOEEX_TotalDuration) : 0,
                LPMOEEX_ExamStartDate: data.LPMOEEX_ExamStartDate || null,
                LPMOEEX_ExamStartTime: data.LPMOEEX_ExamStartTime || null,
                LPMOEEX_ExamEndDate: data.LPMOEEX_ExamEndDate || null,
                LPMOEEX_ExamEndTime: data.LPMOEEX_ExamEndTime || null,
                LPMOEEX_RandomQnsFlg: data.LPMOEEX_RandomQnsFlg,
                LPMOEEX_AutoPublishFlg: data.LPMOEEX_AutoPublishFlg,
                LPMOEEX_UploadQnsFlg: data.LPMOEEX_UploadQnsFlg,
                LPMOEEX_AllowDownloadFlg: data.LPMOEEX_AllowDownloadFlg,
                LPMOEEX_DurationFlg: data.LPMOEEX_DurationFlg || null,
                LPMOEEX_Duration: data.LPMOEEX_Duration ? Number(data.LPMOEEX_Duration) : 0,
                creationType: data.creationType,
                section_list: sectionListPayload.length > 0 ? sectionListPayload : sectionRows,
                selected_sections: sectionListPayload,
                manual_questions: createdQuestionsList
            };

            const res: any = await saveMutation.mutateAsync(payload);
            const isSuccess = res?.success === true || res?.returnval === true || res?.returnval === "save" || res?.returnval === "update" || res?.data?.returnval === true || res?.data?.returnval === "save" || res?.data?.returnval === "update" || !res?.error;

            if (isSuccess) {
                toast.success(res?.message || res?.data?.message || 'Exam updated successfully');
                refetchAll();
                onSuccess();
            } else {
                toast.error(res?.message || res?.data?.message || 'Failed to update exam');
            }
        } catch (error: any) {
            toast.error(error?.message || 'An error occurred while updating exam');
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-5 text-xs'>
            {/* Top Action Bar */}
            <div className='flex flex-wrap items-center justify-between gap-3 rounded-lg bg-muted/40 p-3 border'>
                <Controller
                    name='creationType'
                    control={control}
                    render={({ field }) => (
                        <RadioGroup value={field.value} onValueChange={field.onChange} className='flex items-center gap-5'>
                            <div className='flex items-center space-x-1.5'>
                                <RadioGroupItem value='manual' id='edit_creation_manual' />
                                <Label htmlFor='edit_creation_manual' className='font-semibold text-xs cursor-pointer'>Manual Question Creation</Label>
                            </div>
                            <div className='flex items-center space-x-1.5'>
                                <RadioGroupItem value='question_bank' id='edit_creation_qb' />
                                <Label htmlFor='edit_creation_qb' className='font-semibold text-xs cursor-pointer'>Questions From Question Bank</Label>
                            </div>
                        </RadioGroup>
                    )}
                />

                <div className='flex items-center gap-2'>
                    <Button type='button' variant='secondary' size='sm' className='!w-auto h-7 text-xs px-3 gap-1 font-medium' onClick={() => window.open('https://www.google.com', '_blank')}>
                        <ExternalLink className='h-3 w-3' /> Chemical Drawing
                    </Button>
                    <Button type='button' variant='secondary' size='sm' className='!w-auto h-7 text-xs px-3 gap-1 font-medium' onClick={() => window.open('https://translate.google.com', '_blank')}>
                        <ExternalLink className='h-3 w-3' /> Language Translator
                    </Button>
                </div>
            </div>

            {/* EXAM DETAILS CONTAINER */}
            <div className='rounded-lg border bg-card p-4 space-y-5 shadow-xs'>
                <div className='flex items-center gap-2 border-b pb-2.5'>
                    <Layers className='h-4 w-4 text-primary' />
                    <h3 className='font-bold text-xs text-primary uppercase tracking-wide'>EXAM DETAILS</h3>
                </div>
                
                {/* Row 1: Academic Year | Class | Section */}
                <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                    <div className='space-y-1.5'>
                        <Label htmlFor='edit_ASMAY_Id' className='text-xs'>
                            Academic Year <span className='text-destructive'>*</span>
                        </Label>
                        <Controller
                            name='ASMAY_Id'
                            control={control}
                            render={({ field }) => (
                                <Select value={field.value} onValueChange={field.onChange}>
                                    <SelectTrigger id='edit_ASMAY_Id' className='h-8 text-xs'>
                                        <SelectValue placeholder='Select Academic Year' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {years.map((y) => (
                                            <SelectItem key={y.asmaY_Id} value={y.asmaY_Id.toString()} className='text-xs'>
                                                {y.asmaY_Year}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.ASMAY_Id && <p className='text-destructive text-[11px]'>{errors.ASMAY_Id.message}</p>}
                    </div>

                    <div className='space-y-1.5'>
                        <Label htmlFor='edit_ASMCL_Id' className='text-xs'>
                            Class <span className='text-destructive'>*</span>
                        </Label>
                        <Controller
                            name='ASMCL_Id'
                            control={control}
                            render={({ field }) => (
                                <Select value={field.value} onValueChange={field.onChange}>
                                    <SelectTrigger id='edit_ASMCL_Id' className='h-8 text-xs'>
                                        <SelectValue placeholder='Select Class' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {classes.map((c) => (
                                            <SelectItem key={c.asmcL_Id} value={c.asmcL_Id.toString()} className='text-xs'>
                                                {c.asmcL_ClassName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.ASMCL_Id && <p className='text-destructive text-[11px]'>{errors.ASMCL_Id.message}</p>}
                    </div>

                    <div className='space-y-1.5'>
                        <Controller
                            name='ASMS_Id'
                            control={control}
                            render={({ field }) => {
                                const sectionRaw = (sections || []);
                                const sectionOptions = sectionRaw.map((sec: any, idx: number) => ({
                                    label: sec.asmC_SectionName || sec.ASMC_SectionName || sec.asmS_SectionName || `Section ${sec.asmS_Id || idx + 1}`,
                                    value: (sec.asmS_Id ?? sec.ASMS_Id ?? sec.id ?? idx + 1).toString()
                                }));
                                const selectedVals = field.value ? field.value.split(',').filter(Boolean) : [];

                                return (
                                    <CustomMultiSelectBox
                                        label='Section'
                                        isRequired={true}
                                        options={sectionOptions}
                                        value={selectedVals}
                                        onChange={(vals) => field.onChange(vals.join(','))}
                                        isSearchRequired={true}
                                        height='130px'
                                    />
                                );
                            }}
                        />
                    </div>
                </div>

                {/* Row 2: Subject | Exam Name | Exam (Master Exam Dropdown) */}
                <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                    <div className='space-y-1.5'>
                        <Label htmlFor='edit_ISMS_Id' className='text-xs'>
                            Subject <span className='text-destructive'>*</span>
                        </Label>
                        <Controller
                            name='ISMS_Id'
                            control={control}
                            render={({ field }) => (
                                <Select value={field.value} onValueChange={field.onChange}>
                                    <SelectTrigger id='edit_ISMS_Id' className='h-8 text-xs'>
                                        <SelectValue placeholder='Select Subject' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {subjects.map((s) => (
                                            <SelectItem key={s.ismS_Id} value={s.ismS_Id.toString()} className='text-xs'>
                                                {s.ismS_SubjectName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.ISMS_Id && <p className='text-destructive text-[11px]'>{errors.ISMS_Id.message}</p>}
                    </div>

                    <div className='space-y-1.5'>
                        <Label htmlFor='edit_LPMOEEX_ExamName' className='text-xs'>
                            Exam Name <span className='text-destructive'>*</span>
                        </Label>
                        <InputText
                            id='edit_LPMOEEX_ExamName'
                            {...register('LPMOEEX_ExamName')}
                            placeholder='Enter Exam Name'
                            className='h-8 text-xs'
                        />
                        {errors.LPMOEEX_ExamName && <p className='text-destructive text-[11px]'>{errors.LPMOEEX_ExamName.message}</p>}
                    </div>

                    <div className='space-y-1.5'>
                        <Label htmlFor='edit_EME_Id' className='text-xs'>Exam</Label>
                        <Controller
                            name='EME_Id'
                            control={control}
                            render={({ field }) => {
                                const baseExamOptions = (exams || []);
                                const examOptions = [...baseExamOptions];
                                if (field.value && !examOptions.some((e: any, idx: number) => (e.emE_Id ?? e.EME_Id ?? e.id ?? idx + 1).toString() === field.value.toString())) {
                                    const fallbackName = rowData?.emE_ExamName || rowData?.EME_ExamName;
                                    examOptions.push({
                                        emE_Id: field.value,
                                        emE_ExamName: fallbackName || `Exam ${field.value}`
                                    });
                                }

                                return (
                                    <Select value={field.value || ''} onValueChange={field.onChange}>
                                        <SelectTrigger id='edit_EME_Id' className='h-8 text-xs'>
                                            <SelectValue placeholder='Select Exam' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {examOptions.map((ex: any, idx: number) => {
                                                const exId = (ex.emE_Id ?? ex.EME_Id ?? ex.id ?? idx + 1).toString();
                                                const exName = ex.emE_ExamName || ex.EME_ExamName || ex.examName || ex.name || `Exam ${exId}`;
                                                return (
                                                    <SelectItem key={exId} value={exId} className='text-xs'>
                                                        {exName}
                                                    </SelectItem>
                                                );
                                            })}
                                        </SelectContent>
                                    </Select>
                                );
                            }}
                        />
                    </div>
                </div>

                {/* Row 3: Metrics - No. Of Questions | Total Marks | Total Duration (Mins) */}
                <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                    <div className='space-y-1.5'>
                        <Label htmlFor='edit_LPMOEEX_NoOfQuestion' className='text-xs'>
                            No. Of Questions <span className='text-destructive'>*</span>
                        </Label>
                        <InputText id='edit_LPMOEEX_NoOfQuestion' type='number' {...register('LPMOEEX_NoOfQuestion')} placeholder='e.g. 25' className='h-8 text-xs' />
                    </div>

                    <div className='space-y-1.5'>
                        <Label htmlFor='edit_LPMOEEX_TotalMarks' className='text-xs'>
                            Total Marks <span className='text-destructive'>*</span>
                        </Label>
                        <InputText id='edit_LPMOEEX_TotalMarks' type='number' {...register('LPMOEEX_TotalMarks')} placeholder='e.g. 100' className='h-8 text-xs' />
                    </div>

                    <div className='space-y-1.5'>
                        <Label htmlFor='edit_LPMOEEX_TotalDuration' className='text-xs'>
                            Total Duration (Mins) <span className='text-destructive'>*</span>
                        </Label>
                        <InputText id='edit_LPMOEEX_TotalDuration' type='number' {...register('LPMOEEX_TotalDuration')} placeholder='e.g. 60' className='h-8 text-xs' />
                    </div>
                </div>

                {/* Row 4: Start Schedule & End Schedule (HTML5 Date/Time Inputs with Popover Calendar & Clock icons) */}
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 rounded-md bg-muted/20 p-3 border'>
                    <div className='space-y-1.5'>
                        <Label htmlFor='edit_LPMOEEX_ExamStartDate' className='flex items-center gap-1 text-xs font-semibold'>
                            <CalendarDays className='h-3.5 w-3.5 text-primary' /> Exam Start Date <span className='text-destructive'>*</span>
                        </Label>
                        <Controller
                            name='LPMOEEX_ExamStartDate'
                            control={control}
                            render={({ field }) => (
                                <DatePickerPopover value={field.value} onChange={field.onChange} placeholder='Start Date' />
                            )}
                        />
                    </div>

                    <div className='space-y-1.5'>
                        <Label htmlFor='edit_LPMOEEX_ExamStartTime' className='flex items-center gap-1 text-xs font-semibold'>
                            <Clock className='h-3.5 w-3.5 text-primary' /> Exam Start Time <span className='text-destructive'>*</span>
                        </Label>
                        <Controller
                            name='LPMOEEX_ExamStartTime'
                            control={control}
                            render={({ field }) => (
                                <TimePickerPopover value={field.value} onChange={field.onChange} placeholder='09:00' />
                            )}
                        />
                    </div>

                    <div className='space-y-1.5'>
                        <Label htmlFor='edit_LPMOEEX_ExamEndDate' className='flex items-center gap-1 text-xs font-semibold'>
                            <CalendarDays className='h-3.5 w-3.5 text-primary' /> Exam End Date <span className='text-destructive'>*</span>
                        </Label>
                        <Controller
                            name='LPMOEEX_ExamEndDate'
                            control={control}
                            render={({ field }) => (
                                <DatePickerPopover value={field.value} onChange={field.onChange} placeholder='End Date' />
                            )}
                        />
                    </div>

                    <div className='space-y-1.5'>
                        <Label htmlFor='edit_LPMOEEX_ExamEndTime' className='flex items-center gap-1 text-xs font-semibold'>
                            <Clock className='h-3.5 w-3.5 text-primary' /> Exam End Time <span className='text-destructive'>*</span>
                        </Label>
                        <Controller
                            name='LPMOEEX_ExamEndTime'
                            control={control}
                            render={({ field }) => (
                                <TimePickerPopover value={field.value} onChange={field.onChange} placeholder='17:00' />
                            )}
                        />
                    </div>
                </div>

                {/* Row 5: Duration Flag & Duration */}
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div className='space-y-1.5'>
                        <Label htmlFor='edit_LPMOEEX_DurationFlg' className='text-xs'>Duration Flag</Label>
                        <Controller
                            name='LPMOEEX_DurationFlg'
                            control={control}
                            render={({ field }) => (
                                <Select value={field.value} onValueChange={field.onChange}>
                                    <SelectTrigger id='edit_LPMOEEX_DurationFlg' className='h-8 text-xs'>
                                        <SelectValue placeholder='-Select Flag-' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value='ExamLevel' className='text-xs'>Exam Level</SelectItem>
                                        <SelectItem value='QuestionLevel' className='text-xs'>Question Level</SelectItem>
                                    </SelectContent>
                                </Select>
                            )}
                        />
                    </div>

                    <div className='space-y-1.5'>
                        <Label htmlFor='edit_LPMOEEX_Duration' className='text-xs'>Duration</Label>
                        <InputText id='edit_LPMOEEX_Duration' type='number' {...register('LPMOEEX_Duration')} placeholder='Enter duration' className='h-8 text-xs' />
                    </div>
                </div>

                {/* Checkboxes aligned neatly in 2 columns */}
                <div className='grid grid-cols-1 md:grid-cols-2 gap-3 pt-2.5 border-t'>
                    <div className='flex items-center space-x-2 rounded border p-2 hover:bg-muted/30 transition-colors'>
                        <Controller
                            name='LPMOEEX_RandomQnsFlg'
                            control={control}
                            render={({ field }) => (
                                <Checkbox id='edit_LPMOEEX_RandomQnsFlg' checked={field.value} onCheckedChange={field.onChange} />
                            )}
                        />
                        <Label htmlFor='edit_LPMOEEX_RandomQnsFlg' className='text-xs font-medium cursor-pointer'>Random Questions</Label>
                    </div>

                    <div className='flex items-center space-x-2 rounded border p-2 hover:bg-muted/30 transition-colors'>
                        <Controller
                            name='LPMOEEX_AutoPublishFlg'
                            control={control}
                            render={({ field }) => (
                                <Checkbox id='edit_LPMOEEX_AutoPublishFlg' checked={field.value} onCheckedChange={field.onChange} />
                            )}
                        />
                        <Label htmlFor='edit_LPMOEEX_AutoPublishFlg' className='text-xs font-medium cursor-pointer'>Auto Publish To Student Portal</Label>
                    </div>

                    <div className='flex items-center space-x-2 rounded border p-2 hover:bg-muted/30 transition-colors'>
                        <Controller
                            name='LPMOEEX_UploadQnsFlg'
                            control={control}
                            render={({ field }) => (
                                <Checkbox id='edit_LPMOEEX_UploadQnsFlg' checked={field.value} onCheckedChange={field.onChange} />
                            )}
                        />
                        <Label htmlFor='edit_LPMOEEX_UploadQnsFlg' className='text-xs font-medium cursor-pointer'>Upload Exam Question Paper</Label>
                    </div>

                    <div className='flex items-center space-x-2 rounded border p-2 hover:bg-muted/30 transition-colors'>
                        <Controller
                            name='LPMOEEX_AllowDownloadFlg'
                            control={control}
                            render={({ field }) => (
                                <Checkbox id='edit_LPMOEEX_AllowDownloadFlg' checked={field.value} onCheckedChange={field.onChange} />
                            )}
                        />
                        <Label htmlFor='edit_LPMOEEX_AllowDownloadFlg' className='text-xs font-medium cursor-pointer'>Allow Student Download Question Paper</Label>
                    </div>
                </div>
            </div>

            {/* SECTION / HEADER DETAILS */}
            <div className='rounded-lg border bg-card p-4 space-y-3.5 shadow-xs'>
                <div className='flex items-center justify-between border-b pb-2.5'>
                    <h3 className='font-bold text-xs text-primary uppercase tracking-wide'>SECTION/HEADER DETAILS</h3>
                    <Button type='button' size='sm' onClick={addSectionRow} className='!w-auto h-7 text-xs px-3.5 gap-1 font-semibold bg-orange-600 hover:bg-orange-700 text-white'>
                        <Plus className='h-3.5 w-3.5' /> Add Header
                    </Button>
                </div>

                <div className='overflow-x-auto rounded border'>
                    <Table>
                        <TableHeader>
                            <TableRow className='bg-muted/50 h-8'>
                                <TableHead className='w-10 text-xs py-1'>#</TableHead>
                                <TableHead className='text-xs py-1'>Header Name *</TableHead>
                                <TableHead className='w-28 text-xs py-1'>Header Order *</TableHead>
                                <TableHead className='w-32 text-xs py-1'>Max Questions</TableHead>
                                <TableHead className='w-40 text-xs py-1'>Total No.Of Questions *</TableHead>
                                <TableHead className='w-28 text-xs py-1'>Section Marks</TableHead>
                                <TableHead className='w-14 text-center text-xs py-1'>Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sectionRows.map((row, idx) => (
                                <TableRow key={idx} className='h-9'>
                                    <TableCell className='font-medium text-xs py-1'>{idx + 1}</TableCell>
                                    <TableCell className='py-1'>
                                        <InputText
                                            value={row.lpmoeeXSEC_SectionName}
                                            onChange={(e) => updateSectionRow(idx, 'lpmoeeXSEC_SectionName', e.target.value)}
                                            placeholder='e.g. Section A'
                                            className='h-7 text-xs'
                                        />
                                    </TableCell>
                                    <TableCell className='py-1'>
                                        <InputText
                                            type='number'
                                            value={row.lpmoeeXSEC_SectionOrder}
                                            onChange={(e) => updateSectionRow(idx, 'lpmoeeXSEC_SectionOrder', Number(e.target.value))}
                                            className='h-7 text-xs'
                                        />
                                    </TableCell>
                                    <TableCell className='py-1'>
                                        <InputText
                                            type='number'
                                            value={row.lpmoeeXSEC_MaxQns || ''}
                                            onChange={(e) => updateSectionRow(idx, 'lpmoeeXSEC_MaxQns', Number(e.target.value))}
                                            className='h-7 text-xs'
                                        />
                                    </TableCell>
                                    <TableCell className='py-1'>
                                        <InputText
                                            type='number'
                                            value={row.lpmoeeXSEC_TotalQns || ''}
                                            onChange={(e) => updateSectionRow(idx, 'lpmoeeXSEC_TotalQns', Number(e.target.value))}
                                            className='h-7 text-xs'
                                        />
                                    </TableCell>
                                    <TableCell className='py-1'>
                                        <InputText
                                            type='number'
                                            value={row.lpmoeeXSEC_Marks || ''}
                                            onChange={(e) => updateSectionRow(idx, 'lpmoeeXSEC_Marks', Number(e.target.value))}
                                            className='h-7 text-xs'
                                        />
                                    </TableCell>
                                    <TableCell className='text-center py-1'>
                                        <Button
                                            type='button'
                                            variant='ghost'
                                            size='icon'
                                            onClick={() => removeSectionRow(idx)}
                                            className='!w-auto text-destructive hover:bg-destructive/10 h-7 w-7 p-0'>
                                            <Trash2 className='h-3.5 w-3.5' />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* CREATE QUESTIONS SECTION (MANUAL QUESTION CREATION MODE) */}
            {currentCreationType === 'manual' && (
                <div className='rounded-lg border bg-card p-4 space-y-4 shadow-sm border-primary/20'>
                    {/* Section Header */}
                    <div className='flex items-center justify-between border-b pb-2.5'>
                        <h3 className='font-bold text-sm text-primary uppercase tracking-wide'>CREATE QUESTIONS</h3>
                    </div>

                    {/* Row 1: Question Type */}
                    <div className='flex flex-wrap items-center gap-6 py-1'>
                        <span className='font-semibold text-xs text-muted-foreground w-28'>Question Type :</span>
                        <div className='flex items-center gap-8'>
                            <div className='flex items-center space-x-1.5'>
                                <Checkbox id='edit_qns_type_text' checked={qnsTextType} onCheckedChange={(val) => setQnsTextType(!!val)} />
                                <Label htmlFor='edit_qns_type_text' className='text-xs font-semibold cursor-pointer'>Text</Label>
                            </div>
                            <div className='flex items-center space-x-1.5'>
                                <Checkbox id='edit_qns_type_math' checked={qnsMathType} onCheckedChange={(val) => setQnsMathType(!!val)} />
                                <Label htmlFor='edit_qns_type_math' className='text-xs font-semibold cursor-pointer'>Math/Chem type</Label>
                            </div>
                            <div className='flex items-center space-x-1.5'>
                                <Checkbox id='edit_qns_type_chem' checked={qnsChemType} onCheckedChange={(val) => setQnsChemType(!!val)} />
                                <Label htmlFor='edit_qns_type_chem' className='text-xs font-semibold cursor-pointer'>Structural/Chemical Drawing</Label>
                            </div>
                        </div>
                    </div>

                    {/* Row 2: Question Textarea */}
                    <div className='flex flex-col sm:flex-row items-start gap-3'>
                        <Label htmlFor='edit_question_text_input' className='text-xs font-semibold w-28 pt-2 shrink-0'>
                            Question:<span className='text-destructive'>*</span>
                        </Label>
                        <Textarea
                            id='edit_question_text_input'
                            value={questionText}
                            onChange={(e) => setQuestionText(e.target.value)}
                            placeholder='Enter question...'
                            className='min-h-[90px] text-xs flex-1 border-gray-300 focus-visible:ring-primary'
                        />
                    </div>

                    {/* Row 3: Options & Marks */}
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-6 pl-[116px]'>
                        <div className='flex items-center gap-3'>
                            <Label htmlFor='edit_no_of_options_input' className='text-xs font-semibold shrink-0 w-24'>No.Of Options :</Label>
                            <InputText
                                id='edit_no_of_options_input'
                                type='number'
                                value={noOfOptions}
                                onChange={(e) => setNoOfOptions(e.target.value)}
                                placeholder='4'
                                className='h-8 text-xs max-w-[200px]'
                            />
                        </div>

                        <div className='flex items-center gap-3'>
                            <Label htmlFor='edit_no_of_marks_input' className='text-xs font-semibold shrink-0 w-24'>
                                No.Of Marks : <span className='text-destructive'>*</span>
                            </Label>
                            <InputText
                                id='edit_no_of_marks_input'
                                type='number'
                                value={noOfMarks}
                                onChange={(e) => setNoOfMarks(e.target.value)}
                                placeholder='Enter marks'
                                className='h-8 text-xs max-w-[200px]'
                            />
                        </div>
                    </div>

                    {/* Row 4: Split Layout - Left Controls vs Right File Table */}
                    <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2 border-t'>
                        {/* Left Controls */}
                        <div className='space-y-4'>
                            {/* Subjective Box */}
                            <div className='flex items-start gap-3'>
                                <div className='flex items-center space-x-1.5 shrink-0 pt-2 w-32'>
                                    <Checkbox id='edit_chk_subjective' checked={isSubjective} onCheckedChange={(val) => setIsSubjective(!!val)} />
                                    <Label htmlFor='edit_chk_subjective' className='font-bold text-xs cursor-pointer'>Subjective Type</Label>
                                </div>
                                <Textarea
                                    value={correctAnswerText}
                                    onChange={(e) => setCorrectAnswerText(e.target.value)}
                                    placeholder='Correct Answer'
                                    disabled={!isSubjective}
                                    className='min-h-[85px] text-xs flex-1 bg-muted/20'
                                />
                            </div>

                            {/* Match The Following Box */}
                            <div className='space-y-2'>
                                <div className='flex items-center space-x-1.5'>
                                    <Checkbox id='edit_chk_match_following' checked={isMatchTheFollowing} onCheckedChange={(val) => setIsMatchTheFollowing(!!val)} />
                                    <Label htmlFor='edit_chk_match_following' className='font-bold text-xs cursor-pointer'>Match The Following</Label>
                                </div>
                                {isMatchTheFollowing && (
                                    <div className='pl-6 max-w-sm'>
                                        <Table className='border text-xs rounded overflow-hidden'>
                                            <TableHeader className='bg-primary text-primary-foreground'>
                                                <TableRow className='h-7 hover:bg-primary'>
                                                    <TableHead className='text-primary-foreground text-xs text-center font-bold h-7 py-1'>No.Of Rows</TableHead>
                                                    <TableHead className='text-primary-foreground text-xs text-center font-bold h-7 py-1'>No.Of Columns</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                <TableRow className='h-8'>
                                                    <TableCell className='p-1'>
                                                        <InputText type='number' value={mfRows} onChange={(e) => setMfRows(e.target.value)} className='h-7 text-xs text-center' />
                                                    </TableCell>
                                                    <TableCell className='p-1'>
                                                        <InputText type='number' value={mfCols} onChange={(e) => setMfCols(e.target.value)} className='h-7 text-xs text-center' />
                                                    </TableCell>
                                                </TableRow>
                                            </TableBody>
                                        </Table>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right Side: File Attachments Table */}
                        <div className='space-y-2'>
                            <div className='rounded border overflow-hidden'>
                                <Table className='text-xs'>
                                    <TableHeader className='bg-primary text-primary-foreground'>
                                        <TableRow className='h-7 hover:bg-primary'>
                                            <TableHead className='w-12 text-primary-foreground text-xs text-center font-bold h-7 py-1'>Sl.No</TableHead>
                                            <TableHead className='text-primary-foreground text-xs text-center font-bold h-7 py-1'>File</TableHead>
                                            <TableHead className='w-16 text-primary-foreground text-xs text-center font-bold h-7 py-1'>View</TableHead>
                                            <TableHead className='w-20 text-primary-foreground text-xs text-center font-bold h-7 py-1'>Preview</TableHead>
                                            <TableHead className='w-14 text-primary-foreground text-xs text-center font-bold h-7 py-1'>
                                                <Button type='button' variant='ghost' size='icon' onClick={addFileRow} className='!w-auto h-5 w-5 text-primary-foreground hover:bg-primary/90 p-0'>
                                                    <Plus className='h-3.5 w-3.5' />
                                                </Button>
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {fileRows.map((fRow, fIdx) => (
                                            <TableRow key={fRow.id} className='h-8'>
                                                <TableCell className='text-center font-medium text-xs py-1'>{fIdx + 1}</TableCell>
                                                <TableCell className='py-1 text-center'>
                                                    <label className='cursor-pointer inline-flex items-center px-3 py-1 bg-primary text-primary-foreground text-xs font-semibold rounded hover:bg-primary/90 shadow-xs'>
                                                        Browse
                                                        <input
                                                            type='file'
                                                            className='hidden'
                                                            onChange={(e) => {
                                                                const file = e.target.files?.[0] || null;
                                                                setFileRows((prev) =>
                                                                    prev.map((r, i) => (i === fIdx ? { ...r, file, name: file?.name || '' } : r))
                                                                );
                                                            }}
                                                        />
                                                    </label>
                                                </TableCell>
                                                <TableCell className='text-center py-1'>
                                                    <Button type='button' variant='ghost' size='icon' disabled={!fRow.file} className='!w-auto h-6 w-6 p-0'>
                                                        <Eye className='h-3.5 w-3.5 text-primary' />
                                                    </Button>
                                                </TableCell>
                                                <TableCell className='text-center text-xs text-muted-foreground py-1 truncate max-w-[90px]'>
                                                    {fRow.name || ''}
                                                </TableCell>
                                                <TableCell className='text-center py-1'>
                                                    <Button
                                                        type='button'
                                                        variant='ghost'
                                                        size='icon'
                                                        onClick={() => removeFileRow(fIdx)}
                                                        className='!w-auto h-6 w-6 text-destructive hover:bg-destructive/10 p-0'>
                                                        <Trash2 className='h-3.5 w-3.5' />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    </div>

                    {/* Centered Compact ADD QUESTIONS Button */}
                    <div className='flex justify-center pt-3 border-t'>
                        <Button
                            type='button'
                            size='sm'
                            onClick={handleAddQuestionToExam}
                            className='!w-auto gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs px-6 h-8 shadow-sm rounded-full'>
                            <ShoppingCart className='h-3.5 w-3.5' /> ADD QUESTIONS
                        </Button>
                    </div>

                    {/* Created Questions List Table */}
                    {createdQuestionsList.length > 0 && (
                        <div className='space-y-2 pt-3 border-t'>
                            <h4 className='font-bold text-xs text-primary'>Added Questions ({createdQuestionsList.length})</h4>
                            <div className='rounded border overflow-x-auto'>
                                <Table>
                                    <TableHeader>
                                        <TableRow className='bg-muted/60 h-8'>
                                            <TableHead className='w-10 text-xs py-1'>#</TableHead>
                                            <TableHead className='text-xs py-1'>Question</TableHead>
                                            <TableHead className='w-20 text-center text-xs py-1'>Marks</TableHead>
                                            <TableHead className='w-20 text-center text-xs py-1'>Options</TableHead>
                                            <TableHead className='w-14 text-center text-xs py-1'>Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {createdQuestionsList.map((q, idx) => (
                                            <TableRow key={q.id} className='h-8'>
                                                <TableCell className='font-medium text-xs py-1'>{idx + 1}</TableCell>
                                                <TableCell className='font-semibold text-primary text-xs py-1'>{q.question}</TableCell>
                                                <TableCell className='text-center font-medium text-xs py-1'>{q.marks}</TableCell>
                                                <TableCell className='text-center font-medium text-xs py-1'>{q.noOfOptions}</TableCell>
                                                <TableCell className='text-center py-1'>
                                                    <Button
                                                        type='button'
                                                        variant='ghost'
                                                        size='icon'
                                                        onClick={() => removeCreatedQuestion(q.id)}
                                                        className='!w-auto h-6 w-6 text-destructive hover:bg-destructive/10 p-0'>
                                                        <Trash2 className='h-3.5 w-3.5' />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* QUESTIONS FILTRATION SECTION (QUESTIONS FROM QUESTION BANK MODE) */}
            {currentCreationType === 'question_bank' && (
                <div className='rounded-lg border bg-card p-4 space-y-4 shadow-sm border-primary/20'>
                    {/* Section Header */}
                    <div className='flex items-center justify-between border-b pb-2.5'>
                        <h3 className='font-bold text-sm text-primary uppercase tracking-wide'>QUESTIONS FILTRATION</h3>
                    </div>

                    {/* Inner Card Container */}
                    <div className='rounded-md border p-4 space-y-4 bg-muted/10'>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                            {/* Left Side: Manual & Searchable Topics Box */}
                            <div className='space-y-3'>
                                <div className='flex items-start gap-3'>
                                    <Label className='text-xs font-semibold shrink-0 pt-1.5 w-16'>
                                        Topics : <span className='text-destructive'>*</span>
                                    </Label>
                                    <div className='flex-1 rounded-md border bg-background p-2 space-y-2 max-h-40 overflow-y-auto border-gray-300'>
                                        {/* Input to type manual topic or filter */}
                                        <div className='flex gap-1.5'>
                                            <InputText
                                                placeholder='Search or Type Topic Here...'
                                                value={topicSearch}
                                                onChange={(e) => setTopicSearch(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        if (topicSearch.trim() && !customTopics.includes(topicSearch.trim())) {
                                                            setCustomTopics((prev) => [...prev, topicSearch.trim()]);
                                                            setTopicSearch('');
                                                        }
                                                    }
                                                }}
                                                className='h-7 text-xs border-gray-300 flex-1'
                                            />
                                            {topicSearch.trim() && (
                                                <Button
                                                    type='button'
                                                    size='sm'
                                                    onClick={() => {
                                                        if (topicSearch.trim() && !customTopics.includes(topicSearch.trim())) {
                                                            setCustomTopics((prev) => [...prev, topicSearch.trim()]);
                                                            setTopicSearch('');
                                                        }
                                                    }}
                                                    className='!w-auto h-7 text-xs px-2.5 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shrink-0'>
                                                    + Add
                                                </Button>
                                            )}
                                        </div>
                                        <div className='space-y-1 pt-1'>
                                            {(() => {
                                                const backendTopicNames = (topics || []).map((top: any, idx: number) => {
                                                    return top.lpmoeT_TopicName || top.LPMOET_TopicName || top.topicName || top.topic_name || top.name || top.topic || top.LPMOEQB_Topic || top.lpmoeqB_Topic || (typeof top === 'string' ? top : `Topic ${idx + 1}`);
                                                }).filter(Boolean);
                                                const combinedTopics = Array.from(new Set([...backendTopicNames, ...customTopics]));
                                                const filtered = combinedTopics.filter((t) => t.toLowerCase().includes(topicSearch.toLowerCase()));
                                                
                                                if (filtered.length === 0) {
                                                    return <p className='text-[11px] text-muted-foreground italic p-1'>No topics found</p>;
                                                }
                                                return filtered.map((topic, i) => (
                                                    <div key={i} className='flex items-center space-x-2 hover:bg-muted/30 p-0.5 rounded'>
                                                        <Checkbox id={`edit_topic_${i}`} />
                                                        <Label htmlFor={`edit_topic_${i}`} className='text-xs font-normal cursor-pointer flex-1'>{topic}</Label>
                                                    </div>
                                                ));
                                            })()}
                                        </div>
                                    </div>
                                </div>

                                <div className='flex items-center space-x-2 pl-20'>
                                    <Checkbox id='edit_chk_qb_subjective' checked={qbSubjective} onCheckedChange={(val) => setQbSubjective(!!val)} />
                                    <Label htmlFor='edit_chk_qb_subjective' className='text-xs font-semibold cursor-pointer'>Subjective Questions</Label>
                                </div>
                            </div>

                            {/* Right Side: Header Totals & Complexities Dropdown */}
                            <div className='space-y-2 text-xs font-semibold text-muted-foreground'>
                                <div className='flex items-center justify-between border-b pb-1'>
                                    <span>Header Total Question Selected :</span>
                                    <span className='text-primary font-bold'>0</span>
                                </div>
                                <div className='flex items-center justify-between border-b pb-1'>
                                    <span>Header Total Questions Selected Marks :</span>
                                    <span className='text-primary font-bold'>0</span>
                                </div>
                                <div className='flex items-center justify-between border-b pb-1'>
                                    <span>Total Question Added :</span>
                                    <span className='text-primary font-bold'>0</span>
                                </div>
                                <div className='flex items-center justify-between border-b pb-1'>
                                    <span>Total Marks Added:</span>
                                    <span className='text-primary font-bold'>0</span>
                                </div>
                                <div className='flex items-center justify-between pt-2'>
                                    <Label className='text-xs font-semibold'>Complexities :</Label>
                                    <ComplexityMultiPicker
                                        selected={selectedComplexities}
                                        onChange={setSelectedComplexities}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Centered ADD EXAM Button */}
                    <div className='flex justify-center pt-2 border-t'>
                        <Button
                            type='button'
                            size='sm'
                            className='!w-auto gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs px-6 h-8 shadow-sm rounded-full'>
                            <ShoppingCart className='h-3.5 w-3.5' /> ADD EXAM
                        </Button>
                    </div>
                </div>
            )}

            {/* Form Action Buttons (Compact size='sm' h-8) */}
            <div className='flex justify-end gap-3 border-t pt-3'>
                <Button type='button' variant='outline' size='sm' onClick={onCancel} disabled={isSubmitting} className='!w-auto h-8 text-xs px-5 rounded-full'>
                    Cancel
                </Button>
                <Button type='submit' size='sm' disabled={isSubmitting} className='!w-auto bg-orange-600 hover:bg-orange-700 text-white h-8 text-xs px-6 font-semibold rounded-full'>
                    {isSubmitting ? 'Updating...' : 'Update Exam Question Paper'}
                </Button>
            </div>
        </form>
    );
}

// Interactive Multi-Select Complexity Picker Component matching Screenshot #2
function ComplexityMultiPicker({
    selected,
    onChange
}: {
    selected: string[];
    onChange: (val: string[]) => void;
}) {
    const [open, setOpen] = useState(false);
    const [filterText, setFilterText] = useState('');

    const options = ['Easy', 'Medium', 'Hard', 'Very Hard', 'Expert'];
    const filtered = options.filter((o) => o.toLowerCase().includes(filterText.toLowerCase()));

    const toggleOption = (opt: string) => {
        if (selected.includes(opt)) {
            onChange(selected.filter((item) => item !== opt));
        } else {
            onChange([...selected, opt]);
        }
    };

    const checkAll = () => onChange([...options]);
    const uncheckAll = () => onChange([]);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant='outline'
                    type='button'
                    className='h-8 text-xs w-52 justify-between border-gray-300 font-normal px-3 bg-background'>
                    <span className='truncate'>
                        {selected.length === 0
                            ? 'Select Complexity'
                            : selected.length === options.length
                            ? 'All Complexities'
                            : selected.join(', ')}
                    </span>
                    <ChevronDown className='h-3.5 w-3.5 opacity-50 shrink-0 ml-1' />
                </Button>
            </PopoverTrigger>
            <PopoverContent className='w-60 p-2.5 shadow-lg border rounded-md space-y-2' align='start'>
                {/* Filter stuff.. input with X icon */}
                <div className='relative'>
                    <InputText
                        placeholder='Filter stuff..'
                        value={filterText}
                        onChange={(e) => setFilterText(e.target.value)}
                        className='h-7 text-xs pr-6 border-gray-300'
                    />
                    {filterText && (
                        <button
                            type='button'
                            onClick={() => setFilterText('')}
                            className='absolute right-2 top-1.5 text-muted-foreground hover:text-foreground text-xs'>
                            ✕
                        </button>
                    )}
                </div>

                {/* Check all | Uncheck all links */}
                <div className='flex items-center gap-3 text-xs border-b pb-1 px-1'>
                    <button type='button' onClick={checkAll} className='text-primary hover:underline font-semibold text-[11px]'>
                        Check all
                    </button>
                    <button type='button' onClick={uncheckAll} className='text-primary hover:underline font-semibold text-[11px]'>
                        Uncheck all
                    </button>
                </div>

                {/* Checkbox List */}
                <div className='max-h-36 overflow-y-auto space-y-1.5 pt-1 pr-1'>
                    {filtered.length === 0 ? (
                        <p className='text-xs text-muted-foreground text-center py-2'>No complexity matches</p>
                    ) : (
                        filtered.map((opt) => {
                            const isChecked = selected.includes(opt);
                            return (
                                <div key={opt} className='flex items-center space-x-2 px-1 hover:bg-muted/40 rounded py-0.5'>
                                    <Checkbox
                                        id={`edit_comp_${opt}`}
                                        checked={isChecked}
                                        onCheckedChange={() => toggleOption(opt)}
                                    />
                                    <Label htmlFor={`edit_comp_${opt}`} className='text-xs font-normal cursor-pointer flex-1'>
                                        {opt}
                                    </Label>
                                </div>
                            );
                        })
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
}
