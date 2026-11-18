'use client';

import { Button } from '@/components/ui/button';
import type { IExamReportCard, IMasterInstitution, ISubject, Institution } from '@/types/exam/exam-module/report';
import { Printer } from 'lucide-react';
import Image from 'next/image';

interface Props {
    reportData: IExamReportCard[];
    subjects: ISubject[];
    headerInfo: {
        mI_name?: string;
        yr?: string;
        cla?: string;
        sec?: string;
        exmmid?: string;
    };
    examName: string;
    examCode: string;
    year: string;
    institution: Institution | IMasterInstitution | null | undefined;
    onPrint?: () => void;
}

export default function ProgressCardReport({ reportData, institution, subjects, headerInfo, examName, examCode, year, onPrint }: Props) {
    // Filter only subjects that appear in results
    const resultSubjects = subjects
        .filter((s) => s.eyceS_AplResultFlg !== false)
        .sort((a, b) => (a.eyceS_SubjectOrder ?? 999) - (b.eyceS_SubjectOrder ?? 999));

    const formatDate = (dateStr?: string | null) => {
        if (!dateStr) return 'N/A';
        try {
            return new Date(dateStr).toLocaleDateString('en-GB'); // dd-MM-yyyy
        } catch {
            return 'N/A';
        }
    };

    return (
        <>
            {/* Print-only CSS */}
            <style jsx global>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #progress-card-print-area,
          #progress-card-print-area * {
            visibility: visible !important;
          }
          #progress-card-print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
          .progress-card-sheet {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            page-break-after: always !important;
            break-after: page !important;
            margin: 0 !important;
            padding: 5mm 6mm !important;
            border: 1px solid black !important;
            box-sizing: border-box !important;
          }
          table {
            width: 100% !important;
            border-collapse: collapse !important;
            font-size: 11px !important;
          }
          th,
          td {
            border: 1px solid black !important;
            padding: 3px 4px !important;
            text-align: center !important;
          }
          th {
            background-color: #c6dff7 !important;
            color: black !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          @page {
            size: A4 portrait;
            margin: 6mm !important;
          }
        }
        @media screen {
          .print-only {
            display: none !important;
          }
        }
      `}</style>

            {/* Screen: Show Print Button */}
            <div className='no-print my-6 flex justify-end'>
                <Button onClick={onPrint} className='flex items-center gap-2'>
                    <Printer className='h-4 w-4' />
                    Print All Progress Cards
                </Button>
            </div>

            {/* Printable Area */}
            <div id='progress-card-print-area' className='space-y-0'>
                {reportData.map((report, index) => (
                    <div
                        key={report.amsT_FirstName + index}
                        className='progress-card-sheet mx-auto my-6 max-w-[210mm] border border-black bg-white p-6 shadow-sm'>
                        {/* School Header Image */}
                        <div className='mb-2 text-center'>
                            <Image
                                src={institution?.mI_Logo || 'https://kusumadata.blob.core.windows.net/files/30/Vidya%20Vikas%20Marks.jpg'}
                                alt={institution?.mI_Name || 'School Header'}
                                width={800}
                                height={120}
                                className='inline-block max-h-[100px] w-auto border border-black object-contain'
                                unoptimized
                            />
                        </div>

                        {/* Student Details */}
                        <div className='my-2 text-center'>
                            <div className='inline-block bg-[#c6dff7] px-12 py-1 font-bold text-base'>STUDENT DETAILS</div>
                        </div>

                        <div className='border border-black p-2.5 text-xs'>
                            <table className='w-full'>
                                <tbody>
                                    <tr>
                                        <td className='w-1/4 py-0.5 font-bold'>Name of the Student</td>
                                        <td className='py-0.5'>
                                            : <strong>{report.amsT_FirstName}</strong>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className='py-0.5 font-bold'>Father Name</td>
                                        <td className='py-0.5'>
                                            : <strong>{report.amsT_FatherName || 'N/A'}</strong>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className='py-0.5 font-bold'>Grade</td>
                                        <td className='py-0.5'>
                                            :{' '}
                                            <strong>
                                                {headerInfo.cla} {headerInfo.sec}
                                            </strong>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className='py-0.5 font-bold'>Roll No</td>
                                        <td className='py-0.5'>
                                            : <strong>{report.amaY_RollNo ?? 'N/A'}</strong>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className='py-0.5 font-bold'>Date Of Birth</td>
                                        <td className='py-0.5'>
                                            : <strong>{formatDate(report.amsT_DOB)}</strong>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* Exam Title */}
                        <div className='my-2 text-center'>
                            <h3 className='font-bold text-base leading-snug'>
                                {examName} - {year}
                            </h3>
                            <p className='font-bold text-sm tracking-wide'>STATEMENT OF MARKS &amp; GRADE</p>
                        </div>

                        {/* Marks Table */}
                        <table className='table-bordered w-full text-center text-xs'>
                            <thead>
                                <tr>
                                    <th colSpan={6} className='bg-[#c6dff7] text-left'>
                                        PART -1 : Academic Performance : Scholastic Areas
                                    </th>
                                </tr>
                                <tr>
                                    <th rowSpan={2}>SL No</th>
                                    <th colSpan={2} rowSpan={2}>
                                        Subjects
                                    </th>
                                    <th colSpan={3}>{examCode}</th>
                                </tr>
                                <tr>
                                    <th>Max Marks</th>
                                    <th>Obtained Marks</th>
                                    <th>Grade</th>
                                </tr>
                            </thead>
                            <tbody>
                                {resultSubjects.map((subj, i) => {
                                    const mark = report.sub_list.find((m) => m.ismS_Id === subj.ismS_Id);
                                    const isAbsent = mark?.estmpS_PassFailFlg === 'AB';
                                    const showMarks = subj.eyceS_MarksDisplayFlg;
                                    const showGrade = subj.eyceS_GradeDisplayFlg;

                                    return (
                                        <tr key={subj.ismS_Id}>
                                            <td>{i + 1}</td>
                                            <td colSpan={2} className='pl-3 text-left'>
                                                {subj.ismS_SubjectName}
                                            </td>
                                            <td className='bg-[#c6dff7]'>{mark?.estmpS_MaxMarks ?? '-'}</td>
                                            <td className='bg-[#c6dff7]'>
                                                {isAbsent ? 'AB' : showMarks ? (mark?.estmpS_ObtainedMarks ?? '-') : '-'}
                                            </td>
                                            <td className='bg-[#c6dff7]'>
                                                {isAbsent ? 'AB' : showGrade ? (mark?.estmpS_ObtainedGrade ?? '-') : '-'}
                                            </td>
                                        </tr>
                                    );
                                })}

                                {/* Total Rows */}
                                <tr>
                                    <th colSpan={4} className='bg-[#c6dff7] text-right'>
                                        TOTAL
                                    </th>
                                    <th colSpan={2} className='bg-[#c6dff7]'>
                                        {report.estmP_TotalMaxMarks ?? '-'}
                                    </th>
                                </tr>
                                <tr>
                                    <th colSpan={4} className='bg-[#c6dff7] text-right'>
                                        OBTAINED
                                    </th>
                                    <th colSpan={2} className='bg-[#c6dff7]'>
                                        {report.estmP_TotalObtMarks ?? '-'}
                                    </th>
                                </tr>
                                <tr>
                                    <th colSpan={4} className='bg-[#c6dff7] text-right'>
                                        PERCENTAGE
                                    </th>
                                    <th colSpan={2} className='bg-[#c6dff7]'>
                                        {report.estmP_Percentage != null ? `${report.estmP_Percentage} %` : '-'}
                                    </th>
                                </tr>
                                <tr>
                                    <th colSpan={4} className='bg-[#c6dff7] text-right'>
                                        OVERALL GRADE
                                    </th>
                                    <th colSpan={2} className='bg-[#c6dff7]'>
                                        {report.estmP_TotalGrade ?? '-'}
                                    </th>
                                </tr>
                                <tr>
                                    <td colSpan={6} className='h-12 pl-3 text-left align-top'>
                                        <strong>Remarks :</strong>
                                    </td>
                                </tr>
                            </tbody>
                        </table>

                        {/* Grading Scale */}
                        <div className='my-2 text-center font-bold text-xs'>
                            Grading: A+={' > '}=90% to 100%, A={' > '}=80% to 89%, B+={' > '}=70% to 79%, B={' > '}=60% to 69%, C={' > '}
                            =40% to 59%, D={' > '}=0% to 39%
                        </div>

                        {/* Signatures */}
                        <div className='mt-4 grid grid-cols-3 text-center text-xs'>
                            <div>
                                <div className='mx-auto h-10 w-28 border-black border-t' />
                                <p className='font-semibold'>Class Teacher Signature</p>
                            </div>
                            <div>
                                <div className='mx-auto h-10 w-28 border-black border-t' />
                                <p className='font-semibold'>Principal Signature</p>
                            </div>
                            <div>
                                <div className='mx-auto h-10 w-28 border-black border-t' />
                                <p className='font-semibold'>Parent Signature</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
}
