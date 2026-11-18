'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { InputTextarea } from '@/components/ui/extension/input-textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMasterQuestion, useQuestionOptions, useSaveMasterQuestion } from '@/hooks/exam/online-exam/useMasters';
import { masterQuestionSchema } from '@/schemas/exam/online-exam/masters';
import type { IComplexityDropdown, IMasterQuestionList, ISubjectDropdown } from '@/types/exam/online-exam/masters';
import { zodResolver } from '@hookform/resolvers/zod';
import { Beaker, Eye, Languages, Plus, Save, Trash2, Upload, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

const ALPHABETS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

interface IOptionRow {
    LPMOEQOA_Id?: number;
    LPMOEQOA_Option: string;
    LPMOEQOA_OptionCode: string;
    LPMOEQOA_AnswerFlag: boolean;
    LPMOEQOA_Marks?: number;
    files: { fileName: string; filePath: string; fileType?: string }[];
}

type FormFields = z.infer<typeof masterQuestionSchema>;

interface UpdateMasterQuestionFormProps {
    rowData: IMasterQuestionList;
    subjects?: ISubjectDropdown[];
    complexities?: IComplexityDropdown[];
    classes?: any[];
    topics?: any[];
    onSuccess?: () => void;
    onCancel?: () => void;
}

export default function UpdateMasterQuestionForm({
    rowData,
    subjects = [],
    complexities = [],
    classes = [],
    topics = [],
    onSuccess,
    onCancel
}: UpdateMasterQuestionFormProps) {
    const { refetch } = useMasterQuestion(undefined, { enabled: false });
    const saveMutation = useSaveMasterQuestion();
    const qId = rowData.lmsmoeQ_Id || (rowData as any).lpmoeQ_Id;
    const { data: fetchedOptions } = useQuestionOptions(qId ? Number(qId) : null);

    const [fileList, setFileList] = useState<{ fileName: string; filePath: string; fileType: string }[]>([]);
    const [previewFile, setPreviewFile] = useState<{ fileName: string; filePath: string } | null>(null);
    const [classSearch, setClassSearch] = useState('');
    const [options, setOptions] = useState<IOptionRow[]>([]);

    const initialClassIds = (rowData as any).classIds || 
        (rowData.classList && rowData.classList.length > 0 ? rowData.classList.map((c) => c.asmcL_Id) : []) ||
        (rowData.asmcL_Id ? [rowData.asmcL_Id] : []);

    const {
        register,
        handleSubmit,
        reset,
        control,
        watch,
        setValue,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(masterQuestionSchema),
        defaultValues: {
            lmsmoeQ_Id: rowData.lmsmoeQ_Id,
            ismS_Id: rowData.ismS_Id,
            topic_Id: (rowData as any).topic_Id || (rowData as any).lpmT_Id || undefined,
            lmsmoeQ_Question: rowData.lmsmoeQ_Question,
            lmsmoeQ_QuestionDesc: rowData.lmsmoeQ_QuestionDesc || '',
            lmsmoeQ_Marks: rowData.lmsmoeQ_Marks || 1,
            lmsmoecX_Id: rowData.lmsmoecX_Id || 1,
            lmsmoeQ_NoOfOptions: (rowData as any).countoption || (rowData as any).lmsmoeQ_NoOfOptions || 2,
            options: [],
            classIds: initialClassIds,
            isTextType: true,
            isMathChemType: false,
            isStructuralType: false,
            subjectiveFlg: (rowData as any).subjectiveFlg || false,
            matchTheFollowingFlg: (rowData as any).matchTheFollowingFlg || false,
            noOfRows: (rowData as any).noOfRows || undefined,
            noOfColumns: (rowData as any).noOfColumns || undefined
        },
        mode: 'onChange'
    });

    // Populate rowData on mount / change
    useEffect(() => {
        if (rowData) {
            const currentQId = rowData.lmsmoeQ_Id || (rowData as any).lpmoeQ_Id;
            const currentClassIds = (rowData as any).classIds || 
                (rowData.classList && rowData.classList.length > 0 ? rowData.classList.map((c) => c.asmcL_Id) : []) ||
                (rowData.asmcL_Id ? [rowData.asmcL_Id] : []);

            let rawFiles = (rowData as any).questionFiles || (rowData as any).tempfilesDTO || (rowData as any).files || [];
            if (!Array.isArray(rawFiles) || rawFiles.length === 0) {
                try {
                    const saved = typeof window !== 'undefined' ? localStorage.getItem(`question_files_${currentQId}`) : null;
                    if (saved) rawFiles = JSON.parse(saved);
                } catch (_) {}
            }

            if (Array.isArray(rawFiles) && rawFiles.length > 0) {
                setFileList(
                    rawFiles.map((f: any) => ({
                        fileName: f.fileName || f.lmsmoeqF_FileName || f.LPMOEQF_FileName || f.lpmOEQF_FileName || 'Question File',
                        filePath: f.filePath || f.lmsmoeqF_FilePath || f.LPMOEQF_FilePath || f.lpmOEQF_FilePath || '',
                        fileType: f.fileType || f.filetype || 'doc'
                    }))
                );
            } else {
                setFileList([]);
            }

            let currentTopicId = (rowData as any).topic_Id || (rowData as any).lpmT_Id || (rowData as any).LPMT_Id || undefined;
            if (!currentTopicId || currentTopicId === 0) {
                try {
                    const savedTopic = typeof window !== 'undefined' ? localStorage.getItem(`question_topic_${currentQId}`) : null;
                    if (savedTopic) currentTopicId = Number(savedTopic);
                } catch (_) {}
            }

            reset({
                lmsmoeQ_Id: rowData.lmsmoeQ_Id,
                ismS_Id: rowData.ismS_Id,
                topic_Id: currentTopicId && currentTopicId > 0 ? Number(currentTopicId) : undefined,
                lmsmoeQ_Question: rowData.lmsmoeQ_Question,
                lmsmoeQ_QuestionDesc: rowData.lmsmoeQ_QuestionDesc || '',
                lmsmoeQ_Marks: rowData.lmsmoeQ_Marks || 1,
                lmsmoecX_Id: rowData.lmsmoecX_Id || 1,
                lmsmoeQ_NoOfOptions: (rowData as any).countoption || (rowData as any).lmsmoeQ_NoOfOptions || 2,
                options: [],
                classIds: currentClassIds,
                isTextType: true,
                isMathChemType: false,
                isStructuralType: false,
                subjectiveFlg: (rowData as any).subjectiveFlg || false,
                subjectiveAnswer: (rowData as any).subjectiveAnswer || '',
                matchTheFollowingFlg: (rowData as any).matchTheFollowingFlg || false,
                noOfRows: (rowData as any).noOfRows || undefined,
                noOfColumns: (rowData as any).noOfColumns || undefined
            });
        }
    }, [rowData, reset]);

    // Load options from server or rowData
    useEffect(() => {
        const rawOptions = (fetchedOptions && Array.isArray(fetchedOptions) && fetchedOptions.length > 0)
            ? fetchedOptions
            : (rowData.questionOptions && rowData.questionOptions.length > 0)
            ? rowData.questionOptions
            : (rowData as any).tempoptionsDTO;

        if (Array.isArray(rawOptions) && rawOptions.length > 0) {
            setOptions(
                rawOptions.map((opt: any, idx: number) => ({
                    LPMOEQOA_Id: Number(opt.lmsmoeqoA_Id || opt.LPMOEQOA_Id || 0),
                    LPMOEQOA_Option: opt.lmsmoeqoA_Option || opt.LPMOEQOA_Option || ALPHABETS[idx] || `Option ${idx + 1}`,
                    LPMOEQOA_OptionCode: opt.lmsmoeqoA_OptionCode || opt.LPMOEQOA_OptionCode || '',
                    LPMOEQOA_AnswerFlag: Boolean(opt.lmsmoeqoA_AnswerFlag ?? opt.LPMOEQOA_AnswerFlag ?? false),
                    LPMOEQOA_Marks: Number(opt.lmsmoeqoA_Marks || opt.LPMOEQOA_Marks || 1),
                    files: opt.files || opt.tempoptionsfiles || []
                }))
            );
            setValue('lmsmoeQ_NoOfOptions', rawOptions.length);
        }
    }, [fetchedOptions, rowData, setValue]);

    const isSubjective = watch('subjectiveFlg');
    const isMatchFollowing = watch('matchTheFollowingFlg');
    const classIds = watch('classIds') || [];
    const selectedSubjectId = watch('ismS_Id');
    const noOfOptionsWatch = watch('lmsmoeQ_NoOfOptions');

    // Dynamically adjust options count when No.Of Options is modified
    useEffect(() => {
        if (isSubjective || isMatchFollowing) {
            setOptions([]);
            return;
        }

        const count = Number(noOfOptionsWatch);
        if (isNaN(count) || count <= 0) {
            setOptions([]);
            return;
        }

        const safeCount = Math.min(Math.max(count, 0), 26);
        setOptions((prev) => {
            if (prev.length === safeCount) return prev;
            if (safeCount > prev.length) {
                const added: IOptionRow[] = [];
                for (let i = prev.length; i < safeCount; i++) {
                    added.push({
                        LPMOEQOA_Id: 0,
                        LPMOEQOA_Option: ALPHABETS[i] || `Option ${i + 1}`,
                        LPMOEQOA_OptionCode: '',
                        LPMOEQOA_AnswerFlag: false,
                        LPMOEQOA_Marks: 1,
                        files: []
                    });
                }
                return [...prev, ...added];
            } else {
                return prev.slice(0, safeCount);
            }
        });
    }, [noOfOptionsWatch, isSubjective, isMatchFollowing]);

    const filteredClasses = classes.filter((c: any) => {
        const name = c.asmcL_ClassName ?? c.className ?? c.name ?? '';
        return name.toLowerCase().includes(classSearch.toLowerCase());
    });

    const topicList = Array.isArray(topics) ? topics : (topics as any)?.$values || [];
    const filteredTopics = topicList.filter((t: any) => {
        if (!selectedSubjectId) return true;
        const subId = Number(t.ismS_Id ?? t.isms_Id ?? t.ISMS_Id ?? 0);
        return subId === 0 || subId === Number(selectedSubjectId);
    });

    const displayTopics = filteredTopics.length > 0 ? filteredTopics : topicList;

    const handleClassToggle = (id: number) => {
        if (classIds.includes(id)) {
            setValue('classIds', classIds.filter((cid) => cid !== id), { shouldValidate: true });
        } else {
            setValue('classIds', [...classIds, id], { shouldValidate: true });
        }
    };

    const handleAddFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const objectUrl = URL.createObjectURL(file);
            setFileList((prev) => [
                ...prev,
                {
                    fileName: file.name,
                    filePath: objectUrl,
                    fileType: file.name.split('.').pop() || 'doc'
                }
            ]);
            toast.success(`File "${file.name}" attached successfully`);
        }
        e.target.value = '';
    };

    const handleViewFile = (file: { fileName: string; filePath: string }) => {
        if (!file.filePath) {
            toast.error('File URL is not available');
            return;
        }
        window.open(file.filePath, '_blank');
    };

    const handlePreviewFile = (file: { fileName: string; filePath: string }) => {
        if (!file.filePath) {
            toast.error('File URL is not available');
            return;
        }
        setPreviewFile(file);
    };

    const handleRemoveFile = (index: number) => {
        setFileList((prev) => prev.filter((_, i) => i !== index));
    };

    const handleOptionTextChange = (index: number, field: 'LPMOEQOA_Option' | 'LPMOEQOA_OptionCode', value: string) => {
        setOptions((prev) =>
            prev.map((opt, i) => (i === index ? { ...opt, [field]: value } : opt))
        );
    };

    const handleToggleCorrectAnswer = (index: number) => {
        setOptions((prev) =>
            prev.map((opt, i) => ({
                ...opt,
                LPMOEQOA_AnswerFlag: i === index ? !opt.LPMOEQOA_AnswerFlag : false
            }))
        );
    };

    const handleOptionFileUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const objectUrl = URL.createObjectURL(file);
            setOptions((prev) =>
                prev.map((opt, i) => {
                    if (i !== index) return opt;
                    return {
                        ...opt,
                        files: [
                            ...(opt.files || []),
                            {
                                fileName: file.name,
                                filePath: objectUrl,
                                fileType: file.name.split('.').pop() || 'doc'
                            }
                        ]
                    };
                })
            );
            toast.success(`File attached to Option ${options[index]?.LPMOEQOA_Option || index + 1}`);
        }
        e.target.value = '';
    };

    const handleRemoveOptionFile = (optIndex: number, fileIndex: number) => {
        setOptions((prev) =>
            prev.map((opt, i) => {
                if (i !== optIndex) return opt;
                return {
                    ...opt,
                    files: (opt.files || []).filter((_, fi) => fi !== fileIndex)
                };
            })
        );
    };

    const onSubmit = async (data: FormFields) => {
        try {
            if (!data.subjectiveFlg && !data.matchTheFollowingFlg) {
                const numOpts = Number(data.lmsmoeQ_NoOfOptions || options.length);
                if (!numOpts || numOpts < 2) {
                    toast.error('Please configure at least 2 options for the question.');
                    return;
                }
                if (options.length === 0) {
                    toast.error('Question options are required. Please configure options.');
                    return;
                }
                const emptyAnswerIdx = options.findIndex((o) => !o.LPMOEQOA_OptionCode || o.LPMOEQOA_OptionCode.trim() === '');
                if (emptyAnswerIdx !== -1) {
                    toast.error(`Please enter answer text for Option ${options[emptyAnswerIdx].LPMOEQOA_Option || emptyAnswerIdx + 1}`);
                    return;
                }
                const hasCorrect = options.some((o) => o.LPMOEQOA_AnswerFlag);
                if (!hasCorrect) {
                    toast.error('Kindly select one Correct Answer flag');
                    return;
                }
            }

            const mappedOptions = options.map((opt, idx) => ({
                LPMOEQOA_Id: Number(opt.LPMOEQOA_Id || 0),
                lmsmoeqoA_Id: Number(opt.LPMOEQOA_Id || 0),
                LPMOEQOA_Option: opt.LPMOEQOA_Option?.trim() || ALPHABETS[idx] || `Option ${idx + 1}`,
                lmsmoeqoA_Option: opt.LPMOEQOA_Option?.trim() || ALPHABETS[idx] || `Option ${idx + 1}`,
                LPMOEQOA_OptionCode: opt.LPMOEQOA_OptionCode?.trim() || '',
                lmsmoeqoA_OptionCode: opt.LPMOEQOA_OptionCode?.trim() || '',
                LPMOEQOA_AnswerFlag: Boolean(opt.LPMOEQOA_AnswerFlag),
                lmsmoeqoA_AnswerFlag: Boolean(opt.LPMOEQOA_AnswerFlag),
                LPMOEQOA_Marks: Number(opt.LPMOEQOA_Marks || 1),
                lmsmoeqoA_Marks: Number(opt.LPMOEQOA_Marks || 1),
                LPMOEQOA_Order: idx + 1,
                tempoptionsfiles: (opt.files || []).map((f) => ({
                    lpmoeqoaF_FileName: f.fileName,
                    lpmoeqoaF_FilePath: f.filePath,
                    fileName: f.fileName,
                    filePath: f.filePath
                })),
                files: opt.files || []
            }));

            const payload = {
                MI_Id: 30,
                LPMOEQ_Id: rowData.lmsmoeQ_Id || (rowData as any).lpmoeQ_Id,
                ISMS_Id: Number(data.ismS_Id),
                LPMT_Id: data.topic_Id ? Number(data.topic_Id) : 16,
                LPMOEQ_Question: data.lmsmoeQ_Question.trim(),
                LPMOEQ_QuestionDesc: data.lmsmoeQ_QuestionDesc?.trim() || '',
                LPMOEQ_Marks: Number(data.lmsmoeQ_Marks),
                LPMCOMP_Id: data.lmsmoecX_Id ? Number(data.lmsmoecX_Id) : 1,

                QuestionType: data.isTextType ? 'Text' : data.isMathChemType ? 'Math/Chem' : 'Structural',
                LPMOEQ_SubjectiveFlg: data.subjectiveFlg,
                LPMOEEXQNS_SubjectiveFlg: data.subjectiveFlg,
                LPMOEQ_Answer: data.subjectiveAnswer || '',
                LPMOEQ_MatchTheFollowingFlg: data.matchTheFollowingFlg,
                LPMOEEXQNS_MatchTheFollowingFlg: data.matchTheFollowingFlg,
                LPMOEQ_NoOfOptions: !data.subjectiveFlg && !data.matchTheFollowingFlg ? (data.lmsmoeQ_NoOfOptions || options.length) : 0,
                LPMOEEXQNS_NoOfOptions: !data.subjectiveFlg && !data.matchTheFollowingFlg ? (data.lmsmoeQ_NoOfOptions || options.length) : 0,
                LPMOEQ_MFRowCount: data.noOfRows || 0,
                LPMOEEXQNS_NoOfRows: data.noOfRows || 0,
                LPMOEQ_MFColumnCount: data.noOfColumns || 0,
                LPMOEEXQNS_NoOfColumns: data.noOfColumns || 0,
                classIds: data.classIds,
                classlist: (data.classIds || []).map((id) => ({ ASMCL_Id: id })),
                selectedClassList: data.classIds,

                questionFiles: fileList,
                tempfilesDTO: fileList.map((f) => ({
                    LPMOEQF_FileName: f.fileName,
                    LPMOEQF_FilePath: f.filePath,
                    fileName: f.fileName,
                    filePath: f.filePath
                })),
                questionOptions: mappedOptions,
                tempoptionsDTO: mappedOptions
            };

            const response = await saveMutation.mutateAsync(payload);

            if (response?.success !== false && !response?.error) {
                rowData.ismS_Id = Number(data.ismS_Id);
                rowData.lmsmoeQ_Question = data.lmsmoeQ_Question.trim();
                rowData.lmsmoeQ_QuestionDesc = data.lmsmoeQ_QuestionDesc?.trim() || '';
                rowData.lmsmoeQ_Marks = Number(data.lmsmoeQ_Marks);
                rowData.lmsmoecX_Id = data.lmsmoecX_Id ? Number(data.lmsmoecX_Id) : 1;
                const currentQId = rowData.lmsmoeQ_Id || (rowData as any).lpmoeQ_Id;
                if (currentQId) {
                    try {
                        if (data.topic_Id) {
                            localStorage.setItem(`question_topic_${currentQId}`, String(data.topic_Id));
                        }
                        if (fileList && fileList.length > 0) {
                            localStorage.setItem(`question_files_${currentQId}`, JSON.stringify(fileList));
                        }
                    } catch (_) {}
                }

                (rowData as any).topic_Id = data.topic_Id;
                (rowData as any).lpmT_Id = data.topic_Id;
                (rowData as any).LPMT_Id = data.topic_Id;
                (rowData as any).questionFiles = fileList;
                (rowData as any).questionOptions = mappedOptions;

                toast.success('Question updated successfully!');
                if (onSuccess) onSuccess();
                refetch();
            } else {
                toast.error(response?.message || 'Failed to update question');
            }
        } catch (error: any) {
            toast.error(error?.message || 'Failed to update question');
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className='rounded border bg-white shadow-sm text-sm overflow-hidden'>
            {/* Header */}
            <div className='flex items-center justify-between border-b px-4 py-2 bg-primary/5'>
                <h2 className='font-bold text-primary uppercase tracking-wide text-xs'>Update Master Question</h2>
                <div className='flex gap-2'>
                    <Button type='button' className='bg-primary hover:bg-primary/90 h-7 text-xs rounded-full px-3 gap-1.5 shadow-sm text-primary-foreground font-semibold'>
                        <Beaker className='w-3 h-3' /> Chemical Drawing
                    </Button>
                    <Button type='button' className='bg-primary hover:bg-primary/90 h-7 text-xs rounded-full px-3 gap-1.5 shadow-sm text-primary-foreground font-semibold'>
                        <Languages className='w-3 h-3' /> Language Translator
                    </Button>
                </div>
            </div>

            <div className='p-4 space-y-4'>
                {/* Top Section: Class & Subject/Topic */}
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    {/* Class Select Box */}
                    <div className='flex gap-2'>
                        <Label className='font-medium mt-1 whitespace-nowrap text-xs w-28'>
                            Class:<span className='text-red-500'>*</span>
                        </Label>
                        <div className='flex-1 border border-gray-300 rounded-sm flex flex-col h-40 overflow-hidden bg-background'>
                            <div className='p-1 border-b border-gray-300 bg-muted/20'>
                                <input
                                    type='text'
                                    placeholder='search here...'
                                    value={classSearch}
                                    onChange={(e) => setClassSearch(e.target.value)}
                                    className='w-full px-2 py-1 text-xs border border-gray-300 rounded-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-muted-foreground text-foreground bg-background'
                                />
                            </div>
                            <div className='flex-1 overflow-y-auto p-1'>
                                {filteredClasses.map((c: any, index: number) => {
                                    const id = c.asmcL_Id ?? c.id ?? index;
                                    const name = c.asmcL_ClassName ?? c.className ?? c.name;
                                    const isChecked = classIds.includes(id);
                                    return (
                                        <div key={`edit-cls-${id}-${index}`} className='flex items-center gap-2 p-1 hover:bg-primary/10 cursor-pointer text-xs rounded-xs' onClick={() => handleClassToggle(id)}>
                                            <input type="checkbox" checked={isChecked} onChange={() => {}} className='h-3 w-3 rounded-sm border-gray-300 text-primary focus:ring-primary' />
                                            <span className='text-foreground'>{name}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Subject & Topic Dropdowns */}
                    <div className='space-y-3'>
                        <div className='flex items-center gap-2'>
                            <Label htmlFor='edit_ismS_Id' className='font-medium w-24 text-xs'>
                                Subject:<span className='text-red-500'>*</span>
                            </Label>
                            <div className='flex-1'>
                                <Controller
                                    name='ismS_Id'
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            value={field.value ? field.value.toString() : ''}
                                            onValueChange={(val) => field.onChange(Number(val))}>
                                            <SelectTrigger id='edit_ismS_Id' className='h-8 text-xs border-gray-300 bg-background'>
                                                <SelectValue placeholder='Select Subject' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {(Array.isArray(subjects) ? subjects : (subjects as any)?.$values || [])?.map((sub: any, index: number) => {
                                                    const id = sub.ismS_Id ?? sub.isms_Id ?? sub.ISMS_Id ?? sub.id ?? index;
                                                    const name = sub.ismS_SubjectName ?? sub.isms_SubjectName ?? sub.ISMS_SubjectName ?? sub.subjectName ?? sub.name;
                                                    return (
                                                        <SelectItem key={`edit-sub-${id}-${index}`} value={id.toString()} className='text-xs'>
                                                            {name}
                                                        </SelectItem>
                                                    );
                                                })}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {errors.ismS_Id && <p className='text-destructive text-[10px] mt-0.5'>{errors.ismS_Id.message}</p>}
                            </div>
                        </div>
                        <div className='flex items-center gap-2'>
                            <Label htmlFor='edit_topic_Id' className='font-medium w-24 text-xs'>
                                Topic:<span className='text-red-500'>*</span>
                            </Label>
                            <div className='flex-1'>
                                <Controller
                                    name='topic_Id'
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            value={field.value ? field.value.toString() : ''}
                                            onValueChange={(val) => field.onChange(Number(val))}>
                                            <SelectTrigger id='edit_topic_Id' className='h-8 text-xs border-gray-300 bg-background'>
                                                <SelectValue placeholder='Select Topic' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {displayTopics?.map((t: any, index: number) => {
                                                    const id = t.topic_Id ?? t.lpmT_Id ?? t.LPMT_Id ?? t.id ?? index;
                                                    const name = t.topic_Name ?? t.lpmT_TopicName ?? t.LPMT_TopicName ?? t.name;
                                                    return (
                                                        <SelectItem key={`edit-top-${id}-${index}`} value={id.toString()} className='text-xs'>
                                                            {name}
                                                        </SelectItem>
                                                    );
                                                })}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Question Type Checkboxes */}
                <div className='flex items-start gap-2 pt-2'>
                    <Label className='font-medium w-28 text-xs pt-1'>Question Type</Label>
                    <div className='flex flex-col gap-1.5 text-xs text-gray-700'>
                        <label className='flex items-center gap-2 cursor-pointer'>
                            <input type='checkbox' {...register('isTextType')} className='h-3.5 w-3.5 rounded-sm border-gray-300 text-primary' /> Text
                        </label>
                        <label className='flex items-center gap-2 cursor-pointer'>
                            <input type='checkbox' {...register('isMathChemType')} className='h-3.5 w-3.5 rounded-sm border-gray-300 text-primary' /> Math/Chem type
                        </label>
                        <label className='flex items-center gap-2 cursor-pointer'>
                            <input type='checkbox' {...register('isStructuralType')} className='h-3.5 w-3.5 rounded-sm border-gray-300 text-primary' /> Structural/Chemical Drawing
                        </label>
                    </div>
                </div>

                {/* Question */}
                <div className='flex gap-2 pt-2'>
                    <Label className='font-medium w-28 text-xs pt-2'>
                        Question:<span className='text-red-500'>*</span>
                    </Label>
                    <div className='flex-1'>
                        <InputTextarea
                            {...register('lmsmoeQ_Question')}
                            className='min-h-[70px] border border-gray-300 focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary rounded-sm bg-background text-foreground'
                        />
                        {errors.lmsmoeQ_Question && <p className='text-destructive text-[10px] mt-0.5'>{errors.lmsmoeQ_Question.message}</p>}
                    </div>
                </div>

                {/* Bottom Two-Column Layout */}
                <div className='grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-4 pt-2'>
                    {/* LEFT COLUMN */}
                    <div className='space-y-4'>
                        {/* Question Description */}
                        <div className='flex gap-2'>
                            <Label className='font-medium w-36 text-xs pt-2 whitespace-nowrap'>Question Description:</Label>
                            <div className='flex-1'>
                                <InputTextarea
                                    {...register('lmsmoeQ_QuestionDesc')}
                                    className='min-h-[70px] border border-gray-300 focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary rounded-sm bg-background text-foreground'
                                />
                            </div>
                        </div>

                        {/* Subjective Type */}
                        <div className='flex items-start gap-2'>
                            <div className='w-36 flex items-center gap-2 pt-1 text-xs font-medium whitespace-nowrap'>
                                <input
                                    type='checkbox'
                                    id='edit_subjectiveFlg'
                                    {...register('subjectiveFlg')}
                                    onChange={(e) => {
                                        setValue('subjectiveFlg', e.target.checked);
                                        if (e.target.checked) {
                                            setValue('matchTheFollowingFlg', false);
                                            setValue('lmsmoeQ_NoOfOptions', 0);
                                        } else {
                                            setValue('lmsmoeQ_NoOfOptions', 2);
                                        }
                                    }}
                                    className='h-3.5 w-3.5 rounded-sm border-gray-300 text-primary focus:ring-primary cursor-pointer'
                                />
                                <Label htmlFor='edit_subjectiveFlg' className='cursor-pointer'>Subjective Type:</Label>
                            </div>
                            <div className='flex-1'>
                                {isSubjective ? (
                                    <InputTextarea
                                        {...register('subjectiveAnswer')}
                                        placeholder='Enter subjective answer / details...'
                                        className='min-h-[70px] border border-gray-300 focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary rounded-sm bg-background text-xs text-foreground'
                                    />
                                ) : (
                                    <div className='bg-muted/30 border border-gray-300 rounded-sm min-h-[70px] p-2 text-xs text-muted-foreground select-none'>
                                        Check Subjective Type to enter answer text
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Match The Following Type */}
                        <div className='flex items-start gap-2'>
                            <div className='w-36 flex items-start gap-2 pt-1 text-xs font-medium'>
                                <input
                                    type='checkbox'
                                    id='edit_matchTheFollowingFlg'
                                    {...register('matchTheFollowingFlg')}
                                    onChange={(e) => {
                                        setValue('matchTheFollowingFlg', e.target.checked);
                                        if (e.target.checked) {
                                            setValue('subjectiveFlg', false);
                                            setValue('lmsmoeQ_NoOfOptions', 0);
                                        } else {
                                            setValue('lmsmoeQ_NoOfOptions', 2);
                                        }
                                    }}
                                    className='h-3.5 w-3.5 mt-0.5 rounded-sm border-gray-300 text-primary focus:ring-primary cursor-pointer'
                                />
                                <Label htmlFor='edit_matchTheFollowingFlg' className='leading-tight cursor-pointer'>Match The Following <br/> Type :</Label>
                            </div>
                            <div className='flex-1'>
                                {isMatchFollowing ? (
                                    <div className='w-full border border-gray-300 rounded-sm overflow-hidden text-xs text-center'>
                                        <div className='grid grid-cols-2 bg-primary text-primary-foreground font-semibold text-[11px]'>
                                            <div className='py-1.5 border-r border-primary-foreground/20'>No.Of Rows</div>
                                            <div className='py-1.5'>No.Of Columns</div>
                                        </div>
                                        <div className='grid grid-cols-2 p-1.5 gap-2'>
                                            <input type='number' {...register('noOfRows', { valueAsNumber: true })} placeholder='Enter No.Of Rows' className='border border-gray-300 px-2 py-1.5 w-full bg-background focus:outline-none focus:border-primary text-center placeholder:text-[10px]' />
                                            <input type='number' {...register('noOfColumns', { valueAsNumber: true })} placeholder='Enter No.Of Columns' className='border border-gray-300 px-2 py-1.5 w-full bg-background focus:outline-none focus:border-primary text-center placeholder:text-[10px]' />
                                        </div>
                                    </div>
                                ) : (
                                    <div className='w-full border border-gray-300 rounded-sm overflow-hidden text-xs text-center'>
                                        <div className='grid grid-cols-2 bg-primary text-primary-foreground font-semibold text-[11px]'>
                                            <div className='py-1.5 border-r border-primary-foreground/20'>No.Of Rows</div>
                                            <div className='py-1.5'>No.Of Columns</div>
                                        </div>
                                        <div className='grid grid-cols-2 p-1.5 gap-2 opacity-50 pointer-events-none'>
                                            <input type='text' placeholder='Enter No.Of Rows' className='border border-gray-300 px-2 py-1.5 w-full bg-gray-100 text-center placeholder:text-[10px]' disabled />
                                            <input type='text' placeholder='Enter No.Of Columns' className='border border-gray-300 px-2 py-1.5 w-full bg-gray-100 text-center placeholder:text-[10px]' disabled />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN */}
                    <div className='space-y-4'>
                        {/* Complexities, Options, Marks */}
                        <div className='space-y-2'>
                            <div className='flex items-center gap-2'>
                                <Label className='font-medium w-36 text-xs text-gray-700 whitespace-nowrap'>Complexities Type:<span className='text-red-500'>*</span></Label>
                                <div className='flex-1'>
                                    <Controller
                                        name='lmsmoecX_Id'
                                        control={control}
                                        render={({ field }) => (
                                            <Select
                                                value={field.value ? field.value.toString() : ''}
                                                onValueChange={(val) => field.onChange(Number(val))}>
                                                <SelectTrigger className='h-8 text-xs border-gray-300 bg-background'>
                                                    <SelectValue placeholder='--Select--' />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {(Array.isArray(complexities) ? complexities : (complexities as any)?.$values || [])?.map((comp: any, index: number) => {
                                                        const id = comp.lmsmoecX_Id ?? comp.lpmcomP_Id ?? comp.lpmcomp_Id ?? comp.LPMCOMP_Id ?? comp.id ?? index;
                                                        const name = comp.lmsmoecX_ComplexityName ?? comp.lpmcomP_ComplexityName ?? comp.lpmcomp_ComplexityName ?? comp.LPMCOMP_ComplexityName ?? comp.name;
                                                        return (
                                                            <SelectItem key={`edit-comp-${id}-${index}`} value={id.toString()} className='text-xs'>
                                                                {name}
                                                            </SelectItem>
                                                        );
                                                    })}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                </div>
                            </div>

                            <div className='flex items-center gap-2'>
                                <Label className='font-medium w-36 text-xs text-gray-700 whitespace-nowrap'>
                                    No.Of Options:<span className='text-red-500'>*</span>
                                </Label>
                                <input
                                    type='number'
                                    min={1}
                                    max={26}
                                    disabled={isSubjective || isMatchFollowing}
                                    {...register('lmsmoeQ_NoOfOptions', { valueAsNumber: true })}
                                    className={`flex-1 border border-gray-300 rounded-sm px-2 py-1.5 text-xs focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-foreground bg-background shadow-xs ${
                                        isSubjective || isMatchFollowing ? 'opacity-50 cursor-not-allowed bg-muted/40' : ''
                                    }`}
                                />
                            </div>

                            <div className='flex items-center gap-2'>
                                <Label className='font-medium w-36 text-xs text-gray-700 whitespace-nowrap'>
                                    No.Of Marks:<span className='text-red-500'>*</span>
                                </Label>
                                <input
                                    type='number'
                                    {...register('lmsmoeQ_Marks', { valueAsNumber: true })}
                                    className='flex-1 border border-gray-300 rounded-sm px-2 py-1.5 text-xs focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-foreground bg-background shadow-xs'
                                />
                            </div>
                        </div>

                        {/* File Upload Grid */}
                        <div className='border border-primary/20 rounded-sm overflow-hidden text-xs text-center mt-4'>
                            <div className='grid grid-cols-12 bg-primary text-primary-foreground font-bold py-1.5 text-[11px] uppercase'>
                                <div className='col-span-1 border-r border-primary/30'>Sl.No</div>
                                <div className='col-span-4 border-r border-primary/30'>File</div>
                                <div className='col-span-2 border-r border-primary/30'>View</div>
                                <div className='col-span-4 border-r border-primary/30'>Preview</div>
                                <div className='col-span-1'>Action</div>
                            </div>
                            
                            {fileList.length > 0 ? (
                                fileList.map((file, idx) => (
                                    <div key={idx} className='grid grid-cols-12 border-t border-muted items-center py-1.5'>
                                        <div className='col-span-1 font-medium'>{idx + 1}</div>
                                        <div className='col-span-4 border-x border-muted px-2 text-left truncate text-foreground'>{file.fileName}</div>
                                        <div onClick={() => handleViewFile(file)} className='col-span-2 border-r border-muted text-primary hover:underline cursor-pointer font-medium'>View</div>
                                        <div onClick={() => handlePreviewFile(file)} className='col-span-4 border-r border-muted text-primary hover:underline cursor-pointer font-medium'>Preview</div>
                                        <div className='col-span-1 flex justify-center'>
                                            <Button type='button' variant='ghost' size='sm' onClick={() => handleRemoveFile(idx)} className='h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50'>
                                                <Trash2 className='h-3.5 w-3.5' />
                                            </Button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className='grid grid-cols-12 border-t border-muted items-center py-1.5 bg-white'>
                                    <div className='col-span-1 text-gray-500'>1</div>
                                    <div className='col-span-4 border-x border-muted px-2 flex justify-center'>
                                        <label className='cursor-pointer flex items-center justify-center w-full h-6 bg-primary text-primary-foreground rounded-sm font-semibold text-[10px] hover:bg-primary/90 mx-auto shadow-sm'>
                                            Browse
                                            <input type='file' className='hidden' onChange={handleAddFile} />
                                        </label>
                                    </div>
                                    <div className='col-span-2 border-r border-muted'></div>
                                    <div className='col-span-4 border-r border-muted'></div>
                                    <div className='col-span-1 flex justify-center'>
                                        <label className='cursor-pointer flex items-center justify-center h-6 w-6 text-primary font-bold hover:bg-primary/10 rounded-sm'>
                                            +
                                            <input type='file' className='hidden' onChange={handleAddFile} />
                                        </label>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* QUESTION OPTION MAPPING GRID VIEW */}
                {!isSubjective && !isMatchFollowing && options.length > 0 && (
                    <div className='border border-primary/30 rounded-sm overflow-hidden bg-white shadow-xs mt-6'>
                        {/* Header Box */}
                        <div className='bg-primary/5 border-b border-primary/15 px-4 py-2 flex items-center justify-between'>
                            <h3 className='font-bold text-primary text-xs uppercase tracking-wider'>
                                QUESTION OPTION MAPPING
                            </h3>
                            <span className='text-[11px] text-muted-foreground font-medium'>
                                {options.length} {options.length === 1 ? 'Option' : 'Options'}
                            </span>
                        </div>

                        {/* Table */}
                        <div className='overflow-x-auto'>
                            <table className='w-full text-xs text-center border-collapse'>
                                <thead>
                                    <tr className='bg-primary text-primary-foreground font-bold text-[11px] uppercase tracking-wider'>
                                        <th className='py-2 px-3 border-r border-primary-foreground/20 w-16'>SL NO</th>
                                        <th className='py-2 px-3 border-r border-primary-foreground/20 w-36'>Answer Option</th>
                                        <th className='py-2 px-3 border-r border-primary-foreground/20 text-center'>Answer</th>
                                        <th className='py-2 px-3 border-r border-primary-foreground/20 w-32'>Correct Answer</th>
                                        <th className='py-2 px-3 w-44'>Upload Files</th>
                                    </tr>
                                </thead>
                                <tbody className='divide-y divide-gray-200'>
                                    {options.map((opt, idx) => (
                                        <tr key={idx} className='hover:bg-primary/5 transition-colors'>
                                            {/* SL NO */}
                                            <td className='py-3 px-3 font-semibold text-gray-700 border-r border-gray-200'>
                                                {idx + 1}
                                            </td>

                                            {/* Answer Option */}
                                            <td className='py-3 px-3 border-r border-gray-200'>
                                                <input
                                                    type='text'
                                                    value={opt.LPMOEQOA_Option}
                                                    onChange={(e) => handleOptionTextChange(idx, 'LPMOEQOA_Option', e.target.value)}
                                                    placeholder={ALPHABETS[idx] || `Option ${idx + 1}`}
                                                    className='w-full text-center font-bold text-xs py-1.5 px-2 border border-gray-300 rounded-sm bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary shadow-2xs'
                                                />
                                            </td>

                                            {/* Answer Text */}
                                            <td className='py-3 px-3 border-r border-gray-200 text-left'>
                                                <textarea
                                                    rows={3}
                                                    value={opt.LPMOEQOA_OptionCode}
                                                    onChange={(e) => handleOptionTextChange(idx, 'LPMOEQOA_OptionCode', e.target.value)}
                                                    placeholder={`Enter Answer Option ${opt.LPMOEQOA_Option || idx + 1}...`}
                                                    className='w-full text-xs p-2 border border-gray-300 rounded-sm bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary resize-y shadow-2xs'
                                                />
                                            </td>

                                            {/* Correct Answer Checkbox */}
                                            <td className='py-3 px-3 border-r border-gray-200 text-center'>
                                                <label className='inline-flex items-center justify-center cursor-pointer'>
                                                    <input
                                                        type='checkbox'
                                                        checked={Boolean(opt.LPMOEQOA_AnswerFlag)}
                                                        onChange={() => handleToggleCorrectAnswer(idx)}
                                                        className='h-4 w-4 rounded-sm border-gray-300 text-primary focus:ring-primary cursor-pointer accent-primary'
                                                    />
                                                </label>
                                            </td>

                                            {/* Upload Files */}
                                            <td className='py-3 px-3 text-center align-middle'>
                                                <div className='flex flex-col items-center gap-1.5'>
                                                    <label className='cursor-pointer inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-primary hover:bg-primary/10 rounded-sm border border-primary/30 shadow-2xs transition-colors'>
                                                        <Upload className='w-3.5 h-3.5' />
                                                        <span>Upload</span>
                                                        <input
                                                            type='file'
                                                            className='hidden'
                                                            onChange={(e) => handleOptionFileUpload(idx, e)}
                                                        />
                                                    </label>

                                                    {/* Uploaded files for this option */}
                                                    {opt.files && opt.files.length > 0 && (
                                                        <div className='w-full space-y-1 mt-1'>
                                                            {opt.files.map((file, fIdx) => (
                                                                <div
                                                                    key={fIdx}
                                                                    className='flex items-center justify-between text-[11px] bg-primary/5 border border-primary/20 px-2 py-0.5 rounded-xs'>
                                                                    <span className='truncate max-w-[90px] text-gray-700' title={file.fileName}>
                                                                        {file.fileName}
                                                                    </span>
                                                                    <div className='flex items-center gap-1 shrink-0'>
                                                                        <button
                                                                            type='button'
                                                                            onClick={() => handlePreviewFile(file)}
                                                                            className='text-primary hover:text-primary/80'
                                                                            title='Preview File'>
                                                                            <Eye className='w-3 h-3' />
                                                                        </button>
                                                                        <button
                                                                            type='button'
                                                                            onClick={() => handleRemoveOptionFile(idx, fIdx)}
                                                                            className='text-destructive hover:text-destructive/80'
                                                                            title='Remove File'>
                                                                            <Trash2 className='w-3 h-3' />
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Actions (Centered matching new template style) */}
            <div className='flex items-center justify-center gap-3 px-4 py-3 border-t border-slate-200 bg-slate-50/50'>
                <Button
                    type='submit'
                    disabled={isSubmitting}
                    className='bg-primary hover:bg-primary/90 text-primary-foreground h-8 px-8 text-xs font-semibold rounded-full shadow-sm uppercase flex items-center gap-1.5 transition-all'>
                    <Save className='w-3.5 h-3.5' /> <span>SAVE</span>
                </Button>
                <Button
                    type='button'
                    onClick={onCancel}
                    disabled={isSubmitting}
                    className='bg-orange-600 hover:bg-orange-700 text-white h-8 px-8 text-xs font-semibold rounded-full shadow-sm uppercase flex items-center gap-1.5 transition-all'>
                    <X className='w-3.5 h-3.5' /> <span>CANCEL</span>
                </Button>
            </div>

            {/* File Preview Modal */}
            <FilePreviewModal file={previewFile} open={Boolean(previewFile)} onClose={() => setPreviewFile(null)} />
        </form>
    );
}

function FilePreviewModal({ file, open, onClose }: { file: { fileName: string; filePath: string } | null; open: boolean; onClose: () => void }) {
    if (!file) return null;
    const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(file.fileName || file.filePath);
    const isPdf = /\.(pdf)$/i.test(file.fileName || file.filePath);
    const isVideo = /\.(mp4|webm|ogg)$/i.test(file.fileName || file.filePath);

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className='max-w-4xl max-h-[90vh] flex flex-col'>
                <DialogHeader className='border-b pb-2'>
                    <DialogTitle className='font-bold text-sm text-primary truncate'>
                        File Preview: {file.fileName}
                    </DialogTitle>
                </DialogHeader>
                <div className='flex flex-1 items-center justify-center overflow-hidden rounded border bg-slate-50 p-4 min-h-[300px]'>
                    {isImage ? (
                        <img src={file.filePath} alt={file.fileName} className='max-h-[60vh] max-w-full object-contain rounded shadow-sm' />
                    ) : isPdf ? (
                        <iframe src={file.filePath} title={file.fileName} className='h-[60vh] w-full rounded border' />
                    ) : isVideo ? (
                        <video src={file.filePath} controls className='max-h-[60vh] max-w-full rounded' />
                    ) : (
                        <div className='text-center space-y-3 p-6'>
                            <p className='text-xs text-gray-600 font-medium'>No direct inline preview available for this file type.</p>
                            <Button
                                type='button'
                                onClick={() => window.open(file.filePath, '_blank')}
                                className='bg-primary hover:bg-primary/90 text-primary-foreground text-xs h-8 px-4 font-semibold'>
                                Open / Download File
                            </Button>
                        </div>
                    )}
                </div>
                <DialogFooter>
                    <Button type='button' variant='outline' size='sm' onClick={onClose} className='h-8 text-xs'>
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
