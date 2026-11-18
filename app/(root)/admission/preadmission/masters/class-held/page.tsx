'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { FormError } from '@/components/ui/extension/field';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMasterClassHeldAllDetails } from '@/hooks/admission/preadmission/useMasters';
import { masterClassHeldSchema } from '@/schemas/admission/preadmission/masters';
import { addOrUpdateMasterClassHeld, getClassHeldData } from '@/server/admission/preadmission/masters/class_held';
import type { IAcademicYearDropDown } from '@/types/admission/preadmission/masters';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

type FormFields = z.infer<typeof masterClassHeldSchema.add>;

interface MonthData {
    ivrM_Month_Id: number;
    ivrM_Month_Name: string;
    ivrM_Month_Max_Days: number;
}

interface ClassHeldRow {
    ivrM_Month_Id: number;
    ivrM_Month_Name: string;
    ivrM_Month_Max_Days: number;
    ascH_ClassHeld: string;
    selected: boolean;
    is_Active: boolean;
    displayName: string;
    year: number;
}

export default function MasterClassHeldPage() {
    const [classId, setClassId] = useState<number | null>(null);
    const [sectionId, setSectionId] = useState<string>('');
    const [showTable, setShowTable] = useState(false);
    const [selectAll, setSelectAll] = useState(false);
    const [classHeldData, setClassHeldData] = useState<ClassHeldRow[]>([]);
    const [selectedAcademicYear, setSelectedAcademicYear] = useState<IAcademicYearDropDown | null>(null);

    const { data: allDetails, isLoading: isAllDetailsLoading, isError: isAllDetailsError } = useMasterClassHeldAllDetails();

    const academicYear = useMemo(() => ({ data: allDetails?.data?.allyear || [] }), [allDetails?.data?.allyear]);
    const masterClass = useMemo(() => ({ data: allDetails?.data?.classDrpDwn || [] }), [allDetails?.data?.classDrpDwn]);
    const masterSection = useMemo(() => ({ data: allDetails?.data?.sectionDrpDwn || [] }), [allDetails?.data?.sectionDrpDwn]);
    const masterMonthDropDown = useMemo(() => ({ data: allDetails?.data?.monthList || [] }), [allDetails?.data?.monthList]);

    const ayLoading = isAllDetailsLoading;
    const preadmissionClassLoading = isAllDetailsLoading;
    const preadmissionSectionLoading = isAllDetailsLoading;
    const preadmissionMonthLoading = isAllDetailsLoading;

    const preadmissionClassError = isAllDetailsError;
    const preadmissionSectionError = isAllDetailsError;
    const preadmissionMonthError = isAllDetailsError;
    console.log('sectionId', sectionId);
    const {
        control,
        handleSubmit,
        reset,
        setValue,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(masterClassHeldSchema.add),
        defaultValues: {
            asmaY_Id: 0,
            classCategory: '',
            section: '',
            classHeldData: []
        },
        mode: 'onChange'
    });

    useEffect(() => {
        if (allDetails?.data?.currentYear && allDetails?.data?.currentYear.length > 0) {
            const currentYearId = allDetails.data.currentYear[0].asmaY_Id;
            const selectedYear = allDetails.data.allyear?.find((item: any) => item.asmaY_Id === currentYearId);
            if (selectedYear) {
                setValue('asmaY_Id', currentYearId);
                setSelectedAcademicYear(selectedYear);
            }
        }
    }, [allDetails, setValue]);

    const filteredMonths = useMemo(() => {
        if (!masterMonthDropDown?.data || !Array.isArray(masterMonthDropDown.data) || !selectedAcademicYear) {
            return [];
        }

        const fromDate = new Date(selectedAcademicYear.asmaY_From_Date);
        const toDate = new Date(selectedAcademicYear.asmaY_To_Date);

        const result: ClassHeldRow[] = [];
        const currentDate = new Date(fromDate);

        while (currentDate <= toDate) {
            const monthNum = currentDate.getMonth() + 1;
            const year = currentDate.getFullYear();

            const monthData = masterMonthDropDown.data.find((m: MonthData) => m.ivrM_Month_Id === monthNum);

            if (monthData) {
                const monthShortName = monthData.ivrM_Month_Name;
                const displayName = `${monthShortName}-${year}`;

                // Handle Leap Year for February
                const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
                const maxDays = monthNum === 2 && isLeapYear ? 29 : monthData.ivrM_Month_Max_Days;

                result.push({
                    ivrM_Month_Id: monthData.ivrM_Month_Id,
                    ivrM_Month_Name: monthData.ivrM_Month_Name,
                    ivrM_Month_Max_Days: maxDays,
                    ascH_ClassHeld: '',
                    selected: false,
                    is_Active: true,
                    displayName: displayName,
                    year: year
                });
            }

            currentDate.setMonth(currentDate.getMonth() + 1);
        }

        return result;
    }, [masterMonthDropDown, selectedAcademicYear]);

    useEffect(() => {
        if (filteredMonths.length > 0) {
            setClassHeldData(filteredMonths);
        } else {
            setClassHeldData([]);
        }
    }, [filteredMonths]);

    useEffect(() => {
        if (selectedAcademicYear && classId && sectionId && filteredMonths.length > 0) {
            setShowTable(true);
            
            const fetchAllData = async () => {
                try {
                    const payload = {
                        amaY_Id: selectedAcademicYear.asmaY_Id,
                        asmcL_Id: classId,
                        asmS_Id: Number(sectionId),
                        selectedmonthList: filteredMonths.map((m: any) => ({
                            ivrM_Month_Id: m.ivrM_Month_Id,
                            ivrM_Month_Name: m.ivrM_Month_Name,
                            is_Active: m.is_Active,
                            ivrM_Month_Max_Days: m.ivrM_Month_Max_Days,
                            ascH_ClassHeld: 0
                        }))
                    };
                    
                    const response = await getClassHeldData(payload);
                    if (response.success || response.noOfClassHeldCount || response.data?.noOfClassHeldCount) {
                        const counts: number[] = response.noOfClassHeldCount || response.data?.noOfClassHeldCount || [];
                        setClassHeldData((prev) => {
                            const newData = [...prev];
                            let anySelected = false;
                            if (Array.isArray(counts)) {
                                counts.forEach((count: number, i: number) => {
                                    if (count > 0 && newData[i]) {
                                        newData[i] = { ...newData[i], ascH_ClassHeld: count.toString(), selected: true };
                                        anySelected = true;
                                    } else if (newData[i]) {
                                        newData[i] = { ...newData[i], ascH_ClassHeld: '', selected: false };
                                    }
                                });
                            }
                            
                            if (anySelected && newData.every((row) => row.selected)) {
                                setSelectAll(true);
                            } else {
                                setSelectAll(false);
                            }
                            
                            return newData;
                        });
                    }
                } catch (error) {
                    console.error('Failed to fetch initial class held data', error);
                }
            };
            
            fetchAllData();
        } else {
            setShowTable(false);
        }
    }, [selectedAcademicYear, classId, sectionId, filteredMonths]);

    useEffect(() => {
        const selectedRows = classHeldData
            .filter((row) => row.selected)
            .map((row) => ({
                ivrM_Month_Id: row.ivrM_Month_Id,
                ivrM_Month_Name: row.ivrM_Month_Name,
                is_Active: row.is_Active,
                ivrM_Month_Max_Days: row.ivrM_Month_Max_Days,
                ascH_ClassHeld: Number.parseFloat(row.ascH_ClassHeld) || 0
            }));

        setValue('classHeldData', selectedRows as any, { shouldValidate: true });
    }, [classHeldData, setValue]);

    const fetchClassHeldData = async (selectedMonths: any[], indices: number[]) => {
        if (!selectedAcademicYear || !classId || !sectionId || selectedMonths.length === 0) return;
        try {
            const payload = {
                amaY_Id: selectedAcademicYear.asmaY_Id,
                asmcL_Id: classId,
                asmS_Id: Number(sectionId),
                selectedmonthList: selectedMonths.map((m: any) => ({
                    ivrM_Month_Id: m.ivrM_Month_Id,
                    ivrM_Month_Name: m.ivrM_Month_Name,
                    is_Active: m.is_Active,
                    ivrM_Month_Max_Days: m.ivrM_Month_Max_Days,
                    ascH_ClassHeld: Number.parseFloat(m.ascH_ClassHeld) || 0
                }))
            };
            const response = await getClassHeldData(payload);
            // Assuming response contains noOfClassHeldCount array matching selected months
            if (response.success || response.noOfClassHeldCount || response.data?.noOfClassHeldCount) {
                const counts: number[] = response.noOfClassHeldCount || response.data?.noOfClassHeldCount || [];
                setClassHeldData((prev) => {
                    const newData = [...prev];
                    if (Array.isArray(counts)) {
                        counts.forEach((count: number, i: number) => {
                            const targetIndex = indices[i];
                            if (targetIndex !== undefined) {
                                if (count >= 0) {
                                    newData[targetIndex] = { ...newData[targetIndex], ascH_ClassHeld: count.toString() };
                                }
                            }
                        });
                    }
                    return newData;
                });
            }
        } catch (error) {
            console.error('Failed to fetch class held data', error);
        }
    };

    const handleSelectAll = (checked: boolean) => {
        setSelectAll(checked);
        const newData = classHeldData.map((row) => ({
            ...row,
            selected: checked,
            ascH_ClassHeld: checked ? '0' : ''
        }));
        setClassHeldData(newData);

        if (checked) {
            fetchClassHeldData(newData, newData.map((_, i) => i));
        }
    };

    const handleRowSelect = (index: number, checked: boolean) => {
        setClassHeldData((prev) => {
            const newData = [...prev];
            newData[index] = {
                ...newData[index],
                selected: checked,
                ascH_ClassHeld: checked ? '0' : ''
            };

            const allSelected = newData.every((row) => row.selected);
            setSelectAll(allSelected);

            if (checked) {
                const selectedRows = newData.filter(r => r.selected);
                const indices = newData.map((r, i) => r.selected ? i : -1).filter(i => i !== -1);
                fetchClassHeldData(selectedRows, indices);
            }

            return newData;
        });
    };

    const handleClassHeldChange = (index: number, value: string) => {
        if (value === '') {
            setClassHeldData((prev) => {
                const newData = [...prev];
                newData[index] = { ...newData[index], ascH_ClassHeld: '' };
                return newData;
            });
            return;
        }

        const numValue = Number.parseFloat(value) || 0;
        const maxDays = classHeldData[index].ivrM_Month_Max_Days;

        if (numValue > maxDays) {
            toast.error(`Class held cannot exceed ${maxDays} days for ${classHeldData[index].displayName}`);
            return;
        }

        if (numValue < 0) {
            toast.error('Class held cannot be negative');
            return;
        }

        setClassHeldData((prev) => {
            const newData = [...prev];
            newData[index] = { ...newData[index], ascH_ClassHeld: value };
            return newData;
        });
    };

    const onSubmit = async (data: FormFields) => {
        try {
            const invalidRows = classHeldData.filter(
                (row) =>
                    row.selected &&
                    (Number.parseFloat(row.ascH_ClassHeld) > row.ivrM_Month_Max_Days ||
                        Number.parseFloat(row.ascH_ClassHeld) < 0 ||
                        row.ascH_ClassHeld === '' ||
                        !/^[0-9]+(\.[5]{1})?$/.test(row.ascH_ClassHeld))
            );

            if (invalidRows.length > 0) {
                toast.error('Please enter valid class held values for all selected months');
                return;
            }

            const payload = {
                amaY_Id: data.asmaY_Id,
                asmcL_Id: Number(data.classCategory),
                asmS_Id: Number(data.section),
                selectedmList: data.classHeldData.map((item: any) => ({
                    ivrM_Month_Id: item.ivrM_Month_Id,
                    ascH_ClassHeld: Number.parseFloat(item.ascH_ClassHeld) || 0
                }))
            };

            const response = await addOrUpdateMasterClassHeld(payload);

            if (response.success) {
                toast.success(response.message);
                handleReset();
            } else {
                toast.error(response.message);
            }
        } catch (error: any) {
            toast.error(error?.message || 'Failed to save class held data');
        }
    };

    const handleReset = () => {
        reset({
            asmaY_Id: 0,
            classCategory: '',
            section: '',
            classHeldData: []
        });
        setClassId(null);
        setSectionId('');
        setShowTable(false);
        setSelectAll(false);
        setSelectedAcademicYear(null);
        setClassHeldData([]);
    };

    const handleTableReset = () => {
        setSelectAll(false);
        setClassHeldData((prev) => prev.map((row) => ({ ...row, selected: false, ascH_ClassHeld: '' })));
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleSubmit(onSubmit)(e);
    };

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                <div className='space-y-4'>
                    <CollapsibleSection
                        title='Master Class Held'
                        description='Manage class held information for academic year'
                        defaultOpen={true}
                        variant='default'
                        size='lg'
                        className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                        <div className='space-y-6'>
                            <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                                {/* Academic Year */}
                                <div className='group flex flex-col gap-1.5'>
                                    <Label aria-label='Academic Year' htmlFor='asmaY_Id'>
                                        Academic Year <span className='ml-1 text-red-500'>*</span>
                                    </Label>
                                    <Controller
                                        name='asmaY_Id'
                                        control={control}
                                        render={({ field }) => (
                                            <Select
                                                onValueChange={(value) => {
                                                    const numValue = Number(value);
                                                    field.onChange(numValue);

                                                    const selectedYear = academicYear?.data?.find((item: any) => item.asmaY_Id === numValue);
                                                    setSelectedAcademicYear(selectedYear || null);

                                                    setClassId(null);
                                                    setSectionId('');
                                                    setValue('classCategory', '');
                                                    setValue('section', '');
                                                }}
                                                value={field.value > 0 ? field.value.toString() : ''}>
                                                <SelectTrigger className='w-full'>
                                                    <SelectValue placeholder='Select Academic Year' />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {ayLoading ? (
                                                        <SelectItem value='loading' disabled>
                                                            Loading...
                                                        </SelectItem>
                                                    ) : (
                                                        academicYear?.data?.map((item: any) => (
                                                            <SelectItem key={item.asmaY_Id} value={item.asmaY_Id.toString()}>
                                                                {item.asmaY_Year}
                                                            </SelectItem>
                                                        ))
                                                    )}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                    {errors.asmaY_Id && <FormError>{errors.asmaY_Id.message}</FormError>}
                                </div>

                                {/* Class */}
                                <div className='group flex flex-col gap-1.5'>
                                    <Label aria-label='Class' htmlFor='classCategory'>
                                        Class <span className='ml-1 text-red-500'>*</span>
                                    </Label>
                                    <Controller
                                        name='classCategory'
                                        control={control}
                                        render={({ field }) => (
                                            <Select
                                                onValueChange={(value) => {
                                                    field.onChange(value);
                                                    setClassId(Number(value));
                                                    setSectionId('');
                                                    setValue('section', '');
                                                }}
                                                value={field.value}
                                                disabled={!selectedAcademicYear}>
                                                <SelectTrigger className='w-full'>
                                                    <SelectValue placeholder='Select Class' />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {preadmissionClassLoading ? (
                                                        <SelectItem value='loading' disabled>
                                                            Loading...
                                                        </SelectItem>
                                                    ) : preadmissionClassError ? (
                                                        <SelectItem value='error' disabled>
                                                            Error loading
                                                        </SelectItem>
                                                    ) : (
                                                        masterClass?.data?.map((item: any) => (
                                                            <SelectItem key={item.asmcL_Id} value={item.asmcL_Id.toString()}>
                                                                {item.asmcL_ClassName}
                                                            </SelectItem>
                                                        ))
                                                    )}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                    {errors.classCategory && <FormError>{errors.classCategory.message}</FormError>}
                                </div>

                                {/* Section */}
                                <div className='group flex flex-col gap-1.5'>
                                    <Label aria-label='Section' htmlFor='section'>
                                        Section <span className='ml-1 text-red-500'>*</span>
                                    </Label>
                                    <Controller
                                        name='section'
                                        control={control}
                                        render={({ field }) => (
                                            <Select
                                                onValueChange={(value) => {
                                                    field.onChange(value);
                                                    setSectionId(value);
                                                }}
                                                value={field.value}
                                                disabled={!classId}>
                                                <SelectTrigger className='w-full'>
                                                    <SelectValue placeholder='Select Section' />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {preadmissionSectionLoading ? (
                                                        <SelectItem value='loading' disabled>
                                                            Loading...
                                                        </SelectItem>
                                                    ) : preadmissionSectionError ? (
                                                        <SelectItem value='error' disabled>
                                                            Error loading
                                                        </SelectItem>
                                                    ) : (
                                                        masterSection?.data?.map((opt: any) => (
                                                            <SelectItem key={opt.asmS_Id} value={opt.asmS_Id.toString()}>
                                                                {opt.asmC_SectionName}
                                                            </SelectItem>
                                                        ))
                                                    )}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                    {errors.section && <FormError>{errors.section.message}</FormError>}
                                </div>
                            </div>
                        </div>
                    </CollapsibleSection>

                    {showTable && (
                        <CollapsibleSection
                            title='Class Held Details'
                            description='Select months and enter class held values'
                            defaultOpen={true}
                            variant='default'
                            size='lg'
                            className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                            <div className='space-y-6'>
                                {preadmissionMonthLoading ? (
                                    <div className='flex items-center justify-center p-8'>
                                        <p>Loading months...</p>
                                    </div>
                                ) : preadmissionMonthError ? (
                                    <div className='flex items-center justify-center p-8 text-red-500'>
                                        <p>Error loading months</p>
                                    </div>
                                ) : classHeldData.length === 0 ? (
                                    <div className='flex items-center justify-center p-8 text-gray-500'>
                                        <p>No months available for the selected academic year period</p>
                                    </div>
                                ) : (
                                    <div className='overflow-x-auto rounded-lg border'>
                                        <div className='grid grid-cols-3 gap-4 border-b bg-muted/50 p-3 font-medium'>
                                            <div className='flex items-center justify-center gap-2'>
                                                <Checkbox checked={selectAll} onCheckedChange={handleSelectAll} />
                                                <span>Select All</span>
                                            </div>
                                            <div className='flex items-center justify-center'>Month</div>
                                            <div className='flex items-center justify-center'>Class Held</div>
                                        </div>
                                        <div className='divide-y'>
                                            {classHeldData.map((row, index) => (
                                                <div
                                                    key={`${row.ivrM_Month_Id}-${row.year}-${index}`}
                                                    className='grid grid-cols-3 gap-4 p-2 hover:bg-muted/50'>
                                                    <div className='flex items-center justify-center'>
                                                        <Checkbox
                                                            checked={row.selected}
                                                            onCheckedChange={(checked) => handleRowSelect(index, checked as boolean)}
                                                        />
                                                    </div>
                                                    <div className='flex items-center justify-center font-medium'>{row.displayName}</div>
                                                    <div className='flex items-center'>
                                                        <Input
                                                            type='number'
                                                            min='0'
                                                            step='0.5'
                                                            max={row.ivrM_Month_Max_Days}
                                                            placeholder={`Max ${row.ivrM_Month_Max_Days}`}
                                                            value={row.ascH_ClassHeld}
                                                            onChange={(e) => handleClassHeldChange(index, e.target.value)}
                                                            disabled={!row.selected}
                                                            className={`w-full ${
                                                                row.selected &&
                                                                row.ascH_ClassHeld !== '' &&
                                                                (Number.parseFloat(row.ascH_ClassHeld) > row.ivrM_Month_Max_Days || !/^[0-9]+(\.[5]{1})?$/.test(row.ascH_ClassHeld))
                                                                    ? 'border-red-500'
                                                                    : ''
                                                            }`}
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {errors.classHeldData && <FormError>{errors.classHeldData.message}</FormError>}

                                {errors.root && <FormError>{errors.root.message}</FormError>}

                                <div className='flex flex-col gap-3 border-t pt-4 sm:flex-row sm:justify-start'>
                                    <Button
                                        type='button'
                                        variant='destructive'
                                        onClick={handleReset}
                                        disabled={isSubmitting}
                                        className='order-2 w-fit transition-all duration-200 hover:scale-105 sm:order-1'>
                                        Clear
                                    </Button>
                                    <Button
                                        type='button'
                                        onClick={handleFormSubmit}
                                        disabled={isSubmitting || classHeldData.length === 0}
                                        className='order-1 w-fit transition-all duration-200 hover:scale-105 sm:order-2'>
                                        <div className='flex items-center'>
                                            <Save className='mr-2 h-4 w-4' />
                                            {isSubmitting ? 'Saving...' : 'Save'}
                                        </div>
                                    </Button>
                                </div>
                            </div>
                        </CollapsibleSection>
                    )}
                </div>
            </div>
        </div>
    );
}
