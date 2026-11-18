'use client';
//staffReplacementExistingToNew
import { zodResolver } from '@hookform/resolvers/zod';
import { RotateCcw, Search } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { StaffRepacementExistingToNewSchema, type StaffReplacementExistingToNewValues } from '@/schemas/timetable/transactions';

import { useSectionDropdown, useStaffReplacementExistingToNewMasters } from '@/hooks/timetable/useTransactions';
import { saveStaffReplacementExistingToNew } from '@/server/timetable/transactions/staffreplacementexistingtonew';
import { useState } from 'react';

const extractList = (data: any, preferredKey?: string) => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    const target = data?.data !== undefined ? data.data : data;
    if (Array.isArray(target)) return target;
    if (!target) return [];
    if (preferredKey && Array.isArray(target[preferredKey])) return target[preferredKey];
    const keys = [
        'academiclist',
        'catelist',
        'classlist',
        'sectionlist',
        'stafflist',
        'subjectlist',
        'staffbyall',
        'subjectbystaff',
        'sectionbyclass',
        'classbycategory',
        'categorylist',
        'classDrpDwn',
        'sectDrpDwn',
        'consecutivelstedit',
        'get_period_section1'
    ];
    for (const key of keys) {
        if (Array.isArray(target[key])) return target[key];
    }
    return [];
};

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

interface StaffReplacementFormProps {
    onFetch: (data: StaffReplacementExistingToNewValues | null) => void;
}

export default function StaffReplacementExistingToNewForm({ onFetch }: StaffReplacementFormProps) {
    const { data: masters } = useStaffReplacementExistingToNewMasters();
    console.log('masters', masters);
    const [isReplacing, setIsReplacing] = useState(false);

    const {
        control,
        handleSubmit,
        reset,
        watch,
        setValue,
        formState: { errors }
    } = useForm<StaffReplacementExistingToNewValues>({
        resolver: zodResolver(StaffRepacementExistingToNewSchema),
        defaultValues: {
            asmaY_Id: '',
            ttmC_Id: '',
            asmcL_Id: '',
            asms_Id: '',
            hrmE_Id_From: '',
            hrmE_Id_To: '',
            ismS_Id: ''
        }
    });

    const watchCategory = watch('ttmC_Id');
    const watchClass = watch('asmcL_Id');

    const { data: sectionsData, isLoading: sectionsLoading } = useSectionDropdown();

    const sections = extractList(sectionsData);

    const onSubmit = async (data: StaffReplacementExistingToNewValues) => {
        try {
            setIsReplacing(true);
            const payload = {
                ttmC_Id: Number(data.ttmC_Id),
                asmcL_Id: Number(data.asmcL_Id || 0),
                asms_Id: Number(data.asms_Id || 0),
                hrmE_Id_From: Number(data.hrmE_Id_From),
                hrmE_Id_To: Number(data.hrmE_Id_To),
                ismS_Id: Number(data.ismS_Id || 0)
            };
            console.log('payload', JSON.stringify(payload));
            const response = await saveStaffReplacementExistingToNew(payload);
            console.log('response', response);

            const resData = response?.data || response;
            if (resData?.returnval === true || resData?.success === true || response?.success === true) {
                toast.success(response?.message || 'Staff replacement saved successfully!');
                reset();
                onFetch?.(data);
            } else {
                toast.error(response?.message || 'Failed to save staff replacement.');
            }
        } catch (error: any) {
            toast.error(error.message || 'An error occurred while saving the replacement.');
        } finally {
            setIsReplacing(false);
        }
    };
    const handleReset = () => {
        reset();
    };

    const FormSelect = ({ label, name, control, options, valueKey, labelKey, placeholder, error, isLoading }: any) => (
        <div className='space-y-2'>
            <Label className='font-medium text-sm'>
                {label} {label.includes('*') ? '' : ''}
            </Label>
            <Controller
                name={name}
                control={control}
                render={({ field }) => (
                    <Select key={field.value || 'empty'} value={field.value || undefined} onValueChange={(v) => field.onChange(v || '')}>
                        <SelectTrigger className='w-full'>
                            <SelectValue placeholder={placeholder} />
                        </SelectTrigger>
                        <SelectContent>
                            {isLoading ? (
                                <SelectItem value='loading' disabled>
                                    Loading...
                                </SelectItem>
                            ) : (
                                options?.map((o: any) => (
                                    <SelectItem key={o[valueKey]} value={o[valueKey].toString()}>
                                        {o[labelKey]}
                                    </SelectItem>
                                ))
                            )}
                        </SelectContent>
                    </Select>
                )}
            />
            {error && <p className='text-red-500 text-xs italic'>{error}</p>}
        </div>
    );

    return (
        <CollapsibleSection title='Staff Replacement Existing To New' defaultOpen>
            <div className='rounded-lg border bg-white p-6 shadow-sm'>
                <form onSubmit={handleSubmit(onSubmit)} className='space-y-8'>
                    <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
                        <FormSelect
                            label='Category Name *'
                            name='ttmC_Id'
                            placeholder='-- Select Category --'
                            control={control}
                            options={masters?.categories}
                            valueKey='ttmC_Id'
                            labelKey='ttmC_CategoryName'
                            error={errors.ttmC_Id?.message}
                        />

                        <FormSelect
                            label='Subject *'
                            name='ismS_Id'
                            placeholder='-- Select Subject --'
                            control={control}
                            options={masters?.subjects}
                            valueKey='ismS_Id'
                            labelKey='ismS_SubjectName'
                            error={errors.ismS_Id?.message}
                        />

                        <FormSelect
                            label='Class *'
                            name='asmcL_Id'
                            placeholder='-- Select Class --'
                            control={control}
                            options={masters?.classes}
                            valueKey='asmcL_Id'
                            labelKey='asmcL_ClassName'
                            error={errors.asmcL_Id?.message}
                        />

                        <FormSelect
                            label='Section *'
                            name='asms_Id'
                            placeholder='-- Select Section --'
                            control={control}
                            options={sections}
                            valueKey='asmS_Id'
                            labelKey='asmC_SectionName'
                            isLoading={sectionsLoading}
                            error={errors.asms_Id?.message}
                        />

                        <FormSelect
                            label='Replace Staff From *'
                            name='hrmE_Id_From'
                            placeholder='-- Replace Staff From --'
                            control={control}
                            options={masters?.staff}
                            valueKey='hrmE_Id'
                            labelKey='staffName'
                            error={errors.hrmE_Id_From?.message}
                        />

                        <FormSelect
                            label='Replace Staff To *'
                            name='hrmE_Id_To'
                            placeholder='-- Replace Staff To --'
                            control={control}
                            options={masters?.staff}
                            valueKey='hrmE_Id'
                            labelKey='staffName'
                            error={errors.hrmE_Id_To?.message}
                        />
                    </div>

                    <div className='flex items-center justify-center gap-4 border-t pt-4'>
                        <Button type='submit' disabled={isReplacing} className='flex min-w-[120px] items-center gap-2 font-semibold'>
                            {isReplacing ? <RotateCcw className='h-4 w-4 animate-spin' /> : <Search className='h-4 w-4' />}
                            Replace
                        </Button>

                        <Button type='button' variant='outline' onClick={handleReset} disabled={isReplacing} className='min-w-[120px]'>
                            <RotateCcw className='mr-2 h-4 w-4' />
                            Reset
                        </Button>
                    </div>
                </form>
            </div>
        </CollapsibleSection>
    );
}
