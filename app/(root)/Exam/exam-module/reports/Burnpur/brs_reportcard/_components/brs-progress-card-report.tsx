'use client';

import { Button } from '@/components/ui/button';
import type { IExamReportCard, IMasterInstitution, ISubject, Institution } from '@/types/exam/exam-module/report';
import { Printer } from 'lucide-react';

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

interface BrsReportData extends IExamReportCard {
    amaY_RollNo?: any;
    userName?: string; // House
    _MotherName?: string;
    sub_subject?: SubSubject[];
    sub_subjectmarks?: SubSubjectMark[];
    eyceS_MarksDisplayFlg?: boolean;
    eyceS_GradeDisplayFlg?: boolean;
    eyceS_AplResultFlg?: boolean;
}

interface Props {
    reportData: BrsReportData[];
    subjects: ISubject[];
    headerInfo: {
        cla?: string;
        sec?: string;
    };
    examName: string;
    examCode: string;
    year: string;
    institution: Institution | IMasterInstitution | null | undefined;
    onPrint?: () => void;
}

export default function BrsProgressCardReport({ reportData, subjects, examName, examCode, year, institution, headerInfo, onPrint }: Props) {
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

    return (
        <>
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Source+Sans+Pro:wght@400;600;700&display=swap');

                .brs-report-container {
                    font-family: 'Source Sans Pro', sans-serif !important;
                    color: black;
                }

                .brs-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 0.5rem;
                }

                .brs-table th,
                .brs-table td {
                    border: 1px solid black;
                    padding: 5px 8px;
                    text-align: center;
                    font-size: 14px;
                }

                .brs-info-table td {
                    border: none;
                    padding: 3px 6px;
                    font-size: 14px;
                    font-weight: bold;
                }

                .brs-goldenrod-banner {
                    background-color: GoldenRod;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: black;
                }

                .brs-card-border {
                    border: 15px solid GoldenRod;
                    margin-bottom: 60px;
                    background: white;
                }

                @media print {
                    body * { visibility: hidden !important; }
                    #brs-print-area,
                    #brs-print-area * { visibility: visible !important; }
                    #brs-print-area {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                    }
                    .no-print { display: none !important; }
                    .brs-page-break { page-break-after: always !important; }
                    @page {
                        size: A4 portrait;
                        margin: 1mm;
                    }
                    .brs-goldenrod-banner {
                        background-color: GoldenRod !important;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                    .brs-card-border {
                        border: 15px solid GoldenRod !important;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                    .brs-marks-header {
                        background-color: GoldenRod !important;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                }
            `}</style>

            {/* Print Button */}
            <div className='no-print my-4 flex justify-end'>
                <Button onClick={onPrint} className='flex items-center gap-2'>
                    <Printer className='h-4 w-4' />
                    Print All Progress Cards
                </Button>
            </div>

            <div id='brs-print-area' className='brs-report-container'>
                {reportData.map((report, index) => {
                    // Gather sub-subjects unique list from report
                    const subSubjects: SubSubject[] = report.sub_subject || [];
                    const subSubjectMarks: SubSubjectMark[] = report.sub_subjectmarks || [];

                    return (
                        <div key={`${report.amsT_Id}-${index}`} className='brs-card-border p-4'>
                            {/* School Header Image — Burnpur (mi_id == 71) */}
                            <div style={{ width: '100%', textAlign: 'center', marginBottom: '8px' }}>
                                <img
                                    src='https://vapsclg.blob.core.windows.net/files/73/NoticeUpload/551c9ec7-4251-4a99-9b91-f96a751dab18.jpg'
                                    alt='School Header'
                                    style={{ width: '83%', marginLeft: '9%', height: 'auto' }}
                                />
                            </div>

                            <br />

                            {/* PROGRESS REPORT Banner */}
                            <div style={{ textAlign: 'center', marginBottom: '8px' }}>
                                <div className='brs-goldenrod-banner' style={{ width: '23%', marginLeft: '38%', height: '37px' }}>
                                    <h3 style={{ color: 'black', margin: 0, fontWeight: 'bold', fontSize: '16px' }}>PROGRESS REPORT</h3>
                                </div>
                            </div>

                            {/* Exam Name + Session Banner */}
                            <div style={{ marginTop: '6px', marginBottom: '6px' }}>
                                <div className='brs-goldenrod-banner' style={{ width: '100%', height: '46px' }}>
                                    <h3 style={{ color: 'black', margin: 0, fontWeight: 'bold', fontSize: '16px' }}>
                                        {examName} (SESSION : {year})
                                    </h3>
                                </div>
                            </div>

                            {/* Student Info Table */}
                            <table className='brs-info-table brs-table' style={{ border: 'none' }}>
                                <tbody>
                                    <tr>
                                        <td style={{ textAlign: 'left', width: '33%' }}>
                                            &nbsp;&nbsp;&nbsp;&nbsp;<b>Name : {report.amsT_FirstName}</b>
                                        </td>
                                        <td style={{ textAlign: 'left', width: '33%' }}>
                                            <b>
                                                Class &amp; Section : {report.asmcL_ClassName}/{report.asmC_SectionName}
                                            </b>
                                        </td>
                                        <td style={{ textAlign: 'left', width: '33%' }}>
                                            <b>Roll No : {report.amaY_RollNo || 'N/A'}</b>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style={{ textAlign: 'left' }}>
                                            <b>&nbsp;&nbsp;&nbsp;&nbsp;Admn. No. : {report.amsT_AdmNo}</b>
                                        </td>
                                        <td style={{ textAlign: 'left' }}>
                                            <b>Date of Birth : {formatDate(report.amsT_DOB)}</b>
                                        </td>
                                        <td style={{ textAlign: 'left' }}>
                                            <b>House : {(report as any).userName || 'N/A'}</b>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style={{ textAlign: 'left' }}>
                                            <b>
                                                &nbsp;&nbsp;&nbsp;&nbsp;Mother's Name :{' '}
                                                {report.amsT_MotherName || (report as any)._MotherName || 'N/A'}
                                            </b>
                                        </td>
                                        <td style={{ textAlign: 'left' }}>
                                            <b>Father's Name : {report.amsT_FatherName}</b>
                                        </td>
                                        <td />
                                    </tr>
                                </tbody>
                            </table>

                            {/* Marks Table */}
                            <table className='brs-table brs-marks-header' style={{ marginTop: '10px' }}>
                                <thead style={{ backgroundColor: 'GoldenRod', color: 'black' }}>
                                    <tr>
                                        <td style={{ textAlign: 'left', fontWeight: 'bold' }}>SUBJECTS</td>
                                        <td style={{ textAlign: 'center', fontWeight: 'bold' }}>Max Marks</td>
                                        {/* Sub-subject columns */}
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
                                    {report.sub_list
                                        ?.filter((mark) => {
                                            // Only show applicable subjects
                                            const subj = subjects.find((s) => s.ismS_Id === mark.ismS_Id);
                                            return subj?.eyceS_AplResultFlg !== false;
                                        })
                                        .map((mark) => {
                                            const subj = subjects.find((s) => s.ismS_Id === mark.ismS_Id);
                                            const showMarks = subj?.eyceS_MarksDisplayFlg !== false;
                                            const showGrade = subj?.eyceS_GradeDisplayFlg !== false;
                                            const isAbsent = mark.estmpS_PassFailFlg === 'AB';

                                            return (
                                                <tr key={mark.ismS_Id} style={{ backgroundColor: 'white', color: 'black' }}>
                                                    <td style={{ textAlign: 'left', fontWeight: 'bold' }}>
                                                        {subj?.ismS_SubjectName || 'N/A'}
                                                    </td>
                                                    <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{mark.estmpS_MaxMarks}</td>
                                                    {/* Sub-subject mark columns */}
                                                    {subSubjects.map((sub) => {
                                                        const ssm = subSubjectMarks.find(
                                                            (m) => m.EMSS_Id === sub.EMSS_Id && m.ISMS_Id === mark.ismS_Id
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
                                                    {/* Marks Obtained */}
                                                    <td style={{ textAlign: 'center', fontWeight: 'bold' }}>
                                                        {isAbsent ? 'AB' : showMarks ? (mark.estmpS_ObtainedMarks ?? '-') : '-'}
                                                    </td>
                                                    {/* Grade */}
                                                    <td style={{ textAlign: 'center', fontWeight: 'bold' }}>
                                                        {isAbsent ? 'AB' : showGrade ? mark.estmpS_ObtainedGrade || '-' : '-'}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                </tbody>
                            </table>

                            {/* Signatures Section */}
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'flex-end',
                                    textAlign: 'center',
                                    marginTop: '20px'
                                }}>
                                {/* Place & Date */}
                                <div style={{ flex: 1, textAlign: 'left' }}>
                                    <span style={{ fontSize: '16px', fontWeight: 'bold' }}>&nbsp;&nbsp;&nbsp;&nbsp;Place : Burnpur</span>
                                    <br />
                                    <span style={{ fontSize: '16px', fontWeight: 'bold' }}>
                                        &nbsp;&nbsp;&nbsp;&nbsp;Date : {todayFormatted}
                                    </span>
                                </div>

                                {/* Class Teacher */}
                                <div
                                    style={{
                                        flex: 1,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'flex-end'
                                    }}>
                                    <span style={{ fontSize: '16px', fontWeight: 'bold' }}>
                                        Signature of <br /> Class Teacher
                                    </span>
                                </div>

                                {/* Principal Signature Image */}
                                <div
                                    style={{
                                        flex: 1,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'flex-end'
                                    }}>
                                    <img
                                        src='https://vapsclg.blob.core.windows.net/files/73/NoticeUpload/14abfc5e-3e03-4eb9-a5e7-c2725944cc3d.png'
                                        alt='Principal Signature'
                                        style={{ width: '110px', height: 'auto', display: 'block' }}
                                    />
                                </div>

                                {/* Co-ordinator Signature */}
                                <div
                                    style={{
                                        flex: 1,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'flex-end'
                                    }}>
                                    <img
                                        src='https://vapsclg.blob.core.windows.net/files/73/NoticeUpload/8ff47850-8524-423c-92a7-30c37099e292.png'
                                        alt='Coordinator Signature'
                                        style={{ width: '120px', height: 'auto', transform: 'rotate(7deg)', display: 'block' }}
                                    />
                                    <span style={{ fontSize: '16px', fontWeight: 'bold', marginTop: '6px' }}>
                                        Signature of <br /> Co-ordinator
                                    </span>
                                </div>
                            </div>

                            {/* Page Break between students */}
                            {index < reportData.length - 1 && <div className='brs-page-break' />}
                        </div>
                    );
                })}
            </div>
        </>
    );
}
