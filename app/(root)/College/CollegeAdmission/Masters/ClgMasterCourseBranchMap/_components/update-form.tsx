'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { FormError, Label } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useClgMasterCourseBranchMap, useEditClgMasterCourseBranchMap, useSaveClgMasterCourseBranchMap } from '@/hooks/college/useCollegeMasters';
import { clgMasterCourseBranchMapSchema } from '@/schemas/college/masters';
import { IClgMasterCourseBranchMap } from '@/types/college/masters';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save, Upload, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

type FormFields = z.infer<typeof clgMasterCourseBranchMapSchema.addOrUpdate>;

interface UpdateCourseBranchMapFormProps {
    selectedRow: IClgMasterCourseBranchMap;
    onSuccess?: () => void;
}

export default function UpdateCourseBranchMapForm({ selectedRow, onSuccess }: UpdateCourseBranchMapFormProps) {
    const { data: response, refetchAll } = useClgMasterCourseBranchMap();
    const { mutateAsync: saveMap } = useSaveClgMasterCourseBranchMap();
    const fileRef = useRef<HTMLInputElement>(null);

    const masterCourseList = response?.data?.masterCourseList || [];
    const masterBranchList = response?.data?.masterBranchList || response?.data?.masterbranchList || [];
    const masterSemesterList = response?.data?.masterSemesterList || response?.data?.mastersemesterlist || [];
    const cbcsYearList = response?.data?.cbcsYearList || response?.data?.cbcsyearlist || [];
    const electiveYearList = response?.data?.electiveYearList || response?.data?.electiveyearlist || [];

    const [fileName, setFileName] = useState<string>('');
    const [fileObj, setFileObj] = useState<File | null>(null);

    const {
        control,
        register,
        handleSubmit,
        watch,
        reset,
        setValue,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(clgMasterCourseBranchMapSchema.addOrUpdate),
        defaultValues: {
            amcobM_CBCSFlg: false,
            amcobM_ElectiveFlg: false,
            selectedSemesters: []
        },
        mode: 'onChange'
    });

    const { data: editResponse, isLoading: isEditLoading } = useEditClgMasterCourseBranchMap(selectedRow?.amcobM_Id ?? null);

    useEffect(() => {
        const editDataArray = editResponse?.data?.editdata || [];
        const editData = editDataArray.length > 0 ? editDataArray[0] : null;
        
        if (editData) {
            reset({
                amcO_Id: editData.amcO_Id?.toString() || selectedRow.amcO_Id?.toString() || '',
                amB_Id: editData.amB_Id?.toString() || selectedRow.amB_Id?.toString() || '',
                amcobM_Code: editData.amcobM_Code || selectedRow.amcobM_Code || '',
                amcobM_CBCSFlg: Boolean(editData.amcobM_CBCSFlg ?? selectedRow.amcobM_CBCSFlg),
                amcobM_CBCSIntroYear: editData.amcobM_CBCSIntroYear?.toString() || selectedRow.amcobM_CBCSIntroYear?.toString() || '',
                amcobM_ElectiveFlg: Boolean(editData.amcobM_ElectiveFlg ?? selectedRow.amcobM_ElectiveFlg),
                amcobM_ElectiveIntroYear: editData.amcobM_ElectiveIntroYear?.toString() || selectedRow.amcobM_ElectiveIntroYear?.toString() || '',
                selectedSemesters: editDataArray.map((s: any) => s.amsE_Id.toString())
            });
            setFileName(editData.amcobM_FileName || selectedRow.amcobM_FileName || '');
        } else if (selectedRow) {
            reset({
                amcO_Id: selectedRow.amcO_Id?.toString() || '',
                amB_Id: selectedRow.amB_Id?.toString() || '',
                amcobM_Code: selectedRow.amcobM_Code || '',
                amcobM_CBCSFlg: Boolean(selectedRow.amcobM_CBCSFlg),
                amcobM_CBCSIntroYear: selectedRow.amcobM_CBCSIntroYear?.toString() || '',
                amcobM_ElectiveFlg: Boolean(selectedRow.amcobM_ElectiveFlg),
                amcobM_ElectiveIntroYear: selectedRow.amcobM_ElectiveIntroYear?.toString() || '',
                selectedSemesters: []
            });
            setFileName(selectedRow.amcobM_FileName || '');
        }
    }, [editResponse, selectedRow, reset]);

    const cbcsFlag = watch('amcobM_CBCSFlg');
    const electiveFlag = watch('amcobM_ElectiveFlg');
    const selectedSemesters = watch('selectedSemesters') || [];

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.size > 2097152) {
                toast.error('File size should be less than 2MB');
                return;
            }
            setFileName(file.name);
            setFileObj(file);
        }
    };

    const removeFile = () => {
        setFileName('');
        setFileObj(null);
        if (fileRef.current) fileRef.current.value = '';
    };

    const handleSemesterChange = (id: string, checked: boolean) => {
        const current = selectedSemesters;
        if (checked) {
            setValue('selectedSemesters', [...current, id], { shouldValidate: true });
        } else {
            setValue('selectedSemesters', current.filter((s) => s !== id), { shouldValidate: true });
        }
    };

    const onSubmit: SubmitHandler<FormFields> = async (data: FormFields) => {
        try {
            const semester_list = data.selectedSemesters.map((idStr: string) => {
                const sem = masterSemesterList.find((s: any) => s.amsE_Id.toString() === idStr);
                return {
                    amsE_Id: Number(idStr),
                    amsE_SEMName: sem ? sem.amsE_SEMName : ''
                };
            });

            const payload = {
                amcobM_Id: selectedRow.amcobM_Id || 0,
                amcO_Id: Number(data.amcO_Id),
                amB_Id: Number(data.amB_Id),
                amcobM_Code: data.amcobM_Code || '',
                amcobM_CBCSFlg: Boolean(data.amcobM_CBCSFlg),
                amcobM_CBCSIntroYear: Number(data.amcobM_CBCSIntroYear) || 0,
                amcobM_ElectiveFlg: Boolean(data.amcobM_ElectiveFlg),
                amcobM_ElectiveIntroYear: Number(data.amcobM_ElectiveIntroYear) || 0,
                semester_list: semester_list,
                amcobM_FileName: fileName,
                amcobM_FilePath: ''
            };

            const res = await saveMap(payload);

            if (res.success || res.message?.toLowerCase()?.includes('success')) {
                toast.success(res.message || 'Record Updated Successfully');
                refetchAll();
                onSuccess?.();
            } else {
                toast.error(res.message || 'Failed to update record');
            }
        } catch (error: any) {
            toast.error(error.message || 'An error occurred while updating.');
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
            <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                {/* Course Name */}
                <div className='group flex flex-col gap-1.5'>
                    <Label isRequired>Course Name</Label>
                    <Controller
                        name='amcO_Id'
                        control={control}
                        render={({ field, fieldState }) => (
                            <>
                                <Select value={field.value} onValueChange={field.onChange}>
                                    <SelectTrigger className={fieldState.error ? 'border-destructive focus:ring-destructive/20' : 'transition-colors focus:ring-2 focus:ring-primary/20'}>
                                        <SelectValue placeholder='--Select--' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {masterCourseList.map((c: any) => (
                                            <SelectItem key={c.amcO_Id} value={c.amcO_Id.toString()}>{c.amcO_CourseName}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {fieldState.error?.message && <FormError>{fieldState.error.message}</FormError>}
                            </>
                        )}
                    />
                </div>

                {/* Branch Name */}
                <div className='group flex flex-col gap-1.5'>
                    <Label isRequired>Branch Name</Label>
                    <Controller
                        name='amB_Id'
                        control={control}
                        render={({ field, fieldState }) => (
                            <>
                                <Select value={field.value} onValueChange={field.onChange}>
                                    <SelectTrigger className={fieldState.error ? 'border-destructive focus:ring-destructive/20' : 'transition-colors focus:ring-2 focus:ring-primary/20'}>
                                        <SelectValue placeholder='--Select--' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {masterBranchList.map((b: any) => (
                                            <SelectItem key={b.amB_Id} value={b.amB_Id.toString()}>{b.amB_BranchName}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {fieldState.error?.message && <FormError>{fieldState.error.message}</FormError>}
                            </>
                        )}
                    />
                </div>

                {/* Course-Branch Code */}
                <InputText
                    label='Course-Branch Code'
                    id='amcobM_Code'
                    placeholder='Enter Course-Branch Code'
                    {...register('amcobM_Code')}
                    error={errors.amcobM_Code?.message}
                />

                {/* Semester Selection */}
                <div className='group flex flex-col gap-1.5'>
                    <Label isRequired>Semester Name</Label>
                    <div className={`max-h-40 overflow-y-auto rounded-md border p-3 space-y-2 ${errors.selectedSemesters ? 'border-destructive' : 'border-input'}`}>
                        {masterSemesterList.length === 0 && (
                            <span className='text-sm text-muted-foreground'>No semesters available</span>
                        )}
                        {masterSemesterList.map((sem: any) => (
                            <div key={sem.amsE_Id} className='flex items-center space-x-2'>
                                <Checkbox
                                    id={`upd-sem-${sem.amsE_Id}`}
                                    checked={selectedSemesters.includes(sem.amsE_Id.toString())}
                                    onCheckedChange={(c) => handleSemesterChange(sem.amsE_Id.toString(), c as boolean)}
                                />
                                <label htmlFor={`upd-sem-${sem.amsE_Id}`} className='font-normal cursor-pointer'>{sem.amsE_SEMName}</label>
                            </div>
                        ))}
                    </div>
                    {errors.selectedSemesters?.message && <FormError>{errors.selectedSemesters.message as string}</FormError>}
                </div>
            </div>

            {/* CBCS and Elective flags */}
            <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                <div className='space-y-4'>
                    <div className='flex items-center gap-3 rounded-md bg-muted/30 p-3'>
                        <Controller
                            name='amcobM_CBCSFlg'
                            control={control}
                            render={({ field }) => (
                                <Checkbox id='upd-amcobM_CBCSFlg' checked={field.value} onCheckedChange={field.onChange} />
                            )}
                        />
                        <label htmlFor='upd-amcobM_CBCSFlg' className='font-semibold cursor-pointer'>CBCS Flag</label>
                    </div>
                    {cbcsFlag && (
                        <div className='group flex flex-col gap-1.5'>
                            <Label isRequired>CBCS Intro Year</Label>
                            <Controller
                                name='amcobM_CBCSIntroYear'
                                control={control}
                                render={({ field, fieldState }) => (
                                    <>
                                        <Select value={field.value} onValueChange={field.onChange}>
                                            <SelectTrigger className={fieldState.error ? 'border-destructive focus:ring-destructive/20' : 'transition-colors focus:ring-2 focus:ring-primary/20'}>
                                                <SelectValue placeholder='--Select CBCS Year--' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {cbcsYearList.map((yr: any) => (
                                                    <SelectItem key={yr.cbcsyearid} value={yr.cbcsyearid.toString()}>{yr.cbcsyearname}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {fieldState.error?.message && <FormError>{fieldState.error.message}</FormError>}
                                    </>
                                )}
                            />
                        </div>
                    )}
                </div>

                <div className='space-y-4'>
                    <div className='flex items-center gap-3 rounded-md bg-muted/30 p-3'>
                        <Controller
                            name='amcobM_ElectiveFlg'
                            control={control}
                            render={({ field }) => (
                                <Checkbox id='upd-amcobM_ElectiveFlg' checked={field.value} onCheckedChange={field.onChange} />
                            )}
                        />
                        <label htmlFor='upd-amcobM_ElectiveFlg' className='font-semibold cursor-pointer'>Elective Flag</label>
                    </div>
                    {electiveFlag && (
                        <div className='group flex flex-col gap-1.5'>
                            <Label isRequired>Elective Intro Year</Label>
                            <Controller
                                name='amcobM_ElectiveIntroYear'
                                control={control}
                                render={({ field, fieldState }) => (
                                    <>
                                        <Select value={field.value} onValueChange={field.onChange}>
                                            <SelectTrigger className={fieldState.error ? 'border-destructive focus:ring-destructive/20' : 'transition-colors focus:ring-2 focus:ring-primary/20'}>
                                                <SelectValue placeholder='--Select Elective Year--' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {electiveYearList.map((yr: any) => (
                                                    <SelectItem key={yr.electiveyearid} value={yr.electiveyearid.toString()}>{yr.electiveyearname}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {fieldState.error?.message && <FormError>{fieldState.error.message}</FormError>}
                                    </>
                                )}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* File Upload */}
            <div className='rounded-md border bg-muted/10 p-4'>
                <h5 className='mb-3 border-b pb-2 font-semibold'>Upload File/Photo</h5>
                <div className='flex items-center gap-4 flex-wrap'>
                    {fileName && (
                        <div className='flex items-center gap-2'>
                            <span className='text-sm font-medium'>{fileName}</span>
                            {selectedRow.amcobM_FilePath && !fileObj && (
                                <a href={selectedRow.amcobM_FilePath} target='_blank' rel='noreferrer' className='text-xs text-primary font-bold'>View</a>
                            )}
                            <Button type='button' variant='ghost' size='sm' onClick={removeFile} className='h-6 w-6 p-0 text-destructive'>
                                <X className='h-4 w-4' />
                            </Button>
                        </div>
                    )}
                    <label className='cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 transition-colors'>
                        <Upload className='mr-2 h-4 w-4' /> Choose File
                        <input ref={fileRef} type='file' className='hidden' accept='image/*, application/pdf, application/msword, application/vnd.ms-excel' onChange={handleFileChange} />
                    </label>
                </div>
            </div>

            <div className='flex flex-col gap-3 border-t pt-4 sm:flex-row'>
                <Button type='button' variant='outline' onClick={() => reset()} disabled={isSubmitting} className='w-fit'>Reset</Button>
                <Button type='submit' disabled={isSubmitting} className='w-fit' isLoading={isSubmitting} loadingText='Updating...'>
                    <Save className='mr-2 h-4 w-4' /> Update Map
                </Button>
            </div>
        </form>
    );
}
