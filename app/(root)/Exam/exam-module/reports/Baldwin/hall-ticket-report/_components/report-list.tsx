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
    const { reportFormat } = params ?? {};

    const { datareport: mainList = [], subarray: subList = [], institute = [], accyear = '', examname = '' } = data ?? {};

    // Get logo path from institute data
    const imgname = (institute || []).length > 0 ? institute[0].mI_Logo : '';
    // Principal signature placeholder or from data if available
    const principalSign = (institute || []).length > 0 ? institute[0].mI_Signature : '';

    // ── Print ─────────────────────────────────────────────────────────────────
    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: `Baldwin_HallTicket_${examname || 'Report'}`
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

    // Helper: subjects for a student
    const getStudentSubjects = (studentId: number) => (subList || []).filter((s: any) => s.amsT_Id === studentId);

    // ── Format 1 – Grid View (daily) ─────────────────────────────────────────
    const renderFormat1 = () => (
        <div id='table' className='w-full bg-white p-4'>
            <div className='mb-4 text-center'>
                {imgname && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={imgname} alt='School Logo' className='mx-auto max-w-[400px]' />
                )}
                <h3 className='mt-2 font-bold text-2xl uppercase'>Hall Ticket Report {accyear}</h3>
            </div>

            <table className='w-full border-collapse border border-black text-sm'>
                <thead>
                    <tr className='bg-gray-100 font-bold'>
                        <th className='border border-black p-2 text-center'>Sl No</th>
                        <th className='border border-black p-2 text-left'>Student Name</th>
                        <th className='border border-black p-2 text-left'>Admn No</th>
                        <th className='border border-black p-2 text-left'>Class</th>
                        <th className='border border-black p-2 text-left'>Section</th>
                        <th className='border border-black p-2 text-left'>Hall Ticket</th>
                    </tr>
                </thead>
                <tbody>
                    {mainList.map((exm: any, i: number) => (
                        <tr key={i}>
                            <td className='border border-black p-2 text-center'>{i + 1}</td>
                            <td className='border border-black p-2 text-left'>{exm.amsT_FirstName}</td>
                            <td className='border border-black p-2 text-left'>{exm.amsT_AdmNo}</td>
                            <td className='border border-black p-2 text-left'>{exm.asmcL_ClassName}</td>
                            <td className='border border-black p-2 text-left'>{exm.asmC_SectionName}</td>
                            <td className='border border-black p-2 text-left'>{exm.ehT_HallTicketNo}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    // ── Format 2 / Format 3 – ADMIT CARD (btwdates / printformat1) ───────────
    const renderAdmitCard = (user: any) => {
        const studentSubjects = getStudentSubjects(user.amsT_Id);

        return (
            <section className='baldwinhallticket mb-8 bg-white' style={{ fontFamily: 'serif' }}>
                <table className='w-full border-collapse border border-black'>
                    <tbody>
                        <tr>
                            {/* Left Side: Student Info & Signatures */}
                            <td className='p-3 align-top' style={{ width: '60%', borderRight: '1px solid black' }}>
                                <div className='mb-4 text-center'>
                                    {imgname && (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={imgname} alt='Logo' className='mx-auto max-w-[80%]' />
                                    )}
                                    <h4 className='mt-2 font-bold text-lg uppercase'>{examname} - ADMIT CARD</h4>
                                </div>

                                <div className='flex items-start justify-between'>
                                    <div className='flex-1 space-y-2 text-base'>
                                        <div>
                                            <b>Name</b> : {user.amsT_FirstName}
                                        </div>
                                        <div>
                                            <b>Std</b> : {user.asmcL_ClassName} {user.asmC_SectionName}
                                        </div>
                                        <div>
                                            <b>Roll.No</b> : {user.amaY_Rollno}
                                        </div>
                                    </div>
                                    {user.amsT_Photoname && (
                                        <div className='border border-black p-1' style={{ width: '100px', height: '120px' }}>
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={user.amsT_Photoname} alt='Student' className='h-full w-full object-contain' />
                                        </div>
                                    )}
                                </div>

                                <div className='mt-12 flex items-end justify-between'>
                                    <div className='text-center'>
                                        <div className='h-12' />
                                        <p className='border-black border-t px-2 pt-1 text-sm'>Sign. of Class Teacher</p>
                                    </div>
                                    <div className='text-center'>
                                        {principalSign && (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img src={principalSign} alt='Principal' className='mx-auto h-12' />
                                        )}
                                        <div className={!principalSign ? 'h-12' : ''} />
                                        <p className='border-black border-t px-2 pt-1 text-sm'>Sign. of Principal</p>
                                    </div>
                                </div>
                            </td>

                            {/* Right Side: Exam Schedule */}
                            <td className='p-3 align-top' style={{ width: '40%' }}>
                                <table className='w-full border-collapse border border-black text-xs'>
                                    <thead>
                                        <tr className='bg-gray-100 font-bold uppercase'>
                                            <th className='border border-black p-2 text-left'>Subject Name</th>
                                            <th className='border border-black p-2 text-left'>Exam Date</th>
                                            <th className='border border-black p-2 text-center'>Sign</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {studentSubjects.map((exm: any, i: number) => (
                                            <tr key={i}>
                                                <td className='border border-black p-2'>{exm.ismS_SubjectName}</td>
                                                <td className='border border-black p-2'>
                                                    {exm.exttS_Date ? format(new Date(exm.exttS_Date), 'dd/MM/yyyy') : ''}
                                                    <br />({exm.ettS_StartTime} -- {exm.ettS_EndTime})
                                                </td>
                                                <td className='border border-black p-2'></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </section>
        );
    };

    return (
        <Card className='mt-6 border-none bg-transparent shadow-none'>
            {/* Toolbar */}
            <div className='no-print flex items-center justify-between rounded-t-lg border-b bg-white px-6 py-3 shadow-sm'>
                <h3 className='font-semibold text-lg'>Hall Ticket Report</h3>
                <Button variant='outline' size='sm' onClick={handlePrint} className='flex items-center gap-2'>
                    <Printer className='h-4 w-4' /> Print
                </Button>
            </div>

            <CardContent className='overflow-auto rounded-b-lg bg-white p-6 shadow-sm'>
                <div ref={printRef} className='print-container'>
                    {reportFormat === 'format1' && renderFormat1()}
                    {(reportFormat === 'format2' || reportFormat === 'format3') &&
                        mainList.map((user: any, index: number) => (
                            <div key={index}>
                                {renderAdmitCard(user)}
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
                    .baldwinhallticket {
                        page-break-inside: avoid;
                        margin-bottom: 0 !important;
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
