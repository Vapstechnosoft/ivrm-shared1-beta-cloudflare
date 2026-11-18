'use client';
import { useMemo } from 'react';

interface Props {
    reportData: any;
    onPrint?: () => void;
}

export default function ProgressCardReport({ reportData, onPrint }: Props) {
    const {
        getstudentdetails = [],
        getstudentwisesubjectlist = [],
        getstudentmarksdetails = [],
        getgroupexamdetails = [],
        examwiseremarks = [],
        getstudentwisetermwisedetails = [],
        getstudentwiseattendancedetails = [],
        getpromotionremarksdetails = [],
        getsubjects = [],
        yearlySkillAreaStudentWise = [],
        clstchname = []
    } = reportData;

    // Derived states similar to the AngularJS logic
    const examlistgrade = useMemo(() => {
        const list: any[] = [];
        if (getgroupexamdetails && getgroupexamdetails.length > 0) {
            getgroupexamdetails.forEach((d: any) => {
                list.push({
                    empsgE_ForMaxMarkrs: d.empsgE_ForMaxMarkrs,
                    EMPG_GroupName: d.empG_GroupName,
                    EME_Id: d.emE_Id,
                    EME_ExamName: d.emE_ExamName,
                    EME_ExamOrder: d.emE_ExamOrder,
                    EMPG_DistplayName: d.empG_DistplayName,
                    examnamedisplay: d.emE_ExamCode,
                    colspan: null,
                    GradeExam: 'Exam',
                    Gradespan: null
                });
                list.push({
                    empsgE_ForMaxMarkrs: 'Grade',
                    EMPG_GroupName: d.empG_GroupName,
                    EME_Id: d.emE_Id,
                    EME_ExamName: d.emE_ExamName,
                    EME_ExamOrder: d.emE_ExamOrder,
                    EMPG_DistplayName: d.empG_DistplayName,
                    examnamedisplay: d.emE_ExamCode,
                    colspan: null,
                    GradeExam: 'Grade',
                    Gradespan: 2
                });
                list.push({
                    empsgE_ForMaxMarkrs: 'Grade',
                    EMPG_GroupName: d.empG_GroupName,
                    EME_Id: d.emE_Id,
                    EME_ExamName: d.emE_ExamName,
                    EME_ExamOrder: d.emE_ExamOrder,
                    EMPG_DistplayName: d.empG_DistplayName,
                    examnamedisplay: d.emE_ExamCode,
                    colspan: null,
                    GradeExam: 'Gradess',
                    Gradespan: 2
                });
            });
        }
        return list;
    }, [getgroupexamdetails]);

    return (
        <>
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&display=swap');

                @media print {
                    body * {
                        visibility: hidden !important;
                    }
                    #progress-card-print-area,
                    #progress-card-print-area * {
                        visibility: visible !important;
                    }
                    #progress-card-print-area {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                    }
                    .no-print {
                        display: none !important;
                    }
                    .page-break-after {
                        page-break-after: always !important;
                    }
                    .page-break-before {
                        page-break-before: always !important;
                    }
                    @page {
                        size: A4 landscape;
                        margin: 5mm;
                    }
                    .table-bordered {
                        border: 1px solid black !important;
                    }
                    .table-bordered th, .table-bordered td {
                        border: 1px solid black !important;
                    }
                }

                .report-container {
                    font-family: 'Poppins', sans-serif !important;
                    color: black;
                }

                .table-custom {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 1rem;
                    background-color: transparent !important;
                }

                .table-custom th, .table-custom td {
                    border: 1px solid black;
                    padding: 4px;
                    text-align: center;
                    font-size: 13px;
                }

                .text-left { text-align: left !important; }
                .text-center { text-align: center !important; }
                .text-right { text-align: right !important; }
                .font-bold { font-weight: bold; }
            `}</style>

            <div id='progress-card-print-area' className='report-container'>
                {getstudentdetails.map((report: any, index: number) => {
                    const studentId = report.AMST_Id || report.amsT_Id || Number(report.subject_wise_total_per);

                    const studentName = report.studentname || report.amsT_FirstName || report.r_amst_id;
                    const className = report.classname || report.asmcL_ClassName || report.r_grporder;
                    const sectionName = report.sectionname || report.asmC_SectionName || report.r_emps_apptoresultflg;
                    const admNo = report.admno || report.amsT_AdmNo || report.r_isms_id;
                    const academicYear = report.asmaY_Year || (clstchname && clstchname.length > 0 ? '2025-2026' : '');

                    const rawStudentSubjects = getstudentwisesubjectlist.filter(
                        (s: any) => s.AMST_Id === studentId || s.amsT_Id === studentId || Number(s.r_AMST_Id) === studentId
                    );

                    const uniqueSubjectIds = Array.from(new Set(rawStudentSubjects.map((s: any) => s.r_ISMS_Id || s.ISMS_Id)));
                    const studentSubjects = uniqueSubjectIds.map((id) =>
                        rawStudentSubjects.find((s: any) => (s.r_ISMS_Id || s.ISMS_Id) === id)
                    );

                    const studentMarks = getstudentmarksdetails.filter((m: any) => (m.AMST_Id || m.amsT_Id) === studentId);
                    const studentTermMarks = getstudentwisetermwisedetails.filter((t: any) => (t.AMST_Id || t.amsT_Id) === studentId);
                    const studentAttendance = getstudentwiseattendancedetails.filter((a: any) => (a.AMST_Id || a.amsT_Id) === studentId);
                    const studentRemarks = examwiseremarks.filter((r: any) => (r.AMST_Id || r.amsT_Id) === studentId);
                    const promotionRemarks = getpromotionremarksdetails.filter((p: any) => (p.amsT_Id || p.AMST_Id) === studentId);

                    return (
                        <div
                            key={studentId + '-' + index}
                            className='report-page mb-8'
                            style={{ pageBreakBefore: index > 0 ? 'always' : 'auto' }}>
                            <div
                                className='p-4'
                                style={{
                                    backgroundImage: "url('https://vapsclg.blob.core.windows.net/files/Logo02.jpg')",
                                    backgroundRepeat: 'no-repeat',
                                    backgroundSize: '500px',
                                    backgroundPosition: 'center',
                                    border: '1px solid black'
                                }}>
                                <table className='table-custom mb-4' style={{ border: 'none' }}>
                                    <tbody>
                                        <tr>
                                            <th style={{ border: 'none', textAlign: 'left', width: '30%' }}>
                                                TUNBRIDGE HIGH SCHOOL Report Card
                                            </th>
                                            <th style={{ border: 'none', textAlign: 'left', width: '20%' }}>{studentName}</th>
                                            <th style={{ border: 'none', textAlign: 'center', width: '20%' }}>
                                                {className} &nbsp; {sectionName}
                                            </th>
                                            <th style={{ border: 'none', textAlign: 'center', width: '15%' }}>
                                                <b>Adm &nbsp; {admNo}</b>
                                            </th>
                                            <th style={{ border: 'none', textAlign: 'right', width: '15%' }}>AY &nbsp;{academicYear}</th>
                                        </tr>
                                    </tbody>
                                </table>

                                <div className='grid grid-cols-12 gap-4'>
                                    <div className='col-span-9'>
                                        <table className='table-custom'>
                                            <thead>
                                                <tr>
                                                    <th rowSpan={2}>No</th>
                                                    <th className='text-center' rowSpan={2} colSpan={4}>
                                                        <b>Subject Name</b>
                                                    </th>
                                                    {getgroupexamdetails.map((grpexam: any, gIdx: number) => (
                                                        <th
                                                            key={gIdx}
                                                            className='text-center'
                                                            style={{ wordWrap: 'break-word', width: '150px' }}
                                                            colSpan={3}>
                                                            <b>{grpexam.emE_ExamName}</b>
                                                        </th>
                                                    ))}
                                                    <th className='text-center' style={{ wordWrap: 'break-word' }}>
                                                        <b>Yearly Aggregate</b>
                                                    </th>
                                                </tr>
                                                <tr>
                                                    {examlistgrade.map((exm: any, idx: number) => {
                                                        if (exm.GradeExam !== 'Gradess') {
                                                            return (
                                                                <th key={idx} colSpan={exm.GradeExam === 'Grade' ? exm.Gradespan : 1}>
                                                                    <b>{exm.empsgE_ForMaxMarkrs}</b>
                                                                </th>
                                                            );
                                                        }
                                                        return null;
                                                    })}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {studentSubjects.map((subj: any, sIdx: number) => {
                                                    const subjId = subj.r_ISMS_Id || subj.ISMS_Id;
                                                    const subjName = subj.r_ISMS_SubjectName || subj.ISMS_SubjectName;

                                                    // Get marks for this subject
                                                    const marksForSubj = rawStudentSubjects.filter(
                                                        (s: any) =>
                                                            (s.r_ISMS_Id || s.ISMS_Id) === subjId && s.r_EYCES_MarksDisplayFlg === 'true'
                                                    );

                                                    // Map by MaxMarks logic to align with exams
                                                    const exams50 = getgroupexamdetails
                                                        .filter((e: any) => e.empsgE_ForMaxMarkrs === 50)
                                                        .sort((a: any, b: any) => a.emE_ExamOrder - b.emE_ExamOrder);
                                                    const exams100 = getgroupexamdetails
                                                        .filter((e: any) => e.empsgE_ForMaxMarkrs === 100)
                                                        .sort((a: any, b: any) => a.emE_ExamOrder - b.emE_ExamOrder);

                                                    const marks50 = marksForSubj
                                                        .filter((m: any) => Number(m.r_ESTMPS_MaxMarks) === 50)
                                                        .sort((a: any, b: any) => Number(a.r_ESG_Id) - Number(b.r_ESG_Id));
                                                    const marks100 = marksForSubj
                                                        .filter((m: any) => Number(m.r_ESTMPS_MaxMarks) === 100)
                                                        .sort((a: any, b: any) => Number(a.r_ESG_Id) - Number(b.r_ESG_Id));

                                                    return (
                                                        <tr key={sIdx}>
                                                            <td>{sIdx + 1}</td>
                                                            <td
                                                                colSpan={subj.rowspan || 4}
                                                                className='text-left'
                                                                style={{ wordWrap: 'break-word' }}>
                                                                {subjName}
                                                            </td>

                                                            {getgroupexamdetails.map((grpexam: any) => {
                                                                // Legacy logic fallback
                                                                let mark = studentMarks.find(
                                                                    (m: any) => m.ISMS_Id === subjId && m.EME_Id === grpexam.emE_Id
                                                                );

                                                                // Dynamic Emoji API logic mapping
                                                                if (!mark) {
                                                                    let matchedRecord = null;
                                                                    if (grpexam.empsgE_ForMaxMarkrs === 50) {
                                                                        const idx = exams50.findIndex(
                                                                            (e: any) => e.emE_Id === grpexam.emE_Id
                                                                        );
                                                                        if (idx > -1) matchedRecord = marks50[idx];
                                                                    } else if (grpexam.empsgE_ForMaxMarkrs === 100) {
                                                                        const idx = exams100.findIndex(
                                                                            (e: any) => e.emE_Id === grpexam.emE_Id
                                                                        );
                                                                        if (idx > -1) matchedRecord = marks100[idx];
                                                                    }

                                                                    if (matchedRecord) {
                                                                        mark = {
                                                                            ObtainedMarks: matchedRecord.r_ESTMPPSG_GroupObtMarks,
                                                                            grade: matchedRecord.r_ESTMPPSG_GroupObtGrade,
                                                                            PassFailFlag:
                                                                                matchedRecord.r_ESTMPPSG_GroupObtMarks === 'AB' ? 'AB' : ''
                                                                        };
                                                                    }
                                                                }

                                                                return (
                                                                    <td key={grpexam.emE_Id} className='text-center' colSpan={3}>
                                                                        {mark?.PassFailFlag === 'AB' ? (
                                                                            <span>AB</span>
                                                                        ) : (
                                                                            <div className='grid w-full grid-cols-3 text-center'>
                                                                                <div>
                                                                                    {mark?.ObtainedMarks > 0 ||
                                                                                    mark?.ObtainedMarks !== undefined
                                                                                        ? mark.ObtainedMarks
                                                                                        : '-'}
                                                                                </div>
                                                                                <div className='col-span-2'>{mark?.grade || '-'}</div>
                                                                            </div>
                                                                        )}
                                                                    </td>
                                                                );
                                                            })}
                                                            <td className='text-center'>
                                                                {subj.subject_wise_total_per ? `${subj.subject_wise_total_per} %` : '-'}
                                                            </td>
                                                        </tr>
                                                    );
                                                })}

                                                <tr>
                                                    <th className='text-center' colSpan={5}>
                                                        TOTAL MARKS
                                                    </th>
                                                    {getgroupexamdetails.map((grpexam: any, gIdx: number) => {
                                                        const m =
                                                            reportData.getexamwisetotaldetails?.find(
                                                                (mk: any) =>
                                                                    mk.amsT_Id === studentId && mk.groupname === grpexam.empG_GroupName
                                                            ) ||
                                                            studentMarks.find((mk: any) => mk.EME_Id === grpexam.emE_Id && mk.TotalMarks);

                                                        const obtMarks = m?.totalobtainedmarks || m?.ObtainedMarks;
                                                        const totMarks = m?.totalmaxmarks || m?.TotalMarks;

                                                        return (
                                                            <th key={gIdx} className='text-center' colSpan={3}>
                                                                {obtMarks !== undefined ? `${obtMarks} / ${totMarks}` : '-'}
                                                            </th>
                                                        );
                                                    })}
                                                    <th>
                                                        {studentTermMarks.length > 0
                                                            ? `${studentTermMarks[0].ESTMPP_TotalObtMarks} / ${studentTermMarks[0].ESTMPP_TotalMaxMarks}`
                                                            : '-'}
                                                    </th>
                                                </tr>

                                                <tr>
                                                    <th className='text-center' colSpan={5}>
                                                        Percentage
                                                    </th>
                                                    {getgroupexamdetails.map((grpexam: any, gIdx: number) => {
                                                        const m =
                                                            reportData.getexamwisetotaldetails?.find(
                                                                (mk: any) =>
                                                                    mk.amsT_Id === studentId && mk.groupname === grpexam.empG_GroupName
                                                            ) ||
                                                            studentMarks.find(
                                                                (mk: any) => mk.EME_Id === grpexam.emE_Id && mk.TotalPercentage
                                                            );

                                                        const perc = m?.percentageobtained || m?.TotalPercentage;
                                                        return (
                                                            <th key={gIdx} className='text-center' colSpan={3}>
                                                                {perc ? `${perc} %` : '-'}
                                                            </th>
                                                        );
                                                    })}
                                                    <th>{studentTermMarks.length > 0 ? studentTermMarks[0].ESTMPP_Percentage : '-'}</th>
                                                </tr>

                                                <tr>
                                                    <th className='text-center' colSpan={5}>
                                                        Attendance %
                                                    </th>
                                                    {getgroupexamdetails.map((grpexam: any, gIdx: number) => {
                                                        const att = studentAttendance.find((a: any) => a.EME_Id === grpexam.emE_Id);
                                                        return (
                                                            <th key={gIdx} className='text-center' colSpan={3}>
                                                                {att && att.TOTALAttendancePercentage > 0
                                                                    ? att.TOTALAttendancePercentage
                                                                    : '-'}
                                                            </th>
                                                        );
                                                    })}
                                                    <th rowSpan={2}>
                                                        {report.TOTALAttendancePercentage > 0 ? report.TOTALAttendancePercentage : '-'}
                                                    </th>
                                                </tr>

                                                <tr>
                                                    <th className='text-center' colSpan={5}>
                                                        Cumulative Attendence/Days
                                                    </th>
                                                    {getgroupexamdetails.map((grpexam: any, gIdx: number) => {
                                                        const att = studentAttendance.find((a: any) => a.EME_Id === grpexam.emE_Id);
                                                        return (
                                                            <th key={gIdx} className='text-center' colSpan={3}>
                                                                {att ? `${att.TOTALPRESENTDAYS} / ${att.TOTALWORKINGDAYS}` : '-'}
                                                            </th>
                                                        );
                                                    })}
                                                </tr>

                                                <tr>
                                                    <th className='text-center' colSpan={5}>
                                                        Teacher's Signature & Date
                                                    </th>
                                                    {getgroupexamdetails.map((_: any, idx: number) => (
                                                        <th key={idx} colSpan={3}></th>
                                                    ))}
                                                    <th></th>
                                                </tr>
                                                <tr>
                                                    <th className='text-center' colSpan={5}>
                                                        Principal's Signature & Date
                                                    </th>
                                                    {getgroupexamdetails.map((_: any, idx: number) => (
                                                        <th key={idx} colSpan={3}></th>
                                                    ))}
                                                    <th></th>
                                                </tr>
                                                <tr>
                                                    <th className='text-center' colSpan={5}>
                                                        Parent's Signature & Date
                                                    </th>
                                                    {getgroupexamdetails.map((_: any, idx: number) => (
                                                        <th key={idx} colSpan={3}></th>
                                                    ))}
                                                    <th></th>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>

                                    <div className='col-span-3'>
                                        <table className='table-custom h-full'>
                                            <thead>
                                                <tr>
                                                    <th style={{ height: '50px' }}>Teacher's Comments/Rank</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {studentRemarks.length > 0 ? (
                                                    studentRemarks.map((rmk: any, rIdx: number) => (
                                                        <tr key={rIdx}>
                                                            <td style={{ textAlign: 'left', verticalAlign: 'top', padding: '10px' }}>
                                                                <div className='mb-2'>
                                                                    <span>
                                                                        {rmk.EME_ExamName} &emsp;&emsp; RANK: {rmk.ESTMP_ClassRank}
                                                                    </span>
                                                                </div>
                                                                <div>{rmk.EMER_Remarks}</div>
                                                            </td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td style={{ height: '140px' }}></td>
                                                    </tr>
                                                )}

                                                {promotionRemarks.length > 0 &&
                                                    promotionRemarks.map((prm: any, pIdx: number) => (
                                                        <tr key={`prm-${pIdx}`}>
                                                            <td style={{ textAlign: 'left', padding: '10px' }}>
                                                                <div className='mb-1 font-bold'>FINAL REMARKS & RESULT</div>
                                                                <div>{prm.eprD_ClassPromoted}</div>
                                                                <div className='mt-2 font-bold'>OVERALL RANK : {prm.eprD_Remarks}</div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                            </tbody>
                                        </table>
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
