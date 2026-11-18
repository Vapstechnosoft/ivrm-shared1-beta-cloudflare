'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { FormError } from '@/components/ui/extension/field';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAcademicYearDropdown } from '@/hooks/admission/preadmission/useMasters';
import {
    useSTCSExportTotalStrengthReport,
    useSTCSTotalStrengthClasses,
    useSTCSTotalStrengthElectives,
    useSTCSTotalStrengthInitialDetails,
    useSTCSTotalStrengthMasterCompany,
    useSTCSTotalStrengthReportDetails,
    useSTCSTotalStrengthSections
} from '@/hooks/admission/preadmission/useSTCSTotalStrength';
import { STCS_TotalStrengthSchema } from '@/schemas/admission/preadmission/reports';
import { zodResolver } from '@hookform/resolvers/zod';
import { FileSpreadsheet, FileText, Printer, RotateCcw } from 'lucide-react';
import { Fragment, useMemo, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useReactToPrint } from 'react-to-print';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import type { z } from 'zod';
import { TotalStrengthPrint } from './_components/total-strength-print';

type FormFields = z.infer<typeof STCS_TotalStrengthSchema>;

export default function TotalStrengthPage() {
    const printRef = useRef<HTMLDivElement>(null);
    const [showReport, setShowReport] = useState(false);
    const [isPrinting, setIsPrinting] = useState(false);
    const { data: academicYear, isLoading: ayLoading } = useAcademicYearDropdown();

    // Dropdown Hooks
    const { data: initialDetails, isLoading: initialLoading } = useSTCSTotalStrengthInitialDetails();
    const { data: masterCompanyResponse } = useSTCSTotalStrengthMasterCompany();

    const {
        control,
        watch,
        setValue,
        reset,
        trigger,
        formState: { errors }
    } = useForm<FormFields>({
        resolver: zodResolver(STCS_TotalStrengthSchema),
        defaultValues: {
            reportType: 'All',
            status: 'Present',
            withTc: false,
            withDeactive: false,
            academicYear: 0,
            category: '0',
            class: '0',
            section: '0',
            electives: []
        }
    });

    const watchAcademicYear = watch('academicYear');
    const watchCategory = watch('category');
    const watchClass = watch('class');
    const watchReportType = watch('reportType');
    const watchStatus = watch('status');
    const watchElectives = watch('electives') || [];

    const { data: electiveResponse, isLoading: electiveLoading } = useSTCSTotalStrengthElectives(watchAcademicYear);
    const electiveList = electiveResponse?.data;

    const resolvedElectiveList = useMemo(() => {
        if (Array.isArray(electiveList)) return electiveList;
        if (electiveList && typeof electiveList === 'object' && Array.isArray((electiveList as any).allElectives)) {
            return (electiveList as any).allElectives;
        }
        return [];
    }, [electiveList]);

    const { data: classResponse, isLoading: classLoading } = useSTCSTotalStrengthClasses(watchAcademicYear, Number(watchCategory || 0));
    const classList = classResponse?.data;

    const resolvedClassList = useMemo(() => {
        if (Array.isArray(classList)) return classList;
        if (classList && typeof classList === 'object' && Array.isArray((classList as any).allClass)) {
            return (classList as any).allClass;
        }
        return [];
    }, [classList]);

    const { data: sectionResponse, isLoading: sectionLoading } = useSTCSTotalStrengthSections(
        watchAcademicYear,
        Number(watchClass || 0),
        Number(watchCategory || 0)
    );
    const sectionList = sectionResponse?.data;

    const resolvedSectionList = useMemo(() => {
        if (Array.isArray(sectionList)) return sectionList;
        if (sectionList && typeof sectionList === 'object' && Array.isArray((sectionList as any).allSection)) {
            return (sectionList as any).allSection;
        }
        return [];
    }, [sectionList]);

    const [reportPayload, setReportPayload] = useState<any>(null);
    const { data: reportResponse, isLoading: isReportLoading } = useSTCSTotalStrengthReportDetails(reportPayload);

    const handleReport = async () => {
        const isValid = await trigger();
        if (isValid) {
            const values = watch();

            let AMST_SOL = 'S';
            if (values.status === 'Present') AMST_SOL = 'S';
            else if (values.status === 'Left') AMST_SOL = 'L';
            else if (values.status === 'Deactive') AMST_SOL = 'D';

            const payload = {
                ASMAY_Id: values.academicYear,
                ASMCL_Id: values.reportType === 'All' ? 0 : Number(values.class),
                ASMC_Id: values.reportType === 'All' ? 0 : Number(values.section),
                Status_Flag: values.reportType === 'All' ? 'all' : 'indi',
                AMST_SOL: AMST_SOL,
                withtc: values.withTc ? 'Y' : 'N',
                withdeactive: values.withDeactive ? 'Y' : 'N',
                AMC_Id: Number(values.category || 0),
                page_size: 100000,
                Electivearray: values.electives.map((id) => {
                    const item = resolvedElectiveList.find((e: any) => e.ismS_Id === id);
                    return { ismS_Id: id, ismS_SubjectName: item?.ismS_SubjectName || '' };
                })
            };

            setReportPayload(payload);
            setShowReport(true);
        }
    };

    const handleReset = () => {
        reset();
        setShowReport(false);
        setReportPayload(null);
    };

    const studentList: any[] = useMemo(() => {
        const data = reportResponse?.data || reportResponse;

        const getValidList = () => {
            const possibleKeys = ['studentlist', 'studentList', 'studentList1', 'studentlist1', 'result'];
            for (const key of possibleKeys) {
                const val = (data as any)?.[key];
                if (Array.isArray(val) && val.length > 0) return val;
                if (typeof val === 'string' && val.trim().startsWith('[')) return val;
            }
            if (Array.isArray(data)) return data;
            if (typeof data === 'string' && data.trim().startsWith('[')) return data;
            return [];
        };

        let list = getValidList();

        if (typeof list === 'string') {
            try {
                list = JSON.parse(list);
            } catch (e) {
                console.error('Failed to parse student list string', e);
            }
        }

        let finalArray = Array.isArray(list) ? list : [];

        // Join with class name if missing
        if (finalArray.length > 0 && !finalArray[0].classname && resolvedClassList.length > 0) {
            finalArray = finalArray.map((item: any) => {
                const cls = resolvedClassList.find((c: any) => (c.asmcL_Id || c.ASMCL_Id) === (item.ASMCL_Id || item.asmcL_Id));
                return {
                    ...item,
                    classname: cls?.asmcL_ClassName || item.classname || 'Total'
                };
            });
        }

        return finalArray;
    }, [reportResponse, resolvedClassList]);

    const dynamicElectives: any[] = useMemo(() => {
        const data = reportResponse?.data || reportResponse;

        const getValidElectiveList = () => {
            const keys = ['ElectiveSum', 'electiveSum', 'studentElectivelist', 'studentElectiveList', 'electivelist'];
            for (const key of keys) {
                const val = (data as any)?.[key];
                if (Array.isArray(val) && val.length > 0) return val;
            }
            return null;
        };

        const list = getValidElectiveList();

        // If found an explicit list of electives, use it
        if (Array.isArray(list) && list.length > 0 && (list[0].ISMS_SubjectName || list[0].ismS_SubjectName)) {
            return list;
        }

        // If no explicit elective list, discover from studentList keys
        if (studentList.length > 0) {
            const firstRow = studentList[0];
            const excludeKeys = [
                'ASMCL_Id',
                'asmay_id',
                'ASMAY_Id',
                'classname',
                'sectionname',
                'boys',
                'girls',
                'totalstudents',
                'newAdmission',
                'Sl.No',
                'RowNumber',
                'AMST_Id',
                'result',
                'ASMCL_Order',
                'ASMC_Order',
                'asmcL_Order',
                'asmC_Order',
                'ASMS_Order'
            ];
            const subjectKeys = Object.keys(firstRow).filter(
                (k) => !excludeKeys.includes(k) && !excludeKeys.some((ek) => ek.toLowerCase() === k.toLowerCase())
            );

            if (subjectKeys.length > 0) {
                return subjectKeys.map((k) => ({ ISMS_SubjectName: k }));
            }
        }

        // Fallback to selected subjects from form state
        if (watchElectives.length > 0) {
            return resolvedElectiveList
                .filter((e: any) => watchElectives.includes(e.ismS_Id))
                .map((e: any) => ({ ISMS_SubjectName: e.ismS_SubjectName }));
        }

        return [];
    }, [reportResponse, studentList, watchElectives, resolvedElectiveList]);

    const groupedData = useMemo(() => {
        const grouped: Record<string, any[]> = {};
        studentList.forEach((item: any) => {
            const groupKey = item.classname || 'Total';
            if (!grouped[groupKey]) grouped[groupKey] = [];
            grouped[groupKey].push(item);
        });
        return grouped;
    }, [studentList]);

    const calculateClassTotalByGroup = (groupKey: string, field: string) => {
        const items = groupedData[groupKey] || [];
        return items.reduce((sum, item) => sum + (item[field] || 0), 0);
    };

    const calculateGrandTotal = (field: string) => {
        return studentList.reduce((sum: number, item: any) => sum + (item[field] || 0), 0);
    };

    const triggerPrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: 'Total_Strength_Report'
    });

    const handlePrint = () => {
        setIsPrinting(true);
        setTimeout(() => {
            triggerPrint();
            setIsPrinting(false);
        }, 500);
    };

    const exportToExcelMutation = useSTCSExportTotalStrengthReport();

    const handleExportExcel = () => {
        if (!studentList.length) {
            toast.error('No data available to export');
            return;
        }
        try {
            const excelData: any[] = [];

            Object.entries(groupedData).forEach(([groupKey, sections]) => {
                sections.forEach((item: any, sectionIndex: number) => {
                    const row: any = {
                        'Sl.No': sectionIndex + 1,
                        Class: sectionIndex === 0 ? item.classname : '',
                        Section: item.sectionname,
                        Boys: item.boys || 0,
                        Girls: item.girls || 0,
                        Total: item.totalstudents || 0,
                        'New Admission': item.newAdmission || 0
                    };

                    dynamicElectives.forEach((e: any) => {
                        const fieldName = e.ISMS_SubjectName || (e as any).ismS_SubjectName;
                        row[fieldName] = item[fieldName] || 0;
                    });

                    excelData.push(row);
                });

                // Add Subtotal Row
                const subtotalRow: any = {
                    'Sl.No': '',
                    Class: 'Total',
                    Section: '',
                    Boys: calculateClassTotalByGroup(groupKey, 'boys'),
                    Girls: calculateClassTotalByGroup(groupKey, 'girls'),
                    Total: calculateClassTotalByGroup(groupKey, 'totalstudents'),
                    'New Admission': calculateClassTotalByGroup(groupKey, 'newAdmission')
                };

                dynamicElectives.forEach((e: any) => {
                    const fieldName = e.ISMS_SubjectName || (e as any).ismS_SubjectName;
                    subtotalRow[fieldName] = calculateClassTotalByGroup(groupKey, fieldName);
                });

                excelData.push(subtotalRow);
            });

            // Add Grand Total Row
            const grandTotalRow: any = {
                'Sl.No': '',
                Class: 'GRAND TOTAL',
                Section: '',
                Boys: calculateGrandTotal('boys'),
                Girls: calculateGrandTotal('girls'),
                Total: calculateGrandTotal('totalstudents'),
                'New Admission': calculateGrandTotal('newAdmission')
            };

            dynamicElectives.forEach((e: any) => {
                const fieldName = e.ISMS_SubjectName || (e as any).ismS_SubjectName;
                grandTotalRow[fieldName] = calculateGrandTotal(fieldName);
            });

            excelData.push(grandTotalRow);

            const worksheet = XLSX.utils.json_to_sheet(excelData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Total Strength');
            XLSX.writeFile(workbook, 'TotalStrengthReport.xlsx');
            toast.success('Excel exported successfully');
        } catch (error) {
            console.error('Excel Export Error:', error);
            toast.error('Failed to export Excel');
        }
    };

    const toggleElective = (id: number) => {
        const current = [...watchElectives];
        const index = current.indexOf(id);
        if (index > -1) current.splice(index, 1);
        else current.push(id);
        setValue('electives', current);
    };

    const handleSelectAllElectives = () => {
        if (watchElectives.length === resolvedElectiveList.length && resolvedElectiveList.length > 0) {
            setValue('electives', []);
        } else {
            setValue(
                'electives',
                resolvedElectiveList.map((e: any) => e.ismS_Id)
            );
        }
    };

    return (
        <div className='min-h-screen p-1'>
            <CollapsibleSection title='Total Strength Report' defaultOpen={true}>
                <div className='grid grid-cols-1 gap-6 p-4 md:grid-cols-2'>
                    <div className='space-y-4 rounded-lg border bg-gray-50/50 p-4'>
                        <div className='flex justify-center gap-8'>
                            <Controller
                                name='reportType'
                                control={control}
                                render={({ field }) => (
                                    <RadioGroup value={field.value} onValueChange={field.onChange} className='flex gap-4'>
                                        <div className='flex items-center space-x-2'>
                                            <RadioGroupItem value='All' id='r-all' />
                                            <Label htmlFor='r-all'>All</Label>
                                        </div>
                                        <div className='flex items-center space-x-2'>
                                            <RadioGroupItem value='Individual' id='r-ind' />
                                            <Label htmlFor='r-ind'>Individual</Label>
                                        </div>
                                    </RadioGroup>
                                )}
                            />
                        </div>

                        <div className='flex justify-center gap-8'>
                            <Controller
                                name='status'
                                control={control}
                                render={({ field }) => (
                                    <RadioGroup value={field.value} onValueChange={field.onChange} className='flex gap-4'>
                                        <div className='flex items-center space-x-2'>
                                            <RadioGroupItem value='Present' id='s-pre' />
                                            <Label htmlFor='s-pre'>Present</Label>
                                        </div>
                                        <div className='flex items-center space-x-2'>
                                            <RadioGroupItem value='Left' id='s-left' />
                                            <Label htmlFor='s-left'>Left</Label>
                                        </div>
                                        <div className='flex items-center space-x-2'>
                                            <RadioGroupItem value='Deactive' id='s-dea' />
                                            <Label htmlFor='s-dea'>Deactive</Label>
                                        </div>
                                    </RadioGroup>
                                )}
                            />
                        </div>

                        <div className='flex justify-center gap-8 border-t pt-4'>
                            <div className='flex items-center gap-2'>
                                <Controller
                                    name='withTc'
                                    control={control}
                                    render={({ field }) => <Checkbox id='with-tc' checked={field.value} onCheckedChange={field.onChange} />}
                                />
                                <Label htmlFor='with-tc'>With TC</Label>
                            </div>
                            <div className='flex items-center gap-2'>
                                <Controller
                                    name='withDeactive'
                                    control={control}
                                    render={({ field }) => (
                                        <Checkbox id='with-dea' checked={field.value} onCheckedChange={field.onChange} />
                                    )}
                                />
                                <Label htmlFor='with-dea'>With Deactive</Label>
                            </div>
                        </div>
                    </div>

                    <div className='space-y-4 rounded-lg border bg-gray-50/50 p-4'>
                        <div className='grid grid-cols-1 gap-4'>
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

                            <div className='space-y-1'>
                                <Label>Category</Label>
                                <Controller
                                    name='category'
                                    control={control}
                                    render={({ field }) => (
                                        <Select value={field.value} onValueChange={field.onChange}>
                                            <SelectTrigger>
                                                <SelectValue placeholder='Select Category' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value='0'>All</SelectItem>
                                                {Array.isArray(initialDetails?.data?.category_list) &&
                                                    (initialDetails.data.category_list as any[]).map((c: any) => (
                                                        <SelectItem key={c.amC_Id} value={c.amC_Id.toString()}>
                                                            {c.amC_Name}
                                                        </SelectItem>
                                                    ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </div>

                            {watchReportType === 'Individual' && (
                                <div className='grid grid-cols-2 gap-4'>
                                    <div className='space-y-1'>
                                        <Label>
                                            Class <span className='text-red-500'>*</span>
                                        </Label>
                                        <Controller
                                            name='class'
                                            control={control}
                                            render={({ field }) => (
                                                <Select value={field.value} onValueChange={field.onChange}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder='Select Class' />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {resolvedClassList.map((c: any) => (
                                                            <SelectItem key={c.asmcL_Id} value={c.asmcL_Id.toString()}>
                                                                {c.asmcL_ClassName}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        />
                                        {errors.class && <FormError>{errors.class.message}</FormError>}
                                    </div>
                                    <div className='space-y-1'>
                                        <Label>
                                            Section <span className='text-red-500'>*</span>
                                        </Label>
                                        <Controller
                                            name='section'
                                            control={control}
                                            render={({ field }) => (
                                                <Select value={field.value} onValueChange={field.onChange}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder='Select Section' />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {resolvedSectionList.map((s: any) => (
                                                            <SelectItem key={s.asmS_Id} value={s.asmS_Id.toString()}>
                                                                {s.asmC_SectionName}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        />
                                        {errors.section && <FormError>{errors.section.message}</FormError>}
                                    </div>
                                </div>
                            )}
                            <Label>
                                Elective Subjects <span className='text-red-500'>*</span>
                            </Label>
                            <div className='space-y-1 rounded border bg-white p-2'>
                                <div className='space-y-1 '>
                                    <div className='mb-1 flex items-center justify-between border-b pb-1'>
                                        <Label className=' flex cursor-pointer items-center gap-2' onClick={handleSelectAllElectives}>
                                            <Checkbox
                                                checked={
                                                    watchElectives.length === resolvedElectiveList.length && resolvedElectiveList.length > 0
                                                }
                                            />
                                            All
                                        </Label>
                                    </div>{' '}
                                </div>
                                <div className='grid max-h-32 grid-cols-2 gap-2 overflow-y-auto'>
                                    {resolvedElectiveList.map((e: any) => (
                                        <div key={e.ismS_Id} className='flex items-center gap-2 text-sm'>
                                            <Checkbox
                                                id={`e-${e.ismS_Id}`}
                                                checked={watchElectives.includes(e.ismS_Id)}
                                                onCheckedChange={() => toggleElective(e.ismS_Id)}
                                            />
                                            <Label htmlFor={`e-${e.ismS_Id}`} className='cursor-pointer truncate'>
                                                {e.ismS_SubjectName}
                                            </Label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className='flex justify-center gap-4 border-t p-4'>
                    <Button variant='outline' onClick={handleReset}>
                        <RotateCcw className='mr-2 h-4 w-4' /> Reset
                    </Button>
                    <Button onClick={handleReport} disabled={isReportLoading}>
                        <FileText className='mr-2 h-4 w-4' /> Report
                    </Button>
                    <Button variant='outline' onClick={handleExportExcel} disabled={!showReport}>
                        <FileSpreadsheet className='mr-2 h-4 w-4' /> Excel
                    </Button>
                    <Button variant='outline' onClick={handlePrint} disabled={!showReport}>
                        <Printer className='mr-2 h-4 w-4' /> Print
                    </Button>
                </div>
            </CollapsibleSection>

            {showReport && (
                <div className='mt-4'>
                    <CollapsibleSection title='Report Details' defaultOpen={true}>
                        <div className='overflow-x-auto p-4'>
                            <table className='w-full border-collapse border border-gray-300 text-sm'>
                                <thead>
                                    <tr className='bg-[#005cb9] text-[12px] text-white uppercase'>
                                        <th className='border border-gray-300 p-2'>SL. No.</th>
                                        <th className='border border-gray-300 p-2 text-left'>Class</th>
                                        <th className='border border-gray-300 p-2 text-left'>Section</th>
                                        <th className='border border-gray-300 p-2'>Boys</th>
                                        <th className='border border-gray-300 p-2'>Girls</th>
                                        <th className='border border-gray-300 p-2 text-right'>Total</th>
                                        <th className='border border-gray-300 p-2'>New Admission</th>
                                        {dynamicElectives.map((e: any, i: number) => (
                                            <th
                                                key={e.ISMS_Id || (e as any).ismS_Id || i}
                                                className='whitespace-nowrap border border-gray-300 p-2 text-center'>
                                                {e.ISMS_SubjectName || (e as any).ismS_SubjectName}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {Object.entries(groupedData).map(([groupKey, sections], index) => (
                                        <Fragment key={groupKey}>
                                            {sections.map((item: any, sectionIndex) => (
                                                <tr key={`${groupKey}-${sectionIndex}`} className='hover:bg-gray-50'>
                                                    <td className='border border-gray-300 p-2 text-center'>{sectionIndex + 1}</td>
                                                    <td className='border border-gray-300 p-2'>{item.classname}</td>
                                                    <td className='border border-gray-300 p-2'>{item.sectionname}</td>
                                                    <td className='border border-gray-300 p-2 text-center'>{item.boys}</td>
                                                    <td className='border border-gray-300 p-2 text-center'>{item.girls}</td>
                                                    <td className='border border-gray-300 p-2 text-right font-medium'>
                                                        {item.totalstudents}
                                                    </td>
                                                    <td className='border border-gray-300 p-2 text-center'>{item.newAdmission || 0}</td>
                                                    {dynamicElectives.map((e: any, i: number) => (
                                                        <td
                                                            key={e.ISMS_Id || (e as any).ismS_Id || i}
                                                            className='border border-gray-300 p-2 text-center'>
                                                            {item[e.ISMS_SubjectName || (e as any).ismS_SubjectName] || 0}
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                            <tr className='bg-blue-50 font-bold'>
                                                <td className='border border-gray-300 p-2'></td>
                                                <td className='border border-gray-300 p-2'>Total</td>
                                                <td className='border border-gray-300 p-2'></td>
                                                <td className='border border-gray-300 p-2 text-center'>
                                                    {calculateClassTotalByGroup(groupKey, 'boys')}
                                                </td>
                                                <td className='border border-gray-300 p-2 text-center'>
                                                    {calculateClassTotalByGroup(groupKey, 'girls')}
                                                </td>
                                                <td className='border border-gray-300 p-2 text-right'>
                                                    {calculateClassTotalByGroup(groupKey, 'totalstudents')}
                                                </td>
                                                <td className='border border-gray-300 p-2 text-center'>
                                                    {calculateClassTotalByGroup(groupKey, 'newAdmission')}
                                                </td>
                                                {dynamicElectives.map((e: any, i: number) => (
                                                    <td
                                                        key={e.ISMS_Id || (e as any).ismS_Id || i}
                                                        className='border border-gray-300 p-2 text-center'>
                                                        {calculateClassTotalByGroup(
                                                            groupKey,
                                                            e.ISMS_SubjectName || (e as any).ismS_SubjectName
                                                        )}
                                                    </td>
                                                ))}
                                            </tr>
                                        </Fragment>
                                    ))}
                                    <tr className='bg-green-100 font-black text-base uppercase'>
                                        <td className='border border-gray-300 p-2'></td>
                                        <td className='border border-gray-300 p-2'>Grand Total</td>
                                        <td className='border border-gray-300 p-2'></td>
                                        <td className='border border-gray-300 p-2 text-center'>{calculateGrandTotal('boys')}</td>
                                        <td className='border border-gray-300 p-2 text-center'>{calculateGrandTotal('girls')}</td>
                                        <td className='border border-gray-300 p-2 text-right'>{calculateGrandTotal('totalstudents')}</td>
                                        <td className='border border-gray-300 p-2 text-center'>{calculateGrandTotal('newAdmission')}</td>
                                        {dynamicElectives.map((e: any, i: number) => (
                                            <td
                                                key={e.ISMS_Id || (e as any).ismS_Id || i}
                                                className='border border-gray-300 p-2 text-center'>
                                                {calculateGrandTotal(e.ISMS_SubjectName || (e as any).ismS_SubjectName)}
                                            </td>
                                        ))}
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </CollapsibleSection>
                </div>
            )}

            <div style={{ height: 0, overflow: 'hidden', position: 'absolute', pointerEvents: 'none' }}>
                <TotalStrengthPrint
                    ref={printRef}
                    groupedData={groupedData}
                    totalGrand={calculateGrandTotal('totalstudents')}
                    dynamicElectives={dynamicElectives}
                    schoolName={
                        masterCompanyResponse?.data?.[0]?.companyname ||
                        reportResponse?.data?.MasterCompany?.[0]?.companyname ||
                        initialDetails?.data?.m_School_Address?.[0]?.m_School_Name
                    }
                    schoolAddress={
                        masterCompanyResponse?.data?.[0]?.address ||
                        reportResponse?.data?.MasterCompany?.[0]?.address ||
                        initialDetails?.data?.m_School_Address?.[0]?.m_School_Address
                    }
                    schoolPhone={initialDetails?.data?.m_School_Address?.[0]?.m_School_PhoneNo}
                    logoUrl={
                        masterCompanyResponse?.data?.[0]?.milogo ||
                        reportResponse?.data?.MasterCompany?.[0]?.milogo ||
                        initialDetails?.data?.m_School_Address?.[0]?.m_School_Logo
                    }
                    yearString={academicYear?.data?.find((y) => y.asmaY_Id === watchAcademicYear)?.asmaY_Year || ''}
                />
            </div>
        </div>
    );
}
