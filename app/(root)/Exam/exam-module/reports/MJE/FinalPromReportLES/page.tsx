'use client';

import { Button } from '@/components/ui/button';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { RefreshCcw } from 'lucide-react';
import React, { useState } from 'react';
import { FinalPromReportLESForm } from './_components/report-form';

export default function FinalPromReportLESPage() {
    const [reportData, setReportData] = useState<any>(null);
    const [payload, setPayload] = useState<any>(null);
    const [academicYears, setAcademicYears] = useState<any[]>([]);

    const getSampleReportData = (payload: any) => {
        const exams = payload.examlist || [];

        return {
            imgname: 'https://kusumadata.blob.core.windows.net/files/14/ISM_Attachments/f1192e36-a28c-4c01-a9b6-7ba55f1ae243.jpg',
            getgroupdetails: [
                { empG_DistplayName: 'FIRST SEMESTER', empsG_MarksValue: 120, empG_GroupName: 'G1' },
                { empG_DistplayName: 'SECOND SEMESTER', empsG_MarksValue: 120, empG_GroupName: 'G2' }
            ],
            getgroupexamdetails: exams.flatMap((e: any, idx: number) => {
                const group = idx < exams.length / 2 ? 'FIRST SEMESTER' : 'SECOND SEMESTER';
                return [
                    {
                        empG_DistplayName: group,
                        emE_Id: e.emE_Id,
                        emE_ExamName: e.emE_ExamName,
                        emE_ExamCode: e.emE_ExamCode || e.emE_ExamName,
                        empsgE_ForMaxMarkrs: 60,
                        empG_GroupName: idx < exams.length / 2 ? 'G1' : 'G2'
                    }
                ];
            }),
            studentdetails: [
                {
                    AMST_Id: 3084,
                    studentname: 'PRIYANSH M',
                    classname: payload.asmcL_Id === 1 ? 'UKG' : 'I',
                    sectionname: 'A',
                    admno: '3084',
                    dob: '2017-09-28',
                    TotalMarks: 342,
                    TotalPercentage: 95,
                    SectionRank: '1st',
                    ClassRank: '1st',
                    remarks: 'OUTSTANDING PERFORMANCE',
                    promotedclass: 'I STANDARD',
                    PASR_FatherChurchAffiliation: 'CHURCH OF SOUTH INDIA',
                    studentsubjects: [
                        {
                            ISMS_Id: 1,
                            ISMS_SubjectName: 'ENGLISH',
                            EMPS_AppToResultFlg: true,
                            EYCES_MarksDisplayFlg: true,
                            ESTMPPS_ObtainedMarks: 58,
                            ESTMPPS_ObtainedGrade: 'A+'
                        },
                        {
                            ISMS_Id: 2,
                            ISMS_SubjectName: 'KANNADA',
                            EMPS_AppToResultFlg: true,
                            EYCES_MarksDisplayFlg: true,
                            ESTMPPS_ObtainedMarks: 56,
                            ESTMPPS_ObtainedGrade: 'A+'
                        },
                        {
                            ISMS_Id: 3,
                            ISMS_SubjectName: 'MATHEMATICS',
                            EMPS_AppToResultFlg: true,
                            EYCES_MarksDisplayFlg: true,
                            ESTMPPS_ObtainedMarks: 60,
                            ESTMPPS_ObtainedGrade: 'O'
                        },
                        {
                            ISMS_Id: 4,
                            ISMS_SubjectName: 'EVS',
                            EMPS_AppToResultFlg: true,
                            EYCES_MarksDisplayFlg: true,
                            ESTMPPS_ObtainedMarks: 57,
                            ESTMPPS_ObtainedGrade: 'A+'
                        },
                        {
                            ISMS_Id: 5,
                            ISMS_SubjectName: 'G.K',
                            EMPS_AppToResultFlg: true,
                            EYCES_MarksDisplayFlg: true,
                            ESTMPPS_ObtainedMarks: 55,
                            ESTMPPS_ObtainedGrade: 'A+'
                        },
                        {
                            ISMS_Id: 6,
                            ISMS_SubjectName: 'DRAWING',
                            EMPS_AppToResultFlg: true,
                            EYCES_MarksDisplayFlg: true,
                            ESTMPPS_ObtainedMarks: 56,
                            ESTMPPS_ObtainedGrade: 'A+'
                        },
                        {
                            ISMS_Id: 10,
                            ISMS_SubjectName: 'Computer',
                            EMPS_AppToResultFlg: false,
                            EYCES_MarksDisplayFlg: false,
                            ESTMPPS_ObtainedGrade: 'A+'
                        },
                        {
                            ISMS_Id: 11,
                            ISMS_SubjectName: 'Physical Education',
                            EMPS_AppToResultFlg: false,
                            EYCES_MarksDisplayFlg: false,
                            ESTMPPS_ObtainedGrade: 'A'
                        }
                    ],
                    studentmarks: exams.flatMap((e: any, idx: number) => {
                        const group = idx < exams.length / 2 ? 'FIRST SEMESTER' : 'SECOND SEMESTER';
                        return [
                            {
                                ISMS_Id: 1,
                                EME_Id: e.emE_Id,
                                EMPSG_DisplayName: group,
                                ObtainedMarks: 25 + (idx % 5),
                                ObtainedGrade: 'A+',
                                eyceS_MarksDisplayFlg: '1',
                                eyceS_GradeDisplayFlg: '1'
                            },
                            {
                                ISMS_Id: 2,
                                EME_Id: e.emE_Id,
                                EMPSG_DisplayName: group,
                                ObtainedMarks: 24 + (idx % 5),
                                ObtainedGrade: 'A+',
                                eyceS_MarksDisplayFlg: '1',
                                eyceS_GradeDisplayFlg: '1'
                            },
                            {
                                ISMS_Id: 3,
                                EME_Id: e.emE_Id,
                                EMPSG_DisplayName: group,
                                ObtainedMarks: 28 + (idx % 2),
                                ObtainedGrade: 'O',
                                eyceS_MarksDisplayFlg: '1',
                                eyceS_GradeDisplayFlg: '1'
                            },
                            {
                                ISMS_Id: 4,
                                EME_Id: e.emE_Id,
                                EMPSG_DisplayName: group,
                                ObtainedMarks: 26 + (idx % 4),
                                ObtainedGrade: 'A+',
                                eyceS_MarksDisplayFlg: '1',
                                eyceS_GradeDisplayFlg: '1'
                            },
                            {
                                ISMS_Id: 5,
                                EME_Id: e.emE_Id,
                                EMPSG_DisplayName: group,
                                ObtainedMarks: 22 + (idx % 8),
                                ObtainedGrade: 'A+',
                                eyceS_MarksDisplayFlg: '1',
                                eyceS_GradeDisplayFlg: '1'
                            },
                            {
                                ISMS_Id: 6,
                                EME_Id: e.emE_Id,
                                EMPSG_DisplayName: group,
                                ObtainedMarks: 25 + (idx % 3),
                                ObtainedGrade: 'A+',
                                eyceS_MarksDisplayFlg: '1',
                                eyceS_GradeDisplayFlg: '1'
                            },
                            {
                                ISMS_Id: 10,
                                EME_Id: e.emE_Id,
                                EMPSG_DisplayName: group,
                                ObtainedGrade: 'A+',
                                eyceS_MarksDisplayFlg: '0',
                                eyceS_GradeDisplayFlg: '1'
                            },
                            {
                                ISMS_Id: 11,
                                EME_Id: e.emE_Id,
                                EMPSG_DisplayName: group,
                                ObtainedGrade: 'A',
                                eyceS_MarksDisplayFlg: '0',
                                eyceS_GradeDisplayFlg: '1'
                            }
                        ];
                    }),
                    student_marks: exams.flatMap((e: any, idx: number) => {
                        const group = idx < exams.length / 2 ? 'FIRST SEMESTER' : 'SECOND SEMESTER';
                        return [{ EME_Id: e.emE_Id, EMPSG_DisplayName: group, ObtainedMarks: 150 + idx * 2 }];
                    })
                }
            ],
            clastechname: 'AMRUTA AVINASH BELAVADE',
            getexamwisetotaldetails: exams.map((e: any) => ({
                amsT_Id: 3084,
                emE_Id: e.emE_Id,
                estmP_Percentage: 95
            })),
            work_attendence: [{ AMST_Id: 3084, TotalSchoolDays: 241, Total_Percentage: 100 }],
            present_attendence: [{ AMST_Id: 3084, TotalPresentDays: 235, Total_Percentage: 97.5 }]
        };
    };

    const [shouldPrint, setShouldPrint] = useState(false);

    const handleSuccess = (data: { apiData: any; payload: any; academicYears: any[]; type?: string }) => {
        setPayload(data.payload);
        setAcademicYears(data.academicYears);
        if (!data.apiData || !data.apiData.studentdetails || data.apiData.studentdetails.length === 0) {
            setReportData(getSampleReportData(data.payload));
        } else {
            setReportData(data.apiData);
        }
        if (data.type === 'print') {
            setShouldPrint(true);
        } else {
            setShouldPrint(false);
        }
    };

    React.useEffect(() => {
        if (shouldPrint && reportData) {
            handlePrint();
            setShouldPrint(false);
        }
    }, [shouldPrint, reportData]);

    const handlePrint = () => {
        const printContent = document.getElementById('FinalPromLESReport');
        if (!printContent) return;

        const windowUrl = 'about:blank';
        const uniqueName = new Date().getTime();
        const windowName = 'Print' + uniqueName;
        const printWindow = window.open(windowUrl, windowName, 'left=50000,top=50000,width=0,height=0');

        if (!printWindow) return;

        printWindow.document.write(`
            <html>
                <head>
                    <title>Final Promotion Report LES</title>
                    <style>
                        @page { size: A4; margin: 10mm; }
                        body { font-family: 'Times New Roman', serif; font-size: 13px; margin: 0; padding: 0; color: #000; }
                        .text-center { text-align: center; }
                        .text-left { text-align: left; }
                        .bold { font-weight: bold; }
                        .uppercase { text-transform: uppercase; }
                        .margin-top-10 { margin-top: 10px; }
                        .margin-top-20 { margin-top: 20px; }
                        .margin-bottom-10 { margin-bottom: 10px; }
                        .padding-top-60 { padding-top: 60px; }
                        .border-bottom { border-bottom: 1px solid black; }
                        .border-bottom-dotted { border-bottom: 1px dotted black; }
                        .border-top { border-top: 1px solid black; }
                        .table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
                        .table th, .table td { border: 1px solid black !important; padding: 5px; }
                        .header-img { width: 100%; height: auto; display: block; margin-bottom: 10px; }
                        .student-info-row { display: flex; flex-wrap: wrap; margin-bottom: 15px; }
                        .student-info-col { flex: 1; min-width: 200px; padding-right: 10px; }
                        .student-info-item { display: flex; margin-bottom: 4px; font-size: 14px; }
                        .student-info-label { font-weight: bold; width: 120px; flex-shrink: 0; }
                        .student-info-colon { margin: 0 5px; }
                        .student-info-value { font-weight: bold; flex-grow: 1; border-bottom: 1px solid black; text-align: center; }
                        .page-break { page-break-before: always; }
                        .signature-section { display: flex; justify-content: space-between; margin-top: 60px; }
                        .sig-box { text-align: center; width: 30%; }
                        .sig-line { border-top: 1px solid black; padding-top: 5px; font-weight: bold; }
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

    const getGroupWiseExams = () => {
        if (!reportData?.getgroupdetails || !reportData?.getgroupexamdetails) return [];
        const list: any[] = [];
        reportData.getgroupdetails.forEach((grp: any) => {
            const groupExams = reportData.getgroupexamdetails.filter((e: any) => e.empG_DistplayName === grp.empG_DistplayName);
            groupExams.forEach((ge: any) => {
                list.push({
                    ...ge,
                    EMPG_DistplayName: grp.empG_DistplayName,
                    examnamedisplay: ge.emE_ExamCode || ge.emE_ExamName
                });
            });
        });
        return list;
    };

    const groupWiseExamList = getGroupWiseExams();

    return (
        <div className='flex flex-col space-y-6 p-4 sm:p-6'>
            <div className='no-print flex items-center justify-between'>
                <h1 className='font-bold text-2xl tracking-tight'>Final Promotion Report LES</h1>
            </div>

            <CollapsibleSection title='Report Criteria' defaultOpen={!reportData} className='no-print'>
                <FinalPromReportLESForm onSuccess={handleSuccess} />
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
                        <div id='FinalPromLESReport' style={{ fontFamily: "'Times New Roman', serif" }}>
                            {reportData.studentdetails?.map((report: any, index: number) => (
                                <div key={report.AMST_Id} className={index > 0 ? 'page-break margin-top-20' : 'margin-top-10'}>
                                    {/* Header Section */}
                                    <div className='header margin-bottom-10 text-center'>
                                        {report.classname.trim().includes('PLAYHOME') ||
                                        report.classname.trim().includes('LKG') ||
                                        report.classname.trim().includes('UKG') ? (
                                            <img
                                                src='https://kusumadata.blob.core.windows.net/files/16/ISM_Attachments/748268cb-8b65-435e-bba1-b4640f331fd9.jpg'
                                                className='header-img'
                                                alt='Header'
                                            />
                                        ) : (
                                            <img
                                                src='https://kusumadata.blob.core.windows.net/files/16/ISM_Attachments/748268cb-8b65-435e-bba1-b4640f331fd9.jpg'
                                                className='header-img'
                                                alt='Header'
                                            />
                                        )}
                                    </div>

                                    {/* Student Info Section */}
                                    <div className='student-info-row' style={{ display: 'flex', flexWrap: 'wrap', marginBottom: '15px' }}>
                                        <div className='student-info-col' style={{ flex: '1.5', minWidth: '350px' }}>
                                            <div className='student-info-item' style={{ display: 'flex', marginBottom: '8px' }}>
                                                <span className='student-info-label bold uppercase' style={{ width: '130px' }}>
                                                    NAME
                                                </span>
                                                <span className='student-info-colon'>:</span>
                                                <span
                                                    className='student-info-value bold'
                                                    style={{
                                                        textTransform: 'capitalize',
                                                        borderBottom: '1px solid black',
                                                        flexGrow: 1,
                                                        textAlign: 'center'
                                                    }}>
                                                    {report.studentname.toLowerCase()}
                                                </span>
                                            </div>
                                            <div className='student-info-item' style={{ display: 'flex', marginBottom: '8px' }}>
                                                <span className='student-info-label bold uppercase' style={{ width: '130px' }}>
                                                    CLASS TEACHER
                                                </span>
                                                <span className='student-info-colon'>:</span>
                                                <span
                                                    className='student-info-value bold'
                                                    style={{
                                                        textTransform: 'capitalize',
                                                        borderBottom: '1px solid black',
                                                        flexGrow: 1,
                                                        textAlign: 'center'
                                                    }}>
                                                    {reportData.clastechname.toLowerCase()}
                                                </span>
                                            </div>
                                        </div>
                                        <div className='student-info-col' style={{ flex: '0.8', minWidth: '180px' }}>
                                            <div className='student-info-item' style={{ display: 'flex', marginBottom: '8px' }}>
                                                <span className='student-info-label bold uppercase' style={{ width: '80px' }}>
                                                    CLASS
                                                </span>
                                                <span className='student-info-colon'>:</span>
                                                <span
                                                    className='student-info-value bold'
                                                    style={{ borderBottom: '1px solid black', flexGrow: 1, textAlign: 'center' }}>
                                                    {report.classname}
                                                </span>
                                            </div>
                                            <div className='student-info-item' style={{ display: 'flex', marginBottom: '8px' }}>
                                                <span className='student-info-label bold uppercase' style={{ width: '80px' }}>
                                                    SECTION
                                                </span>
                                                <span className='student-info-colon'>:</span>
                                                <span
                                                    className='student-info-value bold'
                                                    style={{ borderBottom: '1px solid black', flexGrow: 1, textAlign: 'center' }}>
                                                    {report.sectionname}
                                                </span>
                                            </div>
                                        </div>
                                        <div className='student-info-col' style={{ flex: '1', minWidth: '220px' }}>
                                            <div className='student-info-item' style={{ display: 'flex', marginBottom: '8px' }}>
                                                <span className='student-info-label bold uppercase' style={{ width: '100px' }}>
                                                    ADM.NO
                                                </span>
                                                <span className='student-info-colon'>:</span>
                                                <span
                                                    className='student-info-value bold'
                                                    style={{ borderBottom: '1px solid black', flexGrow: 1, textAlign: 'center' }}>
                                                    {report.admno}
                                                </span>
                                            </div>
                                            <div className='student-info-item' style={{ display: 'flex', marginBottom: '8px' }}>
                                                <span className='student-info-label bold uppercase' style={{ width: '100px' }}>
                                                    D.O.B
                                                </span>
                                                <span className='student-info-colon'>:</span>
                                                <span
                                                    className='student-info-value bold'
                                                    style={{ borderBottom: '1px solid black', flexGrow: 1, textAlign: 'center' }}>
                                                    {report.dob
                                                        ? new Date(report.dob).toLocaleDateString('en-GB', {
                                                              day: '2-digit',
                                                              month: 'short',
                                                              year: 'numeric'
                                                          })
                                                        : ''}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Marks Table */}
                                    <table
                                        className='table'
                                        style={{ border: '1px solid black', width: '100%', borderCollapse: 'collapse' }}>
                                        <thead>
                                            <tr>
                                                <th
                                                    rowSpan={2}
                                                    className='bold text-center'
                                                    style={{ width: '180px', border: '1px solid black' }}>
                                                    Subject Name
                                                </th>
                                                {reportData.getgroupdetails?.map((grp: any, idx: number) => (
                                                    <th
                                                        key={idx}
                                                        colSpan={
                                                            reportData.getgroupexamdetails?.filter(
                                                                (e: any) => e.empG_DistplayName === grp.empG_DistplayName
                                                            ).length
                                                        }
                                                        className='bold text-center'
                                                        style={{ border: '1px solid black' }}>
                                                        {grp.empG_DistplayName} <br /> ({grp.empsG_MarksValue} Marks)
                                                    </th>
                                                ))}
                                                {payload?.overAlltotal && (
                                                    <th rowSpan={2} className='bold text-center' style={{ border: '1px solid black' }}>
                                                        Grand Total
                                                    </th>
                                                )}
                                                {payload?.overAlltotal && (
                                                    <th rowSpan={2} className='bold text-center' style={{ border: '1px solid black' }}>
                                                        Grade
                                                    </th>
                                                )}
                                            </tr>
                                            <tr>
                                                {groupWiseExamList.map((grpexam: any, idx: number) => (
                                                    <th key={idx} className='bold text-center' style={{ border: '1px solid black' }}>
                                                        {grpexam.examnamedisplay} <br />({grpexam.EMPSGE_ForMaxMarkrs})
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {/* Scholastic Subjects */}
                                            {report.studentsubjects
                                                ?.filter((s: any) => s.EMPS_AppToResultFlg)
                                                .map((subj: any) => (
                                                    <tr key={subj.ISMS_Id}>
                                                        <td
                                                            className='bold text-left'
                                                            style={{ paddingLeft: '8px', border: '1px solid black' }}>
                                                            {subj.ISMS_SubjectName}
                                                        </td>
                                                        {groupWiseExamList.map((grpexam: any, idx: number) => {
                                                            const marks = report.studentmarks?.find(
                                                                (m: any) =>
                                                                    m.ISMS_Id === subj.ISMS_Id &&
                                                                    m.EME_Id === grpexam.emE_Id &&
                                                                    m.EMPSG_DisplayName === grpexam.EMPG_DistplayName
                                                            );
                                                            return (
                                                                <td
                                                                    key={idx}
                                                                    className='bold text-center'
                                                                    style={{ border: '1px solid black' }}>
                                                                    {marks
                                                                        ? marks.eyceS_MarksDisplayFlg === '1'
                                                                            ? marks.ObtainedMarks
                                                                            : marks.eyceS_GradeDisplayFlg === '1'
                                                                              ? marks.ObtainedGrade
                                                                              : ''
                                                                        : ''}
                                                                </td>
                                                            );
                                                        })}
                                                        {payload?.overAlltotal && (
                                                            <td className='bold text-center' style={{ border: '1px solid black' }}>
                                                                {subj.EYCES_MarksDisplayFlg ? subj.ESTMPPS_ObtainedMarks : ''}
                                                            </td>
                                                        )}
                                                        {payload?.overAlltotal && (
                                                            <td className='bold text-center' style={{ border: '1px solid black' }}>
                                                                {subj.ESTMPPS_ObtainedGrade}
                                                            </td>
                                                        )}
                                                    </tr>
                                                ))}

                                            {/* TOTAL Row */}
                                            <tr>
                                                <td
                                                    className='bold text-left uppercase'
                                                    style={{ paddingLeft: '8px', border: '1px solid black' }}>
                                                    TOTAL
                                                </td>
                                                {groupWiseExamList.map((grpexam: any, idx: number) => {
                                                    const totalMarks = report.student_marks?.find(
                                                        (m: any) =>
                                                            m.EME_Id === grpexam.emE_Id && m.EMPSG_DisplayName === grpexam.EMPG_DistplayName
                                                    );
                                                    return (
                                                        <td key={idx} className='bold text-center' style={{ border: '1px solid black' }}>
                                                            {totalMarks?.ObtainedMarks || ''}
                                                        </td>
                                                    );
                                                })}
                                                {payload?.overAlltotal && (
                                                    <td className='bold text-center' style={{ border: '1px solid black' }}>
                                                        {report.TotalMarks}
                                                    </td>
                                                )}
                                                {payload?.overAlltotal && (
                                                    <td className='bold text-center' style={{ border: '1px solid black' }}></td>
                                                )}
                                            </tr>

                                            {/* PERCENTAGE Row */}
                                            <tr>
                                                <td
                                                    className='bold text-left uppercase'
                                                    style={{ paddingLeft: '8px', border: '1px solid black' }}>
                                                    PERCENTAGE
                                                </td>
                                                {groupWiseExamList.map((grpexam: any, idx: number) => {
                                                    const per = reportData.getexamwisetotaldetails?.find(
                                                        (p: any) => p.emE_Id === grpexam.emE_Id && p.amsT_Id === report.AMST_Id
                                                    );
                                                    return (
                                                        <td key={idx} className='bold text-center' style={{ border: '1px solid black' }}>
                                                            {per ? `${per.estmP_Percentage} %` : ''}
                                                        </td>
                                                    );
                                                })}
                                                {payload?.overAlltotal && (
                                                    <td className='bold text-center' style={{ border: '1px solid black' }}>
                                                        {report.TotalPercentage} %
                                                    </td>
                                                )}
                                                {payload?.overAlltotal && (
                                                    <td className='bold text-center' style={{ border: '1px solid black' }}></td>
                                                )}
                                            </tr>

                                            {/* Rank Rows */}
                                            {payload?.overAlClass && (
                                                <>
                                                    <tr>
                                                        <td
                                                            className='bold text-left uppercase'
                                                            style={{ paddingLeft: '8px', border: '1px solid black' }}>
                                                            RANK IN SECTION
                                                        </td>
                                                        <td
                                                            colSpan={groupWiseExamList.length + (payload?.overAlltotal ? 2 : 0)}
                                                            className='bold text-center'
                                                            style={{ border: '1px solid black' }}>
                                                            {report.SectionRank}
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td
                                                            className='bold text-left uppercase'
                                                            style={{ paddingLeft: '8px', border: '1px solid black' }}>
                                                            RANK IN CLASS
                                                        </td>
                                                        <td
                                                            colSpan={groupWiseExamList.length + (payload?.overAlltotal ? 2 : 0)}
                                                            className='bold text-center'
                                                            style={{ border: '1px solid black' }}>
                                                            {report.ClassRank}
                                                        </td>
                                                    </tr>
                                                </>
                                            )}

                                            {/* Non-Scholastic Subjects */}
                                            {report.studentsubjects
                                                ?.filter((s: any) => !s.EMPS_AppToResultFlg)
                                                .map((subj: any) => (
                                                    <tr key={subj.ISMS_Id}>
                                                        <td
                                                            className='bold text-left'
                                                            style={{ paddingLeft: '8px', border: '1px solid black' }}>
                                                            {subj.ISMS_SubjectName}
                                                        </td>
                                                        {groupWiseExamList.map((grpexam: any, idx: number) => {
                                                            const marks = report.studentmarks?.find(
                                                                (m: any) =>
                                                                    m.ISMS_Id === subj.ISMS_Id &&
                                                                    m.EME_Id === grpexam.emE_Id &&
                                                                    m.EMPSG_DisplayName === grpexam.EMPG_DistplayName
                                                            );
                                                            return (
                                                                <td
                                                                    key={idx}
                                                                    className='bold text-center'
                                                                    style={{ border: '1px solid black' }}>
                                                                    {marks
                                                                        ? marks.eyceS_MarksDisplayFlg === '1'
                                                                            ? marks.ObtainedMarks
                                                                            : marks.eyceS_GradeDisplayFlg === '1'
                                                                              ? marks.ObtainedGrade
                                                                              : ''
                                                                        : ''}
                                                                </td>
                                                            );
                                                        })}
                                                        {payload?.overAlltotal && (
                                                            <td className='bold text-center' style={{ border: '1px solid black' }}></td>
                                                        )}
                                                        {payload?.overAlltotal && (
                                                            <td className='bold text-center' style={{ border: '1px solid black' }}>
                                                                {subj.ESTMPPS_ObtainedGrade}
                                                            </td>
                                                        )}
                                                    </tr>
                                                ))}
                                        </tbody>
                                    </table>

                                    {/* Attendance Section */}
                                    <div className='margin-top-20'>
                                        <table
                                            className='table'
                                            style={{ border: '1px solid black', borderCollapse: 'collapse', width: '100%' }}>
                                            <thead>
                                                <tr>
                                                    <th
                                                        colSpan={16}
                                                        className='bold text-center uppercase'
                                                        style={{ border: '1px solid black' }}>
                                                        ATTENDANCE
                                                    </th>
                                                </tr>
                                                <tr style={{ backgroundColor: '#f9f9f9' }}>
                                                    <th className='text-center' style={{ border: '1px solid black' }}></th>
                                                    <th className='bold text-center uppercase' style={{ border: '1px solid black' }}>
                                                        TOTAL
                                                    </th>
                                                    <th className='bold text-center uppercase' style={{ border: '1px solid black' }}>
                                                        TOTAL%
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td
                                                        className='bold text-left uppercase'
                                                        style={{ paddingLeft: '8px', border: '1px solid black' }}>
                                                        WORKING DAYS
                                                    </td>
                                                    <td className='bold text-center' style={{ border: '1px solid black' }}>
                                                        {reportData.work_attendence?.find((a: any) => a.AMST_Id === report.AMST_Id)
                                                            ?.TotalSchoolDays || ''}
                                                    </td>
                                                    <td className='bold text-center' style={{ border: '1px solid black' }}>
                                                        {reportData.work_attendence?.find((a: any) => a.AMST_Id === report.AMST_Id)
                                                            ?.Total_Percentage || ''}{' '}
                                                        %
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td
                                                        className='bold text-left uppercase'
                                                        style={{ paddingLeft: '8px', border: '1px solid black' }}>
                                                        PRESENT DAYS
                                                    </td>
                                                    <td className='bold text-center' style={{ border: '1px solid black' }}>
                                                        {reportData.present_attendence?.find((a: any) => a.AMST_Id === report.AMST_Id)
                                                            ?.TotalPresentDays || ''}
                                                    </td>
                                                    <td className='bold text-center' style={{ border: '1px solid black' }}>
                                                        {reportData.present_attendence?.find((a: any) => a.AMST_Id === report.AMST_Id)
                                                            ?.Total_Percentage || ''}{' '}
                                                        %
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Remarks & Promotion Section */}
                                    <div className='margin-top-20' style={{ fontSize: '14px' }}>
                                        <table className='table' style={{ borderCollapse: 'collapse', border: 'none', width: '100%' }}>
                                            <tbody>
                                                <tr>
                                                    <td style={{ width: '200px', border: 'none' }} className='bold'>
                                                        Exam wise remark :
                                                    </td>
                                                    <td style={{ borderBottom: '1px solid black', textAlign: 'center' }} className='bold'>
                                                        {report.remarks}
                                                    </td>
                                                </tr>
                                                <tr style={{ height: '10px' }}>
                                                    <td colSpan={2} style={{ border: 'none' }}></td>
                                                </tr>
                                                <tr>
                                                    <td style={{ width: '200px', border: 'none' }} className='bold'>
                                                        Promoted to Class :
                                                    </td>
                                                    <td style={{ borderBottom: '1px solid black', textAlign: 'center' }} className='bold'>
                                                        {report.promotedclass}
                                                    </td>
                                                </tr>
                                                <tr style={{ height: '10px' }}>
                                                    <td colSpan={2} style={{ border: 'none' }}></td>
                                                </tr>
                                                <tr>
                                                    <td style={{ width: '200px', border: 'none' }} className='bold'>
                                                        School re-opens on :
                                                    </td>
                                                    <td style={{ borderBottom: '1px solid black', textAlign: 'center' }} className='bold'>
                                                        {payload?.reopen_date
                                                            ? new Date(payload.reopen_date).toLocaleDateString('en-GB')
                                                            : ''}
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Signatures Section */}
                                    <div
                                        className='signature-section'
                                        style={{ display: 'flex', justifyContent: 'space-between', marginTop: '60px' }}>
                                        <div className='sig-box' style={{ textAlign: 'center', width: '30%' }}>
                                            <span style={{ borderTop: '1px solid black', paddingTop: '5px' }} className='bold uppercase'>
                                                Parent's Signature
                                            </span>
                                        </div>
                                        <div className='sig-box' style={{ textAlign: 'center', width: '30%' }}>
                                            <span style={{ borderTop: '1px solid black', paddingTop: '5px' }} className='bold uppercase'>
                                                Class Teacher's Signature
                                            </span>
                                        </div>
                                        <div className='sig-box' style={{ textAlign: 'center', width: '30%' }}>
                                            <span style={{ borderTop: '1px solid black', paddingTop: '5px' }} className='bold uppercase'>
                                                Principal's Signature
                                            </span>
                                        </div>
                                    </div>

                                    {/* Father Church Affiliation Section */}
                                    <div style={{ marginTop: '40px', paddingLeft: '15px' }}>
                                        <table className='table' style={{ border: 'none', borderCollapse: 'collapse', width: '100%' }}>
                                            <tbody>
                                                <tr>
                                                    <td style={{ width: '180px', border: 'none', fontSize: '13px' }}>
                                                        Father—Church Affiliation
                                                    </td>
                                                    <td
                                                        style={{ borderBottom: '1px dotted black', width: '400px', fontSize: '13px' }}
                                                        className='bold'>
                                                        {report.PASR_FatherChurchAffiliation}
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
