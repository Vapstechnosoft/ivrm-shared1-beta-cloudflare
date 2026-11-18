'use client';

import { format } from 'date-fns';
import { forwardRef } from 'react';

interface NoObjectionCertPrintProps {
    data: any;
}

export const NoObjectionCertPrint = forwardRef<HTMLDivElement, NoObjectionCertPrintProps>(({ data }, ref) => {
    if (!data) return null;

    // data could be a single student object or contain a studentList
    const students = data.studentList || (data.studentname ? [data] : []);

    const formatDateWithDay = (dateStr: string) => {
        if (!dateStr) return '--';
        try {
            return format(new Date(dateStr), 'dd MMMM yyyy');
        } catch (e) {
            return '--';
        }
    };

    return (
        <div
            ref={ref}
            className='print-container bg-white text-black print:p-0'
            style={{ width: '210mm', minHeight: '297mm', padding: '0' }}>
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

                    @media print {
                        @page {
                            size: A4 portrait;
                            margin: 0;
                        }
                        body {
                            margin: 0 !important;
                            padding: 0 !important;
                            -webkit-print-color-adjust: exact !important;
                            print-color-adjust: exact !important;
                            background: white !important;
                        }
                        .print-container {
                            visibility: visible !important;
                            display: block !important;
                            width: 210mm !important;
                            height: 297mm !important;
                            margin: 0 !important;
                            padding: 0 !important;
                            position: relative !important;
                            overflow: hidden !important;
                        }
                        .print-container * {
                            visibility: visible !important;
                        }
                        .page-break {
                            page-break-after: always;
                        }
                    }

                    .main-container {
                        padding: 20px 40px;
                        box-sizing: border-box;
                        height: 297mm;
                        background-color: white;
                    }

                    .cert-border-outer {
                        border-left: 5px solid #d5303b !important;
                        height: 100%;
                    }

                    .cert-border-middle {
                        border-left: 5px solid #e7cb7d !important;
                        height: 100%;
                    }

                    .cert-border-inner {
                        border-left: 4px solid #211f21 !important;
                        height: 100%;
                        padding-left: 30px;
                        padding-right: 20px;
                        display: flex;
                        flex-direction: column;
                    }

                    .georgia-text {
                        font-family: Georgia, serif;
                    }
                `
                }}
            />

            {students.map((student: any, index: number) => (
                <div key={student.amsT_Id || index} className={index < students.length - 1 ? 'page-break' : ''}>
                    <div className='main-container'>
                        <div className='cert-border-outer'>
                            <div className='cert-border-middle'>
                                <div className='cert-border-inner'>
                                    {/* Header Image */}
                                    <div className='mb-8 w-full pt-4'>
                                        <img
                                            src={student.milogo || 'https://calcuttaboy.blob.core.windows.net/files/Logo_Main_Campus.jpg'}
                                            alt='School Logo'
                                            className='w-full object-fill'
                                        />
                                    </div>

                                    {/* Title */}
                                    <div className='mt-6 mb-8 text-center'>
                                        <h3 className='georgia-text font-bold text-[20px] uppercase tracking-wide underline'>
                                            TO WHOM IT MAY CONCERN
                                        </h3>
                                    </div>

                                    {/* Content */}
                                    <div className='georgia-text text-justify text-[20px] leading-[36px]'>
                                        <p>
                                            It is hereby certified that {student.gender5} {student.studentname} , S/o {student.fathername}{' '}
                                            is a bonafide student of this school studing in Class {student.class} Section {student.section},
                                            Roll No. and Scholor No.{student.admno} of this school.
                                            <br />
                                            <br />
                                            The School has no objection to {student.studentname} applying for the Schengen Visa for visiting
                                            Norway, Denmark and Finland from Tuesday, 30th April 2024 to Wednesday 15th May 2024.
                                        </p>
                                    </div>

                                    {/* Signature Section */}
                                    <div className='mt-20 space-y-0 pr-10 text-right'>
                                        <p className='georgia-text mb-0 font-bold text-[18px]'> (Raja McGee) </p>
                                        <p className='georgia-text font-bold text-[18px] leading-none underline'> Principal & Secretary </p>
                                    </div>

                                    {/* Dated Footer */}
                                    <div className='mt-12'>
                                        <p className='georgia-text text-[22px]'>
                                            Dated:
                                            <span className='inline-block border-black border-b-2 px-1'>
                                                {formatDateWithDay(student.date)}
                                            </span>
                                        </p>
                                    </div>

                                    {/* Footer Image */}
                                    <div className='mt-6 pb-2'>
                                        <img
                                            src='https://calcuttaboy.blob.core.windows.net/files/Bonafied_Footer_cbs.jpg'
                                            alt='Footer'
                                            className='w-full object-contain'
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
});

NoObjectionCertPrint.displayName = 'NoObjectionCertPrint';
