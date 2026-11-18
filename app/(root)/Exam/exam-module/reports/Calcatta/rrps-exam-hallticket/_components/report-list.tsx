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
        documentTitle: `RRPS_HallTicket_${examname || 'Report'}`
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
    // Matches: ng-show="dailybtedates == 'daily'"
    // Shows logo + heading + table listing all students
    const renderFormat1 = () => (
        <div className='bg-white p-4'>
            {/* School logo */}
            <div className='mb-4 text-center'>
                {imgname && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={imgname} alt='School Logo' className='mx-auto max-w-[400px]' />
                )}
                <h3 className='mt-2 font-bold text-2xl'>Hall Ticket Report {accyear}</h3>
            </div>

            {/* Student listing table */}
            <table className='w-full border-collapse border border-black text-base'>
                <thead>
                    <tr className='bg-gray-100'>
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

    // ── Format 2 / Format 3 – ADMIT CARD ─────────────────────────────────────
    // Matches: ng-show="dailybtedates == 'btwdates'" and "dailybtedates == 'format3'"
    // Both formats have identical layout in RRPS:
    //   logo (imgname, 60% width) → examname/accyear → ADMIT CARD
    //   → student details + photo → subjects table (Timings merged) → NOTE → signatures
    const renderAdmitCard = (user: any) => {
        const studentSubjects = getStudentSubjects(user.amsT_Id);

        return (
            <section className='rrpshallticket mb-8 bg-white' style={{ fontFamily: 'serif' }}>
                {/* ── Header table with logo + student info ── */}
                <table className='w-full border-collapse border border-black'>
                    <tbody>
                        <tr>
                            <td className='p-4'>
                                {/* School logo – 60% width centered */}
                                <div style={{ width: '60%', margin: 'auto' }}>
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={imgname} alt='School Logo' className='h-auto max-w-full' />
                                </div>

                                <h4 className='text-center font-bold text-xl' style={{ margin: 0, padding: 0 }}>
                                    {examname} - {accyear}
                                </h4>
                                <h4 className='text-center font-bold text-xl uppercase' style={{ margin: 0, padding: 0 }}>
                                    ADMIT CARD
                                </h4>

                                {/* Student details + photo */}
                                <div className='mt-4 flex items-start gap-4'>
                                    {/* Left: student info (col-sm-10) */}
                                    <div className='flex-1'>
                                        <table className='w-full'>
                                            <tbody>
                                                <tr>
                                                    <td style={{ fontSize: '18px', width: '150px' }}>Adm No.</td>
                                                    <td style={{ fontSize: '18px' }}>: &nbsp;&nbsp;{user.amsT_AdmNo}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                        <table className='mt-2 w-full'>
                                            <tbody>
                                                <tr>
                                                    <td style={{ fontSize: '18px', width: '150px' }}>Student Name</td>
                                                    <td style={{ fontSize: '18px' }}>: &nbsp;&nbsp;{user.amsT_FirstName}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                        <table className='mt-2 w-full'>
                                            <tbody>
                                                <tr>
                                                    <td style={{ fontSize: '18px', width: '150px' }}>Father Name</td>
                                                    <td style={{ fontSize: '18px' }}>: &nbsp;&nbsp;{user.amsT_FatherName}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                        <table className='mt-2 w-full'>
                                            <tbody>
                                                <tr>
                                                    <td style={{ fontSize: '18px', width: '150px' }}>Class/Section</td>
                                                    <td style={{ fontSize: '18px' }}>: &nbsp;&nbsp;{user.asmC_SectionName}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Right: student photo (col-sm-2) */}
                                    {user.amsT_Photoname && (
                                        <div style={{ marginRight: '10px', flexShrink: 0 }}>
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={user.amsT_Photoname}
                                                alt='Student'
                                                style={{ height: '120px' }}
                                                className='max-w-full'
                                            />
                                        </div>
                                    )}
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>

                {/* ── Subjects table ── */}
                <table className='mt-2 w-full border-collapse border border-black'>
                    <thead>
                        <tr>
                            <th className='border border-black p-2 text-center' style={{ fontSize: '18px' }}>
                                Subjects
                            </th>
                            <th className='border border-black p-2 text-center' style={{ fontSize: '18px' }}>
                                Date
                            </th>
                            <th className='border border-black p-2 text-center' style={{ fontSize: '18px' }} colSpan={2}>
                                Timings
                            </th>
                            <th className='border border-black p-2 text-center' style={{ fontSize: '18px' }} colSpan={2}>
                                Invigilator&apos;s Signature
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {studentSubjects.map((exm: any, i: number) => (
                            <tr key={i} style={{ fontSize: '18px' }}>
                                <td className='border border-black p-2 text-center'>{exm.ismS_SubjectName}</td>
                                <td className='border border-black p-2 text-center'>
                                    {exm.exttS_Date ? format(new Date(exm.exttS_Date), 'dd-MM-yyyy') : ''}
                                </td>
                                <td className='border border-black p-2 text-center' colSpan={2}>
                                    {exm.ettS_StartTime} TO {exm.ettS_EndTime}
                                </td>
                                <td className='border border-black p-2' colSpan={2}></td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* ── Note ── */}
                <div className='mt-4 text-center'>
                    <p style={{ fontSize: '20px' }}>
                        <strong>NOTE : * You must carry this to the examination hall without fail.</strong>
                    </p>
                </div>

                {/* ── Signatures ── */}
                <div className='mt-16 flex items-end justify-between px-4' style={{ fontSize: '20px' }}>
                    <div className='text-center'>
                        <p style={{ margin: 0 }}>(Dr.Suresh C.T)</p>
                        <p style={{ margin: 0 }}>Founder President &amp; Managing Trustee</p>
                    </div>
                    <div className='text-center'>
                        <div style={{ height: '48px' }}></div>
                        <p style={{ margin: 0 }}>Principal</p>
                    </div>
                </div>
            </section>
        );
    };

    return (
        <Card className='mt-6'>
            {/* ── Toolbar ── */}
            <div className='no-print flex items-center justify-between border-b px-6 py-3'>
                <h3 className='font-semibold text-lg'>Hallticket Report</h3>
                <div className='flex gap-2'>
                    <Button variant='default' size='sm' onClick={handlePrint} className='flex items-center gap-2'>
                        <Printer className='h-4 w-4' /> Print
                    </Button>
                </div>
            </div>

            <CardContent className='overflow-auto p-6'>
                <div ref={printRef} className='print-container bg-white p-4'>
                    {/* Format 1: Grid listing */}
                    {reportFormat === 'format1' && renderFormat1()}

                    {/* Format 2 & 3: ADMIT CARD per student */}
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
                    .rrpshallticket {
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
