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
    reopenDate: string;
    institution: Institution | IMasterInstitution | null | undefined;
    onPrint?: () => void;
}

export default function ProgressCardReport({
    reportData,
    institution,
    subjects,
    headerInfo,
    examName,
    examCode,
    year,
    reopenDate,
    onPrint
}: Props) {
    const formatDate = (dateStr?: string | null) => {
        if (!dateStr) return 'N/A';
        try {
            return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(dateStr));
        } catch {
            return 'N/A';
        }
    };

    return (
        <>
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Source+Sans+Pro:wght@400;600;700&display=swap');

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
                    .page-break-after {
                        page-break-after: always !important;
                    }
                    @page {
                        size: A4 portrait;
                        margin: 15mm 10mm 15mm 10mm;
                    }
                }

                .report-container {
                    font-family: 'Source Sans Pro', sans-serif !important;
                    color: black;
                }

                .table-custom {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 1.5rem;
                }

                .table-custom th, .table-custom td {
                    border: 1px solid #94a3b8; /* slate-400 */
                    padding: 8px 12px;
                    text-align: center;
                    font-size: 0.95rem;
                }

                .table-custom th {
                    background-color: #D6E8F7 !important;
                    font-weight: bold;
                    color: black;
                }

                .table-custom td.bg-blue-total {
                    background-color: #D6E8F7 !important;
                    font-weight: bold;
                    color: black;
                }

                .text-left { text-align: left !important; }
                .text-center { text-align: center !important; }
                .text-right { text-align: right !important; }
                .font-bold { font-weight: bold; }
            `}</style>

            <div className='no-print my-6 flex justify-end'>
                <Button onClick={onPrint} className='flex items-center gap-2'>
                    <Printer className='h-4 w-4' />
                    Print All Progress Cards
                </Button>
            </div>

            <div id='progress-card-print-area' className='report-container'>
                {reportData.map((report, index) => {
                    // Compute sums dynamically
                    const totalMax = report.sub_list.reduce((acc, m) => acc + (m.estmpS_MaxMarks || 0), 0);
                    const totalMin = report.sub_list.reduce((acc, m) => acc + (m.estmpS_MinMarks ?? m.eyceS_MinMarks ?? 0), 0);
                    const totalObt = report.sub_list.reduce((acc, m) => {
                        const marks = m.estmpS_ObtainedMarks ?? 0;
                        return acc + (m.estmpS_PassFailFlg === 'AB' ? 0 : marks);
                    }, 0);

                    // Use report.estmP_Percentage if available, otherwise calculate
                    const percentage = report.estmP_Percentage ?? (totalMax > 0 ? Math.round((totalObt / totalMax) * 100) : 0);

                    return (
                        <div
                            key={report.amsT_Id + index}
                            className='report-page mb-8 flex min-h-[297mm] flex-col justify-between bg-white p-6'>
                            <div>
                                {/* Header Image */}
                                <div className='mb-6 w-full text-center'>
                                    <Image
                                        src='https://dcampusstrg.blob.core.windows.net/files/17/NAACDocumentsUpload/6a4bad20-fd91-45ff-b0cd-b152f3d07edc.jpg'
                                        alt='School Header'
                                        width={800}
                                        height={150}
                                        className='mx-auto h-auto w-full'
                                        unoptimized
                                    />
                                </div>

                                {/* Student Details Section */}
                                <div className='mb-6 flex items-start justify-between'>
                                    <div className='grid w-2/3 grid-cols-12 gap-y-1 text-sm leading-6'>
                                        <div className='col-span-4 font-bold text-slate-800'>Name</div>
                                        <div className='col-span-1 text-slate-800'>:</div>
                                        <div className='col-span-7 font-bold text-slate-900'>{report.amsT_FirstName}</div>

                                        <div className='col-span-4 font-bold text-slate-800'>Admission No</div>
                                        <div className='col-span-1 text-slate-800'>:</div>
                                        <div className='col-span-7 font-bold text-slate-900'>{report.amsT_AdmNo}</div>

                                        <div className='col-span-4 font-bold text-slate-800'>Class & Section</div>
                                        <div className='col-span-1 text-slate-800'>:</div>
                                        <div className='col-span-7 font-bold text-slate-900'>
                                            {report.asmcL_ClassName} - {report.asmC_SectionName}
                                        </div>

                                        <div className='col-span-4 font-bold text-slate-800'>Date of birth</div>
                                        <div className='col-span-1 text-slate-800'>:</div>
                                        <div className='col-span-7 font-bold text-slate-900'>{formatDate(report.amsT_DOB)}</div>

                                        <div className='col-span-4 font-bold text-slate-800'>Mother's name</div>
                                        <div className='col-span-1 text-slate-800'>:</div>
                                        <div className='col-span-7 font-bold text-slate-900'>{report.amsT_MotherName}</div>

                                        <div className='col-span-4 font-bold text-slate-800'>Father's name</div>
                                        <div className='col-span-1 text-slate-800'>:</div>
                                        <div className='col-span-7 font-bold text-slate-900'>{report.amsT_FatherName}</div>
                                    </div>
                                    <div className='flex w-1/3 justify-end'>
                                        {report.amsT_Photoname ? (
                                            <img
                                                src={report.amsT_Photoname}
                                                alt='Student'
                                                className='h-[120px] w-[120px] rounded border border-slate-300 object-cover'
                                            />
                                        ) : (
                                            <div className='flex h-[120px] w-[120px] items-center justify-center rounded border border-slate-300 border-dashed text-slate-400'>
                                                Photo
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Exam Title */}
                                <div className='my-6 text-center'>
                                    <h3 className='font-bold text-blue-900 text-xl uppercase tracking-wide'>
                                        {examName} - {year}
                                    </h3>
                                </div>

                                {/* Marks Table */}
                                <table className='table-custom'>
                                    <thead>
                                        <tr>
                                            <th rowSpan={2} style={{ width: '60px' }}>
                                                SL No
                                            </th>
                                            <th rowSpan={2}>SUBJECT(SCHOLASTIC)</th>
                                            <th colSpan={3} className='uppercase'>
                                                {examCode}
                                            </th>
                                        </tr>
                                        <tr>
                                            <th style={{ width: '120px' }}>Max Marks</th>
                                            <th style={{ width: '120px' }}>Min Marks</th>
                                            <th style={{ width: '150px' }}>Obtained Marks</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {report.sub_list.map((mark, i) => {
                                            const subject = subjects.find((s) => s.ismS_Id === mark.ismS_Id);
                                            if (!subject) return null;

                                            if (subject.eyceS_AplResultFlg === false) return null;

                                            const isAbsent = mark.estmpS_PassFailFlg === 'AB';
                                            const marksDisplayFlg = subject.eyceS_MarksDisplayFlg ?? true;
                                            const isSubjectCodeSE = subject.ismS_SubjectCode === 'SE';

                                            return (
                                                <tr key={mark.ismS_Id}>
                                                    <td>{i + 1}</td>
                                                    <td className='pl-4 text-left font-semibold text-slate-800'>
                                                        {subject.ismS_SubjectName}
                                                    </td>
                                                    <td>{mark.estmpS_MaxMarks}</td>
                                                    <td>{mark.estmpS_MinMarks ?? mark.eyceS_MinMarks ?? '-'}</td>
                                                    <td className='font-semibold text-slate-900'>
                                                        {(() => {
                                                            if (isAbsent && marksDisplayFlg && !isSubjectCodeSE) {
                                                                return 'AB';
                                                            }
                                                            if (!isAbsent && isSubjectCodeSE) {
                                                                return '-';
                                                            }
                                                            if (!isAbsent && marksDisplayFlg) {
                                                                return mark.estmpS_ObtainedMarks;
                                                            }
                                                            return '';
                                                        })()}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                        {/* TOTAL row */}
                                        <tr>
                                            <td className='bg-blue-total'></td>
                                            <td className='bg-blue-total pl-4 text-left font-bold'>TOTAL</td>
                                            <td className='bg-blue-total font-bold'>{totalMax}</td>
                                            <td className='bg-blue-total font-bold'>{totalMin}</td>
                                            <td className='bg-blue-total font-bold'>{totalObt}</td>
                                        </tr>
                                        {/* PERCENTAGE row */}
                                        <tr>
                                            <td colSpan={4} className='bg-blue-total pl-4 text-left font-bold'>
                                                PERCENTAGE
                                            </td>
                                            <td className='bg-blue-total text-center font-bold'>{percentage} %</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            {/* Signatures Section at the very bottom */}
                            <div className='mt-16 flex items-end justify-between px-2 pb-4'>
                                <div className='font-bold text-slate-800 text-sm'>Principal /H.M Signature</div>
                                <div className='text-center font-bold text-slate-800 text-sm'>Class Teacher Signature</div>
                                <div className='text-right font-bold text-slate-800 text-sm'>Parent Signature</div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </>
    );
}
