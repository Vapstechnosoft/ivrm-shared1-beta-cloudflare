'use client';

import { Button } from '@/components/ui/button';
import { BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Title, Tooltip } from 'chart.js';
import { Printer } from 'lucide-react';
import { useMemo, useRef } from 'react';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface ReportListProps {
    data: any;
    academicYear: string;
}

const months = ['may', 'june', 'july', 'august', 'september', 'october', 'november', 'december', 'january', 'february', 'march', 'april'];

const monthDisplay = ['MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC', 'JAN', 'FEB', 'MAR', 'APR'];

export const ReportList = ({ data, academicYear }: ReportListProps) => {
    console.log('RainBow_ProgressCardReport API Response Data:', data);
    const printRef = useRef<HTMLDivElement>(null);

    const {
        getstudentmarksdetails = [],
        getgroupdetails = [],
        getgroupexamdetails = [],
        getstudentdetails = [],
        getstudentwisesubjectlist = [],
        getstudentwiseskillslist = [],
        work_attendence = [],
        present_attendence = [],
        getinstitution = [],
        clstchname = []
    } = data;

    const inst = getinstitution[0] || {};

    // Transformation Logic (Parity with AngularJS)
    const { processedReports, groupwiseexamlistNew, groupwiseexamlist } = useMemo(() => {
        // Group Wise Exam List
        const groupwiseexamlist_temp: any[] = [];
        getgroupdetails.forEach((dd: any) => {
            getgroupexamdetails.forEach((d: any) => {
                if (dd.empG_DistplayName === d.empG_DistplayName) {
                    groupwiseexamlist_temp.push({
                        EMPG_GroupName: d.empG_GroupName,
                        EME_Id: d.emE_Id,
                        EME_ExamName: d.emE_ExamName,
                        EME_ExamOrder: d.emE_ExamOrder,
                        EMPG_DistplayName: d.empG_DistplayName,
                        EMPSGE_ForMaxMarkrs: d.empsgE_ForMaxMarkrs,
                        examnamedisplay: d.emE_ExamCode
                    });
                }
            });
        });

        const newGroupExams: any[] = [];
        groupwiseexamlist_temp.forEach((dd: any) => {
            newGroupExams.push({
                EME_Id: dd.EME_Id,
                EMPG_DistplayName: dd.EMPG_DistplayName,
                EME_ExamName: dd.EME_ExamName,
                EME_Marks: 'Marks'
            });
            newGroupExams.push({
                EME_Id: dd.EME_Id,
                EMPG_DistplayName: dd.EMPG_DistplayName,
                EME_ExamName: dd.EME_ExamName,
                EME_Marks: 'Grade'
            });
        });

        // Unique Skills List
        const uniqueSkills: any[] = [];
        getstudentwiseskillslist.forEach((dd: any) => {
            if (!uniqueSkills.some((s) => s.ECSA_Id === dd.ECSA_Id)) {
                uniqueSkills.push(dd);
            }
        });

        const reports = getstudentdetails.map((stu: any) => {
            const studentId = stu.AMST_Id || stu.amsT_Id;

            const studentsubjects = getstudentwisesubjectlist.filter((s: any) => {
                const isStudent = String(s.AMST_Id || s.amsT_Id) === String(studentId);
                const ismsId = s.ISMS_Id ?? s.ismS_Id ?? s.isms_Id;
                return isStudent && Number(ismsId) !== 980000 && Number(ismsId) !== 980001;
            });
            const studentsubjectsspecial = getstudentwisesubjectlist.filter((s: any) => {
                const isStudent = String(s.AMST_Id || s.amsT_Id) === String(studentId);
                const ismsId = s.ISMS_Id ?? s.ismS_Id ?? s.isms_Id;
                return isStudent && (Number(ismsId) === 980000 || Number(ismsId) === 980001);
            });
            const studentmarks = getstudentmarksdetails.filter((m: any) => String(m.AMST_Id || m.amsT_Id) === String(studentId));
            const getexammaxmarks = data.getexammaxmarks?.filter((m: any) => String(m.AMST_Id || m.amsT_Id) === String(studentId)) || [];

            const studentwiseskills = getstudentwiseskillslist.filter((s: any) => String(s.AMST_Id || s.amsT_Id) === String(studentId));

            return {
                ...stu,
                studentsubjects,
                studentsubjectsspecial,
                studentmarks,
                getexammaxmarks,
                uniqueSkills,
                studentwiseskills,
                workAttendance: work_attendence.find(
                    (a: any) => String(a.AMST_Id || a.amsT_Id || a.studentId || a.StudentId) === String(studentId)
                ),
                presentAttendance: present_attendence.find(
                    (a: any) => String(a.AMST_Id || a.amsT_Id || a.studentId || a.StudentId) === String(studentId)
                )
            };
        });

        return { processedReports: reports, groupwiseexamlistNew: newGroupExams, groupwiseexamlist: groupwiseexamlist_temp };
    }, [data]);

    const handlePrint = () => {
        const printElement = printRef.current;
        if (!printElement) return;

        const canvases = printElement.querySelectorAll('canvas');
        const images: HTMLImageElement[] = [];
        canvases.forEach((canvas) => {
            const img = document.createElement('img');
            img.src = canvas.toDataURL('image/png');
            img.className = canvas.className;
            img.style.cssText = canvas.style.cssText;
            canvas.parentNode?.insertBefore(img, canvas);
            canvas.style.display = 'none';
            images.push(img);
        });

        const innerContents = printElement.innerHTML;

        canvases.forEach((canvas, i) => {
            canvas.style.display = '';
            const img = images[i];
            if (img && img.parentNode) {
                img.parentNode.removeChild(img);
            }
        });

        const popupWinindow = window.open('', '_blank', 'width=1100,height=850');
        if (popupWinindow) {
            popupWinindow.document.open();
            popupWinindow.document.write(`
                <html>
                    <head>
                        <title>RainBow Progress Card Report</title>
                        <link rel="stylesheet" href="https://vapsclg.blob.core.windows.net/files/PrintPdf_Bootstrap.css">
                        <link rel="stylesheet" href="https://vapsclg.blob.core.windows.net/files/printpdf.css">
                        <style>
                            @page { size: portrait; margin: 5mm; }
                            body { font-family: sans-serif !important; font-size: 13px; color: black; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                            .pagelayout { border: 1px solid black !important; padding: 20px !important; margin-bottom: 20px; page-break-after: always; background: white; }
                            .text-center { text-align: center; }
                            .text-left { text-align: left; }
                            .text-right { text-align: right; }
                            .table-bordered > thead > tr > th, .table-bordered > tbody > tr > th, .table-bordered > tfoot > tr > th, .table-bordered > thead > tr > td, .table-bordered > tbody > tr > td, .table-bordered > tfoot > tr > td { border: 1px solid #a0c4e4 !important; padding: 6px !important; }
                            .margin-top-5 { margin-top: 5px; }
                            .margin-top-10 { margin-top: 10px; }
                            .margin-top-80 { margin-top: 80px; }
                            table { width: 100%; border-collapse: collapse; }
                            td, th { padding: 6px !important; }
                            .Ndsreport { background-color: #c6dff7 !important; color: black; }
                            .DarkBlueHeader { background-color: #014aa1 !important; color: white !important; }
                            .w-full { width: 100% !important; }
                            img { max-width: 100%; height: auto; }
                        </style>
                    </head>
                    <body onload="window.print(); window.close();">
                        ${innerContents}
                    </body>
                </html>
            `);
            popupWinindow.document.close();
        }
    };

    if (processedReports.length === 0) return null;

    return (
        <div className='space-y-6'>
            <style>{`
                .pagelayout { border: 1px solid black !important; padding: 20px !important; margin-bottom: 20px; background: white; width: 95%; max-width: 100%; margin-left: auto; margin-right: auto; font-family: sans-serif; }
                .table-bordered td, .table-bordered th { border: 1px solid #a0c4e4 !important; padding: 6px !important; }
                .Ndsreport { background-color: #c6dff7 !important; color: black; }
                .DarkBlueHeader { background-color: #014aa1 !important; color: white !important; }
                @media print {
                    .no-print { display: none; }
                }
            `}</style>

            <div className='no-print flex justify-end'>
                <Button onClick={handlePrint} className='bg-primary shadow-lg hover:bg-primary/90'>
                    <Printer className='mr-2 h-4 w-4' />
                    Print All Reports
                </Button>
            </div>

            <div ref={printRef} id='HHS02' className='bg-gray-50 p-4'>
                {processedReports.map((report: any, index: number) => (
                    <div key={index} id={`std_${report.AMST_Id}`}>
                        {/* Page 1 */}
                        <div className='pagelayout' style={{ pageBreakBefore: 'always' }}>
                            <div className='row margin-top-5'>
                                <table align='center' className='w-full'>
                                    <tbody>
                                        <tr>
                                            <td className='text-center'>
                                                <img
                                                    src='https://dcampusstrg.blob.core.windows.net/files/17/NAACDocumentsUpload/86db53f0-f5e5-488a-85dd-8b6d693396ad.jpg'
                                                    className='w-full'
                                                    style={{ width: '100%', height: 'auto' }}
                                                    alt='Header'
                                                />
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <div className='row margin-top-10'>
                                <div className='col-sm-12'>
                                    <hr style={{ border: 0, borderTop: '1px dashed #000', margin: '20px 0' }} />
                                </div>
                                <div className='mt-4 w-full px-4'>
                                    <table className='w-full font-bold text-sm'>
                                        <tbody>
                                            <tr>
                                                <td className='w-24 py-2'>NAME</td>
                                                <td className='w-4'>:</td>
                                                <td className='uppercase'>{report.studentName || report.studentname}</td>
                                                <td></td>
                                            </tr>
                                            <tr>
                                                <td className='w-24 py-2'>ROLL NO</td>
                                                <td className='w-4'>:</td>
                                                <td className='uppercase'>{report.rollNo || report.rollno || 'N/A'}</td>
                                                <td className='text-right uppercase'>
                                                    {report.className || report.classname} &nbsp; &nbsp;{' '}
                                                    {report.sectionName || report.sectionname}
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                <div className='mt-4 w-full px-2'>
                                    <table className='table-bordered table-condensed table w-full text-xs'>
                                        <thead>
                                            <tr>
                                                <th style={{ width: '40px' }} className='Ndsreport'>
                                                    <b>SL No</b>
                                                </th>
                                                <th className='Ndsreport text-left' style={{ width: '130px' }}>
                                                    <b>SUBJECT</b>
                                                </th>
                                                <th className='Ndsreport text-center' style={{ width: '80px' }}>
                                                    <b>MAX MARKS</b>
                                                </th>
                                                {groupwiseexamlist.map((grpexam: any, eIdx: number) => (
                                                    <th key={eIdx} className='DarkBlueHeader text-center' colSpan={2}>
                                                        <strong>{grpexam.EMPG_GroupName}</strong>
                                                    </th>
                                                ))}
                                                <th className='DarkBlueHeader text-center' style={{ width: '150px' }}>
                                                    <strong>FINAL RESULT</strong>
                                                </th>
                                                <th className='DarkBlueHeader text-center' style={{ width: '150px' }}>
                                                    <strong>GRADE</strong>
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {report.studentsubjects
                                                .filter((s: any) => {
                                                    const app = s.EMPS_AppToResultFlg ?? s.emps_AppToResultFlg ?? s.appToResultFlg;
                                                    return app !== undefined && app !== null
                                                        ? typeof app === 'string'
                                                            ? app.toLowerCase() === 'true'
                                                            : !!app
                                                        : true;
                                                })
                                                .map((subj: any, sIdx: number) => (
                                                    <tr key={sIdx}>
                                                        <td className='text-center'>{sIdx + 1}</td>
                                                        <td className='text-left'>{subj.subjectName || subj.ISMS_SubjectName}</td>
                                                        <td className='text-center'>{subj.subjectMaxMarks || subj.ESTMPPS_MaxMarks}</td>
                                                        {groupwiseexamlistNew.map((grpexam: any, gnIdx: number) => (
                                                            <td key={gnIdx} className='text-center'>
                                                                {report.studentmarks
                                                                    .filter((mrks: any) => {
                                                                        const mIsmsId = mrks.ismS_Id ?? mrks.ISMS_Id ?? mrks.isms_Id;
                                                                        const mEmeId = mrks.emE_Id ?? mrks.EME_Id ?? mrks.eme_Id;
                                                                        const grpEmeId = grpexam.EME_Id ?? grpexam.emE_Id ?? grpexam.eme_Id;
                                                                        const sIsmsId = subj.ismS_Id ?? subj.ISMS_Id ?? subj.isms_Id;
                                                                        const mGrpName =
                                                                            mrks.empsG_DisplayName ??
                                                                            mrks.EMPSG_DisplayName ??
                                                                            mrks.empG_DistplayName ??
                                                                            mrks.EMPG_DistplayName;
                                                                        const grpName =
                                                                            grpexam.EMPG_DistplayName ?? grpexam.empG_DistplayName;

                                                                        return (
                                                                            (Number(sIsmsId) === Number(mIsmsId) ||
                                                                                (subj.subjectName &&
                                                                                    mrks.ismS_SubjectName &&
                                                                                    subj.subjectName === mrks.ismS_SubjectName)) &&
                                                                            Number(grpEmeId) === Number(mEmeId) &&
                                                                            mGrpName === grpName
                                                                        );
                                                                    })
                                                                    .slice(0, 1) // Only take the first matching mark entry to avoid duplication
                                                                    .map((mrks: any, mIdx: number) => (
                                                                        <div key={mIdx}>
                                                                            {grpexam.EME_Marks === 'Marks' ? (
                                                                                ['AB', 'M', 'L'].includes(
                                                                                    mrks.passFailFlag || mrks.PassFailFlag
                                                                                ) ? (
                                                                                    <span>{mrks.passFailFlag || mrks.PassFailFlag}</span>
                                                                                ) : (
                                                                                    <span>{mrks.obtainedMarks ?? mrks.ObtainedMarks}</span>
                                                                                )
                                                                            ) : (
                                                                                <span>{mrks.obtainedGrade ?? mrks.ObtainedGrade}</span>
                                                                            )}
                                                                        </div>
                                                                    ))}
                                                            </td>
                                                        ))}
                                                        <td className='Ndsreport text-center font-bold'>
                                                            {subj.SpicalMark ?? subj.spicalMark ?? ''}
                                                        </td>
                                                        <td className='Ndsreport text-center font-bold'>
                                                            {subj.ESTMPPS_ObtainedGrade || subj.estmpps_ObtainedGrade
                                                                ? (subj.SpicalGrade ??
                                                                  subj.spicalGrade ??
                                                                  subj.ESTMPPS_ObtainedGrade ??
                                                                  subj.estmpps_ObtainedGrade)
                                                                : ''}
                                                        </td>
                                                    </tr>
                                                ))}
                                        </tbody>
                                        <tbody>
                                            <tr>
                                                <td className='Ndsreport text-right font-bold' colSpan={2}>
                                                    TOTAL
                                                </td>
                                                <td className='Ndsreport text-center font-bold'>
                                                    {report.ESTMPP_TotalMaxMarks ||
                                                        report.studentsubjects.reduce(
                                                            (acc: number, s: any) => acc + (s.subjectMaxMarks || 0),
                                                            0
                                                        )}
                                                </td>
                                                {groupwiseexamlistNew.map((grpexam: any, gnIdx: number) => (
                                                    <td key={gnIdx} className='Ndsreport text-center font-bold'>
                                                        {report.getexammaxmarks
                                                            .filter((total: any) => {
                                                                const mEmeId = total.emE_Id ?? total.EME_Id ?? total.examId;
                                                                const grpEmeId = grpexam.EME_Id ?? grpexam.emE_Id ?? grpexam.eme_Id;
                                                                return Number(mEmeId) === Number(grpEmeId);
                                                            })
                                                            .slice(0, 1)
                                                            .map((total: any, tIdx: number) => (
                                                                <div key={tIdx}>
                                                                    {grpexam.EME_Marks === 'Marks'
                                                                        ? (total.ESTMP_TotalObtMarks ?? total.overallObtainedMarks)
                                                                        : `${total.ESTMP_Percentage ?? total.overallPercentage} %`}
                                                                </div>
                                                            ))}
                                                    </td>
                                                ))}
                                                <td className='Ndsreport text-center font-bold'>
                                                    {report.studentsubjectsspecial?.find(
                                                        (m: any) => Number(m.ISMS_Id ?? m.ismS_Id) === 980001
                                                    )?.SpicalMark ??
                                                        report.studentsubjectsspecial?.find(
                                                            (m: any) => Number(m.ISMS_Id ?? m.ismS_Id) === 980001
                                                        )?.spicalMark ??
                                                        ''}
                                                </td>
                                                <td className='Ndsreport text-center font-bold'>
                                                    {(report.studentsubjectsspecial?.find(
                                                        (m: any) => Number(m.ISMS_Id ?? m.ismS_Id) === 980000
                                                    )?.SpicalMark ??
                                                    report.studentsubjectsspecial?.find(
                                                        (m: any) => Number(m.ISMS_Id ?? m.ismS_Id) === 980000
                                                    )?.spicalMark)
                                                        ? `${report.studentsubjectsspecial?.find((m: any) => Number(m.ISMS_Id ?? m.ismS_Id) === 980000)?.SpicalMark ?? report.studentsubjectsspecial?.find((m: any) => Number(m.ISMS_Id ?? m.ismS_Id) === 980000)?.spicalMark}%`
                                                        : ''}
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                <div className='mt-4 w-full px-2'>
                                    <table className='table-bordered table-condensed table w-full text-xs'>
                                        <thead>
                                            <tr>
                                                <th className='Ndsreport' style={{ width: '40px' }}>
                                                    <strong>SL No</strong>
                                                </th>
                                                <th className='Ndsreport text-left'>
                                                    <b>SUBJECT(CO-SCHOLASTIC)</b>
                                                </th>
                                                {groupwiseexamlist.map((grpexam: any, eIdx: number) => (
                                                    <th key={eIdx} className='DarkBlueHeader text-center' style={{ width: '150px' }}>
                                                        <b>{grpexam.EMPG_GroupName}</b>
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {report.studentsubjects
                                                .filter((s: any) => {
                                                    const app = s.EMPS_AppToResultFlg ?? s.emps_AppToResultFlg ?? s.appToResultFlg;
                                                    return app !== undefined && app !== null
                                                        ? typeof app === 'string'
                                                            ? app.toLowerCase() === 'false'
                                                            : !app
                                                        : false;
                                                })
                                                .map((subj: any, sIdx: number) => (
                                                    <tr key={sIdx}>
                                                        <td className='text-center'>
                                                            {sIdx +
                                                                1 +
                                                                report.studentsubjects.filter((s: any) => {
                                                                    const app =
                                                                        s.EMPS_AppToResultFlg ?? s.emps_AppToResultFlg ?? s.appToResultFlg;
                                                                    return app !== undefined && app !== null
                                                                        ? typeof app === 'string'
                                                                            ? app.toLowerCase() === 'true'
                                                                            : !!app
                                                                        : true;
                                                                }).length}
                                                        </td>
                                                        <td className='text-left'>{subj.subjectName || subj.ISMS_SubjectName}</td>
                                                        {groupwiseexamlist.map((grpexam: any, eIdx: number) => (
                                                            <td key={eIdx} className='text-center'>
                                                                {report.studentmarks
                                                                    .filter((mrks: any) => {
                                                                        const mIsmsId = mrks.ismS_Id ?? mrks.ISMS_Id ?? mrks.isms_Id;
                                                                        const mEmeId = mrks.emE_Id ?? mrks.EME_Id ?? mrks.eme_Id;
                                                                        const grpEmeId = grpexam.EME_Id ?? grpexam.emE_Id ?? grpexam.eme_Id;
                                                                        const sIsmsId = subj.ismS_Id ?? subj.ISMS_Id ?? subj.isms_Id;
                                                                        const mGrpName =
                                                                            mrks.empsG_DisplayName ??
                                                                            mrks.EMPSG_DisplayName ??
                                                                            mrks.empG_DistplayName ??
                                                                            mrks.EMPG_DistplayName;
                                                                        const grpName =
                                                                            grpexam.EMPG_DistplayName ?? grpexam.empG_DistplayName;

                                                                        return (
                                                                            (Number(sIsmsId) === Number(mIsmsId) ||
                                                                                (subj.subjectName &&
                                                                                    mrks.ismS_SubjectName &&
                                                                                    subj.subjectName === mrks.ismS_SubjectName)) &&
                                                                            Number(grpEmeId) === Number(mEmeId) &&
                                                                            mGrpName === grpName
                                                                        );
                                                                    })
                                                                    .slice(0, 1)
                                                                    .map((mrks: any, mIdx: number) => (
                                                                        <div key={mIdx}>
                                                                            {!['AB', 'M', 'L'].includes(
                                                                                mrks.passFailFlag || mrks.PassFailFlag
                                                                            ) && <span>{mrks.obtainedGrade ?? mrks.ObtainedGrade}</span>}
                                                                        </div>
                                                                    ))}
                                                            </td>
                                                        ))}
                                                    </tr>
                                                ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div className='mt-4 w-full px-6 text-xs'>
                                    <p>
                                        <b>
                                            Note : 1) FINAL RESULT =10% from Unit Test -1, Unit Test - 2 & Unit Test 3/4, 20% from Mid Term
                                            & 50% from ANNUAL EXAM.
                                        </b>
                                    </p>
                                    <p>
                                        <b>Note : 2) A+:(90 to 100) ,A:(70 to 89) ,B+ : (50 to 69 ) ,B : (30 to 49) , C : (0 to 29)</b>
                                    </p>
                                </div>

                                <div className='mt-6 w-full px-6'>
                                    <h3 className='font-bold text-lg'>Graphical View</h3>
                                    <div className='flex justify-center py-4' style={{ height: '300px' }}>
                                        <Bar
                                            data={{
                                                labels: report.studentsubjects
                                                    .filter((s: any) => {
                                                        const app = s.EMPS_AppToResultFlg ?? s.emps_AppToResultFlg ?? s.appToResultFlg;
                                                        return app !== undefined && app !== null
                                                            ? typeof app === 'string'
                                                                ? app.toLowerCase() === 'true'
                                                                : !!app
                                                            : true;
                                                    })
                                                    .map((s: any) => s.subjectName || s.ISMS_SubjectName),
                                                datasets: [
                                                    {
                                                        label: 'Percentage',
                                                        data: report.studentsubjects
                                                            .filter((s: any) => {
                                                                const app =
                                                                    s.EMPS_AppToResultFlg ?? s.emps_AppToResultFlg ?? s.appToResultFlg;
                                                                return app !== undefined && app !== null
                                                                    ? typeof app === 'string'
                                                                        ? app.toLowerCase() === 'true'
                                                                        : !!app
                                                                    : true;
                                                            })
                                                            .map(
                                                                (s: any) =>
                                                                    s.subjectPercentage ?? s.TotalPercentage ?? s.subjectObtainedMarks ?? 0
                                                            ),
                                                        backgroundColor: 'rgb(255, 87, 34)',
                                                        borderColor: 'black',
                                                        borderWidth: 1
                                                    }
                                                ]
                                            }}
                                            options={{
                                                responsive: true,
                                                maintainAspectRatio: false,
                                                scales: {
                                                    y: { beginAtZero: true, max: 100 },
                                                    x: { ticks: { font: { size: 10 } } }
                                                },
                                                plugins: { legend: { display: false } }
                                            }}
                                        />
                                    </div>
                                </div>

                                {report.studentwiseskills.length > 0 && (
                                    <div className='mt-8 w-full px-2'>
                                        <h2 className='mb-4 text-center font-bold text-xl uppercase'>
                                            NON-SCHOLASTIC AREA PERFORMANCE {academicYear}
                                        </h2>
                                        <table className='table-bordered table-condensed table w-full text-xs'>
                                            <thead>
                                                <tr>
                                                    <th className='Ndsreport' style={{ width: '40px' }}>
                                                        <strong>Sl No</strong>
                                                    </th>
                                                    <th className='DarkBlueHeader text-left' colSpan={3}>
                                                        <b>AREAS</b>
                                                    </th>
                                                    {groupwiseexamlist.map((grpexam: any, eIdx: number) => (
                                                        <th key={eIdx} className='DarkBlueHeader text-center'>
                                                            <b>{grpexam.EME_ExamName}</b>
                                                        </th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {report.uniqueSkills.map((skill: any, sIdx: number) => (
                                                    <tr key={sIdx}>
                                                        <td className='text-center'>{sIdx + 1}</td>
                                                        <td className='text-left' colSpan={3}>
                                                            {skill.ECSA_SkillArea}
                                                        </td>
                                                        {groupwiseexamlist.map((grpexam: any, eIdx: number) => (
                                                            <td key={eIdx} className='text-center'>
                                                                {report.studentwiseskills
                                                                    .filter((sk: any) => {
                                                                        const skEcsaId = sk.ECSA_Id ?? sk.ecsa_Id;
                                                                        const sEcsaId = skill.ECSA_Id ?? skill.ecsa_Id;
                                                                        const skEmeId = sk.EME_Id ?? sk.emE_Id ?? sk.eme_Id;
                                                                        const gEmeId = grpexam.EME_Id ?? grpexam.emE_Id ?? grpexam.eme_Id;
                                                                        return (
                                                                            Number(skEcsaId) === Number(sEcsaId) &&
                                                                            Number(skEmeId) === Number(gEmeId)
                                                                        );
                                                                    })
                                                                    .map((sk: any, skIdx: number) => (
                                                                        <span key={skIdx}>{sk.EMGD_Name ?? sk.emgD_Name}</span>
                                                                    ))}
                                                            </td>
                                                        ))}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}

                                <div className='mt-6 w-full px-2'>
                                    <h3 className='px-4 font-bold text-lg'>ATTENDANCE</h3>
                                    <table className='table-bordered table-condensed table w-full text-xs'>
                                        <thead>
                                            <tr>
                                                <th className='Ndsreport text-left' colSpan={2}></th>
                                                {monthDisplay.map((m) => (
                                                    <th key={m} className='Ndsreport text-center'>
                                                        {m}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td className='text-left font-bold' colSpan={2}>
                                                    No of Working Days
                                                </td>
                                                {months.map((m) => (
                                                    <td key={m} className='text-center font-bold'>
                                                        {report.workAttendance?.[m] !== 0 ? report.workAttendance?.[m] : ''}
                                                    </td>
                                                ))}
                                            </tr>
                                            <tr>
                                                <td className='text-left font-bold' colSpan={2}>
                                                    No of Days Present
                                                </td>
                                                {months.map((m) => (
                                                    <td key={m} className='text-center font-bold'>
                                                        {report.presentAttendance?.[m] !== 0 ? report.presentAttendance?.[m] : ''}
                                                    </td>
                                                ))}
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                <div className='mt-20 flex w-full justify-between px-6 font-bold text-sm'>
                                    <div>Class Teacher : {clstchname[0]?.hrmE_EmployeeFirstName || '................................'}</div>
                                    <div>Principal Signature</div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
