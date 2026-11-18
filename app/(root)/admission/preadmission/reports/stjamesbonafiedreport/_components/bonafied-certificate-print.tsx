'use client';

import { format } from 'date-fns';
import { forwardRef } from 'react';

interface BonafiedCertificatePrintProps {
    data: any;
    reportFormat: number;
}

function getOrdinalSuffix(day: number): string {
    const j = day % 10;
    const k = day % 100;
    if (j === 1 && k !== 11) return 'st';
    if (j === 2 && k !== 12) return 'nd';
    if (j === 3 && k !== 13) return 'rd';
    return 'th';
}

function getMonthName(monthIndex: number): string {
    const months = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December'
    ];
    return months[monthIndex] || '';
}

export const BonafiedCertificatePrint = forwardRef<HTMLDivElement, BonafiedCertificatePrintProps>(function BonafiedCertificatePrint(
    { data, reportFormat },
    ref
) {
    const selectedDate = data.selectedDate ? new Date(data.selectedDate) : new Date();
    const dateDay = selectedDate.getDate();
    const dateMonth = getMonthName(selectedDate.getMonth());
    const dateYear = selectedDate.getFullYear();
    const dateSuffix = getOrdinalSuffix(dateDay);

    const dob = data.dob ? new Date(data.dob) : null;
    const stuDoa = data.stuDoa ? new Date(data.stuDoa) : null;
    const leftDate = data.leftdate ? new Date(data.leftdate) : null;

    console.log(data);
    return (
        <div
            ref={ref}
            className='printable-content bg-white text-black'
            style={{ width: '210mm', minHeight: '297mm', padding: '20mm', fontFamily: 'Calibri, sans-serif', margin: '0 auto' }}>
            <style
                dangerouslySetInnerHTML={{
                    __html: `
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
            {/* Format 1: Studying / Left / Deactive */}
            {reportFormat === 1 && (
                <div>
                    <div style={{ marginTop: '220px' }}>
                        <div style={{ float: 'right' }}>
                            <p style={{ fontFamily: 'Calibri', fontWeight: 'bold' }}>
                                {dateDay}
                                <sup style={{ fontSize: '10px', fontFamily: 'Calibri', fontWeight: 'bold' }}>{dateSuffix}</sup>
                                {dateMonth} , {dateYear}
                            </p>
                        </div>
                    </div>
                    <div style={{ clear: 'both' }}>
                        <h3 style={{ textAlign: 'center', textDecoration: 'underline', fontFamily: 'Calibri' }}>TO WHOM IT MAY CONCERN</h3>
                        <p style={{ fontFamily: 'Calibri' }}>
                            This is to certify that {data.studentname} {data.sonof} {data.fathername} {data.isorwas} a bonafide student of
                            our Institution. {data.gender4} {data.leftoractive} studying in Class {data.className} {data.section}{' '}
                            {data.leftoractivedate} {leftDate ? format(leftDate, 'dd.MM.yyyy') : ''}
                            {data.dot}
                        </p>
                        <p style={{ fontFamily: 'Calibri' }}>
                            As per the records of the School {data.hisHer} Date of Birth is <b>{dob ? format(dob, 'dd.MM.yyyy') : ''}</b>.
                            <br />
                            <br /> Date of Admission is on <b>{stuDoa ? format(stuDoa, 'dd.MM.yyyy') : ''}</b> in Class{' '}
                            <b>{data.admittedclass},</b> Regn No.<b>{data.admno}.</b>
                        </p>
                        <p style={{ fontFamily: 'Calibri' }}>The above statement is true to the best of my knowledge. </p>
                        <br />
                        <br />
                        <br />
                    </div>
                    <div>
                        <p style={{ fontFamily: 'Calibri' }}>[Dr. T.H. Ireland]</p>
                        <br />
                        <p style={{ paddingLeft: '20px', marginTop: '-32px', fontFamily: 'Calibri' }}>
                            <b>Principal</b>
                        </p>
                    </div>
                </div>
            )}

            {/* Format 2: 12th Class Format */}
            {reportFormat === 2 && (
                <div>
                    <div style={{ marginTop: '220px' }}>
                        <div style={{ float: 'right' }}>
                            <p style={{ fontFamily: 'Calibri', fontWeight: 'bold' }}>
                                {dateDay}
                                <sup style={{ fontSize: '10px', fontFamily: 'Calibri', fontWeight: 'bold' }}>{dateSuffix}</sup>
                                {dateMonth} , {dateYear}
                            </p>
                        </div>
                    </div>
                    <div style={{ clear: 'both' }}>
                        <h3 style={{ textAlign: 'center', textDecoration: 'underline', fontFamily: 'Calibri' }}>TO WHOM IT MAY CONCERN</h3>
                        <p style={{ fontFamily: 'Calibri' }}>
                            This is to certify that {data.studentname} {data.sonof} {data.fathername} was a bonafide student of our
                            Institution. {data.gender4} has passed the ISC Examination&apos;s in {data.yearcode1}.
                        </p>
                        <p style={{ fontFamily: 'Calibri' }}>
                            As per the records of the School {data.hisHer} Date of Birth is <b>{dob ? format(dob, 'dd.MM.yyyy') : ''}</b>.
                            <br />
                            <br /> Date of Admission is on <b>{stuDoa ? format(stuDoa, 'dd.MM.yyyy') : ''}</b> in Class{' '}
                            <b>{data.admittedclass},</b> Regn No.<b>{data.admno}.</b>
                        </p>
                        <p style={{ fontFamily: 'Calibri' }}>The above statement is true to the best of my knowledge. </p>
                        <br />
                        <br />
                        <br />
                    </div>
                    <div>
                        <p style={{ fontFamily: 'Calibri' }}>[Dr. T.H. Ireland]</p>
                        <br />
                        <p style={{ paddingLeft: '20px', marginTop: '-32px', fontFamily: 'Calibri' }}>
                            <b>Principal</b>
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
});
