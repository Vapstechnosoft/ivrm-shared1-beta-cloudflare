'use client';

import type { StudyCertificateResponse } from '@/types/admission/preadmission/reports';
import { format } from 'date-fns';
import React from 'react';

type CertificateProps = {
    data: StudyCertificateResponse | null;
    selectedDate: Date | null;
    qrCode?: string;
};

const classToWords = (className: string) => {
    switch (className?.toUpperCase()) {
        case 'I':
            return 'FIRST';
        case 'II':
            return 'SECOND';
        case 'III':
            return 'THIRD';
        case 'IV':
            return 'FOURTH';
        case 'V':
            return 'FIFTH';
        case 'VI':
            return 'SIXTH';
        case 'VII':
            return 'SEVENTH';
        case 'VIII':
            return 'EIGHTH';
        case 'IX':
            return 'NINTH';
        case 'X':
            return 'TENTH';
        default:
            return className || '';
    }
};

const CharacterCertificate = React.forwardRef<HTMLDivElement, CertificateProps>(({ data, selectedDate, qrCode }, ref) => {
    if (!data || !data.studentList || data.studentList.length === 0) {
        return (
            <div ref={ref} className='bg-white p-10 text-center text-gray-400'>
                No student data available for Character Certificate.
            </div>
        );
    }

    const students = data.studentList;
    const principalSign = data.principalSign?.[0]?.ivrmgC_PrincipalSign || data.principalSign?.[0]?.IVRMSIG_Signature || '';
    const mI_Id = data.masterCompany?.[0]?.mI_Id;
    const masterCompany = data.masterCompany?.[0];

    return (
        <div ref={ref} className='printable-content w-full bg-white text-black'>
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
                            .print-component-wrapper {
                                display: block !important;
                                position: static !important;
                                visibility: visible !important;
                            }
                            .char-a4-page {
                                page-break-after: always;
                                width: 210mm;
                                min-height: 297mm;
                                margin: 0 auto;
                                position: relative;
                            }
                            .char-a4-page:last-child {
                                page-break-after: auto;
                            }
                        }

                        .char-a4-container {
                            width: 100%;
                            min-height: 297mm;
                            padding: 20mm;
                            margin: 0 auto;
                            position: relative;
                            overflow: hidden;
                            background: white;
                            display: flex;
                            flex-direction: column;
                            font-family: 'Times New Roman', Times, serif;
                        }

                        .char-bg-watermark::before {
                            content: "";
                            position: absolute;
                            top: 0;
                            left: 0;
                            right: 0;
                            bottom: 0;
                            background: url('https://vapsclg.blob.core.windows.net/files/57/COE_Images_Videos/f3a56e64-883f-4c81-9e9e-41c34eeb0b21.png') no-repeat center center;
                            background-size: 600px;
                            opacity: 0.08;
                            z-index: 0;
                            pointer-events: none;
                        }

                        .char-content-wrapper {
                            position: relative;
                            z-index: 1;
                            height: 100%;
                            display: flex;
                            flex-direction: column;
                        }
                    `
                }}
            />
            <div className='print-component-wrapper flex flex-col items-center gap-8 bg-gray-100 py-8 print:gap-0 print:bg-white print:py-0'>
                {students.map((student, index) => {
                    const classWords = classToWords(student.class);
                    const isStAnnas = student.IVRMMCT_Name?.toLowerCase().includes('annas') || mI_Id === 135;

                    const studentName = student.studentnam || '';
                    const fatherName = student.fathername || '';
                    const academicYear = student.acadamicyear || '';
                    const admNo = student.admno || '';
                    const logoBase64 = student.MI_Logo || '';

                    if (isStAnnas) {
                        return (
                            <div key={`${student.AMST_Id || 's'}-${index}`} className='char-a4-page bg-white print:shadow-none'>
                                <div className='char-a4-container char-bg-watermark'>
                                    <div className='char-content-wrapper pt-[120px]'>
                                        <div className='mb-20 text-center'>
                                            <div className='mx-auto mb-3 w-[150px]'>
                                                {logoBase64 && <img src={logoBase64} className='h-auto w-full object-contain' alt='Logo' />}
                                            </div>
                                            <h3 className='font-bold text-[24px] uppercase tracking-wide underline'>
                                                CONDUCT & CHARACTER CERTIFICATE
                                            </h3>
                                        </div>

                                        <div className='flex-1 px-4 text-justify font-serif text-[22px] leading-[3rem]'>
                                            <p className='mb-12 indent-20'>
                                                Certified that <span className='font-bold uppercase'>{studentName}</span>, Son / Daughter of{' '}
                                                <span className='font-bold uppercase'>{fatherName}</span>, was a student of this school of{' '}
                                                <span className='font-bold uppercase'>{student.class}</span> class. He / She has passed /
                                                appeared at / failed in the ................. Examinations in{' '}
                                                <strong className='underline'>............</strong>.
                                            </p>
                                            <p className='mb-12'>He / She bears a good moral Character.</p>
                                            <p className=''>I wish him / her all success in life.</p>
                                        </div>

                                        <div className='mt-auto flex items-end justify-between px-4 pb-12'>
                                            <div className='font-bold text-[20px] text-gray-800'>
                                                Date:{' '}
                                                <span className='font-normal'>
                                                    {selectedDate ? format(selectedDate, 'dd/MM/yyyy') : '___________'}
                                                </span>
                                            </div>
                                            <div className='hidden text-center print:block'>
                                                <div className='flex h-24 w-32 flex-col items-center justify-center rounded-lg border-2 border-gray-200 border-dashed font-bold text-gray-300 text-xs'>
                                                    <span>OFFICE SEAL</span>
                                                </div>
                                            </div>
                                            <div className='min-w-[200px] text-center'>
                                                {principalSign && (
                                                    <img
                                                        src={principalSign}
                                                        className='mx-auto mb-2 h-24 w-auto object-contain mix-blend-multiply'
                                                        alt='Principal Sign'
                                                    />
                                                )}
                                                <p className='border-black border-t pt-2 font-bold text-[20px] uppercase'>Principal</p>
                                            </div>
                                        </div>
                                        {qrCode && (
                                            <div className='absolute bottom-8 left-8 h-24 w-24 border border-gray-100 bg-white p-1'>
                                                <img src={qrCode} alt='QR' className='h-full w-full' />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    }

                    // Default Character Certificate (BCHARCERT style)
                    return (
                        <div key={`${student.AMST_Id || 's'}-${index}`} className='char-a4-page bg-white print:shadow-none'>
                            <div className='char-a4-container char-bg-watermark'>
                                <div className='char-content-wrapper pt-[200px]'>
                                    <div className='space-y-6 text-center'>
                                        <h2 className='font-black text-[48px] text-gray-900 uppercase tracking-[0.1em] underline'>
                                            CHARACTER CERTIFICATE
                                        </h2>
                                        <h3 className='font-serif text-[22px] text-gray-600 italic tracking-wider'>
                                            TO WHOMSOEVER IT MAY CONCERNS
                                        </h3>
                                    </div>

                                    <div className='mt-16 flex justify-end px-8'>
                                        <h4 className='font-medium text-[22px]'>
                                            Date :{' '}
                                            <span className='font-bold underline'>
                                                {selectedDate ? format(selectedDate, 'dd/MM/yyyy') : format(new Date(), 'dd/MM/yyyy')}
                                            </span>
                                        </h4>
                                    </div>

                                    <div className='mt-24 px-8 text-justify font-serif text-[26px] leading-[3.8rem]'>
                                        <p className='indent-24'>
                                            This is certified that Kumar/Kumari{' '}
                                            <span className='font-bold uppercase underline decoration-2 underline-offset-8'>
                                                {studentName}
                                            </span>
                                            child of Sri. <span className='font-bold uppercase'>{fatherName}</span> is a bonafide student of
                                            class{' '}
                                            <span className='font-bold uppercase'>
                                                {student.class} {classWords ? `(${classWords})` : ''}
                                            </span>
                                            for the academic year <span className='font-bold underline'>{academicYear}</span>. Her/His
                                            admission number is <span className='font-bold underline'>{admNo}.</span>
                                            He/She is good in studies, sports as well as in co-curricular activities.
                                        </p>
                                        <p className='mt-20 indent-24'>He / She bears a good moral character.</p>
                                    </div>

                                    <div className='mt-auto grid grid-cols-2 items-end gap-20 px-8 pb-12'>
                                        <div className='flex flex-col items-start'>
                                            {qrCode && (
                                                <div
                                                    className='border-2 border-gray-100 bg-white p-2 shadow-sm'
                                                    style={{ width: '130px', height: '130px' }}>
                                                    <img src={qrCode} alt='QR' className='h-full w-full object-contain' />
                                                </div>
                                            )}
                                        </div>
                                        <div className='flex flex-col items-center'>
                                            {principalSign && (
                                                <div className='mb-2 h-28 w-60'>
                                                    <img
                                                        src={principalSign}
                                                        alt='Signature'
                                                        className='h-full w-full object-contain mix-blend-multiply'
                                                    />
                                                </div>
                                            )}
                                            <div className='mt-2 w-full border-gray-900 border-t-2 pt-2 text-center'>
                                                <h4 className='font-bold text-[24px] uppercase tracking-wide'>Head of the School</h4>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
});

CharacterCertificate.displayName = 'CharacterCertificate';

export default CharacterCertificate;
