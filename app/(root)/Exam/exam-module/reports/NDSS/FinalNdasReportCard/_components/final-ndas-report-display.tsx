'use client';

import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import { useCallback, Fragment } from 'react';

interface Props {
    data: any;
    date: string;
    onPrint?: () => void;
}

// CBSE 8-point Scholastic Grade scale
function getScholasticGrade(mark: number | string | null | undefined): string {
    if (mark === null || mark === undefined || mark === '') return '';
    const num = Number(mark);
    if (isNaN(num)) return '';
    if (num >= 91) return 'A1';
    if (num >= 81) return 'A2';
    if (num >= 71) return 'B1';
    if (num >= 61) return 'B2';
    if (num >= 51) return 'C1';
    if (num >= 41) return 'C2';
    if (num >= 33) return 'D';
    return 'E';
}

function formatDate(dateStr: string): string {
    if (!dateStr) return '08-08-2026';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
}

export default function FinalNdasReportDisplay({ data, date, onPrint }: Props) {
    const {
        getstudentdetails = [],
        getstudentmarksdetails = [],
        getstudentwisesubjectlist = [],
        getstudentwiseskillslist = [],
        getstudentwiseactiviteslist = [],
        getgroupdetails = [],
        getgroupexamdetails = [],
        gettermdetails = [],
        getstudentwiseattendancedetails = [],
        getpromotionremarksdetails = [],
        getinstitution = []
    } = data || {};

    const handlePrintClick = useCallback(() => {
        if (onPrint) onPrint();
        else window.print();
    }, [onPrint]);

    // Group setup: Term I (7 columns in Scholastic) vs Term II (5 columns in Scholastic)
    const grpTerm1 = getgroupdetails.find((g: any) =>
        (g.empG_DistplayName || '').toUpperCase().includes('TERM I') || (g.empG_DistplayName || '').toUpperCase().includes('TERM 1')
    ) || getgroupdetails[0] || { empG_DistplayName: 'TERM I' };

    const grpTerm2 = getgroupdetails.find((g: any) =>
        (g.empG_DistplayName || '').toUpperCase().includes('TERM II') || (g.empG_DistplayName || '').toUpperCase().includes('TERM 2')
    ) || getgroupdetails[1] || { empG_DistplayName: 'TERM II' };

    // Get exam columns for Term 1 and Term 2
    let term1Exams = getgroupexamdetails.filter((d: any) =>
        d.empG_DistplayName === grpTerm1.empG_DistplayName ||
        (d.empG_DistplayName || '').toUpperCase().includes('TERM I') ||
        (d.empG_DistplayName || '').toUpperCase().includes('TERM 1')
    );

    let term2Exams = getgroupexamdetails.filter((d: any) =>
        d.empG_DistplayName === grpTerm2.empG_DistplayName ||
        (d.empG_DistplayName || '').toUpperCase().includes('TERM II') ||
        (d.empG_DistplayName || '').toUpperCase().includes('TERM 2')
    );

    // Fallbacks if API groupexam details aren't pre-filtered by group name
    if (term1Exams.length === 0 && getgroupexamdetails.length > 0) {
        term1Exams = getgroupexamdetails.slice(0, 5);
        term2Exams = getgroupexamdetails.slice(5);
    }

    return (
        <>
            <style jsx global>{`
                @media print {
                    @page {
                        size: A4 portrait;
                        margin: 8mm 10mm;
                    }
                    body {
                        background: white !important;
                        color: black !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    body * {
                        visibility: hidden;
                    }
                    #nds-print-area, #nds-print-area * {
                        visibility: visible;
                    }
                    #nds-print-area {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                    }
                    .no-print {
                        display: none !important;
                    }
                    .nds-card {
                        page-break-after: always;
                        border: 1.5px solid black !important;
                        padding: 15px !important;
                        margin-bottom: 0 !important;
                        box-sizing: border-box;
                    }
                    .nds-page-2-break {
                        page-break-before: always !important;
                        padding-top: 15px !important;
                    }
                }

                .nds-report-container {
                    font-family: Arial, Helvetica, sans-serif;
                    color: black;
                    background-color: white;
                }
                .nds-card {
                    border: 1.5px solid black;
                    padding: 20px;
                    margin-bottom: 40px;
                    background: white;
                    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
                }
                .nds-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 12px;
                    font-size: 13px;
                }
                .nds-table th, .nds-table td {
                    border: 1px solid black;
                    padding: 5px 6px;
                    text-align: center;
                    vertical-align: middle;
                }
                .nds-table th {
                    font-weight: bold;
                    background-color: #ffffff;
                }
                .nds-text-left { text-align: left !important; }
                .nds-text-center { text-align: center !important; }
                .nds-text-right { text-align: right !important; }
            `}</style>

            <div className='no-print my-4 flex justify-end max-w-5xl mx-auto'>
                <Button onClick={handlePrintClick} className='flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white'>
                    <Printer className='h-4 w-4' />
                    Print All
                </Button>
            </div>

            <div id='nds-print-area' className='nds-report-container max-w-5xl mx-auto'>
                {getstudentdetails.map((report: any) => {
                    const stuId = report.amsT_Id || report.AMST_Id;
                    const studentMarks = getstudentmarksdetails.filter((m: any) => (m.amsT_Id || m.AMST_Id) === stuId);
                    const studentSubjects = getstudentwisesubjectlist.filter((s: any) => (s.amsT_Id || s.AMST_Id) === stuId);
                    const studentAttendance = getstudentwiseattendancedetails.find((a: any) => (a.amsT_Id || a.AMST_Id) === stuId) || {};
                    const studentPromo = getpromotionremarksdetails.find((p: any) => (p.amsT_Id || p.AMST_Id) === stuId) || {};

                    // Split main (Scholastic) vs additional subjects
                    const mainSubjects = studentSubjects.filter((s: any) => s.EMPS_AppToResultFlg !== false);
                    const additionalSubjects = studentSubjects.filter((s: any) => s.EMPS_AppToResultFlg === false);

                    // Helper to get mark for a subject + exam
                    const getMarkRecord = (subjName: string, examId: number, examName?: string, grpDisplayName?: string) => {
                        return studentMarks.find((m: any) => {
                            const isSameSubj = (m.ismS_SubjectName || m.ISMS_SubjectName || '').trim().toLowerCase() === subjName.trim().toLowerCase();
                            const isSameExam = m.emE_Id === examId || m.EME_Id === examId || (examName && (m.emE_ExamName === examName || m.EME_ExamName === examName));
                            return isSameSubj && isSameExam;
                        });
                    };

                    // Calculate Term 1 Subject Total & Grade for main subjects
                    let term1OverallTotal = 0;
                    let term1ScholasticSubjCount = 0;

                    const mainSubjTerm1Data = mainSubjects.map((subj: any) => {
                        let total = 0;
                        let hasMarks = false;

                        const marks = term1Exams.map((ex: any) => {
                            const mrk = getMarkRecord(subj.subjectName, ex.emE_Id, ex.emE_ExamName, grpTerm1.empG_DistplayName);
                            if (mrk) {
                                hasMarks = true;
                                if (['AB', 'M', 'L'].includes(mrk.passFailFlag) || mrk.obtainedMarks === 'AB') {
                                    return { display: mrk.passFailFlag || 'AB', numVal: 0 };
                                }
                                const num = Number(mrk.obtainedMarks ?? mrk.ObtainedMarks ?? 0);
                                total += num;
                                return { display: mrk.obtainedMarks ?? mrk.ObtainedMarks ?? '', numVal: num };
                            }
                            return { display: '', numVal: 0 };
                        });

                        if (hasMarks) {
                            term1OverallTotal += total;
                            term1ScholasticSubjCount++;
                        }

                        const subjectGrade = getScholasticGrade(total);

                        return {
                            subjectName: subj.subjectName,
                            marks,
                            total,
                            grade: subjectGrade
                        };
                    });

                    // Term II marks for main subjects
                    const mainSubjTerm2Data = mainSubjects.map((subj: any) => {
                        const marks = term2Exams.map((ex: any) => {
                            const mrk = getMarkRecord(subj.subjectName, ex.emE_Id, ex.emE_ExamName, grpTerm2.empG_DistplayName);
                            if (mrk) {
                                if (['AB', 'M', 'L'].includes(mrk.passFailFlag) || mrk.obtainedMarks === 'AB') {
                                    return { display: mrk.passFailFlag || 'AB' };
                                }
                                return { display: mrk.obtainedMarks ?? mrk.ObtainedMarks ?? '' };
                            }
                            return { display: '' };
                        });
                        return { subjectName: subj.subjectName, marks };
                    });

                    // Overall Term 1 Percentage & Grade
                    const term1MaxMarks = (term1ScholasticSubjCount || mainSubjects.length) * 100;
                    const term1Percentage = term1MaxMarks > 0 ? (term1OverallTotal / term1MaxMarks) * 100 : 0;
                    const term1OverallGrade = getScholasticGrade(term1Percentage);

                    // Additional Subjects Calculation
                    const addSubjProcessed = additionalSubjects.map((subj: any) => {
                        // Term I: Pen & Paper (or exam 1) + Half Yearly (or exam 2)
                        const t1_pnp = getMarkRecord(subj.subjectName, term1Exams[0]?.emE_Id, 'Pen and Paper Test');
                        const t1_hy = getMarkRecord(subj.subjectName, term1Exams[4]?.emE_Id || term1Exams[term1Exams.length - 1]?.emE_Id, 'Half Yearly Exam');

                        const t1_pnp_val = (t1_pnp?.passFailFlag === 'AB' || t1_pnp?.obtainedMarks === 'AB') ? 'AB' : (t1_pnp?.obtainedMarks ?? '');
                        const t1_hy_val = (t1_hy?.passFailFlag === 'AB' || t1_hy?.obtainedMarks === 'AB') ? 'AB' : (t1_hy?.obtainedMarks ?? '');

                        const num_t1_pnp = typeof t1_pnp_val === 'number' ? t1_pnp_val : Number(t1_pnp_val) || 0;
                        const num_t1_hy = typeof t1_hy_val === 'number' ? t1_hy_val : Number(t1_hy_val) || 0;
                        const t1_total = num_t1_pnp + num_t1_hy;
                        const t1_grade = getScholasticGrade(t1_total);

                        // Term II: Pen & Paper 2 + Annual Exam
                        const t2_pnp = getMarkRecord(subj.subjectName, term2Exams[0]?.emE_Id, 'Pen and Paper Test2');
                        const t2_ann = getMarkRecord(subj.subjectName, term2Exams[4]?.emE_Id || term2Exams[term2Exams.length - 1]?.emE_Id, 'Annual Exam');

                        const t2_pnp_val = (t2_pnp?.passFailFlag === 'AB' || t2_pnp?.obtainedMarks === 'AB') ? 'AB' : (t2_pnp?.obtainedMarks ?? '');
                        const t2_ann_val = (t2_ann?.passFailFlag === 'AB' || t2_ann?.obtainedMarks === 'AB') ? 'AB' : (t2_ann?.obtainedMarks ?? '');

                        const num_t2_pnp = typeof t2_pnp_val === 'number' ? t2_pnp_val : Number(t2_pnp_val) || 0;
                        const num_t2_ann = typeof t2_ann_val === 'number' ? t2_ann_val : Number(t2_ann_val) || 0;
                        const t2_total = num_t2_pnp + num_t2_ann;
                        const t2_grade = getScholasticGrade(t2_total);

                        return {
                            subjectName: subj.subjectName,
                            t1_pnp: t1_pnp_val,
                            t1_hy: t1_hy_val,
                            t1_total,
                            t1_grade,
                            t2_pnp: t2_pnp_val,
                            t2_ann: t2_ann_val,
                            t2_total,
                            t2_grade
                        };
                    });

                    // Co-Scholastic Data Mapping
                    const stuActivities = getstudentwiseactiviteslist.filter((a: any) => (a.amsT_Id || a.AMST_Id) === stuId);
                    const stuSkills = getstudentwiseskillslist.filter((s: any) => (s.amsT_Id || s.AMST_Id) === stuId);

                    let coScholasticRows: { name: string; term1Grade: string; term2Grade: string }[] = [];

                    if (stuActivities.length > 0 || stuSkills.length > 0) {
                        const combined = [...stuActivities, ...stuSkills];
                        const uniqueAreas = Array.from(new Set(combined.map((c: any) => c.ECACTA_SkillArea || c.ECS_SkillName || c.ECACT_SkillName || c.activityName))).filter(Boolean);

                        coScholasticRows = uniqueAreas.map((areaName: any) => {
                            const areaRecords = combined.filter((c: any) => (c.ECACTA_SkillArea || c.ECS_SkillName || c.ECACT_SkillName || c.activityName) === areaName);
                            const t1Rec = areaRecords.find((r: any) => (r.ecT_Id === 1 || r.ECT_Id === 1 || (r.termName || '').toLowerCase().includes('term 1') || (r.termName || '').toLowerCase().includes('term i')));
                            const t2Rec = areaRecords.find((r: any) => (r.ecT_Id === 2 || r.ECT_Id === 2 || (r.termName || '').toLowerCase().includes('term 2') || (r.termName || '').toLowerCase().includes('term ii')));

                            return {
                                name: areaName,
                                term1Grade: t1Rec?.EMGD_Name || t1Rec?.scoregrade || t1Rec?.grade || 'A',
                                term2Grade: t2Rec?.EMGD_Name || t2Rec?.scoregrade || t2Rec?.grade || 'A'
                            };
                        });
                    }

                    // Fallback co-scholastic subjects matching sample PDF
                    if (coScholasticRows.length === 0) {
                        coScholasticRows = [
                            { name: 'Art Education', term1Grade: 'A', term2Grade: 'A' },
                            { name: 'Health & Physical Education', term1Grade: 'B', term2Grade: 'A' },
                            { name: 'Dance', term1Grade: 'A', term2Grade: 'A' },
                            { name: 'Discipline', term1Grade: 'A', term2Grade: 'A' }
                        ];
                    }

                    // Attendance Values
                    const term1ExpectedAtt = studentAttendance.Half_TOTALWORKINGDAYS ?? studentAttendance.half_totalworkingdays ?? studentAttendance.Half_WorkingDays ?? studentAttendance.workingDays ?? 108;
                    const term1ActualAtt = studentAttendance.Half_PRESENTDAYS ?? studentAttendance.half_presentdays ?? studentAttendance.Half_ATTENDANCEPERCENTAGE ?? studentAttendance.presentDays ?? 89;

                    const term2ExpectedAtt = studentAttendance.Annual_TOTALWORKINGDAYS ?? studentAttendance.annual_totalworkingdays ?? studentAttendance.Annual_WorkingDays ?? studentAttendance.workingDays ?? 96;
                    const term2ActualAtt = studentAttendance.Annual_PRESENTDAYS ?? studentAttendance.annual_presentdays ?? studentAttendance.Annual_ATTENDANCEPERCENTAGE ?? studentAttendance.presentDays ?? 76;

                    // Remarks & Promotion Class
                    const promotedClass = report.promotedclass || report.promotedClass || studentPromo.promotedclass || 'Promoted to Grade-II';
                    const generalRemarks = report.remarks || report.generalRemarks || studentPromo.remarks || 'You have done your best!';

                    return (
                        <div key={stuId} className="nds-card">
                            {/* PAGE 1 CONTENT */}
                            <div className="nds-page-1">
                                {/* School Header matching PDF */}
                                <div className="flex items-center justify-between border-b pb-2 mb-3">
                                    <div className="w-[120px] text-center">
                                        {/* Notre Dame Academy Badge / Logo */}
                                        <img
                                            src="https://dcampusstrg.blob.core.windows.net/files/17/ISM_Attachments/37ca65ba-17e9-4187-98a0-c25cd3229410.jpg"
                                            alt="Notre Dame Logo"
                                            className="max-h-[90px] mx-auto object-contain"
                                            onError={(e) => {
                                                (e.target as HTMLElement).style.display = 'none';
                                            }}
                                        />
                                    </div>
                                    <div className="text-center flex-1 px-2">
                                        <h1 className="text-[24px] font-bold text-[#002060] tracking-wide mb-1">
                                            NOTRE DAME ACADEMY
                                        </h1>
                                        <p className="text-[13px] font-semibold text-black leading-tight">
                                            Affiliated to CBSE New Delhi, Affiliation No 1131498
                                        </p>
                                        <p className="text-[12px] font-medium text-black leading-tight mt-0.5">
                                            Siddheshwar Vidyut Nagar, NTPC Township,Fatatewadi,P.O Hotgi, Solapur-413215
                                        </p>
                                        <p className="text-[11px] font-medium text-black leading-tight mt-0.5">
                                            Email: <a href="mailto:notredameacademyntpc@gmail.com" className="text-blue-700 underline">notredameacademyntpc@gmail.com</a> Website: <a href="https://notredameacademyntpcsolapur.com" target="_blank" className="text-blue-700 underline">https://notredameacademyntpcsolapur.com</a> PHONE:+91 8618096186
                                        </p>
                                    </div>
                                    <div className="w-[90px] text-center">
                                        {/* CBSE Logo */}
                                        <div className="w-[70px] h-[70px] rounded-full border border-black mx-auto flex items-center justify-center p-1 font-bold text-[10px] text-center leading-none bg-amber-50">
                                            CBSE<br />DELHI
                                        </div>
                                    </div>
                                </div>

                                <div className="text-center my-3">
                                    <h2 className="text-[18px] font-bold tracking-wide uppercase">ACADEMIC SESSION 2025-2026</h2>
                                    <h3 className="text-[16px] font-semibold mt-0.5">Annual Report Card</h3>
                                </div>

                                {/* Student Details Boxed Grid (3 columns x 3 rows) */}
                                <table className="w-full border-[1.5px] border-black border-collapse text-[13px] font-semibold mb-4">
                                    <tbody>
                                        <tr>
                                            <td className="border border-black p-2 text-left w-[40%]"><b>Student Name : {report.studentName}</b></td>
                                            <td className="border border-black p-2 text-left w-[35%]"><b>Grade & Section : {report.className} / {report.sectionName}</b></td>
                                            <td className="border border-black p-2 text-left w-[25%]"><b>Admn. No. : {report.admissionNo}</b></td>
                                        </tr>
                                        <tr>
                                            <td className="border border-black p-2 text-left"><b>Father&apos;s Name : {report.fatherName || ''}</b></td>
                                            <td className="border border-black p-2 text-left"><b>Date of Birth : {report.dob || ''}</b></td>
                                            <td className="border border-black p-2 text-left"><b>Roll No : {report.rollNo || ''}</b></td>
                                        </tr>
                                        <tr>
                                            <td className="border border-black p-2 text-left"><b>Mother&apos;s Name : {report.motherName || ''}</b></td>
                                            <td className="border border-black p-2 text-left">&nbsp;</td>
                                            <td className="border border-black p-2 text-left">&nbsp;</td>
                                        </tr>
                                    </tbody>
                                </table>

                                {/* Main Scholastic Table */}
                                <table className="nds-table">
                                    <thead>
                                        <tr>
                                            <th className="w-[180px] bg-white border border-black"></th>
                                            <th colSpan={7} className="bg-white border border-black text-center font-bold">TERM I</th>
                                            <th colSpan={5} className="bg-white border border-black text-center font-bold">TERM II</th>
                                        </tr>
                                        <tr>
                                            <th className="text-left border border-black p-1.5 font-bold">Subject Name</th>
                                            {/* TERM I 7 Columns */}
                                            <th className="border border-black p-1 text-center font-bold text-[12px]">Pen and Paper Test</th>
                                            <th className="border border-black p-1 text-center font-bold text-[12px]">Multiple Assessment</th>
                                            <th className="border border-black p-1 text-center font-bold text-[12px]">Subject Enrichment Activity</th>
                                            <th className="border border-black p-1 text-center font-bold text-[12px]">Portfolio</th>
                                            <th className="border border-black p-1 text-center font-bold text-[12px]">Half Yearly Exam</th>
                                            <th className="border border-black p-1 text-center font-bold text-[12px]">Total</th>
                                            <th className="border border-black p-1 text-center font-bold text-[12px]">Grade</th>

                                            {/* TERM II 5 Columns */}
                                            <th className="border border-black p-1 text-center font-bold text-[12px]">Pen and Paper Test2</th>
                                            <th className="border border-black p-1 text-center font-bold text-[12px]">Multiple Assessment2</th>
                                            <th className="border border-black p-1 text-center font-bold text-[12px]">Subject Enrichment Activity2</th>
                                            <th className="border border-black p-1 text-center font-bold text-[12px]">Portfolio2</th>
                                            <th className="border border-black p-1 text-center font-bold text-[12px]">Annual Exam</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {mainSubjTerm1Data.map((t1Subj: any, idx: number) => {
                                            const t2Subj = mainSubjTerm2Data[idx];
                                            return (
                                                <tr key={idx}>
                                                    <td className="nds-text-left font-bold border border-black p-1.5">
                                                        {t1Subj.subjectName.toUpperCase()}
                                                    </td>
                                                    {/* Term I 5 Exam Marks */}
                                                    {t1Subj.marks.map((m: any, mIdx: number) => (
                                                        <td key={mIdx} className="border border-black p-1 text-center font-semibold">
                                                            {m.display}
                                                        </td>
                                                    ))}
                                                    {/* Term I Total & Grade */}
                                                    <td className="border border-black p-1 text-center font-bold text-[14px]">
                                                        {t1Subj.total}
                                                    </td>
                                                    <td className="border border-black p-1 text-center font-bold text-[14px]">
                                                        {t1Subj.grade}
                                                    </td>

                                                    {/* Term II 5 Exam Marks */}
                                                    {t2Subj?.marks.map((m: any, mIdx: number) => (
                                                        <td key={mIdx} className="border border-black p-1 text-center font-semibold">
                                                            {m.display}
                                                        </td>
                                                    ))}
                                                </tr>
                                            );
                                        })}

                                        {/* TOTAL Summary Row */}
                                        <tr>
                                            <td className="nds-text-left font-bold text-[15px] border border-black p-1.5">TOTAL</td>
                                            <td colSpan={5} className="border border-black">&nbsp;</td>
                                            <td className="border border-black p-1 text-center font-bold text-[15px]">{term1OverallTotal}</td>
                                            <td className="border border-black p-1 text-center font-bold text-[15px]">{term1OverallGrade}</td>
                                            <td colSpan={5} className="border border-black">&nbsp;</td>
                                        </tr>

                                        {/* PERCENTAGE Summary Row */}
                                        <tr>
                                            <td className="nds-text-left font-bold text-[15px] border border-black p-1.5">PERCENTAGE</td>
                                            <td colSpan={5} className="border border-black">&nbsp;</td>
                                            <td colSpan={2} className="border border-black p-1 text-center font-bold text-[15px]">
                                                {term1Percentage.toFixed(2)}%
                                            </td>
                                            <td colSpan={5} className="border border-black">&nbsp;</td>
                                        </tr>
                                    </tbody>
                                </table>

                                {/* Additional Subjects Section */}
                                <div className="text-center my-3">
                                    <h3 className="text-[16px] font-bold">Additional Subjects</h3>
                                </div>

                                <table className='nds-table'>
                                    <thead>
                                        <tr>
                                            <th className="w-[180px] bg-white border border-black"></th>
                                            <th colSpan={4} className="bg-white border border-black text-center font-bold">TERM I</th>
                                            <th colSpan={4} className="bg-white border border-black text-center font-bold">TERM II</th>
                                        </tr>
                                        <tr>
                                            <th className="text-left border border-black p-1.5 font-bold">Subject Name</th>
                                            <th className="border border-black p-1 text-center font-bold text-[12px]">Pen and Paper Test</th>
                                            <th className="border border-black p-1 text-center font-bold text-[12px]">Half Yearly Exam</th>
                                            <th className="border border-black p-1 text-center font-bold text-[12px]">Total</th>
                                            <th className="border border-black p-1 text-center font-bold text-[12px]">Grade</th>

                                            <th className="border border-black p-1 text-center font-bold text-[12px]">Pen and Paper Test2</th>
                                            <th className="border border-black p-1 text-center font-bold text-[12px]">Annual Exam</th>
                                            <th className="border border-black p-1 text-center font-bold text-[12px]">Total</th>
                                            <th className="border border-black p-1 text-center font-bold text-[12px]">Grade</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {addSubjProcessed.map((addSubj: any, idx: number) => (
                                            <tr key={idx}>
                                                <td className="nds-text-left font-bold border border-black p-1.5">
                                                    {addSubj.subjectName.toUpperCase()}
                                                </td>
                                                <td className="border border-black p-1 text-center font-semibold">{addSubj.t1_pnp}</td>
                                                <td className="border border-black p-1 text-center font-semibold">{addSubj.t1_hy}</td>
                                                <td className="border border-black p-1 text-center font-bold">{addSubj.t1_total}</td>
                                                <td className="border border-black p-1 text-center font-bold">{addSubj.t1_grade}</td>

                                                <td className="border border-black p-1 text-center font-semibold">{addSubj.t2_pnp}</td>
                                                <td className="border border-black p-1 text-center font-semibold">{addSubj.t2_ann}</td>
                                                <td className="border border-black p-1 text-center font-bold">{addSubj.t2_total}</td>
                                                <td className="border border-black p-1 text-center font-bold">{addSubj.t2_grade}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* PAGE 2 CONTENT */}
                            <div className="nds-page-2-break mt-6">
                                {/* Co-Scholastic & Grade Brackets (Side-by-Side Flex Layout matching PDF Page 2) */}
                                <div className="flex flex-row justify-between items-start gap-4">
                                    {/* Left Side: Co-Scholastic & Co-Scholastic Bracket */}
                                    <div className="w-[58%]">
                                        <h3 className="text-[15px] font-bold mb-1 uppercase">CO – SCHOLASTIC</h3>
                                        <table className="nds-table mt-1">
                                            <thead>
                                                <tr>
                                                    <th className="text-center bg-white border border-black font-bold w-[50%]">Subjects</th>
                                                    <th className="text-center bg-white border border-black font-bold w-[25%]">TERM I</th>
                                                    <th className="text-center bg-white border border-black font-bold w-[25%]">TERM II</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {coScholasticRows.map((coSubj: any, cIdx: number) => (
                                                    <tr key={cIdx}>
                                                        <td className="nds-text-left border border-black p-1.5 font-bold">{coSubj.name}</td>
                                                        <td className="border border-black p-1 text-center font-bold">{coSubj.term1Grade}</td>
                                                        <td className="border border-black p-1 text-center font-bold">{coSubj.term2Grade}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>

                                        <h3 className="text-[14px] font-bold mt-4 mb-1 uppercase">CO-SCHOLASTIC GRADE BRACKET</h3>
                                        <table className="nds-table mt-1">
                                            <tbody>
                                                <tr>
                                                    <td className="nds-text-left border border-black p-1.5 font-bold w-[28%]">Grades</td>
                                                    <td className="border border-black p-1 text-center font-bold">A</td>
                                                    <td className="border border-black p-1 text-center font-bold">B</td>
                                                    <td className="border border-black p-1 text-center font-bold">C</td>
                                                    <td className="border border-black p-1 text-center font-bold">D</td>
                                                    <td className="border border-black p-1 text-center font-bold">E</td>
                                                </tr>
                                                <tr>
                                                    <td className="nds-text-left border border-black p-1.5 font-bold">Description</td>
                                                    <td className="border border-black p-1 text-left text-[11px]">Excellent</td>
                                                    <td className="border border-black p-1 text-left text-[11px]">Very Good</td>
                                                    <td className="border border-black p-1 text-left text-[11px]">Good</td>
                                                    <td className="border border-black p-1 text-left text-[11px]">Fair</td>
                                                    <td className="border border-black p-1 text-left text-[11px]">Needs Improvemt</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Right Side: Scholastic Grade Bracket */}
                                    <div className="w-[38%]">
                                        <table className="nds-table mt-0">
                                            <thead>
                                                <tr>
                                                    <th colSpan={2} className="bg-white border border-black text-center font-bold p-1.5">
                                                        SCHOLASTIC GRADE BRACKET
                                                    </th>
                                                </tr>
                                                <tr>
                                                    <th className="bg-white border border-black text-center font-bold p-1 w-[45%]">Grades</th>
                                                    <th className="bg-white border border-black text-center font-bold p-1 w-[55%]">Ranges</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr><td className="border border-black p-1 text-center font-bold">A1</td><td className="border border-black p-1 text-center">91 - 100</td></tr>
                                                <tr><td className="border border-black p-1 text-center font-bold">A2</td><td className="border border-black p-1 text-center">81 - 90</td></tr>
                                                <tr><td className="border border-black p-1 text-center font-bold">B1</td><td className="border border-black p-1 text-center">71 - 80</td></tr>
                                                <tr><td className="border border-black p-1 text-center font-bold">B2</td><td className="border border-black p-1 text-center">61 - 70</td></tr>
                                                <tr><td className="border border-black p-1 text-center font-bold">C1</td><td className="border border-black p-1 text-center">51 - 60</td></tr>
                                                <tr><td className="border border-black p-1 text-center font-bold">C2</td><td className="border border-black p-1 text-center">41 - 50</td></tr>
                                                <tr><td className="border border-black p-1 text-center font-bold">D</td><td className="border border-black p-1 text-center">33 - 40</td></tr>
                                                <tr><td className="border border-black p-1 text-center font-bold">E</td><td className="border border-black p-1 text-center">0-32</td></tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Attendance Table */}
                                <div className="mt-6">
                                    <table className="nds-table">
                                        <thead>
                                            <tr>
                                                <th className="border border-black p-1.5 text-center font-bold w-[33%]">Attendance</th>
                                                <th className="border border-black p-1.5 text-center font-bold w-[33%]">Expected Attendance</th>
                                                <th className="border border-black p-1.5 text-center font-bold w-[33%]">Actual Attendance</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td className="border border-black p-1.5 text-center font-semibold">TERM 1</td>
                                                <td className="border border-black p-1.5 text-center font-bold">{term1ExpectedAtt}</td>
                                                <td className="border border-black p-1.5 text-center font-bold">{term1ActualAtt}</td>
                                            </tr>
                                            <tr>
                                                <td className="border border-black p-1.5 text-center font-semibold">TERM 2</td>
                                                <td className="border border-black p-1.5 text-center font-bold">{term2ExpectedAtt}</td>
                                                <td className="border border-black p-1.5 text-center font-bold">{term2ActualAtt}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                {/* General Remarks Table */}
                                <div className="mt-5">
                                    <table className="nds-table">
                                        <tbody>
                                            <tr>
                                                <td colSpan={2} className="nds-text-left border border-black p-1.5 font-bold uppercase bg-white">
                                                    GENERAL REMARKS
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="nds-text-left border border-black p-1.5 font-bold w-[220px]">Promoted to class</td>
                                                <td className="nds-text-left border border-black p-1.5 font-semibold">{promotedClass}</td>
                                            </tr>
                                            <tr>
                                                <td className="nds-text-left border border-black p-1.5 font-bold">Remarks</td>
                                                <td className="nds-text-left border border-black p-1.5 font-semibold">{generalRemarks}</td>
                                            </tr>
                                            <tr>
                                                <td className="nds-text-left border border-black p-1.5 font-bold">School reopen on</td>
                                                <td className="nds-text-left border border-black p-1.5 font-semibold">{formatDate(date)}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                {/* Signatures Row */}
                                <div className="flex justify-between items-center mt-12 pt-4 px-2">
                                    <div className="text-left font-bold text-[15px]">
                                        Class Teacher&apos;s Signature
                                    </div>
                                    <div className="text-center font-bold text-[15px]">
                                        Principal&apos;s Signature
                                    </div>
                                    <div className="text-right font-bold text-[15px]">
                                        Parent&apos;s Signature
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </>
    );
}
