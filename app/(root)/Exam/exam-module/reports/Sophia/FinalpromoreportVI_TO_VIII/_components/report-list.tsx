'use client';

import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';

/* ───────── helpers ───────── */
function formatDate(d?: string | null) {
    if (!d) return '';
    return d.split('T')[0];
}

function buildSubjectMarksMap(marks: any[]) {
    // key: `${ismS_Id}__${emE_Id}` → obtainedMarks, obtainedGrade
    const map: Record<string, { marks: number | string; grade: string }> = {};
    if (!Array.isArray(marks)) return map;
    marks.forEach((m) => {
        const key = `${m.ismS_Id}__${m.emE_Id}`;
        if (!map[key]) {
            map[key] = { marks: m.obtainedMarks ?? '', grade: m.obtainedGrade ?? '' };
        }
    });
    return map;
}

function getUniqueSubjects(subjectList: any[]) {
    if (!Array.isArray(subjectList)) return [];
    const seen = new Set<number>();
    return subjectList.filter((s) => {
        if (seen.has(s.ismS_Id ?? s.empS_SubjOrder)) return false;
        seen.add(s.ismS_Id ?? s.empS_SubjOrder);
        return true;
    });
}

/* ───────── per-student card ───────── */
function StudentCard({
    studentId,
    studentDetails,
    subjectList,
    marksDetails,
    groupDetails,
    groupExamDetails,
    attendanceDetails,
    institution,
    classTeacher,
    reopenDate,
    apiData
}: {
    studentId: number;
    studentDetails: any;
    subjectList: any[];
    marksDetails: any[];
    groupDetails: any[];
    groupExamDetails: any[];
    attendanceDetails: any[];
    institution: any;
    classTeacher: string;
    reopenDate: string;
    apiData: any;
}) {
    const student = studentDetails.find((s: any) => (s.amsT_Id || s.AMST_Id) === studentId) || studentDetails[0] || {};
    const studentSubjects = subjectList.filter((s: any) => (s.amsT_Id || s.AMST_Id) === studentId);
    const studentMarks = marksDetails.filter((m: any) => (m.amsT_Id || m.AMST_Id) === studentId);
    const studentAttendance = attendanceDetails.filter((a: any) => (a.amsT_Id || a.AMST_Id) === studentId);
    const studentExamWiseMarks = (apiData?.getstudent_examwisemarks || []).filter((m: any) => (m.amsT_Id || m.AMST_Id) === studentId);

    // Build marks lookup: subjId_examId_groupName -> marks record
    // Also build a subject name -> id map to fix missing IDs in subjectList
    const subjectNameIdMap: Record<string, number> = {};
    const marksMap: Record<string, any> = {};

    studentMarks.forEach((m: any) => {
        const subjId = m.ismS_Id || m.ISMS_Id;
        const examId = m.emE_Id || m.EME_Id;
        const sName = (m.ismS_SubjectName || m.ISMS_SubjectName || '').toString().trim().toUpperCase();
        if (subjId && sName) subjectNameIdMap[sName] = subjId;

        const rawGName =
            m.empsG_DisplayName ||
            m.EMPSG_DisplayName ||
            m.empsG_GroupName ||
            m.EMPSG_GroupName ||
            m.empG_GroupName ||
            m.EMPG_GroupName ||
            m.EMPG_DistplayName ||
            m.empG_DistplayName ||
            '';
        const gNameNormalized = rawGName.toString().trim().toUpperCase();

        const key = `${subjId || sName}_${examId}_${gNameNormalized}`;
        marksMap[key] = m;
    });

    // Build Total/Percentage lookup from getstudent_examwisemarks
    const totalMarksMap: Record<string, any> = {};
    studentExamWiseMarks.forEach((m: any) => {
        const examId = m.emE_Id || m.EME_Id;
        const rawGName =
            m.empsG_DisplayName ||
            m.EMPSG_DisplayName ||
            m.empsG_GroupName ||
            m.EMPSG_GroupName ||
            m.empG_GroupName ||
            m.EMPG_GroupName ||
            m.EMPG_DistplayName ||
            m.empG_DistplayName ||
            '';
        const gNameNormalized = rawGName.toString().trim().toUpperCase();
        const key = `${examId}_${gNameNormalized}`;
        totalMarksMap[key] = m;
    });

    // Sort groups by empsG_Order
    const sortedGroups = [...groupDetails].sort((a, b) => (a.empsG_Order ?? 0) - (b.empsG_Order ?? 0));

    // Flatten exams for headers
    const groupwiseexamlist: any[] = [];
    sortedGroups.forEach((grp) => {
        const rawGName =
            grp.empG_DistplayName ||
            grp.EMPG_DistplayName ||
            grp.empG_GroupName ||
            grp.EMPG_GroupName ||
            grp.empG_DisplayName ||
            grp.EMPSG_DisplayName ||
            '';
        const gNameNormalized = rawGName.toString().trim().toUpperCase();

        const exams = [...groupExamDetails]
            .filter((e) => {
                const eGName = (e.empG_GroupName || e.EMPG_GroupName || e.EMPG_DistplayName || e.empG_DistplayName || '')
                    .toString()
                    .trim()
                    .toUpperCase();
                return eGName === gNameNormalized;
            })
            .sort((a, b) => (a.emE_ExamOrder ?? 0) - (b.emE_ExamOrder ?? 0) || (a.EME_ExamOrder ?? 0) - (b.EME_ExamOrder ?? 0));

        exams.forEach((ex) => {
            groupwiseexamlist.push({
                ...ex,
                emE_Id: ex.emE_Id || ex.EME_Id,
                emE_ExamName: ex.emE_ExamName || ex.EME_ExamName,
                empsgE_ForMaxMarkrs: ex.empsgE_ForMaxMarkrs || ex.EMPSGE_ForMaxMarkrs,
                groupDisplayName: gNameNormalized
            });
        });
    });

    // attendance
    const att = studentAttendance[0] || {};
    const workingDays =
        att.totalWorkingDays || att.TOTALWORKINGDAYS || att.work_attendence || student.totalWorkingDays || student.TOTALWORKINGDAYS || '';
    const presentDays = att.presentDays || att.PRESENTDAYS || att.present_attendence || student.presentDays || student.PRESENTDAYS || '';

    const today = new Date();
    const generatedDate = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear()}`;

    return (
        <div style={{ pageBreakAfter: 'always', marginBottom: '24px' }}>
            {/* ── TOP SPACING & TITLE ── */}
            <div className='margin-top-100'>
                <br />
                <br />
            </div>
            <div className='margin-top-100'>
                <br />
                <br />
            </div>
            <br />
            <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '20px', marginBottom: '20px' }}>PROMOTION REPORT</div>

            {/* ── SCHOOL LOGO ── */}
            <div style={{ width: '100%', marginBottom: '8px' }}>
                <img
                    src={
                        institution?.mI_Logo ||
                        institution?.MI_Logo ||
                        'https://kusumadata.blob.core.windows.net/files/14/ISM_Attachments/f1192e36-a28c-4c01-a9b6-7ba55f1ae243.jpg'
                    }
                    alt='School Logo'
                    style={{ width: '100%', height: '185px', objectFit: 'cover' }}
                />
            </div>

            <div style={{ textAlign: 'center', marginBottom: '8px' }}>
                <h4 style={{ fontWeight: 'bold', fontSize: '16px', margin: 0 }}>
                    ACADEMIC YEAR - {student.asmaY_Year || student.ASMAY_Year || ''}
                </h4>
            </div>

            {/* ── STUDENT INFO ── */}
            <div style={{ marginBottom: '8px' }}>
                <div className='field-row'>
                    <span className='field-label'>Class.</span>
                    <span className='field-value'>
                        : {student.className || student.classname} : {student.sectionName || student.sectionname}
                    </span>
                </div>
                <div className='field-row'>
                    <span className='field-label'>Roll No.</span>
                    <span className='field-value'>: {student.rollNo || student.rollno || student.admissionNo || student.admissionno}</span>
                </div>
                <div className='field-row'>
                    <span className='field-label'>Student&apos;s Name</span>
                    <span className='field-value'>: {student.studentName || student.studentname}</span>
                </div>
                <div className='field-row'>
                    <span className='field-label'>Father&apos;s/Mother&apos;s/Guardian&apos;s Name</span>
                    <span className='field-value'>: {student.fatherName || student.fathername || ''} &nbsp;</span>
                </div>
                <div className='field-row'>
                    <span className='field-label'>Date Of Birth</span>
                    <span className='field-value'>: {student.dob || student.DOB}</span>
                </div>
            </div>

            {/* ── MARKS TABLE ── */}
            <div style={{ marginTop: '10px', overflowX: 'auto' }}>
                <table className='table-bordered' style={{ width: '100%' }}>
                    <thead>
                        {/* Group header row */}
                        <tr>
                            <td style={{ textAlign: 'left', fontWeight: 'bold', width: '150px' }}>Scholastic Areas(A)</td>
                            {sortedGroups.map((grp, idx) => {
                                const gName = grp.empG_DistplayName || grp.EMPG_DistplayName || grp.empG_GroupName || grp.EMPG_GroupName;
                                const examsCount = groupwiseexamlist.filter(
                                    (e) => e.groupDisplayName === gName.toString().trim().toUpperCase()
                                ).length;
                                return (
                                    <td key={idx} colSpan={examsCount} style={{ textAlign: 'center', fontWeight: 'bold' }}>
                                        {gName}
                                    </td>
                                );
                            })}
                        </tr>
                        {/* Exam sub-header row */}
                        <tr>
                            <th style={{ textAlign: 'center', width: '150px' }}>
                                <b>Subject Name</b>
                            </th>
                            {groupwiseexamlist.map((ex, i) => (
                                <th
                                    key={i}
                                    className='trclasssubject'
                                    style={{ textAlign: 'center', width: '70px', whiteSpace: 'pre-wrap' }}>
                                    <b>{ex.emE_ExamName}</b> <br />
                                    <b>({ex.empsgE_ForMaxMarkrs})</b>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {/* Scholastic subjects (AppToResultFlg = true) */}
                        {studentSubjects
                            .filter(
                                (s: any) =>
                                    s.empS_AppToResultFlg || s.EMPS_AppToResultFlg || s.empS_AppToResultFlag || s.EMPS_AppToResultFlag
                            )
                            .map((subj: any) => {
                                const sName = (subj.subjectName || subj.ismS_SubjectName || subj.ISMS_SubjectName || '')
                                    .toString()
                                    .trim()
                                    .toUpperCase();
                                const sId = subj.ismS_Id || subj.ISMS_Id || subjectNameIdMap[sName];

                                return (
                                    <tr key={sId || sName}>
                                        <td style={{ textAlign: 'left' }}>
                                            <b>{subj.subjectName || subj.ismS_SubjectName || subj.ISMS_SubjectName}</b>
                                        </td>
                                        {groupwiseexamlist.map((ex, i) => {
                                            const key = `${sId || sName}_${ex.emE_Id}_${ex.groupDisplayName}`;
                                            const mrks = marksMap[key];
                                            if (!mrks) return <td key={i}></td>;

                                            const isGrade = ex.emE_ExamName.toString().toUpperCase().includes('GRADE');
                                            const pFlag = mrks.passFailFlag || mrks.PassFailFlag;
                                            const isAbs = ['AB', 'M', 'L'].includes(pFlag);
                                            const obtMarks = mrks.obtainedMarks ?? mrks.ObtainedMarks;
                                            const obtGrade =
                                                mrks.emgD_Name ||
                                                mrks.EMGD_Name ||
                                                mrks.obtainedGrade ||
                                                mrks.ObtainedGrade ||
                                                mrks.Obtainedgrade;

                                            return (
                                                <td key={i} style={{ textAlign: 'center' }}>
                                                    {isAbs ? (
                                                        <b>
                                                            {pFlag} {obtMarks > 0 && !isGrade ? `(${obtMarks})` : ''}
                                                        </b>
                                                    ) : (
                                                        <b>{isGrade ? obtGrade : obtGrade || obtMarks}</b>
                                                    )}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                );
                            })}

                        {/* TOTAL row */}
                        <tr>
                            <td style={{ textAlign: 'left' }}>
                                <b>TOTAL</b>
                            </td>
                            {groupwiseexamlist.map((ex, i) => {
                                const key = `${ex.emE_Id}_${ex.groupDisplayName}`;
                                const totalData = totalMarksMap[key];

                                // Fallback to marksMap if not found in totalMarksMap
                                const mKey = `9800000_${ex.emE_Id}_${ex.groupDisplayName}`;
                                const mTotal = totalData || marksMap[mKey];

                                return (
                                    <td key={i} style={{ textAlign: 'center' }}>
                                        {ex.emE_Id === 9800000 ? <b>{mTotal?.obtainedMarks ?? mTotal?.ObtainedMarks}</b> : ''}
                                        {ex.emE_Id === 9800001 ? (
                                            <b>
                                                {totalData?.emgD_Name ??
                                                    totalData?.EMGD_Name ??
                                                    marksMap[`9800001_${ex.emE_Id}_${ex.groupDisplayName}`]?.emgD_Name}
                                            </b>
                                        ) : (
                                            ''
                                        )}
                                        {/* If it's a regular exam column but we want the total for that column? No, usually total is separate column */}
                                        {![9800000, 9800001].includes(ex.emE_Id) && (
                                            <b>{totalData?.obtainedMarks ?? totalData?.ObtainedMarks}</b>
                                        )}
                                    </td>
                                );
                            })}
                        </tr>

                        {/* PERCENTAGE row */}
                        <tr>
                            <td style={{ textAlign: 'left' }}>
                                <b>PERCENTAGE</b>
                            </td>
                            {groupwiseexamlist.map((ex, i) => {
                                const key = `${ex.emE_Id}_${ex.groupDisplayName}`;
                                const totalData = totalMarksMap[key];
                                const mKey = `9800000_${ex.emE_Id}_${ex.groupDisplayName}`;
                                const mTotal = totalData || marksMap[mKey];

                                return (
                                    <td key={i} style={{ textAlign: 'center' }}>
                                        <b>{mTotal?.totalPercentage ?? mTotal?.TotalPercentage ?? ''}</b>
                                    </td>
                                );
                            })}
                        </tr>

                        {/* Non-scholastic subjects (AppToResultFlg = false) */}
                        {studentSubjects
                            .filter(
                                (s: any) =>
                                    !(s.empS_AppToResultFlg || s.EMPS_AppToResultFlg || s.empS_AppToResultFlag || s.EMPS_AppToResultFlag)
                            )
                            .map((subj: any) => {
                                const sName = (subj.subjectName || subj.ismS_SubjectName || subj.ISMS_SubjectName || '')
                                    .toString()
                                    .trim()
                                    .toUpperCase();
                                const sId = subj.ismS_Id || subj.ISMS_Id || subjectNameIdMap[sName];

                                return (
                                    <tr key={sId || sName}>
                                        <td style={{ textAlign: 'left' }}>
                                            <b>{subj.subjectName || subj.ismS_SubjectName || subj.ISMS_SubjectName}</b>
                                        </td>
                                        {groupwiseexamlist.map((ex, i) => {
                                            const key = `${sId || sName}_${ex.emE_Id}_${ex.groupDisplayName}`;
                                            const mrks = marksMap[key];
                                            if (!mrks) return <td key={i}></td>;

                                            const pFlag = mrks.passFailFlag || mrks.PassFailFlag;
                                            const isAbs = ['AB', 'M', 'L'].includes(pFlag);
                                            const obtGrade = mrks.emgD_Name || mrks.EMGD_Name || mrks.obtainedGrade || mrks.ObtainedGrade;

                                            return (
                                                <td key={i} style={{ textAlign: 'center' }}>
                                                    {isAbs ? <b>{pFlag}</b> : <b>{obtGrade}</b>}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                );
                            })}
                    </tbody>
                </table>
            </div>

            {/* ── ATTENDANCE TABLE ── */}
            <div style={{ marginTop: '10px' }}>
                <table className='table-bordered' style={{ width: '100%' }}>
                    <tbody>
                        <tr>
                            <td colSpan={2} style={{ textAlign: 'center' }}>
                                <b>ATTENDANCE</b>
                            </td>
                        </tr>
                        <tr>
                            <td style={{ textAlign: 'left' }}>
                                <b>No. Of Working Days</b>
                            </td>
                            <td style={{ textAlign: 'center' }}>
                                <b>{workingDays || '---'}</b>
                            </td>
                        </tr>
                        <tr>
                            <td style={{ textAlign: 'left' }}>
                                <b>No. Of Present Days</b>
                            </td>
                            <td style={{ textAlign: 'center' }}>
                                <b>{presentDays || '---'}</b>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* ── SCHOOL REOPEN & PROMOTED ── */}
            <div style={{ marginTop: '10px' }}>
                <div className='field-row'>
                    <span className='field-label'>School ReOpen On :</span>
                    <span className='field-value'>{reopenDate}</span>
                </div>
                <div className='field-row'>
                    <span className='field-label'>Promoted To Class :</span>
                    <span className='field-value'>&nbsp;</span>
                </div>
            </div>

            {/* ── SIGNATURES ── */}
            <div style={{ marginTop: '40px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div style={{ width: '25%' }}>
                        <div>
                            <b>Place : {institution?.ivrmmcT_Name || institution?.IVRMMCT_Name || ''}</b>
                        </div>
                        <div>
                            <b>Date : {generatedDate}</b>
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
                            src='https://kusumadata.blob.core.windows.net/files/13/ISM_Attachments/8528f23f-aaeb-441f-a38e-e437b3dbe9d8.png'
                            alt='School Seal'
                            style={{ width: '60px', height: '60px', objectFit: 'contain' }}
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

/* ───────── main export ───────── */
export default function FinalpromoreportView({ data }: { data: any }) {
    const handlePrint = () => window.print();

    const apiData = data?.apiData;
    const payload = data?.payload;

    // Extract from API response
    const institution = Array.isArray(apiData?.getinstitution) ? apiData.getinstitution[0] : null;
    const studentDetails: any[] = Array.isArray(apiData?.getstudentdetails) ? apiData.getstudentdetails : [];
    const subjectList: any[] = Array.isArray(apiData?.getstudentwisesubjectlist) ? apiData.getstudentwisesubjectlist : [];
    const marksDetails: any[] = Array.isArray(apiData?.getstudentmarksdetails) ? apiData.getstudentmarksdetails : [];
    const groupDetails: any[] = Array.isArray(apiData?.getgroupdetails) ? apiData.getgroupdetails : [];
    const groupExamDetails: any[] = Array.isArray(apiData?.getgroupexamdetails) ? apiData.getgroupexamdetails : [];
    const attendanceDetails: any[] = Array.isArray(apiData?.getstudentwiseattendancedetails) ? apiData.getstudentwiseattendancedetails : [];
    const classTeacher =
        Array.isArray(apiData?.clstchname) &&
        (apiData.clstchname[0]?.hrmE_EmployeeFirstName || apiData.clstchname[0]?.HRME_EmployeeFirstName)
            ? apiData.clstchname[0].hrmE_EmployeeFirstName || apiData.clstchname[0].HRME_EmployeeFirstName
            : '';
    const reopenDate = payload?.reopen_date || '';

    // Unique student IDs from the request (temp_AmstIds)
    const requestedStudentIds: number[] = Array.isArray(payload?.temp_AmstIds)
        ? payload.temp_AmstIds.map((s: any) => s.amsT_Id || s.AMST_Id)
        : studentDetails.map((s: any) => s.amsT_Id || s.AMST_Id);

    return (
        <div style={{ backgroundColor: '#fff' }}>
            <style>{`
                @media print {
                    @page { size: A4; margin: 8mm; }
                    html, body { visibility: hidden !important; background: #ffffff !important; background-color: #ffffff !important; }
                    #finalpro-print-area, #finalpro-print-area * { visibility: visible !important; background-color: #ffffff !important; }
                    #finalpro-print-area { position: absolute; left: 0; top: 0; width: 100%; background: #ffffff !important; }
                    .no-print { display: none !important; }
                    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                }
                #finalpro-print-area {
                    font-family: Arial, Helvetica, sans-serif;
                    font-size: 12px;
                    line-height: 1.4;
                    color: #000;
                    width: 100%;
                    box-sizing: border-box;
                }
                #finalpro-print-area table {
                    border-collapse: collapse !important;
                    width: 100%;
                }
                #finalpro-print-area .table-bordered td,
                #finalpro-print-area .table-bordered th {
                    border: 1px solid black !important;
                    padding: 3px 5px;
                }
                .field-row {
                    display: flex;
                    align-items: baseline;
                    margin-bottom: 4px;
                }
                .field-label {
                    font-weight: bold;
                    width: 320px;
                    flex-shrink: 0;
                }
                .field-value {
                    font-weight: bold;
                    border-bottom: 1px solid #000;
                    flex: 1;
                    min-width: 200px;
                    padding-left: 4px;
                }
                thead { color: black !important; text-align: center; background: white !important; }
                .trclasssubject { height: 140px !important; white-space: pre-wrap; }
            `}</style>

            {/* Print Button */}
            <div className='no-print flex justify-end pt-2 pr-4 pb-1'>
                <Button onClick={handlePrint} size='sm' className='flex w-auto items-center gap-1 px-3 py-1 text-xs'>
                    <Printer className='h-3 w-3' /> Print
                </Button>
            </div>

            <div id='finalpro-print-area' style={{ padding: '16px 24px' }}>
                {requestedStudentIds.map((studentId, idx) => (
                    <StudentCard
                        key={studentId}
                        studentId={studentId}
                        studentDetails={studentDetails}
                        subjectList={subjectList}
                        marksDetails={marksDetails}
                        groupDetails={groupDetails}
                        groupExamDetails={groupExamDetails}
                        attendanceDetails={attendanceDetails}
                        institution={institution}
                        classTeacher={classTeacher}
                        reopenDate={reopenDate}
                        apiData={apiData}
                    />
                ))}
            </div>
        </div>
    );
}
