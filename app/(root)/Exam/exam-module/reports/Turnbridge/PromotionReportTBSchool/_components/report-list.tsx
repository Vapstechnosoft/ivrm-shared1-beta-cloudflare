'use client';

import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';

interface ReportListProps {
    data: any;
    params: any;
}
export const ReportList = ({ data, params }: ReportListProps) => {
    const handlePrint = () => {
        window.print();
    };

    const rawData = data?.data || data || {};

    const rawStudentDetails = getArray(rawData, ['getstudentdetails', 'studentdetails', 'studentlist', 'getstudentlist']);

    if (!rawStudentDetails || rawStudentDetails.length === 0) {
        return (
            <div className='flex h-40 items-center justify-center rounded-lg border bg-card text-muted-foreground'>
                No report data found for the selected criteria.
            </div>
        );
    }

    const {
        studentdetails,
        getstudentwisesubjectlist,
        getstudentmarksdetails,
        getstudentwisetermwisedetails,
        getstudentwiseattendancedetails,
        examwiseremarks,
        getpromotionremarksdetails,
        getgroupdetails,
        getgroupexamdetails,
        getstudent_examwisemarks
    } = rawData;

    // Build groupwiseexamlist (mirrors AngularJS controller logic)
    const groupwiseexamlist: any[] = [];
    (getgroupdetails || []).forEach((dd: any) => {
        let counttotal = 0;
        const groupExams = (getgroupexamdetails || []).filter((d: any) => d.empG_DistplayName === dd.empG_DistplayName);
        groupExams.forEach((d: any) => {
            counttotal += Number(d.empsgE_ForMaxMarkrs || 0);
            groupwiseexamlist.push({
                EMPG_GroupName: d.empG_GroupName,
                EME_Id: d.emE_Id,
                EME_ExamName: d.emE_ExamName,
                EME_ExamOrder: d.emE_ExamOrder,
                EMPG_DistplayName: d.empG_DistplayName,
                EMPSGE_ForMaxMarkrs: d.empsgE_ForMaxMarkrs,
                examnamedisplay: d.emE_ExamCode,
                colspan: null,
                Attcolspan: null
            });
        });
        groupwiseexamlist.push({
            EMPG_GroupName: dd.empG_GroupName,
            EME_Id: 9800000,
            EME_ExamName: 'Marks Obtained',
            EME_ExamOrder: 9800000,
            EMPG_DistplayName: dd.empG_DistplayName,
            EMPSGE_ForMaxMarkrs: counttotal,
            examnamedisplay: 'Total',
            colspan: 2,
            Attcolspan: 2
        });
        groupwiseexamlist.push({
            EMPG_GroupName: dd.empG_GroupName,
            EME_Id: 9800001,
            EME_ExamName: 'Term Average',
            EME_ExamOrder: 9800001,
            EMPG_DistplayName: dd.empG_DistplayName,
            EMPSGE_ForMaxMarkrs: counttotal,
            examnamedisplay: 'Term Average',
            colspan: null,
            Attcolspan: null
        });
    });

    // Visible exam columns (exclude 9800001 rows = "Term Average")
    const visibleExams = groupwiseexamlist.filter((g) => g.EME_Id !== 9800001);

    const getStudentSubjects = (amstId: number) => (getstudentwisesubjectlist || []).filter((s: any) => s.AMST_Id === amstId);

    const getStudentMarks = (amstId: number) => (getstudentmarksdetails || []).filter((m: any) => m.AMST_Id === amstId);

    const getExamwiseMarks = (amstId: number) => (getstudent_examwisemarks || []).filter((m: any) => m.AMST_Id === amstId);

    const getStudentMark = (studentmarks: any[], subjectId: number, examId: number, displayName: string) =>
        studentmarks.find((m: any) => m.ISMS_Id === subjectId && m.EME_Id === examId && m.EMPSG_DisplayName === displayName);

    const getStudentExamMark = (examwisemarks: any[], examId: number, displayName: string) =>
        examwisemarks.find((m: any) => m.EME_Id === examId && m.EMPSG_DisplayName === displayName);

    const renderMarkValue = (mark: any, grpexam: any, subj: any) => {
        if (!mark) return '';
        const passFailFlag = mark.PassFailFlag || '';
        const obtainedMarks = mark.ObtainedMarks ?? '';
        const obtainedGrade = mark.ObtainedGrade ?? '';
        const marksDisplayFlg = mark.EYCES_MarksDisplayFlg;
        const gradeDisplayFlg = mark.EYCES_GradeDisplayFlg;
        const examName = grpexam.EME_ExamName;
        const emeId = grpexam.EME_Id;

        if (['AB', 'M', 'L'].includes(passFailFlag)) {
            return passFailFlag;
        }

        // Not AB/M/L cases
        if (marksDisplayFlg && emeId !== 9800001 && emeId !== 9800000 && Number(obtainedMarks) > 0) {
            if (examName !== 'Term Average') return String(obtainedMarks);
            return String(obtainedMarks);
        }
        if (!marksDisplayFlg && gradeDisplayFlg && emeId !== 9800001 && emeId !== 9800000) {
            return String(obtainedGrade);
        }

        // Yearly aggregate (9800001)
        if (marksDisplayFlg && emeId === 9800001) {
            if (mark.GropuFlag === 1 && Number(mark.GroupMarks) > 0) return String(mark.GroupMarks);
            if (mark.GropuFlag === 0 && Number(obtainedMarks) > 0) return String(obtainedMarks);
        }
        if (gradeDisplayFlg && !marksDisplayFlg && (emeId === 9800000 || emeId === 9800001)) {
            return String(obtainedGrade);
        }

        return '';
    };

    const renderYearlyAggregate = (subj: any) => {
        const passFailFlag = subj.PassFailFlag || '';
        if (passFailFlag === 'AB') return 'AB';
        if (subj.EYCES_GradeDisplayFlg && !subj.EYCES_MarksDisplayFlg) return subj.ESTMPPSG_GroupObtGrade || '';
        if (subj.EYCES_MarksDisplayFlg) return subj.ESTMPPSG_GroupObtMarks || '';
        return '';
    };

    return (
        <div className='mx-auto w-[1400px]'>
            <div className='no-print mb-6 flex justify-end gap-3 rounded-t-md border-gray-200 border-b bg-gray-50/50 px-4 py-3'>
                <Button
                    onClick={handlePrint}
                    className='flex w-fit items-center gap-2 bg-sky-800 font-medium text-white shadow-sm transition-colors hover:bg-sky-900'>
                    <Printer className='h-4 w-4' /> Print
                </Button>
            </div>

            <div id='tb-print-area'>
                <style
                    dangerouslySetInnerHTML={{
                        __html: `
                    @media print {
                        @page { size: A4 landscape; margin: 10mm; }
                        body {
                            visibility: hidden;
                            -webkit-print-color-adjust: exact !important;
                            print-color-adjust: exact !important;
                        }
                        #tb-print-area, #tb-print-area * {
                            visibility: visible;
                        }
                        #tb-print-area {
                            position: absolute;
                            left: 0;
                            top: 0;
                            width: 100%;
                        }
                        .no-print {
                            display: none !important;
                        }
                    }
                    .tb-pagelayout {
                        border: 1px solid #727272;
                        padding: 8px;
                        margin-bottom: 20px;
                        background-image: url('https://vapsclg.blob.core.windows.net/files/Logo02.jpg');
                        background-repeat: no-repeat;
                        background-size: 500px !important;
                        background-position: center !important;
                    }
                    .tb-table {
                        width: 100%;
                        border-collapse: collapse;
                        font-family: 'Arial', sans-serif;
                        font-size: 13px;
                    }
                    .tb-table th, .tb-table td {
                        border: 1px solid black;
                        padding: 4px 6px;
                        text-align: center;
                    }
                    .tb-table thead {
                        color: black;
                        text-align: center;
                        background: white !important;
                    }
                    .tb-header-row th {
                        background: white !important;
                    }
                    .tb-subject-col {
                        text-align: left !important;
                        word-wrap: break-word;
                    }
                    .tb-exam-header {
                        word-wrap: break-word;
                        min-width: 80px;
                    }
                    .tb-yearly-agg-col {
                        min-width: 100px;
                    }
                    .trclasssubject {
                        height: 100px;
                        white-space: pre-wrap;
                    }
                    .tb-info-row th {
                        font-size: 14px;
                        padding: 5px 8px;
                        text-align: left;
                    }
                    .comments-table {
                        width: 100%;
                        border-collapse: collapse;
                        font-size: 13px;
                    }
                    .comments-table th, .comments-table td {
                        border: 1px solid black;
                        padding: 4px 6px;
                        text-align: left;
                    }
                `
                    }}
                />

                {(studentdetails || []).map((report: any, idx: number) => {
                    const amstId = report.AMST_Id;
                    const studentSubjects = getStudentSubjects(amstId);
                    const studentmarks = getStudentMarks(amstId);
                    const examwisemarks = getExamwiseMarks(amstId);
                    const studentRemarks = (examwiseremarks || []).filter((r: any) => r.AMST_Id === amstId);
                    const promotionRemarks = (getpromotionremarksdetails || []).find((r: any) => r.amsT_Id === amstId);
                    const termwiseDetail = (getstudentwisetermwisedetails || []).find((r: any) => r.AMST_Id === amstId);
                    const attendanceDetails = (getstudentwiseattendancedetails || []).filter((a: any) => a.AMST_Id === amstId);

                    return (
                        <div key={`tb-report-${amstId}-${idx}`} className={`tb-pagelayout ${idx > 0 ? 'page-break' : ''}`}>
                            {/* Student Info Header */}
                            <table className='tb-table' style={{ backgroundColor: 'transparent' }}>
                                <tbody>
                                    <tr className='tb-info-row'>
                                        <th style={{ width: '25%' }}>
                                            <b>TUNBRIDGE HIGH SCHOOL Report Card</b>
                                        </th>
                                        <th style={{ width: '25%' }}>
                                            <b>{report.studentname}</b>
                                        </th>
                                        <th style={{ width: '20%' }}>
                                            <b>
                                                {report.classname}&nbsp;&nbsp;{report.sectionname}
                                            </b>
                                        </th>
                                        <th style={{ width: '15%' }}>
                                            <b>Adm&nbsp;{report.admno}</b>
                                        </th>
                                        <th style={{ width: '15%' }}>
                                            <b>AY&nbsp;{report.asmaY_Year || params?.academicYear || ''}</b>
                                        </th>
                                    </tr>
                                </tbody>
                            </table>

                            {/* Main Layout: Marks Table + Comments Column */}
                            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '4px', backgroundColor: 'transparent' }}>
                                <tbody>
                                    <tr>
                                        {/* Left: Marks Table */}
                                        <td style={{ verticalAlign: 'top' }}>
                                            <table className='tb-table' style={{ backgroundColor: 'transparent' }}>
                                                {/* Table Header */}
                                                <thead>
                                                    <tr className='tb-header-row'>
                                                        <th style={{ width: '30px' }}>No</th>
                                                        <th style={{ width: '150px' }} className='tb-subject-col'>
                                                            <b>Subject</b>
                                                        </th>
                                                        {visibleExams.map((grpexam: any, gi: number) => (
                                                            <th key={`exam-hdr-${gi}`} className='tb-exam-header'>
                                                                <b>{grpexam.examnamedisplay}</b>
                                                                <br />
                                                                {grpexam.EMPSGE_ForMaxMarkrs ? <b>({grpexam.EMPSGE_ForMaxMarkrs})</b> : ''}
                                                            </th>
                                                        ))}
                                                        <th className='tb-yearly-agg-col'>Yearly Aggregate</th>
                                                    </tr>
                                                </thead>

                                                {/* Subject Rows */}
                                                <tbody>
                                                    {studentSubjects.map((subj: any, si: number) => (
                                                        <tr key={`subj-${si}`}>
                                                            <td>{si + 1}</td>
                                                            <td
                                                                className='tb-subject-col'
                                                                style={{ width: '150px', wordBreak: 'break-word' }}>
                                                                {subj.ISMS_SubjectName}
                                                            </td>
                                                            {visibleExams.map((grpexam: any, gi: number) => {
                                                                // Skip EME_Id 9800001 (term average) columns - already filtered
                                                                const mark = getStudentMark(
                                                                    studentmarks,
                                                                    subj.ISMS_Id,
                                                                    grpexam.EME_Id,
                                                                    grpexam.EMPG_DistplayName
                                                                );
                                                                const showDash =
                                                                    !subj.EYCES_MarksDisplayFlg &&
                                                                    grpexam.EME_ExamName === 'Term Average' &&
                                                                    grpexam.EME_Id !== 9800000 &&
                                                                    grpexam.EME_Id !== 9800001;

                                                                // colspan for rowspan logic (group subjects)
                                                                const skipCell =
                                                                    subj.GropuFlag === 1 &&
                                                                    grpexam.EME_Id === 9800001 &&
                                                                    subj.colspan === -1;
                                                                if (skipCell) return null;

                                                                const rowSpan =
                                                                    subj.colspan > 1 &&
                                                                    subj.GropuFlag === 1 &&
                                                                    grpexam.EME_Id !== 9800000 &&
                                                                    grpexam.EME_Id === 9800001
                                                                        ? subj.colspan
                                                                        : 1;

                                                                return (
                                                                    <td key={`mark-${gi}`} rowSpan={rowSpan}>
                                                                        {mark ? renderMarkValue(mark, grpexam, subj) : showDash ? '-' : ''}
                                                                    </td>
                                                                );
                                                            })}
                                                            {/* Yearly Aggregate */}
                                                            <td>{renderYearlyAggregate(subj)}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>

                                                {/* Summary Rows */}
                                                <tbody>
                                                    {/* Total Marks Row */}
                                                    <tr>
                                                        <th colSpan={2} className='text-center'>
                                                            TOTAL MARKS
                                                        </th>
                                                        {visibleExams
                                                            .filter((g) => g.EME_Id !== 9800001)
                                                            .map((grpexam: any, gi: number) => {
                                                                const mark = getStudentExamMark(
                                                                    examwisemarks,
                                                                    grpexam.EME_Id,
                                                                    grpexam.EMPG_DistplayName
                                                                );
                                                                return (
                                                                    <th
                                                                        key={`total-${gi}`}
                                                                        colSpan={
                                                                            grpexam.EME_Id !== 9800001 && grpexam.EME_Id === 9800000
                                                                                ? grpexam.colspan
                                                                                : 1
                                                                        }>
                                                                        {mark ? `${mark.ObtainedMarks}/${mark.TotalMarks}` : ''}
                                                                    </th>
                                                                );
                                                            })}
                                                        <th>
                                                            {termwiseDetail
                                                                ? `${termwiseDetail.ESTMPP_TotalObtMarks} / ${termwiseDetail.ESTMPP_TotalMaxMarks}`
                                                                : ''}
                                                        </th>
                                                    </tr>

                                                    {/* Percentage Row */}
                                                    <tr>
                                                        <th colSpan={2} className='text-center'>
                                                            Percentage
                                                        </th>
                                                        {visibleExams
                                                            .filter((g) => g.EME_Id !== 9800001)
                                                            .map((grpexam: any, gi: number) => {
                                                                const mark = getStudentExamMark(
                                                                    examwisemarks,
                                                                    grpexam.EME_Id,
                                                                    grpexam.EMPG_DistplayName
                                                                );
                                                                return (
                                                                    <th
                                                                        key={`pct-${gi}`}
                                                                        colSpan={
                                                                            grpexam.EME_Id !== 9800001 && grpexam.EME_Id === 9800000
                                                                                ? grpexam.colspan
                                                                                : 1
                                                                        }>
                                                                        {mark ? mark.TotalPercentage : ''}
                                                                    </th>
                                                                );
                                                            })}
                                                        <th>{termwiseDetail?.ESTMPP_Percentage || ''}</th>
                                                    </tr>

                                                    {/* Attendance % Row */}
                                                    <tr>
                                                        <th colSpan={2} className='text-center'>
                                                            Attendance %
                                                        </th>
                                                        {visibleExams
                                                            .filter((g) => g.EME_Id !== 9800001)
                                                            .map((grpexam: any, gi: number) => {
                                                                const att = attendanceDetails.find(
                                                                    (a: any) =>
                                                                        a.EME_Id === grpexam.EME_Id &&
                                                                        a.EMPSG_DisplayName === grpexam.EMPG_DistplayName
                                                                );
                                                                return (
                                                                    <th key={`att-${gi}`} colSpan={grpexam.Attcolspan || 1}>
                                                                        {att ? att.TOTALAttendancePercentage : ''}
                                                                    </th>
                                                                );
                                                            })}
                                                        <th rowSpan={2}>{report.TOTALAttendancePercentage || ''}</th>
                                                    </tr>

                                                    {/* Cumulative Attendance Row */}
                                                    <tr>
                                                        <th colSpan={2} className='text-center'>
                                                            Cumulative Attendence/Days
                                                        </th>
                                                        {visibleExams
                                                            .filter((g) => g.EME_Id !== 9800001)
                                                            .map((grpexam: any, gi: number) => {
                                                                const att = attendanceDetails.find(
                                                                    (a: any) =>
                                                                        a.EME_Id === grpexam.EME_Id &&
                                                                        a.EMPSG_DisplayName === grpexam.EMPG_DistplayName
                                                                );
                                                                return (
                                                                    <th key={`cumatt-${gi}`} colSpan={grpexam.Attcolspan || 1}>
                                                                        {att ? `${att.TOTALPRESENTDAYS} / ${att.TOTALWORKINGDAYS}` : ''}
                                                                    </th>
                                                                );
                                                            })}
                                                    </tr>

                                                    {/* Teacher's Signature Row */}
                                                    <tr>
                                                        <th colSpan={2} className='text-center'>
                                                            Teacher&apos;s Signature &amp; Date
                                                        </th>
                                                        {visibleExams
                                                            .filter((g) => g.EME_Id !== 9800001)
                                                            .map((grpexam: any, gi: number) => (
                                                                <th
                                                                    key={`tsig-${gi}`}
                                                                    colSpan={
                                                                        grpexam.EME_Id !== 9800001 && grpexam.EME_Id === 9800000
                                                                            ? grpexam.colspan
                                                                            : 1
                                                                    }
                                                                    style={{ height: '40px' }}></th>
                                                            ))}
                                                        <th></th>
                                                    </tr>

                                                    {/* Principal's Signature Row */}
                                                    <tr>
                                                        <th colSpan={2} className='text-center'>
                                                            Principal&apos;s Signature &amp; Date
                                                        </th>
                                                        {visibleExams
                                                            .filter((g) => g.EME_Id !== 9800001)
                                                            .map((grpexam: any, gi: number) => (
                                                                <th
                                                                    key={`psig-${gi}`}
                                                                    colSpan={
                                                                        grpexam.EME_Id !== 9800001 && grpexam.EME_Id === 9800000
                                                                            ? grpexam.colspan
                                                                            : 1
                                                                    }
                                                                    style={{ height: '40px' }}></th>
                                                            ))}
                                                        <th></th>
                                                    </tr>

                                                    {/* Parent's Signature Row */}
                                                    <tr>
                                                        <th colSpan={2} className='text-center'>
                                                            Parent&apos;s Signature &amp; Date
                                                        </th>
                                                        {visibleExams
                                                            .filter((g) => g.EME_Id !== 9800001)
                                                            .map((grpexam: any, gi: number) => (
                                                                <th
                                                                    key={`parsig-${gi}`}
                                                                    colSpan={
                                                                        grpexam.EME_Id !== 9800001 && grpexam.EME_Id === 9800000
                                                                            ? grpexam.colspan
                                                                            : 1
                                                                    }
                                                                    style={{ height: '40px' }}></th>
                                                            ))}
                                                        <th></th>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </td>

                                        {/* Right: Teacher Comments & Rank */}
                                        <td style={{ verticalAlign: 'top', width: '250px' }}>
                                            <table className='comments-table'>
                                                <thead>
                                                    <tr>
                                                        <th style={{ height: '94px' }}>Teacher&apos;s Comments/Rank</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {studentRemarks.map((remark: any, ri: number) => (
                                                        <tr key={`remark-${ri}`}>
                                                            <td style={{ textAlign: 'left' }}>
                                                                {remark.EME_ExamName}&emsp;&emsp;RANK : {remark.ESTMP_ClassRank}
                                                                <br />
                                                                {remark.EMER_Remarks}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                    {promotionRemarks && (
                                                        <tr>
                                                            <td style={{ textAlign: 'left' }}>
                                                                FINAL REMARKS &amp; RESULT
                                                                <br />
                                                                {promotionRemarks.eprD_Remarks}
                                                                <br />
                                                                OVERALL RANK : {promotionRemarks.eprD_ClassPromoted}
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
