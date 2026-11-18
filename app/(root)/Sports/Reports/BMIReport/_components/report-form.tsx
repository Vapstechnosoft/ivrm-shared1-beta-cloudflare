'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useBMIReport } from '@/hooks/sports/useBMIReport';
import type { IBMIReportClass, IBMIReportRequest, IBMIReportSection } from '@/types/sports/reports/bmi-report';
import { type BMIReportFormSchema, bmiReportSchema } from '@/types/sports/reports/bmi-report';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';

interface ReportFormProps {
    setLastFormData: (data: IBMIReportRequest | null) => void;
    searchParams?: any;
    isLoading?: boolean;
}

export default function ReportForm({ setLastFormData, searchParams, isLoading }: ReportFormProps) {
    const { loadData, getClasses, getSections } = useBMIReport();

    const [classList, setClassList] = useState<IBMIReportClass[]>([]);
    const [sectionList, setSectionList] = useState<IBMIReportSection[]>([]);
    const [sectionSearch, setSectionSearch] = useState('');

    const {
        control,
        handleSubmit,
        setValue,
        formState: { errors }
    } = useForm<BMIReportFormSchema>({
        resolver: zodResolver(bmiReportSchema),
        defaultValues: {
            ASMAY_Id: 0,
            ASMCL_Id: 0,
            selectedSectionlist: []
        }
    });

    const watchYear = useWatch({ control, name: 'ASMAY_Id' });
    const watchClass = useWatch({ control, name: 'ASMCL_Id' });
    const watchSections = useWatch({ control, name: 'selectedSectionlist' }) || [];

    // Reset dependents when Year changes
    useEffect(() => {
        setValue('ASMCL_Id', 0);
        setValue('selectedSectionlist', []);
        setClassList([]);
        setSectionList([]);

        if (watchYear) {
            getClasses.mutate(watchYear, {
                onSuccess: (data: any) => setClassList(data)
            });
        }
    }, [watchYear, setValue, getClasses.mutate]);

    // Fetch Sections when Class Changes
    useEffect(() => {
        setValue('selectedSectionlist', []);
        setSectionList([]);

        if (watchYear && watchClass) {
            getSections.mutate(
                { asMAY_Id: watchYear, asmcL_Id: watchClass },
                {
                    onSuccess: (data: any) => setSectionList(data)
                }
            );
        }
    }, [watchClass, watchYear, getSections.mutate, setValue]);

    const onSubmit = (data: BMIReportFormSchema) => {
        setLastFormData(data as any);
        toast.info('Fetching report data...');
    };

    const handleClear = () => {
        setValue('ASMAY_Id', 0);
        setValue('ASMCL_Id', 0);
        setValue('selectedSectionlist', []);
        setLastFormData(null);
        setClassList([]);
        setSectionList([]);
    };

    // Filtered Sections for Multi-select
    const filteredSections = sectionList.filter((s) => s.asmC_SectionName.toLowerCase().includes(sectionSearch.toLowerCase()));

    const toggleSelectAllSections = () => {
        if (watchSections.length === filteredSections.length && filteredSections.length > 0) {
            setValue('selectedSectionlist', []);
        } else {
            const allIds = filteredSections.map((s) => ({ asmS_Id: s.asmS_Id }));
            setValue('selectedSectionlist', allIds);
        }
    };

    const isSectionSelected = (id: number) => watchSections.some((s) => s.asmS_Id === id);

    const toggleSection = (id: number) => {
        const current = watchSections;
        if (isSectionSelected(id)) {
            setValue(
                'selectedSectionlist',
                current.filter((s) => s.asmS_Id !== id)
            );
        } else {
            setValue('selectedSectionlist', [...current, { asmS_Id: id }]);
        }
    };

    return (
        <div className='rounded-md border bg-card p-4 shadow-sm'>
            <div className='mb-4 flex items-center justify-between border-b pb-2'>
                <h2 className='font-semibold text-lg'>BMI Report</h2>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                    {/* Academic Year */}
                    <div className='space-y-2'>
                        <Label>
                            Academic Year <span className='text-red-500'>*</span>
                        </Label>
                        <Controller
                            control={control}
                            name='ASMAY_Id'
                            render={({ field }) => (
                                <Select
                                    onValueChange={(val) => field.onChange(Number(val))}
                                    value={field.value ? field.value.toString() : ''}>
                                    <SelectTrigger>
                                        <SelectValue placeholder='Select Academic Year' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {loadData.data?.academicYear.map((item) => (
                                            <SelectItem key={item.asmaY_Id} value={item.asmaY_Id.toString()}>
                                                {item.asmaY_Year}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.ASMAY_Id && <p className='font-medium text-destructive text-sm'>{errors.ASMAY_Id.message}</p>}
                    </div>

                    {/* Class */}
                    <div className='space-y-2'>
                        <Label>
                            Class <span className='text-red-500'>*</span>
                        </Label>
                        <Controller
                            control={control}
                            name='ASMCL_Id'
                            render={({ field }) => (
                                <Select
                                    onValueChange={(val) => field.onChange(Number(val))}
                                    value={field.value ? field.value.toString() : ''}>
                                    <SelectTrigger>
                                        <SelectValue placeholder='Select Class' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {classList.map((item) => (
                                            <SelectItem key={item.asmcL_Id} value={item.asmcL_Id.toString()}>
                                                {item.asmcL_ClassName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.ASMCL_Id && <p className='font-medium text-destructive text-sm'>{errors.ASMCL_Id.message}</p>}
                    </div>
                </div>

                {/* Section Multiselect - Full Width or following grid */}
                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                    <div className='space-y-2'>
                        <Label>
                            Section Name <span className='text-red-500'>*</span>
                        </Label>
                        <div className='rounded-md border p-2'>
                            <Input
                                placeholder='Search here...'
                                className='mb-2 h-8'
                                value={sectionSearch}
                                onChange={(e) => setSectionSearch(e.target.value)}
                            />
                            <div className='mb-2 flex items-center space-x-2'>
                                <Checkbox
                                    id='select-all'
                                    checked={watchSections.length === filteredSections.length && filteredSections.length > 0}
                                    onCheckedChange={toggleSelectAllSections}
                                />
                                <label htmlFor='select-all' className='cursor-pointer font-medium text-sm'>
                                    All
                                </label>
                            </div>
                            <ScrollArea className='h-40'>
                                <div className='space-y-2'>
                                    {filteredSections.map((section) => (
                                        <div key={section.asmS_Id} className='flex items-center space-x-2'>
                                            <Checkbox
                                                id={`sec-${section.asmS_Id}`}
                                                checked={isSectionSelected(section.asmS_Id)}
                                                onCheckedChange={() => toggleSection(section.asmS_Id)}
                                            />
                                            <label htmlFor={`sec-${section.asmS_Id}`} className='cursor-pointer text-sm'>
                                                {section.asmC_SectionName}
                                            </label>
                                        </div>
                                    ))}
                                    {filteredSections.length === 0 && (
                                        <p className='text-center text-muted-foreground text-xs'>No sections found</p>
                                    )}
                                </div>
                            </ScrollArea>
                        </div>
                        {errors.selectedSectionlist && (
                            <p className='font-medium text-destructive text-sm'>{errors.selectedSectionlist.message}</p>
                        )}
                    </div>
                </div>

                <div className='flex justify-center gap-4'>
                    <Button type='submit' disabled={isLoading}>
                        {isLoading ? 'Generating...' : 'Report'}
                    </Button>
                    <Button type='button' variant='destructive' onClick={handleClear}>
                        Cancel
                    </Button>
                </div>
            </form>
        </div>
    );
}
