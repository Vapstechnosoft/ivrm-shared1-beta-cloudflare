'use client';

import { format } from 'date-fns';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Download, FileText, Loader2, Printer, RotateCcw, Search } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/extension/field';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import {
    useSophiaMultiTCGetReport,
    useSophiaMultiTCLoadData,
    useSophiaMultiTCOnChangeClass,
    useSophiaMultiTCOnChangeSection,
    useSophiaMultiTCOnChangeYear
} from '@/hooks/admission/preadmission/useSophiaMultiTransferCertificate';

export default function SophiaMultiTransferCertificatePage() {
    const printRef = useRef<HTMLDivElement>(null);

    /* -------------------- Masters & State -------------------- */
    const { data: loadDataResponse } = useSophiaMultiTCLoadData();
    const yearChangeMutation = useSophiaMultiTCOnChangeYear();
    const classChangeMutation = useSophiaMultiTCOnChangeClass();
    const sectionChangeMutation = useSophiaMultiTCOnChangeSection();
    const reportMutation = useSophiaMultiTCGetReport();

    const loadData = useMemo(() => {
        const data = loadDataResponse?.data || (loadDataResponse as any);
        return {
            accyear: Array.isArray(data?.accyear) ? data.accyear : [],
            accclass: Array.isArray(data?.accclass) ? data.accclass : []
        };
    }, [loadDataResponse]);

    const [asmaY_Id, setAsmaY_Id] = useState<number | null>(null);
    const [asmcL_Id, setAsmcL_Id] = useState<number | null>(null);
    const [asmS_Id, setAsmS_Id] = useState<number | null>(null);

    const [getclassdetails, setGetclassdetails] = useState<any[]>([]);
    const [GetSectiondetails, setGetSectiondetails] = useState<any[]>([]);
    const [getstudentlist, setGetstudentlist] = useState<any[]>([]);
    const [selectedStudentIds, setSelectedStudentIds] = useState<number[]>([]);
    const [searchchkbx, setSearchchkbx] = useState('');

    const [getstudentreports, setGetstudentreports] = useState<any[]>([]);
    const [showReport, setShowReport] = useState(false);
    const [asmcL_Id12, setAsmcL_Id12] = useState<string>('');
    const [ISS, setISS] = useState<string>('');

    /* -------------------- Helpers -------------------- */
    const convertToRomanClass = (classValue: string) => {
        if (!classValue || classValue.trim() === '') {
            return classValue || '';
        }
        classValue = classValue.trim();
        const classMap: Record<string, string> = {
            '1st': 'I',
            '2nd': 'II',
            '3rd': 'III',
            '4th': 'IV',
            '5th': 'V',
            '6th': 'VI',
            '7th': 'VII',
            '8th': 'VIII',
            '9th': 'IX',
            '10th': 'X',
            '11th': 'XI',
            '12th': 'XII'
        };
        if (classMap[classValue]) {
            return classMap[classValue];
        }
        return classValue;
    };

    const getSlNo = (astC_TCNO: string) => {
        if (!astC_TCNO) return '';
        const parts = astC_TCNO.split('/');
        return parts.length > 2 ? parts.slice(1).join('/') : astC_TCNO;
    };

    const filteredStudents = useMemo(() => {
        if (!searchchkbx) return getstudentlist;
        return getstudentlist.filter((s) => (s.studentname || '').toLowerCase().includes(searchchkbx.toLowerCase()));
    }, [getstudentlist, searchchkbx]);

    /* -------------------- Handlers -------------------- */
    const onchangeyear = async (val: string) => {
        const id = Number(val);
        setAsmaY_Id(id);
        setAsmcL_Id(null);
        setAsmS_Id(null);
        setGetstudentlist([]);
        setSelectedStudentIds([]);
        try {
            const res = await yearChangeMutation.mutateAsync({ ASMAY_Id: id });
            const responseData = res?.data || res;
            const list = Array.isArray(responseData) ? responseData : responseData?.data || responseData?.getclassdetails || [];
            setGetclassdetails(Array.isArray(list) ? list : []);
        } catch (e) {
            toast.error('Failed to load classes');
        }
    };

    const onchangeclass = async (val: string) => {
        const id = Number(val);
        setAsmcL_Id(id);
        setAsmS_Id(null);
        setGetstudentlist([]);
        setSelectedStudentIds([]);
        if (!asmaY_Id) return;
        try {
            const res = await classChangeMutation.mutateAsync({ ASMAY_Id: asmaY_Id, ASMCL_Id: id });
            const responseData = res?.data || res;
            const list = Array.isArray(responseData) ? responseData : responseData?.data || responseData?.getSectiondetails || [];
            setGetSectiondetails(Array.isArray(list) ? list : []);
        } catch (e) {
            toast.error('Failed to load sections');
        }
    };

    const onchangesection = async (val: string) => {
        const id = Number(val);
        setAsmS_Id(id);
        setSelectedStudentIds([]);
        if (!asmaY_Id || !asmcL_Id) return;
        try {
            const res = await sectionChangeMutation.mutateAsync({ ASMAY_Id: asmaY_Id, ASMCL_Id: asmcL_Id, ASMS_Id: id });
            const responseData = res?.data || res;
            const list = Array.isArray(responseData) ? responseData : responseData?.data || responseData?.getstudentdetails || [];
            const normalizedList = (Array.isArray(list) ? list : []).map((s: any) => ({
                ...s,
                amsT_Id: s.amsT_Id || s.AMST_Id || s.amst_id,
                studentName: s.studentname || s.studentName || s.student_name || ''
            }));
            setGetstudentlist(normalizedList);
        } catch (e) {
            toast.error('Failed to load students');
        }
    };

    const OnClickAll = (checked: boolean) => {
        if (checked) {
            setSelectedStudentIds(filteredStudents.map((s) => s.amsT_Id));
        } else {
            setSelectedStudentIds([]);
        }
    };

    const individual = (id: number, checked: boolean) => {
        if (checked) {
            setSelectedStudentIds((prev) => [...prev, id]);
        } else {
            setSelectedStudentIds((prev) => prev.filter((sid) => sid !== id));
        }
    };

    const GetReport = async () => {
        if (!asmaY_Id || !asmcL_Id || !asmS_Id) {
            toast.error('Please select all required fields');
            return;
        }
        if (selectedStudentIds.length === 0) {
            toast.error('Please select at least one student');
            return;
        }

        const selectedStudents = getstudentlist.filter((s) => selectedStudentIds.includes(s.amsT_Id));

        const payload = {
            asmaY_Id: asmaY_Id,
            asmcL_Id: asmcL_Id,
            asmS_Id: asmS_Id,
            studentTempList: selectedStudents.map((s) => ({
                amsT_Id: s.amsT_Id,
                studentName: s.studentName
            }))
        };

        try {
            const res = await reportMutation.mutateAsync(payload);
            const responseData = res?.data || res;
            const reportList = responseData?.studentList || responseData?.data?.studentList || responseData?.getstudentreports || [];

            if (Array.isArray(reportList) && reportList.length > 0) {
                const normalized = reportList.map((item: any) => ({
                    ...item,
                    RomanClass: convertToRomanClass(item.last_class_studied || item.Last_Class_Studied || '')
                }));
                setGetstudentreports(normalized);
                const lastClass = normalized[0].last_class_studied || normalized[0].Last_Class_Studied || '';
                setAsmcL_Id12(lastClass);
                if (lastClass === '10th') setISS('ICSE');
                else if (lastClass === '12th') setISS('ISC');
                else setISS('');
                setShowReport(true);
            } else {
                toast.error('No records found');
                setShowReport(false);
            }
        } catch (e) {
            toast.error('Failed to generate report');
        }
    };

    const Clearid = () => {
        window.location.reload();
    };

    const printToCart = useReactToPrint({
        contentRef: printRef,
        documentTitle: 'Sophia_Transfer_Certificates',
        pageStyle: `
            @page {
                size: B5 portrait;
                margin: 0;
            }
            @media print {
                html, body {
                    height: auto;
                    margin: 0 !important;
                    padding: 0 !important;
                    overflow: visible !important;
                    -webkit-print-color-adjust: exact;
                }
                .pagelayout {
                    width: 176mm !important;
                    height: 250mm !important;
                    padding: 10mm 10mm 30mm 10mm !important;
                    margin: 0 !important;
                    page-break-after: always !important;
                    break-after: page !important;
                    page-break-inside: avoid !important;
                    display: block !important;
                    visibility: visible !important;
                    background: white !important;
                }
                .table-custom {
                    width: 100% !important;
                    border-collapse: collapse !important;
                    border: none !important;
                    margin-bottom: 5px !important;
                }
                .details-table {
                    margin-left: 32px !important;
                }
                .table-custom td {
                    padding: 5px 2px !important;
                    vertical-align: top !important;
                    border: none !important;
                }
                .label-col {
                    width: 160px !important;
                    font-weight: normal !important;
                }
                .colon-col {
                    width: 20px !important;
                    text-align: center !important;
                }
                .value-col {
                    font-weight: normal !important;
                }
                .student-name-value {
                    text-transform: uppercase !important;
                }
                .font-serif {
                    font-family: "Times New Roman", Times, serif !important;
                }
                h1 {
                    font-size: 24px !important;
                    text-align: center !important;
                    margin-top: 0 !important;
                    margin-bottom: 30px !important;
                    display: block !important;
                    visibility: visible !important;
                    color: black !important;
                }
                .hr-thick {
                    border: none !important;
                    border-top: 3px solid black !important;
                    margin: 5px 0 !important;
                    display: block !important;
                    visibility: visible !important;
                }
                .footer-text {
                    font-size: 15px !important;
                    margin-top: 40px !important;
                }
                h1, h3, p, span, td, strong {
                    color: black !important;
                    visibility: visible !important;
                }
            }
        `
    });

    const downloadAsPDF = async () => {
        if (!printRef.current) return;
        const loadingToast = toast.loading('Generating PDF...');
        try {
            const pdf = new jsPDF('p', 'in', [6.93, 9.84]);
            const studentWraps = printRef.current.querySelectorAll('.pagelayout');

            for (let i = 0; i < studentWraps.length; i++) {
                const page = studentWraps[i] as HTMLElement;

                if (i > 0) {
                    pdf.addPage([6.93, 9.84], 'p'); // B5 size in inches
                }

                const canvas = await html2canvas(page, {
                    scale: 3,
                    useCORS: true,
                    logging: false,
                    backgroundColor: '#ffffff'
                });

                const imgData = canvas.toDataURL('image/png');
                const imgWidth = 6.93; // B5 width in inches
                const imgHeight = (canvas.height * imgWidth) / canvas.width;

                pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
            }

            pdf.save(`Sophia_TC_B5_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
            toast.dismiss(loadingToast);
            toast.success('PDF downloaded successfully');
        } catch (error) {
            console.error('PDF generation failed:', error);
            toast.dismiss(loadingToast);
            toast.error('Failed to generate PDF');
        }
    };

    /* -------------------- UI Render -------------------- */
    return (
        <div className='min-h-screen space-y-6 bg-gray-50/50 p-4'>
            <CollapsibleSection
                title='Transfer Certificate Report'
                description='Generate Multi-Student Transfer Certificates for Sophia High School'
                defaultOpen={true}
                variant='outline'
                className='shadow-lg'>
                <div className='rounded-xl bg-white p-6'>
                    <div className='grid grid-cols-1 gap-8 md:grid-cols-2'>
                        {/* Left Side: Dropdowns */}
                        <div className='space-y-6'>
                            <div className='grid grid-cols-[140px_1fr] items-center gap-4'>
                                <Label className='font-bold text-gray-700 text-sm'>
                                    Academic Year:<strong style={{ color: 'red' }}>*</strong>
                                </Label>
                                <Select value={asmaY_Id?.toString()} onValueChange={onchangeyear}>
                                    <SelectTrigger className='h-10 border-gray-300 shadow-sm'>
                                        <SelectValue placeholder='--Select--' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {loadData.accyear.map((item: any, index: number) => (
                                            <SelectItem key={item.asmaY_Id || index} value={item.asmaY_Id?.toString()}>
                                                {item.asmaY_Year}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className='grid grid-cols-[140px_1fr] items-center gap-4'>
                                <Label className='font-bold text-gray-700 text-sm'>
                                    Class:<strong style={{ color: 'red' }}>*</strong>
                                </Label>
                                <Select value={asmcL_Id?.toString()} onValueChange={onchangeclass} disabled={!asmaY_Id}>
                                    <SelectTrigger className='h-10 border-gray-300 shadow-sm'>
                                        <SelectValue placeholder='--Select--' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {getclassdetails.map((item: any, index: number) => (
                                            <SelectItem key={item.asmcL_Id || index} value={item.asmcL_Id?.toString()}>
                                                {item.asmcL_ClassName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className='grid grid-cols-[140px_1fr] items-center gap-4'>
                                <Label className='font-bold text-gray-700 text-sm'>
                                    Section:<strong style={{ color: 'red' }}>*</strong>
                                </Label>
                                <Select value={asmS_Id?.toString()} onValueChange={onchangesection} disabled={!asmcL_Id}>
                                    <SelectTrigger className='h-10 border-gray-300 shadow-sm'>
                                        <SelectValue placeholder='--Select--' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {GetSectiondetails.map((item: any, index: number) => (
                                            <SelectItem key={item.asmS_Id || index} value={item.asmS_Id?.toString()}>
                                                {item.asmC_SectionName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Right Side: Student Multi-select */}
                        <div className='space-y-4'>
                            <div className='flex items-center space-x-2'>
                                <Checkbox
                                    id='selectAll'
                                    checked={filteredStudents.length > 0 && selectedStudentIds.length === filteredStudents.length}
                                    onCheckedChange={(checked) => OnClickAll(checked as boolean)}
                                />
                                <Label htmlFor='selectAll' className='cursor-pointer font-bold text-gray-700 text-sm'>
                                    Student:<strong style={{ color: 'red' }}>*</strong>
                                </Label>
                            </div>
                            <div className='relative'>
                                <Search className='absolute top-2.5 left-2 h-4 w-4 text-muted-foreground' />
                                <Input
                                    placeholder='search here...'
                                    value={searchchkbx}
                                    onChange={(e) => setSearchchkbx(e.target.value)}
                                    className='h-9 border-gray-300 pl-8 text-xs'
                                />
                            </div>
                            <ScrollArea className='h-[160px] w-full rounded-lg border border-gray-200 bg-gray-50/50 p-4'>
                                {filteredStudents.length > 0 ? (
                                    <div className='grid grid-cols-1 gap-2 sm:grid-cols-2'>
                                        {filteredStudents.map((s: any, index: number) => (
                                            <div
                                                key={s.amsT_Id || index}
                                                className='flex items-center space-x-2 rounded-md p-1.5 transition-all hover:bg-white hover:shadow-sm'>
                                                <Checkbox
                                                    id={`std-${s.amsT_Id}`}
                                                    checked={selectedStudentIds.includes(s.amsT_Id)}
                                                    onCheckedChange={(checked) => individual(s.amsT_Id, checked as boolean)}
                                                />
                                                <Label
                                                    htmlFor={`std-${s.amsT_Id}`}
                                                    className='cursor-pointer truncate font-medium text-gray-600 text-xs'>
                                                    {s.studentname}
                                                </Label>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className='flex h-full items-center justify-center text-muted-foreground text-xs italic'>
                                        {getstudentlist.length > 0 ? 'No results found' : 'Select class/section to see students'}
                                    </div>
                                )}
                            </ScrollArea>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className='mt-8 flex flex-wrap justify-center gap-4 border-gray-100 border-t pt-8'>
                        <Button
                            size='sm'
                            onClick={GetReport}
                            disabled={reportMutation.isPending}
                            className='min-w-32 rounded-full bg-[#3f51b5] font-bold text-white uppercase tracking-wider shadow-md hover:bg-[#303f9f]'>
                            {reportMutation.isPending ? (
                                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                            ) : (
                                <FileText className='mr-2 h-4 w-4' />
                            )}
                            REPORT
                        </Button>
                        <Button
                            size='sm'
                            onClick={Clearid}
                            className='min-w-32 rounded-full bg-[#ff5722] font-bold text-white uppercase tracking-wider shadow-md hover:bg-[#f4511e]'>
                            <RotateCcw className='mr-2 h-4 w-4' />
                            CANCEL
                        </Button>
                        <Button
                            size='sm'
                            onClick={printToCart}
                            disabled={!showReport}
                            className='min-w-32 rounded-full bg-[#2196f3] font-bold text-white uppercase tracking-wider shadow-md hover:bg-[#1976d2] disabled:bg-gray-200 disabled:text-gray-400'>
                            <Printer className='mr-2 h-4 w-4' />
                            PRINT
                        </Button>
                        <Button
                            size='sm'
                            onClick={downloadAsPDF}
                            disabled={!showReport}
                            className='min-w-32 rounded-full bg-[#ff9800] font-bold text-white uppercase tracking-wider shadow-md hover:bg-[#f57c00] disabled:bg-gray-200 disabled:text-gray-400'>
                            <Download className='mr-2 h-4 w-4' />
                            DOWNLOAD PDF
                        </Button>
                    </div>
                </div>
            </CollapsibleSection>

            {/* Certificate Preview Section */}
            {showReport && getstudentreports.length > 0 && (
                <div className='mt-8 flex flex-col items-center overflow-auto rounded-3xl border-4 border-indigo-200 border-double bg-gray-200 p-4 md:p-12'>
                    <div ref={printRef} id='JSHSTC' className='w-[176mm] bg-white font-serif text-black shadow-2xl'>
                        {getstudentreports.map((report: any, index: number) => {
                            const isHighSchool = asmcL_Id12 === '10th' || asmcL_Id12 === '12th';
                            return (
                                <div key={index}>
                                    {/* Transfer Certificate Page */}
                                    <div
                                        className='pagelayout relative flex min-h-[250mm] w-[176mm] flex-col p-[10mm]'
                                        style={{ pageBreakBefore: index > 0 ? 'always' : 'avoid' }}>
                                        <div style={{ marginTop: '125px' }}>
                                            <h1 className='text-center'>
                                                <span
                                                    style={{
                                                        borderBottom: '2px solid black',
                                                        paddingBottom: '4px',
                                                        fontSize: '24px',
                                                        display: 'inline-block'
                                                    }}>
                                                    TRANSFER CERTIFICATE
                                                </span>
                                            </h1>

                                            <br />
                                            {/* Admission + Sl.No */}
                                            <table className='table-custom w-full'>
                                                <tbody>
                                                    <tr>
                                                        <td className='text-left font-bold' style={{ fontSize: '15px' }}>
                                                            Admission Number: {report.amst_admno || report.amsT_AdmNo}
                                                        </td>
                                                        <td className='text-right font-bold' style={{ fontSize: '15px' }}>
                                                            Sl. No: {getSlNo(report.astc_tcno || report.astC_TCNO)}
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                            <hr style={{ border: 'none', borderTop: '1.5px solid black', margin: '2px 0 10px 0' }} />

                                            {/* TC Details */}
                                            <table
                                                className='table-custom details-table w-full'
                                                style={{ marginTop: '-4px', fontSize: '15px', lineHeight: '1.6' }}>
                                                <tbody>
                                                    <tr>
                                                        <td width='22'>1.</td>
                                                        <td className='label-col'>Name of Pupil</td>
                                                        <td className='colon-col'>:</td>
                                                        <td className='value-col student-name-value'>{report.studentname}</td>
                                                    </tr>
                                                    <tr>
                                                        <td width='22'>2.</td>
                                                        <td className='label-col'>Father&apos;s Name</td>
                                                        <td className='colon-col'>:</td>
                                                        <td className='value-col'>{report.amst_fathername || report.amsT_FatherName}</td>
                                                    </tr>
                                                    <tr>
                                                        <td width='22'>3.</td>
                                                        <td className='label-col'>Mother&apos;s Name</td>
                                                        <td className='colon-col'>:</td>
                                                        <td className='value-col'>{report.amst_mothername || report.amsT_MotherName}</td>
                                                    </tr>
                                                    <tr>
                                                        <td width='22'>4.</td>
                                                        <td className='label-col'>Religion/Caste</td>
                                                        <td className='colon-col'>:</td>
                                                        <td className='value-col'>
                                                            {report.religion} / {report.caste}
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td width='22'>5.</td>
                                                        <td className='label-col'>Nationality</td>
                                                        <td className='colon-col'>:</td>
                                                        <td className='value-col'>{report.nationality}</td>
                                                    </tr>
                                                    <tr>
                                                        <td width='22'>6.</td>
                                                        <td className='label-col'>Date of Birth</td>
                                                        <td className='colon-col'>:</td>
                                                        <td className='value-col'>
                                                            {report.amst_dob || report.amsT_DOB
                                                                ? format(new Date(report.amst_dob || report.amsT_DOB), 'dd-MMM-yyyy')
                                                                : ''}
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td width='22'>7.</td>
                                                        <td className='label-col'>School Last Attended</td>
                                                        <td className='colon-col'>:</td>
                                                        <td className='value-col'>N/A</td>
                                                    </tr>
                                                    <tr>
                                                        <td width='22'>8.</td>
                                                        <td className='label-col'>Date Of Admission</td>
                                                        <td className='colon-col'>:</td>
                                                        <td className='value-col'>
                                                            {report.amst_date || report.amsT_Date
                                                                ? format(new Date(report.amst_date || report.amsT_Date), 'dd-MMM-yyyy')
                                                                : ''}
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td width='22'>9.</td>
                                                        <td className='label-col'>Conduct</td>
                                                        <td className='colon-col'>:</td>
                                                        <td
                                                            className='value-col'
                                                            contentEditable='true'
                                                            suppressContentEditableWarning={true}>
                                                            Good
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td width='22'>10.</td>
                                                        <td className='label-col'>Date Of Leaving</td>
                                                        <td className='colon-col'>:</td>
                                                        <td
                                                            className='value-col'
                                                            contentEditable='true'
                                                            suppressContentEditableWarning={true}>
                                                            {report.tcdatess ? format(new Date(report.tcdatess), 'dd-MMM-yyyy') : ''}
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td width='22'>11.</td>
                                                        <td className='label-col'>Studying In</td>
                                                        <td className='colon-col'>:</td>
                                                        <td className='value-col'>
                                                            {report.RomanClass} {report.asmc_sectionname || report.asmC_SectionName}
                                                        </td>
                                                    </tr>
                                                    {(report.astc_remarks || report.astC_Remarks) &&
                                                        (report.astc_remarks || report.astC_Remarks).trim() !== '' && (
                                                            <tr>
                                                                <td width='22'>12.</td>
                                                                <td className='label-col'>Remarks</td>
                                                                <td className='colon-col'>:</td>
                                                                <td
                                                                    className='value-col'
                                                                    contentEditable='true'
                                                                    suppressContentEditableWarning={true}>
                                                                    {report.astc_remarks || report.astC_Remarks}
                                                                </td>
                                                            </tr>
                                                        )}
                                                </tbody>
                                            </table>

                                            <hr className='hr-thick' />

                                            {/* Footer Info */}
                                            <div style={{ lineHeight: '1.2', fontSize: '14px' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                                                    <div>
                                                        PEN No.&nbsp;&nbsp;&nbsp;&nbsp; :
                                                        <span>{report.amst_pen_no || report.AMST_PENNo || ''}</span>
                                                    </div>
                                                    <div>
                                                        SATS No.&nbsp;&nbsp;&nbsp;&nbsp; :<span>{report.govtno || ''}</span>
                                                    </div>
                                                </div>
                                                <br />
                                                <br />
                                                <div
                                                    className='certified-text'
                                                    style={{
                                                        margin: '30px 0',
                                                        fontFamily: '"Times New Roman", Times, serif',
                                                        marginTop: '-15px'
                                                    }}>
                                                    Certified that the above mentioned information is in accordance with the school
                                                    register.
                                                </div>

                                                <div
                                                    style={{
                                                        marginTop: '50px',
                                                        marginBottom: '200px',
                                                        fontFamily: '"Times New Roman", Times, serif'
                                                    }}>
                                                    <div
                                                        style={{
                                                            display: 'flex',
                                                            justifyContent: 'space-between',
                                                            marginTop: '10px',
                                                            marginRight: '72px'
                                                        }}>
                                                        <div style={{ fontSize: '18px' }}>
                                                            Date:{' '}
                                                            {report.astc_tcapplicationdate || report.ASTC_TCApplicationDate
                                                                ? format(
                                                                      new Date(
                                                                          report.astc_tcapplicationdate || report.ASTC_TCApplicationDate
                                                                      ),
                                                                      'dd-MMM-yyyy'
                                                                  )
                                                                : ''}
                                                        </div>
                                                        <div>
                                                            <strong style={{ marginRight: '30px', fontSize: '18px' }}>PRINCIPAL</strong>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {isHighSchool && (
                                        <>
                                            {/* Conduct Certificate */}
                                            <div
                                                className='pagelayout flex min-h-[250mm] w-[176mm] flex-col p-[10mm] font-serif'
                                                style={{ pageBreakBefore: 'always' }}>
                                                <div style={{ margin: '150px 2% 30px 2%', fontSize: '16px', lineHeight: '1.6' }}>
                                                    <h3 style={{ textAlign: 'center', fontSize: '24px' }}>
                                                        <strong
                                                            style={{
                                                                color: 'black',
                                                                textDecoration: 'underline',
                                                                textUnderlineOffset: '6px'
                                                            }}>
                                                            CONDUCT CERTIFICATE
                                                        </strong>
                                                    </h3>

                                                    <p
                                                        style={{
                                                            textAlign: 'center',
                                                            marginTop: '60px',
                                                            fontSize: '22px',
                                                            fontStyle: 'italic',
                                                            lineHeight: '2'
                                                        }}>
                                                        This is to certify that <strong>{report.studentname}</strong>
                                                    </p>
                                                    <p
                                                        style={{
                                                            textAlign: 'center',
                                                            marginTop: '-20px',
                                                            fontSize: '22px',
                                                            fontStyle: 'italic',
                                                            lineHeight: '2'
                                                        }}>
                                                        of Standard <strong>{report.RomanClass}</strong> was a student of
                                                        <br />
                                                    </p>
                                                    <p
                                                        style={{
                                                            textAlign: 'center',
                                                            marginTop: '-20px',
                                                            fontSize: '22px',
                                                            fontStyle: 'italic',
                                                            lineHeight: '2'
                                                        }}>
                                                        <strong style={{ fontSize: '22px' }}>SOPHIA HIGH SCHOOL, Bangalore </strong>and was
                                                        <br />
                                                    </p>
                                                    <p
                                                        style={{
                                                            textAlign: 'center',
                                                            marginTop: '-20px',
                                                            fontSize: '22px',
                                                            fontStyle: 'italic',
                                                            lineHeight: '2'
                                                        }}>
                                                        of <strong>Good</strong> Character.
                                                    </p>

                                                    <br />
                                                    <br />
                                                    <p style={{ textAlign: 'left', marginTop: '5px' }}>
                                                        Date:{' '}
                                                        {report.astc_tcapplicationdate || report.ASTC_TCApplicationDate
                                                            ? format(
                                                                  new Date(report.astc_tcapplicationdate || report.ASTC_TCApplicationDate),
                                                                  'dd-MMM-yyyy'
                                                              )
                                                            : ''}
                                                    </p>
                                                    <br />
                                                    <br />
                                                    <p style={{ textAlign: 'right', marginTop: '-70px', fontWeight: 'bold' }}>
                                                        <strong>PRINCIPAL</strong>
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Course Completion Certificate */}
                                            <div
                                                className='pagelayout flex min-h-[250mm] w-[176mm] flex-col p-[10mm] font-serif'
                                                style={{ pageBreakBefore: 'always' }}>
                                                <div style={{ margin: '150px 0% 35px 0%', fontSize: '16px', lineHeight: '1.6' }}>
                                                    <h3 style={{ textAlign: 'center', fontSize: '24px' }}>
                                                        <strong
                                                            style={{
                                                                color: 'black',
                                                                textDecoration: 'underline',
                                                                textUnderlineOffset: '6px'
                                                            }}>
                                                            {' '}
                                                            COURSE COMPLETION <br />
                                                            CERTIFICATE
                                                        </strong>
                                                    </h3>

                                                    <p style={{ textAlign: 'left', marginTop: '60px', fontSize: '20px' }}>
                                                        This is to certify that <strong>{report.studentname}</strong> has successfully
                                                        completed the course of studies in Std.
                                                        <b>{report.RomanClass}</b> leading to the <b>{ISS}</b> Examination.
                                                    </p>

                                                    <br />
                                                    <br />
                                                    <p style={{ textAlign: 'left', marginTop: '5px' }}>
                                                        Date:{' '}
                                                        {report.astc_tcapplicationdate || report.ASTC_TCApplicationDate
                                                            ? format(
                                                                  new Date(report.astc_tcapplicationdate || report.ASTC_TCApplicationDate),
                                                                  'dd-MMM-yyyy'
                                                              )
                                                            : ''}
                                                    </p>
                                                    <br />
                                                    <br />
                                                    <p style={{ textAlign: 'right', marginTop: '-70px', fontWeight: 'bold' }}>PRINCIPAL</p>
                                                </div>
                                            </div>

                                            {/* Final Certificate */}
                                            <div
                                                className='pagelayout flex min-h-[250mm] w-[176mm] flex-col p-[10mm] font-serif'
                                                style={{ pageBreakBefore: 'avoid', pageBreakAfter: 'always' }}>
                                                <div style={{ margin: '150px 4% 30px 4%', fontSize: '16px', lineHeight: '1.6' }}>
                                                    <h3 style={{ textAlign: 'center', fontSize: '24px' }}>
                                                        <strong
                                                            style={{
                                                                color: 'black',
                                                                textDecoration: 'underline',
                                                                textUnderlineOffset: '6px'
                                                            }}>
                                                            CERTIFICATE
                                                        </strong>
                                                    </h3>
                                                    <p style={{ textAlign: 'justify', marginTop: '60px', fontSize: '18px' }}>
                                                        1. This is to certify that <strong>{report.studentname}</strong> is not debarred,
                                                        rusticated or otherwise disqualified from continuing her studies by the school for
                                                        any malpractice at, in any school examination or for any kind of misbehavior.
                                                    </p>
                                                    <p style={{ textAlign: 'justify', fontSize: '18px' }}>
                                                        2. The student does not owe any amount to the school.
                                                    </p>
                                                    <br />
                                                    <br />
                                                    <p style={{ textAlign: 'left', marginTop: '5px' }}>
                                                        Date:{' '}
                                                        {report.astc_tcapplicationdate || report.ASTC_TCApplicationDate
                                                            ? format(
                                                                  new Date(report.astc_tcapplicationdate || report.ASTC_TCApplicationDate),
                                                                  'dd-MMM-yyyy'
                                                              )
                                                            : ''}
                                                    </p>
                                                    <br />
                                                    <br />
                                                    <p style={{ textAlign: 'right', marginTop: '-70px', fontWeight: 'bold' }}>PRINCIPAL</p>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            <style jsx global>{`
                .table-custom {
                    border-collapse: collapse;
                }
                .table-custom td {
                    padding: 4px;
                    vertical-align: top;
                }
                .pagelayout {
                    background-color: white;
                    box-sizing: border-box;
                }
                .details-table {
                    margin-left: 32px;
                }
                .hr-thick {
                    border: none;
                    border-top: 1px solid black;
                    margin: 10px 0;
                }
                .font-serif {
                    font-family: "Times New Roman", Times, serif !important;
                }
                [contentEditable="true"] {
                    outline: none;
                    border-bottom: 1px dashed transparent;
                }
                [contentEditable="true"]:hover {
                    border-bottom-color: #3f51b5;
                }
                @media print {
                    .pagelayout {
                        margin: 0 !important;
                        padding: 0.5in !important;
                    }
                }
            `}</style>
        </div>
    );
}
