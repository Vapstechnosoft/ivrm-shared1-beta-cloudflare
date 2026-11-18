'use client';
import type React from 'react';

import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';

const N = (v: any) => (v ?? '').toString().trim().toUpperCase();

function StudentCard({ studentId, apiData, reopenDate }: { studentId: number; apiData: any; reopenDate: string }) {
    /* ── raw arrays ── */
    const students: any[] = apiData?.getstudentdetails ?? [];
    const subjects: any[] = apiData?.getstudentwisesubjectlist ?? [];
    const marks: any[] = apiData?.getstudentmarksdetails ?? [];
    const groups: any[] = apiData?.getgroupdetails ?? [];
    const exams: any[] = apiData?.getgroupexamdetails ?? [];
    const attendance: any[] = apiData?.getstudentwiseattendancedetails ?? [];
    const totals: any[] = apiData?.nonapplicablesubject_examwisemarks ?? [];
    const institution: any = apiData?.getinstitution?.[0] ?? {};

    /* ── filter by student ── */
    const stu = students.find((s: any) => s.amsT_Id === studentId) ?? {};
    const subs = subjects.filter((s: any) => s.amsT_Id === studentId);
    const mks = marks.filter((m: any) => m.amsT_Id === studentId);
    const att = attendance.find((a: any) => a.amsT_Id === studentId) ?? {};
    const tot = totals.find((t: any) => t.amsT_Id === studentId) ?? {};

    /* ── deduplicated marks map: subjectName_examId_groupName → first record ── */
    const marksMap: Record<string, any> = {};
    mks.forEach((m: any) => {
        const key = `${N(m.ismS_SubjectName)}_${m.emE_Id}_${N(m.empsG_DisplayName)}`;
        if (!marksMap[key]) marksMap[key] = m;
    });

    /* ── build groupwiseexamlist (same as JS controller) ── */
    const sortedGroups = [...groups].sort((a, b) => (a.empsG_Order ?? 0) - (b.empsG_Order ?? 0));
    let empG_DistplayNametemp = '';
    const gwExamList: any[] = [];

    sortedGroups.forEach((grp: any) => {
        const gName = grp.empG_DistplayName || grp.empG_GroupName || '';
        empG_DistplayNametemp = empG_DistplayNametemp ? empG_DistplayNametemp + gName + '(50)' : gName + '(50) +';

        const grpExams = exams
            .filter((e: any) => N(e.empG_DistplayName) === N(gName))
            .sort((a: any, b: any) => (a.emE_ExamOrder ?? 0) - (b.emE_ExamOrder ?? 0));

        let counttotal = 0;
        grpExams.forEach((e: any) => {
            counttotal += e.empsgE_ForMaxMarkrs ?? 0;
            gwExamList.push({
                emE_Id: e.emE_Id,
                emE_ExamName: e.emE_ExamName,
                EMPG_DistplayName: gName,
                maxMarks: e.empsgE_ForMaxMarkrs,
                label: e.emE_ExamCode || e.emE_ExamName
            });
        });
        gwExamList.push({ emE_Id: 9800000, emE_ExamName: 'Total', EMPG_DistplayName: gName, maxMarks: counttotal, label: 'Total' });
        gwExamList.push({ emE_Id: 9800001, emE_ExamName: 'Grade', EMPG_DistplayName: gName, maxMarks: counttotal, label: 'Grade' });
        grp._colCount = grpExams.length + 2; // exams + Total + Grade
    });

    /* ── helpers ── */
    const getMrk = (subjName: string, examId: number, grpName: string) => marksMap[`${N(subjName)}_${examId}_${N(grpName)}`] ?? null;

    const td = (style?: object) => ({ border: '1px solid #000', padding: '3px 5px', ...style });
    const today = new Date();
    const dateStr = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;

    return (
        <div style={{ pageBreakBefore: 'always', border: '1px solid black', padding: '5px', marginBottom: '20px' }}>
            {/* LOGO */}
            <div style={{ textAlign: 'center', marginBottom: '8px' }}>
                <img src={institution.mI_Logo ?? ''} style={{ width: '100%' }} alt='Header' />
                <h4 style={{ margin: '4px 0', fontWeight: 'bold' }}>ACADEMIC YEAR {stu.asmaY_Year ?? ''}</h4>
            </div>

            {/* STUDENT INFO + PHOTO */}
            <div style={{ display: 'flex', marginBottom: '8px' }}>
                <div style={{ flex: 1 }}>
                    {(
                        [
                            ['Class.', `${stu.className ?? ''} : ${stu.sectionName ?? ''}`],
                            ['Roll No.', stu.admissionNo ?? ''],
                            ["Student's Name", stu.studentName ?? ''],
                            ["Father's/Mother's/Guardian's Name", (stu.fatherName ?? '') + '\u00a0'],
                            ['Date Of Birth', stu.dob ?? '']
                        ] as [string, string][]
                    ).map(([label, value]) => (
                        <div key={label} style={{ display: 'flex', marginBottom: '3px' }}>
                            <span style={{ fontWeight: 'bold', width: '260px', flexShrink: 0 }}>
                                <b>{label}</b>
                            </span>
                            <span style={{ fontWeight: 'bold', borderBottom: '1px solid #000', flex: 1 }}>
                                : <b>{value}</b>
                            </span>
                        </div>
                    ))}
                </div>
                {stu.amsT_Photoname && (
                    <div style={{ width: '130px', flexShrink: 0, paddingLeft: '8px' }}>
                        <img src={stu.amsT_Photoname} style={{ width: '130px' }} alt='Student' />
                    </div>
                )}
            </div>

            {/* MARKS TABLE */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '8px' }}>
                <thead>
                    {/* Row 1: Group headers */}
                    <tr>
                        <td style={td({ width: '120px', fontWeight: 'bold' })}>
                            <b>Scholastic Areas(A)</b>
                        </td>
                        {sortedGroups.map((grp: any, i: number) => (
                            <td key={i} colSpan={grp._colCount ?? 2} style={td({ textAlign: 'center', fontWeight: 'bold' })}>
                                <b>{grp.empG_DistplayName}</b>
                            </td>
                        ))}
                        <td colSpan={2} style={td({ textAlign: 'center', fontWeight: 'bold' })}>
                            <b>Overall</b>
                            <hr style={{ margin: '2px 0' }} />
                            <b>{empG_DistplayNametemp}</b>
                        </td>
                    </tr>
                    {/* Row 2: Exam column headers */}
                    <tr>
                        <th style={td({ textAlign: 'center' })}>
                            <b>Subject Name</b>
                        </th>
                        {gwExamList.map((ex: any, i: number) => (
                            <th key={i} style={td({ textAlign: 'center', width: '60px', height: '80px', whiteSpace: 'pre-wrap' })}>
                                <b>{ex.label}</b>
                                {ex.maxMarks ? (
                                    <>
                                        <br />
                                        <b>({ex.maxMarks})</b>
                                    </>
                                ) : null}
                            </th>
                        ))}
                        <th rowSpan={2} style={td({ textAlign: 'center' })}>
                            <b>Grand Total</b>
                        </th>
                        <th style={td({ textAlign: 'center' })}>
                            <b>Grade</b>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {subs.map((subj: any, si: number) => (
                        <tr key={si}>
                            <td style={td({ textAlign: 'left' })}>
                                <b>{subj.subjectName}</b>
                            </td>
                            {gwExamList.map((ex: any, i: number) => {
                                const mrk = getMrk(subj.subjectName, ex.emE_Id, ex.EMPG_DistplayName);
                                const pFlag = mrk?.passFailFlag ?? '';
                                const isAbs = ['AB', 'M', 'L'].includes(pFlag);
                                const isGrade = ex.emE_ExamName === 'Grade';
                                const isTotal = ex.emE_Id === 9800000;

                                let display: React.ReactNode = '';
                                if (mrk) {
                                    if (isAbs) display = <b>{pFlag}</b>;
                                    else if (isGrade) display = <b>{mrk.obtainedGrade}</b>;
                                    else if (isTotal) display = <b>{mrk.obtainedMarks}</b>;
                                    else display = <b>{mrk.obtainedMarks}</b>;
                                }
                                return (
                                    <td key={i} style={td({ textAlign: 'center' })}>
                                        {display}
                                    </td>
                                );
                            })}
                            {/* Grand Total = subjectObtainedMarks/2, Grade = subjectGrade */}
                            <td style={td({ textAlign: 'center' })}>
                                <b>{subj.subjectObtainedMarks != null ? subj.subjectObtainedMarks / 2 : ''}</b>
                            </td>
                            <td style={td({ textAlign: 'center' })}>
                                <b>{subj.subjectGrade ?? ''}</b>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* OVERALL SUMMARY */}
            <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                {[
                    ['Overall Marks', tot.TotalMarks ?? tot.totalMarks ?? ''],
                    ['Percentage', (tot.Percentage ?? tot.percentage) != null ? `${tot.Percentage ?? tot.percentage} %` : ''],
                    ['Grade', tot.ESTMPPSG_GroupObtGrade ?? tot.estmppsg_GroupObtGrade ?? '']
                ].map(([label, value]) => (
                    <table key={label} style={{ flex: 1, borderCollapse: 'collapse' }}>
                        <tbody>
                            <tr>
                                <th style={td({ width: '114px' })}>{label}</th>
                                <th style={td({})}>{value}</th>
                            </tr>
                        </tbody>
                    </table>
                ))}
            </div>

            {/* SCHOOL REOPEN + PROMOTED */}
            <div style={{ marginTop: '10px' }}>
                {[
                    ["School Reopen's On :", reopenDate],
                    ['Promoted To Class :', '\u00a0']
                ].map(([label, val]) => (
                    <div key={label} style={{ display: 'flex', marginBottom: '3px' }}>
                        <span style={{ fontWeight: 'bold', width: '200px' }}>
                            <b>{label}</b>
                        </span>
                        <span style={{ borderBottom: '1px solid #000', flex: 1 }}>
                            <b>{val}</b>
                        </span>
                    </div>
                ))}
            </div>

            {/* ATTENDANCE */}
            <div style={{ marginTop: '10px' }}>
                <table style={{ borderCollapse: 'collapse' }}>
                    <tbody>
                        <tr>
                            <td colSpan={2} style={td({ textAlign: 'center' })}>
                                <b>ATTENDANCE</b>
                            </td>
                        </tr>
                        <tr>
                            <td style={td({})}>
                                <b>No.Of Working Days</b>
                            </td>
                            <td style={td({ textAlign: 'center' })}>
                                <b>238</b>
                            </td>
                        </tr>
                        <tr>
                            <td style={td({})}>
                                <b>No.Of Present Days</b>
                            </td>
                            <td style={td({ textAlign: 'center' })}>
                                <b>{att.presentDays ?? att.PRESENTDAYS ?? att.present_attendence ?? ''}</b>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* SIGNATURES */}
            <div style={{ marginTop: '30px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div style={{ width: '25%' }}>
                        <div>
                            <b>Place : Hubballi</b>
                        </div>
                        <div>
                            <b>Date : {dateStr}</b>
                        </div>
                    </div>
                    <div style={{ width: '25%', textAlign: 'center' }}>
                        <b>
                            Signature of Class
                            <br />
                            Teacher
                        </b>
                    </div>
                    <div
                        style={{
                            width: '25%',
                            textAlign: 'center',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '4px'
                        }}>
                        <img
                            src='https://dcampusstrg.blob.core.windows.net/files/17/ISM_Attachments/dfdf77b6-33b8-4be5-9efe-6ab2da4f41d5.jpg'
                            style={{ width: '50px', height: '50px', objectFit: 'contain' }}
                            alt='Seal'
                        />
                        <b>
                            Signature of
                            <br />
                            Principal
                        </b>
                    </div>
                    <div style={{ width: '25%', textAlign: 'center' }}>
                        <b>
                            Signature of
                            <br />
                            Parents
                        </b>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function FinalPromReportSChinmayaView({ data }: { data: any }) {
    const apiData = data?.apiData;
    const payload = data?.payload;
    const reopenDate = payload?.reopen_date ?? '';
    const students: any[] = apiData?.getstudentdetails ?? [];
    const ids: number[] = Array.isArray(payload?.temp_AmstIds)
        ? payload.temp_AmstIds.map((s: any) => s.amsT_Id)
        : students.map((s: any) => s.amsT_Id);

    return (
        <div style={{ backgroundColor: '#fff' }}>
            <style>{`
                @media print {
                    @page { size: A4; margin: 8mm; }
                    html, body { visibility: hidden !important; }
                    #chinmaya-print-area, #chinmaya-print-area * { visibility: visible !important; }
                    #chinmaya-print-area { position: absolute; left: 0; top: 0; width: 100%; }
                    .no-print { display: none !important; }
                    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                }
            `}</style>
            <div className='no-print' style={{ display: 'flex', justifyContent: 'flex-end', padding: '6px 12px' }}>
                <Button
                    onClick={() => window.print()}
                    size='sm'
                    style={{ padding: '4px 12px', fontSize: '12px', width: 'auto' }}
                    className='flex items-center gap-1'>
                    <Printer className='h-3 w-3' /> Print
                </Button>
            </div>
            <div id='chinmaya-print-area' style={{ padding: '16px 24px' }}>
                {ids.map((id) => (
                    <StudentCard key={id} studentId={id} apiData={apiData} reopenDate={reopenDate} />
                ))}
            </div>
        </div>
    );
}
