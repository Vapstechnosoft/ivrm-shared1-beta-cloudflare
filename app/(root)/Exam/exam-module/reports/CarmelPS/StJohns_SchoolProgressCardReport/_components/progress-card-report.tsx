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

export default function ProgressCardReport({ reportData, institution, subjects, headerInfo, examName, year, onPrint }: Props) {
    return (
        <>
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
                    @page {
                        size: A4 portrait;
                        margin: 5mm;
                    }
                    .table-bordered {
                        border: 1px solid black !important;
                    }
                    .table-bordered th, .table-bordered td {
                        border: 1px solid black !important;
                    }
                    .bg-blue-header {
                        background-color: #c6dff7 !important;
                        -webkit-print-color-adjust: exact;
                    }
                }

                .st-johns-container {
                    font-family: 'Source Sans Pro', sans-serif !important;
                    color: black;
                }

                .table-custom {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 1rem;
                }

                .table-custom th, .table-custom td {
                    border: 1px solid black;
                    padding: 8px;
                    text-align: center;
                }

                .bg-blue-header {
                    background-color: #c6dff7;
                }

                .text-left { text-align: left !important; }
                .text-center { text-align: center !important; }
                .text-right { text-align: right !important; }
                .font-bold { font-weight: bold; }
                .padding-top-10 { padding-top: 10px; }
                .margin-top-15 { margin-top: 15px; }
                .margin-top-100 { margin-top: 100px; }
                .margin-top-150 { margin-top: 150px; }
            `}</style>

            <div className='no-print my-6 flex justify-end'>
                <Button onClick={onPrint} className='flex items-center gap-2'>
                    <Printer className='h-4 w-4' />
                    Print All Progress Cards
                </Button>
            </div>

            <div id='progress-card-print-area' className='st-johns-container'>
                {reportData.map((report, index) => (
                    <div
                        key={report.amsT_Id + index}
                        className='report-page mb-8 border border-black bg-white p-4'
                        style={{ pageBreakBefore: 'always' }}>
                        {/* Header Image */}
                        <div className='mb-4 w-full text-center'>
                            <Image
                                src={
                                    institution?.mI_Logo ||
                                    'https://dcampusstrg.blob.core.windows.net/files/17/NAACDocumentsUpload/6a4bad20-fd91-45ff-b0cd-b152f3d07edc.jpg'
                                }
                                alt='School Header'
                                width={800}
                                height={150}
                                className='mx-auto h-auto w-full'
                                unoptimized
                            />
                        </div>

                        {/* Student Details Section */}
                        <div className='mb-6 border border-black p-4'>
                            <div className='grid grid-cols-12 gap-4'>
                                <div className='col-span-8 space-y-4'>
                                    <div className='grid grid-cols-12 font-bold text-2xl'>
                                        <div className='col-span-5'>Name of the Student</div>
                                        <div className='col-span-1'>:</div>
                                        <div className='col-span-6'>{report.amsT_FirstName}</div>
                                    </div>
                                    <div className='grid grid-cols-12 font-bold text-2xl'>
                                        <div className='col-span-5'>Reg No</div>
                                        <div className='col-span-1'>:</div>
                                        <div className='col-span-6'>{report.amsT_RegistrationNo}</div>
                                    </div>
                                    <div className='grid grid-cols-12 font-bold text-2xl'>
                                        <div className='col-span-5'>Class</div>
                                        <div className='col-span-1'>:</div>
                                        <div className='col-span-6'>
                                            {report.asmcL_ClassName} - {report.asmC_SectionName}
                                        </div>
                                    </div>
                                </div>
                                <div className='col-span-4 text-right'>
                                    {report.amsT_Photoname ? (
                                        <img
                                            src={report.amsT_Photoname}
                                            alt='Student'
                                            style={{ width: '150px', height: '150px', border: '1px solid black', objectFit: 'cover' }}
                                        />
                                    ) : (
                                        <div
                                            style={{
                                                width: '150px',
                                                height: '150px',
                                                border: '1px solid black',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}>
                                            Photo
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Exam Title */}
                        <div className='mb-6 text-center'>
                            <h3 className='font-bold text-2xl leading-tight'>
                                {examName.toUpperCase()} - {year} <br />
                                <br />
                                STATEMENT OF MARKS & GRADE
                            </h3>
                        </div>

                        {/* Scholastic Table */}
                        <table className='table-custom mb-6'>
                            <thead>
                                <tr className='bg-blue-header font-bold text-black'>
                                    <th rowSpan={2} style={{ width: '80px' }}>
                                        SL No
                                    </th>
                                    <th colSpan={2} rowSpan={2}>
                                        SUBJECT(SCHOLASTIC)
                                    </th>
                                    <th colSpan={4}>{examName}</th>
                                </tr>
                                <tr className='bg-blue-header font-bold text-black'>
                                    <th>Max Marks</th>
                                    <th>Min Marks</th>
                                    <th>Obtained Marks</th>
                                    <th>Grade</th>
                                </tr>
                            </thead>
                            <tbody>
                                {report.sub_list
                                    .filter((m) => {
                                        const sub = subjects.find((s) => s.ismS_Id === m.ismS_Id);
                                        return sub?.eyceS_AplResultFlg !== false;
                                    })
                                    .map((mark, i) => {
                                        const subject = subjects.find((s) => s.ismS_Id === mark.ismS_Id);
                                        if (!subject) return null;
                                        const isAbsent = mark.estmpS_PassFailFlg === 'AB';

                                        return (
                                            <tr key={mark.ismS_Id}>
                                                <td>{i + 1}</td>
                                                <td colSpan={2} className='pl-4 text-left font-bold'>
                                                    {subject.ismS_SubjectName}
                                                </td>
                                                <td className='bg-blue-header'>{mark.estmpS_MaxMarks}</td>
                                                <td className='bg-blue-header'>{mark.estmpS_MinMarks}</td>
                                                <td className='bg-blue-header'>{isAbsent ? 'AB' : mark.estmpS_ObtainedMarks}</td>
                                                <td className='bg-blue-header'>{mark.estmpS_ObtainedGrade}</td>
                                            </tr>
                                        );
                                    })}
                                <tr className='bg-blue-header font-bold'>
                                    <td>&nbsp;</td>
                                    <td colSpan={2} className='pl-4 text-left font-bold uppercase'>
                                        TOTAL
                                    </td>
                                    <td>{report.estmP_TotalMaxMarks}</td>
                                    <td>{/* Min Marks Total - often calculated or from estmP_MinMarks */}</td>
                                    <td>{report.estmP_TotalObtMarks}</td>
                                    <td>{report.estmP_TotalGrade}</td>
                                </tr>
                                <tr className='bg-blue-header font-bold'>
                                    <td>&nbsp;</td>
                                    <td colSpan={2} className='pl-4 text-left font-bold uppercase'>
                                        PERCENTAGE
                                    </td>
                                    <td colSpan={4}>{report.estmP_Percentage} %</td>
                                </tr>
                            </tbody>
                        </table>

                        {/* Co-Scholastic Table */}
                        <table className='table-custom mb-6'>
                            <thead>
                                <tr className='bg-blue-header font-bold text-black'>
                                    <th style={{ width: '80px' }}>SL No</th>
                                    <th colSpan={3}>SUBJECT(CO - SCHOLASTIC)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {report.sub_list
                                    .filter((m) => {
                                        const sub = subjects.find((s) => s.ismS_Id === m.ismS_Id);
                                        return sub?.eyceS_AplResultFlg === false;
                                    })
                                    .map((mark, i) => {
                                        const subject = subjects.find((s) => s.ismS_Id === mark.ismS_Id);
                                        if (!subject) return null;

                                        return (
                                            <tr key={mark.ismS_Id}>
                                                <td>{i + 1}</td>
                                                <td colSpan={2} className='pl-4 text-left font-bold'>
                                                    {subject.ismS_SubjectName}
                                                </td>
                                                <td className='bg-blue-header'>
                                                    {subject.eyceS_MarksDisplayFlg ? mark.estmpS_ObtainedMarks : mark.estmpS_ObtainedGrade}
                                                </td>
                                            </tr>
                                        );
                                    })}
                            </tbody>
                        </table>

                        {/* Graphical View */}
                        <div className='mb-6 text-center'>
                            <h4 className='mb-4 font-bold text-xl'>Graphical View</h4>
                            <div className='flex justify-center'>
                                {report.studentdetailsgraph && report.studentdetailsgraph[0]?.ImagePath ? (
                                    <img
                                        src={report.studentdetailsgraph[0].ImagePath}
                                        alt='Performance Graph'
                                        style={{ maxWidth: '500px', height: 'auto', objectFit: 'contain' }}
                                    />
                                ) : (
                                    <div className='flex h-40 w-80 items-center justify-center border border-gray-400 border-dashed text-gray-500'>
                                        Performance Index Graph
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Attendance Table */}
                        <div className='mb-6'>
                            <div className='ml-[5%]'>
                                <h2 className='mb-2 text-left font-bold text-xl'>ATTENDANCE</h2>
                            </div>
                            <table className='table-custom text-xs'>
                                <thead>
                                    <tr className='font-bold'>
                                        <th colSpan={2}></th>
                                        <th>MAY</th>
                                        <th>JUN</th>
                                        <th>JUL</th>
                                        <th>AUG</th>
                                        <th>SEP</th>
                                        <th>OCT</th>
                                        <th>NOV</th>
                                        <th>DEC</th>
                                        <th>JAN</th>
                                        <th>FEB</th>
                                        <th>MAR</th>
                                        <th>APR</th>
                                        <th>TOTAL</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td colSpan={2} className='text-left font-bold'>
                                            No of Working Days
                                        </td>
                                        {[
                                            'May',
                                            'June',
                                            'July',
                                            'August',
                                            'September',
                                            'October',
                                            'November',
                                            'December',
                                            'January',
                                            'February',
                                            'March',
                                            'April',
                                            'TotalSchoolDays'
                                        ].map((month) => (
                                            <td key={month}>{report.stud_work_attendence?.[0]?.[month] || ''}</td>
                                        ))}
                                    </tr>
                                    <tr>
                                        <td colSpan={2} className='text-left font-bold'>
                                            No of Days Present
                                        </td>
                                        {[
                                            'May',
                                            'June',
                                            'July',
                                            'August',
                                            'September',
                                            'October',
                                            'November',
                                            'December',
                                            'January',
                                            'February',
                                            'March',
                                            'April',
                                            'TotalPresentDays'
                                        ].map((month) => (
                                            <td key={month}>{report.stud_present_attendence?.[0]?.[month] || ''}</td>
                                        ))}
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* Remarks Section */}
                        <div className='mb-4'>
                            <table className='table-custom' style={{ backgroundColor: 'transparent' }}>
                                <tbody>
                                    <tr style={{ border: '0.5px solid #727272' }}>
                                        <td className='min-h-[70px] p-4 text-left'>
                                            <span className='text-2xl'>REMARKS : </span>
                                            <span className='font-bold text-2xl'>{report.promotion_remarks?.[0]?.emeR_Remarks || ''}</span>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* Result & Promoted To Section */}
                        <div className='mb-10 grid grid-cols-2 gap-4'>
                            <table className='table-custom' style={{ backgroundColor: 'transparent' }}>
                                <tbody>
                                    <tr style={{ border: '0.5px solid #727272' }}>
                                        <td className='min-h-[70px] p-4 text-left'>
                                            <span className='text-2xl'>RESULT : </span>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                            <table className='table-custom' style={{ backgroundColor: 'transparent' }}>
                                <tbody>
                                    <tr style={{ border: '0.5px solid #727272' }}>
                                        <td className='min-h-[70px] p-4 text-left'>
                                            <span className='text-2xl'>
                                                PROMOTED TO : <strong>{/* Promotion Value */}</strong>
                                            </span>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* Signatures Section */}
                        <div className='margin-top-150'>
                            <div className='grid grid-cols-3 gap-4 text-center font-bold'>
                                <div>Principal /H.M Signature</div>
                                <div>Class Teacher Signature</div>
                                <div>Parent Signature</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
}
