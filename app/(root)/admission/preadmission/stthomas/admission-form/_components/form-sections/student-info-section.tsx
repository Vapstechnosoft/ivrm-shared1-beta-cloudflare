'use client';
// Temporary comment to resolve EBUSY lock issue

import { Button } from '@/components/ui/button';
import { CalendarYear } from '@/components/ui/calendar_year';
import { Checkbox } from '@/components/ui/checkbox';
import { CustomMultiSelectBox } from '@/components/ui/custom-multiselect';
import { FormError, Label } from '@/components/ui/extension/field';
import { InputNumber } from '@/components/ui/extension/input-number';
import { InputText } from '@/components/ui/extension/input-text';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useGetCasteByCasteCategory } from '@/hooks/admission/admissionForm';
import { calculateAge, cn, dateToWords } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon, Camera, Trash } from 'lucide-react';
import { useEffect, useMemo } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { StreamExamSelection } from '../stream-exam-selection';
import { SubjectGroupTable } from '../subject-group-table';
import { WebcamCapture } from '../webcam-capture';

interface StudentInfoSectionProps {
    religion: any[];
    casteCategory: any[];
    allCaste: any[];
    admissionClass: any[];
    academicYears: any[];
    genderOptions: any[];
    studentPhoto: any;
    setStudentPhoto: (photo: any) => void;
    studentPhotoFile: File | null;
    setStudentPhotoFile: (file: File | null) => void;
    studentPhotoError: string | null;
    setStudentPhotoError: (err: string | null) => void;
    categoryByClass: any[]; // class-wise categories
    streamList: any[];
    examList: any[];
    electiveOptions: any[];
    electiveList: any[];
    sectionData: any[];
    sectionLoading: boolean;
    streamLoading?: boolean;
    concessionList?: any[];
}

export function StudentInfoSection({
    religion,
    casteCategory,
    allCaste,
    admissionClass,
    academicYears,
    genderOptions,
    studentPhoto,
    setStudentPhoto,
    setStudentPhotoFile,
    studentPhotoError,
    setStudentPhotoError,
    categoryByClass,
    streamList,
    examList,
    electiveOptions,
    electiveList,
    sectionData,
    sectionLoading,
    streamLoading,
    concessionList = []
}: StudentInfoSectionProps) {
    const {
        register,
        control,
        watch,
        setValue,
        getValues,
        formState: { errors }
    } = useFormContext();

    const religionId = watch('amsT_ReligionId');
    const categoryId = watch('imCC_Id');

    const { data: casteByCategory, isLoading: casteLoading } = useGetCasteByCasteCategory(categoryId);

    const filteredCaste = useMemo(() => {
        if (!categoryId) return [];
        return (casteByCategory as any) || [];
    }, [categoryId, casteByCategory]);

    // Clear caste selection if it's no longer valid for the selected category
    useEffect(() => {
        const currentCasteId = getValues('imC_Id');
        if (currentCasteId && Number(currentCasteId) > 0) {
            const isValid = filteredCaste.some((c: any) => Number(c.imC_Id) === Number(currentCasteId));
            if (!isValid) {
                setValue('imC_Id', 0);
            }
        }
    }, [categoryId, filteredCaste, setValue, getValues]);

    const dob = watch('amsT_DOB');
    const admDate = watch('amsT_Date');

    useEffect(() => {
        if (dob && admDate) {
            const age = calculateAge(dob, admDate);
            setValue('pasR_Age', age);
            setValue('amsT_DOB_Words', dateToWords(dob));
        }
    }, [dob, admDate, setValue]);

    const casteId = watch('imC_Id');

    // Auto-bind Caste Category when Caste is selected
    useEffect(() => {
        if (Number(casteId) > 0) {
            const selectedCaste = allCaste.find((c: any) => Number(c.imC_Id) === Number(casteId));
            if (selectedCaste?.imcC_Id || selectedCaste?.imCC_Id) {
                setValue('imCC_Id', selectedCaste.imcC_Id || selectedCaste.imCC_Id);
            }
        }
    }, [casteId, allCaste, setValue]);

    const isEmisBpl = watch('isEmisBpl');
    const isEcs = watch('amsT_ECSFlag');

    return (
        <div className='space-y-6'>
            <div className='grid grid-cols-1 gap-6 md:grid-cols-4'>
                {/* Photo Upload Section */}
                <div className='flex flex-col items-center gap-4 md:col-span-1'>
                    <Label className='w-full text-center'>Student Photo</Label>
                    <div className='group relative'>
                        {studentPhoto?.amsT_Photoname ? (
                            <div className='relative h-48 w-40 overflow-hidden rounded-lg border-2 border-primary/20 bg-muted'>
                                <img src={studentPhoto.amsT_Photoname} alt='Student' className='h-full w-full object-cover' />
                                <button
                                    type='button'
                                    onClick={() => {
                                        setStudentPhoto(null);
                                        setStudentPhotoFile(null);
                                        setValue('amsT_Photoname', '');
                                    }}
                                    className='absolute top-2 right-2 rounded-full bg-destructive p-1.5 text-destructive-foreground opacity-0 transition-opacity group-hover:opacity-100'>
                                    <Trash className='h-4 w-4' />
                                </button>
                            </div>
                        ) : (
                            <div className='flex h-48 w-40 flex-col items-center justify-center gap-2 rounded-lg border-2 border-muted-foreground/25 border-dashed bg-muted/50 text-muted-foreground'>
                                <Camera className='h-8 w-8 opacity-50' />
                                <span className='text-xs'>No Photo</span>
                            </div>
                        )}
                    </div>
                    <div className='flex gap-2'>
                        <WebcamCapture
                            onCapture={(dataUrl) => {
                                setStudentPhoto({ amsT_Photoname: dataUrl });
                                setValue('amsT_Photoname', dataUrl);
                            }}
                        />
                        <div className='relative'>
                            <input
                                type='file'
                                id='student-photo-upload'
                                className='hidden'
                                accept='image/*'
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        if (file.size > 2 * 1024 * 1024) {
                                            setStudentPhotoError('Photo size should be less than 2MB');
                                            return;
                                        }
                                        const reader = new FileReader();
                                        reader.onloadend = () => {
                                            setStudentPhoto({ amsT_Photoname: reader.result as string });
                                            setStudentPhotoFile(file);
                                            setValue('amsT_Photoname', reader.result as string);
                                        };
                                        reader.readAsDataURL(file);
                                    }
                                }}
                            />
                            <Button
                                type='button'
                                variant='outline'
                                size='sm'
                                onClick={() => document.getElementById('student-photo-upload')?.click()}>
                                Upload
                            </Button>
                        </div>
                    </div>
                    {studentPhotoError && <p className='text-destructive text-xs'>{studentPhotoError}</p>}
                </div>

                {/* Form Fields */}
                <div className='grid grid-cols-1 gap-4 md:col-span-3 md:grid-cols-3'>
                    <div className='flex flex-col gap-1.5'>
                        <Label>
                            Academic Year <span className='ml-1 text-red-500'>*</span>
                        </Label>
                        <Controller
                            name='asmaY_Id'
                            control={control}
                            render={({ field }) => (
                                <Select value={field.value?.toString() || ''} onValueChange={(val) => field.onChange(Number(val))}>
                                    <SelectTrigger>
                                        <SelectValue placeholder='Select Year' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {academicYears.map((item: any) => (
                                            <SelectItem key={item.asmaY_Id} value={item.asmaY_Id.toString()}>
                                                {item.asmaY_Year}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.asmaY_Id && <FormError>{errors.asmaY_Id.message as string}</FormError>}
                    </div>

                    <div className='flex flex-col gap-1.5'>
                        <Label>
                            Date of Admission <span className='ml-1 text-red-500'>*</span>
                        </Label>
                        <Controller
                            name='amsT_Date'
                            control={control}
                            render={({ field }) => (
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant='outline'
                                            className={cn('justify-start text-left font-normal', !field.value && 'text-muted-foreground')}>
                                            <CalendarIcon className='mr-2 h-4 w-4' />
                                            {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className='w-auto p-0'>
                                        <CalendarYear mode='single' selected={field.value} onSelect={field.onChange} initialFocus />
                                    </PopoverContent>
                                </Popover>
                            )}
                        />
                        {errors.amsT_Date && <FormError>{errors.amsT_Date.message as string}</FormError>}
                    </div>

                    <div className='flex flex-col gap-1.5'>
                        <Label>
                            Registration No <span className='ml-1 text-red-500'>*</span>
                        </Label>
                        <InputText {...register('amsT_RegistrationNo')} placeholder='Registration No' />
                        {errors.amsT_RegistrationNo && <FormError>{errors.amsT_RegistrationNo.message as string}</FormError>}
                    </div>

                    <div className='flex flex-col gap-1.5'>
                        <Label>
                            Admission No <span className='ml-1 text-red-500'>*</span>
                        </Label>
                        <InputText {...register('amsT_AdmissionNo')} placeholder='Admission No' />
                        {errors.amsT_AdmissionNo && <FormError>{errors.amsT_AdmissionNo.message as string}</FormError>}
                    </div>

                    <div className='flex flex-col gap-1.5'>
                        <Label>
                            First Name <span className='ml-1 text-red-500'>*</span>
                        </Label>
                        <InputText {...register('amsT_FirstName')} placeholder='First Name' />
                        {errors.amsT_FirstName && <FormError>{errors.amsT_FirstName.message as string}</FormError>}
                    </div>

                    <div className='flex flex-col gap-1.5'>
                        <Label>Middle Name</Label>
                        <InputText {...register('amsT_MiddleName')} placeholder='Middle Name' />
                    </div>

                    <div className='flex flex-col gap-1.5'>
                        <Label>Last Name</Label>
                        <InputText {...register('amsT_LastName')} placeholder='Last Name' />
                    </div>

                    <div className='flex flex-col gap-1.5'>
                        <Label>
                            Gender <span className='ml-1 text-red-500'>*</span>
                        </Label>
                        <Controller
                            name='amsT_Sex'
                            control={control}
                            render={({ field }) => (
                                <Select value={field.value || ''} onValueChange={field.onChange}>
                                    <SelectTrigger>
                                        <SelectValue placeholder='Select Gender' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {genderOptions.map((opt: any) => (
                                            <SelectItem key={opt.id} value={opt.id}>
                                                {opt.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.amsT_Sex && <FormError>{errors.amsT_Sex.message as string}</FormError>}
                    </div>

                    <div className='flex flex-col gap-1.5'>
                        <Label>
                            Date of Birth <span className='ml-1 text-red-500'>*</span>
                        </Label>
                        <Controller
                            name='amsT_DOB'
                            control={control}
                            render={({ field }) => (
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant='outline'
                                            className={cn('justify-start text-left font-normal', !field.value && 'text-muted-foreground')}>
                                            <CalendarIcon className='mr-2 h-4 w-4' />
                                            {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className='w-auto p-0'>
                                        <CalendarYear mode='single' selected={field.value} onSelect={field.onChange} initialFocus />
                                    </PopoverContent>
                                </Popover>
                            )}
                        />
                        {errors.amsT_DOB && <FormError>{errors.amsT_DOB.message as string}</FormError>}
                    </div>

                    <div className='col-span-2 flex flex-col gap-1.5'>
                        <Label>DOB in Words</Label>
                        <InputText {...register('amsT_DOB_Words')} readOnly className='bg-muted' />
                    </div>

                    <div className='flex flex-col gap-1.5'>
                        <Label>Age</Label>
                        <Controller
                            name='pasR_Age'
                            control={control}
                            render={({ field }) => (
                                <InputNumber
                                    value={Number(field.value) || 0}
                                    onChange={(val: number) => field.onChange(val)}
                                    isReadOnly
                                    className='bg-muted'
                                />
                            )}
                        />
                    </div>
                </div>
            </div>

            <div className='grid grid-cols-1 gap-4 md:grid-cols-4'>
                <div className='flex flex-col gap-1.5'>
                    <Label>
                        Admission Class <span className='ml-1 text-red-500'>*</span>
                    </Label>
                    <Controller
                        name='asmcL_Id'
                        control={control}
                        render={({ field }) => (
                            <Select
                                value={field.value?.toString() || ''}
                                onValueChange={(val) => {
                                    field.onChange(Number(val));
                                    // Clear section when class changes
                                    setValue('asmS_Id', 0);
                                }}>
                                <SelectTrigger>
                                    <SelectValue placeholder='Select Class' />
                                </SelectTrigger>
                                <SelectContent>
                                    {admissionClass.map((item: any) => (
                                        <SelectItem key={item.asmcL_Id} value={item.asmcL_Id.toString()}>
                                            {item.asmcL_ClassName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                    {errors.asmcL_Id && <FormError>{errors.asmcL_Id.message as string}</FormError>}
                </div>

                <div className='flex flex-col gap-1.5'>
                    <Label>
                        Section <span className='ml-1 text-red-500'>*</span>
                    </Label>
                    <Controller
                        name='asmS_Id'
                        control={control}
                        render={({ field }) => (
                            <Select
                                value={field.value?.toString() || ''}
                                onValueChange={(val) => field.onChange(Number(val))}
                                disabled={sectionLoading || !watch('asmcL_Id')}>
                                <SelectTrigger>
                                    <SelectValue placeholder={sectionLoading ? 'Loading...' : 'Select Section'} />
                                </SelectTrigger>
                                <SelectContent>
                                    {sectionData?.map((item: any) => (
                                        <SelectItem key={item.asmS_Id} value={item.asmS_Id.toString()}>
                                            {item.asmS_SectionName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                </div>

                <div className='flex flex-col gap-1.5'>
                    <Label>
                        Religion <span className='ml-1 text-red-500'>*</span>
                    </Label>
                    <Controller
                        name='amsT_ReligionId'
                        control={control}
                        render={({ field }) => (
                            <Select
                                value={field.value?.toString() || ''}
                                onValueChange={(val) => {
                                    field.onChange(Number(val));
                                    setValue('imC_Id', 0);
                                }}>
                                <SelectTrigger>
                                    <SelectValue placeholder='Select Religion' />
                                </SelectTrigger>
                                <SelectContent>
                                    {religion.map((item: any) => (
                                        <SelectItem key={item.ivrmmR_Id} value={item.ivrmmR_Id.toString()}>
                                            {item.ivrmmR_ReligionName || item.ivrmmR_Name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                </div>

                <div className='flex flex-col gap-1.5'>
                    <Label>
                        Caste <span className='ml-1 text-red-500'>*</span>
                    </Label>
                    <Controller
                        name='imC_Id'
                        control={control}
                        render={({ field }) => (
                            <Select
                                value={field.value?.toString() || ''}
                                onValueChange={(val) => field.onChange(Number(val))}
                                disabled={!categoryId}>
                                <SelectTrigger>
                                    <SelectValue placeholder='Select Caste' />
                                </SelectTrigger>
                                <SelectContent>
                                    {casteLoading && (
                                        <div className='flex items-center justify-center p-2 text-muted-foreground text-sm italic'>
                                            Loading castes...
                                        </div>
                                    )}
                                    {!casteLoading && filteredCaste.length === 0 && (
                                        <div className='flex items-center justify-center p-2 text-muted-foreground text-sm italic'>
                                            No castes found
                                        </div>
                                    )}
                                    {filteredCaste.map((item: any) => (
                                        <SelectItem key={item.imC_Id} value={item.imC_Id.toString()}>
                                            {item.imC_CasteName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                </div>

                <div className='flex flex-col gap-1.5'>
                    <Label>
                        Caste Category <span className='ml-1 text-red-500'>*</span>
                    </Label>
                    <Controller
                        name='imCC_Id'
                        control={control}
                        render={({ field }) => (
                            <Select
                                value={field.value?.toString() || ''}
                                onValueChange={(val) => field.onChange(Number(val))}
                                searchable={true}>
                                <SelectTrigger>
                                    <SelectValue placeholder='Select Category' />
                                </SelectTrigger>
                                <SelectContent>
                                    {casteCategory.map((item: any) => (
                                        <SelectItem key={item.imcC_Id || item.imCC_Id} value={(item.imcC_Id || item.imCC_Id).toString()}>
                                            {item.imcC_CategoryName || item.imCC_CategoryName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                </div>

                <div className='flex flex-col gap-1.5'>
                    <Label>
                        Student Category <span className='ml-1 text-red-500'>*</span>
                    </Label>
                    <Controller
                        name='asmcC_Id'
                        control={control}
                        render={({ field }) => (
                            <Select
                                value={field.value?.toString() || ''}
                                onValueChange={(val) => field.onChange(Number(val))}
                                disabled={!categoryByClass || categoryByClass.length === 0}>
                                <SelectTrigger>
                                    <SelectValue
                                        placeholder={
                                            !categoryByClass || categoryByClass.length === 0 ? 'No category found' : 'Select Category'
                                        }
                                    />
                                </SelectTrigger>
                                <SelectContent>
                                    {categoryByClass?.map((item: any) => (
                                        <SelectItem key={item.asmcC_Id} value={item.asmcC_Id.toString()}>
                                            {item.amC_Name || item.asmcC_CategoryName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                </div>

                <div className='flex flex-col gap-1.5'>
                    <Label>
                        Fee Concession Type <span className='ml-1 text-red-500'>*</span>
                    </Label>
                    <Controller
                        name='feeConcessionType'
                        control={control}
                        render={({ field }) => (
                            <Select value={field.value?.toString() || ''} onValueChange={(val) => field.onChange(val)}>
                                <SelectTrigger>
                                    <SelectValue placeholder='Select Concession' />
                                </SelectTrigger>
                                <SelectContent>
                                    {concessionList?.map((item: any) => (
                                        <SelectItem key={item.fmcC_Id} value={item.fmcC_Id.toString()}>
                                            {item.fmcC_ConcessionName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                </div>
            </div>

            <div className='grid grid-cols-1 gap-4 md:grid-cols-4'>
                <div className='flex flex-col gap-1.5'>
                    <Label>Sub Caste</Label>
                    <InputText {...register('amsT_SubCasteIMC_Id')} placeholder='Sub Caste' />
                </div>
                <div className='flex flex-col gap-1.5'>
                    <Label>Caste Certificate No</Label>
                    <InputText {...register('amsT_CasteCertiNo')} placeholder='Certificate No' />
                </div>
                <div className='flex flex-col gap-1.5'>
                    <Label>Nationality</Label>
                    <InputText {...register('amsT_Nationality_Name')} placeholder='Nationality' />
                </div>
                <div className='flex flex-col gap-1.5'>
                    <Label>Mother Tongue</Label>
                    <InputText {...register('amsT_MotherTongue')} placeholder='Mother Tongue' />
                </div>
            </div>

            {/* Stream & Exam Selection */}
            <StreamExamSelection control={control} streams={streamList} exams={examList} isLoading={streamLoading} />

            {/* Subject Group Multi-Select & Table */}
            <div className='grid grid-cols-1 gap-6'>
                <div className='flex flex-col gap-1.5'>
                    <Label>Elective Subject Groups</Label>
                    <Controller
                        name='electivelist_Groups'
                        control={control}
                        render={({ field }) => (
                            <CustomMultiSelectBox
                                options={electiveOptions}
                                placeholder='Select Groups'
                                value={field.value || []}
                                onChange={field.onChange}
                                height='150px'
                                isSearchRequired
                            />
                        )}
                    />
                </div>
                <SubjectGroupTable
                    control={control}
                    electiveList={electiveList.filter((e: any) => (watch('electivelist_Groups') || []).includes(e.asmgC_Id.toString()))}
                />
            </div>

            {/* Checkboxes Area */}
            <div className='grid grid-cols-1 gap-6 rounded-lg bg-muted/30 p-4 md:grid-cols-3'>
                <div className='flex items-center space-x-2'>
                    <Controller
                        name='isEmisBpl'
                        control={control}
                        render={({ field }) => (
                            <Checkbox
                                id='isEmisBpl'
                                checked={field.value === 1}
                                onCheckedChange={(checked) => field.onChange(checked ? 1 : 0)}
                            />
                        )}
                    />
                    <Label htmlFor='isEmisBpl'>EMIS / BPL / STS Available?</Label>
                </div>

                <div className='flex items-center space-x-2'>
                    <Controller
                        name='amsT_ECSFlag'
                        control={control}
                        render={({ field }) => (
                            <Checkbox
                                id='amsT_ECSFlag'
                                checked={field.value === 1}
                                onCheckedChange={(checked) => field.onChange(checked ? 1 : 0)}
                            />
                        )}
                    />
                    <Label htmlFor='amsT_ECSFlag'>ECS Required?</Label>
                </div>
            </div>

            {isEmisBpl === 1 && (
                <div className='fade-in grid animate-in grid-cols-1 gap-4 duration-300 md:grid-cols-2'>
                    <div className='flex flex-col gap-1.5'>
                        <Label>
                            EMIS / BPL / STS No <span className='ml-1 text-red-500'>*</span>
                        </Label>
                        <InputText {...register('amsT_BPLCardNo')} placeholder='Enter Number' />
                        {errors.amsT_BPLCardNo && <FormError>{errors.amsT_BPLCardNo.message as string}</FormError>}
                    </div>
                </div>
            )}

            {isEcs === 1 && (
                <div className='slide-in-from-top-2 grid animate-in grid-cols-1 gap-4 rounded-lg border bg-background p-4 duration-300 md:grid-cols-3'>
                    <div className='border-b pb-2 font-semibold text-sm md:col-span-3'>ECS Account Details</div>
                    <div className='flex flex-col gap-1.5'>
                        <Label>
                            Account No <span className='ml-1 text-red-500'>*</span>
                        </Label>
                        <InputText {...register('asecS_AccountNo')} placeholder='Account No' />
                        {errors.asecS_AccountNo && <FormError>{errors.asecS_AccountNo.message as string}</FormError>}
                    </div>
                    <div className='flex flex-col gap-1.5'>
                        <Label>
                            Account Holder Name <span className='ml-1 text-red-500'>*</span>
                        </Label>
                        <InputText {...register('asecS_AccountHolderName')} placeholder='Holder Name' />
                        {errors.asecS_AccountHolderName && <FormError>{errors.asecS_AccountHolderName.message as string}</FormError>}
                    </div>
                    <div className='flex flex-col gap-1.5'>
                        <Label>
                            Bank Name <span className='ml-1 text-red-500'>*</span>
                        </Label>
                        <InputText {...register('asecS_BankName')} placeholder='Bank Name' />
                        {errors.asecS_BankName && <FormError>{errors.asecS_BankName.message as string}</FormError>}
                    </div>
                    <div className='flex flex-col gap-1.5'>
                        <Label>
                            Account Type <span className='ml-1 text-red-500'>*</span>
                        </Label>
                        <InputText {...register('asecS_AccountType')} placeholder='SB / Current' />
                        {errors.asecS_AccountType && <FormError>{errors.asecS_AccountType.message as string}</FormError>}
                    </div>
                    <div className='flex flex-col gap-1.5'>
                        <Label>
                            MICR No <span className='ml-1 text-red-500'>*</span>
                        </Label>
                        <InputText {...register('asecS_MICRNo')} placeholder='MICR No' />
                        {errors.asecS_MICRNo && <FormError>{errors.asecS_MICRNo.message as string}</FormError>}
                    </div>
                    <div className='flex flex-col gap-1.5'>
                        <Label>
                            Branch <span className='ml-1 text-red-500'>*</span>
                        </Label>
                        <InputText {...register('asecS_Branch')} placeholder='Branch Name' />
                        {errors.asecS_Branch && <FormError>{errors.asecS_Branch.message as string}</FormError>}
                    </div>
                </div>
            )}
        </div>
    );
}
