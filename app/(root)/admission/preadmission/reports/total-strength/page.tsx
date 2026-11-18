'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { FormError } from '@/components/ui/extension/field';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAcademicYearDropdown } from '@/hooks/admission/preadmission/useMasters';
import { useTotalStrengthReport } from '@/hooks/admission/preadmission/useReports';
import { usePreadmissionClassDropdown1, useadmissionSectionDropdown } from '@/hooks/admission/preadmission/useTransactions';
import { cn } from '@/lib/utils';
import { TotalStrengthSchema } from '@/schemas/admission/preadmission/reports';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckSquare, FileSpreadsheet, FileText, Printer, RotateCcw, Square } from 'lucide-react';
import { Fragment, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useReactToPrint } from 'react-to-print';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import type { z } from 'zod';
import { TotalStrengthPrint } from './_components/total-strength-print';

type FormFields = z.infer<typeof TotalStrengthSchema>;

interface ElectiveItem {
    ismS_Id: number;
    ismS_SubjectName: string;
}

export default function TotalStrengthPage() {
    const printRef = useRef<HTMLDivElement>(null);
    const { data: academicYear, isLoading: ayLoading } = useAcademicYearDropdown();
    const [showReport, setShowReport] = useState(false);
    const [selectAll, setSelectAll] = useState(true);
    const [classId, setClassId] = useState<number>(0);
    const [reportParams, setReportParams] = useState<{
        asmay_Id: number;
        asmcL_Id: number;
        amC_Id: number;
        statusFlag: string;
        amsT_SOL: string;
        withtc: string;
        withdeactive: string;
        electivearray: ElectiveItem[];
    } | null>(null);

    const {
        data: preadmissionClass,
        isLoading: preadmissionClassLoading,
        isError: preadmissionClassError
    } = usePreadmissionClassDropdown1();

    const {
        data: admissionSection,
        isLoading: admissionSectionLoading,
        isError: admissionSectionError
    } = useadmissionSectionDropdown(classId);

    const {
        data: response,
        isLoading,
        error
    } = useTotalStrengthReport(
        reportParams?.asmay_Id || 0,
        reportParams?.asmcL_Id || 0,
        reportParams?.amC_Id || 0,
        reportParams?.statusFlag || '',
        reportParams?.amsT_SOL || '',
        reportParams?.withtc || '',
        reportParams?.withdeactive || '',
        reportParams?.electivearray || []
    );

    const {
        control,
        watch,
        setValue,
        reset,
        trigger,
        formState: { errors }
    } = useForm<FormFields>({
        resolver: zodResolver(TotalStrengthSchema),
        defaultValues: {
            reportType: 'All',
            status: 'Present',
            withTc: false,
            withDeactive: false,
            academicYear: 0,
            class: '',
            section: ''
        }
    });

    const reportType = watch('reportType');
    const status = watch('status');

    const showCheckboxes = status === 'Present';

    const handleSelectAll = () => {
        setSelectAll(!selectAll);
    };

    const handleReport = async () => {
        const isValid = await trigger();
        if (isValid) {
            const formData = watch();

            const statusFlag = formData.reportType === 'All' ? 'all' : 'indi';

            let amsT_SOL = 'S';
            if (formData.status === 'Left') {
                amsT_SOL = 'S';
            } else if (formData.status === 'Deactive') {
                amsT_SOL = 'S';
            }

            const withtc = formData.withTc ? 'Y' : 'N';
            const withdeactive = formData.withDeactive ? 'Y' : 'N';

            const electivearray: ElectiveItem[] = selectAll ? [{ ismS_Id: 0, ismS_SubjectName: '0' }] : [];

            setReportParams({
                asmay_Id: formData.academicYear,
                asmcL_Id: formData.class ? Number(formData.class) : 0,
                amC_Id: formData.section ? Number(formData.section) : 0,
                statusFlag,
                amsT_SOL,
                withtc,
                withdeactive,
                electivearray
            });

            setShowReport(true);
        }
    };

    const handleReset = () => {
        window.location.reload();
    };

    const selectedAcademicYearName = academicYear?.data?.find((y) => y.asmaY_Id === reportParams?.asmay_Id)?.asmaY_Year;

    const getMasterCompanyInfo = () => {
        if (!response) return { schoolName: '', logoUrl: '', schoolAddress: '', schoolPhone: '' };

        let logoUrl = '';
        const schoolName = '';
        const schoolAddress = '';
        const schoolPhone = '';

        // Foolproof recursive search for logo URL
        const findLogo = (obj: any): string => {
            if (!obj || typeof obj !== 'object') return '';

            // Check direct properties
            const potentialLogos = [obj.logo, obj.mI_Logo, obj.amC_logo];
            for (const logo of potentialLogos) {
                if (typeof logo === 'string' && logo.startsWith('http')) {
                    return logo;
                }
            }

            // Search arrays
            if (Array.isArray(obj)) {
                for (const item of obj) {
                    const found = findLogo(item);
                    if (found) return found;
                }
            } else {
                // Search object keys
                for (const key in obj) {
                    if (Object.prototype.hasOwnProperty.call(obj, key)) {
                        const found = findLogo(obj[key]);
                        if (found) return found;
                    }
                }
            }
            return '';
        };

        const data = (response as any).data ?? response;
        const responseData = data?.responseData ?? data;
        const masterComp = responseData?.masterCompany?.[0] ?? data?.masterCompany?.[0] ?? (response as any)?.masterCompany?.[0];

        logoUrl = findLogo(response) || '';
        // schoolName = masterComp?.miname || masterComp?.companyname || '';
        // schoolAddress = masterComp?.companyaddress || masterComp?.address || '';
        // schoolPhone = masterComp?.companyphone || masterComp?.phNo || '';

        return { schoolName, logoUrl, schoolAddress, schoolPhone };
    };

    const getStudentList = (): any[] => {
        if (!response) return [];
        const data = (response as any).data ?? response;
        const responseData = data?.responseData ?? data;
        const list = responseData?.studentlist ?? data?.studentlist ?? (response as any)?.studentlist;
        return Array.isArray(list) ? list : [];
    };

    const groupedData = () => {
        const studentlist = getStudentList();
        if (studentlist.length === 0) return {};

        const grouped: Record<string, any[]> = {};
        studentlist.forEach((item: any) => {
            const key = item.classname || (item.ASMCL_Order !== undefined && item.ASMCL_Order !== null ? String(item.ASMCL_Order) : '0');
            if (!grouped[key]) {
                grouped[key] = [];
            }
            grouped[key].push(item);
        });

        Object.keys(grouped).forEach((key) => {
            grouped[key].sort((a, b) => (a.ASMC_Order || 0) - (b.ASMC_Order || 0));
        });

        return grouped;
    };

    const calculateClassBoysTotal = (groupKey: string) => {
        const items = groupedData()[groupKey] || [];
        return items.reduce((sum, item) => sum + (item.boys || 0), 0);
    };

    const calculateClassGirlsTotal = (groupKey: string) => {
        const items = groupedData()[groupKey] || [];
        return items.reduce((sum, item) => sum + (item.girls || 0), 0);
    };

    const calculateClassTotal = (groupKey: string) => {
        const items = groupedData()[groupKey] || [];
        return items.reduce((sum, item) => sum + (item.totalstudents || 0), 0);
    };

    const calculateGrandTotal = () => {
        const studentlist = getStudentList();
        return studentlist.reduce((sum: number, item: any) => sum + (item.totalstudents || 0), 0);
    };

    const calculateBoysGrandTotal = () => {
        const studentlist = getStudentList();
        return studentlist.reduce((sum: number, item: any) => sum + (item.boys || 0), 0);
    };

    const calculateGirlsGrandTotal = () => {
        const studentlist = getStudentList();
        return studentlist.reduce((sum: number, item: any) => sum + (item.girls || 0), 0);
    };

    const downloadExcel = async () => {
        try {
            const data = groupedData();
            if (Object.keys(data).length === 0) {
                toast.error('No data available to export');
                return;
            }

            const excelData: any[] = [];
            let grandBoys = 0;
            let grandGirls = 0;
            let grandTotal = 0;

            Object.entries(data)
                .sort(([, aSec], [, bSec]) => (aSec[0]?.ASMCL_Order || 0) - (bSec[0]?.ASMCL_Order || 0))
                .forEach(([groupKey, sections], index) => {
                    sections.forEach((item: any, sectionIndex) => {
                        excelData.push({
                            'Sl.No': sectionIndex === 0 ? index + 1 : '',
                            Class: sectionIndex === 0 ? item.classname : '',
                            Section: item.sectionname,
                            Boys: item.boys,
                            Girls: item.girls,
                            Total: item.totalstudents
                        });
                    });

                    const classBoys = calculateClassBoysTotal(groupKey);
                    const classGirls = calculateClassGirlsTotal(groupKey);
                    const classTotal = calculateClassTotal(groupKey);

                    grandBoys += classBoys;
                    grandGirls += classGirls;
                    grandTotal += classTotal;

                    excelData.push({
                        'Sl.No': '',
                        Class: `Total for ${sections[0]?.classname || groupKey}`,
                        Section: '',
                        Boys: classBoys,
                        Girls: classGirls,
                        Total: classTotal
                    });
                });

            excelData.push({
                'Sl.No': '',
                Class: 'Grand Total',
                Section: '',
                Boys: grandBoys,
                Girls: grandGirls,
                Total: grandTotal
            });

            const worksheet = XLSX.utils.json_to_sheet(excelData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Total Strength Report');

            XLSX.writeFile(workbook, 'TotalStrengthReport.xlsx');
            toast.success('Excel downloaded successfully');
        } catch (error) {
            console.error('Download error:', error);
            toast.error('Failed to download Excel');
        }
    };

    const [isPrinting, setIsPrinting] = useState(false);
    const triggerPrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: 'Total_Strength_Report'
    });

    const handlePrint = () => {
        setIsPrinting(true);
        const toastId = toast.loading('Preparing all records for print...');
        setTimeout(() => {
            triggerPrint();
            setIsPrinting(false);
            toast.dismiss(toastId);
        }, 1000);
    };

    return (
        <div className='min-h-screen'>
            <div className='container space-y-4 p-1'>
                <div className='space-y-4'>
                    <CollapsibleSection
                        defaultOpen={true}
                        variant='default'
                        size='lg'
                        title='Total Strength'
                        className='no-print shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                        <div className='space-y-6 p-4'>
                            <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
                                <div className='space-y-4 rounded-lg border border-gray-200 p-4'>
                                    <div className='space-y-2'>
                                        <Controller
                                            name='reportType'
                                            control={control}
                                            render={({ field }) => (
                                                <RadioGroup
                                                    value={field.value}
                                                    onValueChange={(value) => {
                                                        field.onChange(value);
                                                        if (value === 'All') {
                                                            setValue('class', '');
                                                            setValue('section', '');
                                                            setClassId(0);
                                                        }
                                                    }}
                                                    className='flex items-center justify-center space-x-6'>
                                                    <div className='flex items-center space-x-2'>
                                                        <RadioGroupItem value='All' id='all-type' />
                                                        <label htmlFor='all-type' className='cursor-pointer text-sm'>
                                                            All
                                                        </label>
                                                    </div>
                                                    <div className='flex items-center space-x-2'>
                                                        <RadioGroupItem value='Individual' id='individual-type' />
                                                        <label htmlFor='individual-type' className='cursor-pointer text-sm'>
                                                            Individual
                                                        </label>
                                                    </div>
                                                </RadioGroup>
                                            )}
                                        />
                                    </div>

                                    <div className='space-y-2'>
                                        <Controller
                                            name='status'
                                            control={control}
                                            render={({ field }) => (
                                                <RadioGroup
                                                    value={field.value}
                                                    onValueChange={field.onChange}
                                                    className='flex items-center justify-center space-x-6'>
                                                    <div className='flex items-center space-x-2'>
                                                        <RadioGroupItem value='Present' id='present' />
                                                        <label htmlFor='present' className='cursor-pointer text-sm'>
                                                            Present
                                                        </label>
                                                    </div>
                                                    <div className='flex items-center space-x-2'>
                                                        <RadioGroupItem value='Left' id='left' />
                                                        <label htmlFor='left' className='cursor-pointer text-sm'>
                                                            Left
                                                        </label>
                                                    </div>
                                                    <div className='flex items-center space-x-2'>
                                                        <RadioGroupItem value='Deactive' id='deactive' />
                                                        <label htmlFor='deactive' className='cursor-pointer text-sm'>
                                                            Deactive
                                                        </label>
                                                    </div>
                                                </RadioGroup>
                                            )}
                                        />
                                        {errors.status && <FormError>{errors.status.message}</FormError>}
                                    </div>

                                    {showCheckboxes && (
                                        <div className='space-y-2'>
                                            <div className='flex items-center justify-center space-x-6'>
                                                <Controller
                                                    name='withTc'
                                                    control={control}
                                                    render={({ field }) => (
                                                        <div className='flex items-center space-x-2'>
                                                            <Checkbox id='withTc' checked={field.value} onCheckedChange={field.onChange} />
                                                            <label htmlFor='withTc' className='cursor-pointer text-sm'>
                                                                With TC
                                                            </label>
                                                        </div>
                                                    )}
                                                />
                                                <Controller
                                                    name='withDeactive'
                                                    control={control}
                                                    render={({ field }) => (
                                                        <div className='flex items-center space-x-2'>
                                                            <Checkbox
                                                                id='withDeactive'
                                                                checked={field.value}
                                                                onCheckedChange={field.onChange}
                                                            />
                                                            <label htmlFor='withDeactive' className='cursor-pointer text-sm'>
                                                                With Deactive
                                                            </label>
                                                        </div>
                                                    )}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className='space-y-4 rounded-lg border border-gray-200 p-4'>
                                    <div className='space-y-2'>
                                        <Label htmlFor='academicYear' className='font-medium'>
                                            Academic Year <span className='text-red-500'>*</span>
                                        </Label>
                                        <Controller
                                            name='academicYear'
                                            control={control}
                                            render={({ field }) => (
                                                <Select
                                                    value={field.value > 0 ? field.value.toString() : ''}
                                                    onValueChange={(value) => field.onChange(Number(value))}>
                                                    <SelectTrigger className='w-full'>
                                                        <SelectValue placeholder='Select Academic Year' />
                                                    </SelectTrigger>
                                                    <SelectContent className='max-h-60'>
                                                        {ayLoading ? (
                                                            <SelectItem value='loading' disabled>
                                                                Loading...
                                                            </SelectItem>
                                                        ) : (
                                                            academicYear?.data?.map((y) => (
                                                                <SelectItem key={y.asmaY_Id} value={y.asmaY_Id.toString()}>
                                                                    {y.asmaY_Year}
                                                                </SelectItem>
                                                            ))
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        />
                                        {errors.academicYear && <FormError>{errors.academicYear.message}</FormError>}
                                    </div>

                                    <div className='space-y-2'>
                                        <Label className='font-medium'>
                                            Elective <span className='text-red-500'>*</span>
                                        </Label>
                                        <div
                                            onClick={handleSelectAll}
                                            className={cn(
                                                'flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2.5 font-medium text-sm transition-all',
                                                selectAll
                                                    ? 'border-primary bg-primary/5 text-primary'
                                                    : 'border-gray-300 hover:border-primary/40'
                                            )}>
                                            {selectAll ? (
                                                <CheckSquare className='h-4 w-4 text-primary' />
                                            ) : (
                                                <Square className='h-4 w-4 text-gray-400' />
                                            )}
                                            <span>Select All</span>
                                        </div>
                                    </div>

                                    {reportType === 'Individual' && (
                                        <>
                                            <div className='space-y-2'>
                                                <Label htmlFor='class' className='font-medium'>
                                                    Class <span className='text-red-500'>*</span>
                                                </Label>
                                                <Controller
                                                    name='class'
                                                    control={control}
                                                    render={({ field }) => (
                                                        <Select
                                                            value={field.value}
                                                            onValueChange={(value) => {
                                                                field.onChange(value);
                                                                setClassId(Number(value));
                                                                setValue('section', '');
                                                            }}>
                                                            <SelectTrigger className='w-full'>
                                                                <SelectValue placeholder='Select Class' />
                                                            </SelectTrigger>
                                                            <SelectContent className='max-h-60'>
                                                                {preadmissionClassLoading ? (
                                                                    <SelectItem value='loading' disabled>
                                                                        Loading...
                                                                    </SelectItem>
                                                                ) : preadmissionClassError ? (
                                                                    <SelectItem value='error' disabled>
                                                                        Error loading
                                                                    </SelectItem>
                                                                ) : (
                                                                    preadmissionClass?.data?.map((item) => (
                                                                        <SelectItem key={item.asmcL_Id} value={item.asmcL_Id.toString()}>
                                                                            {item.asmcL_ClassName}
                                                                        </SelectItem>
                                                                    ))
                                                                )}
                                                            </SelectContent>
                                                        </Select>
                                                    )}
                                                />
                                                {errors.class && <FormError>{errors.class.message}</FormError>}
                                            </div>

                                            <div className='space-y-2'>
                                                <Label htmlFor='section' className='font-medium'>
                                                    Section <span className='text-red-500'>*</span>
                                                </Label>
                                                <Controller
                                                    name='section'
                                                    control={control}
                                                    render={({ field }) => (
                                                        <Select value={field.value} onValueChange={field.onChange} disabled={!classId}>
                                                            <SelectTrigger className='w-full'>
                                                                <SelectValue placeholder='Select Section' />
                                                            </SelectTrigger>
                                                            <SelectContent className='max-h-60'>
                                                                {admissionSectionLoading ? (
                                                                    <SelectItem value='loading' disabled>
                                                                        Loading...
                                                                    </SelectItem>
                                                                ) : admissionSectionError ? (
                                                                    <SelectItem value='error' disabled>
                                                                        Error loading
                                                                    </SelectItem>
                                                                ) : (
                                                                    admissionSection?.data?.map((item: any) => (
                                                                        <SelectItem key={item.asmS_Id} value={item.asmS_Id.toString()}>
                                                                            {item.asmC_SectionName}
                                                                        </SelectItem>
                                                                    ))
                                                                )}
                                                            </SelectContent>
                                                        </Select>
                                                    )}
                                                />
                                                {errors.section && <FormError>{errors.section.message}</FormError>}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className='flex flex-col gap-3 border-t pt-4 sm:flex-row sm:justify-start'>
                                <Button
                                    type='button'
                                    variant='outline'
                                    onClick={handleReset}
                                    className='w-full transition-all duration-200 hover:scale-105 sm:w-fit'>
                                    <RotateCcw className='mr-2 h-4 w-4' />
                                    Reset
                                </Button>
                                <Button
                                    type='button'
                                    onClick={handleReport}
                                    className='w-full transition-all duration-200 hover:scale-105 sm:w-fit'
                                    disabled={isLoading}>
                                    <FileText className='mr-2 h-4 w-4' />
                                    {isLoading ? 'Loading...' : 'Report'}
                                </Button>
                                <div className='flex gap-3'>
                                    <Button variant='outline' className='w-fit' onClick={downloadExcel}>
                                        <FileSpreadsheet className='mr-2 h-4 w-4' />
                                        Export to Excel
                                    </Button>
                                    <Button variant='outline' className='w-fit' onClick={handlePrint} disabled={isPrinting}>
                                        <Printer className='mr-2 h-4 w-4' />
                                        {isPrinting ? 'Preparing...' : 'Print'}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </CollapsibleSection>

                    {showReport && (
                        <div>
                            <CollapsibleSection
                                defaultOpen={true}
                                variant='default'
                                size='lg'
                                title={
                                    selectedAcademicYearName
                                        ? `Total Strength Report (${selectedAcademicYearName})`
                                        : 'Total Strength Report'
                                }
                                className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                                <div className='space-y-4 p-4'>
                                    {isLoading ? (
                                        <div className='flex items-center justify-center py-8'>
                                            <p className='text-gray-500'>Loading report data...</p>
                                        </div>
                                    ) : error ? (
                                        <div className='flex items-center justify-center py-8'>
                                            <p className='text-red-500'>Error loading report data</p>
                                        </div>
                                    ) : (
                                        <div className='space-y-4'>
                                            {(() => {
                                                const { schoolName, logoUrl } = getMasterCompanyInfo();
                                                if (!schoolName && !logoUrl) return null;
                                                return (
                                                    <div className='mb-4 border-b pb-4 text-center text-black'>
                                                        <div className='flex flex-col items-center gap-1'>
                                                            {logoUrl && (
                                                                <img
                                                                    src={logoUrl}
                                                                    alt={schoolName || 'Institution Logo'}
                                                                    className='mb-2 max-h-[80px] w-auto object-contain'
                                                                />
                                                            )}
                                                            <div className='mt-2 flex flex-wrap justify-center gap-x-6 gap-y-2 font-bold text-[13px]'>
                                                                {selectedAcademicYearName && (
                                                                    <span>
                                                                        Academic Year: {selectedAcademicYearName}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })()}
                                            <div className='overflow-x-auto'>
                                                <table className='w-full border-collapse border border-gray-300'>
                                                    <thead>
                                                        <tr className='bg-gray-100'>
                                                            <th className='border border-gray-300 px-4 py-2 text-left font-bold'>Sl.No</th>
                                                            <th className='border border-gray-300 px-4 py-2 text-left font-bold'>Class</th>
                                                            <th className='border border-gray-300 px-4 py-2 text-left font-bold'>
                                                                Section
                                                            </th>
                                                            <th className='border border-gray-300 px-4 py-2 text-left font-bold'>Boys</th>
                                                            <th className='border border-gray-300 px-4 py-2 text-left font-bold'>Girls</th>

                                                            <th className='border border-gray-300 px-4 py-2 text-right font-bold'>Total</th>
                                                            {/* <th className='border border-gray-300 px-4 py-2 text-right font-semibold'>
                                                                New Admission
                                                            </th> */}
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {Object.keys(groupedData()).length === 0 ? (
                                                            <tr>
                                                                <td
                                                                    colSpan={6}
                                                                    className='border border-gray-300 px-4 py-8 text-center text-gray-500'>
                                                                    No student strength data found.
                                                                </td>
                                                            </tr>
                                                        ) : (
                                                            Object.entries(groupedData())
                                                                .sort(
                                                                    ([, aSec], [, bSec]) =>
                                                                        (aSec[0]?.ASMCL_Order || 0) - (bSec[0]?.ASMCL_Order || 0)
                                                                )
                                                                .map(([groupKey, sections], index) => (
                                                                    <Fragment key={groupKey}>
                                                                        {sections.map((item: any, sectionIndex: number) => (
                                                                            <tr
                                                                                key={`${groupKey}-${item.sectionname}-${sectionIndex}`}
                                                                                className='hover:bg-gray-50'>
                                                                                <td className='border border-gray-300 px-4 py-2 text-center'>
                                                                                    {sectionIndex === 0 ? index + 1 : ''}
                                                                                </td>
                                                                                <td className='border border-gray-300 px-4 py-2 font-medium'>
                                                                                    {sectionIndex === 0 ? item.classname : ''}
                                                                                </td>
                                                                                <td className='border border-gray-300 px-4 py-2'>
                                                                                    {item.sectionname}
                                                                                </td>

                                                                                <td className='border border-gray-300 px-4 py-2 text-right'>
                                                                                    {item.boys}
                                                                                </td>
                                                                                <td className='border border-gray-300 px-4 py-2 text-right'>
                                                                                    {item.girls}
                                                                                </td>

                                                                                <td className='border border-gray-300 px-4 py-2 text-right font-medium'>
                                                                                    {item.totalstudents}
                                                                                </td>
                                                                            </tr>
                                                                        ))}
                                                                        <tr key={`total-${groupKey}`} className='bg-gray-50 font-semibold'>
                                                                            <td
                                                                                colSpan={3}
                                                                                className='border border-gray-300 px-4 py-2 text-right'>
                                                                                Total for {sections[0]?.classname || groupKey}
                                                                            </td>
                                                                            <td className='border border-gray-300 px-4 py-2 text-right font-semibold'>
                                                                                {calculateClassBoysTotal(groupKey)}
                                                                            </td>
                                                                            <td className='border border-gray-300 px-4 py-2 text-right font-semibold'>
                                                                                {calculateClassGirlsTotal(groupKey)}
                                                                            </td>
                                                                            <td className='border border-gray-300 px-4 py-2 text-right font-bold'>
                                                                                {calculateClassTotal(groupKey)}
                                                                            </td>
                                                                        </tr>
                                                                    </Fragment>
                                                                ))
                                                        )}
                                                        {Object.keys(groupedData()).length > 0 && (
                                                            <tr className='bg-green-100 font-bold'>
                                                                <td colSpan={3} className='border border-gray-300 px-4 py-2 text-right'>
                                                                    Grand Total
                                                                </td>
                                                                <td className='border border-gray-300 px-4 py-2 text-right'>
                                                                    {calculateBoysGrandTotal()}
                                                                </td>
                                                                <td className='border border-gray-300 px-4 py-2 text-right'>
                                                                    {calculateGirlsGrandTotal()}
                                                                </td>
                                                                <td className='border border-gray-300 px-4 py-2 text-right'>
                                                                    {calculateGrandTotal()}
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CollapsibleSection>
                        </div>
                    )}

                    <div style={{ position: 'absolute', top: '-9999px', left: '-9999px', width: '210mm' }}>
                        {(() => {
                            const { schoolName, logoUrl, schoolAddress, schoolPhone } = getMasterCompanyInfo();
                            return (
                                <TotalStrengthPrint
                                    ref={printRef}
                                    groupedData={groupedData()}
                                    totalGrand={calculateGrandTotal()}
                                    totalBoysGrand={calculateBoysGrandTotal()}
                                    totalGirlsGrand={calculateGirlsGrandTotal()}
                                    academicYearName={selectedAcademicYearName}
                                    schoolName={schoolName}
                                    schoolAddress={schoolAddress}
                                    schoolPhone={schoolPhone}
                                    logoUrl={logoUrl}
                                />
                            );
                        })()}
                    </div>
                </div>
            </div>
        </div>
    );
}
