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
    { data },
    ref
) {
    const selectedDate = data.selectedDate ? new Date(data.selectedDate) : new Date();

    const dateDay = selectedDate.getDate();
    const dateMonth = getMonthName(selectedDate.getMonth());
    const dateYear = selectedDate.getFullYear();
    const dateSuffix = getOrdinalSuffix(dateDay);

    const dob = data.dob ? new Date(data.dob) : null;
    const stuDoa = data.stuDoa ? new Date(data.stuDoa) : null;

    return (
        <div
            ref={ref}
            className='printable-content bg-white text-black'
            style={{
                width: '210mm',
                minHeight: '297mm',
                padding: '22mm',
                margin: '0 auto',
                fontFamily: '"Times New Roman", Times, serif',
                fontSize: '18px',
                color: '#000'
            }}>
            <style
                dangerouslySetInnerHTML={{
                    __html: `
                    @media print {
                        @page {
                            size: A4 portrait;
                            margin: 18mm;
                        }

                        body{
                            margin:0;
                            padding:0;
                            background:#fff;
                            -webkit-print-color-adjust:exact;
                            print-color-adjust:exact;
                        }
                    }
                `
                }}
            />

            {/* Date */}

            <div
                style={{
                    textAlign: 'right',
                    fontWeight: 'bold',
                    marginBottom: '45px'
                }}>
                {dateDay}
                <sup style={{ fontSize: '12px' }}>{dateSuffix}</sup> {dateMonth} , {dateYear}
            </div>

            {/* Heading */}

            <div
                style={{
                    textAlign: 'center',
                    fontWeight: 'bold',
                    textDecoration: 'underline',
                    fontSize: '22px',
                    marginBottom: '45px'
                }}>
                TO WHOM IT MAY CONCERN
            </div>

            {/* First Paragraph */}

            <p
                style={{
                    textAlign: 'justify',
                    textIndent: '40px',
                    lineHeight: '1.9',
                    marginBottom: '28px'
                }}>
                This is to certify that <b>{data.studentname}</b> - I.D.No:
                <b>{data.admno}</b> Son of <b>{data.fathername}</b> residing at <b>{data.address}</b> is a bonafide student of this
                Institution in Class <b>{data.className}</b> Section - <b>{data.section}</b>. {data.gender4 || 'He'} was admitted in this
                Institution on <b>{stuDoa ? format(stuDoa, 'dd.MM.yyyy') : ''}</b>.
            </p>

            {/* Second Paragraph */}

            <p
                style={{
                    textAlign: 'justify',
                    textIndent: '40px',
                    lineHeight: '1.9',
                    marginBottom: '35px'
                }}>
                His date of birth as per the School Admission Register is <b>{dob ? format(dob, 'dd.MM.yyyy') : ''}</b>
                {data.dobwords ? ` (${data.dobwords})` : ''}.
            </p>

            {/* Purpose */}

            <p
                style={{
                    lineHeight: '1.8',
                    marginLeft: '40px'
                }}>
                This Certificate may be used for <b>{data.purpose}</b>.
            </p>
        </div>
    );
});
