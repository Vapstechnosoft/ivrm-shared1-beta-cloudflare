'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FileDown } from 'lucide-react';
import Image from 'next/image';
import { useRef } from 'react';
import * as XLSX from 'xlsx';

interface ReportListProps {
    data: any;
    params: any;
}

export const ReportList = ({ data, params }: ReportListProps) => {
    const printRef = useRef<HTMLDivElement>(null);
    const {
        institution,
        YearName,
        stream,
        section,
        empG_GroupName,
        Left_FlagAverage,
        getstudentmarksdetails_temp = [],
        getstudentmarksdetails = [],
        piotsubjets = [],
        getskill = [],
        getallgrade = [],
        getstudentwisesubjectlist = [],
        St_ThomosTotal = [],
        st_ThomosTotal = []
    } = data || {};

    const studentMarksDetails = getstudentmarksdetails_temp.length > 0 ? getstudentmarksdetails_temp : getstudentmarksdetails;
    const finalTotal = St_ThomosTotal.length > 0 ? St_ThomosTotal : st_ThomosTotal;

    // const handlePrint = useReactToPrint({
    //     content: () => printRef.current
    // });

    const handleExportExcel = () => {
        const tableElement = printRef.current?.querySelector('table');
        if (tableElement) {
            const wb = XLSX.utils.table_to_book(tableElement, { sheet: 'Sheet JS' });
            XLSX.writeFile(wb, Left_FlagAverage ? 'Super_Average_Report.xlsx' : 'Tabulation_Sheet.xlsx');
        }
    };

    if (!data || studentMarksDetails.length === 0) {
        return (
            <Card>
                <CardContent className='flex h-40 items-center justify-center p-6'>
                    <p className='text-gray-500'>No data records found for the selected criteria.</p>
                </CardContent>
            </Card>
        );
    }

    const renderNormalReport = () => {
        // Extract dynamic columns from subject_Marks if present
        const dynamicColumns: string[] = [];
        studentMarksDetails.forEach((report: any) => {
            try {
                if (report.subject_Marks) {
                    const parsed = JSON.parse(report.subject_Marks);
                    parsed.forEach((m: any) => {
                        if (m.subject_name && !dynamicColumns.includes(m.subject_name)) {
                            dynamicColumns.push(m.subject_name);
                        }
                    });
                }
            } catch (e) {
                // ignore
            }
        });

        const columnsToRender = dynamicColumns.length > 0 ? dynamicColumns : piotsubjets;

        return (
            <div className='w-full overflow-x-auto'>
                <table className='w-full border-collapse border border-gray-300 text-sm'>
                    <thead>
                        <tr>
                            <td colSpan={5 + piotsubjets.length + getskill.length} className='border border-gray-300 p-2 text-center'>
                                <div className='flex flex-col items-center justify-center gap-2'>
                                    {institution?.mI_Logo && (
                                        <div className='relative h-20 w-20'>
                                            <Image src={institution.mI_Logo} alt='School Logo' fill className='object-contain' />
                                        </div>
                                    )}
                                    <h3 className='font-bold text-xl'>St. Thomas&apos; Church School</h3>
                                    <h5 className='font-semibold text-lg'>CLASS WISE TERM REPORT</h5>
                                    <h4 className='font-medium text-base'>
                                        TABULATION SHEET : {YearName || ''} Class : {stream || ''}: Section : {section || ''} - EXAM :{' '}
                                        {empG_GroupName || ''}
                                    </h4>
                                </div>
                            </td>
                        </tr>
                        <tr className='bg-gray-100'>
                            <th className='border border-gray-300 p-2 text-center [writing-mode:horizontal-tb]'>S. NO</th>
                            <th className='border border-gray-300 p-2 text-center [writing-mode:horizontal-tb]'>STUDENT&apos;S-ID</th>
                            <th className='border border-gray-300 p-2 text-left'>STUDENT&apos;S NAME</th>
                            {studentMarksDetails[0]?.empg_GroupName && <th className='border border-gray-300 p-2 text-left'>EXAM</th>}
                            {columnsToRender.map((subject: any, idx: number) => (
                                <th key={`subj-${idx}`} className='min-w-[100px] border border-gray-300 p-2 text-center'>
                                    {typeof subject === 'string'
                                        ? subject
                                        : subject.Flag === 0
                                          ? (subject.ISMS_SubjectName || subject.ismS_SubjectName)?.toUpperCase()
                                          : `${subject.SubjectName || subject.subjectName}(50)`}
                                </th>
                            ))}
                            {getskill.map((skill: any, idx: number) => (
                                <th key={`skill-${idx}`} className='border border-gray-300 p-2 text-center'>
                                    {skill.ECACT_SkillName}
                                </th>
                            ))}
                            <th className='border border-gray-300 p-2 text-center [writing-mode:horizontal-tb]'>TOTAL</th>
                            <th className='border border-gray-300 p-2 text-center [writing-mode:horizontal-tb]'>PERCENTAGE</th>
                        </tr>
                    </thead>
                    <tbody>
                        {studentMarksDetails.map((report: any, idx: number) => {
                            let parsedMarks: any[] = [];
                            try {
                                if (report.subject_Marks) {
                                    parsedMarks = JSON.parse(report.subject_Marks);
                                }
                            } catch (e) {
                                // ignore
                            }

                            return (
                                <tr key={`row-${idx}`} className='hover:bg-gray-50'>
                                    <td className='border border-gray-300 p-2 text-center'>{idx + 1}</td>
                                    <td className='border border-gray-300 p-2 text-center'>{report.AMST_AdmNo || report.amsT_AdmNo}</td>
                                    <td className='border border-gray-300 p-2 font-medium'>{report.studentname || report.studentName}</td>
                                    {report.empg_GroupName && (
                                        <td className='border border-gray-300 p-2 font-medium'>{report.empg_GroupName}</td>
                                    )}

                                    {/* Marks */}
                                    {columnsToRender.map((col: any, sIdx: number) => {
                                        let mark: any;

                                        if (typeof col === 'string') {
                                            // Handle dynamic parsed marks
                                            const markObj = parsedMarks.find((m) => m.subject_name === col);
                                            mark = markObj ? markObj.subject_marks : '';
                                        } else {
                                            // Handle fallback piotsubjets
                                            mark = report[col.ISMS_SubjectName || col.ismS_SubjectName];
                                        }

                                        let displayMark: string | number = '';
                                        if (mark > 0) displayMark = mark;
                                        else if (mark === 0) displayMark = 'AB';
                                        else if (mark === -2) displayMark = 0;
                                        else if (mark === -3) displayMark = 0;
                                        else displayMark = mark;

                                        return (
                                            <td key={`mark-${sIdx}`} className='border border-gray-300 p-2 text-center'>
                                                {displayMark}
                                            </td>
                                        );
                                    })}

                                    {/* Skills */}
                                    {getskill.map((ccce: any, skIdx: number) => {
                                        const cceMatch = getallgrade.find(
                                            (cce: any) =>
                                                (cce.AMST_Id || cce.amsT_Id) === (report.AMST_Id || report.amsT_Id) &&
                                                (ccce.ECACT_Id || ccce.ecacT_Id) === (cce.ECACT_Id || cce.ecacT_Id)
                                        );
                                        return (
                                            <td key={`skill-val-${skIdx}`} className='border border-gray-300 p-2 text-center'>
                                                {cceMatch ? cceMatch.EMGD_Name : ''}
                                            </td>
                                        );
                                    })}

                                    <td className='border border-gray-300 p-2 text-center font-bold'>
                                        {report.TotalMarks || report.totalMarks}
                                    </td>
                                    <td className='border border-gray-300 p-2 text-center font-bold'>
                                        {report.TotalPercentage || report.totalPercentage}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        );
    };

    const renderSuperAverageReport = () => {
        return (
            <div className='w-full overflow-x-auto'>
                <table className='w-full border-collapse border border-gray-300 text-sm'>
                    <thead>
                        <tr>
                            <td colSpan={5 + getstudentwisesubjectlist.length} className='border border-gray-300 p-2 text-center'>
                                <div className='flex flex-col items-center justify-center gap-2'>
                                    {institution?.mI_Logo && (
                                        <div className='relative h-20 w-20'>
                                            <Image src={institution.mI_Logo} alt='School Logo' fill className='object-contain' />
                                        </div>
                                    )}
                                    <h3 className='font-bold text-xl'>St. Thomas&apos; Church School</h3>
                                    <h5 className='font-semibold text-lg'>CLASS WISE AVERAGE REPORT</h5>
                                    <h4 className='font-medium text-base'>
                                        SUPER AVERAGE SHEET : {YearName || ''} Class : {stream || ''}: Section : {section || ''}
                                    </h4>
                                </div>
                            </td>
                        </tr>
                        <tr className='bg-gray-100'>
                            <th className='border border-gray-300 p-2 text-center'>S. NO</th>
                            <th className='border border-gray-300 p-2 text-center'>STUDENT&apos;S-ID</th>
                            <th className='border border-gray-300 p-2 text-left'>STUDENT&apos;S NAME</th>
                            {getstudentwisesubjectlist.map((subject: any, idx: number) => (
                                <th key={`subj-${idx}`} className='border border-gray-300 p-2 text-center'>
                                    {subject.ISMS_SubjectName || subject.ismS_SubjectName}
                                </th>
                            ))}
                            <th className='border border-gray-300 p-2 text-center'>TOTAL</th>
                            <th className='border border-gray-300 p-2 text-center'>PERCENTAGE</th>
                        </tr>
                    </thead>
                    <tbody>
                        {studentMarksDetails.map((report: any, idx: number) => {
                            const totalRecord = finalTotal.find(
                                (dd: any) => (report.AMST_Id || report.amsT_Id) === (dd.AMST_Id || dd.amsT_Id)
                            );

                            return (
                                <tr key={`row-${idx}`} className='hover:bg-gray-50'>
                                    <td className='border border-gray-300 p-2 text-center'>{idx + 1}</td>
                                    <td className='border border-gray-300 p-2 text-center'>{report.AMST_AdmNo || report.amsT_AdmNo}</td>
                                    <td className='border border-gray-300 p-2 font-medium'>{report.studentname || report.studentName}</td>

                                    {/* Marks */}
                                    {getstudentwisesubjectlist.map((user: any, sIdx: number) => {
                                        const mark = report[user.ISMS_SubjectName || user.ismS_SubjectName];
                                        let displayMark: string | number = '';
                                        if (mark > 0) displayMark = mark;
                                        else if (mark === 0) displayMark = 'AB';
                                        else if (mark === -2) displayMark = 0;
                                        else if (mark === -3) displayMark = 0;

                                        return (
                                            <td key={`mark-${sIdx}`} className='border border-gray-300 p-2 text-center'>
                                                {displayMark}
                                            </td>
                                        );
                                    })}

                                    <td className='border border-gray-300 p-2 text-center font-bold'>
                                        {totalRecord
                                            ? (totalRecord.ESTMPPSG_GroupObtMarks ?? totalRecord.estmppsG_GroupObtMarks ?? '')
                                            : ''}
                                    </td>
                                    <td className='border border-gray-300 p-2 text-center font-bold'>
                                        {totalRecord ? (totalRecord.TotalPercentage ?? totalRecord.totalPercentage ?? '') : ''}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <Card className='mt-8 pt-4'>
            <div className='flex items-center justify-between border-b px-6 pb-4'>
                <h3 className='font-semibold text-lg'>Promotion Report</h3>
                <div className='no-print flex gap-2'>
                    <Button variant='outline' size='sm' onClick={handleExportExcel} className='flex items-center gap-2'>
                        <FileDown className='h-4 w-4' /> Excel
                    </Button>
                    {/* <Button variant='default' size='sm' onClick={handlePrint} className='flex items-center gap-2'>
                        <Printer className='h-4 w-4' /> Print
                    </Button> */}
                </div>
            </div>
            <CardContent className='p-6'>
                <div ref={printRef} className='print-container rounded-lg bg-white'>
                    {Left_FlagAverage ? renderSuperAverageReport() : renderNormalReport()}
                </div>
            </CardContent>
        </Card>
    );
};
