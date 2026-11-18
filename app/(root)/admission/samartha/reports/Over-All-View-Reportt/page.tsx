'use client';

import { FileDown, FileText, Loader2, Printer, RotateCcw, Search } from 'lucide-react';
import { Fragment, useMemo, useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/extension/field';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { useOverAllViewReportData, useOverAllViewReportInitialDetails } from '@/hooks/admission/preadmission/reports/useOverAllViewReport';
import { exportToExcel } from '@/lib/export-to-file';

export default function OverAllViewReportPage() {
    const printRef = useRef<HTMLDivElement>(null);

    /* -------------------- Data Fetching -------------------- */
    const { data: initialData, isLoading: isInitialLoading } = useOverAllViewReportInitialDetails();
    const reportMutation = useOverAllViewReportData();

    /* -------------------- UI State -------------------- */
    const [asmaY_Id, setAsmaY_Id] = useState<number | null>(null);
    const [asmcL_Id, setAsmcL_Id] = useState<number>(0);
    const [asmS_Id, setAsmS_Id] = useState<number>(0);
    const [studentType, setStudentType] = useState<string>('0');
    const [searchValue, setSearchValue] = useState('');
    const [reportData, setReportData] = useState<any>(null);
    const [showReport, setShowReport] = useState(false);

    const yearDropdown = initialData?.data?.yearlist || initialData?.data?.academicList || [];
    const classDropdown = initialData?.data?.classlist || [];
    const sectionDropdown = initialData?.data?.sectionlist || [];

    /* -------------------- Data Processing -------------------- */
    // Grouping logic equivalent to legacy taskid5
    const processedData = useMemo(() => {
        const dataList = reportData?.studentList3 || [];
        if (!dataList || dataList.length === 0) return [];

        const filtered = dataList.filter((item: any) => {
            const searchStr = searchValue.toLowerCase();
            return item.asmcl_classname?.toLowerCase().includes(searchStr) || item.asmc_sectionname?.toLowerCase().includes(searchStr);
        });

        const groups: any[] = [];
        const summaryList = reportData?.studentList1 || [];

        filtered.forEach((item: any) => {
            // Find overall gender counts for this section from studentList1
            const sectionSummary = summaryList.find(
                (s: any) => s.asmcl_id === item.asmcl_id && s.asmc_sectionname === item.asmc_sectionname
            );

            // Merge gender counts if found
            const enrichedItem = {
                ...item,
                female: sectionSummary ? sectionSummary.female : item.female,
                male: sectionSummary ? sectionSummary.male : item.male
            };

            let group = groups.find((g) => g.ASMCL_Id === enrichedItem.asmcl_id);
            if (!group) {
                group = {
                    ASMCL_Id: enrichedItem.asmcl_id,
                    ASMCL_ClassName: enrichedItem.asmcl_classname,
                    studentlistdetails: []
                };
                groups.push(group);
            }
            group.studentlistdetails.push(enrichedItem);
        });

        return groups;
    }, [reportData, searchValue]);

    /* -------------------- Helper Functions -------------------- */
    const getClassTotal = (group: any, key: string) => {
        return group.studentlistdetails.reduce((sum: number, item: any) => sum + (Number.parseInt(item[key]) || 0), 0);
    };

    const getGrandTotal = (key: string) => {
        return processedData.reduce((grandSum, group) => grandSum + getClassTotal(group, key), 0);
    };

    /* -------------------- Actions -------------------- */
    const handleShowReport = async () => {
        if (!asmaY_Id) {
            toast.error('Please select an Academic Year');
            return;
        }

        try {
            const res = await reportMutation.mutateAsync({
                ASMAY_Id: asmaY_Id,
                ASMCL_Id: asmcL_Id,
                ASMS_Id: asmS_Id,
                stdmobilenumber: studentType
            });
            const data = res?.data || res;

            if (data?.studentList3?.length > 0) {
                setReportData(data);
                setShowReport(true);
            } else {
                toast.error('No records found');
                setShowReport(false);
            }
        } catch (error) {
            toast.error('Failed to fetch report data');
        }
    };

    const handleClear = () => {
        setAsmaY_Id(null);
        setSearchValue('');
        setReportData([]);
        setShowReport(false);
    };

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: 'Categorywise_Attendance_Report'
    });

    const handleExport = () => {
        if (!reportData || reportData.length === 0) return;

        const columns = [
            { label: 'Class', value: 'asmcl_classname' },
            { label: 'Section', value: 'asmc_sectionname' },
            { label: 'Female', value: 'female' },
            { label: 'Male', value: 'male' },
            { label: 'Total', value: 'total' },
            { label: 'Male GENERAL', value: 'male_general' },
            { label: 'Female GENERAL', value: 'female_general' },
            { label: 'Male OBC', value: 'male_obc' },
            { label: 'Female OBC', value: 'female_obc' },
            { label: 'Male SC', value: 'male_sc' },
            { label: 'Female SC', value: 'female_sc' },
            { label: 'Male ST', value: 'male_st' },
            { label: 'Female ST', value: 'female_st' },
            { label: 'New(+)', value: 'newst_totalcount' },
            { label: 'Old', value: 'oldst_totalcount' },
            { label: 'Male HINDU', value: 'male_hindu' },
            { label: 'Female HINDU', value: 'female_hindu' },
            { label: 'Male CHRISTIAN', value: 'male_christian' },
            { label: 'Female CHRISTIAN', value: 'female_christian' },
            { label: 'Male ISLAM', value: 'male_islam' },
            { label: 'Female ISLAM', value: 'female_islam' },
            { label: 'Male OTHER', value: 'male_other' },
            { label: 'Female OTHER', value: 'female_other' }
        ];

        // Flat data for export
        const exportContent = processedData.flatMap((group) => {
            const rows = group.studentlistdetails.map((item: any) => ({
                ...item,
                asmcl_classname: group.ASMCL_ClassName
            }));

            // Add sub-total row for Excel
            rows.push({
                asmcl_classname: 'Total',
                asmc_sectionname: '',
                female: getClassTotal(group, 'female'),
                male: getClassTotal(group, 'male'),
                total: getClassTotal(group, 'total'),
                male_general: getClassTotal(group, 'male_general'),
                female_general: getClassTotal(group, 'female_general'),
                male_obc: getClassTotal(group, 'male_obc'),
                female_obc: getClassTotal(group, 'female_obc'),
                male_sc: getClassTotal(group, 'male_sc'),
                female_sc: getClassTotal(group, 'female_sc'),
                male_st: getClassTotal(group, 'male_st'),
                female_st: getClassTotal(group, 'female_st'),
                newst_totalcount: getClassTotal(group, 'newst_totalcount'),
                oldst_totalcount: getClassTotal(group, 'oldst_totalcount'),
                male_hindu: getClassTotal(group, 'male_hindu'),
                female_hindu: getClassTotal(group, 'female_hindu'),
                male_christian: getClassTotal(group, 'male_christian'),
                female_christian: getClassTotal(group, 'female_christian'),
                male_islam: getClassTotal(group, 'male_islam'),
                female_islam: getClassTotal(group, 'female_islam'),
                male_other: getClassTotal(group, 'male_other'),
                female_other: getClassTotal(group, 'female_other')
            });

            return rows;
        });

        // Add Grand Total row
        exportContent.push({
            asmcl_classname: 'Grand Total',
            asmc_sectionname: '',
            female: getGrandTotal('female'),
            male: getGrandTotal('male'),
            total: getGrandTotal('total'),
            male_general: getGrandTotal('male_general'),
            female_general: getGrandTotal('female_general'),
            male_obc: getGrandTotal('male_obc'),
            female_obc: getGrandTotal('female_obc'),
            male_sc: getGrandTotal('male_sc'),
            female_sc: getGrandTotal('female_sc'),
            male_st: getGrandTotal('male_st'),
            female_st: getGrandTotal('female_st'),
            newst_totalcount: getGrandTotal('newst_totalcount'),
            oldst_totalcount: getGrandTotal('oldst_totalcount'),
            male_hindu: getGrandTotal('male_hindu'),
            female_hindu: getGrandTotal('female_hindu'),
            male_christian: getGrandTotal('male_christian'),
            female_christian: getGrandTotal('female_christian'),
            male_islam: getGrandTotal('male_islam'),
            female_islam: getGrandTotal('female_islam'),
            male_other: getGrandTotal('male_other'),
            female_other: getGrandTotal('female_other')
        });

        exportToExcel('Categorywise_Attendance_Report', JSON.stringify(columns), JSON.stringify(exportContent));
    };

    return (
        <div className='min-h-screen space-y-6 p-4'>
            <CollapsibleSection
                title='Over All View Report'
                description='View and export attendance reports categorized by class, religion, and caste'
                defaultOpen={true}
                className='overflow-hidden rounded-2xl border bg-white/80 shadow-xl backdrop-blur-sm'>
                <div className='space-y-8 p-6'>
                    <div className='mx-auto flex max-w-md flex-col items-center justify-center space-y-4'>
                        <div className='flex w-full flex-col space-y-2'>
                            <Label className='flex items-center font-bold text-sm'>
                                Academic Year <span className='ml-1 text-red-500'>*</span>
                            </Label>
                            <Select value={asmaY_Id?.toString()} onValueChange={(v) => setAsmaY_Id(Number(v))} disabled={isInitialLoading}>
                                <SelectTrigger className='h-10 transition-all hover:border-blue-400 focus:ring-blue-100'>
                                    <SelectValue placeholder={isInitialLoading ? 'Loading...' : 'Select Academic Year'} />
                                </SelectTrigger>
                                <SelectContent>
                                    {yearDropdown.map((year: any) => (
                                        <SelectItem key={year.asmaY_Id} value={year.asmaY_Id.toString()}>
                                            {year.asmaY_Year}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* <div className="w-full grid grid-cols-2 gap-4">
                            <div className="flex flex-col space-y-2">
                                <Label className="text-sm font-bold flex items-center">
                                    Class
                                </Label>
                                <Select
                                    value={asmcL_Id.toString()}
                                    onValueChange={(v) => setAsmcL_Id(Number(v))}
                                >
                                    <SelectTrigger className="h-10">
                                        <SelectValue placeholder="Select Class" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="0">All Classes</SelectItem>
                                        {classDropdown.map((cls: any) => (
                                            <SelectItem key={cls.asmcL_Id} value={cls.asmcL_Id.toString()}>
                                                {cls.asmcL_ClassName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex flex-col space-y-2">
                                <Label className="text-sm font-bold flex items-center">
                                    Section
                                </Label>
                                <Select
                                    value={asmS_Id.toString()}
                                    onValueChange={(v) => setAsmS_Id(Number(v))}
                                >
                                    <SelectTrigger className="h-10">
                                        <SelectValue placeholder="Select Section" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="0">All Sections</SelectItem>
                                        {sectionDropdown.map((sec: any) => (
                                            <SelectItem key={sec.asmS_Id} value={sec.asmS_Id.toString()}>
                                                {sec.asmC_SectionName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="w-full flex flex-col space-y-3 pt-2">
                            <Label className="text-sm font-bold flex items-center">
                                Student Type
                            </Label>
                            <div className="flex bg-slate-100 p-1 rounded-lg w-full">
                                {[
                                    { label: 'Both', value: '0' },
                                    { label: 'New', value: '1' },
                                    { label: 'Regular', value: '2' }
                                ].map((type) => (
                                    <button
                                        key={type.value}
                                        onClick={() => setStudentType(type.value)}
                                        className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${studentType === type.value
                                                ? 'bg-white text-blue-600 shadow-sm'
                                                : 'text-slate-500 hover:text-slate-700'
                                            }`}
                                    >
                                        {type.label}
                                    </button>
                                ))}
                            </div>
                        </div> */}
                    </div>

                    <div className='flex flex-wrap justify-center gap-4 border-t pt-6'>
                        <Button
                            onClick={handleShowReport}
                            disabled={reportMutation.isPending}
                            className='w-40 bg-blue-600 shadow-lg transition-all hover:scale-105 hover:bg-blue-700'>
                            {reportMutation.isPending ? (
                                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                            ) : (
                                <FileText className='mr-2 h-4 w-4' />
                            )}
                            REPORT
                        </Button>
                        <Button
                            variant='outline'
                            onClick={handleClear}
                            className='w-40 border-orange-200 text-orange-600 transition-all hover:scale-105 hover:bg-orange-50'>
                            <RotateCcw className='mr-2 h-4 w-4' />
                            CANCEL
                        </Button>
                        <Button
                            onClick={handleExport}
                            disabled={!showReport}
                            className='w-40 bg-emerald-600 shadow-lg transition-all hover:scale-105 hover:bg-emerald-700'>
                            <FileDown className='mr-2 h-4 w-4' />
                            EXCEL
                        </Button>
                        <Button
                            onClick={handlePrint}
                            disabled={!showReport}
                            className='w-40 bg-slate-800 shadow-lg transition-all hover:scale-105 hover:bg-slate-900'>
                            <Printer className='mr-2 h-4 w-4' />
                            PRINT
                        </Button>
                    </div>
                </div>
            </CollapsibleSection>

            {showReport && (
                <div className='rounded-2xl border bg-white/90 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.06)] backdrop-blur-md'>
                    <div className='mb-6 flex flex-col items-center justify-between gap-4 md:flex-row'>
                        <div className='flex items-center space-x-4'>
                            <div className='flex flex-col'>
                                <span className='font-bold text-slate-400 text-xs uppercase tracking-wider'>Total Records</span>
                                <Badge variant='secondary' className='border-blue-100 bg-blue-50 px-4 py-1 text-blue-700 text-lg'>
                                    {reportData?.studentList3?.length || 0}
                                </Badge>
                            </div>
                        </div>

                        <div className='relative w-full max-w-sm'>
                            <Search className='-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-slate-400' />
                            <Input
                                placeholder='Search here...'
                                className='h-10 rounded-xl border-slate-200 pl-10 focus:ring-blue-100'
                                value={searchValue}
                                onChange={(e) => setSearchValue(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className='overflow-hidden rounded-xl border border-slate-100 shadow-inner print:overflow-visible'>
                        <div ref={printRef} className='printable-container bg-white p-8 text-black'>
                            {/* Force visibility in the print iframe */}
                            <style>{`
                                @media screen {
                                    .print-only { display: none !important; }
                                }
                                @media print {
                                    @page { 
                                        size: landscape; 
                                        margin: 10mm; 
                                    }
                                    body {
                                        visibility: hidden !important;
                                        -webkit-print-color-adjust: exact !important;
                                        print-color-adjust: exact !important;
                                    }
                                    .printable-container, .printable-container * {
                                        visibility: visible !important;
                                        background-color: transparent !important;
                                        backdrop-filter: none !important;
                                        box-shadow: none !important;
                                    }
                                    .printable-container {
                                        position: absolute !important;
                                        left: 0 !important;
                                        top: 0 !important;
                                        width: 100% !important;
                                        display: block !important;
                                        background-color: white !important;
                                    }
                                    .print-only { 
                                        display: flex !important; 
                                    }
                                    h2.print-only { 
                                        display: block !important; 
                                        text-align: center !important;
                                        margin-bottom: 20px !important;
                                    }
                                    .print-table { 
                                        display: table !important; 
                                        width: 100% !important; 
                                        border-collapse: collapse !important;
                                        font-size: 9px !important;
                                        margin-top: 20px !important;
                                    }
                                    .print-table th, .print-table td { 
                                        border: 1px solid black !important;
                                        padding: 4px !important;
                                        color: black !important;
                                    }
                                    .print-table thead tr {
                                        background-color: #f8fafc !important;
                                    }
                                }
                            `}</style>
                            {/* Institution Header for Print */}
                            <div className='print-only mb-6 flex items-center gap-6 border-slate-900 border-b-4 border-double pb-4'>
                                <img src={reportData?.masterCompany?.[0]?.logo} alt='Logo' className='h-24 w-auto object-contain' />
                                <div className='flex-1 text-center'>
                                    <h1 className='mb-1 border-slate-200 border-b pb-1 font-black text-3xl text-slate-900 uppercase tracking-tight'>
                                        {reportData?.masterCompany?.[0]?.companyname || reportData?.masterCompany?.[0]?.name}
                                    </h1>
                                    <p className='mb-1 font-bold text-slate-700 text-sm uppercase tracking-widest'>
                                        OVER-ALL VIEW REPORT (CATEGORY-WISE)
                                    </p>
                                    <div className='flex items-center justify-center gap-4 font-semibold text-slate-600 text-xs'>
                                        <span>Academic Year: {yearDropdown.find((y: any) => y.asmaY_Id === asmaY_Id)?.asmaY_Year}</span>
                                        <span className='h-1.5 w-1.5 rounded-full bg-slate-300' />
                                        <span>Report Date: {new Date().toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>

                            <h2 className='print-only mb-4 text-center font-bold text-slate-800 text-xl uppercase underline decoration-2 underline-offset-4'>
                                Category-wise Strength Report
                            </h2>
                            <table className='print-table w-full border-collapse text-xs'>
                                <thead>
                                    <tr className='bg-slate-50 font-bold text-slate-600'>
                                        <th rowSpan={2} className='border p-2 text-center'>
                                            Class
                                        </th>
                                        <th rowSpan={2} className='border p-2 text-center'>
                                            Section
                                        </th>
                                        <th rowSpan={2} className='border p-2 text-center'>
                                            Female
                                        </th>
                                        <th rowSpan={2} className='border p-2 text-center'>
                                            Male
                                        </th>
                                        <th rowSpan={2} className='border p-2 text-center'>
                                            Total
                                        </th>
                                        <th colSpan={2} className='border bg-blue-50/50 p-2 text-center'>
                                            GENERAL
                                        </th>
                                        <th colSpan={2} className='border bg-orange-50/50 p-2 text-center'>
                                            OBC
                                        </th>
                                        <th colSpan={2} className='border bg-green-50/50 p-2 text-center'>
                                            SC
                                        </th>
                                        <th colSpan={2} className='border bg-red-50/50 p-2 text-center'>
                                            ST
                                        </th>
                                        <th rowSpan={2} className='border p-2 text-center'>
                                            New(+)
                                        </th>
                                        <th rowSpan={2} className='border p-2 text-center'>
                                            Old
                                        </th>
                                        <th colSpan={2} className='border bg-amber-50/30 p-2 text-center'>
                                            HINDU
                                        </th>
                                        <th colSpan={2} className='border bg-sky-50/30 p-2 text-center'>
                                            CHRISTIAN
                                        </th>
                                        <th colSpan={2} className='border bg-emerald-50/30 p-2 text-center'>
                                            ISLAM
                                        </th>
                                        <th colSpan={2} className='border bg-slate-50/30 p-2 text-center'>
                                            Others
                                        </th>
                                    </tr>
                                    <tr className='bg-slate-50/50 font-semibold text-slate-500'>
                                        <th className='border p-1 text-center'>Male</th>
                                        <th className='border p-1 text-center'>Fem.</th>
                                        <th className='border p-1 text-center'>Male</th>
                                        <th className='border p-1 text-center'>Fem.</th>
                                        <th className='border p-1 text-center'>Male</th>
                                        <th className='border p-1 text-center'>Fem.</th>
                                        <th className='border p-1 text-center'>Male</th>
                                        <th className='border p-1 text-center'>Fem.</th>
                                        <th className='border p-1 text-center'>Male</th>
                                        <th className='border p-1 text-center'>Fem.</th>
                                        <th className='border p-1 text-center'>Male</th>
                                        <th className='border p-1 text-center'>Fem.</th>
                                        <th className='border p-1 text-center'>Male</th>
                                        <th className='border p-1 text-center'>Fem.</th>
                                        <th className='border p-1 text-center'>Male</th>
                                        <th className='border p-1 text-center'>Fem.</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {processedData.map((group) => (
                                        <Fragment key={group.ASMCL_Id}>
                                            {group.studentlistdetails.map((item: any, idx: number) => (
                                                <tr
                                                    key={`${group.ASMCL_Id}-${item.asmc_sectionname}-${idx}`}
                                                    className='transition-colors hover:bg-slate-50/30'>
                                                    {idx === 0 && (
                                                        <td
                                                            rowSpan={group.studentlistdetails.length}
                                                            className='border bg-slate-50/10 p-2 text-center align-middle font-bold text-slate-700'>
                                                            {group.ASMCL_ClassName}
                                                        </td>
                                                    )}
                                                    <td className='border p-2 text-center'>{item.asmc_sectionname}</td>
                                                    <td className='border p-2 text-center'>{item.female}</td>
                                                    <td className='border p-2 text-center'>{item.male}</td>
                                                    <td className='border p-2 text-center font-bold'>{item.total}</td>
                                                    <td className='border p-2 text-center'>{item.male_general}</td>
                                                    <td className='border p-2 text-center'>{item.female_general}</td>
                                                    <td className='border p-2 text-center'>{item.male_obc}</td>
                                                    <td className='border p-2 text-center'>{item.female_obc}</td>
                                                    <td className='border p-2 text-center'>{item.male_sc}</td>
                                                    <td className='border p-2 text-center'>{item.female_sc}</td>
                                                    <td className='border p-2 text-center'>{item.male_st}</td>
                                                    <td className='border p-2 text-center'>{item.female_st}</td>
                                                    <td className='border p-2 text-center'>{item.newst_totalcount}</td>
                                                    <td className='border p-2 text-center'>{item.oldst_totalcount}</td>
                                                    <td className='border p-2 text-center'>{item.male_hindu}</td>
                                                    <td className='border p-2 text-center'>{item.female_hindu}</td>
                                                    <td className='border p-2 text-center'>{item.male_christian}</td>
                                                    <td className='border p-2 text-center'>{item.female_christian}</td>
                                                    <td className='border p-2 text-center'>{item.male_islam}</td>
                                                    <td className='border p-2 text-center'>{item.female_islam}</td>
                                                    <td className='border p-2 text-center'>{item.male_other}</td>
                                                    <td className='border p-2 text-center'>{item.female_other}</td>
                                                </tr>
                                            ))}
                                            <tr
                                                key={`${group.ASMCL_Id}-total`}
                                                className='border-slate-200 border-t-2 bg-green-50/40 font-bold'>
                                                <td colSpan={2} className='border p-2 text-center text-green-700 uppercase tracking-wider'>
                                                    Total
                                                </td>
                                                <td className='border p-2 text-center'>{getClassTotal(group, 'female')}</td>
                                                <td className='border p-2 text-center'>{getClassTotal(group, 'male')}</td>
                                                <td className='border p-2 text-center'>{getClassTotal(group, 'total')}</td>
                                                <td className='border p-2 text-center'>{getClassTotal(group, 'male_general')}</td>
                                                <td className='border p-2 text-center'>{getClassTotal(group, 'female_general')}</td>
                                                <td className='border p-2 text-center'>{getClassTotal(group, 'male_obc')}</td>
                                                <td className='border p-2 text-center'>{getClassTotal(group, 'female_obc')}</td>
                                                <td className='border p-2 text-center'>{getClassTotal(group, 'male_sc')}</td>
                                                <td className='border p-2 text-center'>{getClassTotal(group, 'female_sc')}</td>
                                                <td className='border p-2 text-center'>{getClassTotal(group, 'male_st')}</td>
                                                <td className='border p-2 text-center'>{getClassTotal(group, 'female_st')}</td>
                                                <td className='border p-2 text-center'>{getClassTotal(group, 'newst_totalcount')}</td>
                                                <td className='border p-2 text-center'>{getClassTotal(group, 'oldst_totalcount')}</td>
                                                <td className='border p-2 text-center'>{getClassTotal(group, 'male_hindu')}</td>
                                                <td className='border p-2 text-center'>{getClassTotal(group, 'female_hindu')}</td>
                                                <td className='border p-2 text-center'>{getClassTotal(group, 'male_christian')}</td>
                                                <td className='border p-2 text-center'>{getClassTotal(group, 'female_christian')}</td>
                                                <td className='border p-2 text-center'>{getClassTotal(group, 'male_islam')}</td>
                                                <td className='border p-2 text-center'>{getClassTotal(group, 'female_islam')}</td>
                                                <td className='border p-2 text-center'>{getClassTotal(group, 'male_other')}</td>
                                                <td className='border p-2 text-center'>{getClassTotal(group, 'female_other')}</td>
                                            </tr>
                                        </Fragment>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr className='border-rose-200 border-t-2 bg-rose-50 font-black text-rose-900'>
                                        <td colSpan={2} className='border p-3 text-center uppercase tracking-widest'>
                                            Grand Total
                                        </td>
                                        <td className='border p-2 text-center'>{getGrandTotal('female')}</td>
                                        <td className='border p-2 text-center'>{getGrandTotal('male')}</td>
                                        <td className='border p-2 text-center'>{getGrandTotal('total')}</td>
                                        <td className='border p-2 text-center'>{getGrandTotal('male_general')}</td>
                                        <td className='border p-2 text-center'>{getGrandTotal('female_general')}</td>
                                        <td className='border p-2 text-center'>{getGrandTotal('male_obc')}</td>
                                        <td className='border p-2 text-center'>{getGrandTotal('female_obc')}</td>
                                        <td className='border p-2 text-center'>{getGrandTotal('male_sc')}</td>
                                        <td className='border p-2 text-center'>{getGrandTotal('female_sc')}</td>
                                        <td className='border p-2 text-center'>{getGrandTotal('male_st')}</td>
                                        <td className='border p-2 text-center'>{getGrandTotal('female_st')}</td>
                                        <td className='border p-2 text-center'>{getGrandTotal('newst_totalcount')}</td>
                                        <td className='border p-2 text-center'>{getGrandTotal('oldst_totalcount')}</td>
                                        <td className='border p-2 text-center'>{getGrandTotal('male_hindu')}</td>
                                        <td className='border p-2 text-center'>{getGrandTotal('female_hindu')}</td>
                                        <td className='border p-2 text-center'>{getGrandTotal('male_christian')}</td>
                                        <td className='border p-2 text-center'>{getGrandTotal('female_christian')}</td>
                                        <td className='border p-2 text-center'>{getGrandTotal('male_islam')}</td>
                                        <td className='border p-2 text-center'>{getGrandTotal('female_islam')}</td>
                                        <td className='border p-2 text-center'>{getGrandTotal('male_other')}</td>
                                        <td className='border p-2 text-center'>{getGrandTotal('female_other')}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
