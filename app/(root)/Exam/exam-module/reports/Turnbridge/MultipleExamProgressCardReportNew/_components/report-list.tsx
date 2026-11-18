'use client';

import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Printer } from 'lucide-react';
import { mockReportData } from './mock-data';

/**
 * Multiple Exam Progress Card Report List Component
 * Renders the report cards using the high-fidelity design from BGHS legacy
 * but with the printing logic and architecture of TBS Report School.
 */

interface ReportListProps {
    data: any;
    params: any;
}

export const ReportList = ({ data, params }: ReportListProps) => {
    const handlePrint = () => {
        window.print();
    };

    // Fallback to mock data if no real data is provided
    const activeData = data && data.getstudentdetails && data.getstudentdetails.length > 0 ? data : mockReportData;

    const { getstudentdetails = [], getexamdetails = [], work_attendence = [], present_attendence = [] } = activeData;

    return (
        <div className='mx-auto w-full max-w-[1200px]'>
            {/* Print Button - Matching TBS Report School style */}
            <div className='no-print mb-6 flex justify-end gap-3 rounded-t-md border-gray-200 border-b bg-gray-50/50 px-4 py-3'>
                <Button
                    onClick={handlePrint}
                    className='flex w-fit items-center gap-2 bg-sky-800 font-medium text-white shadow-sm transition-colors hover:bg-sky-900'>
                    <Printer className='h-4 w-4' /> Print Reports
                </Button>
            </div>

            <div id='report-print-area'>
                <style
                    dangerouslySetInnerHTML={{
                        __html: `
                    @media print {
                        @page { size: A4 portrait; margin: 10mm; }
                        body {
                            visibility: hidden;
                            -webkit-print-color-adjust: exact !important;
                            print-color-adjust: exact !important;
                        }
                        #report-print-area, #report-print-area * {
                            visibility: visible;
                        }
                        #report-print-area {
                            position: absolute;
                            left: 0;
                            top: 0;
                            width: 100%;
                        }
                        .no-print {
                            display: none !important;
                        }
                        .page-break {
                            page-break-after: always;
                        }
                    }
                    .report-container {
                        width: 100%;
                        margin: 0 auto;
                        padding: 10px;
                        box-sizing: border-box;
                        background-color: #fff;
                    }
                    .report-table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-bottom: 15px;
                        border: 1px solid #000;
                        font-family: 'Times New Roman', serif;
                        font-size: 12px;
                    }
                    .report-table th, .report-table td {
                        border: 1px solid #000;
                        padding: 4px;
                        text-align: center;
                    }
                    .text-left { text-align: left !important; }
                    .font-bold { font-weight: bold; }
                    .header { text-align: center; margin-bottom: 15px; }
                    .student-info-table {
                        width: 100%;
                        border: 2px solid #000;
                        border-left: 0;
                        border-right: 0;
                        margin-bottom: 15px;
                        font-size: 12px;
                    }
                    .student-info-table td {
                        padding: 5px;
                        vertical-align: top;
                    }
                `
                    }}
                />

                {getstudentdetails.map((student: any, index: number) => {
                    const studentMarks = student.marks || [];
                    const studentSubjects = student.subjects || [];
                    const scholasticSubjects = studentSubjects.filter((s: any) => s.EYCES_AplResultFlg);
                    const nonScholasticSubjects = studentSubjects.filter((s: any) => !s.EYCES_AplResultFlg);
                    const studentWorkAtt = work_attendence?.find((a: any) => a.AMST_Id === student.AMST_Id);
                    const studentPresAtt = present_attendence?.find((a: any) => a.AMST_Id === student.AMST_Id);

                    return (
                        <div
                            key={student.AMST_Id}
                            className={`report-container ${index !== getstudentdetails.length - 1 ? 'page-break' : ''} mb-8`}>
                            {/* Header */}
                            <div className='header'>
                                <div className='border-black border-t-2 pt-2 font-bold text-xl uppercase'>Progress Report</div>
                                <div className='font-bold text-lg'>ACADEMIC YEAR {params.academicYearName || '2023-24'}</div>
                            </div>

                            {/* Student Information */}
                            <table className='student-info-table'>
                                <tbody>
                                    <tr>
                                        <td className='w-[40%]'>
                                            <div className='flex justify-between'>
                                                <b>NAME</b> <span>: {student.studentname}</span>
                                            </div>
                                            <div className='flex justify-between'>
                                                <b>D.O.B</b>{' '}
                                                <span>: {student.dob ? format(new Date(student.dob), 'dd-MMM-yyyy') : ''}</span>
                                            </div>
                                            <div className='flex justify-between'>
                                                <b>CLASS TEACHER</b> <span>: {student.clastechname}</span>
                                            </div>
                                        </td>
                                        <td className='w-[30%]'>
                                            <div className='flex justify-between'>
                                                <b>CLASS</b> <span>: {student.classname || params.classname}</span>
                                            </div>
                                            <div className='flex justify-between'>
                                                <b>ROLL NO</b> <span>: {student.rollno}</span>
                                            </div>
                                        </td>
                                        <td className='w-[30%]'>
                                            <div className='flex justify-between'>
                                                <b>SECTION</b> <span>: {student.sectionname || params.sectionname}</span>
                                            </div>
                                            <div className='flex justify-between'>
                                                <b>ADM. NO</b> <span>: {student.admno}</span>
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>

                            {/* Main Marks Table */}
                            <table className='report-table'>
                                <thead>
                                    <tr className='bg-gray-100'>
                                        <th className='w-[200px] text-left font-bold'>
                                            SUBJECTS
                                        </th>
                                        {getexamdetails.map((exam: any) => (
                                            <th key={exam.emE_Id} className='font-bold'>
                                                {exam.emE_ExamName} <br />
                                                {exam.eyceS_MaxMarks ? `(${exam.eyceS_MaxMarks})` : ''}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {/* Scholastic Subjects */}
                                    {scholasticSubjects.map((sub: any) => (
                                        <tr key={sub.ISMS_Id}>
                                            <td className='text-left font-bold'>{sub.ISMS_SubjectName}</td>
                                            {getexamdetails.map((exam: any) => {
                                                const mark = studentMarks.find(
                                                    (m: any) => m.EME_Id === exam.emE_Id && m.ISMS_Id === sub.ISMS_Id
                                                );
                                                return (
                                                    <td key={exam.emE_Id}>
                                                        {mark?.ExamConductFlag === 1 ? (
                                                            mark.PASSORFAIL === 'AB' ||
                                                                mark.PASSORFAIL === 'OD' ||
                                                                mark.PASSORFAIL === 'M' ? (
                                                                <span className='font-bold'>{mark.PASSORFAIL}</span>
                                                            ) : exam.emE_ExamName === 'Grade' ? (
                                                                mark.GRADE
                                                            ) : (
                                                                mark.OBTAINEDMARKS
                                                            )
                                                        ) : (
                                                            '--'
                                                        )}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}

                                    {/* Grand Total Row */}
                                    <tr className='bg-gray-50 font-bold'>
                                        <td className='text-left uppercase'>Grand Total</td>
                                        {getexamdetails.map((exam: any) => {
                                            const mark = studentMarks.find((m: any) => m.EME_Id === exam.emE_Id && m.ISMS_Id === 50001);
                                            return (
                                                <td key={exam.emE_Id}>
                                                    {mark?.ExamConductFlag === 1
                                                        ? mark.PASSORFAIL === 'AB'
                                                            ? ''
                                                            : mark.OBTAINEDMARKS
                                                        : '--'}
                                                </td>
                                            );
                                        })}
                                    </tr>

                                    {/* Non-Scholastic Subjects */}
                                    {nonScholasticSubjects.map((sub: any) => (
                                        <tr key={sub.ISMS_Id}>
                                            <td className='text-left font-bold'>{sub.ISMS_SubjectName}</td>
                                            {getexamdetails.map((exam: any) => {
                                                const mark = studentMarks.find(
                                                    (m: any) => m.EME_Id === exam.emE_Id && m.ISMS_Id === sub.ISMS_Id
                                                );
                                                return (
                                                    <td key={exam.emE_Id}>
                                                        {mark?.ExamConductFlag === 1 ? (
                                                            mark.PASSORFAIL === 'AB' ||
                                                                mark.PASSORFAIL === 'OD' ||
                                                                mark.PASSORFAIL === 'M' ? (
                                                                <span className='font-bold'>{mark.PASSORFAIL}</span>
                                                            ) : exam.emE_ExamName === 'Grade' ? (
                                                                mark.GRADE
                                                            ) : (
                                                                mark.OBTAINEDMARKS
                                                            )
                                                        ) : (
                                                            '--'
                                                        )}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </tbody >
                            </table >

                            {/* Exam Wise Remarks */}
                            < table className='report-table' >
                                <thead>
                                    <tr className='bg-gray-100'>
                                        <th colSpan={2} className='font-bold uppercase'>
                                            Exam Wise Remarks
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {getexamdetails
                                        .filter((e: any) => e.emE_ExamName !== 'Total' && e.emE_ExamName !== 'Grade')
                                        .map((exam: any) => {
                                            const totalMark = studentMarks.find(
                                                (m: any) => m.EME_Id === exam.emE_Id && m.ISMS_Id === 50001
                                            );
                                            return (
                                                <tr key={exam.emE_Id}>
                                                    <td className='w-1/3 text-left font-bold'>{exam.emE_ExamName}</td>
                                                    <td className='text-left'>{totalMark?.EMGD_Remarks || ''}</td>
                                                </tr>
                                            );
                                        })}
                                </tbody>
                            </table>

                            {/* Attendance Table */}
                            {params.showAttendance && (
                                <table className='report-table text-[10px]'>
                                    <thead>
                                        <tr className='bg-gray-100 font-bold uppercase'>
                                            <th colSpan={16}>Attendance</th>
                                        </tr>
                                        <tr className='font-bold'>
                                            <th colSpan={2}>MONTH</th>
                                            {['MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC', 'JAN', 'FEB', 'MAR', 'APR'].map(
                                                (m) => (
                                                    <th key={m}>{m}</th>
                                                )
                                            )}
                                            <th>TOTAL</th>
                                            <th>TOTAL %</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td className='text-left font-bold' colSpan={2}>
                                                WORKING DAYS
                                            </td>
                                            <td>{studentWorkAtt?.May || '-'}</td>
                                            <td>{studentWorkAtt?.June || '-'}</td>
                                            <td>{studentWorkAtt?.July || '-'}</td>
                                            <td>{studentWorkAtt?.August || '-'}</td>
                                            <td>{studentWorkAtt?.September || '-'}</td>
                                            <td>{studentWorkAtt?.October || '-'}</td>
                                            <td>{studentWorkAtt?.November || '-'}</td>
                                            <td>{studentWorkAtt?.December || '-'}</td>
                                            <td>{studentWorkAtt?.January || '-'}</td>
                                            <td>{studentWorkAtt?.Febrauary || '-'}</td>
                                            <td>{studentWorkAtt?.March || '-'}</td>
                                            <td>{studentWorkAtt?.April || '-'}</td>
                                            <td className='font-bold'>{studentWorkAtt?.TotalWorkingDays || '-'}</td>
                                            <td className='font-bold'>{studentWorkAtt?.Total_Percentage || '-'}</td>
                                        </tr>
                                        <tr>
                                            <td className='text-left font-bold' colSpan={2}>
                                                PRESENT DAYS
                                            </td>
                                            <td>{studentPresAtt?.May || '-'}</td>
                                            <td>{studentPresAtt?.June || '-'}</td>
                                            <td>{studentPresAtt?.July || '-'}</td>
                                            <td>{studentPresAtt?.August || '-'}</td>
                                            <td>{studentPresAtt?.September || '-'}</td>
                                            <td>{studentPresAtt?.October || '-'}</td>
                                            <td>{studentPresAtt?.November || '-'}</td>
                                            <td>{studentPresAtt?.December || '-'}</td>
                                            <td>{studentPresAtt?.January || '-'}</td>
                                            <td>{studentPresAtt?.Febrauary || '-'}</td>
                                            <td>{studentPresAtt?.March || '-'}</td>
                                            <td>{studentPresAtt?.April || '-'}</td>
                                            <td className='font-bold'>{studentPresAtt?.TotalPresentDays || '-'}</td>
                                            <td className='font-bold'>{studentPresAtt?.Total_Percentage || '-'}</td>
                                        </tr>
                                    </tbody >
                                </table >
                            )
                            }

                            {/* Signatures */}
                            <div className='mt-8 space-y-16'>
                                <div className='flex border-black border-b pb-1'>
                                    <span className='mr-2 font-bold uppercase'>Remarks:</span>
                                    <span className='flex-grow'></span>
                                </div>

                                <div className='grid grid-cols-3 pt-10 text-center font-bold text-xs'>
                                    <div className='flex flex-col items-center'>
                                        <div className='w-4/5 border-black border-t pt-1 uppercase'>Principal's Signature</div>
                                    </div>
                                    <div className='flex flex-col items-center'>
                                        <div className='w-4/5 border-black border-t pt-1 uppercase'>Class Teacher's Signature</div>
                                    </div>
                                    <div className='flex flex-col items-center'>
                                        <div className='w-4/5 border-black border-t pt-1 uppercase'>Parent's Signature</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div >
        </div >
    );
};
