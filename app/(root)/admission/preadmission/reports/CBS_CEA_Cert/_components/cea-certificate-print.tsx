'use client';

import { format } from 'date-fns';
import { forwardRef } from 'react';

interface CeaCertificatePrintProps {
    data: any;
}

export const CeaCertificatePrint = forwardRef<HTMLDivElement, CeaCertificatePrintProps>(function CeaCertificatePrint({ data }, ref) {
    const selectedDate = data.selectedDate ? new Date(data.selectedDate) : new Date();

    return (
        <div
            ref={ref}
            className='printable-content bg-white text-black'
            style={{ width: '100%', minHeight: '297mm', padding: '0', margin: '0 auto' }}>
            <style
                dangerouslySetInnerHTML={{
                    __html: `
                        @font-face {
                            font-family: "Old English Text MT";
                            src: url("https://db.onlinewebfonts.com/t/f3258385782c4c96aa24fe8b5d5f9782.eot");
                            src: url("https://db.onlinewebfonts.com/t/f3258385782c4c96aa24fe8b5d5f9782.eot?#iefix")format("embedded-opentype"), 
                                 url("https://db.onlinewebfonts.com/t/f3258385782c4c96aa24fe8b5d5f9782.woff")format("woff"), 
                                 url("https://db.onlinewebfonts.com/t/f3258385782c4c96aa24fe8b5d5f9782.woff2")format("woff2"), 
                                 url("https://db.onlinewebfonts.com/t/f3258385782c4c96aa24fe8b5d5f9782.ttf")format("truetype"), 
                                 url("https://db.onlinewebfonts.com/t/f3258385782c4c96aa24fe8b5d5f9782.svg#Old English Text MT")format("svg");
                            font-weight: normal;
                            font-style: normal;
                            font-display: swap;
                        }
                        
                        .border-bottom12 {
                            border-bottom: 1px solid black;
                            padding: 0 5px;
                            display: inline-block;
                            width: 100px;
                            height: 1.5em;
                        }

                        .border-bottom-dotted {
                            border-bottom: 2px dotted black;
                            padding: 0 5px;
                            text-align: center;
                        }

                        @media print {
                            @page {
                                size: A4 portrait;
                                margin: 0;
                            }
                            * {
                                -webkit-print-color-adjust: exact !important;
                                print-color-adjust: exact !important;
                            }
                            body {
                                margin: 0;
                                padding: 0;
                                background: white !important;
                            }
                        }
                    `
                }}
            />

            <div style={{ borderLeft: '5px solid #d5303b', height: '100%', minHeight: '277mm', paddingLeft: '5px' }}>
                <div style={{ borderLeft: '5px solid #e7cb7d', height: '100%', minHeight: '277mm', paddingLeft: '5px' }}>
                    <div style={{ borderLeft: '4px solid #211f21', height: '100%', minHeight: '277mm', paddingLeft: '5px' }}>
                        <div style={{ margin: '30px' }}>
                            <img
                                src='https://calcuttaboy.blob.core.windows.net/files/Logo_Main_Campus.jpg'
                                alt='logo'
                                style={{ objectFit: 'fill', width: '100%' }}
                            />

                            <div style={{ marginTop: '30px' }}>
                                <h3
                                    style={{
                                        textAlign: 'center',
                                        fontFamily: 'Georgia, serif',
                                        fontSize: '28px',
                                        textDecoration: 'underline'
                                    }}>
                                    TO WHOM IT MAY CONCERN
                                </h3>
                            </div>
                            <br />

                            <table style={{ width: '100%' }}>
                                <tbody>
                                    <tr>
                                        <td style={{ fontSize: '25px', fontFamily: 'Georgia, serif' }}>
                                            1. This is to certify that{' '}
                                            <u>
                                                <b>Master {data.studentname || 'NA'}</b>
                                            </u>{' '}
                                            Son of{' '}
                                            <u>
                                                <b>{data.fathername || 'NA'}</b>
                                            </u>{' '}
                                            was a bonafide student of{' '}
                                            <u>
                                                <b>Calcutta Boys' School, 72, S.N. Banerjee Road. Kolkata 700-014</b>
                                            </u>{' '}
                                            and {data.gender4?.toLowerCase() || 'he'} studied in Class {data.className || 'NA'}{' '}
                                            {data.section || 'NA'} in this school during the previous academic year{' '}
                                            <u>
                                                <b>2023-2024</b>
                                            </u>
                                            .
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                            <br />

                            <table style={{ width: '100%' }}>
                                <tbody>
                                    <tr style={{ fontFamily: 'Georgia, serif' }}>
                                        <td style={{ fontSize: '25px' }}>
                                            2. (a) The school is affiliated to{' '}
                                            <u>
                                                <b>CISCE (Council for Indian School Certificate Examination)</b>
                                            </u>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>

                            <table style={{ width: '100%' }}>
                                <tbody>
                                    <tr style={{ fontFamily: 'Georgia, serif' }}>
                                        <td style={{ fontSize: '25px' }}>
                                            (b) Recognition of the school and Number:{' '}
                                            <u>
                                                <b>WB010</b>
                                            </u>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                            <br />

                            <table style={{ width: '100%' }}>
                                <tbody>
                                    <tr style={{ fontFamily: 'Georgia, serif' }}>
                                        <td style={{ fontSize: '25px' }}>
                                            3. This is also to certify that this school is running with{' '}
                                            <u>
                                                <b>Nursery & KG (02)</b>
                                            </u>{' '}
                                            classes prior to Class 1.
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                            <br />

                            <table style={{ width: '100%' }}>
                                <tbody>
                                    <tr style={{ fontFamily: 'Georgia, serif' }}>
                                        <td style={{ fontSize: '25px' }}>4. Hostel Subsidy:</td>
                                    </tr>
                                </tbody>
                            </table>

                            <table style={{ width: '100%' }}>
                                <tbody>
                                    <tr style={{ fontFamily: 'Georgia, serif' }}>
                                        <td style={{ fontSize: '25px' }} width='865'>
                                            (a) This is also to certify that the school is residential and is not a day boarding
                                        </td>
                                    </tr>
                                </tbody>
                            </table>

                            <table style={{ width: '100%' }}>
                                <tbody>
                                    <tr style={{ fontFamily: 'Georgia, serif' }}>
                                        <td style={{ fontSize: '25px' }} width='300'>
                                            school and an amount of
                                        </td>
                                        <td style={{ fontSize: '25px' }} className='border-bottom-dotted' width='190'>
                                            NA
                                        </td>
                                        <td style={{ fontSize: '25px' }} width='120'>
                                            (in figure)
                                        </td>
                                        <td style={{ fontSize: '25px' }} className='border-bottom-dotted' width='190'>
                                            NA
                                        </td>
                                        <td style={{ fontSize: '25px' }} width='200'>
                                            (in words) was
                                        </td>
                                    </tr>
                                </tbody>
                            </table>

                            <table style={{ width: '100%' }}>
                                <tbody>
                                    <tr style={{ fontFamily: 'Georgia, serif' }}>
                                        <td style={{ fontSize: '25px' }} width='500'>
                                            incurred by {data.hisHer || 'his'} parents
                                        </td>
                                        <td style={{ fontSize: '25px' }} className='border-bottom-dotted' width='200'>
                                            NA
                                        </td>
                                        <td style={{ fontSize: '25px' }} width='230'>
                                            towards lodging and
                                        </td>
                                    </tr>
                                </tbody>
                            </table>

                            <table style={{ width: '100%' }}>
                                <tbody>
                                    <tr style={{ fontFamily: 'Georgia, serif' }}>
                                        <td style={{ fontSize: '25px' }} width='630'>
                                            boarding in favour of this student.
                                        </td>
                                        <td style={{ fontSize: '25px' }} className='border-bottom-dotted' width='250'>
                                            NA
                                        </td>
                                        <td style={{ fontSize: '25px' }} width='50'>
                                            who
                                        </td>
                                    </tr>
                                </tbody>
                            </table>

                            <table style={{ width: '100%' }}>
                                <tbody>
                                    <tr style={{ fontFamily: 'Georgia, serif' }}>
                                        <td style={{ fontSize: '25px' }} width='810'>
                                            resided in the residential complex of this school during the academic year
                                        </td>
                                        <td style={{ fontSize: '25px' }} className='border-bottom-dotted' width='125'>
                                            NA
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                            <br />

                            <table style={{ width: '100%' }}>
                                <tbody>
                                    <tr style={{ fontFamily: 'Georgia, serif' }}>
                                        <td style={{ fontSize: '25px' }} width='680'>
                                            (b) As per this school record residential address of the student
                                        </td>
                                        <td style={{ fontSize: '25px' }} className='border-bottom-dotted' width='255'>
                                            NA
                                        </td>
                                    </tr>
                                </tbody>
                            </table>

                            <br />
                            <br />

                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '40px' }}>
                                <div style={{ flex: 1 }}>
                                    <p style={{ fontFamily: 'Georgia, serif', fontSize: '25px' }}>
                                        <b>Office stamp of the school:</b>
                                    </p>
                                </div>
                                <div style={{ flex: 1, paddingLeft: '50px' }}>
                                    <p style={{ fontFamily: 'Georgia, serif', fontSize: '25px' }}>
                                        <b>Signature of Head of the School/Institution&nbsp;&nbsp;</b>
                                    </p>
                                    <br />
                                    <p style={{ fontFamily: 'Georgia, serif', fontSize: '25px' }}>
                                        <b>Stamp:&nbsp;&nbsp;</b>
                                    </p>
                                    <br />
                                    <p style={{ fontFamily: 'Georgia, serif', fontSize: '25px' }}>
                                        <b>Date:&nbsp;&nbsp;{format(selectedDate, 'dd MMMM yyyy')}</b>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
});
