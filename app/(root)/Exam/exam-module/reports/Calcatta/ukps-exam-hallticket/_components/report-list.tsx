'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { format, isValid } from 'date-fns';
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

    // Standard properties for hall ticket reports
    // Supporting multiple possible data property names from backend
    const mainList = data?.datareport || data?.main_list || data?.studentlist || [];
    const subList = data?.subarray || data?.sublist || [];
    const institute = data?.institute || data?.institute_list || [];

    // Get logo path from institute data
    const imgname = (institute || []).length > 0 ? institute[0].mI_Logo : '';

    // ── Print ─────────────────────────────────────────────────────────────────
    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: `UKPS_HallTicket_${examname || 'Report'}`
    });

    if (!mainList || mainList.length === 0) {
        return (
            <Card className='mt-6'>
                <CardContent className='flex h-40 items-center justify-center p-6'>
                    <p className='font-medium text-gray-500'>No records found for the selected criteria.</p>
                </CardContent>
            </Card>
        );
    }

    // Helper: subjects for a student
    const getStudentSubjects = (studentId: number) => (subList || []).filter((s: any) => Number(s.amsT_Id) === Number(studentId));

    // Helper: Safe date formatting
    const formatDateSafe = (dateStr: string, formatStr: string) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return isValid(date) ? format(date, formatStr) : dateStr;
    };

    // ── Format 1 – Grid View (daily) ─────────────────────────────────────────
    const renderGridView = () => (
        <div className='bg-white p-4'>
            <div className='mb-6 text-center'>
                {imgname && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={imgname} alt='School Logo' className='mx-auto mb-2 max-w-[150px]' />
                )}
                <h3 className='font-bold text-2xl uppercase'>Hall Ticket Report {accyear}</h3>
            </div>

            <table className='w-full border-collapse border border-black'>
                <thead>
                    <tr className='bg-gray-100'>
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
                            <td className='border border-black p-2 text-left text-sm'>{exm.amsT_FirstName || exm.studentName}</td>
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

    // ── Format 2 & 3 – Admit Card (btwdates) ────────────────────────────────────
    const renderAdmitCard = (user: any) => {
        const studentSubjects = getStudentSubjects(user.amsT_Id);

        return (
            <section className='ukpshallticket mb-12 bg-white' style={{ fontFamily: '"Times New Roman", serif' }}>
                <div style={{ border: '1px solid #000', padding: '15px' }}>
                    {/* HEADER */}
                    <div style={{ textAlign: 'center', lineHeight: '1.4' }}>
                        <div style={{ fontSize: '20px', fontWeight: 'bold' }}> U K PUBLIC SCHOOL </div>
                        <div style={{ fontSize: '13px' }}> (Affiliated to the CBSE, Delhi) </div>
                        <div style={{ fontSize: '13px' }}> G M Global Village, Brahmavar, Udupi District, Karnataka - 576213 </div>
                        <div style={{ fontSize: '13px' }}> Mob: +91 9845317165, +91 7090737165 </div>
                        <div style={{ marginTop: '8px', fontSize: '14px', fontWeight: 'bold' }}>
                            {' '}
                            {examname} - {accyear}{' '}
                        </div>
                        <div style={{ fontSize: '18px', fontWeight: 'bold', textDecoration: 'underline' }}> ADMIT CARD </div>
                    </div>

                    {/* STUDENT DETAILS */}
                    <div style={{ marginTop: '15px', display: 'flex', justifyContent: 'space-between' }}>
                        <div style={{ width: '75%', fontSize: '16px' }}>
                            <div style={{ marginBottom: '6px' }}>
                                <b>Student&apos;s Name</b> : {user.amsT_FirstName || user.studentName}
                            </div>
                            <div style={{ marginBottom: '6px' }}>
                                <b>Admission Number</b> : {user.amsT_AdmNo}
                            </div>
                            <div style={{ marginBottom: '6px' }}>
                                <b>Class / Section</b> : {user.asmcL_ClassName} / {user.asmC_SectionName}
                            </div>
                            <div style={{ marginBottom: '6px' }}>
                                <b>Register No</b> : {user.ettS_SessionName || user.ehT_HallTicketNo || user.amsT_AdmNo}
                            </div>
                        </div>
                        <div style={{ width: '120px', height: '140px', border: '1px solid #000', textAlign: 'center', overflow: 'hidden' }}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={
                                    user.amsT_Photoname ||
                                    'https://vapsclg.blob.core.windows.net/files/82/NoticeUpload/18c39d47-32e8-4baa-b66d-ef053750fe35.png'
                                }
                                alt='Student'
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                        </div>
                    </div>

                    {/* EXAM TABLE */}
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px', fontSize: '14px' }}>
                        <thead>
                            <tr className='bg-gray-50'>
                                <th style={{ border: '1px solid #000', padding: '8px' }}>DATE</th>
                                <th style={{ border: '1px solid #000', padding: '8px' }}>DAY</th>
                                <th style={{ border: '1px solid #000', padding: '8px' }}>SUBJECT</th>
                                <th style={{ border: '1px solid #000', padding: '8px' }}>INVIGILATOR&apos;S SIGNATURE</th>
                            </tr>
                        </thead>
                        <tbody>
                            {studentSubjects.length > 0 ? (
                                studentSubjects.map((exm: any, i: number) => (
                                    <tr key={i}>
                                        <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'center' }}>
                                            {formatDateSafe(exm.exttS_Date, 'dd.MM.yyyy')}
                                        </td>
                                        <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'center' }}>
                                            {formatDateSafe(exm.exttS_Date, 'EEEE').toUpperCase()}
                                        </td>
                                        <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'left' }}>
                                            {' '}
                                            {exm.ismS_SubjectName}{' '}
                                        </td>
                                        <td style={{ border: '1px solid #000', padding: '8px' }}></td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan={4}
                                        style={{
                                            border: '1px solid #000',
                                            padding: '20px',
                                            textAlign: 'center',
                                            color: '#999',
                                            fontStyle: 'italic'
                                        }}>
                                        No exam schedule available
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    {/* SIGNATURES */}
                    <div style={{ marginTop: '50px', display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                        <div style={{ width: '45%', textAlign: 'center', borderTop: '1px solid #000', paddingTop: '5px' }}>
                            {' '}
                            Candidate&apos;s Signature{' '}
                        </div>
                        <div style={{ width: '45%', textAlign: 'center', borderTop: '1px solid #000', paddingTop: '5px' }}>
                            {' '}
                            Parent&apos;s / Guardian&apos;s Signature{' '}
                        </div>
                    </div>
                    <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                        <div style={{ width: '45%', textAlign: 'center' }}>
                            <div style={{ height: '40px' }}>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src='https://dcampusstrg.blob.core.windows.net/files/17/ISM_Attachments/b3ed8ce4-b047-4566-8fd7-b476e00c58e6.png'
                                    style={{ height: '40px', margin: '0 auto' }}
                                    alt='Principal Signature'
                                />
                            </div>
                            <div style={{ borderTop: '1px solid #000', paddingTop: '5px' }}> Principal&apos;s Signature </div>
                        </div>
                        <div style={{ width: '45%', textAlign: 'center' }}>
                            <div style={{ height: '40px' }}></div>
                            <div style={{ borderTop: '1px solid #000', paddingTop: '5px' }}> Class Teacher&apos;s Signature </div>
                        </div>
                    </div>
                </div>
            </section>
        );
    };

    return (
        <Card className='mt-6 border-none bg-transparent shadow-none'>
            <div className='no-print mb-4 flex items-center justify-between rounded-lg border bg-white px-6 py-3 shadow-sm'>
                <h3 className='font-semibold text-lg'>Report Viewer</h3>
                <div className='flex gap-2'>
                    <Button variant='outline' size='sm' onClick={handlePrint} className='flex items-center gap-2'>
                        <Printer className='h-4 w-4' /> Print Report
                    </Button>
                </div>
            </div>

            <CardContent className='overflow-visible p-0'>
                <div ref={printRef} className='print-container mx-auto p-4' style={{ maxWidth: '900px' }}>
                    {reportFormat === 'format1' && renderGridView()}

                    {(reportFormat === 'format2' || reportFormat === 'format3') &&
                        mainList.map((user: any, index: number) => (
                            <div key={index}>
                                {renderAdmitCard(user)}
                                {index < mainList.length - 1 && (
                                    <div className='page-break mb-8 border-gray-300 border-b-2 border-dashed' />
                                )}
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
                        border: none !important;
                        margin: 0 !important;
                    }
                    .ukpshallticket {
                        page-break-inside: avoid;
                        margin-bottom: 0 !important;
                    }
                    @page {
                        size: portrait;
                        margin: 10mm;
                    }
                    body {
                        background: white !important;
                        -webkit-print-color-adjust: exact;
                    }
                    .print-container {
                        padding: 0 !important;
                        max-width: none !important;
                    }
                }
            `}</style>
        </Card>
    );
};
export default ReportList;
