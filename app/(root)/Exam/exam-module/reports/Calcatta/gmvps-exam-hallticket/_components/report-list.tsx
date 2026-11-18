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
        documentTitle: `GMVPS_HallTicket_${examname || 'Report'}`
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

    // ── Format 1 – Admit Card (Logo Header) ──────────────────────────────────
    const renderAdmitCardFormat1 = (user: any) => {
        const studentSubjects = getStudentSubjects(user.amsT_Id);

        return (
            <section className='gmvpshallticket mb-8' style={{ fontFamily: '"Times New Roman", serif' }}>
                <div style={{ border: '1px solid #000', padding: '15px' }}>
                    {/* HEADER WITH LOGO */}
                    <div style={{ textAlign: 'center', lineHeight: '1.4' }}>
                        {imgname && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={imgname} alt='School Logo' className='mx-auto mb-2 max-w-[150px]' />
                        )}
                        <div style={{ fontSize: '18px', fontWeight: 'bold' }}> G M VIDYANIKETAN PUBLIC SCHOOL </div>
                        <div style={{ fontSize: '13px' }}> (Affiliated to the CBSE, Delhi, No-830189) </div>
                        <div style={{ marginTop: '8px', fontSize: '14px', fontWeight: 'bold' }}>
                            {' '}
                            {examname} - {accyear}{' '}
                        </div>
                        <div style={{ fontSize: '16px', fontWeight: 'bold' }}> ADMIT CARD </div>
                    </div>

                    {/* STUDENT DETAILS */}
                    <div style={{ marginTop: '15px', display: 'flex', justifyContent: 'space-between' }}>
                        <div style={{ width: '75%', fontSize: '14px' }}>
                            <div style={{ marginBottom: '6px' }}>
                                <b>Student&apos;s Name</b> : {user.amsT_FirstName}
                            </div>
                            <div style={{ marginBottom: '6px' }}>
                                <b>Admission Number</b> : {user.amsT_AdmNo}
                            </div>
                            <div style={{ marginBottom: '6px' }}>
                                <b>Class</b> : {user.asmcL_ClassName}
                            </div>
                            <div style={{ marginBottom: '6px' }}>
                                <b>Father&apos;s Name</b> : {user.amsT_FatherName}
                            </div>
                            <div style={{ marginBottom: '6px' }}>
                                <b>Mother&apos;s Name</b> : {user.amsT_MotherName}
                            </div>
                        </div>
                        <div style={{ width: '120px', height: '140px', border: '1px solid #000', textAlign: 'center', overflow: 'hidden' }}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={user.amsT_Photoname}
                                alt='Student Photo'
                                style={{ width: '100%', height: '100%', display: 'block', objectFit: 'contain' }}
                            />
                        </div>
                    </div>

                    {/* EXAM TABLE */}
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px', fontSize: '13px' }}>
                        <thead>
                            <tr>
                                <th style={{ border: '1px solid #000', padding: '6px' }}>DATE</th>
                                <th style={{ border: '1px solid #000', padding: '6px' }}>DAY</th>
                                <th style={{ border: '1px solid #000', padding: '6px' }}>SUBJECT</th>
                                <th style={{ border: '1px solid #000', padding: '6px' }}>INVIGILATOR&apos;S SIGNATURE</th>
                            </tr>
                        </thead>
                        <tbody>
                            {studentSubjects.map((exm: any, i: number) => (
                                <tr key={i}>
                                    <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>
                                        {exm.exttS_Date ? format(new Date(exm.exttS_Date), 'dd.MM.yyyy') : ''}
                                    </td>
                                    <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>
                                        {exm.exttS_Date ? format(new Date(exm.exttS_Date), 'EEEE').toUpperCase() : ''}
                                    </td>
                                    <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>
                                        {' '}
                                        {exm.ismS_SubjectName}{' '}
                                    </td>
                                    <td style={{ border: '1px solid #000', padding: '6px' }}></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* SIGNATURES */}
                    <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'space-between' }}>
                        <div style={{ width: '45%', textAlign: 'center', paddingTop: '5px' }}> Candidate&apos;s Signature </div>
                        <div style={{ width: '45%', textAlign: 'center', paddingTop: '5px' }}>
                            {' '}
                            Parent&apos;s / Guardian&apos;s Signature{' '}
                        </div>
                    </div>
                    <div style={{ marginTop: '25px', display: 'flex', justifyContent: 'space-between' }}>
                        {/* Principal Signature */}
                        <div style={{ width: '45%', textAlign: 'center' }}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src='https://dcampusstrg.blob.core.windows.net/files/17/ISM_Attachments/b3ed8ce4-b047-4566-8fd7-b476e00c58e6.png'
                                alt='Principal Signature'
                                style={{ height: '40px', marginBottom: '5px', marginLeft: 'auto', marginRight: 'auto' }}
                            />
                            <div style={{ paddingTop: '5px' }}> Principal&apos;s Signature </div>
                        </div>
                        {/* Class Teacher Signature */}
                        <div style={{ width: '45%', textAlign: 'center' }}>
                            <div style={{ height: '40px' }}></div>
                            <div style={{ paddingTop: '5px' }}> Class Teacher&apos;s Signature </div>
                        </div>
                    </div>
                </div>
            </section>
        );
    };

    // ── Format 2 – Admit Card (Text Header - Based on provided HTML) ────────
    const renderAdmitCardFormat2 = (user: any) => {
        const studentSubjects = getStudentSubjects(user.amsT_Id);

        return (
            <section className='gmvpshallticket mb-8' style={{ fontFamily: '"Times New Roman", serif' }}>
                <div style={{ border: '1px solid #000', padding: '15px' }}>
                    {/* HEADER */}
                    <div style={{ textAlign: 'center', lineHeight: '1.4' }}>
                        <div style={{ fontSize: '18px', fontWeight: 'bold' }}> G M VIDYANIKETAN PUBLIC SCHOOL </div>
                        <div style={{ fontSize: '13px' }}> (Affiliated to the CBSE, Delhi, No-830189) </div>
                        <div style={{ fontSize: '13px' }}>
                            {' '}
                            G M Global Village, Post Box No.12, Brahmavar, Udupi District, Karnataka - 576213{' '}
                        </div>
                        <div style={{ fontSize: '13px' }}> Mob: +91 9845317165, +91 7090737165 </div>
                        <div style={{ fontSize: '13px' }}> Email: gmvidyaniketan@gmail.com &nbsp; Website: www.gmvps.net </div>
                        <div style={{ marginTop: '8px', fontSize: '14px', fontWeight: 'bold' }}>
                            {' '}
                            {examname} - {accyear}{' '}
                        </div>
                        <div style={{ fontSize: '16px', fontWeight: 'bold' }}> ADMIT CARD </div>
                    </div>

                    {/* STUDENT DETAILS */}
                    <div style={{ marginTop: '15px', display: 'flex', justifyContent: 'space-between' }}>
                        <div style={{ width: '75%', fontSize: '14px' }}>
                            <div style={{ marginBottom: '6px' }}>
                                <b>Student&apos;s Name</b> : {user.amsT_FirstName}
                            </div>
                            <div style={{ marginBottom: '6px' }}>
                                <b>Admission Number</b> : {user.amsT_AdmNo}
                            </div>
                            <div style={{ marginBottom: '6px' }}>
                                <b>Class</b> : {user.asmcL_ClassName}
                            </div>
                            <div style={{ marginBottom: '6px' }}>
                                <b>Father&apos;s Name</b> : {user.amsT_FatherName}
                            </div>
                            <div style={{ marginBottom: '6px' }}>
                                <b>Mother&apos;s Name</b> : {user.amsT_MotherName}
                            </div>
                        </div>
                        <div style={{ width: '120px', height: '140px', border: '1px solid #000', textAlign: 'center', overflow: 'hidden' }}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={user.amsT_Photoname}
                                alt='Student Photo'
                                style={{ width: '100%', height: '100%', display: 'block', objectFit: 'contain' }}
                            />
                        </div>
                    </div>

                    {/* EXAM TABLE */}
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px', fontSize: '13px' }}>
                        <thead>
                            <tr>
                                <th style={{ border: '1px solid #000', padding: '6px' }}>DATE</th>
                                <th style={{ border: '1px solid #000', padding: '6px' }}>DAY</th>
                                <th style={{ border: '1px solid #000', padding: '6px' }}>SUBJECT</th>
                                <th style={{ border: '1px solid #000', padding: '6px' }}>INVIGILATOR&apos;S SIGNATURE</th>
                            </tr>
                        </thead>
                        <tbody>
                            {studentSubjects.map((exm: any, i: number) => (
                                <tr key={i}>
                                    <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>
                                        {exm.exttS_Date ? format(new Date(exm.exttS_Date), 'dd.MM.yyyy') : ''}
                                    </td>
                                    <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>
                                        {exm.exttS_Date ? format(new Date(exm.exttS_Date), 'EEEE').toUpperCase() : ''}
                                    </td>
                                    <td style={{ border: '1px solid #000', padding: '6px', textAlign: 'center' }}>
                                        {' '}
                                        {exm.ismS_SubjectName}{' '}
                                    </td>
                                    <td style={{ border: '1px solid #000', padding: '6px' }}></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* SIGNATURES */}
                    <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'space-between' }}>
                        <div style={{ width: '45%', textAlign: 'center', paddingTop: '5px' }}> Candidate&apos;s Signature </div>
                        <div style={{ width: '45%', textAlign: 'center', paddingTop: '5px' }}>
                            {' '}
                            Parent&apos;s / Guardian&apos;s Signature{' '}
                        </div>
                    </div>
                    <div style={{ marginTop: '25px', display: 'flex', justifyContent: 'space-between' }}>
                        {/* Principal Signature */}
                        <div style={{ width: '45%', textAlign: 'center' }}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src='https://dcampusstrg.blob.core.windows.net/files/17/ISM_Attachments/b3ed8ce4-b047-4566-8fd7-b476e00c58e6.png'
                                alt='Principal Signature'
                                style={{ height: '40px', marginBottom: '5px', marginLeft: 'auto', marginRight: 'auto' }}
                            />
                            <div style={{ paddingTop: '5px' }}> Principal&apos;s Signature </div>
                        </div>
                        {/* Class Teacher Signature */}
                        <div style={{ width: '45%', textAlign: 'center' }}>
                            <div style={{ height: '40px' }}></div>
                            <div style={{ paddingTop: '5px' }}> Class Teacher&apos;s Signature </div>
                        </div>
                    </div>
                </div>
            </section>
        );
    };

    return (
        <Card className='mt-6'>
            <div className='no-print flex items-center justify-between border-b px-6 py-3'>
                <h3 className='font-semibold text-lg'>GMVPS Hallticket Report</h3>
                <div className='flex gap-2'>
                    <Button variant='default' size='sm' onClick={handlePrint} className='flex items-center gap-2'>
                        <Printer className='h-4 w-4' /> Print
                    </Button>
                </div>
            </div>

            <CardContent className='overflow-auto bg-gray-50 p-6'>
                <div ref={printRef} className='print-container mx-auto bg-white p-4' style={{ maxWidth: '900px' }}>
                    {/* Format 1: Admit Card with Logo */}
                    {reportFormat === 'format1' &&
                        mainList.map((user: any, index: number) => (
                            <div key={index}>
                                {renderAdmitCardFormat1(user)}
                                {index < mainList.length - 1 && <div className='page-break' />}
                            </div>
                        ))}

                    {/* Format 2 & 3: Admit Card with Text Header */}
                    {(reportFormat === 'format2' || reportFormat === 'format3') &&
                        mainList.map((user: any, index: number) => (
                            <div key={index}>
                                {renderAdmitCardFormat2(user)}
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
                    .gmvpshallticket {
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
                        max-width: none !important;
                    }
                }
            `}</style>
        </Card>
    );
};
export default ReportList;
