'use client';

import { Button } from '@/components/ui/button';
import { CalendarYear } from '@/components/ui/calendar_year';
import { Label } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { InputTextarea } from '@/components/ui/extension/input-textarea';
import { MultiSelect } from '@/components/ui/multi-select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon, Save, Trash } from 'lucide-react';
import { Controller, useFieldArray, useFormContext } from 'react-hook-form';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

interface OtherInfoSectionProps {
    source: any;
    activities: { label: string; value: string }[];
    admissionClass: any;
    academicYears: any;
    sourceLoading?: boolean;
    admissionClassLoading?: boolean;
    academicLoading?: boolean;
    handleActivitySelection: (ids: string[]) => void;
    handleSourceSelection: (ids: string[]) => void;
    selectedActivityItems: string[];
    selectedSourceItems: any[];
    // Guardian upload props
    guardianPhotos: any[];
    guardianSignatures: any[];
    handleSaveGuardian: (idx: number) => void;
    handlePhoneChange: (phone: string, countryData: any, fieldName: string) => void;
    phoneValues: Record<string, string>;
    phoneExpectedInfo: Record<string, any>;
}

export function OtherInfoSection({
    source,
    activities,
    admissionClass,
    academicYears,
    sourceLoading,
    admissionClassLoading,
    academicLoading,
    handleActivitySelection,
    handleSourceSelection,
    selectedActivityItems,
    selectedSourceItems,
    guardianPhotos,
    guardianSignatures,
    handleSaveGuardian,
    handlePhoneChange,
    phoneValues,
    phoneExpectedInfo
}: OtherInfoSectionProps) {
    const {
        register,
        control,
        watch,
        setValue,
        formState: { errors, isSubmitting }
    } = useFormContext();

    const {
        fields: previousSchoolFields,
        append: appendPreviousSchool,
        remove: removePreviousSchool
    } = useFieldArray({
        control,
        name: 'previousSchools'
    });

    const {
        fields: guardianFields,
        append: appendGuardian,
        remove: removeGuardian
    } = useFieldArray({
        control,
        name: 'guardian'
    });

    const {
        fields: siblingFields,
        append: appendSibling,
        remove: removeSibling
    } = useFieldArray({
        control,
        name: 'siblings'
    });

    return (
        <div className='space-y-10'>
            {/* Activities and Source */}
            <div className='space-y-6'>
                <h2 className='border-b pb-2 font-bold text-gray-900 text-xl'>Activities & Sources</h2>
                <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
                    <div className='flex flex-col gap-1.5'>
                        <Label>Activities</Label>
                        <Controller
                            name='activities'
                            control={control}
                            render={({ field }) => (
                                <MultiSelect
                                    options={activities}
                                    onValueChange={(selectedValues) => {
                                        field.onChange(selectedValues);
                                        handleActivitySelection(selectedValues);
                                    }}
                                    defaultValue={selectedActivityItems}
                                    value={selectedActivityItems}
                                    placeholder='Select Activities'
                                    variant='inverted'
                                />
                            )}
                        />
                    </div>

                    <div className='flex flex-col gap-1.5'>
                        <Label>Source Details</Label>
                        <Controller
                            name='sourceDetails'
                            control={control}
                            render={({ field }) => (
                                <MultiSelect
                                    options={
                                        source?.data?.map((data: any) => ({
                                            label: data.pamS_SourceName,
                                            value: data.pamS_Id.toString()
                                        })) || []
                                    }
                                    onValueChange={(selectedValues) => {
                                        field.onChange(selectedValues);
                                        handleSourceSelection(selectedValues);
                                    }}
                                    defaultValue={selectedSourceItems.map((data: any) => data.pamS_Id.toString())}
                                    value={selectedSourceItems.map((data: any) => data.pamS_Id.toString())}
                                    placeholder='Select sources'
                                    variant='inverted'
                                    disabled={sourceLoading}
                                />
                            )}
                        />
                    </div>

                    <div className='flex flex-col gap-1.5 lg:col-span-1'>
                        <Label>Achievements</Label>
                        <InputTextarea
                            id='achievements'
                            placeholder='State any achievements...'
                            {...register('achievements')}
                            className='min-h-[100px]'
                        />
                    </div>
                </div>
            </div>

            {/* Sibling Details */}
            <div className='space-y-6'>
                <div className='flex items-center justify-between border-b pb-2'>
                    <h2 className='font-bold text-gray-900 text-xl'>Sibling Details</h2>
                    <Button
                        type='button'
                        variant='secondary'
                        size='sm'
                        onClick={() => appendSibling({ name: '', classId: 0 })}
                        disabled={isSubmitting}>
                        + Add Sibling
                    </Button>
                </div>

                {siblingFields.length === 0 ? (
                    <div className='rounded-lg border-2 border-dashed bg-gray-50 py-6 text-center'>
                        <p className='text-gray-500 text-sm'>No sibling details added.</p>
                    </div>
                ) : (
                    <div className='grid grid-cols-1 gap-6'>
                        {siblingFields.map((sibling, idx) => (
                            <div
                                key={sibling.id}
                                className='group relative space-y-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm'>
                                <div className='flex items-center justify-between'>
                                    <span className='font-bold text-purple-600 text-xs uppercase'>Sibling #{idx + 1}</span>
                                    <Button
                                        type='button'
                                        variant='ghost'
                                        size='xs'
                                        className='h-8 text-red-500'
                                        onClick={() => removeSibling(idx)}>
                                        <Trash className='mr-1 h-4 w-4' /> Remove
                                    </Button>
                                </div>
                                <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
                                    <div className='flex flex-col gap-1.5'>
                                        <Label>Sibling Name</Label>
                                        <InputText {...register(`siblings.${idx}.name`)} placeholder='Enter Sibling Name' />
                                    </div>
                                    <div className='flex flex-col gap-1.5'>
                                        <Label>Class</Label>
                                        <Controller
                                            name={`siblings.${idx}.classId`}
                                            control={control}
                                            render={({ field }) => (
                                                <Select
                                                    value={field.value?.toString() || ''}
                                                    onValueChange={(val) => field.onChange(Number(val))}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder='Select class' />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {admissionClass?.data?.map((item: any) => (
                                                            <SelectItem key={item.asmcL_Id} value={item.asmcL_Id.toString()}>
                                                                {item.asmcL_ClassName}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        />
                                    </div>
                                    <div className='flex flex-col gap-1.5'>
                                        <Label>School Name (if different)</Label>
                                        <InputText {...register(`siblings.${idx}.schoolName`)} placeholder='School Name' />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Previous School Details */}
            <div className='space-y-6'>
                <div className='flex items-center justify-between border-b pb-2'>
                    <h2 className='font-bold text-gray-900 text-xl'>Previous School Details</h2>
                    <Button type='button' variant='secondary' size='sm' onClick={() => appendPreviousSchool({})} disabled={isSubmitting}>
                        + Add School
                    </Button>
                </div>

                {previousSchoolFields.length === 0 ? (
                    <div className='rounded-lg border-2 border-dashed bg-gray-50 py-6 text-center'>
                        <p className='text-gray-500 text-sm'>No previous school details added.</p>
                    </div>
                ) : (
                    <div className='grid grid-cols-1 gap-6'>
                        {previousSchoolFields.map((ps, idx) => (
                            <div key={ps.id} className='group relative space-y-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm'>
                                <div className='mb-2 flex items-center justify-between'>
                                    <span className='font-bold text-blue-600 text-xs uppercase'>School Entry #{idx + 1}</span>
                                    <Button
                                        type='button'
                                        variant='ghost'
                                        size='xs'
                                        className='h-8 text-red-500'
                                        onClick={() => removePreviousSchool(idx)}>
                                        <Trash className='mr-1 h-4 w-4' /> Remove
                                    </Button>
                                </div>
                                <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
                                    <div className='flex flex-col gap-1.5'>
                                        <Label>School Name</Label>
                                        <InputText {...register(`previousSchools.${idx}.schoolName`)} placeholder='School Name' />
                                    </div>

                                    <div className='flex flex-col gap-1.5'>
                                        <Label>Class</Label>
                                        <Controller
                                            name={`previousSchools.${idx}.classId`}
                                            control={control}
                                            render={({ field }) => (
                                                <Select
                                                    value={field.value?.toString() || ''}
                                                    onValueChange={(val) => field.onChange(Number(val))}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder='Select class' />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {admissionClass?.data?.map((item: any) => (
                                                            <SelectItem key={item.asmcL_Id} value={item.asmcL_Id.toString()}>
                                                                {item.asmcL_ClassName}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        />
                                    </div>

                                    <div className='flex flex-col gap-1.5'>
                                        <Label>Passed Year</Label>
                                        <Controller
                                            name={`previousSchools.${idx}.passedYear`}
                                            control={control}
                                            render={({ field }) => (
                                                <Select
                                                    value={field.value?.toString() || ''}
                                                    onValueChange={(val) => field.onChange(Number(val))}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder='Year' />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {academicYears?.data?.map((y: any) => (
                                                            <SelectItem key={y.asmaY_Id} value={y.asmaY_Id.toString()}>
                                                                {y.asmaY_Year}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        />
                                    </div>
                                    <div className='flex flex-col gap-1.5'>
                                        <Label>Percentage / Grade</Label>
                                        <div className='flex gap-2'>
                                            <InputText
                                                {...register(`previousSchools.${idx}.percentage`)}
                                                placeholder='%'
                                                className='w-24'
                                            />
                                            <InputText
                                                {...register(`previousSchools.${idx}.grade`)}
                                                placeholder='Grade'
                                                className='flex-1'
                                            />
                                        </div>
                                    </div>
                                    <div className='flex flex-col gap-1.5'>
                                        <Label>TC Number</Label>
                                        <InputText {...register(`previousSchools.${idx}.tcNumber`)} placeholder='TC No' />
                                    </div>
                                    <div className='flex flex-col gap-1.5'>
                                        <Label>TC Date</Label>
                                        <Controller
                                            name={`previousSchools.${idx}.tcDate`}
                                            control={control}
                                            render={({ field }) => (
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <Button
                                                            variant='outline'
                                                            className={cn(
                                                                'w-full justify-start text-left font-normal',
                                                                !field.value && 'text-muted-foreground'
                                                            )}>
                                                            <CalendarIcon className='mr-2 h-4 w-4' />
                                                            {field.value instanceof Date && !isNaN(field.value.getTime())
                                                                ? format(field.value, 'PP')
                                                                : 'Pick a date'}
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className='w-auto p-0'>
                                                        <CalendarYear mode='single' selected={field.value} onSelect={field.onChange} />
                                                    </PopoverContent>
                                                </Popover>
                                            )}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Guardian Details */}
            <div className='space-y-6'>
                <div className='flex items-center justify-between border-b pb-2'>
                    <h2 className='font-bold text-gray-900 text-xl'>Guardian Details</h2>
                    <Button type='button' variant='secondary' size='sm' onClick={() => appendGuardian({})} disabled={isSubmitting}>
                        + Add Guardian
                    </Button>
                </div>

                {guardianFields.length === 0 ? (
                    <div className='rounded-lg border-2 border-dashed bg-gray-50 py-6 text-center'>
                        <p className='text-gray-500 text-sm'>No guardians added yet.</p>
                    </div>
                ) : (
                    <div className='grid grid-cols-1 gap-6'>
                        {guardianFields.map((g, idx) => (
                            <div key={g.id} className='group relative space-y-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm'>
                                <div className='flex items-center justify-between'>
                                    <div className='flex gap-2'>
                                        <span className='rounded bg-orange-100 px-2 py-0.5 font-bold text-[10px] text-orange-700 uppercase'>
                                            Guardian #{idx + 1}
                                        </span>
                                    </div>
                                    <div className='flex gap-2'>
                                        <Button
                                            type='button'
                                            variant='outline'
                                            size='sm'
                                            onClick={() => handleSaveGuardian(idx)}
                                            disabled={isSubmitting}
                                            className='h-8 py-0'>
                                            <Save className='mr-1 h-3 w-3' /> Save
                                        </Button>
                                        <Button
                                            type='button'
                                            variant='ghost'
                                            size='sm'
                                            className='h-8 py-0 text-red-500'
                                            onClick={() => removeGuardian(idx)}>
                                            Remove
                                        </Button>
                                    </div>
                                </div>

                                <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
                                    <div className='flex flex-col gap-1.5'>
                                        <Label>
                                            Guardian Name <span className='ml-1 text-red-500'>*</span>
                                        </Label>
                                        <InputText {...register(`guardian.${idx}.guardianName`)} placeholder='Name' />
                                    </div>

                                    <div className='flex flex-col gap-1.5'>
                                        <Label>Phone</Label>
                                        <Controller
                                            name={`guardian.${idx}.guardianPhone`}
                                            control={control}
                                            render={({ field }) => (
                                                <div className='relative'>
                                                    <PhoneInput
                                                        country='in'
                                                        value={phoneValues[`guardian_${idx}_phone`] ?? field.value}
                                                        onChange={(phone, data) =>
                                                            handlePhoneChange(phone, data, `guardian.${idx}.guardianPhone`)
                                                        }
                                                        containerClass='w-full'
                                                        inputClass='w-full h-10 px-12 py-2 rounded-md border border-input bg-background'
                                                    />
                                                    {phoneExpectedInfo[`guardian_${idx}_phone`]?.expected && (
                                                        <span className='-top-4 absolute right-0 mt-1 text-[10px] text-muted-foreground leading-none'>
                                                            {phoneExpectedInfo[`guardian_${idx}_phone`].expected} digits expected
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        />
                                    </div>

                                    <div className='flex flex-col gap-1.5'>
                                        <Label>Email</Label>
                                        <InputText {...register(`guardian.${idx}.guardianEmail`)} placeholder='Email' type='email' />
                                    </div>

                                    <div className='flex flex-col gap-1.5 lg:col-span-3'>
                                        <Label>Address</Label>
                                        <InputText {...register(`guardian.${idx}.guardianAddress`)} placeholder='Complete address' />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
