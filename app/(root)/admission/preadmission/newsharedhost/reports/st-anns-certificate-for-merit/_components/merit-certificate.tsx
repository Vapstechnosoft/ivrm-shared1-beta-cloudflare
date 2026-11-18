'use client';

import { cn } from '@/lib/utils';
import { Dancing_Script } from 'next/font/google';
import React from 'react';

const dancingScript = Dancing_Script({
    subsets: ['latin'],
    weight: ['400', '700'],
    variable: '--font-dancing-script'
});

type CertificateProps = {
    student: {
        stuFN: string;
        stuMN: string;
        stuLN: string;
        acadamicyear: string;
    } | null;
    purpose: string;
};

const MeritCertificate = React.forwardRef<HTMLDivElement, CertificateProps>(({ student, purpose }, ref) => {
    const fullName = student ? `${student.stuFN} ${student.stuMN || ''} ${student.stuLN || ''}`.trim() : '';

    return (
        <div ref={ref} className={cn('printable-content', dancingScript.variable)}>
            <style>
                {`
                    @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;700&display=swap');
                    
                    @media print {
                        @page {
                            size: A4 landscape;
                            margin: 0;
                        }
                        body {
                            margin: 0;
                            padding: 0;
                            -webkit-print-color-adjust: exact !important;
                            print-color-adjust: exact !important;
                            background: white !important;
                        }
                        .certificate-container {
                            box-shadow: none !important;
                        }

                        /* Keep everything on a single sheet */
                        .outer-wrap,
                        .certificate-container,
                        .bottom-bar {
                            break-inside: avoid;
                            page-break-inside: avoid;
                        }

                        .outer-wrap {
                            width: 297mm;
                            height: 210mm;
                            margin: 0;
                            padding: 6mm 8mm;
                            box-sizing: border-box;
                        }

                        .certificate-container {
                            width: 100%;
                            height: auto;
                            aspect-ratio: 1000 / 700;
                        }
                    }

                    .outer-wrap {
                        width: 1000px;
                        margin: 0 auto;
                        font-family: "Times New Roman", serif;
                        color: #000;
                    }

                    .certificate-container {
                        position: relative;
                        width: 1000px;
                        height: 700px;
                        margin: auto;
                        background: #fffaf0;
                        border-radius: 8px;
                        padding: 12px;
                        box-shadow: 0 0 15px rgba(0,0,0,0.1);
                        box-sizing: border-box;
                        overflow: hidden;
                    }

                    .inner-border {
                        position: absolute;
                        top: 12px;
                        left: 12px;
                        right: 12px;
                        bottom: 12px;
                        border: 14px solid transparent;
                        border-image: url('https://i.ibb.co/6gKMxvD/golden-rope-frame.png') 30 round;
                        border-radius: 10px;
                        background-color: #fffdf5;
                        box-sizing: border-box;
                        padding: 30px;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                    }

                    .certificate-header {
                        text-align: center;
                        width: 100%;
                    }

                    .header-title {
                        font-family: 'Arial', sans-serif;
                        color: #004aad;
                        font-weight: 700;
                        font-size: 41px;
                        margin-bottom: 5px;
                        letter-spacing: 0.5px;
                    }

                    .header-subtitle {
                        font-family: 'Arial', sans-serif;
                        color: #0072bc;
                        font-weight: 600;
                        font-size: 34px;
                        margin-top: 0;
                        margin-bottom: 10px;
                    }

                    .header-address {
                        font-family: 'Arial', sans-serif;
                        color: #004aad;
                        font-size: 24px;
                        margin-top: 0;
                    }

                    .header-image {
                        width: 49%;
                        display: block;
                        margin: 0 auto -31px auto;
                        height: auto;
                    }

                    .certificate-body {
                        margin-top: 54px;
                        font-size: 25px;
                        color: #0072bc;
                        line-height: 1.4;
                        padding: 0 80px;
                        width: 100%;
                        box-sizing: border-box;
                    }

                    .dotted-underline {
                        display: inline-block;
                        border-bottom: 2px dotted #0072bc;
                        color: #000;
                        font-weight: bold;
                        padding-bottom: 2px;
                        margin-left: 10px;
                        vertical-align: bottom;
                        text-align: center;
                    }

                    .highlight-text {
                        font-family: 'Dancing Script', cursive;
                        font-size: 30px;
                        font-weight: bold;
                    }

                    .certificate-footer {
                        position: absolute;
                        bottom: 40px;
                        width: 100%;
                        left: 0;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                    }

                    .signature-box {
                        text-align: center;
                        position: relative;
                    }

                    .rector-sign {
                        width: 132px;
                        height: auto;
                        display: block;
                        margin: 0 auto;
                        position: absolute;
                        top: -108px;
                        left: 50%;
                        transform: translateX(-50%);
                    }

                    .signature-line {
                        margin: 3px;
                        margin-top: -54px;
                        border-bottom: 1px solid #000;
                        width: 250px;
                    }

                    .signature-title {
                        font-weight: bold;
                        font-size: 20px;
                        margin-top: 8px;
                        color: #000;
                    }

                    .bottom-bar {
                        display: flex;
                        justify-content: center;
                        gap: 18px;
                        margin-top: 14px;
                        font-size: 16px;
                        font-weight: 900;
                        color: #000;
                    }

                    .bottom-sep {
                        margin: 0 10px;
                    }
                `}
            </style>

            <div className='outer-wrap'>
                <div className='certificate-container'>
                    <div className='inner-border'>
                        <div className='certificate-header'>
                            <h1 className='header-title'>ST. ANN’S GROUP OF SCHOOL</h1>
                            <h2 className='header-subtitle'>ICSE & ISC, NEW DELHI</h2>
                            <p className='header-address'>Howrah Maidan | Bankra | Bolpur | Panchanantala</p>
                            <img
                                src='https://dcampusstrg.blob.core.windows.net/files/17/ISM_Attachments/43ac8b87-aedb-4b6c-8611-8d4312e1a8ea.jpg'
                                alt='School Header'
                                className='header-image'
                            />
                        </div>

                        <div className='certificate-body'>
                            <p>
                                Name
                                <span className='dotted-underline' style={{ width: '560px' }}>
                                    <span className='highlight-text'>{fullName}</span>
                                </span>
                            </p>
                            <p style={{ marginTop: '20px' }}>
                                For
                                <span className='dotted-underline' style={{ width: '380px' }}>
                                    <span className='highlight-text'>{purpose}</span>
                                </span>
                                &nbsp; For the Session {student?.acadamicyear || '____'}
                            </p>
                        </div>

                        <div className='certificate-footer'>
                            <div className='signature-box'>
                                <img
                                    src='https://dcampusstrg.blob.core.windows.net/files/17/ISM_Attachments/89e83cbd-ca37-49f2-b3ee-1e3ba0d7798d.png'
                                    alt='Rector Signature'
                                    className='rector-sign'
                                />
                                <div className='signature-line' />
                                <p className='signature-title'>Secretary</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className='bottom-bar'>
                    <span>4000+ Happy Students</span>
                    <span className='bottom-sep'>|</span>
                    <span>350+ Dedicated Teachers</span>
                    <span className='bottom-sep'>|</span>
                    <span>55+ Years of Excellence</span>
                </div>
            </div>
        </div>
    );
});

MeritCertificate.displayName = 'MeritCertificate';

export default MeritCertificate;
