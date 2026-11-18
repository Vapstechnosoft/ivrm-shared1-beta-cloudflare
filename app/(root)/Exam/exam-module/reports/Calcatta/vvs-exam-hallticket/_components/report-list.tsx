'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';
import { Printer } from 'lucide-react';
import { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';

interface ReportListProps {
    data: any;
    params: any;
}

export const ReportList = ({ data, params }: ReportListProps) => {
    const printRef = useRef<HTMLDivElement>(null);
    const { reportFormat, accyear, examname } = params ?? {};

    const { datareport: mainList = [], subarray: subList = [], institute = [] } = data ?? {};

    // Get logo path from institute data
    const imgname = institute.length > 0 ? institute[0].mI_Logo : '';

    // ── Print ─────────────────────────────────────────────────────────────────
    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: `HallTicket_${examname || 'Report'}`
    });

    if (!mainList.length) {
        return (
            <Card>
                <CardContent className='flex h-40 items-center justify-center p-6'>
                    <p className='text-gray-500'>No records found for the selected criteria.</p>
                </CardContent>
            </Card>
        );
    }

    // Helper to get subjects for a student
    const getStudentSubjects = (studentId: number) => {
        return subList.filter((s: any) => s.amsT_Id === studentId);
    };

    // ── Common Table Component ──────────────────────────────────────────────
    const SubjectsTable = ({ subjects }: { subjects: any[] }) => (
        <table className='mt-4 w-full border-collapse border border-black'>
            <thead>
                <tr style={{ fontSize: '20px' }}>
                    <th className='border border-black p-1 text-center'>Sl No</th>
                    <th className='border border-black p-1 text-center'>Subjects</th>
                    <th className='border border-black p-1 text-center'>Date</th>
                    <th className='border border-black p-1 text-center'>Start Time</th>
                    <th className='border border-black p-1 text-center'>End Time</th>
                    <th className='border border-black p-1 text-center' colSpan={2}>
                        Invigilator's Signature
                    </th>
                </tr>
            </thead>
            <tbody>
                {subjects.map((exm: any, i: number) => (
                    <tr key={i} style={{ fontSize: '20px' }}>
                        <td className='border border-black p-1 text-center'>{i + 1}</td>
                        <td className='border border-black p-1 text-center'>{exm.ismS_SubjectName}</td>
                        <td className='border border-black p-1 text-center'>
                            {exm.exttS_Date ? format(new Date(exm.exttS_Date), 'dd-MM-yyyy') : ''}
                        </td>
                        <td className='border border-black p-1 text-center'>{exm.ettS_StartTime}</td>
                        <td className='border border-black p-1 text-center'>{exm.ettS_EndTime}</td>
                        <td className='border border-black p-1' colSpan={2}></td>
                    </tr>
                ))}
            </tbody>
        </table>
    );

    // ── Format 1 (Daily) Design ──────────────────────────────────────────────
    const renderFormat1 = (user: any) => {
        const studentSubjects = getStudentSubjects(user.amsT_Id);
        return (
            <section className='vikasahallticket mb-8 bg-white p-4' style={{ fontFamily: 'serif' }}>
                <div className='border border-black p-4'>
                    <div className='flex flex-col items-center text-center'>
                        <div className='mx-auto mb-2 w-4/5'>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src='https://kusumadata.blob.core.windows.net/files/30/ISM_Attachments/f4e85c38-b6ef-42c7-a533-1e12d9627dc4.jpg'
                                alt='School Logo'
                                className='mx-auto h-auto max-w-full'
                            />
                        </div>
                        <h4 className='m-0 font-bold text-xl uppercase'>KIDDIE FEAT</h4>
                        <h4 className='m-0 font-bold text-lg uppercase'>
                            {examname} - {accyear}
                        </h4>
                        <h4 className='m-0 font-bold text-lg uppercase underline'>ADMISSION TICKET</h4>
                    </div>

                    <div className='mt-4 space-y-2'>
                        <table className='w-full text-[20px]'>
                            <tbody>
                                <tr>
                                    <td className='w-[180px] font-bold'>Student Name</td>
                                    <td>: &nbsp;&nbsp;{user.amsT_FirstName}</td>
                                </tr>
                            </tbody>
                        </table>

                        <div className='flex items-center gap-4 text-[20px]'>
                            <span className='w-[180px] font-bold'>Roll No.</span>
                            <div className='flex h-8 w-64 items-center border border-black px-2'>
                                {user.amaY_Rollno || user.ehT_HallTicketNo}
                            </div>
                        </div>

                        <table className='w-full'>
                            <tbody>
                                <tr>
                                    <td className='w-[180px] font-bold text-[20px]'>Class/Section</td>
                                    <td className='text-[20px]'>
                                        : {user.asmcL_ClassName} &nbsp;&nbsp; {user.asmC_SectionName}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <SubjectsTable subjects={studentSubjects} />

                <div className='mt-4 text-center italic'>
                    <p className='text-[20px]'>NOTE : * You must carry this to the examination hall without fail.</p>
                </div>

                <div className='mt-12 flex items-end justify-between px-4 text-[20px]'>
                    <div className='text-center'>
                        <div className='h-12'></div>
                        <p className='m-0 font-bold'>Class Teacher Signature</p>
                    </div>
                    <div className='text-center'>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src='https://kusumadata.blob.core.windows.net/files/30/managersign/800a9050-a613-4855-bffc-ede724855879.jpg'
                            alt='HM Sign'
                            style={{ width: '130px', mixBlendMode: 'multiply' }}
                        />
                        <p className='m-0 font-bold'>Head Master</p>
                    </div>
                </div>
            </section>
        );
    };

    // ── Format 2 (btwdates) Design ──────────────────────────────────────────
    const renderFormat2 = (user: any) => {
        const studentSubjects = getStudentSubjects(user.amsT_Id);
        const isICSE = user.asmcL_ClassName?.trim().includes('ICSE');
        const logoUrl = isICSE
            ? 'https://dcampusstrg.blob.core.windows.net/files/17/NAACDocumentsUpload/b29bdbac-8853-42cb-9eae-8a12fdf36515.jpg'
            : imgname;

        return (
            <section className='vikasahallticket mb-8 bg-white p-4' style={{ fontFamily: 'serif' }}>
                <div className='border border-black p-4'>
                    <div className='relative flex flex-col items-center text-center'>
                        <div className='mx-auto mb-2 w-3/5'>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={logoUrl} alt='Logo' className='mx-auto h-auto max-w-full' />
                        </div>
                        {user.amsT_Photoname && (
                            <div className='absolute top-0 right-0 border border-black p-1'>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={user.amsT_Photoname} alt='Student' className='h-24 w-24 object-cover' />
                            </div>
                        )}
                        <h2 className='m-0 mt-2 font-bold text-2xl uppercase'>ADMISSION TICKET</h2>
                        <hr className='mt-1 w-full border-black' />
                    </div>

                    <div className='mt-4 space-y-4'>
                        <table className='w-full text-[20px]'>
                            <tbody>
                                <tr>
                                    <td className='w-[180px] font-bold'>Student Name</td>
                                    <td>: &nbsp;&nbsp;{user.amsT_FirstName}</td>
                                </tr>
                            </tbody>
                        </table>

                        <div className='grid grid-cols-2 gap-4 text-[20px]'>
                            <div className='flex items-center gap-2'>
                                <span className='w-[180px] font-bold'>Roll No.</span>
                                <span>: &nbsp;&nbsp;{user.amaY_Rollno || user.ehT_HallTicketNo}</span>
                            </div>
                            <div className='flex items-center gap-2'>
                                <span className='font-bold'>Exam</span>
                                <span>
                                    : &nbsp;&nbsp;{examname} - {accyear}
                                </span>
                            </div>
                        </div>

                        <table className='w-full text-[20px]'>
                            <tbody>
                                <tr>
                                    <td className='w-[180px] font-bold'>Class/Section</td>
                                    <td>
                                        : &nbsp;&nbsp;{user.asmcL_ClassName} &nbsp;&nbsp; {user.asmC_SectionName}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <SubjectsTable subjects={studentSubjects} />

                <div className='mt-4 text-center italic'>
                    <p className='text-[20px]'>NOTE : * You must carry this to the examination hall without fail.</p>
                </div>

                <div className='mt-12 flex items-end justify-between px-4 text-[20px]'>
                    <div className='text-center'>
                        <div className='h-12'></div>
                        <p className='m-0 font-bold'>Class Teacher Signature</p>
                    </div>
                    <div className='text-center'>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={
                                isICSE
                                    ? 'https://kusumadata.blob.core.windows.net/files/30/ISM_Attachments/5037b793-d15c-4b00-a202-9fcd1bd39af8.jpg'
                                    : 'https://kusumadata.blob.core.windows.net/files/30/managersign/a73ec17c-6899-486b-a692-796aa2d69fd6.jpg'
                            }
                            alt='Sign'
                            style={{ width: '130px', transform: isICSE ? 'none' : 'rotate(23deg)' }}
                        />
                        <p className='m-0 font-bold'>{isICSE ? 'Principal' : 'Head Master'}</p>
                    </div>
                </div>
            </section>
        );
    };

    // ── Format 3 Design ──────────────────────────────────────────────────────
    const renderFormat3 = (user: any) => {
        const studentSubjects = getStudentSubjects(user.amsT_Id);
        const isICSE = user.asmcL_ClassName?.trim().includes('ICSE');

        return (
            <section className='vikasahallticket mb-8 bg-white p-4' style={{ fontFamily: 'serif' }}>
                <div className='border border-black p-4'>
                    <div className='relative flex flex-col items-center text-center'>
                        <div className='mx-auto mb-2 w-3/5'>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={imgname} alt='Logo' className='mx-auto h-auto max-w-full' />
                        </div>
                        {user.amsT_Photoname && (
                            <div className='absolute top-0 right-0 border border-black p-1'>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={user.amsT_Photoname} alt='Student' className='h-24 w-24 object-cover' />
                            </div>
                        )}
                        <h2 className='m-0 mt-2 font-bold text-2xl uppercase'>ADMISSION TICKET</h2>
                        <hr className='mt-1 w-full border-black' />
                    </div>

                    <div className='mt-4 space-y-4'>
                        <table className='w-full text-[20px]'>
                            <tbody>
                                <tr>
                                    <td className='w-[180px] font-bold'>Student Name</td>
                                    <td>: &nbsp;&nbsp;{user.amsT_FirstName}</td>
                                </tr>
                            </tbody>
                        </table>

                        <div className='grid grid-cols-2 gap-4 text-[20px]'>
                            <div className='flex items-center gap-2'>
                                <span className='w-[180px] font-bold'>Roll No.</span>
                                <span>: &nbsp;&nbsp;{user.amaY_Rollno || user.ehT_HallTicketNo}</span>
                            </div>
                            <div className='flex items-center gap-2'>
                                <span className='font-bold'>Exam</span>
                                <span>
                                    : &nbsp;&nbsp;{examname} - {accyear}
                                </span>
                            </div>
                        </div>

                        <table className='w-full text-[20px]'>
                            <tbody>
                                <tr>
                                    <td className='w-[180px] font-bold'>Class/Section</td>
                                    <td>
                                        : &nbsp;&nbsp;{user.asmcL_ClassName} &nbsp;&nbsp; {user.asmC_SectionName}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <SubjectsTable subjects={studentSubjects} />

                <div className='mt-4 text-center italic'>
                    <p className='text-[20px]'>NOTE : * You must carry this to the examination hall without fail.</p>
                </div>

                <div className='mt-12 flex items-end justify-between px-4 text-[20px]'>
                    <div className='text-center'>
                        <div className='h-12'></div>
                        <p className='m-0 font-bold'>Class Teacher Signature</p>
                    </div>
                    <div className='text-center'>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src='https://kusumadata.blob.core.windows.net/files/30/managersign/a73ec17c-6899-486b-a692-796aa2d69fd6.jpg'
                            alt='Sign'
                            style={{ width: '130px', transform: 'rotate(23deg)' }}
                        />
                        <p className='m-0 font-bold'>{isICSE ? 'Principal' : 'Head Master'}</p>
                    </div>
                </div>
            </section>
        );
    };

    return (
        <Card className='mt-6'>
            {/* Toolbar */}
            <div className='no-print flex items-center justify-between border-b px-6 py-3'>
                <h3 className='font-semibold text-lg'>VVS Hallticket Report</h3>
                <div className='flex gap-2'>
                    <Button variant='default' size='sm' onClick={handlePrint} className='flex items-center gap-2'>
                        <Printer className='h-4 w-4' /> Print
                    </Button>
                </div>
            </div>

            <CardContent className='overflow-auto p-6'>
                <div ref={printRef} className='print-container bg-white p-4'>
                    {mainList.map((user: any, index: number) => (
                        <div key={index} className={index > 0 ? 'mt-8' : ''}>
                            {reportFormat === 'format1' && renderFormat1(user)}
                            {reportFormat === 'format2' && renderFormat2(user)}
                            {reportFormat === 'format3' && renderFormat3(user)}
                            {index < mainList.length - 1 && <div className='page-break' />}
                        </div>
                    ))}
                </div>
            </CardContent>

            <style jsx global>{`
                @media print {
                    .no-print {
                        display: none !important;
                    }
                    .page-break {
                        display: block;
                        page-break-before: always;
                    }
                    .vikasahallticket {
                        page-break-inside: avoid;
                    }
                    @page {
                        size: portrait;
                        margin: 10mm;
                    }
                    body {
                        background: white !important;
                    }
                    .print-container {
                        padding: 0 !important;
                    }
                }
            `}</style>
        </Card>
    );
};
export default ReportList;
