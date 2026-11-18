'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Form } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSportsYearEndReport } from '@/hooks/sports/useSportsYearEndReport';
import { zodResolver } from '@hookform/resolvers/zod';
import { FileText, Loader2, RefreshCcw, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';
import { type SportsYearEndReportFormData, sportsYearEndReportSchema } from '../schema';
import type { IClass, ISection, ISportsYearEndReportData } from '../types';

interface ReportFormProps {
    onReportGenerated: (data: ISportsYearEndReportData[] | null) => void;
    onReset: () => void;
}

export default function ReportForm({ onReportGenerated, onReset }: ReportFormProps) {
    const { initialData, classMutation, sectionMutation, reportMutation } = useSportsYearEndReport();

    const [classList, setClassList] = useState<IClass[]>([]);
    const [sectionList, setSectionList] = useState<ISection[]>([]);

    const [classFilter, setClassFilter] = useState('');
    const [sectionFilter, setSectionFilter] = useState('');

    const form = useForm<SportsYearEndReportFormData>({
        resolver: zodResolver(sportsYearEndReportSchema),
        defaultValues: {
            type: 'AY',
            asmaY_Id: undefined,
            selectedClasslist: [],
            selectedSectionlist: []
        }
    });

    const {
        control,
        handleSubmit,
        formState: { errors }
    } = form;

    const watchedType = useWatch({ control: form.control, name: 'type' });
    const watchedYear = useWatch({ control: form.control, name: 'asmaY_Id' });
    const watchedClasses = useWatch({ control: form.control, name: 'selectedClasslist' });

    // Reset dependent fields when Type changes
    useEffect(() => {
        form.setValue('selectedClasslist', []);
        form.setValue('selectedSectionlist', []);
        setClassList([]);
        setSectionList([]);
    }, [watchedType, form]);

    // Fetch Classes when Year changes
    useEffect(() => {
        if (watchedYear && watchedType === 'CS') {
            classMutation.mutate(
                { asmaY_Id: watchedYear },
                {
                    onSuccess: (data) => {
                        setClassList(data.classList || []);
                    }
                }
            );
        } else {
            setClassList([]);
        }
        form.setValue('selectedClasslist', []);
        form.setValue('selectedSectionlist', []);
    }, [watchedYear, watchedType]);

    // Fetch Sections when Classes change
    useEffect(() => {
        if (watchedYear && watchedClasses && watchedClasses.length > 0 && watchedType === 'CS') {
            // Usually in this project, they fetch sections for the first selected class or combine them.
            // Following common pattern: fetch for the first one or if the API supports bulk (usually it's per class in these mutations)
            // But if the mutation only takes one ID, we'll fetch for the latest added or just the first.
            // Actually, looking at YearEndReportDTO, they send a list.
            // If the sectionMutation only takes one ID, we might need to adjust or just use the first/last.
            // Let's assume the mutation can be enhanced or just use the pattern from StudentAgeCalculation.
            const asmcL_Id = watchedClasses[watchedClasses.length - 1].asmcL_Id;
            sectionMutation.mutate(
                { asmaY_Id: watchedYear, asmcL_Id: asmcL_Id },
                {
                    onSuccess: (data) => {
                        // Append new sections or replace? Standard is usually replace or refresh based on all selected classes.
                        // For simplicity and matching common UI:
                        setSectionList(data.sectionList || []);
                    }
                }
            );
        } else {
            setSectionList([]);
        }
        form.setValue('selectedSectionlist', []);
    }, [watchedClasses]);

    function onSubmit(data: SportsYearEndReportFormData) {
        reportMutation.mutate(
            {
                ASMAY_Id: data.asmaY_Id,
                Type: data.type,
                selectedClasslist: data.type === 'CS' ? data.selectedClasslist.map((c) => ({ ASMCL_Id: c.asmcL_Id })) : [],
                selectedSectionlist: data.type === 'CS' ? data.selectedSectionlist.map((s) => ({ ASMS_Id: s.asmS_Id })) : []
            },
            {
                onSuccess: (responseData) => {
                    onReportGenerated(responseData);
                    if (responseData && responseData.length > 0) {
                        toast.success('Report generated successfully');
                    } else {
                        toast.info('No records found');
                    }
                },
                onError: (error) => {
                    console.error(error);
                    toast.error('Failed to generate report');
                }
            }
        );
    }

    const toggleAll = (list: any[], key: string, fieldName: any, checked: boolean) => {
        if (checked) {
            form.setValue(
                fieldName,
                list.map((item) => ({ [key]: item[key] }))
            );
        } else {
            form.setValue(fieldName, []);
        }
    };

    const handleReset = () => {
        form.reset();
        setClassList([]);
        setSectionList([]);
        onReset();
        window.location.reload();
    };

    const filteredClasses = classList.filter((c) => c.asmcL_ClassName.toLowerCase().includes(classFilter.toLowerCase()));
    const filteredSections = sectionList.filter((s) => s.asmC_SectionName.toLowerCase().includes(sectionFilter.toLowerCase()));

    return (
        <Card>
            <CardHeader className='border-b bg-primary/5 py-4'>
                <CardTitle className='flex items-center gap-2 font-bold text-lg'>
                    <FileText className='h-5 w-5 text-primary' />
                    Sports Year End Report Filter
                </CardTitle>
            </CardHeader>
            <CardContent className='pt-6'>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
                        {/* Type Selection */}
                        <div className='space-y-3'>
                            <Controller
                                control={control}
                                name='type'
                                render={({ field }) => (
                                    <div className='flex flex-col gap-2'>
                                        <RadioGroup
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                            className='flex justify-center space-x-12 rounded-xl border-2 border-primary/10 bg-primary/5 p-4'>
                                            <div className='flex cursor-pointer items-center space-x-3 rounded-lg border bg-white px-6 py-3 shadow-sm transition-all hover:border-primary/50'>
                                                <RadioGroupItem value='AY' id='type-ay' className='h-5 w-5' />
                                                <label
                                                    htmlFor='type-ay'
                                                    className='cursor-pointer font-bold text-sm uppercase tracking-tight'>
                                                    Academic Year
                                                </label>
                                            </div>
                                            <div className='flex cursor-pointer items-center space-x-3 rounded-lg border bg-white px-6 py-3 shadow-sm transition-all hover:border-primary/50'>
                                                <RadioGroupItem value='CS' id='type-cs' className='h-5 w-5' />
                                                <label
                                                    htmlFor='type-cs'
                                                    className='cursor-pointer font-bold text-sm uppercase tracking-tight'>
                                                    By Class / Section
                                                </label>
                                            </div>
                                        </RadioGroup>
                                        {errors.type && <span className='font-medium text-destructive text-xs'>{errors.type.message}</span>}
                                    </div>
                                )}
                            />
                        </div>

                        <div className='grid grid-cols-1 gap-8 md:grid-cols-3'>
                            {/* Academic Year */}
                            <div className='flex flex-col gap-2'>
                                <Label className="mr-1 font-bold text-muted-foreground text-sm uppercase tracking-wider after:ml-0.5 after:text-red-500 after:content-['*']">
                                    Academic Year
                                </Label>
                                <Controller
                                    control={control}
                                    name='asmaY_Id'
                                    render={({ field }) => (
                                        <div className='flex flex-col gap-1'>
                                            <Select
                                                onValueChange={(value) => field.onChange(Number(value))}
                                                value={field.value?.toString()}
                                                disabled={initialData.isLoading}>
                                                <SelectTrigger
                                                    className={
                                                        errors.asmaY_Id
                                                            ? 'h-11 border-2 border-destructive bg-white shadow-sm ring-destructive/20 transition-all'
                                                            : 'h-11 border-2 bg-white shadow-sm transition-all focus:ring-primary/20'
                                                    }>
                                                    <SelectValue placeholder='Select Year' />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {initialData.data?.yearlist?.map((year) => (
                                                        <SelectItem key={year.asmaY_Id} value={year.asmaY_Id.toString()}>
                                                            {year.asmaY_Year}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.asmaY_Id && (
                                                <span className='font-medium text-destructive text-xs'>{errors.asmaY_Id.message}</span>
                                            )}
                                        </div>
                                    )}
                                />
                            </div>

                            {/* Class Selection (CS Only) */}
                            {watchedType === 'CS' && (
                                <div className='flex flex-col gap-2'>
                                    <Label className="mr-1 font-bold text-muted-foreground text-sm uppercase tracking-wider after:ml-0.5 after:text-red-500 after:content-['*']">
                                        Class
                                    </Label>
                                    <Controller
                                        control={control}
                                        name='selectedClasslist'
                                        render={({ field }) => (
                                            <div className='flex flex-col gap-1'>
                                                <div
                                                    className={`space-y-3 rounded-xl border-2 bg-white p-3 shadow-sm ${errors.selectedClasslist ? 'border-destructive ring-destructive/20' : ''}`}>
                                                    <div className='flex items-center gap-3 border-b pb-2'>
                                                        <Checkbox
                                                            id='all-classes'
                                                            checked={classList.length > 0 && field.value?.length === classList.length}
                                                            onCheckedChange={(checked) =>
                                                                toggleAll(classList, 'asmcL_Id', 'selectedClasslist', !!checked)
                                                            }
                                                        />
                                                        <label htmlFor='all-classes' className='cursor-pointer font-bold text-xs uppercase'>
                                                            All
                                                        </label>
                                                        <div className='relative flex-1'>
                                                            <Search className='-translate-y-1/2 absolute top-1/2 left-2 h-3.5 w-3.5 text-muted-foreground' />
                                                            <Input
                                                                placeholder='Search...'
                                                                className='h-8 border-none bg-muted/30 pl-8 text-xs focus-visible:ring-0'
                                                                value={classFilter}
                                                                onChange={(e) => setClassFilter(e.target.value)}
                                                            />
                                                        </div>
                                                    </div>
                                                    <ScrollArea className='h-32 pr-4'>
                                                        <div className='space-y-2.5'>
                                                            {filteredClasses.map((cls) => (
                                                                <div key={cls.asmcL_Id} className='group flex items-center gap-3'>
                                                                    <Checkbox
                                                                        id={`class-${cls.asmcL_Id}`}
                                                                        checked={field.value?.some((v) => v.asmcL_Id === cls.asmcL_Id)}
                                                                        onCheckedChange={(checked) => {
                                                                            const current = [...(field.value || [])];
                                                                            if (checked) {
                                                                                field.onChange([...current, { asmcL_Id: cls.asmcL_Id }]);
                                                                            } else {
                                                                                field.onChange(
                                                                                    current.filter((v) => v.asmcL_Id !== cls.asmcL_Id)
                                                                                );
                                                                            }
                                                                        }}
                                                                    />
                                                                    <label
                                                                        htmlFor={`class-${cls.asmcL_Id}`}
                                                                        className='cursor-pointer font-medium text-sm leading-none transition-colors group-hover:text-primary'>
                                                                        {cls.asmcL_ClassName}
                                                                    </label>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </ScrollArea>
                                                </div>
                                                {errors.selectedClasslist && (
                                                    <span className='font-medium text-destructive text-xs'>
                                                        {errors.selectedClasslist.message}
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    />
                                </div>
                            )}

                            {/* Section Selection (CS Only) */}
                            {watchedType === 'CS' && (
                                <div className='flex flex-col gap-2'>
                                    <Label className="mr-1 font-bold text-muted-foreground text-sm uppercase tracking-wider after:ml-0.5 after:text-red-500 after:content-['*']">
                                        Section
                                    </Label>
                                    <Controller
                                        control={control}
                                        name='selectedSectionlist'
                                        render={({ field }) => (
                                            <div className='flex flex-col gap-1'>
                                                <div
                                                    className={`space-y-3 rounded-xl border-2 bg-white p-3 shadow-sm ${errors.selectedSectionlist ? 'border-destructive ring-destructive/20' : ''}`}>
                                                    <div className='flex items-center gap-3 border-b pb-2'>
                                                        <Checkbox
                                                            id='all-sections'
                                                            checked={sectionList.length > 0 && field.value?.length === sectionList.length}
                                                            onCheckedChange={(checked) =>
                                                                toggleAll(sectionList, 'asmS_Id', 'selectedSectionlist', !!checked)
                                                            }
                                                        />
                                                        <label
                                                            htmlFor='all-sections'
                                                            className='cursor-pointer font-bold text-xs uppercase'>
                                                            All
                                                        </label>
                                                        <div className='relative flex-1'>
                                                            <Search className='-translate-y-1/2 absolute top-1/2 left-2 h-3.5 w-3.5 text-muted-foreground' />
                                                            <Input
                                                                placeholder='Search...'
                                                                className='h-8 border-none bg-muted/30 pl-8 text-xs focus-visible:ring-0'
                                                                value={sectionFilter}
                                                                onChange={(e) => setSectionFilter(e.target.value)}
                                                            />
                                                        </div>
                                                    </div>
                                                    <ScrollArea className='h-32 pr-4'>
                                                        <div className='space-y-2.5'>
                                                            {filteredSections.map((sec) => (
                                                                <div key={sec.asmS_Id} className='group flex items-center gap-3'>
                                                                    <Checkbox
                                                                        id={`section-${sec.asmS_Id}`}
                                                                        checked={field.value?.some((v) => v.asmS_Id === sec.asmS_Id)}
                                                                        onCheckedChange={(checked) => {
                                                                            const current = [...(field.value || [])];
                                                                            if (checked) {
                                                                                field.onChange([...current, { asmS_Id: sec.asmS_Id }]);
                                                                            } else {
                                                                                field.onChange(
                                                                                    current.filter((v) => v.asmS_Id !== sec.asmS_Id)
                                                                                );
                                                                            }
                                                                        }}
                                                                    />
                                                                    <label
                                                                        htmlFor={`section-${sec.asmS_Id}`}
                                                                        className='cursor-pointer font-medium text-sm leading-none transition-colors group-hover:text-primary'>
                                                                        {sec.asmC_SectionName}
                                                                    </label>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </ScrollArea>
                                                </div>
                                                {errors.selectedSectionlist && (
                                                    <span className='font-medium text-destructive text-xs'>
                                                        {errors.selectedSectionlist.message}
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Buttons */}
                        <div className='flex justify-center gap-6 border-t pt-6'>
                            <Button
                                type='submit'
                                className='h-12 min-w-[180px] rounded-xl font-bold shadow-lg transition-all hover:scale-[1.02] hover:shadow-primary/20 active:scale-[0.98]'
                                disabled={reportMutation.isPending}>
                                {reportMutation.isPending ? (
                                    <Loader2 className='mr-2 h-5 w-5 animate-spin' />
                                ) : (
                                    <FileText className='mr-2 h-5 w-5' />
                                )}
                                GENERATE REPORT
                            </Button>
                            <Button
                                type='button'
                                variant='outline'
                                onClick={handleReset}
                                className='h-12 min-w-[180px] rounded-xl border-2 font-bold uppercase tracking-tight transition-all hover:bg-muted'>
                                <RefreshCcw className='mr-2 h-5 w-5 text-muted-foreground' />
                                RESET FORM
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
