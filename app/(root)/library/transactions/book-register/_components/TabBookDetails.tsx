'use client';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { FormError, Label } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { deleteDocument, uploadDocument } from '@/server/document_upload';
import type { BookRegisterPayload } from '@/types/library/masters/bookRegister';
import { format } from 'date-fns';
import { CalendarIcon, Eye, Loader2, Trash, Upload } from 'lucide-react';
import { useState } from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import { toast } from 'sonner';

export default function TabBookDetails({
    dropdownData,
    onNext,
    onCancel,
    onClear,
    isSaving
}: {
    dropdownData: any;
    onNext: () => void;
    onCancel: () => void;
    onClear: () => void;
    isSaving?: boolean;
}) {
    const {
        control,
        register,
        setValue,
        formState: { errors }
    } = useFormContext<BookRegisterPayload>();

    const lmB_StudentPhoto = useWatch({ control, name: 'lmB_StudentPhoto' });
    const [isEntryDateOpen, setIsEntryDateOpen] = useState(false);

    // Flexible list access
    const rawData = dropdownData?.data || dropdownData;
    const categoryList = rawData?.categorylist || rawData?.categoryList || dropdownData?.categorylist || dropdownData?.categoryList || [];
    const deptList = rawData?.deptlist || rawData?.deptList || dropdownData?.deptlist || dropdownData?.deptList || [];
    const subjectList = rawData?.subjectlist || rawData?.subjectList || dropdownData?.subjectlist || dropdownData?.subjectList || [];
    const libList = rawData?.liblist || rawData?.libList || dropdownData?.liblist || dropdownData?.libList || [];

    const handleDigitOnlyKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (
            e.key === 'Backspace' ||
            e.key === 'Delete' ||
            e.key === 'Tab' ||
            e.key === 'Enter' ||
            e.key === 'ArrowLeft' ||
            e.key === 'ArrowRight' ||
            e.key === 'Home' ||
            e.key === 'End' ||
            e.ctrlKey ||
            e.metaKey
        ) {
            return;
        }
        if (!/^[0-9]$/.test(e.key)) {
            e.preventDefault();
        }
    };

    const handleDigitOnlyInput = (e: React.FormEvent<HTMLInputElement>, maxLen = 10) => {
        const cleaned = e.currentTarget.value.replace(/\D/g, '').slice(0, maxLen);
        e.currentTarget.value = cleaned;
    };

    return (
        <div className='flex flex-col gap-6'>
            <div className='flex flex-col gap-6 lg:flex-row'>
                <div className='grid flex-1 grid-cols-1 gap-4 md:grid-cols-2'>
                    {/* Left Column Fields */}
                    <InputText label='Book Title' required {...register('lmB_BookTitle')} error={errors.lmB_BookTitle?.message} />
                    <InputText label='Sub-Title' {...register('mB_Subtitle')} error={errors.mB_Subtitle?.message} />

                    <div className='flex flex-col gap-1.5'>
                        <Label>
                            Book Type <span className='text-red-500'>*</span>
                        </Label>
                        <Controller
                            control={control}
                            name='lmB_BookType'
                            render={({ field }) => (
                                <Select onValueChange={field.onChange} value={field.value || undefined}>
                                    <SelectTrigger>
                                        <SelectValue placeholder='--Select--' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value='Text Book'>Text Book</SelectItem>
                                        <SelectItem value='Issue'>Issue</SelectItem>
                                        <SelectItem value='Issuable'>Issuable</SelectItem>
                                        <SelectItem value='Reference'>Reference</SelectItem>
                                        <SelectItem value='NotIssuable'>Not Issuable</SelectItem>
                                        <SelectItem value='ReferenceonlyIssuable'>Reference only Issuable</SelectItem>
                                        <SelectItem value='ReferenceonlyNon-Issuable'>Reference only Non-Issuable</SelectItem>
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.lmB_BookType && <FormError>{errors.lmB_BookType.message}</FormError>}
                    </div>

                    <InputText
                        label='Book No'
                        id='lmB_BookNo'
                        maxLength={10}
                        onKeyDown={handleDigitOnlyKeyDown}
                        onInput={(e: React.FormEvent<HTMLInputElement>) => handleDigitOnlyInput(e, 10)}
                        {...register('lmB_BookNo', {
                            onChange: (e) => {
                                const cleaned = e.target.value.replace(/\D/g, '').slice(0, 10);
                                e.target.value = cleaned;
                                setValue('lmB_BookNo', cleaned, { shouldValidate: true, shouldDirty: true });
                            }
                        })}
                        error={errors.lmB_BookNo?.message}
                    />

                    <div className='flex flex-col gap-1.5'>
                        <Label>Binding-Type</Label>
                        <Controller
                            control={control}
                            name='binding_Type'
                            render={({ field }) => (
                                <Select onValueChange={field.onChange} value={field.value || undefined}>
                                    <SelectTrigger>
                                        <SelectValue placeholder='--Select Field--' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value='Hard Bound'>Hard Bound</SelectItem>
                                        <SelectItem value='Hardbound'>Hardbound</SelectItem>
                                        <SelectItem value='Perfect Bound'>Perfect Bound</SelectItem>
                                        <SelectItem value='Spiral'>Spiral</SelectItem>
                                        <SelectItem value='Stitched'>Stitched</SelectItem>
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.binding_Type && <FormError>{errors.binding_Type.message}</FormError>}
                    </div>

                    <InputText
                        label='Book ISBN NO'
                        id='lmB_ISBNNo'
                        maxLength={10}
                        onKeyDown={handleDigitOnlyKeyDown}
                        onInput={(e: React.FormEvent<HTMLInputElement>) => handleDigitOnlyInput(e, 10)}
                        {...register('lmB_ISBNNo', {
                            onChange: (e) => {
                                const cleaned = e.target.value.replace(/\D/g, '').slice(0, 10);
                                e.target.value = cleaned;
                                setValue('lmB_ISBNNo', cleaned, { shouldValidate: true, shouldDirty: true });
                            }
                        })}
                        error={errors.lmB_ISBNNo?.message}
                    />
                    <InputText
                        label='Call No'
                        id='mB_Call_No'
                        maxLength={10}
                        onKeyDown={handleDigitOnlyKeyDown}
                        onInput={(e: React.FormEvent<HTMLInputElement>) => handleDigitOnlyInput(e, 10)}
                        {...register('mB_Call_No', {
                            onChange: (e) => {
                                const cleaned = e.target.value.replace(/\D/g, '').slice(0, 10);
                                e.target.value = cleaned;
                                setValue('mB_Call_No', cleaned, { shouldValidate: true, shouldDirty: true });
                            }
                        })}
                        error={errors.mB_Call_No?.message}
                    />
                    <InputText
                        label='Class No'
                        id='lmB_ClassNo'
                        maxLength={10}
                        onKeyDown={handleDigitOnlyKeyDown}
                        onInput={(e: React.FormEvent<HTMLInputElement>) => handleDigitOnlyInput(e, 10)}
                        {...register('lmB_ClassNo', {
                            onChange: (e) => {
                                const cleaned = e.target.value.replace(/\D/g, '').slice(0, 10);
                                e.target.value = cleaned;
                                setValue('lmB_ClassNo', cleaned, { shouldValidate: true, shouldDirty: true });
                            }
                        })}
                        error={errors.lmB_ClassNo?.message}
                    />
                    <InputText
                        label='Pages'
                        id='mB_Pages'
                        maxLength={10}
                        onKeyDown={handleDigitOnlyKeyDown}
                        onInput={(e: React.FormEvent<HTMLInputElement>) => handleDigitOnlyInput(e, 10)}
                        {...register('mB_Pages', {
                            onChange: (e) => {
                                const cleaned = e.target.value.replace(/\D/g, '').slice(0, 10);
                                e.target.value = cleaned;
                                setValue('mB_Pages', cleaned ? Number(cleaned) : (undefined as any), { shouldValidate: true, shouldDirty: true });
                            }
                        })}
                        error={errors.mB_Pages?.message}
                    />

                    {/* Right Column Fields */}
                    <div className='flex flex-col gap-1.5'>
                        <Label>
                            Department <span className='text-red-500'>*</span>
                        </Label>
                        <Controller
                            control={control}
                            name='lmD_Id'
                            render={({ field }) => (
                                <Select
                                    onValueChange={(val) => field.onChange(Number(val))}
                                    value={field.value ? field.value.toString() : undefined}>
                                    <SelectTrigger>
                                        <SelectValue placeholder='--Select--' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {deptList.map((item: any, idx: number) => {
                                            const deptId =
                                                item.lmD_Id ??
                                                item.lmd_Id ??
                                                item.LMD_Id ??
                                                item.lmd_id ??
                                                item.hrmD_Id ??
                                                item.HRMD_Id ??
                                                item.hrmd_id ??
                                                item.departmentId ??
                                                item.id ??
                                                item.value;
                                            const deptName =
                                                item.lmD_DepartmentName ||
                                                item.lmd_DepartmentName ||
                                                item.LMD_DepartmentName ||
                                                item.lmd_departmentname ||
                                                item.hrmD_DepartmentName ||
                                                item.HRMD_DepartmentName ||
                                                item.departmentName ||
                                                item.name ||
                                                item.label ||
                                                String(deptId);
                                            if (deptId === undefined || deptId === null) return null;
                                            return (
                                                <SelectItem key={`${deptId}-${idx}`} value={deptId.toString()}>
                                                    {deptName}
                                                </SelectItem>
                                            );
                                        })}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.lmD_Id && <FormError>{errors.lmD_Id.message}</FormError>}
                    </div>

                    <div className='flex flex-col gap-1.5'>
                        <Label>
                            Category Name <span className='text-red-500'>*</span>
                        </Label>
                        <Controller
                            control={control}
                            name='lmC_Id'
                            render={({ field }) => (
                                <Select
                                    onValueChange={(val) => field.onChange(Number(val))}
                                    value={field.value ? field.value.toString() : undefined}>
                                    <SelectTrigger>
                                        <SelectValue placeholder='--Select--' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categoryList.map((item: any, idx: number) => {
                                            const catId =
                                                item.lmC_Id ??
                                                item.lmc_Id ??
                                                item.LMC_Id ??
                                                item.lmc_id ??
                                                item.categoryId ??
                                                item.lmC_ID ??
                                                item.id ??
                                                item.value;
                                            const catName =
                                                item.lmC_CategoryName ||
                                                item.lmc_CategoryName ||
                                                item.LMC_CategoryName ||
                                                item.lmc_categoryname ||
                                                item.categoryName ||
                                                item.name ||
                                                item.label ||
                                                item.lmC_CategoryCode ||
                                                String(catId);
                                            if (catId === undefined || catId === null) return null;
                                            return (
                                                <SelectItem key={`${catId}-${idx}`} value={catId.toString()}>
                                                    {catName}
                                                </SelectItem>
                                            );
                                        })}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.lmC_Id && <FormError>{errors.lmC_Id.message}</FormError>}
                    </div>

                    <div className='flex flex-col gap-1.5'>
                        <Label>
                            Subject <span className='text-red-500'>*</span>
                        </Label>
                        <Controller
                            control={control}
                            name='lmS_Id'
                            render={({ field }) => (
                                <Select
                                    onValueChange={(val) => field.onChange(Number(val))}
                                    value={field.value ? field.value.toString() : undefined}>
                                    <SelectTrigger>
                                        <SelectValue placeholder='--Select--' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {subjectList.map((item: any, idx: number) => {
                                            const subId =
                                                item.lmS_Id ??
                                                item.lms_Id ??
                                                item.LMS_Id ??
                                                item.lms_id ??
                                                item.subjectId ??
                                                item.id ??
                                                item.value;
                                            const subName =
                                                item.lmS_SubjectName ||
                                                item.lms_SubjectName ||
                                                item.LMS_SubjectName ||
                                                item.lms_subjectname ||
                                                item.subjectName ||
                                                item.name ||
                                                item.label ||
                                                String(subId);
                                            if (subId === undefined || subId === null) return null;
                                            return (
                                                <SelectItem key={`${subId}-${idx}`} value={subId.toString()}>
                                                    {subName}
                                                </SelectItem>
                                            );
                                        })}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.lmS_Id && <FormError>{errors.lmS_Id.message}</FormError>}
                    </div>

                    <div className='flex flex-col gap-1.5'>
                        <Label>
                            Entry Date <span className='text-red-500'>*</span>
                        </Label>
                        <Controller
                            control={control}
                            name='lmB_EntryDate'
                            render={({ field }) => (
                                <Popover open={isEntryDateOpen} onOpenChange={setIsEntryDateOpen}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={'outline'}
                                            className={cn('w-full pl-3 text-left font-normal', !field.value && 'text-muted-foreground')}>
                                            {field.value ? format(new Date(field.value), 'dd-MM-yyyy') : <span>Pick a date</span>}
                                            <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className='w-auto p-0' align='start'>
                                        <Calendar
                                            mode='single'
                                            selected={field.value ? new Date(field.value) : undefined}
                                            onSelect={(date) => {
                                                field.onChange(date);
                                                setIsEntryDateOpen(false);
                                            }}
                                            disabled={(date) => date > new Date() || date < new Date('1900-01-01')}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            )}
                        />
                        {errors.lmB_EntryDate && <FormError>{errors.lmB_EntryDate.message}</FormError>}
                    </div>

                    <InputText
                        label='Publish-Year'
                        required
                        id='lmB_PublishedYear'
                        maxLength={4}
                        onKeyDown={handleDigitOnlyKeyDown}
                        onInput={(e: React.FormEvent<HTMLInputElement>) => handleDigitOnlyInput(e, 4)}
                        {...register('lmB_PublishedYear', {
                            onChange: (e) => {
                                const cleaned = e.target.value.replace(/\D/g, '').slice(0, 4);
                                e.target.value = cleaned;
                                setValue('lmB_PublishedYear', cleaned, { shouldValidate: true, shouldDirty: true });
                            }
                        })}
                        error={errors.lmB_PublishedYear?.message}
                    />
                    <InputText
                        label='Edition'
                        id='lmB_Edition'
                        maxLength={10}
                        onKeyDown={handleDigitOnlyKeyDown}
                        onInput={(e: React.FormEvent<HTMLInputElement>) => handleDigitOnlyInput(e, 10)}
                        {...register('lmB_Edition', {
                            onChange: (e) => {
                                const cleaned = e.target.value.replace(/\D/g, '').slice(0, 10);
                                e.target.value = cleaned;
                                setValue('lmB_Edition', cleaned, { shouldValidate: true, shouldDirty: true });
                            }
                        })}
                        error={errors.lmB_Edition?.message}
                    />
                    <InputText
                        label='Volume No'
                        id='lmB_VolNo'
                        maxLength={10}
                        onKeyDown={handleDigitOnlyKeyDown}
                        onInput={(e: React.FormEvent<HTMLInputElement>) => handleDigitOnlyInput(e, 10)}
                        {...register('lmB_VolNo', {
                            onChange: (e) => {
                                const cleaned = e.target.value.replace(/\D/g, '').slice(0, 10);
                                e.target.value = cleaned;
                                setValue('lmB_VolNo', cleaned, { shouldValidate: true, shouldDirty: true });
                            }
                        })}
                        error={errors.lmB_VolNo?.message}
                    />
                    <InputText
                        label='Book KeyFactor'
                        id='lmBkf_KeyFactor'
                        maxLength={10}
                        onKeyDown={handleDigitOnlyKeyDown}
                        onInput={(e: React.FormEvent<HTMLInputElement>) => handleDigitOnlyInput(e, 10)}
                        {...register('lmBkf_KeyFactor', {
                            onChange: (e) => {
                                const cleaned = e.target.value.replace(/\D/g, '').slice(0, 10);
                                e.target.value = cleaned;
                                setValue('lmBkf_KeyFactor', cleaned, { shouldValidate: true, shouldDirty: true });
                            }
                        })}
                        error={errors.lmBkf_KeyFactor?.message}
                    />
                    <InputText
                        label='Book PageNo'
                        id='lmBkf_PageNo'
                        maxLength={10}
                        onKeyDown={handleDigitOnlyKeyDown}
                        onInput={(e: React.FormEvent<HTMLInputElement>) => handleDigitOnlyInput(e, 10)}
                        {...register('lmBkf_PageNo', {
                            onChange: (e) => {
                                const cleaned = e.target.value.replace(/\D/g, '').slice(0, 10);
                                e.target.value = cleaned;
                                setValue('lmBkf_PageNo', cleaned ? Number(cleaned) : (undefined as any), { shouldValidate: true, shouldDirty: true });
                            }
                        })}
                        error={errors.lmBkf_PageNo?.message}
                    />

                    <div className='flex flex-col gap-1.5'>
                        <Label>
                            Library Name <span className='text-red-500'>*</span>
                        </Label>
                        <Controller
                            control={control}
                            name='lmAL_Id'
                            render={({ field }) => (
                                <Select
                                    onValueChange={(val) => field.onChange(Number(val))}
                                    value={field.value ? field.value.toString() : undefined}>
                                    <SelectTrigger>
                                        <SelectValue placeholder='--Select--' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {libList.map((item: any, idx: number) => {
                                            const libId =
                                                item.lmAL_Id ??
                                                item.lmaL_Id ??
                                                item.lmal_Id ??
                                                item.LMAL_Id ??
                                                item.lmal_id ??
                                                item.libraryId ??
                                                item.id ??
                                                item.value;
                                            const libName =
                                                item.lmaL_LibraryName ||
                                                item.lmal_LibraryName ||
                                                item.LMAL_LibraryName ||
                                                item.lmAL_LibraryName ||
                                                item.lmal_libraryname ||
                                                item.libraryName ||
                                                item.name ||
                                                item.label ||
                                                String(libId);
                                            if (libId === undefined || libId === null) return null;
                                            return (
                                                <SelectItem key={`${libId}-${idx}`} value={libId.toString()}>
                                                    {libName}
                                                </SelectItem>
                                            );
                                        })}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.lmAL_Id && <FormError>{errors.lmAL_Id.message}</FormError>}
                    </div>
                </div>

                <div className='flex w-full flex-col gap-4 lg:w-64'>
                    <PhotoUploadBox
                        label='Upload Photo'
                        value={lmB_StudentPhoto}
                        onChange={(val) => setValue('lmB_StudentPhoto', val)}
                        subContainer='library_book_photo'
                    />
                </div>
            </div>

            {/* Action Buttons */}
            <div className='flex justify-center gap-2 border-t pt-4'>
                <Button
                    type='button'
                    variant='destructive'
                    onClick={onClear}
                    className='bg-red-500 px-6 font-bold text-xs uppercase hover:bg-red-600'>
                    Clear
                </Button>
                <Button
                    type='button'
                    variant='warning'
                    onClick={onCancel}
                    className='bg-orange-500 px-6 font-bold text-xs uppercase hover:bg-orange-600'>
                    Cancel
                </Button>
                <Button
                    type='button'
                    variant='default'
                    onClick={onNext}
                    isLoading={isSaving}
                    disabled={isSaving}
                    className='bg-blue-600 px-6 font-bold text-xs uppercase hover:bg-blue-700'>
                    Save & Next
                </Button>
            </div>
        </div>
    );
}

function PhotoUploadBox({
    label,
    value,
    onChange,
    subContainer
}: {
    label: string;
    value?: string;
    onChange: (val: string) => void;
    subContainer: string;
}) {
    const [isUploading, setIsUploading] = useState(false);

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
        if (!allowedTypes.includes(file.type)) {
            toast.error('Only PNG, JPG, and JPEG formats are allowed');
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            toast.error('File size should not exceed 2MB');
            return;
        }

        try {
            setIsUploading(true);
            const formData = new FormData();
            formData.append('file', file);
            formData.append('SubContainerName', subContainer);

            const response = await uploadDocument(formData);

            if (response.success && response.data) {
                onChange(response.data);
                toast.success(`${label} uploaded successfully`);
            } else {
                throw new Error(response.message || 'Upload failed');
            }
        } catch (error: any) {
            toast.error(`Failed to upload: ${error.message}`);
        } finally {
            setIsUploading(false);
            e.target.value = '';
        }
    };

    const handlePhotoDelete = async () => {
        if (!value) return;
        try {
            const response = await deleteDocument(value);
            if (response.success) {
                onChange('');
                toast.success(`${label} deleted successfully`);
            } else {
                toast.error(`Failed to delete ${label.toLowerCase()}`);
            }
        } catch (error) {
            toast.error('An error occurred while deleting photo');
        }
    };

    return (
        <div className='flex flex-col gap-2 rounded-lg border-2 border-blue-200 bg-blue-50 p-4'>
            <Label className='font-semibold'>{label}</Label>
            {!value ? (
                <label
                    className={cn(
                        'flex h-32 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-all hover:border-primary hover:bg-white',
                        isUploading ? 'border-blue-400 bg-blue-100' : 'border-gray-300 bg-white'
                    )}>
                    {isUploading ? (
                        <div className='flex flex-col items-center gap-1'>
                            <Loader2 className='h-5 w-5 animate-spin text-primary' />
                            <span className='font-medium text-[10px] text-primary'>Uploading...</span>
                        </div>
                    ) : (
                        <div className='flex flex-col items-center gap-2'>
                            <Upload className='h-6 w-6 text-blue-600' />
                            <div className='flex h-7 w-44 items-center justify-center rounded border border-gray-400 bg-yellow-400 px-2 font-bold text-[10px] text-black transition-colors hover:bg-yellow-500'>
                                Choose File
                            </div>
                            <span className='font-bold text-[9px] text-gray-500 uppercase tracking-wider'>Upload {label}</span>
                        </div>
                    )}
                    <input type='file' className='hidden' accept='image/*' onChange={handlePhotoUpload} disabled={isUploading} />
                </label>
            ) : (
                <div className='space-y-2'>
                    <div className='relative h-32 overflow-hidden rounded-lg border-2 border-green-300 shadow-sm'>
                        <img src={value} alt={label} className='h-full w-full object-cover' />
                        <div className='absolute top-1 right-1 flex gap-1'>
                            <Button
                                type='button'
                                variant='secondary'
                                size='icon'
                                className='h-7 w-7'
                                onClick={() => window.open(value, '_blank')}>
                                <Eye className='h-3.5 w-3.5' />
                            </Button>
                            <Button type='button' variant='destructive' size='icon' className='h-7 w-7' onClick={handlePhotoDelete}>
                                <Trash className='h-3.5 w-3.5' />
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
