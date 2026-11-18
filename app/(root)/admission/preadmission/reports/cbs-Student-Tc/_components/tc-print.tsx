'use client';

import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { forwardRef } from 'react';

interface TcPrintProps {
    data: any;
}

export const TcPrint = forwardRef<HTMLDivElement, TcPrintProps>(({ data }, ref) => {
    if (!data) return null;

    const students = data.studentList || (data.lblstdname ? [data] : []);

    const safeFormat = (dateStr: any, formatStr: string) => {
        if (!dateStr) return '';
        try {
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) return '';
            return format(date, formatStr);
        } catch (e) {
            return '';
        }
    };

    const renderSingleCopy = (student: any, isRightCopy: boolean) => (
        <div style={{ minHeight: '7.3in' }}>
            <div style={{ borderLeft: '5px solid #d5303b', height: '7.3in' }}>
                <div style={{ borderLeft: '5px solid #e7cb7d', height: '100%' }}>
                    <div
                        style={{
                            borderLeft: '4px solid #211f21',
                            height: '100%',
                            paddingLeft: isRightCopy ? '13px' : '10px',
                            paddingRight: '10px'
                        }}>
                        {/* Header logo */}
                        <div className='mb-2 w-full'>
                            <img src={student.imgname} alt='logo' style={{ width: '100%', height: '115px', objectFit: 'fill' }} />
                        </div>

                        <div className='mb-3 border-black border-y py-1 text-center'>
                            <h4
                                style={{
                                    margin: '0px',
                                    fontFamily: '"Source Sans Pro", sans-serif',
                                    fontWeight: 'bold',
                                    fontSize: '16px'
                                }}>
                                TRANSFER CERTIFICATE
                            </h4>
                        </div>

                        <div style={{ fontSize: '14px', fontFamily: 'Georgia, serif' }}>
                            <div className='text-right'>
                                <b style={{ fontWeight: '600' }}>Date:</b>&nbsp;
                                <span>{safeFormat(student.astC_TCIssueDate, 'dd-MM-yyyy')}</span>
                            </div>
                            <div className='flex w-full items-center justify-between'>
                                <div className='text-left'>
                                    <b style={{ fontWeight: '600' }}>T.C. Serial No:</b>&nbsp;
                                    <span>{student.tcno}</span>
                                </div>
                                <div className='text-right'>
                                    <b style={{ fontWeight: '600' }}>BSP ID:</b>&nbsp;
                                    <span>{student.BSPID}</span>
                                </div>
                            </div>
                            <div className='text-left'>
                                <b style={{ fontWeight: '600' }}>Scholar No:</b>&nbsp;
                                <span>{student.admno}</span>
                            </div>

                            <p style={{ lineHeight: '22px', textAlign: 'justify', marginTop: '15px' }}>
                                This is to certify that{' '}
                                <b style={{ fontWeight: '600' }}>
                                    {student.abbrivation}
                                    {student.lblstdname}
                                </b>{' '}
                                son of <b style={{ fontWeight: '600' }}>{student.lblfathername}</b> was admitted into this school on the{' '}
                                {safeFormat(student.lbldoa, 'MMMM yyyy')} in class <b style={{ fontWeight: '600' }}>{student.joinclass}</b>{' '}
                                on a transfer from <b style={{ fontWeight: '600' }}>{student.Previous_School_Name || 'null'}</b> and left on
                                the {safeFormat(student.leftdate, 'dd-MM-yyyy')} with a{' '}
                                <b style={{ fontWeight: '600' }}>{student.lblconduct?.toLowerCase()}</b> character.
                            </p>

                            <p style={{ lineHeight: '22px', textAlign: 'justify' }}>
                                He was then studying in the{' '}
                                <b style={{ fontWeight: '600' }}>
                                    {student.laststudied}-{student.asmC_SectionName}
                                </b>{' '}
                                class of the <b style={{ fontWeight: '600' }}>{student.Boardtype}</b> stream, the school year being from{' '}
                                <b style={{ fontWeight: '600' }}>
                                    {student.frommonth} to {student.tomonth}
                                </b>
                                .
                            </p>

                            <p style={{ lineHeight: '22px', textAlign: 'justify' }}>
                                All sums due to this school on his account have been remitted or satisfactorily arranged for.
                            </p>

                            <p style={{ lineHeight: '22px', textAlign: 'justify' }}>
                                His date of birth, according to School Admission Register is (in figures)&emsp;{' '}
                                <b style={{ fontWeight: '600' }}>{safeFormat(student.lbldob, 'dd-MM-yyyy')}</b> &emsp;(in words){' '}
                                <b style={{ fontWeight: '600' }}>{student.lbldobwords}</b>. <br />
                                <span className='mt-2 block'>
                                    <b style={{ fontWeight: '600' }}>
                                        {student.resulttype} {student.currentyear}.
                                    </b>
                                </span>
                            </p>
                        </div>

                        {/* Signature Block */}
                        <div className='text-left' style={{ marginTop: '40px' }}>
                            <div className='flex justify-end'>
                                <div className='text-right'>
                                    <b style={{ fontWeight: '600', fontSize: '13px' }}>(Principal & Secretary)</b>
                                </div>
                            </div>
                        </div>

                        {!isRightCopy ? (
                            <div style={{ marginTop: '20px' }}>
                                <div className='mb-2 flex items-center gap-2'>
                                    <b style={{ fontWeight: '600', fontSize: '13px', width: '100px' }}>Received by:</b>
                                    <span style={{ borderBottom: '1px solid #000', flexGrow: 1 }}></span>
                                </div>
                                <div className='mb-2 flex items-center gap-2'>
                                    <b style={{ fontWeight: '600', fontSize: '13px', width: '100px' }}>Relationship:</b>
                                    <span style={{ borderBottom: '1px solid #000', flexGrow: 1 }}></span>
                                </div>
                                <div className='flex items-center gap-2'>
                                    <b style={{ fontWeight: '600', fontSize: '13px', width: '130px' }}>Signature with date:</b>
                                    <span style={{ borderBottom: '1px solid #000', flexGrow: 1 }}></span>
                                </div>
                            </div>
                        ) : (
                            <div style={{ marginTop: '30px' }}>
                                <div className='mb-4 flex items-center gap-2'>
                                    <b style={{ fontWeight: '600', fontSize: '13px', width: '100px' }}>Countersigned:</b>
                                    <span style={{ borderBottom: '1px solid #000', flexGrow: 1 }}></span>
                                </div>
                                <div className='flex justify-end pr-8'>
                                    {student.ASCISS_QRCode && (
                                        <div style={{ width: '80px', height: '80px', padding: '2px', border: '1px solid #ddd' }}>
                                            <img src={student.ASCISS_QRCode} alt='QR' style={{ width: '100%', height: '100%' }} />
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div ref={ref} className='print-main-wrapper bg-white'>
            <style
                type='text/css'
                dangerouslySetInnerHTML={{
                    __html: `
                @font-face {
                    font-family: "Old English Text MT";
                    src: url("https://db.onlinewebfonts.com/t/f3258385782c4c96aa24fe8b5d5f9782.ttf") format("truetype");
                    font-weight: normal; font-style: normal; font-display: swap;
                }
                
                @media print {
                    @page {
                        size: A4 landscape;
                        margin: 0;
                    }
                    body {
                        margin: 0 !important;
                        padding: 0 !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                        background: white !important;
                    }
                    .print-main-wrapper {
                        visibility: visible !important;
                        display: block !important;
                        width: 297mm !important;
                        height: 210mm !important;
                        margin: 0 !important;
                        padding: 10mm !important;
                        position: relative !important;
                        overflow: hidden !important;
                    }
                    .print-main-wrapper * {
                        visibility: visible !important;
                    }
                    .page-break {
                        page-break-after: always;
                    }
                }
                
                .page-container {
                    width: 297mm;
                    height: 210mm;
                    padding: 10mm;
                    box-sizing: border-box;
                    background-color: white;
                }
                
                table { width: 100%; border-collapse: collapse; }
                td { vertical-align: top; }
            `
                }}
            />

            {students.map((student: any, index: number) => (
                <div key={student.amsT_Id || index} className={cn('page-container', index < students.length - 1 ? 'page-break' : '')}>
                    <table className='w-full' style={{ tableLayout: 'fixed' }}>
                        <tbody>
                            <tr>
                                <td width='50%' style={{ fontFamily: 'Georgia, serif', paddingRight: '15px' }}>
                                    {renderSingleCopy(student, false)}
                                </td>
                                <td width='50%' style={{ fontFamily: 'Georgia, serif', paddingLeft: '15px' }}>
                                    {renderSingleCopy(student, true)}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            ))}
        </div>
    );
});

TcPrint.displayName = 'TcPrint';
