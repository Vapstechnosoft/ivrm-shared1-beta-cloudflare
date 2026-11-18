'use client';

import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Printer } from 'lucide-react';
import { useRef } from 'react';

interface ReportListProps {
    data: any;
    params: any;
}

export const ReportList = ({ data, params }: ReportListProps) => {
    const reportRef = useRef<HTMLDivElement>(null);
    const students = data?.student_list || [];
    const groupwiseexamlist = data?.groupwiseexamlist || [];
    const getgroupdetails = data?.getgroupdetails || [];
    const stud_work_attendence = data?.stud_work_attendence || [];
    const stud_present_attendence = data?.stud_present_attendence || [];
    console.log('students: ', students);
    console.log('student work: ', stud_work_attendence);
    console.log('student present: ', stud_present_attendence);
    const handlePrint = () => {
        window.print();
    };

    if (students.length === 0) {
        return (
            <div className='rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-center text-yellow-700 shadow-sm'>
                No student data found for the selected criteria.
            </div>
        );
    }

    const formatDate = (dateStr: any): string => {
        if (!dateStr || String(dateStr).trim() === '0') return '';
        try {
            const dateObj = new Date(dateStr);
            if (!isNaN(dateObj.getTime())) {
                return format(dateObj, 'dd-MMM-yyyy').toUpperCase();
            }
            // Fallback for DD/MM/YYYY format
            const parts = String(dateStr).split('/');
            if (parts.length === 3) {
                const day = Number(parts[0]);
                const month = Number(parts[1]);
                const year = Number(parts[2]);
                const altDate = new Date(`${month}/${day}/${year}`);
                if (!isNaN(altDate.getTime())) {
                    return format(altDate, 'dd-MMM-yyyy').toUpperCase();
                }
            }
        } catch (e) {
            console.error('Error parsing date:', dateStr, e);
        }
        return String(dateStr);
    };

    const getStudentId = (obj: any): number => {
        if (!obj) return 0;
        return Number(obj.amsT_Id ?? obj.studentId ?? 0);
    };

    const getAttendanceObj = (studentId: number, list: any[]) => {
        return list?.find((a: any) => a && Number(getStudentId(a)) === Number(studentId)) || {};
    };

    const getAttValue = (attObj: any, keys: string[]) => {
        if (!attObj) return '';
        for (const k of keys) {
            if (attObj[k] !== undefined && attObj[k] !== null && String(attObj[k]).trim() !== '') {
                return attObj[k];
            }
        }
        return '';
    };

    const getAttMonth = (attObj: any, month: string) => {
        const lower = month.toLowerCase();
        const upper = month.toUpperCase();
        const capitalized = month.charAt(0).toUpperCase() + month.slice(1).toLowerCase();

        const variations = [month, lower, upper, capitalized];
        if (lower === 'febrauary' || lower === 'february') {
            variations.push('Febrauary', 'febrauary', 'February', 'february', 'FEBRAUARY', 'FEBRUARY');
        }

        return getAttValue(attObj, variations);
    };

    const renderAttendanceMonth = (attObj: any, monthName: string) => {
        const val = getAttMonth(attObj, monthName);
        const num = Number(val || 0);
        return num === 0 ? '' : num;
    };

    const getAttTotalDays = (attObj: any, isWorkingDays: boolean) => {
        const workingDaysKeys = [
            'TotalSchoolDays',
            'totalSchoolDays',
            'TotalWorkingDays',
            'totalWorkingDays',
            'Total_School_Days',
            'Total_Working_Days',
            'classheld',
            'asA_ClassHeld'
        ];
        const presentDaysKeys = ['TotalPresentDays', 'totalPresentDays', 'Total_Present_Days', 'classatt', 'asA_Class_Attended'];
        const keys = isWorkingDays ? workingDaysKeys : presentDaysKeys;
        const val = getAttValue(attObj, keys);
        const num = Number(val || 0);
        return num === 0 ? '' : num;
    };

    const getAttPercentage = (attObj: any) => {
        const keys = [
            'Total_Percentage',
            'total_Percentage',
            'total_percentage',
            'AttendancePercentage',
            'attendancepercentage',
            'ATTENDANCEPERCENTAGE'
        ];
        const val = getAttValue(attObj, keys);
        if (val === '' || val === undefined || val === null) return '';
        return `${val}%`;
    };

    const getMark = (report: any, subjectId: number, examId: number, examDisplayName: string) => {
        const marks = report.studentmarks || [];
        return marks.find((m: any) => {
            const mSubId = m.ismS_Id ?? m.ISMS_Id;
            const mExamId = m.emE_Id ?? m.EME_Id ?? m.emE_ID ?? m.EME_ID;
            const mGroupName = m.empsG_DisplayName ?? m.EMPSG_DisplayName ?? m.empsG_GroupName ?? m.EMPSG_GroupName ?? '';
            return (
                Number(mSubId) === Number(subjectId) &&
                Number(mExamId) === Number(examId) &&
                String(mGroupName).trim().toLowerCase() ===
                    String(examDisplayName || '')
                        .trim()
                        .toLowerCase()
            );
        });
    };

    const getSummaryMark = (examId: number, examDisplayName: string, student_marks: any[]) => {
        return student_marks?.find((m: any) => {
            const mExamId = m.emE_ID ?? m.EME_Id ?? m.EME_ID ?? m.emE_Id;
            const mGroupName = m.empsG_DisplayNAme ?? m.EMPSG_DisplayName ?? m.empsG_GroupNAme ?? m.EMPSG_GroupName ?? '';
            return (
                Number(mExamId) === Number(examId) &&
                String(mGroupName).trim().toLowerCase() ===
                    String(examDisplayName || '')
                        .trim()
                        .toLowerCase()
            );
        });
    };

    const renderSubjectExamMark = (m: any, grpexam: any) => {
        if (!m) return '';
        const passFailFlag = m.passFailFlag ?? m.PassFailFlag ?? '';
        const obtainedMarks = m.obtainedMarks ?? m.ObtainedMarks ?? 0;
        const obtainedGrade = m.obtainedGrade ?? m.ObtainedGrade ?? '';
        const isAbsent = ['AB', 'M', 'L'].includes(passFailFlag);
        const isGradeExam =
            String(grpexam.examnamedisplay || grpexam.EME_ExamName || grpexam.EME_ExamCode || '')
                .trim()
                .toLowerCase() === 'grade';

        if (isAbsent) {
            if (Number(obtainedMarks) > 0 && !isGradeExam) {
                const showMarks =
                    String(m.eyceS_MArksDisplayFlG ?? m.eyceS_MarksDisplayFlg ?? '') === '1' || m.eyceS_MArksDisplayFlG === true;
                const showGrade =
                    String(m.eyceS_GRadeDisplayFlg ?? m.eyceS_GradeDisplayFlg ?? '') === '1' || m.eyceS_GRadeDisplayFlg === true;
                return (
                    <span>
                        {passFailFlag}
                        {showMarks && ` (${obtainedMarks})`}
                        {showGrade && ` (${obtainedGrade})`}
                    </span>
                );
            }
            return passFailFlag;
        }

        if (!isGradeExam) {
            return obtainedMarks;
        } else {
            return obtainedGrade;
        }
    };

    const isAppToResult = (subj: any): boolean => {
        if (!subj) return false;
        const val = subj.empS_AppToResultFlG ?? subj.EMPS_AppToResultFlg ?? subj.empS_AppToResultFlg ?? true;
        return val === true || String(val) === '1' || String(val).toLowerCase() === 'true';
    };

    return (
        <div className='space-y-6'>
            <div className='flex items-center justify-end gap-2 pt-4 pb-4'>
                <Button onClick={handlePrint} className='bg-primary text-white shadow-md'>
                    <Printer className='mr-2 h-4 w-4' />
                    Print
                </Button>
            </div>

            <div ref={reportRef} className='report-container bg-white p-4 font-sans text-[#1a1a1a]'>
                <style
                    dangerouslySetInnerHTML={{
                        __html: `
                    @media print {
                        body * { visibility: hidden; }
                        .report-container, .report-container * { visibility: visible; }
                        .report-container { 
                            position: absolute; 
                            left: 0; 
                            top: 0; 
                            width: 100%; 
                            padding: 0 !important; 
                            font-family: sans-serif !important;
                        }
                        @page { size: portrait; margin: 10mm; }
                        .page-break { page-break-after: always; }
                    }
                    .report-container { font-family: sans-serif; }
                    .std-table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 14px; border: 1px solid black; }
                    .std-table th, .std-table td { border: 1px solid black; padding: 5px 8px; text-align: center; }
                    .std-table th { background-color: #f3f4f6 !important; font-weight: bold; }
                    .header-section { text-align: center; margin-bottom: 20px; }
                    .student-info-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; margin-bottom: 15px; font-size: 13px; }
                    .info-item { display: flex; gap: 5px; }
                    .info-label { font-weight: bold; min-width: 110px; }
                    .footer-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 40px; margin-top: 50px; }
                    .signature-box { border-top: 1px solid black; text-align: center; padding-top: 5px; font-weight: bold; font-size: 12px; }
                    .remarks-box { margin-top: 20px; display: flex; border-bottom: 1px solid black; padding-bottom: 2px; font-size: 13px; }
                `
                    }}
                />

                {students.map((report: any, index: number) => {
                    const studentId = getStudentId(report);
                    const workAtt = getAttendanceObj(studentId, stud_work_attendence);
                    const presAtt = getAttendanceObj(studentId, stud_present_attendence);
                    // Compute summary values from student_marks array as a robust fallback
                    const finalGroup = getgroupdetails[getgroupdetails.length - 1]?.empG_DistplayName || 'ANNUAL EXAM';
                    const finalSummary =
                        report.student_marks?.find(
                            (m: any) =>
                                Number(m.emE_ID ?? m.EME_Id ?? m.EME_ID ?? m.emE_Id) === 9800000 &&
                                String(m.empsG_DisplayNAme ?? m.EMPSG_DisplayName ?? m.empsG_GroupNAme ?? m.EMPSG_GroupName ?? '')
                                    .trim()
                                    .toLowerCase() === String(finalGroup).trim().toLowerCase()
                        ) ||
                        report.student_marks?.find((m: any) => Number(m.emE_ID ?? m.EME_Id ?? m.EME_ID ?? m.emE_Id) === 9800000) ||
                        {};

                    const finalTotalMarks =
                        report.TotalMarks && String(report.TotalMarks).trim() !== ''
                            ? report.TotalMarks
                            : (finalSummary.obtainedMArks ?? finalSummary.ObtainedMarks ?? finalSummary.obtainedMarks ?? '');

                    const finalTotalPercentage =
                        report.TotalPercentage && String(report.TotalPercentage).trim() !== ''
                            ? report.TotalPercentage
                            : (finalSummary.totalPErcentage ?? finalSummary.TotalPercentage ?? finalSummary.totalPercentage ?? '');

                    const finalSectionRank =
                        report.SectionRank && String(report.SectionRank).trim() !== ''
                            ? report.SectionRank
                            : (report.student_marks?.find((m: any) => m.SectionRank !== undefined && m.SectionRank !== '')?.SectionRank ??
                              '');

                    const finalClassRank =
                        report.ClassRank && String(report.ClassRank).trim() !== ''
                            ? report.ClassRank
                            : (report.student_marks?.find((m: any) => m.ClassRank !== undefined && m.ClassRank !== '')?.ClassRank ?? '');

                    return (
                        <div key={studentId} className={`report-page ${index !== students.length - 1 ? 'page-break' : ''} mb-20`}>
                            {/* Header */}
                            <div className='header-section'>
                                <h2 className='font-bold text-xl'>PROGRESS REPORT</h2>
                                <h3 className='font-bold text-lg'>
                                    ACADEMIC YEAR {data.Year_Name || data.yearname || params.selected_academicYear || ''}
                                </h3>
                            </div>

                            {/* Student Details */}
                            <div className='student-info-grid'>
                                <div className='space-y-1'>
                                    <div className='info-item'>
                                        <span className='info-label'>NAME</span>: <b>{report.studentname || report.studentName || ''}</b>
                                    </div>
                                    <div className='info-item'>
                                        <span className='info-label'>CLASS TEACHER</span>:{' '}
                                        <b>{(data.Class_Teacher_Name || data.clastechname || '').toUpperCase()}</b>
                                    </div>
                                </div>
                                <div className='space-y-1'>
                                    <div className='info-item'>
                                        <span className='info-label'>CLASS</span>:{' '}
                                        <b>{report.classname || data.selected_class || params.selected_class || ''}</b>
                                    </div>
                                    <div className='info-item'>
                                        <span className='info-label'>SECTION</span>:{' '}
                                        <b>{report.sectionname || data.selected_section || params.selected_section || ''}</b>
                                    </div>
                                </div>
                                <div className='space-y-1'>
                                    <div className='info-item'>
                                        <span className='info-label'>ADM.NO</span>: <b>{report.admno || report.amsT_AdmNo || ''}</b>
                                    </div>
                                    <div className='info-item'>
                                        <span className='info-label'>D.O.B</span>: <b>{formatDate(report.dob)}</b>
                                    </div>
                                </div>
                            </div>

                            {/* Marks Table */}
                            <table className='std-table'>
                                <thead>
                                    <tr>
                                        <th rowSpan={2} className='text-left'>
                                            Subject Name
                                        </th>
                                        {getgroupdetails.map((grp: any, gi: number) => (
                                            <th key={gi} colSpan={grp.groupewiseexam?.length || 1}>
                                                {grp.empG_DistplayName} ({grp.empsG_MarksValue} Marks)
                                            </th>
                                        ))}
                                        <th rowSpan={2}>Grand Total</th>
                                        <th rowSpan={2}>Grade</th>
                                        <th rowSpan={2} className='text-left'>
                                            Remarks
                                        </th>
                                    </tr>
                                    <tr>
                                        {groupwiseexamlist.map((grpexam: any, ei: number) => (
                                            <th key={ei}>
                                                {grpexam.examnamedisplay || grpexam.emE_ExamName}
                                                <br />({grpexam.EMPSGE_ForMaxMarkrs})
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {/* Result Subjects */}
                                    {report.studentsubjects?.filter(isAppToResult).map((subj: any, i: number) => {
                                        const subjId = subj.ismS_ID ?? subj.ISMS_Id ?? subj.ismS_Id;
                                        const subjectName = subj.ismS_SubjectNAme ?? subj.ISMS_SubjectName ?? subj.ismS_SubjectName ?? '';
                                        const obtainedMarks =
                                            subj.estmppS_ObtainedMArks ?? subj.ESTMPPS_ObtainedMarks ?? subj.estmppS_ObtainedMarks ?? '';
                                        const obtainedGrade =
                                            subj.estmppS_ObtainedGRade ?? subj.ESTMPPS_ObtainedGrade ?? subj.estmppS_ObtainedGrade ?? '';
                                        const remarks = subj.estmppS_REmarks ?? subj.ESTMPPS_Remarks ?? subj.estmppS_Remarks ?? '';

                                        const showMarks =
                                            subj.eyceS_MArksDisplayFlG ?? subj.EYCES_MarksDisplayFlg ?? subj.eyceS_MarksDisplayFlg ?? true;
                                        const isShowMarks =
                                            showMarks === true || String(showMarks) === '1' || String(showMarks).toLowerCase() === 'true';

                                        return (
                                            <tr key={i}>
                                                <td className='text-left font-bold'>{subjectName}</td>
                                                {groupwiseexamlist.map((grpexam: any, gi: number) => (
                                                    <td key={gi}>
                                                        {(() => {
                                                            const m = getMark(
                                                                report,
                                                                subjId,
                                                                grpexam.EME_Id,
                                                                grpexam.EMPG_DistplayName || grpexam.EMPG_GroupName
                                                            );
                                                            return renderSubjectExamMark(m, grpexam);
                                                        })()}
                                                    </td>
                                                ))}
                                                <td>
                                                    <b>{isShowMarks ? obtainedMarks : ''}</b>
                                                </td>
                                                <td>
                                                    <b>{obtainedGrade}</b>
                                                </td>
                                                <td className='text-left'>{remarks}</td>
                                            </tr>
                                        );
                                    })}

                                    {/* Total Row */}
                                    <tr className='bg-gray-50 font-bold'>
                                        <td className='text-left'>TOTAL</td>
                                        {groupwiseexamlist.map((grpexam: any, i: number) => {
                                            const m = getSummaryMark(
                                                grpexam.EME_Id,
                                                grpexam.EMPG_DistplayName || grpexam.EMPG_GroupName,
                                                report.student_marks
                                            );
                                            const val = m ? (m.obtainedMArks ?? m.ObtainedMarks ?? m.obtainedMarks ?? '') : '';
                                            return <td key={i}>{val}</td>;
                                        })}
                                        <td>{finalTotalMarks}</td>
                                        <td>&nbsp;</td>
                                        <td>&nbsp;</td>
                                    </tr>

                                    {/* Percentage Row */}
                                    <tr className='font-bold'>
                                        <td className='text-left'>PERCENTAGE</td>
                                        {groupwiseexamlist.map((grpexam: any, i: number) => {
                                            const m = getSummaryMark(
                                                grpexam.EME_Id,
                                                grpexam.EMPG_DistplayName || grpexam.EMPG_GroupName,
                                                report.student_marks
                                            );
                                            const val = m ? (m.totalPErcentage ?? m.TotalPercentage ?? m.totalPercentage ?? '') : '';
                                            return <td key={i}>{val ? `${val}%` : ''}</td>;
                                        })}
                                        <td>{finalTotalPercentage ? `${finalTotalPercentage}%` : ''}</td>
                                        <td>&nbsp;</td>
                                        <td>&nbsp;</td>
                                    </tr>

                                    {/* Ranks */}
                                    <tr>
                                        <td className='text-left font-bold'>RANK IN SECTION</td>
                                        <td colSpan={groupwiseexamlist.length + 3} className='font-bold'>
                                            {finalSectionRank}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className='text-left font-bold'>RANK IN CLASS</td>
                                        <td colSpan={groupwiseexamlist.length + 3} className='font-bold'>
                                            {finalClassRank}
                                        </td>
                                    </tr>

                                    {/* Non-Result Subjects (Co-Scholastic) */}
                                    {report.studentsubjects
                                        ?.filter((s: any) => !isAppToResult(s))
                                        .map((subj: any, i: number) => {
                                            const subjId = subj.ismS_ID ?? subj.ISMS_Id ?? subj.ismS_Id;
                                            const subjectName =
                                                subj.ismS_SubjectNAme ?? subj.ISMS_SubjectName ?? subj.ismS_SubjectName ?? '';
                                            const obtainedMarks =
                                                subj.estmppS_ObtainedMArks ??
                                                subj.ESTMPPS_ObtainedMarks ??
                                                subj.estmppS_ObtainedMarks ??
                                                '';
                                            const obtainedGrade =
                                                subj.estmppS_ObtainedGRade ??
                                                subj.ESTMPPS_ObtainedGrade ??
                                                subj.estmppS_ObtainedGrade ??
                                                '';
                                            const remarks = subj.estmppS_REmarks ?? subj.ESTMPPS_Remarks ?? subj.estmppS_Remarks ?? '';

                                            const showMarks =
                                                subj.eyceS_MArksDisplayFlG ??
                                                subj.EYCES_MarksDisplayFlg ??
                                                subj.eyceS_MarksDisplayFlg ??
                                                true;
                                            const isShowMarks =
                                                showMarks === true ||
                                                String(showMarks) === '1' ||
                                                String(showMarks).toLowerCase() === 'true';

                                            return (
                                                <tr key={i}>
                                                    <td className='text-left font-bold'>{subjectName}</td>
                                                    {groupwiseexamlist.map((grpexam: any, gi: number) => (
                                                        <td key={gi}>
                                                            {(() => {
                                                                const m = getMark(
                                                                    report,
                                                                    subjId,
                                                                    grpexam.EME_Id,
                                                                    grpexam.EMPG_DistplayName || grpexam.EMPG_GroupName
                                                                );
                                                                return renderSubjectExamMark(m, grpexam);
                                                            })()}
                                                        </td>
                                                    ))}
                                                    <td>
                                                        <b>{isShowMarks ? obtainedMarks : ''}</b>
                                                    </td>
                                                    <td>
                                                        <b>{obtainedGrade}</b>
                                                    </td>
                                                    <td className='text-left'>{remarks}</td>
                                                </tr>
                                            );
                                        })}
                                </tbody>
                            </table>

                            {/* Attendance Table */}
                            <table className='std-table mt-4'>
                                <thead>
                                    <tr>
                                        <th colSpan={16}>ATTENDANCE</th>
                                    </tr>
                                    <tr>
                                        <th colSpan={2} className='text-left'>
                                            MONTH
                                        </th>
                                        <th>JUN</th>
                                        <th>JUL</th>
                                        <th>AUG</th>
                                        <th>SEP</th>
                                        <th>OCT</th>
                                        <th>NOV</th>
                                        <th>DEC</th>
                                        <th>JAN</th>
                                        <th>FEB</th>
                                        <th>MAR</th>
                                        <th>APR</th>
                                        <th>MAY</th>
                                        <th>TOTAL</th>
                                        <th>TOTAL%</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td colSpan={2} className='text-left font-bold'>
                                            WORKING DAYS
                                        </td>
                                        <td>{renderAttendanceMonth(workAtt, 'june')}</td>
                                        <td>{renderAttendanceMonth(workAtt, 'july')}</td>
                                        <td>{renderAttendanceMonth(workAtt, 'august')}</td>
                                        <td>{renderAttendanceMonth(workAtt, 'september')}</td>
                                        <td>{renderAttendanceMonth(workAtt, 'october')}</td>
                                        <td>{renderAttendanceMonth(workAtt, 'november')}</td>
                                        <td>{renderAttendanceMonth(workAtt, 'december')}</td>
                                        <td>{renderAttendanceMonth(workAtt, 'january')}</td>
                                        <td>{renderAttendanceMonth(workAtt, 'february')}</td>
                                        <td>{renderAttendanceMonth(workAtt, 'march')}</td>
                                        <td>{renderAttendanceMonth(workAtt, 'april')}</td>
                                        <td>{renderAttendanceMonth(workAtt, 'may')}</td>
                                        <td className='font-bold'>{getAttTotalDays(workAtt, true) || params.workingDays}</td>
                                        <td className='font-bold'>{getAttPercentage(workAtt)}</td>
                                    </tr>
                                    <tr>
                                        <td colSpan={2} className='text-left font-bold'>
                                            PRESENT DAYS
                                        </td>
                                        <td>{renderAttendanceMonth(presAtt, 'june')}</td>
                                        <td>{renderAttendanceMonth(presAtt, 'july')}</td>
                                        <td>{renderAttendanceMonth(presAtt, 'august')}</td>
                                        <td>{renderAttendanceMonth(presAtt, 'september')}</td>
                                        <td>{renderAttendanceMonth(presAtt, 'october')}</td>
                                        <td>{renderAttendanceMonth(presAtt, 'november')}</td>
                                        <td>{renderAttendanceMonth(presAtt, 'december')}</td>
                                        <td>{renderAttendanceMonth(presAtt, 'january')}</td>
                                        <td>{renderAttendanceMonth(presAtt, 'february')}</td>
                                        <td>{renderAttendanceMonth(presAtt, 'march')}</td>
                                        <td>{renderAttendanceMonth(presAtt, 'april')}</td>
                                        <td>{renderAttendanceMonth(presAtt, 'may')}</td>
                                        <td className='font-bold'>{getAttTotalDays(presAtt, false) || params.presentDays}</td>
                                        <td className='font-bold'>{getAttPercentage(presAtt)}</td>
                                    </tr>
                                </tbody>
                            </table>

                            {/* Remarks */}
                            <table className='std-table !border-none !w-full mt-4'>
                                <tbody>
                                    <tr className='!border-none'>
                                        <td className='!border-none !w-[200px] !p-0 text-left font-bold'>Class Teacher's Remarks :</td>
                                        <td className='!border-t-none !border-l-none !border-r-none !p-0 border-black border-b pl-2 text-left font-medium italic'>
                                            {report.remarks ?? report.Remarks ?? report.Remarksd ?? ''}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>

                            {/* Footer */}
                            <div className='footer-grid'>
                                <div className='signature-box'>Parent's Signature</div>
                                <div className='signature-box'>Class Teacher's Signature</div>
                                <div className='signature-box'>Principal's Signature</div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
