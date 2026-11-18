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
    awardName: string;
    sessionDate: string;
};

const LittleAnnsCertificate = React.forwardRef<HTMLDivElement, CertificateProps>(({ student, purpose, awardName, sessionDate }, ref) => {
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
                            padding: 6mm 8mm 6mm 8mm;
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
                        background: transparent;
                        font-family: "Times New Roman", Times, serif;
                        color: #000;
                    }

                    .certificate-container {
                        position: relative;
                        width: 1000px;
                        height: 700px;
                        margin: auto;
                        background: #ffe600 !important;
                        border: 20px solid #00aef0;
                        padding: 18px;
                        box-sizing: border-box;
                        font-family: "Times New Roman", Times, serif;
                        color: #000;
                        overflow: hidden;
                    }

                    .inner-border {
                        position: absolute;
                        inset: 10px;
                        border: 2px solid rgba(0, 0, 0, 0.9);
                        pointer-events: none;
                    }

                    .certificate-header {
                        display: flex;
                        align-items: flex-start;
                        justify-content: space-between;
                        gap: 20px;
                        margin-top: 8px;
                        padding: 0 18px;
                    }

                    .header-left {
                        display: flex;
                        flex-direction: column;
                        gap: 8px;
                    }

                    .certificate-title {
                        font-family: Arial, Helvetica, sans-serif;
                        font-weight: 900;
                        letter-spacing: 0.5px;
                        color: #00aef0;
                        text-transform: uppercase;
                        line-height: 0.9;
                    }

                    .certificate-title .big-c {
                        font-size: 92px;
                        display: inline-block;
                        margin-right: 8px;
                        vertical-align: top;
                    }

                    .certificate-title .rest {
                        display: inline-block;
                        font-size: 34px;
                        margin-top: 18px;
                    }

                    .logo {
                        width: 270px;
                        height: auto;
                        margin-top: 10px;
                    }

                    .certificate-body {
                        margin-top: 60px;
                        font-size: 22px;
                        line-height: 2.35;
                        padding: 0 140px;
                    }

                    .certificate-body p {
                        margin: 14px 0;
                    }

                    .line {
                        display: inline-flex;
                        align-items: baseline;
                        justify-content: center;
                        border-bottom: 2px solid #000;
                        margin: 0 10px;
                        padding: 0 8px;
                        font-weight: bold;
                        color: #000;
                        transform: translateY(6px);
                        text-align: center;
                        white-space: nowrap;
                    }

                    .line-name { min-width: 210px; }
                    .line-event { min-width: 240px; }
                    .line-date { min-width: 260px; }
                    .line-award { min-width: 240px; }

                    .highlight-text {
                        font-family: 'Dancing Script', cursive;
                        font-size: 28px;
                        font-weight: 700;
                    }

                    .signature-section {
                        margin-top: 85px;
                        text-align: left;
                        padding-left: 80px;
                        position: relative;
                    }

                    .rector-sign {
                        width: 140px;
                        height: auto;
                        position: absolute;
                        top: -72px;
                        left: 50px;
                    }

                    .signature-line {
                        width: 172px;
                        margin-left:-40px;
                        border-bottom: 2px solid #000;
                        margin-bottom: 6px;
                    }

                    .signature-text {
                        font-weight: bold;
                        font-size: 20px;
                    }

                    .kids-image {
                        position: absolute;
                        bottom: 120px;
                        right: 120px;
                    }

                    .kids-image img {
                        width: 210px;
                        height: auto;
                    }

                    .certificate-title-bottom {
                        position: absolute;
                        bottom: 31px;
                        left: 0;
                        width: 100%;
                        text-align: center;
                        color: rgba(0, 0, 0, 0.85);
                        font-weight: 900;
                        font-family: 'Times New Roman', Times, serif;
                        font-size: 34px;
                        text-transform: none;
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
                    <div className='inner-border' />

                    <div className='certificate-header'>
                        <div className='header-left'>
                            <div className='certificate-title' aria-label='Certificate of Appreciation'>
                                <span className='big-c'>C</span>
                                <span className='rest'>
                                    ERTIFICATE OF
                                    <br />
                                    APPRECIATION
                                </span>
                            </div>
                        </div>
                        <img
                            src='https://dcampusstrg.blob.core.windows.net/files/0/ISM_Attachments/e909049e-8c6b-4e8e-b8a9-9787cb41b849.png'
                            alt='Little Ann’s Logo'
                            className='logo'
                        />
                    </div>

                    <div className='certificate-body'>
                        <p>
                            This is to certify that Master/Miss
                            <span className='line line-name'>
                                <span className='highlight-text'>{fullName}</span>
                            </span>
                        </p>

                        <p>
                            had participated in
                            <span className='line line-event'>
                                <span className='highlight-text'>{purpose}</span>
                            </span>
                        </p>

                        <p>
                            for the session {student?.acadamicyear || '____'} held on dated
                            <span className='line line-date'>
                                <span className='highlight-text'>{sessionDate}</span>
                            </span>
                        </p>

                        <p>
                            and awarded
                            <span className='line line-award'>
                                <span className='highlight-text'>{awardName}</span>
                            </span>
                            .
                        </p>

                        <div className='signature-section'>
                            <img
                                src='https://dcampusstrg.blob.core.windows.net/files/17/ISM_Attachments/89e83cbd-ca37-49f2-b3ee-1e3ba0d7798d.png'
                                alt='Rector Signature'
                                className='rector-sign'
                            />
                            <div className='signature-line' />
                            <p className='signature-text'>Rector</p>
                        </div>
                    </div>

                    <h1 className='certificate-title-bottom'>A Unit of St.Ann&apos;s Group of School</h1>

                    <div className='kids-image'>
                        <img
                            src='https://dcampusstrg.blob.core.windows.net/files/0/ISM_Attachments/900f92aa-c2ff-4df4-8018-6f3300ad5cf9.png'
                            alt='Kids Playing'
                        />
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

LittleAnnsCertificate.displayName = 'LittleAnnsCertificate';

export default LittleAnnsCertificate;
