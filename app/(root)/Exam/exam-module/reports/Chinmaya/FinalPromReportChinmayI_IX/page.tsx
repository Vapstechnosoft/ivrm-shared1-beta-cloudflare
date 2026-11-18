'use client';

import { Button } from '@/components/ui/button';
import { CollapsibleSection } from '@/components/ui/form/collapsible-section';
import { Printer, RefreshCcw } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import FinalPromReportChinmayI_IXForm from './_components/report-form';

export default function FinalPromReportChinmayI_IXPage() {
    const [reportData, setReportData] = useState<any>(null);
    const [payload, setPayload] = useState<any>(null);
    const [academicYears, setAcademicYears] = useState<any[]>([]);

    const getMockData = (payload: any, students: any[]) => {
        const selectedStudentIds = payload.Temp_AmstIds.map((s: any) => s.AMST_Id);
        const selectedStudents =
            students.length > 0
                ? students.filter((s) => selectedStudentIds.includes(s.amsT_Id))
                : [{ amsT_Id: 1, studentname: 'PRIYANSH M : 3084', amsT_AdmNo: '3084' }];

        return {
            imgname: 'https://kusumadata.blob.core.windows.net/files/14/ISM_Attachments/f1192e36-a28c-4c01-a9b6-7ba55f1ae243.jpg',
            getgroupdetails: [
                { empG_DistplayName: 'FIRST SEMESTER', empsG_MarksValue: 120 },
                { empG_DistplayName: 'SECOND SEMESTER', empsG_MarksValue: 120 }
            ],
            getgroupexamdetails: [
                { empG_DistplayName: 'FIRST SEMESTER', emE_Id: 1, emE_ExamName: 'FA-1', emE_ExamCode: 'FA-1', empsgE_ForMaxMarkrs: 30 },
                { empG_DistplayName: 'FIRST SEMESTER', emE_Id: 2, emE_ExamName: 'FA-2', emE_ExamCode: 'FA-2', empsgE_ForMaxMarkrs: 30 },
                { empG_DistplayName: 'FIRST SEMESTER', emE_Id: 3, emE_ExamName: 'SA-1', emE_ExamCode: 'SA-1', empsgE_ForMaxMarkrs: 60 },
                { empG_DistplayName: 'SECOND SEMESTER', emE_Id: 4, emE_ExamName: 'FA-3', emE_ExamCode: 'FA-3', empsgE_ForMaxMarkrs: 30 },
                { empG_DistplayName: 'SECOND SEMESTER', emE_Id: 5, emE_ExamName: 'FA-4', emE_ExamCode: 'FA-4', empsgE_ForMaxMarkrs: 30 },
                { empG_DistplayName: 'SECOND SEMESTER', emE_Id: 6, emE_ExamName: 'SA-2', emE_ExamCode: 'SA-2', empsgE_ForMaxMarkrs: 60 }
            ],
            getstudentdetails: selectedStudents.map((s: any) => ({
                AMST_Id: s.amsT_Id,
                studentname: s.studentname || 'PRIYANSH M : 3084',
                classname: 'I',
                sectionname: 'A',
                admno: s.amsT_AdmNo || '3084',
                dob: '2017-09-28',
                promotedclass: 'II',
                studentsubjects: [
                    { ISMS_Id: 101, ISMS_SubjectName: 'ENGLISH.', EMPS_AppToResultFlg: true },
                    { ISMS_Id: 102, ISMS_SubjectName: 'KANNADA', EMPS_AppToResultFlg: true },
                    { ISMS_Id: 103, ISMS_SubjectName: 'MATHEMATICS', EMPS_AppToResultFlg: true },
                    { ISMS_Id: 104, ISMS_SubjectName: 'EVS', EMPS_AppToResultFlg: true },
                    { ISMS_Id: 105, ISMS_SubjectName: 'HINDI', EMPS_AppToResultFlg: true },
                    { ISMS_Id: 106, ISMS_SubjectName: 'Computer', EMPS_AppToResultFlg: false },
                    { ISMS_Id: 107, ISMS_SubjectName: 'Value Education', EMPS_AppToResultFlg: false },
                    { ISMS_Id: 108, ISMS_SubjectName: 'Physical Education', EMPS_AppToResultFlg: false },
                    { ISMS_Id: 109, ISMS_SubjectName: 'DRAWING', EMPS_AppToResultFlg: false },
                    { ISMS_Id: 110, ISMS_SubjectName: 'CRAFT', EMPS_AppToResultFlg: false }
                ],
                studentmarks: [
                    // English
                    { ISMS_Id: 101, EME_Id: 1, EMPSG_DisplayName: 'FIRST SEMESTER', ObtainedGrade: 'A+' },
                    { ISMS_Id: 101, EME_Id: 2, EMPSG_DisplayName: 'FIRST SEMESTER', ObtainedGrade: 'A+' },
                    { ISMS_Id: 101, EME_Id: 3, EMPSG_DisplayName: 'FIRST SEMESTER', ObtainedGrade: 'A' },
                    { ISMS_Id: 101, EME_Id: 4, EMPSG_DisplayName: 'SECOND SEMESTER', ObtainedGrade: 'B+' },
                    { ISMS_Id: 101, EME_Id: 5, EMPSG_DisplayName: 'SECOND SEMESTER', ObtainedGrade: 'B+' },
                    { ISMS_Id: 101, EME_Id: 6, EMPSG_DisplayName: 'SECOND SEMESTER', ObtainedGrade: 'B+' },
                    // Kannada
                    { ISMS_Id: 102, EME_Id: 1, EMPSG_DisplayName: 'FIRST SEMESTER', ObtainedGrade: 'A' },
                    { ISMS_Id: 102, EME_Id: 2, EMPSG_DisplayName: 'FIRST SEMESTER', ObtainedGrade: 'B+' },
                    { ISMS_Id: 102, EME_Id: 3, EMPSG_DisplayName: 'FIRST SEMESTER', ObtainedGrade: 'A' },
                    { ISMS_Id: 102, EME_Id: 4, EMPSG_DisplayName: 'SECOND SEMESTER', ObtainedGrade: 'B+' },
                    { ISMS_Id: 102, EME_Id: 5, EMPSG_DisplayName: 'SECOND SEMESTER', ObtainedGrade: 'A' },
                    { ISMS_Id: 102, EME_Id: 6, EMPSG_DisplayName: 'SECOND SEMESTER', ObtainedGrade: 'A' },
                    // Mathematics
                    { ISMS_Id: 103, EME_Id: 1, EMPSG_DisplayName: 'FIRST SEMESTER', ObtainedGrade: 'A+' },
                    { ISMS_Id: 103, EME_Id: 2, EMPSG_DisplayName: 'FIRST SEMESTER', ObtainedGrade: 'A+' },
                    { ISMS_Id: 103, EME_Id: 3, EMPSG_DisplayName: 'FIRST SEMESTER', ObtainedGrade: 'A+' },
                    { ISMS_Id: 103, EME_Id: 4, EMPSG_DisplayName: 'SECOND SEMESTER', ObtainedGrade: 'A+' },
                    { ISMS_Id: 103, EME_Id: 5, EMPSG_DisplayName: 'SECOND SEMESTER', ObtainedGrade: 'A+' },
                    { ISMS_Id: 103, EME_Id: 6, EMPSG_DisplayName: 'SECOND SEMESTER', ObtainedGrade: 'A+' },
                    // EVS
                    { ISMS_Id: 104, EME_Id: 1, EMPSG_DisplayName: 'FIRST SEMESTER', ObtainedGrade: 'A' },
                    { ISMS_Id: 104, EME_Id: 2, EMPSG_DisplayName: 'FIRST SEMESTER', ObtainedGrade: 'A' },
                    { ISMS_Id: 104, EME_Id: 3, EMPSG_DisplayName: 'FIRST SEMESTER', ObtainedGrade: 'A' },
                    { ISMS_Id: 104, EME_Id: 4, EMPSG_DisplayName: 'SECOND SEMESTER', ObtainedGrade: 'B+' },
                    { ISMS_Id: 104, EME_Id: 5, EMPSG_DisplayName: 'SECOND SEMESTER', ObtainedGrade: 'A' },
                    { ISMS_Id: 104, EME_Id: 6, EMPSG_DisplayName: 'SECOND SEMESTER', ObtainedGrade: 'A' },
                    // Hindi
                    { ISMS_Id: 105, EME_Id: 1, EMPSG_DisplayName: 'FIRST SEMESTER', ObtainedGrade: 'A+' },
                    { ISMS_Id: 105, EME_Id: 2, EMPSG_DisplayName: 'FIRST SEMESTER', ObtainedGrade: 'A+' },
                    { ISMS_Id: 105, EME_Id: 3, EMPSG_DisplayName: 'FIRST SEMESTER', ObtainedGrade: 'B+' },
                    { ISMS_Id: 105, EME_Id: 4, EMPSG_DisplayName: 'SECOND SEMESTER', ObtainedGrade: 'A' },
                    { ISMS_Id: 105, EME_Id: 5, EMPSG_DisplayName: 'SECOND SEMESTER', ObtainedGrade: 'B' },
                    { ISMS_Id: 105, EME_Id: 6, EMPSG_DisplayName: 'SECOND SEMESTER', ObtainedGrade: 'A' },
                    // Non-Scholastic (Computer, etc.)
                    { ISMS_Id: 106, EME_Id: 3, EMPSG_DisplayName: 'FIRST SEMESTER', ObtainedGrade: 'A' },
                    { ISMS_Id: 106, EME_Id: 6, EMPSG_DisplayName: 'SECOND SEMESTER', ObtainedGrade: 'A' },
                    { ISMS_Id: 107, EME_Id: 3, EMPSG_DisplayName: 'FIRST SEMESTER', ObtainedGrade: 'A' },
                    { ISMS_Id: 107, EME_Id: 6, EMPSG_DisplayName: 'SECOND SEMESTER', ObtainedGrade: 'A' },
                    { ISMS_Id: 108, EME_Id: 3, EMPSG_DisplayName: 'FIRST SEMESTER', ObtainedGrade: 'A' },
                    { ISMS_Id: 108, EME_Id: 6, EMPSG_DisplayName: 'SECOND SEMESTER', ObtainedGrade: 'A' },
                    { ISMS_Id: 109, EME_Id: 3, EMPSG_DisplayName: 'FIRST SEMESTER', ObtainedGrade: 'A' },
                    { ISMS_Id: 109, EME_Id: 6, EMPSG_DisplayName: 'SECOND SEMESTER', ObtainedGrade: 'A' },
                    { ISMS_Id: 110, EME_Id: 3, EMPSG_DisplayName: 'FIRST SEMESTER', ObtainedGrade: 'A' },
                    { ISMS_Id: 110, EME_Id: 6, EMPSG_DisplayName: 'SECOND SEMESTER', ObtainedGrade: 'A' }
                ],
                // Add student_marks for the TOTAL row
                student_marks: [
                    { EME_Id: 1, EMPSG_DisplayName: 'FIRST SEMESTER', EMGD_Name: 'A+' },
                    { EME_Id: 2, EMPSG_DisplayName: 'FIRST SEMESTER', EMGD_Name: 'A' },
                    { EME_Id: 3, EMPSG_DisplayName: 'FIRST SEMESTER', EMGD_Name: 'A+' },
                    { EME_Id: 4, EMPSG_DisplayName: 'SECOND SEMESTER', EMGD_Name: 'B+' },
                    { EME_Id: 5, EMPSG_DisplayName: 'SECOND SEMESTER', EMGD_Name: 'A' },
                    { EME_Id: 6, EMPSG_DisplayName: 'SECOND SEMESTER', EMGD_Name: 'A+' }
                ]
            })),
            clstchname: [{ hrmE_EmployeeFirstName: 'AMRUTA AVINASH BELAVADE' }],
            work_attendence: selectedStudents.map((s: any) => ({ AMST_Id: s.amsT_Id, TotalSchoolDays: 241, Total_Percentage: 100 })),
            present_attendence: selectedStudents.map((s: any) => ({ AMST_Id: s.amsT_Id, TotalPresentDays: 190, Total_Percentage: 93.6 })),
            examwiseremarks: selectedStudents.flatMap((s: any) => [
                { amsT_Id: s.amsT_Id, emE_ID: 1, emeR_Remarks: 'Good' },
                { amsT_Id: s.amsT_Id, emE_ID: 2, emeR_Remarks: 'Keep it up' },
                { amsT_Id: s.amsT_Id, emE_ID: 3, emeR_Remarks: 'Excellent' },
                { amsT_Id: s.amsT_Id, emE_ID: 4, emeR_Remarks: 'Very Good' },
                { amsT_Id: s.amsT_Id, emE_ID: 5, emeR_Remarks: 'Satisfactory' },
                { amsT_Id: s.amsT_Id, emE_ID: 6, emeR_Remarks: 'Outstanding' }
            ])
        };
    };

    const handleSuccess = (data: { apiData: any; payload: any; academicYears: any[]; students: any[] }) => {
        if (!data.apiData || !data.apiData.getstudentdetails || data.apiData.getstudentdetails.length === 0) {
            toast.info('Data fetched successfully. Showing dummy report for preview.');
            setReportData(getMockData(data.payload, data.students));
        } else {
            setReportData(data.apiData);
        }
        setPayload(data.payload);
        setAcademicYears(data.academicYears);
    };

    const handlePrint = () => {
        const printContent = document.getElementById('printable-report-chinmaya-ix');
        if (!printContent) return;

        const windowUrl = 'about:blank';
        const uniqueName = new Date().getTime();
        const windowName = 'Print' + uniqueName;
        const printWindow = window.open(windowUrl, windowName, 'left=50000,top=50000,width=0,height=0');

        if (!printWindow) return;

        printWindow.document.write(`
            <html>
                <head>
                    <title>Progress Card Report</title>
                    <style>
                        @page { size: A4; margin: 10mm; }
                        body { font-family: 'Times New Roman', serif; font-size: 12px; margin: 0; padding: 0; color: #000; }
                        .report-container { width: 100%; background: #fff; }
                        .header-box { border: 1.5px solid #555; border-radius: 20px; padding: 10px; margin-bottom: 15px; text-align: center; overflow: hidden; }
                        .header-box img { width: 100%; height: auto; display: block; }
                        .academic-year-box { text-align: center; margin: 10px 0; border-bottom: 1.5px solid #000; padding-bottom: 5px; }
                        .academic-year-box h4 { margin: 0; font-size: 14px; text-transform: uppercase; font-weight: bold; }
                        .student-info-grid { display: grid; grid-template-columns: 1.5fr 1fr 1.2fr; gap: 10px; margin-bottom: 15px; padding: 0 5px; }
                        .info-row { display: flex; margin-bottom: 4px; font-size: 12px; }
                        .info-label { font-weight: bold; width: 110px; flex-shrink: 0; }
                        .info-colon { margin: 0 5px; }
                        .info-value { font-weight: bold; flex-grow: 1; border-bottom: 1px solid #ccc; text-align: center; }
                        .table-bordered { border-collapse: collapse; width: 100%; margin-bottom: 15px; border: 1.5px solid black; }
                        .table-bordered th { background-color: #f5f5f5; color: black; border: 1px solid black; padding: 4px; font-weight: bold; }
                        .table-bordered td { border: 1px solid black; padding: 4px 6px; text-align: center; font-size: 11px; }
                        .section-header-row { background-color: #f5f5f5; color: black; font-weight: bold; text-transform: uppercase; text-align: center; padding: 5px !important; border: 1px solid black !important; }
                        .total-row td { background-color: #f9f9f9; font-weight: bold !important; }
                        .text-left { text-align: left !important; }
                        .text-center { text-align: center !important; }
                        .bold { font-weight: bold; }
                        .uppercase { text-transform: uppercase; }
                        .margin-top-10 { margin-top: 10px; }
                        .margin-top-20 { margin-top: 20px; }
                        .signature-section { display: flex; justify-content: space-between; margin-top: 40px; padding: 0 10px; }
                        .signature-box { text-align: center; width: 30%; }
                        .signature-line { border-top: 1px solid black; margin-top: 10px; padding-top: 5px; font-weight: bold; }
                        .principal-sig-img { width: 100px; height: auto; display: block; margin: 0 auto -5px; }
                        .page-break { page-break-before: always; }
                    </style>
                </head>
                <body>
                    <div class="report-container">
                        ${printContent.innerHTML}
                    </div>
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

    const getYearName = () => {
        if (!payload?.asmaY_Id || !academicYears?.length) return '2024-2025';
        const year = academicYears.find((y: any) => y.asmaY_Id === payload.asmaY_Id);
        return year ? year.asmaY_Year : '2024-2025';
    };

    const getGroupWiseExams = () => {
        if (!reportData?.getgroupdetails || !reportData?.getgroupexamdetails) return [];
        const result: any[] = [];
        reportData.getgroupdetails.forEach((group: any) => {
            reportData.getgroupexamdetails.forEach((exam: any) => {
                if (group.empG_DistplayName === exam.empG_DistplayName) {
                    result.push({
                        ...exam,
                        examnamedisplay: exam.emE_ExamCode || exam.emE_ExamName
                    });
                }
            });
        });
        return result;
    };

    const groupWiseExamList = getGroupWiseExams();

    return (
        <div className='flex flex-col space-y-6 p-4 sm:p-6'>
            <div className='no-print flex items-center justify-between'>
                <h1 className='font-bold text-2xl tracking-tight'>Final Promotion Report Chinmay I_IX</h1>
                <div className='flex items-center gap-2'>
                    {reportData && (
                        <Button variant='outline' onClick={handlePrint}>
                            <Printer className='mr-2 h-4 w-4' />
                            Print
                        </Button>
                    )}
                </div>
            </div>

            <CollapsibleSection title='Chinmaya I-IX Progress Card Report' defaultOpen={!reportData} className='no-print'>
                <FinalPromReportChinmayI_IXForm onSuccess={handleSuccess} />
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

                    <div className='overflow-x-auto rounded-lg border bg-card bg-white p-6 text-black shadow-sm'>
                        <div
                            id='printable-report-chinmaya-ix'
                            className='min-w-[800px] p-4'
                            style={{ fontFamily: "'Times New Roman', serif" }}>
                            {reportData.getstudentdetails?.map((report: any, index: number) => (
                                <div key={report.AMST_Id} className={index > 0 ? 'page-break margin-top-20' : ''}>
                                    {/* Header Box */}
                                    <div
                                        className='header-box'
                                        style={{
                                            border: '1.5px solid #555',
                                            borderRadius: '20px',
                                            padding: '10px',
                                            marginBottom: '15px',
                                            textAlign: 'center'
                                        }}>
                                        <img
                                            src='https://kusumadata.blob.core.windows.net/files/14/ISM_Attachments/f1192e36-a28c-4c01-a9b6-7ba55f1ae243.jpg'
                                            alt='School Header'
                                            style={{ width: '100%', display: 'block' }}
                                        />
                                    </div>

                                    {/* Academic Year */}
                                    <div
                                        className='academic-year-box'
                                        style={{
                                            textAlign: 'center',
                                            marginBottom: '15px',
                                            borderBottom: '1.5px solid #000',
                                            paddingBottom: '5px'
                                        }}>
                                        <h4 className='bold uppercase' style={{ margin: 0, fontSize: '14px' }}>
                                            ACADEMIC YEAR {getYearName()}
                                        </h4>
                                    </div>

                                    {/* Student Info Grid */}
                                    <div
                                        className='student-info-grid'
                                        style={{
                                            display: 'grid',
                                            gridTemplateColumns: '1.5fr 1fr 1.2fr',
                                            gap: '10px',
                                            marginBottom: '15px'
                                        }}>
                                        <div className='info-column'>
                                            <div className='info-row' style={{ display: 'flex', marginBottom: '4px' }}>
                                                <span className='info-label bold' style={{ width: '110px' }}>
                                                    NAME
                                                </span>
                                                <span className='info-colon'>:</span>
                                                <span className='info-value bold uppercase'>{report.studentname}</span>
                                            </div>
                                            <div className='info-row' style={{ display: 'flex', marginBottom: '4px' }}>
                                                <span className='info-label bold' style={{ width: '110px' }}>
                                                    CLASS
                                                </span>
                                                <span className='info-colon'>:</span>
                                                <span className='info-value bold'>{report.classname}</span>
                                            </div>
                                            <div className='info-row' style={{ display: 'flex' }}>
                                                <span className='info-label bold' style={{ width: '110px' }}>
                                                    TEACHER
                                                </span>
                                                <span className='info-colon'>:</span>
                                                <span className='info-value bold uppercase'>
                                                    {reportData.clstchname?.[0]?.hrmE_EmployeeFirstName || ''}
                                                </span>
                                            </div>
                                        </div>
                                        <div className='info-column'>
                                            <div className='info-row' style={{ display: 'flex', marginBottom: '4px' }}>
                                                <span className='info-label bold' style={{ width: '70px' }}>
                                                    CLASS
                                                </span>
                                                <span className='info-colon'>:</span>
                                                <span className='info-value bold'>{report.classname}</span>
                                            </div>
                                            <div className='info-row' style={{ display: 'flex' }}>
                                                <span className='info-label bold' style={{ width: '70px' }}>
                                                    SECTION
                                                </span>
                                                <span className='info-colon'>:</span>
                                                <span className='info-value bold'>{report.sectionname}</span>
                                            </div>
                                        </div>
                                        <div className='info-column'>
                                            <div className='info-row' style={{ display: 'flex', marginBottom: '4px' }}>
                                                <span className='info-label bold' style={{ width: '70px' }}>
                                                    ADM.NO
                                                </span>
                                                <span className='info-colon'>:</span>
                                                <span className='info-value bold'>{report.admno}</span>
                                            </div>
                                            <div className='info-row' style={{ display: 'flex' }}>
                                                <span className='info-label bold' style={{ width: '70px' }}>
                                                    D.O.B
                                                </span>
                                                <span className='info-colon'>:</span>
                                                <span className='info-value bold'>
                                                    {report.dob ? new Date(report.dob).toLocaleDateString('en-GB') : ''}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Marks Table */}
                                    <table
                                        className='table-bordered'
                                        style={{ borderCollapse: 'collapse', width: '100%', border: '1.5px solid black' }}>
                                        <thead>
                                            <tr>
                                                <th
                                                    rowSpan={2}
                                                    className='bold text-center'
                                                    style={{ width: '180px', border: '1px solid black' }}>
                                                    Subject Name
                                                </th>
                                                {reportData.getgroupdetails?.map((grp: any) => (
                                                    <th
                                                        key={grp.empG_DistplayName}
                                                        colSpan={
                                                            reportData.getgroupexamdetails?.filter(
                                                                (e: any) => e.empG_DistplayName === grp.empG_DistplayName
                                                            ).length
                                                        }
                                                        className='bold'
                                                        style={{ border: '1px solid black' }}>
                                                        {grp.empG_DistplayName} ({grp.empsG_MarksValue || 0} Marks)
                                                    </th>
                                                ))}
                                                {payload?.OverAlltotal && (
                                                    <th rowSpan={2} className='bold' style={{ border: '1px solid black' }}>
                                                        Grand Total
                                                    </th>
                                                )}
                                                {payload?.OverAlltotal && (
                                                    <th rowSpan={2} className='bold' style={{ border: '1px solid black' }}>
                                                        Grade
                                                    </th>
                                                )}
                                            </tr>
                                            <tr>
                                                {groupWiseExamList.map((grpexam: any, idx: number) => (
                                                    <th key={idx} className='bold text-center' style={{ border: '1px solid black' }}>
                                                        {grpexam.examnamedisplay} <br />({grpexam.empsgE_ForMaxMarkrs})
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
                                                            style={{ border: '1px solid black', paddingLeft: '8px' }}>
                                                            {subj.ISMS_SubjectName}
                                                        </td>
                                                        {groupWiseExamList.map((grpexam: any, idx: number) => {
                                                            const marks = report.studentmarks?.find(
                                                                (m: any) =>
                                                                    Number(m.ISMS_Id) === Number(subj.ISMS_Id) &&
                                                                    Number(m.EME_Id) === Number(grpexam.emE_Id) &&
                                                                    (m.empG_DistplayName === grpexam.empG_DistplayName ||
                                                                        m.EMPSG_DisplayName === grpexam.empG_DistplayName)
                                                            );
                                                            return (
                                                                <td key={idx} className='bold' style={{ border: '1px solid black' }}>
                                                                    {marks ? marks.ObtainedGrade || marks.ObtainedMarks || '' : ''}
                                                                </td>
                                                            );
                                                        })}
                                                        {payload?.OverAlltotal && (
                                                            <td className='bold' style={{ border: '1px solid black' }}>
                                                                {subj.ESTMPPS_ObtainedGrade}
                                                            </td>
                                                        )}
                                                        {payload?.OverAlltotal && (
                                                            <td className='bold' style={{ border: '1px solid black' }}>
                                                                {subj.ESTMPPS_ObtainedGrade}
                                                            </td>
                                                        )}
                                                    </tr>
                                                ))}

                                            {/* Total Row */}
                                            <tr className='total-row' style={{ backgroundColor: '#f9f9f9' }}>
                                                <td
                                                    className='bold text-left uppercase'
                                                    style={{ border: '1px solid black', paddingLeft: '8px' }}>
                                                    TOTAL
                                                </td>
                                                {groupWiseExamList.map((grpexam: any, idx: number) => {
                                                    const totalMarks = report.student_marks?.find(
                                                        (m: any) =>
                                                            Number(m.EME_Id) === Number(grpexam.emE_Id) &&
                                                            (m.empG_DistplayName === grpexam.empG_DistplayName ||
                                                                m.EMPSG_DisplayName === grpexam.empG_DistplayName)
                                                    );
                                                    return (
                                                        <td key={idx} className='bold' style={{ border: '1px solid black' }}>
                                                            {totalMarks?.EMGD_Name || ''}
                                                        </td>
                                                    );
                                                })}
                                                {payload?.OverAlltotal && (
                                                    <td className='bold' style={{ border: '1px solid black' }}>
                                                        {report.ESTMPP_TotalGrade}
                                                    </td>
                                                )}
                                                {payload?.OverAlltotal && (
                                                    <td className='bold' style={{ border: '1px solid black' }}>
                                                        {report.ESTMPP_TotalGrade}
                                                    </td>
                                                )}
                                            </tr>

                                            {/* Non-Scholastic Subjects */}
                                            {report.studentsubjects
                                                ?.filter((s: any) => !s.EMPS_AppToResultFlg)
                                                .map((subj: any) => (
                                                    <tr key={subj.ISMS_Id}>
                                                        <td
                                                            className='bold text-left'
                                                            style={{ border: '1px solid black', paddingLeft: '8px' }}>
                                                            {subj.ISMS_SubjectName}
                                                        </td>
                                                        {groupWiseExamList.map((grpexam: any, idx: number) => {
                                                            const marks = report.studentmarks?.find(
                                                                (m: any) =>
                                                                    Number(m.ISMS_Id) === Number(subj.ISMS_Id) &&
                                                                    Number(m.EME_Id) === Number(grpexam.emE_Id) &&
                                                                    (m.empG_DistplayName === grpexam.empG_DistplayName ||
                                                                        m.EMPSG_DisplayName === grpexam.empG_DistplayName)
                                                            );
                                                            return (
                                                                <td key={idx} className='bold' style={{ border: '1px solid black' }}>
                                                                    {marks ? marks.ObtainedGrade || marks.ObtainedMarks || '' : ''}
                                                                </td>
                                                            );
                                                        })}
                                                        {payload?.OverAlltotal && (
                                                            <td className='bold' style={{ border: '1px solid black' }}>
                                                                {subj.ESTMPPS_ObtainedGrade}
                                                            </td>
                                                        )}
                                                        {payload?.OverAlltotal && (
                                                            <td className='bold' style={{ border: '1px solid black' }}>
                                                                {subj.ESTMPPS_ObtainedGrade}
                                                            </td>
                                                        )}
                                                    </tr>
                                                ))}
                                        </tbody>
                                    </table>

                                    {/* Attendance Table */}
                                    <table
                                        className='table-bordered'
                                        style={{
                                            borderCollapse: 'collapse',
                                            width: '100%',
                                            border: '1.5px solid black',
                                            marginTop: '15px'
                                        }}>
                                        <thead>
                                            <tr>
                                                <th
                                                    colSpan={3}
                                                    className='section-header-row bold uppercase'
                                                    style={{ backgroundColor: '#f5f5f5', border: '1px solid black' }}>
                                                    Attendance
                                                </th>
                                            </tr>
                                            <tr style={{ backgroundColor: '#f9f9f9' }}>
                                                <th style={{ width: '40%', border: '1px solid black' }}></th>
                                                <th className='bold' style={{ border: '1px solid black' }}>
                                                    TOTAL
                                                </th>
                                                <th className='bold' style={{ border: '1px solid black' }}>
                                                    TOTAL%
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td className='bold text-left' style={{ border: '1px solid black', paddingLeft: '8px' }}>
                                                    WORKING DAYS
                                                </td>
                                                <td className='bold' style={{ border: '1px solid black' }}>
                                                    {reportData.work_attendence?.find((a: any) => a.AMST_Id === report.AMST_Id)
                                                        ?.TotalSchoolDays || '241'}
                                                </td>
                                                <td className='bold' style={{ border: '1px solid black' }}>
                                                    {reportData.work_attendence?.find((a: any) => a.AMST_Id === report.AMST_Id)
                                                        ?.Total_Percentage || '100'}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className='bold text-left' style={{ border: '1px solid black', paddingLeft: '8px' }}>
                                                    PRESENT DAYS
                                                </td>
                                                <td className='bold' style={{ border: '1px solid black' }}>
                                                    {reportData.present_attendence?.find((a: any) => a.AMST_Id === report.AMST_Id)
                                                        ?.TotalPresentDays || '190'}
                                                </td>
                                                <td className='bold' style={{ border: '1px solid black' }}>
                                                    {reportData.present_attendence?.find((a: any) => a.AMST_Id === report.AMST_Id)
                                                        ?.Total_Percentage || '93.6'}
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>

                                    {/* Promotion Info */}
                                    <div className='margin-top-20' style={{ marginTop: '20px' }}>
                                        <div style={{ display: 'flex', marginBottom: '8px', alignItems: 'center' }}>
                                            <span className='bold' style={{ width: '180px', fontSize: '14px' }}>
                                                Promoted To Class :
                                            </span>
                                            <span
                                                style={{
                                                    borderBottom: '1.5px solid black',
                                                    flexGrow: 1,
                                                    textAlign: 'center',
                                                    paddingBottom: '2px'
                                                }}
                                                className='bold'>
                                                {report.promotedclass}
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                            <span className='bold' style={{ width: '180px', fontSize: '14px' }}>
                                                School Re Open On :
                                            </span>
                                            <span
                                                style={{
                                                    borderBottom: '1.5px solid black',
                                                    flexGrow: 1,
                                                    textAlign: 'center',
                                                    paddingBottom: '2px'
                                                }}
                                                className='bold'>
                                                {payload?.reopen_date
                                                    ? new Date(payload.reopen_date).toLocaleDateString('en-GB')
                                                    : '13/05/2026'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Signatures */}
                                    <div
                                        className='signature-section'
                                        style={{ display: 'flex', justifyContent: 'space-between', marginTop: '60px' }}>
                                        <div className='signature-box'>
                                            <div className='signature-line'>Parent's Signature</div>
                                        </div>
                                        <div className='signature-box'>
                                            <div className='signature-line'>Class Teacher's Signature</div>
                                        </div>
                                        <div className='signature-box'>
                                            <div style={{ minHeight: '40px' }}>
                                                <img
                                                    src='https://kusumadata.blob.core.windows.net/files/kusuma_principal_sign.png'
                                                    className='principal-sig-img'
                                                    alt='Stamp'
                                                    style={{ width: '100px', height: 'auto', display: 'block', margin: '0 auto' }}
                                                />
                                            </div>
                                            <div className='signature-line'>Principal's Signature</div>
                                        </div>
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
