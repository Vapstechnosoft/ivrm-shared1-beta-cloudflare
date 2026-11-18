'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Form } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useStudentAgeCalculationReport } from '@/hooks/sports/useStudentAgeCalculationReport';
import { getClassesForYear, getSectionsForClass } from '@/server/sports/reports/student-age-calculation';
import {
    type IReportRequest,
    type IStudentAgeCalculationDropdowns,
    type IStudentAgeReport,
    type StudentAgeReportFormSchema,
    StudentAgeReportSchema
} from '@/types/sports/reports/student-age-calculation';
import { zodResolver } from '@hookform/resolvers/zod';
import { List, Loader2, Search, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';

interface ReportFormProps {
    onReportGenerated: (data: IStudentAgeReport[], payload: IReportRequest) => void;
    onReset: () => void;
    isPending?: boolean;
}

export default function ReportForm({ onReportGenerated, onReset, isPending }: ReportFormProps) {
    const { initialData } = useStudentAgeCalculationReport();

    const [classList, setClassList] = useState<IStudentAgeCalculationDropdowns['classList']>([]);
    const [sectionList, setSectionList] = useState<IStudentAgeCalculationDropdowns['sectionList']>([]);
    const [houseList, setHouseList] = useState<IStudentAgeCalculationDropdowns['houseList']>([]);

    const [houseFilter, setHouseFilter] = useState('');
    const [sectionFilter, setSectionFilter] = useState('');

    const form = useForm<StudentAgeReportFormSchema>({
        resolver: zodResolver(StudentAgeReportSchema),
        defaultValues: {
            type: 'House',
            asmaY_Id: undefined,
            spccmcC_Id: undefined,
            asmcL_Id: undefined,
            selectedSectionlist: [],
            selectedhouselist: []
        }
    });

    const {
        control,
        handleSubmit,
        formState: { errors }
    } = form;

    const watchedType = useWatch({ control: form.control, name: 'type' });
    const watchedYear = useWatch({ control: form.control, name: 'asmaY_Id' });
    const watchedClass = useWatch({ control: form.control, name: 'asmcL_Id' });

    // Reset dependent fields when Type changes
    useEffect(() => {
        console.log('🔵 [UI] watchedType or initialData.houseList changed. watchedType =', watchedType);
        form.setValue('asmaY_Id', undefined as any);
        form.setValue('asmcL_Id', 0); // Legacy: asmcL_Id: 0 for House type
        form.setValue('selectedSectionlist', []);
        form.setValue('selectedhouselist', []);
        setClassList([]);
        setSectionList([]);
        setHouseList(initialData.data?.houseList || []);
        onReset();
    }, [watchedType, form, initialData.data?.houseList]);

    useEffect(() => {
        console.log('🔵 [UI] initialData Status:', initialData.status);
        if (initialData.data) {
            console.log('🔵 [UI] initialData received. Yearlist length =', initialData.data.yearlist?.length || 0);
        }
        if (initialData.error) {
            console.error('🔴 [UI] initialData Error:', initialData.error);
        }
    }, [initialData.status, initialData.data, initialData.error]);

    // Initial house list population
    useEffect(() => {
        if (initialData.data?.houseList) {
            setHouseList(initialData.data.houseList);
        }
    }, [initialData.data?.houseList]);

    // Fetch Classes and Houses when Year changes
    useEffect(() => {
        if (watchedYear) {
            const fetchData = async () => {
                try {
                    const data = await getClassesForYear(watchedYear);
                    setClassList(data.classList || []);
                    setHouseList(data.houseList || []);
                } catch (error) {
                    console.error('Failed to fetch classes/houses', error);
                    toast.error('Failed to load classes and houses');
                }
            };
            fetchData();
        } else {
            setClassList([]);
            form.setValue('asmcL_Id', 0);
        }
    }, [watchedYear, form]);

    // Fetch Sections when Class changes (and Type is CS)
    useEffect(() => {
        if (watchedYear && watchedClass && watchedClass !== 0 && watchedType === 'CS') {
            const fetchSections = async () => {
                try {
                    const data = await getSectionsForClass(watchedYear, watchedClass);
                    setSectionList(data.sectionList || []);
                } catch (error) {
                    console.error('Failed to fetch sections', error);
                    toast.error('Failed to load sections');
                }
            };
            fetchSections();
        } else {
            setSectionList([]);
        }
    }, [watchedYear, watchedClass, watchedType]);

    const onSubmit = (data: StudentAgeReportFormSchema) => {
        const payload: IReportRequest = {
            ...data,
            asmcL_Id: data.type === 'House' ? 0 : data.asmcL_Id,
            selectedSectionlist: data.type === 'House' ? [] : data.selectedSectionlist
        };
        onReportGenerated([], payload);
    };

    const handleCancel = () => {
        form.reset();
        setClassList([]);
        setSectionList([]);
        setHouseList(initialData.data?.houseList || []);
        onReset();
    };

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

    const filteredHouses = houseList?.filter((h) => h.spccmH_HouseName.toLowerCase().includes(houseFilter.toLowerCase())) || [];
    const filteredSections = sectionList?.filter((s) => s.asmC_SectionName.toLowerCase().includes(sectionFilter.toLowerCase())) || [];

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6 rounded-lg border bg-card p-6 shadow-sm'>
                <div className='mb-4 flex items-center justify-between border-b pb-4'>
                    <h2 className='font-bold text-xl'>Student Age Calculation Report</h2>
                </div>

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
                                    className='flex justify-center space-x-8 rounded-md border bg-muted/20 p-4'>
                                    <div className='flex items-center space-x-3'>
                                        <RadioGroupItem value='House' id='type-house' />
                                        <label htmlFor='type-house' className='cursor-pointer font-medium'>
                                            By House
                                        </label>
                                    </div>
                                    <div className='flex items-center space-x-3'>
                                        <RadioGroupItem value='CS' id='type-cs' />
                                        <label htmlFor='type-cs' className='cursor-pointer font-medium'>
                                            By Class/Section
                                        </label>
                                    </div>
                                </RadioGroup>
                                {errors.type && <span className='font-medium text-destructive text-xs'>{errors.type.message}</span>}
                            </div>
                        )}
                    />
                </div>

                <div className='grid grid-cols-1 gap-8 md:grid-cols-2'>
                    {/* Left Column */}
                    <div className='space-y-6'>
                        {/* Academic Year */}
                        <div className='flex flex-col gap-2'>
                            <Label className="font-semibold text-sm after:ml-0.5 after:text-red-500 after:content-['*']">
                                Academic Year
                            </Label>
                            <Controller
                                control={control}
                                name='asmaY_Id'
                                render={({ field }) => (
                                    <div className='flex flex-col gap-1'>
                                        <Select
                                            onValueChange={(val) => field.onChange(Number(val))}
                                            value={field.value?.toString()}
                                            disabled={initialData.isLoading}>
                                            <SelectTrigger className={errors.asmaY_Id ? 'border-destructive ring-destructive/20' : ''}>
                                                <SelectValue placeholder={initialData.isLoading ? 'Loading...' : 'Select Academic Year'} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {initialData.data?.yearlist?.map((item) => (
                                                    <SelectItem key={item.asmaY_Id} value={item.asmaY_Id.toString()}>
                                                        {item.asmaY_Year}
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

                        {/* Competition Category (Hidden if not used in legacy form, but keeping if it exists in data) */}
                        {initialData.data?.categoryList && initialData.data.categoryList.length > 0 && (
                            <div className='flex flex-col gap-2'>
                                <Label>Competition Category</Label>
                                <Controller
                                    control={control}
                                    name='spccmcC_Id'
                                    render={({ field }) => (
                                        <div className='flex flex-col gap-1'>
                                            <Select
                                                onValueChange={(val) => field.onChange(Number(val))}
                                                value={field.value?.toString()}
                                                disabled={initialData.isLoading}>
                                                <SelectTrigger
                                                    className={errors.spccmcC_Id ? 'border-destructive ring-destructive/20' : ''}>
                                                    <SelectValue placeholder={initialData.isLoading ? 'Loading...' : 'Select Category'} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {initialData.data?.categoryList?.map((item) => (
                                                        <SelectItem key={item.spccmcC_Id} value={item.spccmcC_Id.toString()}>
                                                            {item.spccmcC_CompitionCategory}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.spccmcC_Id && (
                                                <span className='font-medium text-destructive text-xs'>{errors.spccmcC_Id.message}</span>
                                            )}
                                        </div>
                                    )}
                                />
                            </div>
                        )}

                        {/* Class (CS Only) */}
                        {watchedType === 'CS' && (
                            <div className='flex flex-col gap-2'>
                                <Label className="font-semibold text-sm after:ml-0.5 after:text-red-500 after:content-['*']">Class</Label>
                                <Controller
                                    control={control}
                                    name='asmcL_Id'
                                    render={({ field }) => (
                                        <div className='flex flex-col gap-1'>
                                            <Select
                                                onValueChange={(val) => field.onChange(Number(val))}
                                                value={field.value && field.value !== 0 ? field.value.toString() : ''}>
                                                <SelectTrigger className={errors.asmcL_Id ? 'border-destructive ring-destructive/20' : ''}>
                                                    <SelectValue placeholder='Select Class' />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {classList?.map((item) => (
                                                        <SelectItem key={item.asmcL_Id} value={item.asmcL_Id.toString()}>
                                                            {item.asmcL_ClassName}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.asmcL_Id && (
                                                <span className='font-medium text-destructive text-xs'>{errors.asmcL_Id.message}</span>
                                            )}
                                        </div>
                                    )}
                                />
                            </div>
                        )}
                    </div>

                    {/* Right Column */}
                    <div className='space-y-6'>
                        {/* House Selection */}
                        <div className='flex flex-col gap-2'>
                            <Label className="font-semibold text-sm after:ml-0.5 after:text-red-500 after:content-['*']">House Name</Label>
                            <Controller
                                control={control}
                                name='selectedhouselist'
                                render={({ field }) => (
                                    <div className='flex flex-col gap-1'>
                                        <div
                                            className={`rounded-md border bg-background p-2 ${errors.selectedhouselist ? 'border-destructive' : ''}`}>
                                            <div className='flex items-center space-x-2 border-b bg-muted/30 p-2'>
                                                <Checkbox
                                                    id='select-all-houses'
                                                    checked={houseList && houseList.length > 0 && field.value?.length === houseList.length}
                                                    onCheckedChange={(checked) =>
                                                        toggleAll(houseList || [], 'spccmH_Id', 'selectedhouselist', !!checked)
                                                    }
                                                />
                                                <label htmlFor='select-all-houses' className='font-medium text-sm'>
                                                    All
                                                </label>
                                                <div className='relative ml-auto w-1/2'>
                                                    <Search className='absolute top-2 left-2 h-3.5 w-3.5 text-muted-foreground' />
                                                    <Input
                                                        placeholder='Search...'
                                                        className='h-7 pl-8 text-xs'
                                                        value={houseFilter}
                                                        onChange={(e) => setHouseFilter(e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                            <ScrollArea className='h-[150px] w-full p-2'>
                                                {filteredHouses.length > 0 ? (
                                                    filteredHouses.map((item) => (
                                                        <div key={item.spccmH_Id} className='mb-2 flex items-center space-x-3'>
                                                            <Checkbox
                                                                id={`house-${item.spccmH_Id}`}
                                                                checked={field.value?.some((val) => val.spccmH_Id === item.spccmH_Id)}
                                                                onCheckedChange={(checked) => {
                                                                    const current = field.value || [];
                                                                    if (checked) {
                                                                        field.onChange([...current, { spccmH_Id: item.spccmH_Id }]);
                                                                    } else {
                                                                        field.onChange(
                                                                            current.filter((val) => val.spccmH_Id !== item.spccmH_Id)
                                                                        );
                                                                    }
                                                                }}
                                                            />
                                                            <label
                                                                htmlFor={`house-${item.spccmH_Id}`}
                                                                className='cursor-pointer text-sm hover:text-primary'>
                                                                {item.spccmH_HouseName}
                                                            </label>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className='p-4 text-center text-muted-foreground text-sm'>No houses found</div>
                                                )}
                                            </ScrollArea>
                                        </div>
                                        {errors.selectedhouselist && (
                                            <span className='font-medium text-destructive text-xs'>{errors.selectedhouselist.message}</span>
                                        )}
                                    </div>
                                )}
                            />
                        </div>

                        {/* Section Selection (CS Only) */}
                        {watchedType === 'CS' && (
                            <div className='flex flex-col gap-2'>
                                <Label className="font-semibold text-sm after:ml-0.5 after:text-red-500 after:content-['*']">
                                    Section Name
                                </Label>
                                <Controller
                                    control={control}
                                    name='selectedSectionlist'
                                    render={({ field }) => (
                                        <div className='flex flex-col gap-1'>
                                            <div
                                                className={`rounded-md border bg-background p-2 ${errors.selectedSectionlist ? 'border-destructive' : ''}`}>
                                                <div className='flex items-center space-x-2 border-b bg-muted/30 p-2'>
                                                    <Checkbox
                                                        id='select-all-sections'
                                                        checked={
                                                            sectionList &&
                                                            sectionList.length > 0 &&
                                                            field.value?.length === sectionList.length
                                                        }
                                                        onCheckedChange={(checked) =>
                                                            toggleAll(sectionList || [], 'asmS_Id', 'selectedSectionlist', !!checked)
                                                        }
                                                    />
                                                    <label htmlFor='select-all-sections' className='font-medium text-sm'>
                                                        All
                                                    </label>
                                                    <div className='relative ml-auto w-1/2'>
                                                        <Search className='absolute top-2 left-2 h-3.5 w-3.5 text-muted-foreground' />
                                                        <Input
                                                            placeholder='Search...'
                                                            className='h-7 pl-8 text-xs'
                                                            value={sectionFilter}
                                                            onChange={(e) => setSectionFilter(e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                                <ScrollArea className='h-[150px] w-full p-2'>
                                                    {filteredSections.length > 0 ? (
                                                        filteredSections.map((item) => (
                                                            <div key={item.asmS_Id} className='mb-2 flex items-center space-x-3'>
                                                                <Checkbox
                                                                    id={`section-${item.asmS_Id}`}
                                                                    checked={field.value?.some((val) => val.asmS_Id === item.asmS_Id)}
                                                                    onCheckedChange={(checked) => {
                                                                        const current = field.value || [];
                                                                        if (checked) {
                                                                            field.onChange([...current, { asmS_Id: item.asmS_Id }]);
                                                                        } else {
                                                                            field.onChange(
                                                                                current.filter((val) => val.asmS_Id !== item.asmS_Id)
                                                                            );
                                                                        }
                                                                    }}
                                                                />
                                                                <label
                                                                    htmlFor={`section-${item.asmS_Id}`}
                                                                    className='cursor-pointer text-sm hover:text-primary'>
                                                                    {item.asmC_SectionName}
                                                                </label>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <div className='p-4 text-center text-muted-foreground text-sm'>
                                                            No sections found
                                                        </div>
                                                    )}
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
                </div>

                <div className='flex justify-center gap-4 border-t pt-6'>
                    <Button type='submit' disabled={isPending} className='px-10'>
                        {isPending ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : <List className='mr-2 h-4 w-4' />}
                        Report
                    </Button>
                    <Button type='button' variant='destructive' onClick={handleCancel} className='px-10'>
                        <X className='mr-2 h-4 w-4' />
                        Cancel
                    </Button>
                </div>
            </form>
        </Form>
    );
}
