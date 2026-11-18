'use client';

import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import { useEffect, useState } from 'react';

interface BBIIReportViewProps {
    reportData: any[];
    gradeRemarks: any[];
    attendanceWork: any[];
    attendancePresent: any[];
    examName: string;
    academicYear: string;
    classTeacher: string;
    showRemarks: boolean;
    showRank?: boolean;
    showRankInSection?: boolean;
    selectedClass?: string;
    selectedSection?: string;
}

export default function BBIIReportView({
    reportData,
    gradeRemarks,
    attendanceWork,
    attendancePresent,
    examName,
    academicYear,
    classTeacher,
    showRemarks,
    showRank,
    showRankInSection,
    selectedClass,
    selectedSection
}: BBIIReportViewProps) {
    const [isMounted, setIsMounted] = useState(false);
    const displayRank = showRankInSection ?? showRank ?? false;

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const handlePrint = () => {
        window.print();
    };

    const formatDate = (dateStr: any) => {
        if (!dateStr) return '';
        try {
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) return '';
            // If not mounted, return empty string to prevent hydration mismatch
            if (!isMounted) return '';
            return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-');
        } catch {
            return '';
        }
    };

    const getSubjectRemark = (sub: any) => {
        if (!showRemarks) return '';
        if (sub.emgD_Remarks) return sub.emgD_Remarks;
        if (!gradeRemarks || !Array.isArray(gradeRemarks) || gradeRemarks.length === 0) return '';
        const remarkObj = gradeRemarks.find(
            (r) =>
                Number(r.emgR_Id || r.EMGR_Id) === Number(sub.emgR_Id) &&
                String(r.emgD_Name || r.EMGD_Name) === String(sub.estmpS_ObtainedGrade)
        );
        return remarkObj ? remarkObj.emgD_Remarks || remarkObj.EMGD_Remarks : '';
    };

    const getAttendance = (list: any[], studentId: any) => {
        if (!list || !Array.isArray(list)) return {};
        const id = Number(studentId);
        return (
            list.find(
                (a) => Number(a.studentId || a.amsT_ID || a.amsT_Id || a.AMST_Id || a.AMST_ID || a.StudentId || a.student_id || 0) === id
            ) || {}
        );
    };

    const getMonthValue = (at: any, month: string) => {
        if (!at) return '';
        const m = month.toLowerCase();

        let keys: string[] = [];
        if (m === 'jun') keys = ['June', 'june', 'JUN', 'jun'];
        else if (m === 'jul') keys = ['July', 'july', 'JUL', 'jul'];
        else if (m === 'aug') keys = ['August', 'august', 'AUG', 'aug'];
        else if (m === 'sep') keys = ['September', 'september', 'SEP', 'sep'];
        else if (m === 'oct') keys = ['October', 'october', 'OCT', 'oct'];
        else if (m === 'nov') keys = ['November', 'november', 'NOV', 'nov'];
        else if (m === 'dec') keys = ['December', 'december', 'DEC', 'dec'];
        else if (m === 'jan') keys = ['January', 'january', 'JAN', 'jan'];
        else if (m === 'feb') keys = ['Febrauary', 'febrauary', 'February', 'february', 'FEB', 'feb'];
        else if (m === 'mar') keys = ['March', 'march', 'MAR', 'mar'];
        else if (m === 'apr') keys = ['April', 'april', 'APR', 'apr'];
        else if (m === 'may') keys = ['May', 'may', 'MAY', 'may'];

        for (const key of keys) {
            if (at[key] !== undefined && at[key] !== null) {
                return at[key] !== 0 && at[key] !== '0' ? at[key] : '';
            }
        }
        return '';
    };

    const getAttendanceTotal = (at: any, student: any, type: 'work' | 'present') => {
        if (type === 'work') {
            const keys = ['TotalSchoolDays', 'totalSchoolDays', 'TotalWorkingDays', 'totalWorkingDays', 'Total', 'total'];
            for (const key of keys) {
                if (at && at[key] !== undefined && at[key] !== null && at[key] !== 0 && at[key] !== '0') {
                    return at[key];
                }
            }
            return student.classheld || '';
        } else {
            const keys = ['TotalPresentDays', 'totalPresentDays', 'Total', 'total'];
            for (const key of keys) {
                if (at && at[key] !== undefined && at[key] !== null && at[key] !== 0 && at[key] !== '0') {
                    return at[key];
                }
            }
            return student.classatt || '';
        }
    };

    const getAttendancePercentage = (at: any, student: any, type: 'work' | 'present') => {
        const keys = ['Total_Percentage', 'total_Percentage', 'Percentage', 'percentage'];
        for (const key of keys) {
            if (at && at[key] !== undefined && at[key] !== null && at[key] !== 0 && at[key] !== '0') {
                const val = Number(at[key]);
                return isNaN(val) ? at[key] : val.toFixed(2);
            }
        }
        if (type === 'work') {
            return student.classheld ? '100.00' : '';
        } else {
            if (student.classheld && student.classatt) {
                return ((Number(student.classatt) / Number(student.classheld)) * 100).toFixed(2);
            }
            return '';
        }
    };

    return (
        <div className='space-y-6'>
            <style
                dangerouslySetInnerHTML={{
                    __html: `
                @media print {
                    body * {
                        visibility: hidden !important;
                    }
                    #bb-ii-report-print-area,
                    #bb-ii-report-print-area * {
                        visibility: visible !important;
                    }
                    #bb-ii-report-print-area {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                    }
                    .no-print {
                        display: none !important;
                    }
                    @page {
                        size: A4 portrait;
                        margin: 10mm;
                    }
                    .report-card {
                        border: none !important;
                        padding: 0 !important;
                    }
                }

                .bb-report-container {
                    font-family: 'Source Sans Pro', sans-serif;
                    color: black;
                }

                .report-card {
                    background-color: white;
                    margin-bottom: 50px;
                }

                .table-bordered {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 20px;
                }

                .table-bordered th, .table-bordered td {
                    border: 1px solid black;
                    padding: 4px;
                    text-align: center;
                    font-size: 12px;
                }

                .text-left { text-align: left !important; }
                .text-center { text-align: center !important; }
                .font-bold { font-weight: bold; }
                .uppercase { text-transform: uppercase; }
                .margin-top-20 { margin-top: 20px; }
                .margin-top-40 { margin-top: 40px; }
                .margin-top-50 { margin-top: 50px; }
                .margin-bottom-10 { margin-bottom: 10px; }
                .border-bottom { border-bottom: 1px solid black; }
                .border-top { border-top: 1px solid black; display: inline-block; padding-top: 5px; }
                
                .sect1 .form-group {
                    display: flex;
                    margin-bottom: 5px;
                }
                .sect1 label {
                    font-size: 13px;
                }
            `
                }}
            />

            <div className='no-print flex justify-end'>
                <Button onClick={handlePrint} className='flex items-center gap-2'>
                    <Printer className='h-4 w-4' />
                    Print All Reports
                </Button>
            </div>

            <div id='bb-ii-report-print-area' className='bb-report-container'>
                {(reportData || []).map((report, index) => (
                    <div
                        key={report.student_id || index}
                        className='margin-top-50 report-card'
                        style={{ pageBreakBefore: index > 0 ? 'always' : 'auto' }}>
                        {/* Header */}
                        <div className='margin-bottom-10 text-center'>
                            <h4 className='font-bold'>
                                PROGRESS REPORT
                                <br />
                                ACADEMIC YEAR {academicYear || ''}
                                <br />
                                {examName || ''}
                            </h4>
                        </div>

                        {/* Student Info */}
                        <section className='content'>
                            <div className='sect1'>
                                <div className='margin-bottom-10 grid grid-cols-12 gap-4'>
                                    <div className='col-span-5'>
                                        <div className='form-group'>
                                            <label className='w-1/3'>
                                                <b>NAME</b>
                                            </label>
                                            <label className='flex-1'>
                                                : <b>{report.amsT_FirstName || ''}</b>
                                            </label>
                                        </div>
                                        <div className='form-group'>
                                            <label className='w-1/3 text-[11px]'>
                                                <b>CLASS TEACHER</b>
                                            </label>
                                            <label className='flex-1'>
                                                : <b>{(classTeacher || '').toUpperCase()}</b>
                                            </label>
                                        </div>
                                    </div>
                                    <div className='col-span-3'>
                                        <div className='form-group'>
                                            <label className='w-1/3'>
                                                <b>CLASS</b>
                                            </label>
                                            <label className='flex-1'>
                                                : <b>{selectedClass || report.asmcL_ClassName || ''}</b>
                                            </label>
                                        </div>
                                        <div className='form-group'>
                                            <label className='w-1/3'>
                                                <b>SECTION</b>
                                            </label>
                                            <label className='flex-1'>
                                                : <b>{selectedSection || report.asmC_SectionName || ''}</b>
                                            </label>
                                        </div>
                                    </div>
                                    <div className='col-span-4'>
                                        <div className='form-group'>
                                            <label className='w-1/3'>
                                                <b>ADM. NO</b>
                                            </label>
                                            <label className='flex-1'>
                                                : <b>{report.amsT_AdmNo || ''}</b>
                                            </label>
                                        </div>
                                        <div className='form-group'>
                                            <label className='w-1/3'>
                                                <b>D.O.B</b>
                                            </label>
                                            <label className='flex-1'>
                                                : <b suppressHydrationWarning>{formatDate(report.amsT_DOB)}</b>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Marks Table */}
                            <div className=''>
                                <table className='table-bordered text-center'>
                                    <thead>
                                        <tr>
                                            <th className='text-center' rowSpan={2}>
                                                <b>SUBJECTS</b>
                                            </th>
                                            <th className='text-center' rowSpan={2} style={{ width: '60px' }}>
                                                <b>MAX MARKS</b>
                                            </th>
                                            <th className='text-center' rowSpan={2} style={{ width: '60px' }}>
                                                <b>MIN MARKS</b>
                                            </th>
                                            <th className='text-center' colSpan={3}>
                                                <b>OBTAINED</b>
                                            </th>
                                            <th className='text-center' rowSpan={2}>
                                                <b>REMARKS</b>
                                            </th>
                                        </tr>
                                        <tr>
                                            <th className='text-center' style={{ width: '40px' }}>
                                                <b>MARKS</b>
                                            </th>
                                            <th className='text-center' style={{ width: '80px' }}>
                                                <b>PERCENTAGE</b>
                                            </th>
                                            <th className='text-center' style={{ width: '40px' }}>
                                                <b>GRADE</b>
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {/* Result Subjects */}
                                        {(report.sub_list || [])
                                            .filter(
                                                (s: any) =>
                                                    s.eyceS_AplResultFlg === true ||
                                                    s.eyceS_AplResultFlg === 'true' ||
                                                    s.eyceS_AplResultFlg === 1
                                            )
                                            .map((subj: any) => (
                                                <tr key={subj.ismS_Id}>
                                                    <td className='text-left'>
                                                        <b>{subj.ismS_SubjectName}</b>
                                                    </td>
                                                    <td>{subj.eyceS_MarksEntryMax || subj.eyceS_MaxMarks || ''}</td>
                                                    <td>{subj.eyceS_MinMarks || ''}</td>
                                                    <td>
                                                        {subj.estmpS_PassFailFlg !== 'AB'
                                                            ? subj.estM_Marks || subj.estmpS_ObtainedMarks || ''
                                                            : subj.estmpS_PassFailFlg}
                                                    </td>
                                                    <td>{subj.estmpS_Percentage || ''}</td>
                                                    <td>
                                                        {subj.estmpS_PassFailFlg !== 'AB'
                                                            ? subj.estmpS_ObtainedGrade || ''
                                                            : subj.estmpS_PassFailFlg}
                                                    </td>
                                                    <td>{subj.estmpS_PassFailFlg !== 'AB' ? getSubjectRemark(subj) : ''}</td>
                                                </tr>
                                            ))}

                                        {/* Total Row */}
                                        <tr>
                                            <td className='text-left'>
                                                <b>GRAND TOTAL / PERCENTAGE</b>
                                            </td>
                                            <td>
                                                <b>{report.totaleyceS_MarksEntryMax || report.estmP_TotalMaxMarks || ''}</b>
                                            </td>
                                            <td>
                                                <b>{report.stu_grandmin_marks || ''}</b>
                                            </td>
                                            <td>
                                                <b>{report.totalestM_Marks || report.estmP_TotalObtMarks || ''}</b>
                                            </td>
                                            <td>
                                                <b>{report.estmP_Percentage || ''}</b>
                                            </td>
                                            <td></td>
                                            <td></td>
                                        </tr>

                                        {/* Rank Row */}
                                        {displayRank && (
                                            <tr>
                                                <td className='text-left'>
                                                    <b>RANK IN SECTION</b>
                                                </td>
                                                <td colSpan={4}>
                                                    {report.estmP_SectionRank && report.estmP_SectionRank !== '0'
                                                        ? report.estmP_SectionRank
                                                        : ''}
                                                </td>
                                                <td></td>
                                                <td></td>
                                            </tr>
                                        )}

                                        {/* Non-Result Subjects */}
                                        {(report.sub_list || [])
                                            .filter(
                                                (s: any) =>
                                                    s.eyceS_AplResultFlg === false ||
                                                    s.eyceS_AplResultFlg === 'false' ||
                                                    s.eyceS_AplResultFlg === 0
                                            )
                                            .map((subj: any) => (
                                                <tr key={subj.ismS_Id}>
                                                    <td className='text-left'>
                                                        <b>{subj.ismS_SubjectName}</b>
                                                    </td>
                                                    <td></td>
                                                    <td></td>
                                                    <td>{subj.estmpS_PassFailFlg !== 'AB' ? '' : subj.estmpS_PassFailFlg}</td>
                                                    <td></td>
                                                    <td>
                                                        {subj.estmpS_PassFailFlg !== 'AB'
                                                            ? subj.estmpS_ObtainedGrade || ''
                                                            : subj.estmpS_PassFailFlg}
                                                    </td>
                                                    <td>{subj.estmpS_PassFailFlg !== 'AB' ? getSubjectRemark(subj) : ''}</td>
                                                </tr>
                                            ))}
                                    </tbody>
                                </table>

                                {/* Attendance Table */}
                                <table className='table-bordered text-center'>
                                    <thead>
                                        <tr>
                                            <th className='text-center' colSpan={16}>
                                                <b>ATTENDANCE</b>
                                            </th>
                                        </tr>
                                        <tr>
                                            <th className='text-center' colSpan={2}>
                                                <b>MONTH</b>
                                            </th>
                                            <th className='text-center' style={{ width: '50px' }}>
                                                <b>JUN</b>
                                            </th>
                                            <th className='text-center' style={{ width: '50px' }}>
                                                <b>JUL</b>
                                            </th>
                                            <th className='text-center' style={{ width: '50px' }}>
                                                <b>AUG</b>
                                            </th>
                                            <th className='text-center' style={{ width: '50px' }}>
                                                <b>SEP</b>
                                            </th>
                                            <th className='text-center' style={{ width: '50px' }}>
                                                <b>OCT</b>
                                            </th>
                                            <th className='text-center' style={{ width: '50px' }}>
                                                <b>NOV</b>
                                            </th>
                                            <th className='text-center' style={{ width: '50px' }}>
                                                <b>DEC</b>
                                            </th>
                                            <th className='text-center' style={{ width: '50px' }}>
                                                <b>JAN</b>
                                            </th>
                                            <th className='text-center' style={{ width: '50px' }}>
                                                <b>FEB</b>
                                            </th>
                                            <th className='text-center' style={{ width: '50px' }}>
                                                <b>MAR</b>
                                            </th>
                                            <th className='text-center' style={{ width: '50px' }}>
                                                <b>APR</b>
                                            </th>
                                            <th className='text-center' style={{ width: '50px' }}>
                                                <b>MAY</b>
                                            </th>
                                            <th className='text-center' style={{ width: '20px' }}>
                                                <b>TOTAL</b>
                                            </th>
                                            <th className='text-center' style={{ width: '20px' }}>
                                                <b>TOTAL%</b>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {/* Working Days */}
                                        <tr>
                                            <td className='text-left' colSpan={2}>
                                                <b>No of Working Days</b>
                                            </td>
                                            {(() => {
                                                const at = getAttendance(attendanceWork, report.student_id);
                                                return (
                                                    <>
                                                        <td>{getMonthValue(at, 'jun')}</td>
                                                        <td>{getMonthValue(at, 'jul')}</td>
                                                        <td>{getMonthValue(at, 'aug')}</td>
                                                        <td>{getMonthValue(at, 'sep')}</td>
                                                        <td>{getMonthValue(at, 'oct')}</td>
                                                        <td>{getMonthValue(at, 'nov')}</td>
                                                        <td>{getMonthValue(at, 'dec')}</td>
                                                        <td>{getMonthValue(at, 'jan')}</td>
                                                        <td>{getMonthValue(at, 'feb')}</td>
                                                        <td>{getMonthValue(at, 'mar')}</td>
                                                        <td>{getMonthValue(at, 'apr')}</td>
                                                        <td>{getMonthValue(at, 'may')}</td>
                                                        <td>
                                                            <b>{getAttendanceTotal(at, report, 'work')}</b>
                                                        </td>
                                                        <td>
                                                            <b>
                                                                {getAttendancePercentage(at, report, 'work')
                                                                    ? getAttendancePercentage(at, report, 'work') + '%'
                                                                    : ''}
                                                            </b>
                                                        </td>
                                                    </>
                                                );
                                            })()}
                                        </tr>
                                        {/* Present Days */}
                                        <tr>
                                            <td className='text-left' colSpan={2}>
                                                <b>DAYS PRESENT</b>
                                            </td>
                                            {(() => {
                                                const at = getAttendance(attendancePresent, report.student_id);
                                                return (
                                                    <>
                                                        <td>{getMonthValue(at, 'jun')}</td>
                                                        <td>{getMonthValue(at, 'jul')}</td>
                                                        <td>{getMonthValue(at, 'aug')}</td>
                                                        <td>{getMonthValue(at, 'sep')}</td>
                                                        <td>{getMonthValue(at, 'oct')}</td>
                                                        <td>{getMonthValue(at, 'nov')}</td>
                                                        <td>{getMonthValue(at, 'dec')}</td>
                                                        <td>{getMonthValue(at, 'jan')}</td>
                                                        <td>{getMonthValue(at, 'feb')}</td>
                                                        <td>{getMonthValue(at, 'mar')}</td>
                                                        <td>{getMonthValue(at, 'apr')}</td>
                                                        <td>{getMonthValue(at, 'may')}</td>
                                                        <td>
                                                            <b>{getAttendanceTotal(at, report, 'present')}</b>
                                                        </td>
                                                        <td>
                                                            <b>
                                                                {getAttendancePercentage(at, report, 'present')
                                                                    ? getAttendancePercentage(at, report, 'present') + '%'
                                                                    : ''}
                                                            </b>
                                                        </td>
                                                    </>
                                                );
                                            })()}
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            {/* Remarks */}
                            <table className='margin-top-20 table' style={{ fontSize: '14px', width: '100%' }}>
                                <tbody>
                                    <tr>
                                        <td style={{ width: '20%' }}>
                                            <b>Class Teacher's Remarks : </b>
                                        </td>
                                        <td className='border-bottom text-center'>
                                            {showRemarks && <b>{report.estmP_TotalGradeRemark || 'Good'}</b>}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>

                            {/* Signatures */}
                            <table className='margin-top-40 table' style={{ fontSize: '14px', width: '100%' }}>
                                <tbody>
                                    <tr>
                                        <td>
                                            <span className='border-top'>
                                                <b>Parent's Signature</b>
                                            </span>
                                        </td>
                                        <td className='text-center'>
                                            <span className='border-top'>
                                                <b>Class Teacher's Signature</b>
                                            </span>
                                        </td>
                                        <td className='text-right'>
                                            <span className='border-top'>
                                                <b>Principal's Signature</b>
                                            </span>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </section>
                    </div>
                ))}
            </div>
        </div>
    );
}
