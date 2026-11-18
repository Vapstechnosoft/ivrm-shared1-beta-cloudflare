'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Printer } from 'lucide-react';
import { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import * as XLSX from 'xlsx';

interface ReportViewProps {
    reportData: any;
    reportParams: any;
}

export function ReportView({ reportData, reportParams }: ReportViewProps) {
    const printRef = useRef<HTMLDivElement>(null);

    const { getstudentdetails = [], getexamdetails = [], yearName = reportParams?.yearName || '' } = reportData;

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: `Progress_Card_Report_${yearName}`
    });

    const exportToExcel = () => {
        if (!printRef.current) return;
        const tables = printRef.current.querySelectorAll('table');
        if (tables.length === 0) return;

        const wb = XLSX.utils.book_new();
        tables.forEach((table, index) => {
            const ws = XLSX.utils.table_to_sheet(table);
            XLSX.utils.book_append_sheet(wb, ws, `Student_${index + 1}`);
        });
        XLSX.writeFile(wb, `Progress_Card_Report_${yearName}.xlsx`);
    };

    if (!getstudentdetails || getstudentdetails.length === 0) {
        return (
            <Card className='mt-6'>
                <CardContent className='p-6 text-center text-muted-foreground'>
                    No student data available for the selected criteria.
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className='mt-6 overflow-hidden border-none shadow-md'>
            <CardHeader className='flex flex-row items-center justify-between border-b bg-muted/30 py-3'>
                <CardTitle className='font-medium text-lg'>Progress Card Preview</CardTitle>
                <div className='flex gap-2'>
                    <Button variant='outline' size='sm' onClick={exportToExcel}>
                        <Download className='mr-2 h-4 w-4' />
                        Excel
                    </Button>
                    <Button variant='default' size='sm' onClick={handlePrint}>
                        <Printer className='mr-2 h-4 w-4' />
                        Print
                    </Button>
                </div>
            </CardHeader>
            <CardContent className='p-0'>
                <div ref={printRef} className='overflow-auto bg-white p-8' id='Baldwin'>
                    <style
                        type='text/css'
                        dangerouslySetInnerHTML={{
                            __html: `
                        @media print {
                            @page { size: portrait; margin: 10mm; }
                            .page-break { page-break-before: always; }
                            #Baldwin { padding: 0 !important; }
                        }
                        .report-table th, .report-table td { border: 1px solid black; padding: 4px; }
                        .report-table th { background-color: #f3f4f6; }
                    `
                        }}
                    />

                    {getstudentdetails.map((report: any, index: number) => (
                        <div key={report.AMST_Id} className={`${index > 0 ? 'page-break' : ''} mb-12`}>
                            {/* Header */}
                            <div className='mb-6 text-center'>
                                <h2 className='font-bold text-xl uppercase'>PROGRESS REPORT</h2>
                                <h3 className='font-bold text-lg'>ACADEMIC YEAR {yearName}</h3>
                            </div>

                            {/* Student Info */}
                            <div className='mb-6 grid grid-cols-1 gap-4 rounded border p-4 font-bold text-sm uppercase md:grid-cols-3'>
                                <div className='space-y-2'>
                                    <div className='flex'>
                                        <span className='w-32'>NAME</span>
                                        <span>: {report.studentname}</span>
                                    </div>
                                    <div className='flex'>
                                        <span className='w-32'>D.O.B</span>
                                        <span>
                                            :{' '}
                                            {report.dob
                                                ? new Date(report.dob).toLocaleDateString('en-GB', {
                                                      day: '2-digit',
                                                      month: 'short',
                                                      year: 'numeric'
                                                  })
                                                : '--'}
                                        </span>
                                    </div>
                                    <div className='flex'>
                                        <span className='w-32'>CLASS TEACHER</span>
                                        <span>: {report.clastechname || '--'}</span>
                                    </div>
                                </div>
                                <div className='space-y-2'>
                                    <div className='flex'>
                                        <span className='w-24'>CLASS</span>
                                        <span>: {report.classname}</span>
                                    </div>
                                    <div className='flex'>
                                        <span className='w-24'>ROLL NO</span>
                                        <span>: {report.rollno}</span>
                                    </div>
                                </div>
                                <div className='space-y-2'>
                                    <div className='flex'>
                                        <span className='w-24'>SECTION</span>
                                        <span>: {report.sectionname}</span>
                                    </div>
                                    <div className='flex'>
                                        <span className='w-24'>ADM. NO</span>
                                        <span>: {report.admno}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Main Marks Table */}
                            <div className='overflow-x-auto'>
                                <table className='report-table w-full border-collapse text-center text-xs'>
                                    <thead>
                                        <tr>
                                            <th className='w-48 p-2 text-left'>SUBJECTS</th>
                                            {getexamdetails.map((exam: any) => (
                                                <th key={exam.emE_Id} className='p-2'>
                                                    {exam.emE_ExamName} <br />
                                                    {exam.eyceS_MaxMarks ? `(${exam.eyceS_MaxMarks})` : ''}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {/* Applicable Subjects */}
                                        {report.subjects
                                            ?.filter((s: any) => s.EYCES_AplResultFlg)
                                            .map((subj: any) => (
                                                <tr key={subj.ISMS_Id}>
                                                    <td className='p-2 text-left font-bold'>{subj.ISMS_SubjectName}</td>
                                                    {getexamdetails.map((exam: any) => {
                                                        const mark = report.marks?.find(
                                                            (m: any) => m.EME_Id === exam.emE_Id && m.ISMS_Id === subj.ISMS_Id
                                                        );

                                                        if (mark?.ExamConductFlag === 0) return <td key={exam.emE_Id}>--</td>;

                                                        if (
                                                            mark?.PASSORFAIL === 'AB' ||
                                                            mark?.PASSORFAIL === 'OD' ||
                                                            mark?.PASSORFAIL === 'M'
                                                        ) {
                                                            return (
                                                                <td key={exam.emE_Id} className='font-bold'>
                                                                    {mark.PASSORFAIL}
                                                                </td>
                                                            );
                                                        }

                                                        if (exam.emE_ExamName === 'Grade') {
                                                            return (
                                                                <td key={exam.emE_Id} className='font-bold'>
                                                                    {mark?.GRADE || '--'}
                                                                </td>
                                                            );
                                                        }

                                                        return (
                                                            <td key={exam.emE_Id} className='font-bold'>
                                                                {mark?.OBTAINEDMARKS ?? '--'}
                                                            </td>
                                                        );
                                                    })}
                                                </tr>
                                            ))}

                                        {/* Grand Total Row */}
                                        <tr className='border-black border-t-2'>
                                            <td className='p-2 text-left font-bold'>GRAND TOTAL</td>
                                            {getexamdetails.map((exam: any) => {
                                                const totalMark = report.marks?.find(
                                                    (m: any) => m.EME_Id === exam.emE_Id && m.ISMS_Id === 50001
                                                );

                                                if (exam.emE_ExamName === 'Grade') return <td key={exam.emE_Id}>--</td>;

                                                if (totalMark?.ExamConductFlag === 0) return <td key={exam.emE_Id}>--</td>;

                                                return (
                                                    <td key={exam.emE_Id} className='font-bold'>
                                                        {totalMark?.OBTAINEDMARKS ?? '--'}
                                                    </td>
                                                );
                                            })}
                                        </tr>

                                        {/* Auxiliary Subjects Header */}
                                        {report.nonapplicablecount > 0 && (
                                            <>
                                                <tr className='border-black border-t-2 bg-gray-100'>
                                                    <td colSpan={getexamdetails.length + 1} className='p-2 text-left font-bold italic'>
                                                        AUXILIARY SUBJECTS
                                                    </td>
                                                </tr>
                                                <tr className='bg-gray-50'>
                                                    <td className='p-2 text-left font-bold'>SUBJECTS</td>
                                                    <td colSpan={getexamdetails.length} className='p-2 text-center font-bold'>
                                                        GRADE
                                                    </td>
                                                </tr>
                                                {report.subjects
                                                    ?.filter((s: any) => !s.EYCES_AplResultFlg)
                                                    .map((subj: any) => (
                                                        <tr key={subj.ISMS_Id}>
                                                            <td className='p-2 text-left font-bold'>{subj.ISMS_SubjectName}</td>
                                                            {getexamdetails.map((exam: any) => {
                                                                const mark = report.marks?.find(
                                                                    (m: any) => m.EME_Id === exam.emE_Id && m.ISMS_Id === subj.ISMS_Id
                                                                );

                                                                if (mark?.ExamConductFlag === 0) return <td key={exam.emE_Id}>--</td>;

                                                                if (
                                                                    mark?.PASSORFAIL === 'AB' ||
                                                                    mark?.PASSORFAIL === 'OD' ||
                                                                    mark?.PASSORFAIL === 'M'
                                                                ) {
                                                                    return (
                                                                        <td key={exam.emE_Id} className='font-bold'>
                                                                            {mark.PASSORFAIL}
                                                                        </td>
                                                                    );
                                                                }

                                                                return (
                                                                    <td key={exam.emE_Id} className='font-bold'>
                                                                        {mark?.GRADE || '--'}
                                                                    </td>
                                                                );
                                                            })}
                                                        </tr>
                                                    ))}
                                            </>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Remarks */}
                            <div className='mt-12 flex items-center gap-2 font-bold text-sm uppercase'>
                                <span>REMARKS :</span>
                                <div className='flex-1 border-black border-b'></div>
                            </div>

                            {/* Signatures */}
                            <div className='mt-20 grid grid-cols-3 gap-8 text-center font-bold text-xs uppercase'>
                                <div className='border-black border-t pt-2'>PRINCIPAL&apos;S SIGNATURE</div>
                                <div className='border-black border-t pt-2'>CLASS TEACHER&apos;S SIGNATURE</div>
                                <div className='border-black border-t pt-2'>PARENT&apos;S SIGNATURE</div>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
