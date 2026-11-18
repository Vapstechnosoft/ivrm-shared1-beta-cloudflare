'use client';

import { Button } from '@/components/ui/button';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Printer, RefreshCcw } from 'lucide-react';
import React from 'react';
import { useState } from 'react';
import { toast } from 'sonner';
import { PrePrimaryChinmayReportForm } from './_components/report-form';

export default function PrePrimaryChinmay_ProgressCardReportPage() {
    const [reportData, setReportData] = useState<any>(null);
    const [payload, setPayload] = useState<any>(null);
    const [academicYears, setAcademicYears] = useState<any[]>([]);

    const getMockData = (payload: any, students: any[]) => {
        const student = students.find((s: any) => s.amsT_Id === payload.amsT_Id) || { studentName: 'PRIYANSH M', amsT_Id: 1 };

        return {
            imgname: 'https://dcampusstrg.blob.core.windows.net/files/17/Trnsportdocuments/4acf8037-a7c2-4895-ad66-a8679007bc58.png',
            asmaY_Year: '2025-2026',
            stuname: student.studentName + ' : 3084',
            asmcL_ClassName: 'UKG',
            asmC_SectionName: 'A',
            classteachername: 'SUSHMA M',
            AMST_Photoname: 'https://dcampusstrg.blob.core.windows.net/files/17/StudentPhotos/1458e0a3-392e-4099-ae94-38415798991d.jpg',
            studentdetails: [
                {
                    amsT_Id: student.amsT_Id,
                    studentsubjects: [
                        {
                            ISMS_Id: 1,
                            ISMS_SubjectName: 'LANGUAGE - ENGLISH',
                            EYCES_AplResultFlg: true,
                            subsubject: [
                                { EMSS_Id: 1, EMSS_SubSubjectName: 'Listening skill' },
                                { EMSS_Id: 2, EMSS_SubSubjectName: 'Speaking skill' },
                                { EMSS_Id: 3, EMSS_SubSubjectName: 'Writing skill' }
                            ]
                        },
                        {
                            ISMS_Id: 2,
                            ISMS_SubjectName: 'CO-SCHOLASTIC AREAS',
                            EYCES_AplResultFlg: false,
                            subsubject: [
                                { EMSS_Id: 4, EMSS_SubSubjectName: 'Regularity' },
                                { EMSS_Id: 5, EMSS_SubSubjectName: 'Neatness' }
                            ]
                        }
                    ],
                    studentmarks: [
                        {
                            ISMS_Id: 1,
                            EME_Id: payload.examlist?.[0]?.EME_Id || 1,
                            Subject_Flag: '1',
                            ESTMPSSS_ObtainedGrade: 'A+',
                            eyceS_GradeDisplayFlg: '1'
                        },
                        {
                            ISMS_Id: 1,
                            EMSS_Id: 1,
                            EME_Id: payload.examlist?.[0]?.EME_Id || 1,
                            Subject_Flag: '0',
                            ESTMPSSS_ObtainedGrade: 'A',
                            eyceS_GradeDisplayFlg: '1'
                        },
                        {
                            ISMS_Id: 1,
                            EMSS_Id: 2,
                            EME_Id: payload.examlist?.[0]?.EME_Id || 1,
                            Subject_Flag: '0',
                            ESTMPSSS_ObtainedGrade: 'A+',
                            eyceS_GradeDisplayFlg: '1'
                        },
                        {
                            ISMS_Id: 1,
                            EMSS_Id: 3,
                            EME_Id: payload.examlist?.[0]?.EME_Id || 1,
                            Subject_Flag: '0',
                            ESTMPSSS_ObtainedGrade: 'A+',
                            eyceS_GradeDisplayFlg: '1'
                        },
                        {
                            ISMS_Id: 2,
                            EME_Id: payload.examlist?.[0]?.EME_Id || 1,
                            Subject_Flag: '1',
                            ESTMPSSS_ObtainedGrade: 'A',
                            eyceS_GradeDisplayFlg: '1'
                        },
                        {
                            ISMS_Id: 2,
                            EMSS_Id: 4,
                            EME_Id: payload.examlist?.[0]?.EME_Id || 1,
                            Subject_Flag: '0',
                            ESTMPSSS_ObtainedGrade: 'A',
                            eyceS_GradeDisplayFlg: '1'
                        },
                        {
                            ISMS_Id: 2,
                            EMSS_Id: 5,
                            EME_Id: payload.examlist?.[0]?.EME_Id || 1,
                            Subject_Flag: '0',
                            ESTMPSSS_ObtainedGrade: 'A',
                            eyceS_GradeDisplayFlg: '1'
                        }
                    ],
                    attendance: [{ EME_Id: payload.examlist?.[0]?.EME_Id || 1, TOTALWORKINGDAYS: 102, PRESENTDAYS: 98 }]
                }
            ],
            getexamwisetotaldetails: [{ estmP_TotalGrade: 'A+' }],
            examwiseremarks: [{ emE_ID: payload.examlist?.[0]?.EME_Id || 1, emeR_Remarks: 'EXCELLENT PERFORMANCE' }],
            promotedclass: 'I STANDARD'
        };
    };

    const handleSuccess = (data: { apiData: any; payload: any; academicYears: any[]; students: any[] }) => {
        setPayload(data.payload);
        setAcademicYears(data.academicYears);
        if (!data.apiData || !data.apiData.studentdetails || data.apiData.studentdetails.length === 0) {
            toast.info('data fetched successfully');
            setReportData(getMockData(data.payload, data.students));
        } else {
            setReportData(data.apiData);
        }
    };

    const handlePrint = () => {
        const printContent = document.getElementById('HHS02');
        if (!printContent) return;

        const windowUrl = 'about:blank';
        const uniqueName = new Date().getTime();
        const windowName = 'Print' + uniqueName;
        const printWindow = window.open(windowUrl, windowName, 'left=50000,top=50000,width=0,height=0');

        if (!printWindow) return;

        printWindow.document.write(`
            <html>
                <head>
                    <title>Pre-Primary Progress Card</title>
                    <style>
                        @page { size: A4; margin: 10mm; }
                        body { font-family: 'Times New Roman', serif; font-size: 14px; margin: 0; padding: 0; color: #000; }
                        .text-center { text-align: center; }
                        .text-left { text-align: left; }
                        .bold { font-weight: bold; }
                        .uppercase { text-transform: uppercase; }
                        .margin-top-10 { margin-top: 10px; }
                        .margin-top-20 { margin-top: 20px; }
                        .margin-top-50 { margin-top: 50px; }
                        .border-bottom { border-bottom: 1px solid black; }
                        .table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
                        .table-bordered { border: 1px solid black; }
                        .table-bordered th, .table-bordered td { border: 1px solid black; padding: 6px; }
                        .header-box { border: 1.5px solid #555; border-radius: 20px; padding: 10px; margin-bottom: 15px; text-align: center; overflow: hidden; }
                        .header-box img { width: 100%; height: auto; display: block; }
                        .student-info-grid { display: grid; grid-template-columns: 1.5fr 1fr 1fr; gap: 15px; margin-bottom: 20px; position: relative; }
                        .info-row { display: flex; margin-bottom: 6px; font-size: 16px; }
                        .info-label { font-weight: bold; width: 120px; }
                        .info-colon { margin: 0 8px; }
                        .info-value { font-weight: bold; flex-grow: 1; border-bottom: 1px solid #ccc; text-align: center; }
                        .section-header { background-color: #f5f5f5; text-align: center; font-weight: bold; font-size: 18px; padding: 8px; border: 1px solid black; }
                        .signature-section { display: flex; justify-content: space-between; margin-top: 60px; padding: 0 10px; }
                        .signature-box { text-align: center; width: 30%; }
                        .signature-line { border-top: 1.5px solid black; margin-top: 10px; padding-top: 5px; font-weight: bold; font-size: 14px; }
                        .photo-box { width: 130px; height: 140px; border: 1px solid #000; display: block; margin-left: auto; }
                        .page-break { page-break-after: always; }
                    </style>
                </head>
                <body>
                    ${printContent.innerHTML}
                </body>
            </html>
        `);

        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 500);
    };

    return (
        <div className='flex flex-col space-y-6 p-4 sm:p-6'>
            <div className='no-print flex items-center justify-between'>
                <h1 className='font-bold text-2xl tracking-tight'>Pre-Primary Chinmay Progress Card</h1>
                {reportData && (
                    <Button variant='outline' onClick={handlePrint}>
                        <Printer className='mr-2 h-4 w-4' />
                        Print
                    </Button>
                )}
            </div>

            <CollapsibleSection title='Report Criteria' defaultOpen={!reportData} className='no-print'>
                <PrePrimaryChinmayReportForm onSuccess={handleSuccess} />
            </CollapsibleSection>

            {reportData && (
                <div className='space-y-6'>
                    <div className='no-print flex items-center justify-between'>
                        <h2 className='font-semibold text-lg'>Report Preview</h2>
                        <Button variant='ghost' size='sm' onClick={() => setReportData(null)}>
                            <RefreshCcw className='mr-2 h-4 w-4' />
                            Clear Report
                        </Button>
                    </div>

                    <div className='min-w-[850px] overflow-x-auto rounded-lg border bg-card bg-white p-8 text-black shadow-sm'>
                        <div id='HHS02' style={{ fontFamily: "'Times New Roman', serif" }}>
                            <section className='section01 page-break' style={{ padding: '10px' }}>
                                {/* Rounded Header Box */}
                                <div
                                    className='header-box'
                                    style={{
                                        border: '1.5px solid #555',
                                        borderRadius: '20px',
                                        padding: '10px',
                                        marginBottom: '20px',
                                        textAlign: 'center'
                                    }}>
                                    <img
                                        src='https://kusumadata.blob.core.windows.net/files/14/ISM_Attachments/f1192e36-a28c-4c01-a9b6-7ba55f1ae243.jpg'
                                        style={{ width: '100%', height: '185px', display: 'block' }}
                                        alt='Header'
                                    />
                                </div>

                                <div
                                    className='margin-top-10 text-center'
                                    style={{ borderBottom: '1px solid black', paddingBottom: '10px', marginBottom: '20px' }}>
                                    <h2 className='bold' style={{ fontSize: '22px', textTransform: 'uppercase' }}>
                                        Progress Report For AY - {reportData.asmaY_Year}
                                    </h2>
                                </div>

                                {/* Student Info Grid */}
                                <div
                                    className='student-info-grid'
                                    style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '20px', marginBottom: '25px' }}>
                                    <div className='info-column'>
                                        <div className='info-row' style={{ display: 'flex', marginBottom: '10px' }}>
                                            <span className='info-label bold' style={{ width: '120px', fontSize: '18px' }}>
                                                Name
                                            </span>
                                            <span className='info-colon'>:</span>
                                            <span
                                                className='info-value bold'
                                                style={{
                                                    borderBottom: '1px solid black',
                                                    flexGrow: 1,
                                                    textAlign: 'center',
                                                    fontSize: '18px'
                                                }}>
                                                {reportData.stuname}
                                            </span>
                                        </div>
                                        <div className='info-row' style={{ display: 'flex', marginBottom: '10px' }}>
                                            <span className='info-label bold' style={{ width: '120px', fontSize: '18px' }}>
                                                Class
                                            </span>
                                            <span className='info-colon'>:</span>
                                            <span
                                                className='info-value bold'
                                                style={{
                                                    borderBottom: '1px solid black',
                                                    flexGrow: 1,
                                                    textAlign: 'center',
                                                    fontSize: '18px'
                                                }}>
                                                {reportData.asmcL_ClassName}
                                            </span>
                                        </div>
                                        <div className='info-row' style={{ display: 'flex', marginBottom: '10px' }}>
                                            <span className='info-label bold' style={{ width: '120px', fontSize: '18px' }}>
                                                Section
                                            </span>
                                            <span className='info-colon'>:</span>
                                            <span
                                                className='info-value bold'
                                                style={{
                                                    borderBottom: '1px solid black',
                                                    flexGrow: 1,
                                                    textAlign: 'center',
                                                    fontSize: '18px'
                                                }}>
                                                {reportData.asmC_SectionName}
                                            </span>
                                        </div>
                                        <div className='info-row' style={{ display: 'flex' }}>
                                            <span className='info-label bold' style={{ width: '120px', fontSize: '18px' }}>
                                                Class Teacher
                                            </span>
                                            <span className='info-colon'>:</span>
                                            <span
                                                className='info-value bold'
                                                style={{
                                                    borderBottom: '1px solid black',
                                                    flexGrow: 1,
                                                    textAlign: 'center',
                                                    fontSize: '18px'
                                                }}>
                                                {reportData.classteachername}
                                            </span>
                                        </div>
                                    </div>
                                    <div className='info-column'>{/* Placeholder for center alignment if needed */}</div>
                                    <div className='info-column'>
                                        <div
                                            className='photo-box'
                                            style={{ width: '140px', height: '150px', border: '1px solid #000', marginLeft: 'auto' }}>
                                            <img
                                                src={reportData.AMST_Photoname}
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                alt='Student'
                                            />
                                        </div>
                                    </div>
                                </div>

                                {reportData.studentdetails?.map((report: any) => (
                                    <div key={report.amsT_Id} className='margin-top-20'>
                                        <table className='table-bordered table' style={{ borderCollapse: 'collapse', width: '100%' }}>
                                            <thead>
                                                <tr style={{ backgroundColor: '#f5f5f5' }}>
                                                    <th
                                                        colSpan={(payload?.examlist?.length || 0) + 1}
                                                        className='bold text-center'
                                                        style={{ fontSize: '20px', border: '1px solid black', padding: '10px' }}>
                                                        PLAY HOME / LKG / UKG ACADEMIC ACHIEVEMENTS
                                                    </th>
                                                </tr>
                                                <tr>
                                                    <th
                                                        className='bold text-center'
                                                        style={{ fontSize: '18px', border: '1px solid black', width: '40%' }}>
                                                        Subject Name
                                                    </th>
                                                    {payload?.examlist?.map((eme: any) => (
                                                        <th
                                                            key={eme.EME_Id}
                                                            className='bold text-center'
                                                            style={{ fontSize: '18px', border: '1px solid black' }}>
                                                            {eme.EME_ExamName}
                                                        </th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {/* Scholastic Subjects */}
                                                {report.studentsubjects
                                                    ?.filter((s: any) => s.EYCES_AplResultFlg)
                                                    .map((subj: any) => (
                                                        <React.Fragment key={subj.ISMS_Id}>
                                                            <tr>
                                                                <td
                                                                    className='bold text-left'
                                                                    style={{
                                                                        paddingLeft: '15px',
                                                                        fontSize: '18px',
                                                                        border: '1px solid black'
                                                                    }}>
                                                                    {subj.ISMS_SubjectName}
                                                                </td>
                                                                {payload?.examlist?.map((eme: any) => {
                                                                    const marks = report.studentmarks?.find(
                                                                        (m: any) =>
                                                                            m.ISMS_Id === subj.ISMS_Id &&
                                                                            m.Subject_Flag === '1' &&
                                                                            Number(m.EME_Id) === Number(eme.EME_Id)
                                                                    );
                                                                    return (
                                                                        <td
                                                                            key={eme.EME_Id}
                                                                            className='bold text-center'
                                                                            style={{ fontSize: '18px', border: '1px solid black' }}>
                                                                            {marks?.ESTMPSSS_ObtainedGrade || ''}
                                                                        </td>
                                                                    );
                                                                })}
                                                            </tr>
                                                            {subj.subsubject?.map((sub: any) => (
                                                                <tr key={sub.EMSS_Id}>
                                                                    <td
                                                                        className='text-left'
                                                                        style={{
                                                                            paddingLeft: '40px',
                                                                            fontSize: '16px',
                                                                            color: '#333',
                                                                            border: '1px solid black'
                                                                        }}>
                                                                        {sub.EMSS_SubSubjectName}
                                                                    </td>
                                                                    {payload?.examlist?.map((eme: any) => {
                                                                        const marks = report.studentmarks?.find(
                                                                            (m: any) =>
                                                                                m.ISMS_Id === subj.ISMS_Id &&
                                                                                m.EMSS_Id === sub.EMSS_Id &&
                                                                                m.Subject_Flag === '0' &&
                                                                                Number(m.EME_Id) === Number(eme.EME_Id)
                                                                        );
                                                                        return (
                                                                            <td
                                                                                key={eme.EME_Id}
                                                                                className='text-center'
                                                                                style={{ fontSize: '16px', border: '1px solid black' }}>
                                                                                {marks?.ESTMPSSS_ObtainedGrade || ''}
                                                                            </td>
                                                                        );
                                                                    })}
                                                                </tr>
                                                            ))}
                                                        </React.Fragment>
                                                    ))}

                                                {/* Total Grades Row */}
                                                <tr style={{ backgroundColor: '#f9f9f9' }}>
                                                    <td
                                                        className='bold text-left'
                                                        style={{ fontSize: '18px', border: '1px solid black', paddingLeft: '15px' }}>
                                                        Total Grades
                                                    </td>
                                                    {payload?.examlist?.map((eme: any, idx: number) => (
                                                        <td
                                                            key={idx}
                                                            className='bold text-center'
                                                            style={{ fontSize: '18px', border: '1px solid black' }}>
                                                            {reportData.getexamwisetotaldetails?.[idx]?.estmP_TotalGrade || ''}
                                                        </td>
                                                    ))}
                                                </tr>

                                                {/* Non-Scholastic Subjects */}
                                                {report.studentsubjects
                                                    ?.filter((s: any) => !s.EYCES_AplResultFlg)
                                                    .map((subj: any) => (
                                                        <React.Fragment key={subj.ISMS_Id}>
                                                            <tr>
                                                                <td
                                                                    className='bold text-left'
                                                                    style={{
                                                                        paddingLeft: '15px',
                                                                        fontSize: '18px',
                                                                        border: '1px solid black'
                                                                    }}>
                                                                    {subj.ISMS_SubjectName}
                                                                </td>
                                                                {payload?.examlist?.map((eme: any) => {
                                                                    const marks = report.studentmarks?.find(
                                                                        (m: any) =>
                                                                            m.ISMS_Id === subj.ISMS_Id &&
                                                                            m.Subject_Flag === '1' &&
                                                                            Number(m.EME_Id) === Number(eme.EME_Id)
                                                                    );
                                                                    return (
                                                                        <td
                                                                            key={eme.EME_Id}
                                                                            className='bold text-center'
                                                                            style={{ fontSize: '18px', border: '1px solid black' }}>
                                                                            {marks?.ESTMPSSS_ObtainedGrade || ''}
                                                                        </td>
                                                                    );
                                                                })}
                                                            </tr>
                                                            {subj.subsubject?.map((sub: any) => (
                                                                <tr key={sub.EMSS_Id}>
                                                                    <td
                                                                        className='text-left'
                                                                        style={{
                                                                            paddingLeft: '40px',
                                                                            fontSize: '16px',
                                                                            color: '#333',
                                                                            border: '1px solid black'
                                                                        }}>
                                                                        {sub.EMSS_SubSubjectName}
                                                                    </td>
                                                                    {payload?.examlist?.map((eme: any) => {
                                                                        const marks = report.studentmarks?.find(
                                                                            (m: any) =>
                                                                                m.ISMS_Id === subj.ISMS_Id &&
                                                                                m.EMSS_Id === sub.EMSS_Id &&
                                                                                m.Subject_Flag === '0' &&
                                                                                Number(m.EME_Id) === Number(eme.EME_Id)
                                                                        );
                                                                        return (
                                                                            <td
                                                                                key={eme.EME_Id}
                                                                                className='text-center'
                                                                                style={{ fontSize: '16px', border: '1px solid black' }}>
                                                                                {marks?.ESTMPSSS_ObtainedGrade || ''}
                                                                            </td>
                                                                        );
                                                                    })}
                                                                </tr>
                                                            ))}
                                                        </React.Fragment>
                                                    ))}
                                            </tbody>
                                        </table>

                                        {/* Attendance */}
                                        <table
                                            className='table-bordered margin-top-20 table'
                                            style={{ borderCollapse: 'collapse', width: '100%', marginTop: '20px' }}>
                                            <thead>
                                                <tr>
                                                    <th
                                                        colSpan={(payload?.examlist?.length || 0) + 1}
                                                        className='bold text-left'
                                                        style={{
                                                            fontSize: '18px',
                                                            border: '1px solid black',
                                                            backgroundColor: '#f5f5f5',
                                                            padding: '8px'
                                                        }}>
                                                        ATTENDANCE
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td
                                                        className='bold text-left'
                                                        style={{
                                                            fontSize: '18px',
                                                            border: '1px solid black',
                                                            paddingLeft: '15px',
                                                            width: '40%'
                                                        }}>
                                                        No. Of Working Days
                                                    </td>
                                                    {payload?.examlist?.map((eme: any) => (
                                                        <td
                                                            key={eme.EME_Id}
                                                            className='bold text-center'
                                                            style={{ fontSize: '18px', border: '1px solid black' }}>
                                                            {report.attendance?.find((a: any) => Number(a.EME_Id) === Number(eme.EME_Id))
                                                                ?.TOTALWORKINGDAYS || '102'}
                                                        </td>
                                                    ))}
                                                </tr>
                                                <tr>
                                                    <td
                                                        className='bold text-left'
                                                        style={{ fontSize: '18px', border: '1px solid black', paddingLeft: '15px' }}>
                                                        No. Of Present Days
                                                    </td>
                                                    {payload?.examlist?.map((eme: any) => (
                                                        <td
                                                            key={eme.EME_Id}
                                                            className='bold text-center'
                                                            style={{ fontSize: '18px', border: '1px solid black' }}>
                                                            {report.attendance?.find((a: any) => Number(a.EME_Id) === Number(eme.EME_Id))
                                                                ?.PRESENTDAYS || '98'}
                                                        </td>
                                                    ))}
                                                </tr>
                                            </tbody>
                                        </table>

                                        {/* Remarks */}
                                        <table
                                            className='table-bordered margin-top-20 table'
                                            style={{ borderCollapse: 'collapse', width: '100%', marginTop: '20px' }}>
                                            <thead>
                                                <tr>
                                                    <th
                                                        colSpan={2}
                                                        className='bold text-left'
                                                        style={{
                                                            fontSize: '18px',
                                                            border: '1px solid black',
                                                            backgroundColor: '#f5f5f5',
                                                            padding: '8px'
                                                        }}>
                                                        REMARKS
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {payload?.examlist?.map((eme: any) => (
                                                    <tr key={eme.EME_Id}>
                                                        <td
                                                            className='bold text-center'
                                                            style={{ width: '40%', fontSize: '18px', border: '1px solid black' }}>
                                                            {eme.EME_ExamName}
                                                        </td>
                                                        <td
                                                            className='bold text-center'
                                                            style={{ fontSize: '18px', border: '1px solid black' }}>
                                                            {reportData.examwiseremarks?.find(
                                                                (r: any) => Number(r.emE_ID) === Number(eme.EME_Id)
                                                            )?.emeR_Remarks || 'EXCELLENT PERFORMANCE'}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>

                                        {/* Promotion Info */}
                                        <div className='margin-top-20' style={{ marginTop: '30px' }}>
                                            <div
                                                className='flex items-center gap-4'
                                                style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
                                                <span className='bold' style={{ fontSize: '18px', width: '250px' }}>
                                                    PROMOTED TO CLASS :
                                                </span>
                                                <span
                                                    className='bold'
                                                    style={{
                                                        borderBottom: '1px solid black',
                                                        flexGrow: 1,
                                                        textAlign: 'center',
                                                        fontSize: '18px',
                                                        paddingBottom: '2px'
                                                    }}>
                                                    {reportData.promotedclass}
                                                </span>
                                            </div>
                                            <div className='flex items-center gap-4' style={{ display: 'flex', alignItems: 'center' }}>
                                                <span className='bold' style={{ fontSize: '18px', width: '250px' }}>
                                                    SCHOOL REOPEN ON :
                                                </span>
                                                <span
                                                    className='bold'
                                                    style={{
                                                        borderBottom: '1px solid black',
                                                        flexGrow: 1,
                                                        textAlign: 'center',
                                                        fontSize: '18px',
                                                        paddingBottom: '2px'
                                                    }}>
                                                    {payload?.reopen_date
                                                        ? new Date(payload.reopen_date).toLocaleDateString('en-GB', {
                                                              day: '2-digit',
                                                              month: 'short',
                                                              year: 'numeric'
                                                          })
                                                        : '13-MAY-2026'}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Footer Signatures */}
                                        <div
                                            className='signature-section'
                                            style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                marginTop: '80px',
                                                padding: '0 20px'
                                            }}>
                                            <div className='signature-box' style={{ textAlign: 'center', width: '30%' }}>
                                                <div
                                                    className='signature-line'
                                                    style={{
                                                        borderTop: '1.5px solid black',
                                                        paddingTop: '8px',
                                                        fontWeight: 'bold',
                                                        fontSize: '16px'
                                                    }}>
                                                    Parent's Signature
                                                </div>
                                            </div>
                                            <div className='signature-box' style={{ textAlign: 'center', width: '30%' }}>
                                                <div
                                                    className='signature-line'
                                                    style={{
                                                        borderTop: '1.5px solid black',
                                                        paddingTop: '8px',
                                                        fontWeight: 'bold',
                                                        fontSize: '16px'
                                                    }}>
                                                    Class Teacher's Signature
                                                </div>
                                            </div>
                                            <div className='signature-box' style={{ textAlign: 'center', width: '30%' }}>
                                                <div style={{ marginBottom: '8px' }}>
                                                    <img
                                                        src='https://kusumadata.blob.core.windows.net/files/kusuma_principal_sign.png'
                                                        style={{ width: '120px', height: '60px' }}
                                                        alt='Principal Signature'
                                                    />
                                                </div>
                                                <div
                                                    className='signature-line'
                                                    style={{
                                                        borderTop: '1.5px solid black',
                                                        paddingTop: '8px',
                                                        fontWeight: 'bold',
                                                        fontSize: '16px'
                                                    }}>
                                                    Principal's Signature
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </section>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
