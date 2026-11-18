// _components/brs-progress-card-printable.tsx
// Dedicated A4 print view for BRS (Burnpur) Progress Card Report

'use client';
import type { IExamReportCard, IMasterInstitution, ISubject, Institution } from '@/types/exam/exam-module/report';

interface SubSubject {
    EMSS_Id: number;
    EMSS_SubSubjectName: string;
}

interface SubSubjectMark {
    EMSS_Id: number;
    ISMS_Id: number;
    ESTMPSSS_ObtainedMarks: number | null;
    ESTMPSSS_PassFailFlg: string;
}

interface BrsPrintData extends IExamReportCard {
    amaY_RollNo?: any;
    userName?: string;
    _MotherName?: string;
    sub_subject?: SubSubject[];
    sub_subjectmarks?: SubSubjectMark[];
}

interface Props {
    reportData: BrsPrintData[];
    institution: Institution | IMasterInstitution | null | undefined;
    subjects: ISubject[];
    headerInfo: any;
    examName: string;
    examCode: string;
    year: string;
}

export default function BrsProgressCardPrintable({ reportData, subjects, examName, year }: Props) {
    const formatDate = (dateStr?: string | null) => {
        if (!dateStr) return 'N/A';
        try {
            const d = new Date(dateStr);
            const dd = String(d.getDate()).padStart(2, '0');
            const mm = String(d.getMonth() + 1).padStart(2, '0');
            const yyyy = d.getFullYear();
            return `${dd}/${mm}/${yyyy}`;
        } catch {
            return 'N/A';
        }
    };

    const today = new Date();
    const todayFormatted = `${String(today.getDate()).padStart(2, '0')}-${String(today.getMonth() + 1).padStart(2, '0')}-${today.getFullYear()}`;

    // Only applicable subjects, sorted by order
    const resultSubjects = subjects
        .filter((s) => s.eyceS_AplResultFlg !== false)
        .sort((a, b) => (a.eyceS_SubjectOrder ?? 999) - (b.eyceS_SubjectOrder ?? 999));

    return (
        <>
            <style jsx global>{`
                @media print {
                    @page {
                        size: A4 portrait;
                        margin: 1mm;
                    }
                    body * { visibility: hidden !important; }
                    #brs-print-view, #brs-print-view * { visibility: visible !important; }
                    #brs-print-view {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                    }
                    .brs-print-card { page-break-inside: avoid; }
                    .brs-print-break { page-break-before: always; }
                    .brs-print-break:first-child { page-break-before: avoid; }
                    .brs-goldenrod-print {
                        background-color: GoldenRod !important;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                    .brs-border-print {
                        border: 15px solid GoldenRod !important;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                    .brs-white-row { background-color: white !important; }
                }

                #brs-print-view {
                    font-family: 'Source Sans Pro', sans-serif;
                    color: black;
                }

                .brs-p-table {
                    width: 100%;
                    border-collapse: collapse;
                }

                .brs-p-table th,
                .brs-p-table td {
                    border: 1px solid black;
                    padding: 5px 8px;
                    font-size: 13px;
                }

                .brs-info-td {
                    border: none !important;
                    padding: 3px 6px;
                    font-size: 13px;
                    font-weight: bold;
                }

                .brs-goldenrod-bg {
                    background-color: GoldenRod;
                    color: black;
                    font-weight: bold;
                    text-align: center;
                }

                .brs-total-row {
                    background-color: GoldenRod;
                    color: black;
                    font-weight: bold;
                }
            `}</style>

            <div id='brs-print-view'>
                {reportData.map((student, idx) => {
                    const subSubjects: SubSubject[] = student.sub_subject || [];
                    const subSubjectMarks: SubSubjectMark[] = student.sub_subjectmarks || [];

                    return (
                        <div
                            key={student.amsT_Id}
                            className={`brs-print-card brs-border-print ${idx > 0 ? 'brs-print-break' : ''}`}
                            style={{ padding: '16px', backgroundColor: 'white' }}>
                            {/* School Header Image — Burnpur */}
                            <div style={{ textAlign: 'center', marginBottom: '8px' }}>
                                <img
                                    src='https://vapsclg.blob.core.windows.net/files/73/NoticeUpload/551c9ec7-4251-4a99-9b91-f96a751dab18.jpg'
                                    alt='School Header'
                                    style={{ width: '83%', marginLeft: '9%', height: 'auto' }}
                                />
                            </div>

                            <br />

                            {/* PROGRESS REPORT Banner */}
                            <div style={{ textAlign: 'center', marginBottom: '6px' }}>
                                <div
                                    className='brs-goldenrod-bg brs-goldenrod-print'
                                    style={{
                                        width: '23%',
                                        marginLeft: '38%',
                                        height: '37px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                    <strong style={{ fontSize: '15px' }}>PROGRESS REPORT</strong>
                                </div>
                            </div>

                            {/* Exam Name + Session Banner */}
                            <div style={{ marginBottom: '6px' }}>
                                <div
                                    className='brs-goldenrod-bg brs-goldenrod-print'
                                    style={{
                                        width: '100%',
                                        height: '46px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                    <strong style={{ fontSize: '15px' }}>
                                        {examName} (SESSION : {year})
                                    </strong>
                                </div>
                            </div>

                            {/* Student Info */}
                            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '6px' }}>
                                <tbody>
                                    <tr>
                                        <td className='brs-info-td' style={{ width: '33%' }}>
                                            &nbsp;&nbsp;&nbsp;&nbsp;Name : {student.amsT_FirstName}
                                        </td>
                                        <td className='brs-info-td' style={{ width: '33%' }}>
                                            Class &amp; Section : {student.asmcL_ClassName}/{student.asmC_SectionName}
                                        </td>
                                        <td className='brs-info-td' style={{ width: '33%' }}>
                                            Roll No : {student.amaY_RollNo || 'N/A'}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className='brs-info-td'>&nbsp;&nbsp;&nbsp;&nbsp;Admn. No. : {student.amsT_AdmNo}</td>
                                        <td className='brs-info-td'>Date of Birth : {formatDate(student.amsT_DOB)}</td>
                                        <td className='brs-info-td'>House : {(student as any).userName || 'N/A'}</td>
                                    </tr>
                                    <tr>
                                        <td className='brs-info-td'>
                                            &nbsp;&nbsp;&nbsp;&nbsp;Mother's Name :{' '}
                                            {student.amsT_MotherName || (student as any)._MotherName || 'N/A'}
                                        </td>
                                        <td className='brs-info-td'>Father's Name : {student.amsT_FatherName}</td>
                                        <td className='brs-info-td' />
                                    </tr>
                                </tbody>
                            </table>

                            {/* Marks Table */}
                            <table className='brs-p-table' style={{ marginTop: '8px' }}>
                                <thead>
                                    <tr className='brs-goldenrod-bg brs-goldenrod-print'>
                                        <td style={{ textAlign: 'left', fontWeight: 'bold' }}>SUBJECTS</td>
                                        <td style={{ textAlign: 'center', fontWeight: 'bold' }}>Max Marks</td>
                                        {subSubjects.map((sub) => (
                                            <td key={sub.EMSS_Id} style={{ textAlign: 'center', fontWeight: 'bold' }}>
                                                {sub.EMSS_SubSubjectName}
                                            </td>
                                        ))}
                                        <td style={{ textAlign: 'center', fontWeight: 'bold' }}>Marks Obtained</td>
                                        <td style={{ textAlign: 'center', fontWeight: 'bold' }}>Grade</td>
                                    </tr>
                                </thead>
                                <tbody>
                                    {resultSubjects.map((subj) => {
                                        const mark = student.sub_list.find((m) => m.ismS_Id === subj.ismS_Id);
                                        const isAbsent = mark?.estmpS_PassFailFlg === 'AB';
                                        const showMarks = subj.eyceS_MarksDisplayFlg !== false;
                                        const showGrade = subj.eyceS_GradeDisplayFlg !== false;

                                        return (
                                            <tr key={subj.ismS_Id} className='brs-white-row'>
                                                <td style={{ textAlign: 'left', fontWeight: 'bold' }}>{subj.ismS_SubjectName}</td>
                                                <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{mark?.estmpS_MaxMarks ?? '-'}</td>
                                                {subSubjects.map((sub) => {
                                                    const ssm = subSubjectMarks.find(
                                                        (m) => m.EMSS_Id === sub.EMSS_Id && m.ISMS_Id === subj.ismS_Id
                                                    );
                                                    return (
                                                        <td key={sub.EMSS_Id} style={{ textAlign: 'center', fontWeight: 'bold' }}>
                                                            {ssm?.ESTMPSSS_PassFailFlg === 'AB'
                                                                ? 'AB'
                                                                : showMarks
                                                                  ? (ssm?.ESTMPSSS_ObtainedMarks ?? '-')
                                                                  : '-'}
                                                        </td>
                                                    );
                                                })}
                                                <td style={{ textAlign: 'center', fontWeight: 'bold' }}>
                                                    {isAbsent ? 'AB' : showMarks ? (mark?.estmpS_ObtainedMarks ?? '-') : '-'}
                                                </td>
                                                <td style={{ textAlign: 'center', fontWeight: 'bold' }}>
                                                    {isAbsent ? 'AB' : showGrade ? (mark?.estmpS_ObtainedGrade ?? '-') : '-'}
                                                </td>
                                            </tr>
                                        );
                                    })}

                                    {/* Total Row */}
                                    <tr className='brs-total-row brs-goldenrod-print'>
                                        <td
                                            colSpan={2 + subSubjects.length}
                                            style={{ textAlign: 'right', fontWeight: 'bold', paddingRight: '12px' }}>
                                            TOTAL
                                        </td>
                                        <td style={{ textAlign: 'center', fontWeight: 'bold' }}>
                                            {student.estmP_TotalObtMarks ?? '-'} / {student.estmP_TotalMaxMarks ?? '-'}
                                        </td>
                                        <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{student.estmP_TotalGrade ?? '-'}</td>
                                    </tr>

                                    {/* Percentage Row */}
                                    <tr className='brs-total-row brs-goldenrod-print'>
                                        <td
                                            colSpan={2 + subSubjects.length}
                                            style={{ textAlign: 'right', fontWeight: 'bold', paddingRight: '12px' }}>
                                            PERCENTAGE
                                        </td>
                                        <td colSpan={2} style={{ textAlign: 'center', fontWeight: 'bold' }}>
                                            {student.estmP_Percentage != null ? `${student.estmP_Percentage}%` : '-'}
                                        </td>
                                    </tr>

                                    {/* Result Row */}
                                    <tr className='brs-total-row brs-goldenrod-print'>
                                        <td
                                            colSpan={2 + subSubjects.length}
                                            style={{ textAlign: 'right', fontWeight: 'bold', paddingRight: '12px' }}>
                                            RESULT
                                        </td>
                                        <td colSpan={2} style={{ textAlign: 'center', fontWeight: 'bold' }}>
                                            {student.estmP_Result ?? '-'}
                                        </td>
                                    </tr>

                                    {/* Remarks */}
                                    {student.estmP_TotalGradeRemark && (
                                        <tr className='brs-white-row'>
                                            <td
                                                colSpan={4 + subSubjects.length}
                                                style={{ textAlign: 'left', fontWeight: 'bold', paddingLeft: '8px' }}>
                                                Remarks : {student.estmP_TotalGradeRemark}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>

                            {/* Signatures Section */}
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    textAlign: 'center',
                                    marginTop: '24px'
                                }}>
                                {/* Place & Date */}
                                <div style={{ flex: 1, textAlign: 'left' }}>
                                    <span style={{ fontSize: '15px', fontWeight: 'bold' }}>&nbsp;&nbsp;&nbsp;&nbsp;Place : Burnpur</span>
                                    <br />
                                    <span style={{ fontSize: '15px', fontWeight: 'bold' }}>
                                        &nbsp;&nbsp;&nbsp;&nbsp;Date : {todayFormatted}
                                    </span>
                                </div>

                                {/* Class Teacher */}
                                <div style={{ flex: 1, textAlign: 'center' }}>
                                    <span style={{ fontSize: '15px', fontWeight: 'bold' }}>
                                        Signature of <br /> Class Teacher
                                    </span>
                                </div>

                                {/* Principal Signature */}
                                <div style={{ flex: 1, textAlign: 'center' }}>
                                    <img
                                        src='https://vapsclg.blob.core.windows.net/files/73/NoticeUpload/14abfc5e-3e03-4eb9-a5e7-c2725944cc3d.png'
                                        alt='Principal Signature'
                                        style={{ width: '110px', height: 'auto' }}
                                    />
                                    <br />
                                </div>

                                {/* Co-ordinator Signature */}
                                <div style={{ flex: 1, textAlign: 'center' }}>
                                    <img
                                        src='https://vapsclg.blob.core.windows.net/files/73/NoticeUpload/8ff47850-8524-423c-92a7-30c37099e292.png'
                                        alt='Coordinator Signature'
                                        style={{ width: '120px', height: 'auto', transform: 'rotate(7deg)' }}
                                    />
                                    <br />
                                    <span style={{ fontSize: '15px', fontWeight: 'bold' }}>
                                        Signature of <br /> Co-ordinator
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </>
    );
}
