'use client';
// Modernized Classwork Form

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { CustomMultiSelectBox } from '@/components/ui/custom-multiselect';
import { FormError, Label } from '@/components/ui/extension/field';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { classWorkSchema } from '@/schemas/upload/transactions/ivrm-classwork.schema';
import { uploadDocument } from '@/server/fees/trasactions/waived_off';
import {
    fetchClasses,
    fetchInitialData,
    fetchSections,
    fetchSubjects,
    saveClassWork
} from '@/server/upload/transactions/ivrm-classwork/server-action';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { CalendarIcon, Eye, Loader2, Minus, Plus, Save, Upload } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Controller, useFieldArray, useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

type IClassWorkFormValues = z.infer<typeof classWorkSchema.addOrUpdate>;

interface AddClassWorkFormProps {
    onSuccess: () => void;
    initialData?: any;
}

export default function AddClassWorkForm({ onSuccess, initialData }: AddClassWorkFormProps) {
    const [years, setYears] = useState<any[]>([]);
    const [classes, setClasses] = useState<any[]>([]);
    const [sections, setSections] = useState<any[]>([]);
    const [subjects, setSubjects] = useState<any[]>([]);
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [showUrlSection, setShowUrlSection] = useState(false);
    const [hrmeId, setHrmeId] = useState<number>(0);
    const fileInputRefs = useRef<{ [key: number]: HTMLInputElement | null }>({});

    const methods = useForm<IClassWorkFormValues>({
        resolver: zodResolver(classWorkSchema.addOrUpdate),
        defaultValues: {
            asmaY_Id: initialData?.academicyear?.[0]?.asmaY_Id || 0,
            asmcL_Id: 0,
            ismS_Id: 0,
            icW_Topic: '',
            icW_SubTopic: '',
            icW_Content: '',
            icW_TeachingAid: 0,
            icW_Assignment: '',
            icW_Evaluation: '',
            icW_Attachment: '',
            hm_section_list: [],
            icW_FilePath_Array: [{ icW_FilePath: '', fileName: '' }],
            icW_Attachment_Array: [{ icW_FilePath: '', fileName: '' }],
            icW_FromDate: new Date(),
            icW_ToDate: new Date()
        }
    });

    const {
        control,
        handleSubmit,
        formState: { isSubmitting },
        setValue,
        reset
    } = methods;

    const selectedYear = useWatch({ control, name: 'asmaY_Id' });
    const selectedClass = useWatch({ control, name: 'asmcL_Id' });
    const selectedSections = useWatch({ control, name: 'hm_section_list' });

    const {
        fields: fileFields,
        append: appendFile,
        remove: removeFile,
        update: updateFile
    } = useFieldArray({
        control,
        name: 'icW_FilePath_Array'
    });

    const {
        fields: urlFields,
        append: appendUrl,
        remove: removeUrl
    } = useFieldArray({
        control,
        name: 'icW_Attachment_Array'
    });

    // Initial load
    useEffect(() => {
        if (initialData) {
            setYears(initialData.yearlist || []);
            if (initialData.academicyear?.length > 0) {
                setValue('asmaY_Id', initialData.academicyear[0].asmaY_Id);
            }
            setIsInitialLoading(false);
        } else {
            (async () => {
                try {
                    const response: any = await fetchInitialData();
                    if (response && response.success) {
                        setYears(response.data.yearlist || []);
                        if (response.data.academicyear?.length > 0) {
                            setValue('asmaY_Id', response.data.academicyear[0].asmaY_Id);
                        }
                        const h_id = response.data.hrmE_Id || response.data.HRME_Id || 0;
                        setHrmeId(h_id);
                    }
                } catch {
                    toast.error('Failed to load initial data');
                } finally {
                    setIsInitialLoading(false);
                }
            })();
        }
    }, [setValue, initialData]);

    // Year check -> fetch classes
    useEffect(() => {
        if (selectedYear) {
            (async () => {
                try {
                    const response: any = await fetchClasses(selectedYear, hrmeId);
                    setClasses(response.data?.classlist || response.classlist || []);
                } catch {
                    toast.error('Failed to load classes');
                }
            })();
        } else {
            setClasses([]);
        }
    }, [selectedYear]);

    // Class check -> fetch sections
    useEffect(() => {
        if (selectedYear && selectedClass) {
            (async () => {
                try {
                    const response: any = await fetchSections(selectedClass, selectedYear);
                    setSections(response.data?.sectionlist || response.sectionlist || []);
                } catch {
                    toast.error('Failed to load sections');
                }
            })();
        } else {
            setSections([]);
        }
    }, [selectedYear, selectedClass]);

    // Section check -> fetch subjects
    useEffect(() => {
        if (selectedClass && selectedYear && selectedSections?.length > 0) {
            (async () => {
                try {
                    const response: any = await fetchSubjects(selectedClass, selectedYear, selectedSections);
                    setSubjects(response.data?.subjectlist || response.subjectlist || []);
                } catch {
                    toast.error('Failed to load subjects');
                }
            })();
        } else {
            setSubjects([]);
        }
    }, [selectedClass, selectedYear, selectedSections]);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 30 * 1024 * 1024) {
            toast.error('File size should not exceed 30MB');
            return;
        }

        try {
            updateFile(index, {
                icW_FilePath: URL.createObjectURL(file),
                fileName: file.name,
                // @ts-ignore
                isUploading: true
            });

            const formData = new FormData();
            formData.append('file', file);
            formData.append('FileName', file.name);
            formData.append('ContentType', file.type);
            formData.append('subContainerName', 'ivrm_classwork');

            const response = await uploadDocument(formData);

            if (response.success && response.data) {
                updateFile(index, {
                    icW_FilePath: response.data,
                    fileName: file.name,
                    // @ts-ignore
                    isUploading: false
                });
                toast.success('File uploaded successfully');
            } else {
                throw new Error(response.message || 'Upload failed');
            }
        } catch (error: any) {
            updateFile(index, { icW_FilePath: '', fileName: '', isUploading: false } as any);
            toast.error(`Upload failed: ${error.message}`);
        }
    };

    const onSubmit = async (data: IClassWorkFormValues) => {
        try {
            const mergedAttachments = [
                ...(data.icW_FilePath_Array?.filter((f) => f.icW_FilePath && f.fileName) || []),
                ...(data.icW_Attachment_Array?.filter((f) => f.icW_FilePath) || [])
            ];

            const payload = {
                icW_Id: 0,
                asmaY_Id: data.asmaY_Id,
                ismS_Id: data.ismS_Id,
                asmcL_Id: data.asmcL_Id,
                icW_FromDate: data.icW_FromDate.toISOString(),
                icW_ToDate: data.icW_ToDate.toISOString(),
                icW_Topic: data.icW_Topic,
                icW_SubTopic: data.icW_SubTopic,
                icW_Content: data.icW_Content,
                icW_TeachingAid: data.icW_TeachingAid || 0,
                icW_Assignment: data.icW_Assignment || '',
                icW_Evaluation: data.icW_Evaluation || '',
                icW_Attachment: data.icW_Attachment || '',
                hm_section_list: data.hm_section_list.map((s: any) => ({
                    asmS_Id: s.asmS_Id,
                    asmC_SectionName: sections.find((sec) => sec.asmS_Id === s.asmS_Id)?.asmC_SectionName || ''
                })),
                icW_FilePath_Array: mergedAttachments.map((f: any) => ({
                    icW_FilePath: f.icW_FilePath,
                    fileName: f.fileName
                })),
                icW_ActiveFlag: true
            };

            const result = await saveClassWork(payload);
            if (result.success) {
                toast.success(result.message || 'ClassWork saved successfully');
                onSuccess();
            } else {
                toast.error(result.message || 'Failed to save');
            }
        } catch (error) {
            toast.error('An error occurred while saving');
        }
    };

    if (isInitialLoading) {
        return (
            <div className='flex items-center justify-center p-12'>
                <Loader2 className='h-8 w-8 animate-spin text-blue-600' />
                <span className='ml-3 font-medium text-lg'>Loading form details...</span>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-6 rounded-2xl bg-white p-6 shadow-md'>
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
                <Controller
                    control={control}
                    name='asmaY_Id'
                    render={({ field, fieldState }) => (
                        <div>
                            <Label>
                                Academic Year <span className='text-red-500'>*</span>
                            </Label>
                            <Select onValueChange={(val) => field.onChange(Number(val))} value={field.value?.toString()}>
                                <SelectTrigger>
                                    <SelectValue placeholder='Select Year' />
                                </SelectTrigger>
                                <SelectContent>
                                    {years.map((year: any) => (
                                        <SelectItem key={year.asmaY_Id} value={year.asmaY_Id.toString()}>
                                            {year.asmaY_Year}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                        </div>
                    )}
                />

                <Controller
                    control={control}
                    name='asmcL_Id'
                    render={({ field, fieldState }) => (
                        <div>
                            <Label>
                                Class <span className='text-red-500'>*</span>
                            </Label>
                            <Select onValueChange={(val) => field.onChange(Number(val))} value={field.value?.toString()}>
                                <SelectTrigger>
                                    <SelectValue placeholder='Select Class' />
                                </SelectTrigger>
                                <SelectContent>
                                    {classes.map((cls: any) => (
                                        <SelectItem key={cls.asmcL_Id} value={cls.asmcL_Id.toString()}>
                                            {cls.asmcL_ClassName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                        </div>
                    )}
                />

                <Controller
                    name='hm_section_list'
                    control={control}
                    render={({ field, fieldState }) => (
                        <div className='grow space-y-2'>
                            <CustomMultiSelectBox
                                label='Section'
                                isRequired
                                options={sections.map((s) => ({ label: s.asmC_SectionName, value: s.asmS_Id.toString() }))}
                                value={field.value?.map((v: any) => v.asmS_Id.toString()) || []}
                                onChange={(vals: string[]) => field.onChange(vals.map((v) => ({ asmS_Id: Number(v) })))}
                                disabled={!selectedClass}
                                error={fieldState.error?.message}
                            />
                        </div>
                    )}
                />

                <Controller
                    control={control}
                    name='ismS_Id'
                    render={({ field, fieldState }) => (
                        <div>
                            <Label>
                                Subject <span className='text-red-500'>*</span>
                            </Label>
                            <Select onValueChange={(val) => field.onChange(Number(val))} value={field.value?.toString()}>
                                <SelectTrigger>
                                    <SelectValue placeholder='Select Subject' />
                                </SelectTrigger>
                                <SelectContent>
                                    {subjects.map((sub: any) => (
                                        <SelectItem key={sub.ismS_Id} value={sub.ismS_Id.toString()}>
                                            {sub.ismS_SubjectName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                        </div>
                    )}
                />

                <Controller
                    control={control}
                    name='icW_Topic'
                    render={({ field, fieldState }) => (
                        <div>
                            <Label>
                                Topic <span className='text-red-500'>*</span>
                            </Label>
                            <Input {...field} placeholder='Enter Topic' />
                            {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                        </div>
                    )}
                />

                <Controller
                    control={control}
                    name='icW_SubTopic'
                    render={({ field, fieldState }) => (
                        <div>
                            <Label>
                                Sub Topic <span className='text-red-500'>*</span>
                            </Label>
                            <Input {...field} placeholder='Enter Sub Topic' />
                            {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                        </div>
                    )}
                />

                <Controller
                    control={control}
                    name='icW_TeachingAid'
                    render={({ field }) => (
                        <div className='flex items-center gap-3 pt-8'>
                            <Checkbox
                                id='teaching-aid'
                                checked={field.value === 1}
                                onCheckedChange={(checked) => field.onChange(checked ? 1 : 0)}
                            />
                            <Label htmlFor='teaching-aid' className='cursor-pointer font-bold text-sm uppercase'>
                                Teaching Aid
                            </Label>
                        </div>
                    )}
                />
            </div>

            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                <Controller
                    control={control}
                    name='icW_Assignment'
                    render={({ field }) => (
                        <div>
                            <Label>Assignment</Label>
                            <Input {...field} placeholder='Enter Assignment' />
                        </div>
                    )}
                />
                <Controller
                    control={control}
                    name='icW_Evaluation'
                    render={({ field }) => (
                        <div>
                            <Label>Evaluation</Label>
                            <Input {...field} placeholder='Enter Evaluation' />
                        </div>
                    )}
                />
            </div>

            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                <Controller
                    control={control}
                    name='icW_FromDate'
                    render={({ field, fieldState }) => (
                        <div className='flex flex-col'>
                            <Label>
                                Start Date <span className='text-red-500'>*</span>
                            </Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant='outline'
                                        className={cn('w-full pl-3 text-left font-normal', !field.value && 'text-muted-foreground')}>
                                        <CalendarIcon className='mr-2 h-4 w-4 opacity-50' />
                                        {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className='w-auto p-0' align='start'>
                                    <Calendar mode='single' selected={field.value} onSelect={field.onChange} initialFocus />
                                </PopoverContent>
                            </Popover>
                            {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                        </div>
                    )}
                />

                <Controller
                    control={control}
                    name='icW_ToDate'
                    render={({ field, fieldState }) => (
                        <div className='flex flex-col'>
                            <Label>
                                End Date <span className='text-red-500'>*</span>
                            </Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant='outline'
                                        className={cn('w-full pl-3 text-left font-normal', !field.value && 'text-muted-foreground')}>
                                        <CalendarIcon className='mr-2 h-4 w-4 opacity-50' />
                                        {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className='w-auto p-0' align='start'>
                                    <Calendar
                                        mode='single'
                                        selected={field.value}
                                        onSelect={field.onChange}
                                        initialFocus
                                        disabled={(date) => {
                                            const startDate = methods.getValues('icW_FromDate');
                                            return startDate ? date < startDate : false;
                                        }}
                                    />
                                </PopoverContent>
                            </Popover>
                            {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                        </div>
                    )}
                />
            </div>

            <div>
                <Label>
                    Content <span className='text-red-500'>*</span>
                </Label>
                <Controller
                    control={control}
                    name='icW_Content'
                    render={({ field, fieldState }) => (
                        <>
                            <Textarea {...field} placeholder='Enter Content' rows={3} />
                            {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                        </>
                    )}
                />
            </div>

            <div className='space-y-4 rounded-md border p-4'>
                <h3 className='font-semibold text-blue-700 text-lg'>Attachments</h3>
                <div className='overflow-x-auto'>
                    <table className='w-full table-auto border-collapse border text-sm'>
                        <thead className='bg-blue-50'>
                            <tr>
                                <th className='w-12 border p-2 text-center'>SL NO</th>
                                <th className='border p-2 text-center'>Upload File</th>
                                <th className='border p-2 text-center'>File Name</th>
                                <th className='w-16 border p-2 text-center'>View</th>
                                <th className='w-16 border p-2 text-center'>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {fileFields.map((item, index) => (
                                <tr key={item.id} className='border-b'>
                                    <td className='border p-2 text-center'>{index + 1}</td>
                                    <td className='border p-2'>
                                        <div className='flex justify-center'>
                                            <input
                                                ref={(el) => {
                                                    fileInputRefs.current[index] = el;
                                                }}
                                                type='file'
                                                className='hidden'
                                                onChange={(e) => handleFileUpload(e, index)}
                                            />
                                            <Button
                                                type='button'
                                                variant='outline'
                                                size='sm'
                                                onClick={() => fileInputRefs.current[index]?.click()}
                                                // @ts-ignore
                                                disabled={item.isUploading}
                                            >
                                                {/* @ts-ignore */}
                                                {item.isUploading ? (
                                                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                                ) : (
                                                    <Upload className='mr-2 h-4 w-4 text-blue-600' />
                                                )}
                                                Choose File
                                            </Button>
                                        </div>
                                    </td>
                                    <td className='border p-2'>
                                        <Input value={item.fileName || ''} readOnly disabled className='h-9 bg-muted text-xs' />
                                    </td>
                                    <td className='border p-2 text-center'>
                                        <Button
                                            type='button'
                                            variant='ghost'
                                            size='sm'
                                            onClick={() => item.icW_FilePath && window.open(item.icW_FilePath, '_blank')}
                                            disabled={!item.icW_FilePath}>
                                            <Eye className='h-4 w-4 text-blue-600' />
                                        </Button>
                                    </td>
                                    <td className='border p-2 text-center'>
                                        <div className='flex justify-center gap-1'>
                                            {fileFields.length > 1 && (
                                                <Button
                                                    type='button'
                                                    size='icon'
                                                    variant='destructive'
                                                    className='h-8 w-8'
                                                    onClick={() => removeFile(index)}>
                                                    <Minus className='h-4 w-4' />
                                                </Button>
                                            )}
                                            {index === fileFields.length - 1 && (
                                                <Button
                                                    type='button'
                                                    size='icon'
                                                    variant='outline'
                                                    className='h-8 w-8 text-blue-600'
                                                    onClick={() => appendFile({ icW_FilePath: '', fileName: '' })}>
                                                    <Plus className='h-4 w-4' />
                                                </Button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <p className='text-blue-600 text-xs italic'>
                    Accepted Formats: jpg, jpeg, png, doc, ppt, excel, mp3, mp4, wmv, pdf (Max 30MB)
                </p>
            </div>

            <div className='flex items-center space-x-2'>
                <Checkbox id='add-checklink-cw' checked={showUrlSection} onCheckedChange={(c) => setShowUrlSection(c as boolean)} />
                <Label htmlFor='add-checklink-cw'>If URL</Label>
            </div>

            {showUrlSection && (
                <div className='space-y-4 rounded-md border p-4'>
                    <h3 className='font-semibold text-blue-700 text-lg'>URL Details</h3>
                    <div className='overflow-x-auto'>
                        <table className='w-full table-auto border-collapse border text-sm'>
                            <thead className='bg-blue-50'>
                                <tr>
                                    <th className='w-12 border p-2 text-center'>SL NO</th>
                                    <th className='border p-2 text-center'>URL</th>
                                    <th className='w-16 border p-2 text-center'>View</th>
                                    <th className='w-16 border p-2 text-center'>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {urlFields.map((item, index) => (
                                    <tr key={item.id} className='border-b'>
                                        <td className='border p-2 text-center'>{index + 1}</td>
                                        <td className='border p-2'>
                                            <Controller
                                                control={control}
                                                name={`icW_Attachment_Array.${index}.icW_FilePath`}
                                                render={({ field }) => <Input {...field} placeholder='Enter URL' className='h-9' />}
                                            />
                                        </td>
                                        <td className='border p-2 text-center'>
                                            <Button
                                                type='button'
                                                variant='ghost'
                                                size='sm'
                                                onClick={() => item.icW_FilePath && window.open(item.icW_FilePath, '_blank')}
                                                disabled={!item.icW_FilePath}>
                                                <Eye className='h-4 w-4 text-blue-600' />
                                            </Button>
                                        </td>
                                        <td className='border p-2 text-center'>
                                            <div className='flex justify-center gap-1'>
                                                {index === urlFields.length - 1 && (
                                                    <Button
                                                        type='button'
                                                        size='icon'
                                                        variant='outline'
                                                        className='h-8 w-8 text-blue-600'
                                                        onClick={() => appendUrl({ icW_FilePath: '', fileName: '' })}>
                                                        <Plus className='h-4 w-4' />
                                                    </Button>
                                                )}
                                                {urlFields.length > 1 && (
                                                    <Button
                                                        type='button'
                                                        size='icon'
                                                        variant='destructive'
                                                        className='h-8 w-8'
                                                        onClick={() => removeUrl(index)}>
                                                        <Minus className='h-4 w-4' />
                                                    </Button>
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

            <div className='flex justify-center gap-4 border-t pt-4'>
                <Button type='button' variant='outline' size='lg' onClick={() => reset()} className='min-w-[120px]'>
                    Reset
                </Button>
                <Button type='submit' className='min-w-[150px] bg-blue-600 hover:bg-blue-700' size='lg' isLoading={isSubmitting}>
                    {isSubmitting ? (
                        'Saving...'
                    ) : (
                        <>
                            <Save className='mr-2 h-4 w-4' /> Save ClassWork
                        </>
                    )}
                </Button>
            </div>
        </form>
    );
}
