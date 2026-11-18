'use client';

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
import { type IHomeWork, homeWorkSchema } from '@/schemas/upload/transactions/ivrm-homework.schema';
import { uploadDocument } from '@/server/fees/trasactions/waived_off';
import { editHomeWork, fetchSections, fetchSubjects, saveHomeWork } from '@/server/upload/transactions/ivrm-homework/server-action';
import { zodResolver } from '@hookform/resolvers/zod';
import { format, parseISO } from 'date-fns';
import { CalendarIcon, Eye, Loader2, Minus, Plus, Save, Upload } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Controller, useFieldArray, useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';

interface UpdateHomeWorkFormProps {
    onSuccess: () => void;
    yearList: any[];
    classList: any[];
    selectedRow: any;
}

interface IHomeWorkForm extends IHomeWork {
    ihW_Attachment_Array: { ihW_FilePath: string; fileName: string }[];
}

export default function UpdateHomeWorkForm({ onSuccess, yearList, classList, selectedRow }: UpdateHomeWorkFormProps) {
    const [sections, setSections] = useState<any[]>([]);
    const [subjects, setSubjects] = useState<any[]>([]);
    const [showUrlSection, setShowUrlSection] = useState(false);
    const [isViewing, setIsViewing] = useState(false);
    const [viewingImage, setViewingImage] = useState<string | null>(null);
    const fileInputRefs = useRef<{ [key: number]: HTMLInputElement | null }>({});

    const methods = useForm<IHomeWorkForm>({
        resolver: zodResolver(homeWorkSchema.addOrUpdate),
        defaultValues: {
            ...selectedRow,
            ihW_Date: selectedRow.ihW_Date
                ? typeof selectedRow.ihW_Date === 'string'
                    ? parseISO(selectedRow.ihW_Date)
                    : selectedRow.ihW_Date
                : new Date(),
            ihW_FilePath_Array: [],
            ihW_Attachment_Array: []
        }
    });

    const {
        control,
        handleSubmit,
        formState: { isSubmitting },
        setValue,
        reset,
        getValues
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
        name: 'ihW_FilePath_Array'
    });

    const {
        fields: urlFields,
        append: appendUrl,
        remove: removeUrl
    } = useFieldArray({
        control,
        name: 'ihW_Attachment_Array'
    });

    // Fetch full record for editing
    useEffect(() => {
        if (selectedRow?.IHW_Id) {
            const loadFullRecord = async () => {
                const response: any = await editHomeWork(selectedRow.IHW_Id, selectedRow.ASMAY_Id);
                const editData = response?.data || response;

                if (editData && editData.editlist && editData.editlist.length > 0) {
                    const record = editData.editlist[0];
                    const attachments = editData.imgdata || editData.attachementlist || [];
                    const editSections = editData.editlist_section || [];

                    if (editData.sectionlist) {
                        setSections(editData.sectionlist);
                    }

                    const files = attachments
                        .filter((a: any) => {
                            const filePath = a.ihwatT_Attachment || a.ihW_FilePath || '';
                            const ext = filePath.split('.').pop()?.toLowerCase();
                            return ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'mp3', 'mp4', 'wmv'].includes(
                                ext || ''
                            );
                        })
                        .map((a: any) => ({
                            ihW_FilePath: a.ihwatT_Attachment || a.ihW_FilePath,
                            fileName: a.ihwatT_FileName || a.fileName
                        }));

                    const urls = attachments
                        .filter((a: any) => {
                            const filePath = a.ihwatT_Attachment || a.ihW_FilePath || '';
                            const ext = filePath.split('.').pop()?.toLowerCase();
                            return ![
                                'jpg',
                                'jpeg',
                                'png',
                                'pdf',
                                'doc',
                                'docx',
                                'xls',
                                'xlsx',
                                'ppt',
                                'pptx',
                                'mp3',
                                'mp4',
                                'wmv'
                            ].includes(ext || '');
                        })
                        .map((a: any) => ({
                            ihW_FilePath: a.ihwatT_Attachment || a.ihW_FilePath,
                            fileName: a.ihwatT_FileName || a.fileName
                        }));

                    if (urls.length > 0) setShowUrlSection(true);

                    reset({
                        ...record,
                        ihW_Date: new Date(record.ihW_Date),
                        hm_section_list: editSections.map((s: any) => ({ asmS_Id: s.asmS_Id })),
                        ihW_FilePath_Array: files.length > 0 ? files : [{ ihW_FilePath: '', fileName: '' }],
                        ihW_Attachment_Array: urls.length > 0 ? urls : [{ ihW_FilePath: '', fileName: '' }]
                    });
                }
            };
            loadFullRecord();
        }
    }, [selectedRow, reset]);

    useEffect(() => {
        if (selectedClass && selectedYear) {
            (async () => {
                try {
                    const result: any = await fetchSections(selectedClass, selectedYear);
                    setSections(result.data?.sectionlist || result.sectionlist || []);
                } catch {
                    toast.error('Failed to load sections');
                }
            })();
        }
    }, [selectedClass, selectedYear]);

    useEffect(() => {
        if (selectedClass && selectedYear && selectedSections?.length > 0) {
            (async () => {
                try {
                    const result: any = await fetchSubjects(selectedClass, selectedYear, selectedSections);
                    setSubjects(result.data?.subjectlist || result.subjectlist || []);
                } catch {
                    toast.error('Failed to load subjects');
                }
            })();
        }
    }, [selectedClass, selectedYear, selectedSections]);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 10 * 1024 * 1024) {
            toast.error('File size should not exceed 10MB');
            return;
        }

        try {
            updateFile(index, {
                ihW_FilePath: URL.createObjectURL(file),
                fileName: file.name,
                // @ts-ignore
                isUploading: true
            });

            const formData = new FormData();
            formData.append('file', file);
            formData.append('FileName', file.name);
            formData.append('ContentType', file.type);
            formData.append('subContainerName', 'ivrm_homework');

            const response = await uploadDocument(formData);

            if (response.success && response.data) {
                updateFile(index, {
                    ihW_FilePath: response.data,
                    fileName: file.name,
                    // @ts-ignore
                    isUploading: false
                });
                toast.success('File uploaded successfully');
            } else {
                throw new Error(response.message || 'Upload failed');
            }
        } catch (error: any) {
            updateFile(index, { ihW_FilePath: '', fileName: '', isUploading: false } as any);
            toast.error(`Upload failed: ${error.message}`);
        }
    };

    const onSubmit = async (data: IHomeWorkForm) => {
        try {
            const mergedAttachments = [
                ...(data.ihW_FilePath_Array?.filter((f) => f.ihW_FilePath && f.fileName) || []),
                ...(data.ihW_Attachment_Array?.filter((f) => f.ihW_FilePath) || [])
            ];

            const payload: IHomeWork = {
                ...data,
                ihW_FilePath_Array: mergedAttachments
            };

            const result = await saveHomeWork(payload);
            if (result.success) {
                toast.success(result.message || 'Record updated successfully');
                onSuccess();
            } else {
                toast.error(result.message || 'Failed to update');
            }
        } catch (error) {
            toast.error('An error occurred while saving');
        }
    };

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
                                    {yearList.map((year: any) => (
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
                                    {classList.map((cls: any) => (
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
                    name='ihW_Topic'
                    render={({ field, fieldState }) => (
                        <div>
                            <Label>
                                Topic <span className='text-red-500'>*</span>
                            </Label>
                            <Input {...field} value={field.value ?? ''} placeholder='Enter Topic' maxLength={50} />
                            {fieldState.error && <FormError>{fieldState.error.message}</FormError>}
                        </div>
                    )}
                />

                <Controller
                    control={control}
                    name='ihW_Date'
                    render={({ field, fieldState }) => (
                        <div className='flex flex-col'>
                            <Label>
                                H.W Date <span className='text-red-500'>*</span>
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
            </div>

            <div>
                <Label>Assignment</Label>
                <Controller
                    control={control}
                    name='ihW_Assignment'
                    render={({ field }) => <Textarea {...field} value={field.value || ''} placeholder='Enter Assignment' rows={3} />}
                />
            </div>

            <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                <Controller
                    control={control}
                    name='ihW_AssignmentNo'
                    render={({ field }) => (
                        <div>
                            <Label>Assignment No</Label>
                            <Input {...field} value={field.value ?? ''} placeholder='Enter Assignment Number' />
                        </div>
                    )}
                />
            </div>

            <div className='space-y-4 rounded-md border p-4'>
                <h3 className='font-semibold text-lg'>Attachments</h3>
                <div className='overflow-x-auto'>
                    <table className='w-full table-auto border-collapse border text-sm'>
                        <thead className='bg-muted'>
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
                                                    <Upload className='mr-2 h-4 w-4' />
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
                                            onClick={() => {
                                                const val = getValues(`ihW_Attachment_Array.${index}.ihW_FilePath`);
                                                if (val) window.open(val, '_blank');
                                            }}
                                            disabled={!item.ihW_FilePath}>
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
                                                    className='h-8 w-8'
                                                    onClick={() => appendFile({ ihW_FilePath: '', fileName: '' })}>
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
            </div>

            <div className='flex items-center space-x-2'>
                <Checkbox id='update-checklink' checked={showUrlSection} onCheckedChange={(c) => setShowUrlSection(c as boolean)} />
                <Label htmlFor='update-checklink'>If URL</Label>
            </div>

            {showUrlSection && (
                <div className='space-y-4 rounded-md border p-4'>
                    <h3 className='font-semibold text-lg'>URL Details</h3>
                    <div className='overflow-x-auto'>
                        <table className='w-full table-auto border-collapse border text-sm'>
                            <thead className='bg-muted'>
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
                                                name={`ihW_Attachment_Array.${index}.ihW_FilePath`}
                                                render={({ field }) => (
                                                    <Input {...field} value={field.value ?? ''} placeholder='Enter URL' className='h-9' />
                                                )}
                                            />
                                        </td>
                                        <td className='border p-2 text-center'>
                                            <Button
                                                type='button'
                                                variant='ghost'
                                                size='sm'
                                                onClick={() => {
                                                    const val = getValues(`ihW_Attachment_Array.${index}.ihW_FilePath`);
                                                    if (val) window.open(val, '_blank');
                                                }}
                                                disabled={!item.ihW_FilePath}>
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
                                                        className='h-8 w-8'
                                                        onClick={() => appendUrl({ ihW_FilePath: '', fileName: '' })}>
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

            <div className='flex justify-center pt-4'>
                <Button type='submit' className='bg-blue-600 hover:bg-blue-700' size='lg' isLoading={isSubmitting}>
                    {isSubmitting ? (
                        'Updating...'
                    ) : (
                        <>
                            <Save className='mr-2 h-4 w-4' /> Update Record
                        </>
                    )}
                </Button>
            </div>
        </form>
    );
}
