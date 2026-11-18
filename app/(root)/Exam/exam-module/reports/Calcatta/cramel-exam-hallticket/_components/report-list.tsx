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
    const imgname = (institute || []).length > 0 ? institute[0].mI_Logo : '';

    // ── Print ─────────────────────────────────────────────────────────────────
    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: `Cramel_HallTicket_${examname || 'Report'}`
    });

    if (!(mainList || []).length) {
        return (
            <Card>
                <CardContent className='flex h-40 items-center justify-center p-6'>
                    <p className='text-gray-500'>No records found for the selected criteria.</p>
                </CardContent>
            </Card>
        );
    }

    // Helper: subjects for a student
    const getStudentSubjects = (studentId: number) => (subList || []).filter((s: any) => s.amsT_Id === studentId);

    // ── Format 1 – Grid View (daily) ─────────────────────────────────────────
    const renderFormat1 = () => (
        <div className='bg-white p-4'>
            {/* School logo */}
            <div className='mb-6 text-center'>
                {imgname && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={imgname} alt='School Logo' className='mx-auto max-w-[99%]' />
                )}
                <h3 className='mt-4 font-bold text-2xl uppercase'>Hall Ticket Report {accyear}</h3>
            </div>

            {/* Student listing table */}
            <table className='w-full border-collapse border border-black'>
                <thead>
                    <tr className='bg-gray-50'>
                        <th className='border border-black p-2 text-center font-bold text-sm'>Sl No</th>
                        <th className='border border-black p-2 text-left font-bold text-sm'>Student Name</th>
                        <th className='border border-black p-2 text-left font-bold text-sm'>Admn No</th>
                        <th className='border border-black p-2 text-left font-bold text-sm'>Class</th>
                        <th className='border border-black p-2 text-left font-bold text-sm'>Section</th>
                        <th className='border border-black p-2 text-left font-bold text-sm'>Hall Ticket</th>
                    </tr>
                </thead>
                <tbody>
                    {mainList.map((exm: any, i: number) => (
                        <tr key={i}>
                            <td className='border border-black p-2 text-center text-sm'>{i + 1}</td>
                            <td className='border border-black p-2 text-left text-sm'>{exm.amsT_FirstName}</td>
                            <td className='border border-black p-2 text-left text-sm'>{exm.amsT_AdmNo}</td>
                            <td className='border border-black p-2 text-left text-sm'>{exm.asmcL_ClassName}</td>
                            <td className='border border-black p-2 text-left text-sm'>{exm.asmC_SectionName}</td>
                            <td className='border border-black p-2 text-left text-sm'>{exm.ehT_HallTicketNo}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    // ── Format 2 – HALL TICKET ───────────────────────────────────────────────
    const renderHallTicket = (user: any) => {
        const studentSubjects = getStudentSubjects(user.amsT_Id);

        return (
            <section
                className='cramelhallticket mb-8 border border-gray-300 bg-white p-4'
                style={{
                    backgroundImage:
                        "url('https://dcampusstrg.blob.core.windows.net/files/17/ISM_Attachments/44300b54-1d40-497e-abf0-6be6a911b2ee.png')",
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '450px',
                    backgroundPosition: 'center',
                    minHeight: '800px'
                }}>
                <div className='mb-4 text-center'>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imgname} alt='School Logo' className='mx-auto max-w-[99%]' style={{ marginTop: '20px' }} />
                    <h4 className='mt-4 font-bold text-2xl uppercase'>
                        {examname} - {accyear}
                    </h4>
                    <h4 className='font-bold text-2xl uppercase'>Hall Ticket</h4>
                </div>

                <div className='mt-6 flex items-start justify-between px-4'>
                    <div className='flex-1 space-y-4'>
                        <table className='w-full' style={{ fontSize: '24px' }}>
                            <tbody>
                                <tr>
                                    <td width='200' className='font-semibold'>
                                        Register no.
                                    </td>
                                    <td>: &nbsp;&nbsp;{user.ettS_SessionName || user.ehT_HallTicketNo}&nbsp;&nbsp;</td>
                                </tr>
                                <tr>
                                    <td className='font-semibold'>Student Name</td>
                                    <td>: &nbsp;&nbsp;{user.amsT_FirstName}</td>
                                </tr>
                                <tr>
                                    <td className='font-semibold'>Class/Section</td>
                                    <td>
                                        : &nbsp;&nbsp;{user.asmcL_ClassName} {user.asmC_SectionName}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    {user.amsT_Photoname && (
                        <div className='ml-4'>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={user.amsT_Photoname}
                                style={{ height: '200px', width: '150px', border: '1px solid #ccc' }}
                                className='object-cover'
                                alt='Student'
                            />
                        </div>
                    )}
                </div>

                <div className='mt-8 px-4'>
                    <table className='w-full border-collapse border border-black'>
                        <thead>
                            <tr className='bg-gray-50'>
                                <th className='border border-black p-3 text-center font-bold text-xl'>Subjects</th>
                                <th className='border border-black p-3 text-center font-bold text-xl'>Date</th>
                                <th className='border border-black p-3 text-center font-bold text-xl'>Day</th>
                                <th className='border border-black p-3 text-center font-bold text-xl' colSpan={2}>
                                    Timings
                                </th>
                                <th className='border border-black p-3 text-center font-bold text-xl' colSpan={2}>
                                    Invigilator&apos;s Signature
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {studentSubjects.map((exm: any, i: number) => (
                                <tr key={i}>
                                    <td className='border border-black p-4 text-center font-medium text-xl'>{exm.ismS_SubjectName}</td>
                                    <td className='border border-black p-4 text-center text-xl'>
                                        {exm.exttS_Date ? format(new Date(exm.exttS_Date), 'dd-MM-yyyy') : ''}
                                    </td>
                                    <td className='border border-black p-4 text-center text-xl'>
                                        {exm.exttS_Date ? format(new Date(exm.exttS_Date), 'EEEE') : ''}
                                    </td>
                                    <td className='border border-black p-4 text-center text-xl' colSpan={2}>
                                        {exm.ettS_StartTime} TO {exm.ettS_EndTime}
                                    </td>
                                    <td className='border border-black p-4' colSpan={2}></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className='mt-16 px-4'>
                    <div className='flex items-end justify-between'>
                        <div className='text-left'>
                            <p className='font-bold text-2xl'>Class Teacher Signature</p>
                        </div>
                        <div className='text-right'>
                            {/* HM Signature Image */}
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src='https://vapsclg.blob.core.windows.net/files/52/NoticeUpload/f8109cae-26e1-40d5-ba10-b0dc7f2a2fee.png'
                                alt='HM Signature'
                                style={{ height: '120px', width: 'auto', marginBottom: '10px', marginLeft: 'auto' }}
                            />
                            <p className='font-bold text-2xl'>HM Signature</p>
                        </div>
                    </div>
                </div>
            </section>
        );
    };

    return (
        <Card className='mt-6'>
            {/* ── Toolbar ── */}
            <div className='no-print flex items-center justify-between border-b px-6 py-3'>
                <h3 className='font-semibold text-lg'>Cramel Hallticket Report</h3>
                <div className='flex gap-2'>
                    <Button variant='default' size='sm' onClick={handlePrint} className='flex items-center gap-2'>
                        <Printer className='h-4 w-4' /> Print
                    </Button>
                </div>
            </div>

            <CardContent className='overflow-auto bg-gray-50 p-6'>
                <div ref={printRef} className='print-container mx-auto bg-white p-4' style={{ maxWidth: '1000px' }}>
                    {/* Format 1: Grid listing */}
                    {reportFormat === 'daily' && renderFormat1()}

                    {/* Format 2: Hall Ticket per student */}
                    {reportFormat === 'btwdates' &&
                        mainList.map((user: any, index: number) => (
                            <div key={index}>
                                {renderHallTicket(user)}
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
                    .cramelhallticket {
                        page-break-inside: avoid;
                        border: none !important;
                        padding: 0 !important;
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
                        max-width: none !important;
                    }
                }
                @media screen {
                    .no-screen {
                        display: none !important;
                    }
                }
                .cramelhallticket table td, .cramelhallticket table th {
                    border-color: black !important;
                }
            `}</style>
        </Card>
    );
};
export default ReportList;
