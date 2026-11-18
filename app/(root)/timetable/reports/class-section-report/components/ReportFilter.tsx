'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, RotateCcw, Search } from 'lucide-react';

import { Label } from '@/components/ui/extension/field';
import { useTimeTableCategoryDropDownClassWise, useTimeTableClassDropdown, useTimeTableSectionDropdown } from '@/hooks/timetable/reports';

/* -------------------- SCHEMA -------------------- */
const schema = z.object({
    ttmC_Id: z.string().min(1, 'Category is required'),
    asmcL_Id: z.string().min(1, 'Class is required'),
    asmS_Id: z.string().min(1, 'Section is required')
});

type FormValues = z.infer<typeof schema>;

interface ReportFilterProps {
    onFetch: (data: any | null) => void;
}

/* -------------------- COMPONENT -------------------- */
export default function ReportFilter({ onFetch }: ReportFilterProps) {
    const {
        control,
        handleSubmit,
        reset,
        watch,
        formState: { errors }
    } = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            asmS_Id: '',
            ttmC_Id: '',
            asmcL_Id: ''
        }
    });

    const { data: catData, isLoading: catLoading } = useTimeTableCategoryDropDownClassWise();
    const { data: classData, isLoading: classLoading } = useTimeTableClassDropdown();
    const { data: sectionData, isLoading: sectionLoading } = useTimeTableSectionDropdown();

    const mastersLoading = catLoading || classLoading || sectionLoading;

    const isFormComplete = !!watch('asmS_Id') && !!watch('ttmC_Id') && !!watch('asmcL_Id');
    const onSubmit = (data: FormValues) => {
        const payload = {
            TTMC_Id: Number(data.ttmC_Id),
            ASMCL_Id: Number(data.asmcL_Id),
            ASMS_Id: Number(data.asmS_Id)
        };
        onFetch(payload); // send data to parent
    };

    const handleReset = () => {
        reset();
        onFetch(null); // 🔥 clears grid in parent
    };

    return (
        <div className='mx-auto max-w-7xl space-y-4'>
            <CollapsibleSection title='Class Section Report' defaultOpen>
                <div className='rounded-xl border border-purple-100 bg-white p-6 shadow-md'>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className='grid grid-cols-1 gap-5 md:grid-cols-3'>
                            {/* Category */}
                            <div className='space-y-1'>
                                <Label className='font-bold text-purple-900 text-xs uppercase'>
                                    Category <span className='text-orange-500'>*</span>
                                </Label>

                                <Controller
                                    name='ttmC_Id'
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            key={field.value}
                                            onValueChange={(value) => field.onChange(value || '')}
                                            value={field.value?.toString() || undefined}>
                                            <SelectTrigger className={`h-9 text-sm ${errors.ttmC_Id ? 'border-red-500' : ''}`}>
                                                <SelectValue placeholder={catLoading ? 'Loading...' : 'Select Category'} />
                                            </SelectTrigger>

                                            <SelectContent>
                                                {catData?.data?.map((c: any) => (
                                                    <SelectItem key={c.ttmC_Id} value={String(c.ttmC_Id)}>
                                                        {c.ttmC_CategoryName}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </div>

                            {/* Class */}
                            <div className='space-y-1'>
                                <Label className='font-bold text-purple-900 text-xs uppercase'>
                                    Class <span className='text-orange-500'>*</span>
                                </Label>

                                <Controller
                                    name='asmcL_Id'
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            key={field.value}
                                            onValueChange={(value) => field.onChange(value || '')}
                                            value={field.value?.toString() || undefined}>
                                            <SelectTrigger className={`h-9 text-sm ${errors.asmcL_Id ? 'border-red-500' : ''}`}>
                                                <SelectValue placeholder={classLoading ? 'Loading...' : 'Select Class'} />
                                            </SelectTrigger>

                                            <SelectContent>
                                                {classData?.data?.map((cls: any) => (
                                                    <SelectItem key={cls.asmcL_Id} value={String(cls.asmcL_Id)}>
                                                        {cls.asmcL_ClassName}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </div>

                            {/* Section ✅ FIXED ALIGNMENT */}
                            <div className='space-y-1'>
                                <Label className='font-bold text-purple-900 text-xs uppercase'>
                                    Section <span className='text-orange-500'>*</span>
                                </Label>

                                <Controller
                                    name='asmS_Id'
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            key={field.value}
                                            onValueChange={(value) => field.onChange(value || '')}
                                            value={field.value?.toString() || undefined}>
                                            <SelectTrigger className={`h-9 text-sm ${errors.asmS_Id ? 'border-red-500' : ''}`}>
                                                <SelectValue placeholder={sectionLoading ? 'Loading...' : 'Select Section'} />
                                            </SelectTrigger>

                                            <SelectContent>
                                                {sectionData?.data?.map((sec: any) => (
                                                    <SelectItem key={sec.asmS_Id} value={String(sec.asmS_Id)}>
                                                        {sec.asmC_SectionName}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </div>
                        </div>
                        {/* ACTIONS */}
                        <div className='mt-5 flex items-center gap-3 border-t pt-4'>
                            <Button
                                type='submit'
                                size='sm'
                                disabled={mastersLoading}
                                className='h-8 bg-orange-500 px-4 font-semibold text-xs hover:bg-orange-600'>
                                <Search className='mr-1.5 h-3.5 w-3.5' />
                                Report
                            </Button>

                            <Button type='button' variant='outline' size='sm' onClick={handleReset} disabled={mastersLoading}>
                                <RotateCcw className='mr-1.5 h-4 w-4' />
                                Reset
                            </Button>

                            {mastersLoading && <Loader2 className='h-4 w-4 animate-spin text-purple-500' />}
                        </div>
                    </form>
                </div>
            </CollapsibleSection>
        </div>
    );
}
