'use client';
import { FileSpreadsheet, Printer, RotateCcw, Save } from 'lucide-react';
import { useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAcademicYearDropdown, useMasterCategoryDropdown } from '@/hooks/admission/preadmission/useMasters';
import { useMonthEndReport } from '@/hooks/admission/preadmission/useReports';
import AdmissionMonthEndReport from './_components/columns';
export default function MonthendreportPage() {
    const [academicYearId, setAcademicYearId] = useState<number>(0);
    const [categoryId, setCategoryId] = useState<string>('');
    const [selectedMonth, setSelectedMonth] = useState<string>('');
    const [selectedYear, setSelectedYear] = useState<number>(0);
    const [implementationName, setImplementationName] = useState('');
    const [showReport, setShowReport] = useState(false);
    const [reportData, setReportData] = useState<ReportItem[]>([]);
    const [logo, setLogo] = useState<string>('/school-logo.png');
    const [institutionDetails, setInstitutionDetails] = useState<any[]>([]);

    const printRef = useRef<HTMLDivElement>(null);

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: 'MonthEndReport'
    });

    const requestData = {
        ASMAY_Id: academicYearId,
        AMC_Id: Number(categoryId),
        month: selectedMonth,
        year: selectedYear
    };
    const monthList = [
        { id: 1, name: 'January' },
        { id: 2, name: 'February' },
        { id: 3, name: 'March' },
        { id: 4, name: 'April' },
        { id: 5, name: 'May' },
        { id: 6, name: 'June' },
        { id: 7, name: 'July' },
        { id: 8, name: 'August' },
        { id: 9, name: 'September' },
        { id: 10, name: 'October' },
        { id: 11, name: 'November' },
        { id: 12, name: 'December' }
    ];
    interface ReportItem {
        name: string;
        count?: number; // optional
        photo?: number;
        email?: number;
        phone?: number;
        missingphoto?: number;
        missingemail?: number;
        missingphone?: number;
    }

    const { data: academicYearOptions, isLoading: academicYearLoading } = useAcademicYearDropdown();
    const { data: categoryOptions, isLoading: categoryLoading } = useMasterCategoryDropdown();
    const { refetch } = useMonthEndReport(requestData, false);

    const selectedAcademicYear = academicYearOptions?.data?.find((item: any) => item.asmaY_Id === academicYearId);
    const yearList = selectedAcademicYear ? selectedAcademicYear.asmaY_Year.split('-').map((y: string) => Number(y.trim())) : [];
    // Handle Reset
    const handleReset = () => {
        setAcademicYearId(0);
        setCategoryId('');
        setSelectedMonth('');
        setSelectedYear(0);
        setImplementationName('');
        setShowReport(false);
        setReportData([]);
        setInstitutionDetails([]);
    };

    // Handle Report Generate

    const handleGenerateReport = async () => {
        if (!academicYearId || categoryId === '' || !selectedMonth || !selectedYear) {
            toast.error('Please fill all required fields!');
            return;
        }

        // Show loading toast and store ID
        const toastId = toast.loading('Loading report...');

        try {
            const res = await refetch();
            toast.dismiss(toastId);

            const data = res?.data?.data;
            const monthEndResponse = data?.monthEndResponse;
            const reportList = monthEndResponse?.reportdatelist || (Array.isArray(data) ? data : []);
            const instDetails = data?.institutionDetails || [];

            if (reportList?.length) {
                const r = reportList[0];
                const fetchedLogo = instDetails[0]?.mI_Logo || monthEndResponse?.amC_logo?.[0] || r.MI_Logo || r.mI_Logo || r.mi_logo;
                setLogo(fetchedLogo);
                setInstitutionDetails(instDetails);

                setReportData([
                    { name: 'Student Strength', count: r.totalcount },
                    { name: 'TC Taken', count: r.total_tc },
                    { name: 'Student Absent', count: r.total_absent },
                    {
                        name: 'New Admission',
                        count: r.totalnew,
                        missingphoto: r.missingphoto_new,
                        missingemail: r.missingemail_new,
                        missingphone: r.missingphone_new
                    },

                    {
                        name: 'Missing Photos for student strength',
                        missingphoto: r.missingphoto
                    },
                    {
                        name: 'Missing Email for student strength',
                        missingemail: r.missingemail
                    },
                    {
                        name: 'Missing Mobile for student strength',
                        missingphone: r.missingphone
                    },
                    { name: 'SMS Sent', count: r.smscount },
                    { name: 'Email Sent', count: r.emailcount },
                    { name: 'Bonafide Certificate', count: r.DOB_Certificate_count }
                ]);

                setShowReport(true);
                toast.success('Report generated!');
            } else {
                toast.error('No report data found!');
            }
        } catch (_error) {
            toast.dismiss(toastId);
            toast.error('Something went wrong!');
        }
    };

    const downloadExcel = () => {
        try {
            if (!academicYearId || categoryId === '' || !selectedMonth || !selectedYear) {
                toast.error('Please fill all required fields!');
                return;
            }

            if (!reportData || reportData.length === 0) {
                toast.error('No data available to download!');
                return;
            }

            const excelData = reportData.map((item: any, index: number) => ({
                'SL.No': index + 1,
                'Name': item.name,
                'Count': item.count ?? '-',
                'SMS': item.sms ?? '-',
                'Email Id': item.emailId ?? '-',
                'Missing Photo': item.missingphoto ?? '-',
                'Missing Email': item.missingemail ?? '-',
                'Missing Contact No.': item.missingphone ?? '-'
            }));

            const worksheet = XLSX.utils.json_to_sheet(excelData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'MonthEndReport');

            const monthName = new Date(0, Number(selectedMonth) - 1).toLocaleString('en-US', { month: 'long' });
            XLSX.writeFile(workbook, `MonthEndReport_${monthName}_${selectedYear}.xlsx`);

            toast.success('Excel downloaded successfully');
        } catch (error) {
            console.error('Download error:', error);
            toast.error('Failed to download Excel');
        }
    };

    return (
        <div className='min-h-screen'>
            {/* FILTER CARD */}
            <div className='mb-3 space-y-6 rounded-xl border p-6 shadow-xl'>
                <div className='grid grid-cols-2 gap-6 sm:grid-cols-1 md:grid-cols-4'>
                    {/* Academic Year */}
                    <div className='flex w-full flex-col gap-2'>
                        <Label className='font-semibold'>
                            Academic Year <span className='text-red-500'>*</span>
                        </Label>

                        <Select
                            onValueChange={(value) => setAcademicYearId(Number(value))}
                            value={academicYearId ? String(academicYearId) : undefined}>
                            <SelectTrigger>
                                <SelectValue placeholder='Select Academic Year' />
                            </SelectTrigger>

                            <SelectContent>
                                {academicYearLoading && (
                                    <SelectItem value='loading' disabled>
                                        Loading...
                                    </SelectItem>
                                )}

                                {academicYearOptions?.data?.map((item) => (
                                    <SelectItem key={item.asmaY_Id} value={String(item.asmaY_Id)}>
                                        {item.asmaY_Year}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Category */}
                    <div className='flex w-full flex-col gap-2'>
                        <Label className='font-semibold'>
                            Category <span className='text-red-500'>*</span>
                        </Label>

                        <Select onValueChange={(value) => setCategoryId(value)} value={categoryId !== '' ? categoryId : undefined}>
                            <SelectTrigger>
                                <SelectValue placeholder='Select Category' />
                            </SelectTrigger>

                            <SelectContent>
                                {categoryLoading && (
                                    <SelectItem value='loading' disabled>
                                        Loading...
                                    </SelectItem>
                                )}

                                <SelectItem value='0'>All</SelectItem>

                                {categoryOptions?.data?.map((item) => (
                                    <SelectItem key={item.amC_Id} value={String(item.amC_Id)}>
                                        {item.amC_Name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className='flex w-full flex-col gap-2 '>
                        <Label className='font-semibold'>
                            Month <span className='text-red-500'>*</span>
                        </Label>

                        <Select
                            onValueChange={(value) => setSelectedMonth(value)}
                            value={selectedMonth ? String(selectedMonth) : undefined}>
                            <SelectTrigger>
                                <SelectValue placeholder='Select Month' />
                            </SelectTrigger>

                            <SelectContent>
                                {monthList.map((m) => (
                                    <SelectItem key={m.id} value={String(m.id)}>
                                        {m.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Year */}
                    <div className='flex w-full flex-col gap-2 '>
                        <Label className='font-semibold'>
                            Year <span className='text-red-500'>*</span>
                        </Label>

                        <Select
                            onValueChange={(value) => setSelectedYear(Number(value))}
                            value={selectedYear ? String(selectedYear) : undefined}>
                            <SelectTrigger>
                                <SelectValue placeholder='Select Year' />
                            </SelectTrigger>

                            <SelectContent>
                                {yearList.map((year) => (
                                    <SelectItem key={year} value={String(year)}>
                                        {year}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Implementation Engineer */}
                    <div className='flex w-full flex-col gap-2 '>
                        <InputText
                            label='Implementation Name'
                            id='implementation-name'
                            placeholder='Enter Name'
                            value={implementationName}
                            onChange={(e) => setImplementationName(e.target.value)}
                        />
                    </div>
                </div>

                {/* FILTER BUTTON SECTION */}
                <div className='flex gap-4 pt-4'>
                    <Button onClick={handleReset} variant='outline' className='w-fit'>
                        <RotateCcw className='mr-2 h-4 w-4' />
                        Reset
                    </Button>
                    <Button onClick={handleGenerateReport} className='w-fit'>
                        <Save className='mr-2 h-4 w-4' />
                        Generate Report
                    </Button>
                </div>
            </div>

            {showReport && (
                <div className='mb-4 flex justify-end gap-4'>
                    <Button
                        onClick={() => handlePrint()}
                        variant='outline'
                        className='bg-primary/10 text-primary shadow-sm transition-all duration-300 hover:bg-primary/20'>
                        <Printer className='mr-2 h-4 w-4' />
                        Print Report
                    </Button>
                    <Button
                        onClick={downloadExcel}
                        variant='outline'
                        className='border-green-200 bg-green-50 text-green-600 shadow-sm transition-all duration-300 hover:bg-green-100'>
                        <FileSpreadsheet className='mr-2 h-4 w-4' />
                        Download Excel
                    </Button>
                </div>
            )}

            {showReport && (
                <CollapsibleSection
                    defaultOpen={true}
                    variant='default'
                    size='lg'
                    className='shadow-lg transition-shadow duration-300 hover:shadow-xl'>
                    <div ref={printRef} className='printable-content'>
                        <AdmissionMonthEndReport
                            reportData={reportData}
                            month={selectedMonth}
                            year={selectedYear}
                            academicYear={academicYearId}
                            implementationName={implementationName}
                            logoBase64={logo}
                            institutionDetails={institutionDetails}
                        />
                    </div>
                </CollapsibleSection>
            )}
        </div>
    );
}
