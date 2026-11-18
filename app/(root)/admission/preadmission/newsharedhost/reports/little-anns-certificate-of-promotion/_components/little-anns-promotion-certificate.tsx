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
    completedCourse: string;
    promotedTo: string;
    promotionDate: string;
};

const LittleAnnsPromotionCertificate = React.forwardRef<HTMLDivElement, CertificateProps>(
    ({ student, purpose, completedCourse, promotedTo, promotionDate }, ref) => {
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
                            box-shadow: none !important;
                        }
                    }

                    .outer-wrap {
                        width: 1000px;
                        margin: 0 auto;
                        font-family: "Times New Roman", serif;
                        color: #000;
                    }

                    .certificate-container {
                        width: 1000px;
                        height: 700px;
                        margin: auto;
                        background: #ffffff;
                        position: relative;
                        font-family: "Times New Roman", serif;
                        box-sizing: border-box;
                        box-shadow: 0 0 20px rgba(0,0,0,0.2);
                        overflow: hidden;
                        border-radius: 15px;
                    }

                    .wave-border {
                        width: 100%;
                        height: 100%;
                        padding: 16px;
                        background: white;
                        border: 10px solid #004fa3;
                        position: relative;
                        box-sizing: border-box;
                        background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'><path fill='%23004fa3' d='M0 20 Q10 0 20 20 T40 20 V40 H0 Z'/></svg>");
                        background-repeat: repeat;
                        background-size: 40px 40px;
                    }

                    .certificate-content {
                        background: #fff;
                        height: 100%;
                        padding: 40px 60px;
                        position: relative;
                        z-index: 1;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                    }

                    .certificate-watermark {
                        position: absolute;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%);
                        opacity: 0.12;
                        z-index: 0;
                        width: 80%;
                    }

                    .certificate-watermark img {
                        width: 100%;
                        height: auto;
                    }

                    .certificate-title-top {
                        text-align: center;
                        font-size: 44px;
                        color: #004fa3;
                        font-weight: bold;
                        margin-bottom: 0px;
                        font-family: 'Times New Roman', Times, serif;
                        z-index: 2;
                    }

                    .certificate-body {
                        font-size: 26px;
                        color: #000;
                        line-height: 2.15;
                        padding: 0 60px;
                        z-index: 2;
                        position: relative;
                        margin-top: 28px;
                        width: 100%;
                        text-align: left;
                    }

                    .certificate-body .rows {
                        width: 100%;
                        max-width: 820px;
                        margin: 0 auto;
                    }

                    .certificate-body .row {
                        display: flex;
                        align-items: baseline;
                        gap: 14px;
                        margin: 10px 0;
                        flex-wrap: nowrap;
                    }

                    .certificate-body .label {
                        white-space: nowrap;
                    }

                    .fill-line {
                        display: inline-flex;
                        align-items: baseline;
                        justify-content: center;
                        border-bottom: 2px solid #000;
                        flex: 1;
                        min-width: 140px;
                        text-align: center;
                        font-weight: bold;
                        color: #000;
                    }

                    .highlight-text {
                        font-family: 'Dancing Script', cursive;
                        font-size: 28px;
                        font-weight: bold;
                    }

                    .signature-section {
                        margin-top: 70px;
                        text-align: left;
                        padding-left: 60px;
                        position: relative;
                        width: 100%;
                    }

                    .rector-sign {
                        width: 132px;
                        height: auto;
                        position: absolute;
                        top: -75px;
                        left: -20px;
                    }

                    .signature-line {
                        width: 250px;
                        border-bottom: 2px solid #000;
                        margin-bottom: 5px;
                        margin-left: -87px;
                    }

                    .signature-text {
                        font-weight: bold;
                        font-size: 26px;
                        margin-top: 3px;
                        margin-left: -5px;
                    }

                    .logo-bottom-right {
                        position: absolute;
                        bottom: 20px;
                        right: 40px;
                        width: 180px;
                        height: auto;
                        z-index: 2;
                    }

                    .footer-brand {
                        font-family: 'Times New Roman', Times, serif;
                        font-size: 34px;
                        margin-top: auto;
                        color: #000;
                        font-weight: bold;
                        z-index: 2;
                    }

                    .bottom-bar {
                        display: flex;
                        justify-content: center;
                        gap: 18px;
                        margin-top: 14px;
                        font-size: 16px;
                        font-weight: 900;
                    }

                    .bottom-sep {
                        margin: 0 10px;
                    }
                `}
                </style>

                <div className='outer-wrap'>
                    <div className='certificate-container'>
                        <div className='wave-border'>
                            <div className='certificate-content'>
                                <div className='certificate-watermark'>
                                    <img
                                        src='https://dcampusstrg.blob.core.windows.net/files/0/ISM_Attachments/e909049e-8c6b-4e8e-b8a9-9787cb41b849.png'
                                        alt='Watermark'
                                    />
                                </div>

                                <h1 className='certificate-title-top'>Certificate of Promotion</h1>

                                <div className='certificate-body'>
                                    <div className='rows'>
                                        <div className='row'>
                                            <span className='label'>This is to certify that</span>
                                            <span className='fill-line'>
                                                <span className='highlight-text'>{fullName}</span>
                                            </span>
                                        </div>

                                        <div className='row'>
                                            <span className='label'>student of</span>
                                            <span className='fill-line'>
                                                <span className='highlight-text'>{purpose}</span>
                                            </span>
                                        </div>

                                        <div className='row'>
                                            <span className='label'>has successfully completed</span>
                                            <span className='fill-line'>
                                                <span className='highlight-text'>{completedCourse}</span>
                                            </span>
                                        </div>

                                        <div className='row'>
                                            <span className='label'>and is now promoted to</span>
                                            <span className='fill-line'>
                                                <span className='highlight-text'>{promotedTo}</span>
                                            </span>
                                        </div>

                                        <div className='row'>
                                            <span className='label'>for the session {student?.acadamicyear || '____'} held on dated</span>
                                            <span className='fill-line'>
                                                <span className='highlight-text'>{promotionDate}</span>
                                            </span>
                                        </div>
                                    </div>

                                    <div className='signature-section'>
                                        <img
                                            src='https://dcampusstrg.blob.core.windows.net/files/17/ISM_Attachments/89e83cbd-ca37-49f2-b3ee-1e3ba0d7798d.png'
                                            alt='Signature'
                                            className='rector-sign'
                                        />
                                        <div className='signature-line' />
                                        <p className='signature-text'>Rector</p>
                                    </div>

                                    <img
                                        src='https://dcampusstrg.blob.core.windows.net/files/0/ISM_Attachments/e909049e-8c6b-4e8e-b8a9-9787cb41b849.png'
                                        alt='Little Ann’s Logo'
                                        className='logo-bottom-right'
                                    />
                                </div>

                                <h1 className='footer-brand'>A Unit of St.Ann's Group of School</h1>
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
    }
);

LittleAnnsPromotionCertificate.displayName = 'LittleAnnsPromotionCertificate';

export default LittleAnnsPromotionCertificate;
