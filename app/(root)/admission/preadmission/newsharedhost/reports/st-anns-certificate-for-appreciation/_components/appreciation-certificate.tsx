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
    heldOnDate: string;
    awardName: string;
};

const AppreciationCertificate = React.forwardRef<HTMLDivElement, CertificateProps>(({ student, purpose, heldOnDate, awardName }, ref) => {
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
                            border: 4px double #006b54 !important;
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
                        background: #fff;
                        border: 4px double #006b54;
                        font-family: "Times New Roman", serif;
                        overflow: hidden;
                        box-shadow: 0 0 15px rgba(0, 0, 0, 0.2);
                        box-sizing: border-box;
                        background-image: 
                            linear-gradient(135deg, #006b54 0%, #006b54 20%, #d4af37 20%, #d4af37 25%, transparent 25%), 
                            linear-gradient(315deg, #006b54 0%, #006b54 20%, #d4af37 20%, #d4af37 25%, transparent 25%);
                        background-repeat: no-repeat;
                        background-position: top left, bottom right;
                        background-size: 350px 150px;
                    }

                    .certificate-watermark {
                        position: absolute;
                        top: 65%;
                        left: 58%;
                        transform: translate(-50%, -50%);
                        opacity: 0.12;
                        z-index: 0;
                        width: 100%;
                        display: flex;
                        justify-content: center;
                    }

                    .certificate-watermark img {
                        width: 60%;
                        height: auto;
                        margin-top: -24px;
                    }

                    .certificate-header {
                        position: relative;
                        text-align: center;
                        padding-top: 30px;
                        z-index: 2;
                        width: 100%;
                    }

                    .header-image {
                        width: 813px;
                        height: auto;
                        position: relative;
                        left: 50px;
                        margin-top: -53px;
                    }

                    .certificate-title-box {
                        text-align: left;
                        margin: 20px 0 5px 100px;
                        z-index: 2;
                        position: relative;
                    }

                    .title-image {
                        width: 230px;
                        height: auto;
                        margin-top: -29px;
                    }

                    .certificate-body {
                        position: relative;
                        z-index: 2;
                        margin: 60px 100px;
                        margin-top: 31px;
                        font-size: 30px;
                        line-height: 1.7;
                        color: #000;
                    }

                    .certificate-body .rows {
                        width: 100%;
                    }

                    .certificate-body .row {
                        display: flex;
                        align-items: baseline;
                        gap: 12px;
                        margin: 10px 0;
                        flex-wrap: nowrap;
                    }

                    .certificate-body .label {
                        white-space: nowrap;
                    }

                    .blank {
                        display: inline-flex;
                        align-items: baseline;
                        justify-content: center;
                        border-bottom: 1px solid #000;
                        text-align: center;
                        flex: 1;
                        min-width: 120px;
                    }

                    .highlight-text {
                        font-family: 'Dancing Script', cursive;
                        font-size: 25px;
                        font-weight: bold;
                    }

                    .certificate-footer {
                        position: absolute;
                        bottom: 24px;
                        left: 100px;
                        right: 100px;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        z-index: 2;
                    }

                    .signature-box {
                        text-align: center;
                        position: relative;
                        width: 100%;
                    }

                    .rector-sign {
                        width: 132px;
                        height: auto;
                        display: block;
                        margin: 0 auto;
                        position: absolute;
                        top: -115px;
                        left: 50%;
                        transform: translateX(-50%);
                    }

                    .signature-line {
                        margin: 3px;
                        margin-top: -54px;
                        border-bottom: 1px solid #000;
                        width: 250px;
                        margin-left: auto;
                        margin-right: auto;
                    }

                    .signature-title {
                        font-weight: bold;
                        font-size: 30px;
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
                    <div className='certificate-watermark'>
                        <img
                            src='https://dcampusstrg.blob.core.windows.net/files/17/ISM_Attachments/702a1ff2-e331-4897-ab85-d33ad299fd4c.jpg'
                            alt='Watermark'
                        />
                    </div>

                    <div className='certificate-header'>
                        <img
                            src='https://dcampusstrg.blob.core.windows.net/files/17/ISM_Attachments/a4c9e310-b5a5-4a2c-acb3-340b83b14297.jpg'
                            alt='School Header'
                            className='header-image'
                        />
                    </div>

                    <div className='certificate-title-box'>
                        <img
                            src='https://dcampusstrg.blob.core.windows.net/files/17/ISM_Attachments/fb143acd-e266-4646-acaa-f6d51e0090e2.png'
                            alt='Certificate Title'
                            className='title-image'
                        />
                    </div>

                    <div className='certificate-body'>
                        <div className='rows'>
                            <div className='row'>
                                <span className='label'>This is to certify that Master/Miss</span>
                                <span className='blank'>
                                    <span className='highlight-text'>{fullName}</span>
                                </span>
                            </div>

                            <div className='row'>
                                <span className='label'>has participated in</span>
                                <span className='blank'>
                                    <span className='highlight-text'>{purpose}</span>
                                </span>
                            </div>

                            <div className='row'>
                                <span className='label'>for the session {student?.acadamicyear || '____'} held on</span>
                                <span className='blank'>
                                    <span className='highlight-text' style={{ fontSize: '30px' }}>
                                        {heldOnDate}
                                    </span>
                                </span>
                            </div>

                            <div className='row'>
                                <span className='label'>and has been awarded</span>
                                <span className='blank'>
                                    <span className='highlight-text' style={{ fontSize: '30px' }}>
                                        {awardName}
                                    </span>
                                </span>
                                <span className='label'>.</span>
                            </div>
                        </div>
                    </div>

                    <div className='certificate-footer'>
                        <div className='signature-box'>
                            <img
                                src='https://dcampusstrg.blob.core.windows.net/files/17/ISM_Attachments/89e83cbd-ca37-49f2-b3ee-1e3ba0d7798d.png'
                                alt='Rector Signature'
                                className='rector-sign'
                            />
                            <div className='signature-line' />
                            <p className='signature-title'>Rector</p>
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

AppreciationCertificate.displayName = 'AppreciationCertificate';

export default AppreciationCertificate;
