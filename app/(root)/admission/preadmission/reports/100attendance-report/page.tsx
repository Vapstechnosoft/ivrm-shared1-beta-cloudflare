'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { BellRing, FileSpreadsheet, Printer, Search, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { useReactToPrint } from 'react-to-print';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GenericDataTable } from '@/components/ui/data-table/generic-data-table';
import { FormError, Label } from '@/components/ui/extension/field';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import {
    useAttendance100Class,
    useAttendance100InitialDetails,
    useAttendance100Report,
    useAttendance100Section,
    useAttendance100ShortageAlert
} from '@/hooks/admission/preadmission/useReports';
import { AttendanceReportPrint } from './_components/attendance-report-print';
import { attendance100Columns } from './_components/columns';

const schema = z
    .object({
        type23: z.string().default('1'), // 1: All, 2: Individual
        asmaY_Id: z.string().min(1, 'Select Academic Year'),
        amC_Id: z.string().optional(),
        asmcL_Id: z.string().optional(),
        asmC_Id: z.string().optional(),
        percentage: z.string().min(1, 'Select Percentage').max(3, 'Max 100%')
    })
    .refine(
        (data) => {
            if (data.type23 === '2') {
                if (!data.asmcL_Id) return false;
                if (!data.asmC_Id) return false;
            }
            return true;
        },
        {
            message: 'Required fields are missing for Individual selection',
            path: ['asmcL_Id']
        }
    );

type FormFields = z.infer<typeof schema>;

interface InitialData {
    academicList?: { asmaY_Id: number; asmaY_Year: string }[];
    academicListdefault?: { asmaY_Id: number }[];
    category_list?: { amC_Id: number; amC_Name: string }[] | null;
    categoryflag?: boolean;
    classlist?: { asmcL_Id: number; asmcL_ClassName: string }[];
    sectionList?: { asmS_Id: number; asmC_SectionName: string }[];
    coptyright?: string;
    photopathname?: string;
}

interface ClassDataElement {
    asmcL_Id: number;
    asmcL_ClassName: string;
}

type ClassData = ClassDataElement[];

interface SectionData {
    sectionList?: { asmS_Id: number; asmC_SectionName: string }[];
}

interface ReportData {
    studentAttendanceList?: any[];
    AMC_logo?: { amC_FilePath: string }[];
    [key: string]: any;
}

interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

export default function AttendanceReport100Page() {
    const {
        control,
        handleSubmit,
        reset,
        setValue,
        getValues,
        formState: { errors }
    } = useForm<FormFields>({
        resolver: zodResolver(schema),
        defaultValues: {
            type23: '1',
            percentage: '100'
        }
    });

    const type23 = useWatch({ control, name: 'type23' });
    const asmaY_Id = useWatch({ control, name: 'asmaY_Id' });
    const amC_Id = useWatch({ control, name: 'amC_Id' });
    const asmcL_Id = useWatch({ control, name: 'asmcL_Id' });

    const [showGrid, setShowGrid] = useState(false);
    const [filterPayload, setFilterPayload] = useState<any>(null);

    const [selectedRows, setSelectedRows] = useState<any[]>([]);

    // Initial load
    const { data: initialResponse, isLoading: isInitialLoading } = useAttendance100InitialDetails({
        categoryflag: true,
        ASMAY_Id: 0
    }) as { data: ApiResponse<InitialData> | undefined; isLoading: boolean };

    const initialData = initialResponse?.data;

    useEffect(() => {
        const currentYear = getValues('asmaY_Id');
        if (!currentYear) {
            if ((initialData as any)?.academicListdefault?.asmaY_Id) {
                setValue('asmaY_Id', (initialData as any).academicListdefault.asmaY_Id.toString());
            } else if (initialData?.academicList?.[0]) {
                setValue('asmaY_Id', initialData.academicList[0].asmaY_Id.toString());
            }
        }
    }, [initialData, setValue, getValues]);

    // Dependent data
    const { data: classResponse, isLoading: isClassLoading } = useAttendance100Class(
        { ASMAY_Id: Number.parseInt(asmaY_Id || '0'), AMC_Id: Number.parseInt(amC_Id || '0') },
        !!asmaY_Id
    ) as { data: ApiResponse<ClassData> | undefined; isLoading: boolean };

    const classData = classResponse?.data;

    const { data: sectionResponse, isLoading: isSectionLoading } = useAttendance100Section(
        { ASMAY_Id: Number.parseInt(asmaY_Id || '0'), ASMCL_Id: Number.parseInt(asmcL_Id || '0') },
        !!asmcL_Id
    ) as { data: ApiResponse<SectionData> | undefined; isLoading: boolean };

    const sectionData = sectionResponse?.data;

    // Report data
    const {
        data: reportResponse,
        isLoading: isReportLoading,
        refetch
    } = useAttendance100Report(filterPayload, showGrid) as { data: ApiResponse<ReportData> | undefined; isLoading: boolean; refetch: any };

    const reportData = reportResponse?.data;
    const studentList: any[] = Array.isArray(reportData)
        ? reportData
        : (reportData?.studentAttendanceList || []);

    const printRef = useRef<HTMLDivElement>(null);
    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: 'AttendanceReport100'
    });

    // Auto-select default academic year if available
    useEffect(() => {
        if (initialData?.academicListdefault && initialData.academicListdefault.length > 0) {
            setValue('asmaY_Id', initialData.academicListdefault[0].asmaY_Id.toString());
        }
    }, [initialData, setValue]);

    const onSubmit = (data: FormFields) => {
        const payload = {
            type: Number.parseInt(data.type23),
            ASMAY_Id: Number.parseInt(data.asmaY_Id),
            ASMCL_Id: data.type23 === '1' ? 0 : Number.parseInt(data.asmcL_Id || '0'),
            ASMC_Id: data.type23 === '1' ? 0 : Number.parseInt(data.asmC_Id || '0'),
            AMC_Id: data.amC_Id === '0' || !data.amC_Id ? 0 : Number.parseInt(data.amC_Id),
            percentage: data.percentage
        };
        setFilterPayload(payload);
        setShowGrid(true);
        refetch();
    };

    const handleExportExcel = () => {
        const dataToExport = selectedRows.length > 0 ? selectedRows : studentList;
        if (dataToExport.length === 0) {
            toast.error('No records to export');
            return;
        }

        const ws = XLSX.utils.json_to_sheet(
            dataToExport.map((row: any, index: number) => ({
                'SL.No': index + 1,
                'Student Name': row.namme,
                'Admission No.': row.AMST_AdmNo,
                'Registration No.': row.AMST_RegistrationNo,
                'Class Name': row.ASMCL_ClassName,
                'Section Name': row.ASMC_SectionName,
                'No. of Working days': row.classes,
                'No. of Present days': row.attendance,
                'Present %': row.per
            }))
        );

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'AttendanceReport');
        XLSX.writeFile(wb, `AttendanceReport_100_${format(new Date(), 'ddMMyyyy')}.xlsx`);
    };

    const handlePrintClick = () => {
        if (selectedRows.length === 0 && studentList.length === 0) {
            toast.error('No records to print');
            return;
        }
        handlePrint();
    };

    const { mutate: sendAlert, isPending: isAlertSending } = useAttendance100ShortageAlert();

    const handleSendAlert = () => {
        const asmaY_Id = getValues('asmaY_Id');
        if (!asmaY_Id) {
            toast.error('Please select an Academic Year');
            return;
        }
        sendAlert(Number.parseInt(asmaY_Id), {
            onSuccess: (res) => {
                if (res?.success) {
                    toast.success(res.message || 'Alerts sent successfully');
                } else {
                    toast.error(res?.message || 'Failed to send alerts');
                }
            },
            onError: (err: any) => {
                toast.error(err?.message || 'An error occurred while sending alerts');
            }
        });
    };

    const yearDropdown = initialData?.academicList || [];
    const categoryDropdown = initialData?.category_list || [];
    const classDropdown = (Array.isArray(classData) ? classData : initialData?.classlist || []) as any[];
    const sectionDropdown = (sectionData?.sectionList || initialData?.sectionList || []) as any[];

    const selectedYearName = (yearDropdown as any[]).find((y: any) => y.asmaY_Id.toString() === asmaY_Id)?.asmaY_Year;

    return (
        <div className='flex flex-col gap-6 p-4'>
            <Card>
                <CardHeader>
                    <CardTitle>100% Attendance Report</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                        <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
                            {/* Type Selection */}
                            <div className='space-y-3 rounded-lg border p-4'>
                                <Label className='font-medium text-sm'>Report Type</Label>
                                <Controller
                                    name='type23'
                                    control={control}
                                    render={({ field }) => (
                                        <RadioGroup
                                            onValueChange={(val) => {
                                                field.onChange(val);
                                                if (val === '1') {
                                                    setValue('asmcL_Id', '');
                                                    setValue('asmC_Id', '');
                                                }
                                            }}
                                            value={field.value}
                                            className='flex gap-6'>
                                            <div className='flex items-center space-x-2'>
                                                <RadioGroupItem value='1' id='type-all' />
                                                <Label htmlFor='type-all' className='cursor-pointer font-normal'>
                                                    All
                                                </Label>
                                            </div>
                                            <div className='flex items-center space-x-2'>
                                                <RadioGroupItem value='2' id='type-individual' />
                                                <Label htmlFor='type-individual' className='cursor-pointer font-normal'>
                                                    Individual
                                                </Label>
                                            </div>
                                        </RadioGroup>
                                    )}
                                />
                            </div>

                            {/* Academic Year */}
                            <div className='space-y-2'>
                                <Label>
                                    Academic Year <span className='text-destructive'>*</span>
                                </Label>
                                <Controller
                                    name='asmaY_Id'
                                    control={control}
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <SelectTrigger>
                                                <SelectValue placeholder='Select Year' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {(yearDropdown as any[]).map((y: any) => (
                                                    <SelectItem key={y.asmaY_Id} value={y.asmaY_Id.toString()}>
                                                        {y.asmaY_Year}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {errors.asmaY_Id && <FormError>{errors.asmaY_Id.message}</FormError>}
                            </div>
                        </div>

                        <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
                            {/* Category */}
                            {initialData?.categoryflag && (
                                <div className='space-y-2'>
                                    <Label>Category</Label>
                                    <Controller
                                        name='amC_Id'
                                        control={control}
                                        render={({ field }) => (
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder='Select Category' />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value='0'>All</SelectItem>
                                                    {(categoryDropdown as any[]).map((c: any) => (
                                                        <SelectItem key={c.amC_Id} value={c.amC_Id.toString()}>
                                                            {c.amC_Name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                </div>
                            )}

                            {/* Class */}
                            <div className='space-y-2'>
                                <Label>Class {type23 === '2' && <span className='text-destructive'>*</span>}</Label>
                                <Controller
                                    name='asmcL_Id'
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            onValueChange={field.onChange}
                                            value={field.value}
                                            disabled={type23 === '1' || isClassLoading}>
                                            <SelectTrigger>
                                                <SelectValue placeholder='Select Class' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {(classDropdown as any[]).map((c: any) => (
                                                    <SelectItem key={c.asmcL_Id} value={c.asmcL_Id.toString()}>
                                                        {c.asmcL_ClassName}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {errors.asmcL_Id && <FormError>{errors.asmcL_Id.message}</FormError>}
                            </div>

                            {/* Section */}
                            <div className='space-y-2'>
                                <Label>Section {type23 === '2' && <span className='text-destructive'>*</span>}</Label>
                                <Controller
                                    name='asmC_Id'
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            onValueChange={field.onChange}
                                            value={field.value}
                                            disabled={type23 === '1' || isSectionLoading}>
                                            <SelectTrigger>
                                                <SelectValue placeholder='Select Section' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value='0'>All</SelectItem>
                                                {(sectionDropdown as any[]).map((s: any) => (
                                                    <SelectItem key={s.asmS_Id} value={s.asmS_Id.toString()}>
                                                        {s.asmC_SectionName}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </div>

                            {/* Percentage */}
                            <div className='space-y-2'>
                                <Label>
                                    Percentage wise <span className='text-destructive'>*</span>
                                </Label>
                                <Controller
                                    name='percentage'
                                    control={control}
                                    render={({ field }) => (
                                        <Input
                                            {...field}
                                            type='text'
                                            placeholder='Enter percentage'
                                            maxLength={3}
                                            onChange={(e) => {
                                                const val = e.target.value.replace(/[^0-9]/g, '');
                                                field.onChange(val);
                                            }}
                                        />
                                    )}
                                />
                                {errors.percentage && <FormError>{errors.percentage.message}</FormError>}
                            </div>
                        </div>

                        <div className='flex flex-wrap items-center justify-center gap-2 border-t pt-6'>
                            <Button type='submit' size='sm' className='w-auto' isLoading={isReportLoading} disabled={isInitialLoading}>
                                <Search className='mr-1.5 h-3.5 w-3.5' />
                                Report
                            </Button>
                            <Button
                                type='button'
                                size='sm'
                                variant='outline'
                                className='w-auto'
                                onClick={() => {
                                    reset();
                                    setShowGrid(false);
                                }}>
                                <X className='mr-1.5 h-3.5 w-3.5' />
                                Cancel
                            </Button>
                            {studentList.length > 0 && (
                                <>
                                    <Button type='button' size='sm' variant='success' className='w-auto' onClick={handleExportExcel}>
                                        <FileSpreadsheet className='mr-1.5 h-3.5 w-3.5' />
                                        Excel
                                    </Button>
                                    <Button type='button' size='sm' variant='gradient' className='w-auto' onClick={handlePrintClick}>
                                        <Printer className='mr-1.5 h-3.5 w-3.5' />
                                        Print
                                    </Button>
                                </>
                            )}
                        </div>
                    </form>
                </CardContent>
            </Card>

            {showGrid && (
                <CollapsibleSection title='Attendance Report Details' defaultOpen={true}>
                    <GenericDataTable
                        columns={attendance100Columns}
                        data={studentList}
                        isLoading={isReportLoading}
                        totalItems={studentList.length}
                        onRowSelectionChange={(rows) => setSelectedRows(rows)}
                    />
                </CollapsibleSection>
            )}

            <div className='hidden'>
                <AttendanceReportPrint
                    ref={printRef}
                    data={{
                        ...(reportData as any),
                        studentAttendanceList: selectedRows.length > 0 ? selectedRows : studentList
                    }}
                    yearName={selectedYearName}
                    userName={typeof window !== 'undefined' ? localStorage.getItem('username') || '' : ''}
                    copyright={initialData?.coptyright || ''}
                />
            </div>
        </div>
    );
}
