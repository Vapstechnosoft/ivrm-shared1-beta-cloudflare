'use client';

import { useAcademicYearDropdown } from '@/hooks/fees/useMasters';
import {
    useFeeClassListDefaulterreport,
    useFeeCustomGroupDefaulterreport,
    useFeeGroupDefaulterreport,
    useFeeSectionListDefaulterreport,
    useFeeTermDefaulterreport,
    useStudentDropDown
} from '@/hooks/fees/useReports';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { Checkbox } from '@/components/ui/checkbox';
import { FormError } from '@/components/ui/extension/field';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Input } from '@/components/ui/input';
import { feeSummerizedReportStjamesSchema } from '@/schemas/fees/reports';
import { feeClassWiseDueListreportSophia } from '@/server/fees/reports/sophia_reports';
import type {
    IFeeClassDropdownList,
    IFeeCustomGroupDropdownList,
    IFeeGroupDropdownList,
    IFeeSectionDropdownList,
    IFeeTermDropdownList
} from '@/types/fees/reports/reports';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

type FormFields = z.infer<typeof feeSummerizedReportStjamesSchema>;

interface IAcademicYear {
    asmaY_Id: string | number;
    asmaY_Year: string;
    asmaY_Order?: number;
}
interface IStudentData {
    amst_Id: number;
    amsT_FirstName: string;
    amsT_MiddleName?: string;
    amsT_LastName: string;
}
export default function FeeSummerizedReportStjames() {
    const {
        handleSubmit,
        setValue,
        control,
        watch,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(feeSummerizedReportStjamesSchema),
        defaultValues: {
            academicYearId: undefined,
            classId: undefined,
            sectionId: undefined
        }
    });

    const [studentDataList, setstudentData] = useState<IStudentData[]>([]);
    const [academicYears, setAcademicYears] = useState<IAcademicYear[]>([]);
    const [classes, setClasses] = useState<IFeeClassDropdownList[]>([]);
    const [sections, setSections] = useState<IFeeSectionDropdownList[]>([]);
    const [reportData, setReportData] = useState<any[]>([]);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    // biome-ignore lint/correctness/noUnusedVariables: <explanation>
    const [showReport, setShowReport] = useState(false);
    const [filters, setFilters] = useState({
        type: 'annual',
        filter: 'all'
    });
    const [feeGroups, setFeeGroups] = useState<IFeeGroupDropdownList[]>([]);
    const [feeTerms, setFeeTerms] = useState<IFeeTermDropdownList[]>([]);
    const [customGroups, setCustomGroups] = useState<IFeeCustomGroupDropdownList[]>([]);

    const { data: academicData, isLoading: loadingAcademic, error: academicError } = useAcademicYearDropdown();

    const { data: classListResponse, isLoading: loadingClasses, error: classListError } = useFeeClassListDefaulterreport();

    const { data: sectionListResponse, isLoading: loadingSections, error: sectionListError } = useFeeSectionListDefaulterreport();
    const { data: studentData, isLoading: loadingStudent, error: studentError } = useStudentDropDown();

    const { data: feegroupData, isLoading: loadingfeegroup, error: feegroupError } = useFeeGroupDefaulterreport();

    const { data: feetermData, isLoading: loadingfeeterm, error: feetermError } = useFeeTermDefaulterreport();

    const { data: customGroupResponse, isLoading: loadingCustomGroup, error: customGroupError } = useFeeCustomGroupDefaulterreport();

    useEffect(() => {
        if (academicError) {
            toast.error(academicError?.message || 'Failed to load academic years');
            setAcademicYears([]);
            return;
        }
        if (academicData?.data && Array.isArray(academicData.data)) {
            const formatted: IAcademicYear[] = academicData.data.map((item: any) => ({
                asmaY_Id: item.asmaY_Id ?? '',
                asmaY_Year: item.asmaY_Year ?? 'Unknown Year',
                asmaY_Order: item.asmaY_Order ?? 0
            }));
            setAcademicYears(formatted);
        }
    }, [academicData, academicError]);

    useEffect(() => {
        if (classListError) {
            toast.error(classListError?.message || 'Failed to load classes');
            setClasses([]);
            return;
        }
        if (classListResponse?.data && Array.isArray(classListResponse.data)) {
            setClasses(classListResponse.data);
        }
    }, [classListResponse, classListError]);

    const uniqueStudentDataList = studentDataList.filter(
        (student, index, self) => index === self.findIndex((s) => s.amst_Id === student.amst_Id)
    );

    useEffect(() => {
        if (sectionListError) {
            toast.error(sectionListError?.message || 'Failed to load Sections');
            setClasses([]);
            return;
        }
        if (sectionListResponse?.data && Array.isArray(sectionListResponse.data)) {
            setSections(sectionListResponse.data);
        }
    }, [sectionListResponse, sectionListError]);

    useEffect(() => {
        if (feegroupError) toast.error(feegroupError?.message || 'Failed to load fee groups');
        else if (feegroupData?.data) setFeeGroups(feegroupData.data);
    }, [feegroupData, feegroupError]);

    useEffect(() => {
        if (feetermError) toast.error(feetermError?.message || 'Failed to load terms');
        else if (feetermData?.data) setFeeTerms(feetermData.data);
    }, [feetermData, feetermError]);

    useEffect(() => {
        if (customGroupError) toast.error(customGroupError?.message || 'Failed to load custom groups');
        else if (customGroupResponse?.data) setCustomGroups(customGroupResponse.data);
    }, [customGroupResponse, customGroupError]);

    useEffect(() => {
        if (studentError) {
            toast.error(studentError?.message || 'Failed to load Student Data');
            setstudentData([]);
            return;
        }
        if (studentData?.data && Array.isArray(studentData.data)) {
            const formatted: IStudentData[] = studentData.data.map((item: any) => ({
                amsT_FirstName: item.amsT_FirstName ?? '',
                amst_Id: item.amst_Id ?? 0,
                amsT_MiddleName: item.amsT_MiddleName ?? '',
                amsT_LastName: item.amsT_LastName ?? ''
            }));
            setstudentData(formatted);
        }
    }, [studentData, studentError]);
    const toggleAllstudents = () => {
        if (selectedIds.length === reportData.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(reportData.map((r) => r.id));
        }
    };
    const toggleRow = (id: number) => {
        setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    };
    const onSubmit: SubmitHandler<FormFields> = async (data) => {
        setShowReport(false);
        try {
            const payload = {
                fmT_Ids: [],
                customflag: 'ACCOUNTWISE',
                asmaY_Id: data.academicYearId,
                radioval: '',
                active: 0,
                deactive: 0,
                left: 0
            };

            const apiData = await feeClassWiseDueListreportSophia(payload);
            // biome-ignore lint/suspicious/noConsoleLog: <explanation>
            console.log('apiData', apiData);
            const responseJson = typeof apiData === 'string' ? JSON.parse(apiData) : apiData;
            if (responseJson?.data) {
                setReportData(responseJson.data);
                setShowReport(true);
                toast.success('Report Generated Successfully');
            }
        } catch (error: any) {
            console.error('Error generating report:', error);
            toast.error(error.message || 'Failed to generate report');
            setShowReport(false);
        }
    };

    return (
        <div className='min-h-screen bg-gray-50 py-8'>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-8'>
                <div className='mx-auto max-w-7xl'>
                    <Card className='border-0 shadow-xl'>
                        <div className='place-items-center p-8'>
                            <div className='space-y-8'>
                                {/* First Card - Annual/Term Name */}
                                <Card className='min-w-[400px] flex-1 border bg-gray-50 p-5 shadow-sm'>
                                    <div className='flex items-center justify-center gap-12'>
                                        {[
                                            { label: 'Annual', value: 'annual' },
                                            { label: 'Term Name', value: 'term' }
                                        ].map((option) => (
                                            <Label key={option.value} className='flex cursor-pointer items-center gap-3 whitespace-nowrap'>
                                                <Input
                                                    type='radio'
                                                    checked={filters.type === option.value}
                                                    onChange={() => {
                                                        setFilters((prev) => ({
                                                            ...prev,
                                                            type: option.value
                                                        }));
                                                        setShowReport(false);
                                                        setReportData([]);
                                                        setSelectedIds([]);
                                                    }}
                                                    className='h-5 w-5 text-primary'
                                                />
                                                <span className='font-medium text-sm'>{option.label}</span>
                                            </Label>
                                        ))}
                                    </div>
                                </Card>

                                {/* Second Card - All/Individual */}
                                <Card className='min-w-[400px] flex-1 border bg-gray-50 p-5 shadow-sm'>
                                    <div className='flex items-center justify-center gap-12'>
                                        {[
                                            { label: 'All', value: 'all' },
                                            { label: 'Individual', value: 'individual' }
                                        ].map((option) => (
                                            <Label key={option.value} className='flex cursor-pointer items-center gap-3 whitespace-nowrap'>
                                                <Input
                                                    type='radio'
                                                    checked={filters.filter === option.value}
                                                    onChange={() => {
                                                        setFilters((prev) => ({
                                                            ...prev,
                                                            filter: option.value
                                                        }));
                                                        setShowReport(false);
                                                        setReportData([]);
                                                        setSelectedIds([]);
                                                    }}
                                                    className='h-5 w-5 text-primary'
                                                />
                                                <span className='font-medium text-sm'>{option.label}</span>
                                            </Label>
                                        ))}
                                    </div>
                                </Card>

                                {/* Rest of your form fields */}
                                <div className='flex items-center gap-12'>
                                    {/* Academic Year */}
                                    <div className='flex w-[420px] items-center gap-4'>
                                        <Label className='w-36 text-right'>
                                            Academic Year <span className='text-red-500'>*</span>
                                        </Label>

                                        <div className='flex-1'>
                                            <Controller
                                                name='academicYearId'
                                                control={control}
                                                render={({ field }) => (
                                                    <Select
                                                        value={field.value?.toString()}
                                                        onValueChange={(v) => field.onChange(Number(v))}>
                                                        <SelectTrigger className='w-full'>
                                                            <SelectValue placeholder='--Select Academic Year--' />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {loadingAcademic ? (
                                                                <SelectItem value='loading' disabled>
                                                                    Loading...
                                                                </SelectItem>
                                                            ) : (
                                                                academicYears?.map((item: any) => (
                                                                    <SelectItem key={item.asmaY_Id} value={item.asmaY_Id.toString()}>
                                                                        {item.asmaY_Year}
                                                                    </SelectItem>
                                                                ))
                                                            )}
                                                        </SelectContent>
                                                    </Select>
                                                )}
                                            />
                                            {errors.academicYearId && <FormError>{errors.academicYearId.message}</FormError>}
                                        </div>
                                    </div>

                                    <div className='flex w-[420px] items-center gap-4'>
                                        <Label className='w-36 text-right'>
                                            Class <span className='text-red-500'>*</span>
                                        </Label>

                                        <div className='flex-1'>
                                            <Controller
                                                name='classId'
                                                control={control}
                                                render={({ field }) => (
                                                    <Select
                                                        value={field.value && field.value !== 0 ? field.value.toString() : ''}
                                                        onValueChange={(v) => {
                                                            field.onChange(Number(v));
                                                            setValue('sectionId', 0);
                                                        }}>
                                                        <SelectTrigger className='w-full'>
                                                            <SelectValue placeholder='--Select Class--' />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {loadingClasses ? (
                                                                <SelectItem value='loading' disabled>
                                                                    Loading...
                                                                </SelectItem>
                                                            ) : (
                                                                classes.map((cls) => (
                                                                    <SelectItem key={cls.asmcL_Id} value={cls.asmcL_Id.toString()}>
                                                                        {cls.asmcL_ClassName}
                                                                    </SelectItem>
                                                                ))
                                                            )}
                                                        </SelectContent>
                                                    </Select>
                                                )}
                                            />
                                            {errors.classId && <FormError>{errors.classId.message}</FormError>}
                                        </div>
                                    </div>
                                </div>

                                <div className='mt-4 flex items-center gap-12'>
                                    {/* Section */}
                                    <div className='flex w-[420px] items-center gap-4'>
                                        <Label className='w-36 text-right'>
                                            Section <span className='text-red-500'>*</span>
                                        </Label>

                                        <div className='flex-1'>
                                            <Controller
                                                name='sectionId'
                                                control={control}
                                                render={({ field }) => (
                                                    <Select
                                                        value={field.value && field.value !== 0 ? field.value.toString() : ''}
                                                        onValueChange={(v) => field.onChange(Number(v))}>
                                                        <SelectTrigger className='w-full'>
                                                            <SelectValue placeholder='--Selct Section--' />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {loadingSections ? (
                                                                <SelectItem value='loading' disabled>
                                                                    Loading...
                                                                </SelectItem>
                                                            ) : (
                                                                sections.map((sec) => (
                                                                    <SelectItem key={sec.asmS_Id} value={sec.asmS_Id.toString()}>
                                                                        {sec.asmC_SectionName}
                                                                    </SelectItem>
                                                                ))
                                                            )}
                                                        </SelectContent>
                                                    </Select>
                                                )}
                                            />
                                            {errors.sectionId && <FormError>{errors.sectionId.message}</FormError>}
                                        </div>
                                    </div>
                                    {filters.filter === 'individual' && (
                                        <div className='flex w-[420px] items-center gap-4'>
                                            <div className='flex w-[420px] items-center gap-4'>
                                                <Label className='w-36 text-right'>
                                                    Student Name <span className='text-red-500'>*</span>
                                                </Label>

                                                <div className='flex-1'>
                                                    <Controller
                                                        name='studentId'
                                                        control={control}
                                                        render={({ field }) => (
                                                            <Select
                                                                value={field.value?.toString()}
                                                                onValueChange={(v) => field.onChange(Number(v))}>
                                                                <SelectTrigger className='w-full'>
                                                                    <SelectValue placeholder='--Select Student Name--' />
                                                                </SelectTrigger>

                                                                <SelectContent>
                                                                    {loadingStudent ? (
                                                                        <SelectItem value='loading' disabled>
                                                                            Loading...
                                                                        </SelectItem>
                                                                    ) : (
                                                                        uniqueStudentDataList.map((item: IStudentData) => (
                                                                            <SelectItem key={item.amst_Id} value={item.amst_Id.toString()}>
                                                                                {`${item.amsT_FirstName ?? ''} ${item.amsT_MiddleName ?? ''} ${item.amsT_LastName ?? ''}`}
                                                                            </SelectItem>
                                                                        ))
                                                                    )}
                                                                </SelectContent>
                                                            </Select>
                                                        )}
                                                    />
                                                    {errors.studentId && <FormError>{errors.studentId.message}</FormError>}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                {filters.type === 'term' && (
                                    <div className='grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4'>
                                        <div className='space-y-3'>
                                            <Label className='font-semibold text-lg'>
                                                Custom Group<span className='text-red-500'>*</span>
                                            </Label>
                                            <Card className='border bg-gray-50 p-4'>
                                                <Controller
                                                    name='customGroupIds'
                                                    control={control}
                                                    render={({ field }) => {
                                                        const selectedIds = field.value ?? [];
                                                        const allIds = customGroups.map((g) => g.fmgG_Id);

                                                        const isAllSelected = allIds.length > 0 && selectedIds.length === allIds.length;

                                                        return (
                                                            <div className='max-h-64 space-y-3 overflow-y-auto'>
                                                                {/* SELECT ALL */}
                                                                <Label className='flex cursor-pointer items-center gap-3 rounded border-b bg-white px-2 py-2 font-medium hover:bg-gray-200'>
                                                                    <Checkbox
                                                                        checked={isAllSelected}
                                                                        onCheckedChange={(checked: boolean | 'indeterminate') => {
                                                                            const value = checked === true ? allIds : [];

                                                                            field.onChange(value);
                                                                            setValue('customGroupIds', value, {
                                                                                shouldValidate: true,
                                                                                shouldDirty: true,
                                                                                shouldTouch: true
                                                                            });
                                                                        }}
                                                                    />

                                                                    <span>Select All</span>
                                                                </Label>

                                                                {/* LOADING */}
                                                                {loadingCustomGroup ? (
                                                                    <div className='py-4 text-center text-gray-500'>Loading...</div>
                                                                ) : customGroups.length > 0 ? (
                                                                    customGroups.map((group) => {
                                                                        const checked = selectedIds.includes(group.fmgG_Id);

                                                                        return (
                                                                            <Label
                                                                                key={group.fmgG_Id}
                                                                                className='flex cursor-pointer items-center gap-3 rounded px-2 py-1 hover:bg-gray-100'>
                                                                                <Checkbox
                                                                                    checked={checked}
                                                                                    onCheckedChange={(
                                                                                        checked: boolean | 'indeterminate'
                                                                                    ) => {
                                                                                        const value =
                                                                                            checked === true
                                                                                                ? [...selectedIds, group.fmgG_Id]
                                                                                                : selectedIds.filter(
                                                                                                      (id) => id !== group.fmgG_Id
                                                                                                  );

                                                                                        field.onChange(value);
                                                                                        setValue('customGroupIds', value, {
                                                                                            shouldValidate: true,
                                                                                            shouldDirty: true,
                                                                                            shouldTouch: true
                                                                                        });
                                                                                    }}
                                                                                />

                                                                                <span className='font-medium text-sm'>
                                                                                    {group.fmgG_GroupName}
                                                                                </span>
                                                                            </Label>
                                                                        );
                                                                    })
                                                                ) : (
                                                                    <div className='py-4 text-center text-gray-500'>No custom groups</div>
                                                                )}
                                                            </div>
                                                        );
                                                    }}
                                                />
                                            </Card>
                                            {errors.customGroupIds && <FormError>{errors.customGroupIds.message}</FormError>}
                                        </div>

                                        {/* Fee Group */}
                                        <div className='space-y-3'>
                                            <Label className='font-semibold text-lg'>
                                                Fee Group <span className='text-red-500'>*</span>
                                            </Label>
                                            <Card className='border bg-gray-50 p-4'>
                                                <Controller
                                                    name='feeGroupIds'
                                                    control={control}
                                                    render={({ field }) => {
                                                        const selectedIds = field.value ?? [];
                                                        const allIds = feeGroups.map((g) => g.fmG_Id);

                                                        const isAllSelected = allIds.length > 0 && selectedIds.length === allIds.length;

                                                        return (
                                                            <div className='max-h-64 space-y-3 overflow-y-auto'>
                                                                {/* SELECT ALL */}
                                                                <Label className='flex cursor-pointer items-center gap-3 rounded border-b bg-white px-2 py-2 font-medium hover:bg-gray-200'>
                                                                    <Checkbox
                                                                        checked={isAllSelected}
                                                                        onCheckedChange={(checked: boolean | 'indeterminate') => {
                                                                            const value = checked === true ? allIds : [];

                                                                            field.onChange(value);
                                                                            setValue('feeGroupIds', value, {
                                                                                shouldValidate: true,
                                                                                shouldDirty: true,
                                                                                shouldTouch: true
                                                                            });
                                                                        }}
                                                                    />
                                                                    <span>Select All</span>
                                                                </Label>

                                                                {/* LOADING */}
                                                                {loadingfeegroup ? (
                                                                    <div className='py-4 text-center text-gray-500'>Loading...</div>
                                                                ) : feeGroups.length > 0 ? (
                                                                    feeGroups.map((group) => {
                                                                        const checked = selectedIds.includes(group.fmG_Id);

                                                                        return (
                                                                            <Label
                                                                                key={group.fmG_Id}
                                                                                className='flex cursor-pointer items-center gap-3 rounded px-2 py-1 hover:bg-gray-100'>
                                                                                <Checkbox
                                                                                    checked={checked}
                                                                                    onCheckedChange={(
                                                                                        checked: boolean | 'indeterminate'
                                                                                    ) => {
                                                                                        const value =
                                                                                            checked === true
                                                                                                ? [...selectedIds, group.fmG_Id]
                                                                                                : selectedIds.filter(
                                                                                                      (id) => id !== group.fmG_Id
                                                                                                  );

                                                                                        field.onChange(value);
                                                                                        setValue('feeGroupIds', value, {
                                                                                            shouldValidate: true,
                                                                                            shouldDirty: true,
                                                                                            shouldTouch: true
                                                                                        });
                                                                                    }}
                                                                                />
                                                                                <span className='text-sm'>{group.fmG_GroupName}</span>
                                                                            </Label>
                                                                        );
                                                                    })
                                                                ) : (
                                                                    <div className='py-4 text-center text-gray-500'>No fee groups</div>
                                                                )}
                                                            </div>
                                                        );
                                                    }}
                                                />
                                            </Card>
                                            {errors.feeGroupIds && <FormError>{errors.feeGroupIds.message}</FormError>}
                                        </div>

                                        {/* Term */}
                                        <div className='space-y-3'>
                                            <Label className='font-semibold text-lg'>
                                                Term Name <span className='text-red-500'>*</span>
                                            </Label>
                                            <Card className='border bg-gray-50 p-4'>
                                                <Controller
                                                    name='termIds'
                                                    control={control}
                                                    render={({ field }) => {
                                                        const selectedIds = field.value ?? [];
                                                        const allIds = feeTerms.map((t) => t.fmT_Id);

                                                        const isAllSelected = allIds.length > 0 && selectedIds.length === allIds.length;

                                                        return (
                                                            <div className='max-h-64 space-y-3 overflow-y-auto'>
                                                                {/* SELECT ALL */}
                                                                <Label className='flex cursor-pointer items-center gap-3 rounded border-b bg-white px-2 py-2 font-medium hover:bg-gray-200'>
                                                                    <Checkbox
                                                                        checked={isAllSelected}
                                                                        onCheckedChange={(checked: boolean | 'indeterminate') => {
                                                                            const value = checked === true ? allIds : [];

                                                                            field.onChange(value);
                                                                            setValue('termIds', value, {
                                                                                shouldValidate: true,
                                                                                shouldDirty: true,
                                                                                shouldTouch: true
                                                                            });
                                                                        }}
                                                                    />
                                                                    <span>Select All</span>
                                                                </Label>

                                                                {/* LOADING */}
                                                                {loadingfeeterm ? (
                                                                    <div className='py-4 text-center text-gray-500'>Loading...</div>
                                                                ) : feeTerms.length > 0 ? (
                                                                    feeTerms.map((term) => {
                                                                        const checked = selectedIds.includes(term.fmT_Id);

                                                                        return (
                                                                            <Label
                                                                                key={term.fmT_Id}
                                                                                className='flex cursor-pointer items-center gap-3 rounded px-2 py-1 hover:bg-gray-100'>
                                                                                <Checkbox
                                                                                    checked={checked}
                                                                                    onCheckedChange={(
                                                                                        checked: boolean | 'indeterminate'
                                                                                    ) => {
                                                                                        const value =
                                                                                            checked === true
                                                                                                ? [...selectedIds, term.fmT_Id]
                                                                                                : selectedIds.filter(
                                                                                                      (id) => id !== term.fmT_Id
                                                                                                  );

                                                                                        field.onChange(value);
                                                                                        setValue('termIds', value, {
                                                                                            shouldValidate: true,
                                                                                            shouldDirty: true,
                                                                                            shouldTouch: true
                                                                                        });
                                                                                    }}
                                                                                />
                                                                                <span className='text-sm'>{term.fmT_Name}</span>
                                                                            </Label>
                                                                        );
                                                                    })
                                                                ) : (
                                                                    <div className='py-4 text-center text-gray-500'>No terms</div>
                                                                )}
                                                            </div>
                                                        );
                                                    }}
                                                />
                                            </Card>
                                            {errors.termIds && <FormError>{errors.termIds.message}</FormError>}
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <div className='flex justify-end gap-4 border-t pt-8'>
                                        <Button
                                            size='lg'
                                            variant='outline'
                                            className='px-8'
                                            onClick={() => window.location.reload()}
                                            type='button'>
                                            Cancel
                                        </Button>
                                        <Button type='submit' disabled={isSubmitting} className='px-12'>
                                            {isSubmitting ? 'Generating...' : 'Report'}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </form>

            {reportData.length > 0 && (
                <CollapsibleSection defaultOpen={true}>
                    <div className='rounded-lg border bg-white shadow-xl'>
                        <div className='flex items-center justify-between border-b bg-gray-50 px-8 py-4'>
                            <h2 className='whitespace-nowrap font-bold text-2xl text-primary'>Fee Student and Account Wise Report</h2>
                            <div className='flex gap-2'>
                                <Button
                                    size='sm'
                                    className='h-8 px-3 text-xs'
                                    // onClick={handleExportExcel}
                                >
                                    Export Excel
                                </Button>
                                <Button
                                    size='sm'
                                    variant='outline'
                                    className='h-8 px-3 text-xs'
                                    // onClick={handlePrint}
                                >
                                    Export PDF
                                </Button>
                            </div>
                        </div>
                        <div className='overflow-x-auto px-8 pb-8'>
                            <table className='w-full border-collapse border border-gray-300 text-sm'>
                                <thead className='bg-primary text-white'>
                                    <tr>
                                        <th className='p-2 text-center'>
                                            <Checkbox
                                                checked={selectedIds.length === reportData.length && reportData.length > 0}
                                                onCheckedChange={toggleAllstudents}
                                            />
                                        </th>
                                        <th className='border px-2 py-2 text-center font-semibold'>Sl No</th>
                                        <th className='border px-2 py-2 text-center font-semibold'>Admission No</th>
                                        <th className='border px-2 py-2 text-center font-semibold'>StudentName</th>
                                        <th className='border px-2 py-2 text-center font-semibold'>Class & Division</th>
                                        <th className='border px-2 py-2 text-center font-semibold'>PaymentDate</th>
                                        <th className='border px-2 py-2 text-center font-semibold'>Roll No.</th>
                                        <th className='border px-2 py-2 text-center font-semibold'>TotalPaidAmount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reportData.map((row, index) => (
                                        <tr key={row.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                            <td className='p-2 text-center'>
                                                <Checkbox
                                                    checked={selectedIds.includes(row.id)}
                                                    onCheckedChange={() => toggleRow(row.id)}
                                                />
                                            </td>
                                            <td className='border px-2 py-2 text-center'>{index + 1}</td>
                                            <td className='border px-2 py-2 text-left'>{row.amsT_AdmNo}</td>
                                            <td className='border px-2 py-2 text-right'>{row.amsT_FirstName || '-'}</td>
                                            <td className='border px-2 py-2 text-right'>{row.asmcL_ClassName?.toLocaleString() || '-'}</td>
                                            <td className='border px-2 py-2 text-right'>{row.asmC_SectionName?.toLocaleString() || '-'}</td>
                                            <td className='border px-2 py-2 text-right'>{row.amaY_RollNo?.toLocaleString() || '-'}</td>
                                            <td className='border px-2 py-2 text-right'>{row.fmG_GroupName?.toLocaleString() || '-'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </CollapsibleSection>
            )}
        </div>
    );
}
