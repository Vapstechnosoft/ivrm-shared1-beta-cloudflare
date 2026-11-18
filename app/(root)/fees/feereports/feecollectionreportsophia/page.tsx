'use client';

import { useAcademicYearDropdown } from '@/hooks/fees/useMasters';
import { useFeeClassListDefaulterreport, useFeeSectionListDefaulterreport } from '@/hooks/fees/useReports';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { Checkbox } from '@/components/ui/checkbox';
import { FormError } from '@/components/ui/extension/field';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Input } from '@/components/ui/input';
import { feeCollectionReportSophiaSchema } from '@/schemas/fees/reports';
import { feeClassWiseDueListreportSophia } from '@/server/fees/reports/sophia_reports';
import type { IFeeClassDropdownList, IFeeSectionDropdownList } from '@/types/fees/reports/reports';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { z } from 'zod';

type FormFields = z.infer<typeof feeCollectionReportSophiaSchema>;

interface IAcademicYear {
    asmaY_Id: string | number;
    asmaY_Year: string;
    asmaY_Order?: number;
}

export interface IFeeCollectionReportofSophia {
    id: number;
    amsT_Id: number;
    studentName: string;
    amsT_AdmNo: string;
    asmcL_ClassName: string;
    fsS_PaidAmount: number;
    balance: number;
    concession: number;
    waived: number;
    rebate: number;
    fine: number;
    totalpayable: number;
    adjusted: number;
    excess: number;
}

export default function FeeCollectionReportofSophia() {
    const {
        handleSubmit,
        setValue,
        control,
        watch,
        formState: { errors, isSubmitting }
    } = useForm<FormFields>({
        resolver: zodResolver(feeCollectionReportSophiaSchema),
        defaultValues: {
            academicYearId: undefined,
            classId: undefined,
            sectionId: undefined,
            active: false,
            deactive: false,
            left: false
        }
    });

    const selectedClassId = watch('classId');
    const selctedAcademicYearId = watch('academicYearId');
    const selectedSectionId = watch('sectionId');

    const [academicYears, setAcademicYears] = useState<IAcademicYear[]>([]);
    const [classes, setClasses] = useState<IFeeClassDropdownList[]>([]);
    const [sections, setSections] = useState<IFeeSectionDropdownList[]>([]);
    const [reportData, setReportData] = useState<IFeeCollectionReportofSophia[]>([]);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [filters, setFilters] = useState({
        reportType: 'StudentWise'
    });
    const { data: academicData, isLoading: loadingAcademic, error: academicError } = useAcademicYearDropdown();

    const { data: classListResponse, isLoading: loadingClasses, error: classListError } = useFeeClassListDefaulterreport();

    const { data: sectionListResponse, isLoading: loadingSections, error: sectionListError } = useFeeSectionListDefaulterreport();

    // Calculate summary totals for a group
    const calculateGroupTotals = (students: IFeeCollectionReportofSophia[]) => {
        return students.reduce(
            (acc, student) => ({
                totalpayable: acc.totalpayable + (student.totalpayable || 0),
                fsS_PaidAmount: acc.fsS_PaidAmount + (student.fsS_PaidAmount || 0),
                fine: acc.fine + (student.fine || 0),
                balance: acc.balance + (student.balance || 0)
            }),
            { totalpayable: 0, fsS_PaidAmount: 0, fine: 0, balance: 0 }
        );
    };
    const totals = calculateGroupTotals(reportData);

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

    useEffect(() => {
        if (sectionListError) {
            toast.error(sectionListError?.message || 'Failed to load Sections');
            setSections([]);
            return;
        }
        if (sectionListResponse?.data && Array.isArray(sectionListResponse.data)) {
            setSections(sectionListResponse.data);
        }
    }, [sectionListResponse, sectionListError]);

    useEffect(() => {
        setReportData([]);
        setSelectedIds([]);
    }, [selctedAcademicYearId, selectedClassId, selectedSectionId, filters.reportType]);

    const onSubmit: SubmitHandler<FormFields> = async (data) => {
        setReportData([]);
        setSelectedIds([]);
        if (data.active === false && data.deactive === false && data.left === false) {
            toast.error('Please Select Any One CheckBox Active or Deactive or Left ..');
            return;
        }
        try {
            const payload = {
                classlist: filters.reportType === 'ClassWise' ? [data.classId] : [],
                sectionlist: filters.reportType === 'ClassWise' ? [data.sectionId] : [],
                customflag: 'FEESTDCLSWISE',
                asmaY_Id: data.academicYearId,
                radioval: filters.reportType === 'ClassWise' ? 'FCW' : 'FSW',
                active: data.active === true ? 1 : 0,
                deactive: data.deactive === true ? 1 : 0,
                left: data.left === true ? 1 : 0,
                fromdate: '',
                todate: '',
                fmT_Ids: [],
                typeflag: ''
            };

            const apiData = await feeClassWiseDueListreportSophia(payload);
            const responseJson = typeof apiData === 'string' ? JSON.parse(apiData) : apiData;
            if (responseJson?.data) {
                setReportData(responseJson.data);
                toast.success('Report Generated Successfully');
            }
        } catch (error: any) {
            console.error('Error generating report:', error);
            toast.error(error.message || 'Failed to generate report');
        }
    };

    const allIdsInGroup = reportData.map((item) => item.amsT_Id);
    const allSelectedInGroup = reportData.length > 0 && reportData.every((item) => selectedIds.includes(item.amsT_Id));
    const toggleRow = (id: number) => {
        setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    };

    const toggleAllInGroup = (studentIds: number[]) => {
        const allSelected = studentIds.every((id) => selectedIds.includes(id));
        if (allSelected) {
            setSelectedIds((prev) => prev.filter((id) => !studentIds.includes(id)));
        } else {
            setSelectedIds((prev) => [...prev, ...studentIds.filter((id) => !prev.includes(id))]);
        }
    };

    return (
        <div className='min-h-screen bg-gray-50 py-8'>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-8'>
                <div className='mx-auto max-w-7xl'>
                    <Card className='border-0 shadow-xl'>
                        <div className='place-items-center p-8'>
                            <div className='space-y-8'>
                                <div className='flex items-center gap-12'>
                                    <Card className='px-10 py-6'>
                                        <div className='flex justify-center gap-6'>
                                            {['StudentWise', 'ClassWise'].map((option) => (
                                                <Label key={option} className='flex cursor-pointer items-center gap-3'>
                                                    <Input
                                                        type='radio'
                                                        name='reportType'
                                                        checked={filters.reportType === option}
                                                        onChange={() => {
                                                            setFilters((prev) => ({
                                                                ...prev,
                                                                reportType: option
                                                            }));
                                                            // setValue(
                                                            //   "reportType",
                                                            //   option as
                                                            //     | "StudentWise"
                                                            //     | "ClassWise"
                                                            // );
                                                        }}
                                                        className='h-4 w-4'
                                                    />
                                                    <span className='font-medium'>{option}</span>
                                                </Label>
                                            ))}
                                        </div>
                                    </Card>

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
                                </div>

                                {filters.reportType === 'ClassWise' && (
                                    <div className='mt-4 flex items-center gap-12'>
                                        {/* Class */}
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
                                                                <SelectValue placeholder='--All--' />
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
                                    </div>
                                )}

                                <Card>
                                    <div className='flex items-center justify-center gap-12 p-5'>
                                        <div className='flex items-center gap-12'>
                                            <div className='flex items-center gap-3'>
                                                <Controller
                                                    name='active'
                                                    control={control}
                                                    render={({ field }) => (
                                                        <input
                                                            type='checkbox'
                                                            checked={field.value ?? false}
                                                            onChange={(e) => field.onChange(e.target.checked)}
                                                            className='h-4 w-4'
                                                        />
                                                    )}
                                                />
                                                <Label className='font-medium'>Active</Label>
                                            </div>
                                            <div className='flex items-center gap-3'>
                                                <Controller
                                                    name='deactive'
                                                    control={control}
                                                    render={({ field }) => (
                                                        <input
                                                            type='checkbox'
                                                            checked={field.value ?? false}
                                                            onChange={(e) => field.onChange(e.target.checked)}
                                                            className='h-4 w-4'
                                                        />
                                                    )}
                                                />
                                                <Label className='font-medium'>Deactive</Label>
                                            </div>
                                            <div className='flex items-center gap-3'>
                                                <Controller
                                                    name='left'
                                                    control={control}
                                                    render={({ field }) => (
                                                        <input
                                                            type='checkbox'
                                                            checked={field.value ?? false}
                                                            onChange={(e) => field.onChange(e.target.checked)}
                                                            className='h-4 w-4'
                                                        />
                                                    )}
                                                />
                                                <Label className='font-medium'>Left</Label>
                                            </div>
                                        </div>
                                    </div>
                                </Card>

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

                                    {reportData.length > 0 && (
                                        <div className='mt-10'>
                                            <CollapsibleSection
                                                defaultOpen={true}
                                                variant='default'
                                                size='lg'
                                                className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                                                <div className='flex items-center justify-between border-b bg-primary/5 px-8 py-6'>
                                                    <div className='text-center'>
                                                        <h2 className='font-bold text-2xl text-primary'>Fee Collection Report</h2>
                                                    </div>
                                                    <div className='flex gap-3'>
                                                        <Button size='sm' className='h-8 w-auto px-3 text-xs'>
                                                            Export Excel
                                                        </Button>
                                                        <Button size='sm' variant='outline' className='h-8 w-auto px-3 text-xs'>
                                                            Print
                                                        </Button>
                                                    </div>
                                                </div>

                                                <div className='px-8 pb-8'>
                                                    <div className='overflow-x-auto rounded-b-lg border'>
                                                        <table className='w-full border-collapse text-sm'>
                                                            <thead className='bg-gray-200'>
                                                                <tr>
                                                                    <th className='w-10 p-2 text-center'>
                                                                        <Checkbox
                                                                            checked={allSelectedInGroup && reportData.length > 0}
                                                                            onCheckedChange={() => toggleAllInGroup(allIdsInGroup)}
                                                                        />
                                                                    </th>
                                                                    <th className='w-16 border px-2 py-2 text-center font-semibold'>
                                                                        Sl No
                                                                    </th>
                                                                    <th className='border px-2 py-2 text-center font-semibold'>
                                                                        Admission No
                                                                    </th>
                                                                    <th className='border px-2 py-2 text-center font-semibold'>
                                                                        Student Name
                                                                    </th>
                                                                    <th className='border px-2 py-2 text-center font-semibold'>
                                                                        Class & Division
                                                                    </th>
                                                                    <th className='border px-2 py-2 text-center font-semibold'>
                                                                        Total Fee
                                                                    </th>
                                                                    <th className='border px-2 py-2 text-center font-semibold'>Fee Paid</th>
                                                                    <th className='border px-2 py-2 text-center font-semibold'>
                                                                        Fine Collected
                                                                    </th>
                                                                    <th className='border px-2 py-2 text-center font-semibold'>Balance</th>
                                                                    <th className='border px-2 py-2 text-center font-semibold'>Action</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {reportData.map((row, idx) => (
                                                                    <tr
                                                                        key={row.amsT_Id}
                                                                        className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                                                        <td className='p-2 text-center'>
                                                                            <Checkbox
                                                                                checked={selectedIds.includes(row.amsT_Id)}
                                                                                onCheckedChange={() => toggleRow(row.amsT_Id)}
                                                                            />
                                                                        </td>
                                                                        <td className='border px-2 py-2 text-center'>{idx + 1}</td>
                                                                        <td className='border px-2 py-2 text-left'>{row.amsT_AdmNo}</td>
                                                                        <td className='border px-2 py-2 text-left font-medium'>
                                                                            {row.studentName || '-'}
                                                                        </td>
                                                                        <td className='border px-2 py-2 text-left'>
                                                                            {row.asmcL_ClassName || '-'}
                                                                        </td>
                                                                        <td className='border px-2 py-2 text-right font-semibold'>
                                                                            ₹{(row.totalpayable || 0).toLocaleString()}
                                                                        </td>
                                                                        <td className='border px-2 py-2 text-right font-semibold'>
                                                                            ₹{(row.fsS_PaidAmount || 0).toLocaleString()}
                                                                        </td>
                                                                        <td className='border px-2 py-2 text-right font-semibold'>
                                                                            ₹{(row.fine || 0).toLocaleString()}
                                                                        </td>
                                                                        <td className='border px-2 py-2 text-right font-semibold'>
                                                                            ₹{(row.balance || 0).toLocaleString()}
                                                                        </td>
                                                                        <td className='border px-2 py-2 text-right font-semibold'>
                                                                            <Button
                                                                                size='sm'
                                                                                variant='outline'
                                                                                className='h-8 w-auto px-3 text-xs'>
                                                                                View
                                                                            </Button>
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                            <tfoot className='bg-gray-100'>
                                                                <tr>
                                                                    <td colSpan={5} className='border px-2 py-2 text-right font-bold'>
                                                                        Group Total:
                                                                    </td>
                                                                    <td className='border px-2 py-2 text-right font-bold'>
                                                                        ₹{totals.totalpayable.toLocaleString()}
                                                                    </td>
                                                                    <td className='border px-2 py-2 text-right font-bold'>
                                                                        ₹{totals.fsS_PaidAmount.toLocaleString()}
                                                                    </td>
                                                                    <td className='border px-2 py-2 text-right font-bold'>
                                                                        ₹{totals.fine.toLocaleString()}
                                                                    </td>
                                                                    <td className='border px-2 py-2 text-right font-bold'>
                                                                        ₹{totals.balance.toLocaleString()}
                                                                    </td>
                                                                </tr>
                                                            </tfoot>
                                                        </table>
                                                    </div>
                                                </div>
                                            </CollapsibleSection>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </form>
        </div>
    );
}
