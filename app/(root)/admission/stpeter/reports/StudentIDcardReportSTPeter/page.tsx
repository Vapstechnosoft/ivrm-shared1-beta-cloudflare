'use client';

import { Loader2, Printer, Search } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/extension/field';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import {
    useChangeClassStpeterStudentIdCard,
    useChangeSectionStpeterStudentIdCard,
    useChangeYearStpeterStudentIdCard,
    useStpeterStudentIdCardLoadData,
    useStpeterStudentIdCardReport
} from '@/hooks/admission/preadmission/reports/useStpeterStudentIdCard';

export default function StudentIDcardReportSTPeterPage() {
    const printRef = useRef<HTMLDivElement>(null);

    /* -------------------- Masters -------------------- */
    const { data: loadData, isLoading: isLoadDataLoading } = useStpeterStudentIdCardLoadData();

    /* -------------------- UI State -------------------- */
    const [academicYearId, setAcademicYearId] = useState<number | null>(null);
    const [classId, setClassId] = useState<number | null>(null);
    const [sectionId, setSectionId] = useState<number | null>(null);

    const [classList, setClassList] = useState<any[]>([]);
    const [sectionList, setSectionList] = useState<any[]>([]);
    const [studentList, setStudentList] = useState<any[]>([]);
    const [selectedStudentIds, setSelectedStudentIds] = useState<number[]>([]);
    const [studentSearch, setStudentSearch] = useState('');

    const [showReport, setShowReport] = useState(false);
    const [reportData, setReportData] = useState<any[]>([]);

    const yearMutation = useChangeYearStpeterStudentIdCard();
    const classMutation = useChangeClassStpeterStudentIdCard();
    const sectionMutation = useChangeSectionStpeterStudentIdCard();
    const reportMutation = useStpeterStudentIdCardReport();

    const academicYearList = (loadData as any)?.getAcademicYearList || [];

    /* -------------------- Handlers -------------------- */
    const handleYearChange = async (yearId: number) => {
        setAcademicYearId(yearId);
        setClassId(null);
        setSectionId(null);
        setStudentList([]);
        setSelectedStudentIds([]);
        setShowReport(false);
        try {
            const res = (await yearMutation.mutateAsync({ ASMAY_Id: yearId })) as any;
            const classes = Array.isArray(res) ? res : Array.isArray(res?.getClassList) ? res?.getClassList : [];
            setClassList(classes);
        } catch (error) {
            toast.error('Failed to load classes');
        }
    };

    const handleClassChange = async (cId: number) => {
        setClassId(cId);
        setSectionId(null);
        setStudentList([]);
        setSelectedStudentIds([]);
        setShowReport(false);
        try {
            const res = (await classMutation.mutateAsync({ ASMAY_Id: academicYearId!, ASMCL_Id: cId })) as any;
            const sections = Array.isArray(res) ? res : Array.isArray(res?.getSectionList) ? res?.getSectionList : [];
            setSectionList(sections);
        } catch (error) {
            toast.error('Failed to load sections');
        }
    };

    const handleSectionChange = async (sId: number) => {
        setSectionId(sId);
        setStudentList([]);
        setSelectedStudentIds([]);
        setShowReport(false);
        try {
            const res = (await sectionMutation.mutateAsync({
                ASMAY_Id: academicYearId!,
                ASMCL_Id: classId!,
                ASMS_Id: sId
            })) as any;
            const students = Array.isArray(res) ? res : Array.isArray(res?.getStudentList) ? res?.getStudentList : [];
            setStudentList(students);
            // Default select all
            setSelectedStudentIds(students.map((s: any) => s.amsT_Id));
        } catch (error) {
            toast.error('Failed to load students');
        }
    };

    const handleGenerateReport = async () => {
        if (!academicYearId || !classId || !sectionId || selectedStudentIds.length === 0) {
            toast.error('Please select all fields and at least one student');
            return;
        }

        const studentPayload = studentList
            .filter((s) => selectedStudentIds.includes(s.amsT_Id))
            .map((s) => ({ AMST_Id: s.amsT_Id, StudentName: s.studentName }));

        try {
            const res = (await reportMutation.mutateAsync({
                ASMAY_Id: academicYearId,
                ASMCL_Id: classId,
                ASMS_Id: sectionId,
                StudentTempList: studentPayload
            })) as any;

            const studentsData = Array.isArray(res?.studentList) ? res.studentList : [];

            if (studentsData.length > 0) {
                setReportData(studentsData);
                setShowReport(true);
            } else {
                toast.error('No student details found');
            }
        } catch (error) {
            toast.error('Error generating report');
        }
    };

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: 'St_Peters_Student_ID_Cards'
    });

    const handleClear = () => {
        setAcademicYearId(null);
        setClassId(null);
        setSectionId(null);
        setStudentList([]);
        setSelectedStudentIds([]);
        setShowReport(false);
        window.location.reload();
    };

    const filteredStudents = useMemo(() => {
        return studentList.filter((s) => s.studentName?.toLowerCase().includes(studentSearch.toLowerCase()));
    }, [studentList, studentSearch]);

    return (
        <div className='min-h-screen space-y-6 p-4'>
            <CollapsibleSection
                title='Student ID Card Details'
                description="Generate printable ID cards for St. Peter's School students"
                defaultOpen={true}
                variant='outline'
                className='shadow-lg'>
                <div className='space-y-8 bg-white p-6'>
                    <div className='grid grid-cols-1 gap-8 md:grid-cols-2'>
                        {/* Filters Section */}
                        <div className='space-y-6'>
                            <div className='grid grid-cols-[140px_1fr] items-center gap-4'>
                                <Label className='font-bold text-sm'>
                                    Academic Year:<span className='text-red-500'>*</span>
                                </Label>
                                <Select value={academicYearId?.toString()} onValueChange={(v) => handleYearChange(Number(v))}>
                                    <SelectTrigger className='h-10 rounded-xl'>
                                        <SelectValue placeholder='Select Year' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {academicYearList.map((item: any) => (
                                            <SelectItem key={item.asmaY_Id} value={item.asmaY_Id.toString()}>
                                                {item.asmaY_Year}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className='grid grid-cols-[140px_1fr] items-center gap-4'>
                                <Label className='font-bold text-sm'>
                                    Class:<span className='text-red-500'>*</span>
                                </Label>
                                <Select
                                    disabled={!academicYearId}
                                    value={classId?.toString()}
                                    onValueChange={(v) => handleClassChange(Number(v))}>
                                    <SelectTrigger className='h-10 rounded-xl'>
                                        <SelectValue placeholder='Select Class' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {classList.map((item: any) => (
                                            <SelectItem key={item.asmcL_Id} value={item.asmcL_Id.toString()}>
                                                {item.asmcL_ClassName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className='grid grid-cols-[140px_1fr] items-center gap-4'>
                                <Label className='font-bold text-sm'>
                                    Section:<span className='text-red-500'>*</span>
                                </Label>
                                <Select
                                    disabled={!classId}
                                    value={sectionId?.toString()}
                                    onValueChange={(v) => handleSectionChange(Number(v))}>
                                    <SelectTrigger className='h-10 rounded-xl'>
                                        <SelectValue placeholder='Select Section' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {sectionList.map((item: any) => (
                                            <SelectItem key={item.asmS_Id} value={item.asmS_Id.toString()}>
                                                {item.asmC_SectionName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Student Search Section */}
                        <div className='flex flex-col overflow-hidden rounded-3xl border bg-slate-50/50 shadow-sm'>
                            <div className='flex items-center justify-between border-b bg-slate-100/80 p-3'>
                                <div className='flex items-center space-x-2'>
                                    <Checkbox
                                        id='toggle-all'
                                        checked={selectedStudentIds.length === studentList.length && studentList.length > 0}
                                        onCheckedChange={(checked) =>
                                            setSelectedStudentIds(checked ? studentList.map((s) => s.amsT_Id) : [])
                                        }
                                    />
                                    <Label htmlFor='toggle-all' className='font-black text-slate-500 text-xs uppercase tracking-widest'>
                                        Select All Students
                                    </Label>
                                </div>
                                <span className='rounded-full bg-indigo-100 px-2 py-0.5 font-black text-[10px] text-indigo-700'>
                                    {selectedStudentIds.length} SELECTED
                                </span>
                            </div>
                            <div className='border-b bg-white p-2'>
                                <div className='relative'>
                                    <Search className='-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-slate-400' />
                                    <Input
                                        placeholder='Search by name...'
                                        className='h-9 rounded-xl border-slate-200 pl-9 transition-all focus:ring-indigo-500'
                                        value={studentSearch}
                                        onChange={(e) => setStudentSearch(e.target.value)}
                                    />
                                </div>
                            </div>
                            <ScrollArea className='h-[180px] p-2'>
                                {filteredStudents.length > 0 ? (
                                    <div className='grid grid-cols-1 gap-1'>
                                        {filteredStudents.map((s: any) => (
                                            <div
                                                key={s.amsT_Id}
                                                onClick={() =>
                                                    setSelectedStudentIds((prev) =>
                                                        prev.includes(s.amsT_Id)
                                                            ? prev.filter((i) => i !== s.amsT_Id)
                                                            : [...prev, s.amsT_Id]
                                                    )
                                                }
                                                className={cn(
                                                    'flex cursor-pointer items-center space-x-3 rounded-xl p-2.5 transition-all',
                                                    selectedStudentIds.includes(s.amsT_Id)
                                                        ? 'bg-indigo-50 text-indigo-700'
                                                        : 'hover:bg-white hover:shadow-sm'
                                                )}>
                                                <Checkbox checked={selectedStudentIds.includes(s.amsT_Id)} />
                                                <span className='font-bold text-xs uppercase tracking-tight'>{s.studentName}</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className='flex flex-col items-center justify-center py-10 text-slate-400 text-xs italic opacity-40'>
                                        No students found
                                    </div>
                                )}
                            </ScrollArea>
                        </div>
                    </div>

                    <div className='flex flex-wrap justify-center gap-4 border-slate-50 border-t pt-8'>
                        <Button
                            size='lg'
                            onClick={handleGenerateReport}
                            disabled={reportMutation.isPending}
                            className='h-12 min-w-[160px] rounded-xl bg-indigo-600 font-bold text-white shadow-md hover:bg-indigo-700'>
                            {reportMutation.isPending ? <Loader2 className='mr-2 animate-spin' /> : 'REPORT'}
                        </Button>
                        <Button
                            size='lg'
                            variant='outline'
                            onClick={handleClear}
                            className='h-12 min-w-[160px] rounded-xl border-2 border-slate-200 font-bold text-slate-600 hover:bg-slate-50'>
                            CANCEL
                        </Button>
                        <Button
                            size='lg'
                            onClick={handlePrint}
                            disabled={!showReport}
                            className='h-12 min-w-[160px] rounded-xl bg-slate-800 font-bold text-white shadow-md hover:bg-slate-900'>
                            <Printer className='mr-2 h-4 w-4' />
                            PRINT
                        </Button>
                    </div>
                </div>
            </CollapsibleSection>

            {/* ID Card Display Area */}
            {showReport && reportData.length > 0 && (
                <div className='mt-8 flex flex-col items-center overflow-auto rounded-[3rem] border-2 border-slate-300 border-dashed bg-slate-100 p-10'>
                    <div ref={printRef} className='printable-content flex flex-wrap justify-center gap-10 bg-white p-12 shadow-2xl'>
                        {reportData.map((dd: any, index: number) => (
                            <div key={index} className='id-card-wrapper'>
                                <div className='id-card'>
                                    <div className='top-blue'>
                                        <div className='id-year'>Identity Card : {dd.Academic_year}</div>
                                        <div className='school-logo-main'>
                                            <img
                                                src={
                                                    dd.MI_logo ||
                                                    'https://dcampusstrg.blob.core.windows.net/files/17/ISM_Attachments/034c34ba-ca51-442c-9eb7-74ec831b17b1.png'
                                                }
                                                alt="St. Peter's School Logo"
                                            />
                                        </div>
                                        <div className='school-subtitle-text'>
                                            UNDER THE DIOCESE OF DURGAPUR, (CHURCH OF NORTH INDIA)
                                            <br />
                                            Affiliated to the Council for the Indian School Certificate Examination, New Delhi
                                            <br />
                                            School Code : WB065
                                        </div>
                                    </div>

                                    <div className='photo-container-student'>
                                        <img
                                            src={
                                                dd.AMST_Photoname ||
                                                'https://vapsclg.blob.core.windows.net/files/76/NoticeUpload/d120170c-fbbf-48c2-b675-ef8d053a0d03.jpg'
                                            }
                                            alt='Student Photo'
                                        />
                                    </div>

                                    <div className='student-info-grid'>
                                        <div className='info-entry'>
                                            <span className='info-label'>Name:</span>
                                            <span className='info-value font-black text-sm'>{dd.studentname}</span>
                                        </div>
                                        <div className='info-entry'>
                                            <span className='info-label'>Father's Name:</span>
                                            <span className='info-value'>{dd.fathername}</span>
                                        </div>
                                        <div className='info-entry'>
                                            <span className='info-label'>Class:</span>
                                            <span className='info-value'>
                                                {dd.ClassName} - {dd.SectionName}
                                            </span>
                                        </div>
                                        <div className='info-entry'>
                                            <span className='info-label'>Address:</span>
                                            <span className='info-value line-clamp-2 text-[8px] leading-tight'>
                                                {dd.AMST_PerStreet} {dd.AMST_PerPincode}
                                            </span>
                                        </div>
                                        <div className='info-entry'>
                                            <span className='info-label'>Ph. no.:</span>
                                            <span className='info-value'>{dd.AMST_FatherMobleNo || dd.studentmobile}</span>
                                        </div>
                                        <div className='info-entry'>
                                            <span className='info-label'>Blood Gr:</span>
                                            <span className='info-value text-red-600'>{dd.AMST_BloodGroup || 'N/A'}</span>
                                        </div>
                                    </div>

                                    <div className='principal-signature-area'>
                                        <img
                                            src='https://dcampusstrg.blob.core.windows.net/files/17/ISM_Attachments/dae8327b-b601-4a00-a181-8acf0ce429e7.png'
                                            alt='Principal Signature'
                                        />
                                        <div>Signature of the Principal</div>
                                    </div>

                                    <div className='student-id-footer'>
                                        MIRABAI ROAD, DURGAPUR-713204
                                        <br />
                                        PHONE : 0343-2564132 / 2663994
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700;800;900&display=swap');

                .id-card-wrapper {
                    page-break-inside: avoid;
                    display: inline-block;
                }

                .id-card {
                    width: 350px;
                    height: 535px;
                    position: relative;
                    background: linear-gradient(167deg, #0073bc 47%, #0073bc 47%, transparent 46%), 
                                linear-gradient(165deg, transparent 46%, #f1a311 44%, #f1a311 48%, transparent 48%), 
                                linear-gradient(165deg, white 52%, white 114%);
                    background-position: left top;
                    background-repeat: no-repeat;
                    border: 2.5px solid #003366;
                    box-shadow: 0 10px 25px rgba(0,0,0,0.2);
                    border-radius: 12px;
                    color: #003366;
                    font-family: 'Poppins', sans-serif;
                    overflow: hidden;
                }

                .top-blue {
                    background-color: #0073bc;
                    height: 120px;
                    padding: 8px 10px 0 10px;
                    color: white;
                    position: relative;
                    text-align: center;
                }

                .id-year {
                    font-size: 10px;
                    font-weight: 900;
                    position: absolute;
                    right: 12px;
                    top: 8px;
                    letter-spacing: 0.5px;
                }

                .school-logo-main {
                    margin-top: 15px;
                }

                .school-logo-main img {
                    width: 100%;
                    max-width: 260px;
                    height: auto;
                    filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
                }

                .school-subtitle-text {
                    font-size: 8px;
                    font-weight: 700;
                    line-height: 1.1;
                    margin-top: 4px;
                    color: rgba(255,255,255,0.9);
                    text-transform: uppercase;
                }

                .photo-container-student {
                    margin: 25px auto 0 auto;
                    width: 140px;
                    height: 140px;
                    border: 3px solid #003366;
                    border-radius: 12px;
                    overflow: hidden;
                    background: #f8fafc;
                    box-shadow: 0 4px 10px rgba(0,0,0,0.1);
                }

                .photo-container-student img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .student-info-grid {
                    margin: 25px 30px 0 30px;
                    font-size: 10.5px;
                    font-weight: 600;
                }

                .info-entry {
                    display: flex;
                    margin-bottom: 7px;
                    align-items: flex-start;
                    line-height: 1.2;
                }

                .info-label {
                    width: 110px;
                    color: #003366;
                    font-weight: 800;
                    flex-shrink: 0;
                    opacity: 0.8;
                }

                .info-value {
                    flex: 1;
                    word-break: break-all;
                    color: #0a2540;
                }

                .principal-signature-area {
                    margin-top: 5px;
                    margin-right: 25px;
                    height: 50px;
                    display: flex;
                    flex-direction: column;
                    align-items: flex-end;
                    font-size: 9px;
                    font-weight: 800;
                    font-style: italic;
                    color: #003366;
                }

                .principal-signature-area img {
                    height: 30px;
                    margin-bottom: 2px;
                    mix-blend-mode: multiply;
                }

                .student-id-footer {
                    position: absolute;
                    bottom: 0;
                    width: 100%;
                    background-color: #003366;
                    color: #f1a311;
                    font-weight: 900;
                    font-size: 10px;
                    padding: 8px 5px;
                    text-align: center;
                    border-radius: 0 0 10px 10px;
                    line-height: 1.2;
                    letter-spacing: 0.5px;
                }

                @media print {
                    .printable-content {
                        width: 100% !important;
                        padding: 0 !important;
                        box-shadow: none !important;
                        justify-content: center !important;
                    }
                    @page {
                        size: A4;
                        margin: 10mm;
                    }
                    .id-card {
                        box-shadow: none !important;
                        border: 1px solid #000;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                }
            `}</style>
        </div>
    );
}
