'use client';

import { format } from 'date-fns';
import React from 'react';

interface StudyCertificateGMVPSPrintProps {
    data: any;
    certificateType: 'study' | 'character';
    selectedDate: Date | null;
    addressType: 'permanent' | 'communication';
    parentType: '0' | '1' | '2';
    qrCode?: string;
}

const getOrdinalSuffix = (day: number) => {
    const j = day % 10,
        k = day % 100;
    if (j === 1 && k !== 11) return 'st';
    if (j === 2 && k !== 12) return 'nd';
    if (j === 3 && k !== 13) return 'rd';
    return 'th';
};

const mapClassToWords = (className: string) => {
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
            return className?.toUpperCase() || '';
    }
};

export const StudyCertificateGMVPSPrint = React.forwardRef<HTMLDivElement, StudyCertificateGMVPSPrintProps>(
    ({ data, certificateType, selectedDate, addressType, parentType, qrCode }, ref) => {
        if (!data || !data.studentList || data.studentList.length === 0) return null;

        const students = data.studentList;
        const formattedCurrentDate = selectedDate ? format(selectedDate, 'dd/MM/yyyy') : format(new Date(), 'dd/MM/yyyy');

        return (
            <div ref={ref} id='printable-area' className='bg-white font-serif text-black'>
                <style
                    dangerouslySetInnerHTML={{
                        __html: `
                    @media print {
                        @page { size: A4; margin: 0; }
                        body * {
                            visibility: hidden;
                        }
                        #printable-area, #printable-area * {
                            visibility: visible !important;
                        }
                        #printable-area {
                            position: absolute;
                            left: 0;
                            top: 0;
                            width: 100% !important;
                            margin: 0 !important;
                            padding: 0 !important;
                        }
                        .page-container {
                            width: 210mm !important;
                            height: 290mm !important;
                            padding: 10mm !important;
                            box-sizing: border-box !important;
                            page-break-after: always !important;
                            background: white !important;
                            display: flex !important;
                            flex-direction: column !important;
                        }
                    }
                    .page-container {
                        width: 210mm;
                        height: 290mm;
                        padding: 15mm;
                        margin: 0 auto;
                        box-sizing: border-box;
                        background: white;
                        color: black !important;
                        font-family: "Times New Roman", Times, serif;
                    }
                    .outer-border {
                        border: 1px solid black !important;
                        height: 100%;
                        width: 100%;
                        padding: 1mm;
                        box-sizing: border-box;
                    }
                    .inner-border {
                        border: 2px solid black !important;
                        height: 100%;
                        width: 100%;
                        padding: 10mm 12mm;
                        box-sizing: border-box;
                        display: flex;
                        flex-direction: column;
                        position: relative;
                    }
                    .underline { border-bottom: 2px solid black !important; display: inline-block; min-width: 50px; text-align: center; }
                    .border-bottom { border-bottom: 1.5px solid black !important; padding-bottom: 2px; }
                    .text-bold { font-weight: bold !important; }
                    .header-margin { margin-top: 20px; }
                    .certificate-content { line-height: 2.2; font-size: 18px; margin-top: 35px; }
                `
                    }}
                />

                {students.map((student: any, index: number) => (
                    <div key={index} className='page-container'>
                        <div className='outer-border'>
                            <div className='inner-border'>
                                {certificateType === 'study' ? (
                                    <>
                                        <div className='header-margin mb-8 text-center'>
                                            <h3 className='font-bold text-xl uppercase tracking-wider underline'>
                                                TO WHOMSOEVER IT MAY CONCERN
                                            </h3>
                                        </div>

                                        <div className='mb-6 flex justify-end'>
                                            <div className='font-bold text-lg'>
                                                Date: <span>{formattedCurrentDate}</span>
                                            </div>
                                        </div>

                                        <div className='certificate-content space-y-4'>
                                            <div className='flex items-end leading-relaxed'>
                                                <span className='whitespace-nowrap font-bold'>
                                                    This is to certify that {student.gender?.toLowerCase() === 'female' ? 'Kum' : 'Sri'}
                                                </span>
                                                <span className='flex-1 border-black border-bottom px-2 text-center font-bold'>
                                                    {student.studentName}
                                                </span>
                                                <span className='ml-2 whitespace-nowrap font-bold'>
                                                    {student.gender?.toLowerCase() === 'female' ? 'D/o' : 'S/o'}
                                                </span>
                                            </div>

                                            <div className='flex items-end leading-relaxed'>
                                                <span className='flex-1 border-black border-bottom px-2 text-center font-bold'>
                                                    {student.fatherName}
                                                </span>
                                                <span className='ml-2 whitespace-nowrap font-bold'>has studied from Class</span>
                                                <span className='w-[120px] border-black border-bottom px-2 text-center font-bold'>
                                                    {mapClassToWords(student.joinedClass)}
                                                </span>
                                            </div>

                                            <div className='flex items-end leading-relaxed'>
                                                <span className='whitespace-nowrap font-bold'>to</span>
                                                <span className='w-[120px] border-black border-bottom px-2 text-center font-bold'>
                                                    {mapClassToWords(student.className)}
                                                </span>
                                                <span className='ml-2 whitespace-nowrap font-bold'>in our institution from</span>
                                                <span className='w-[120px] border-black border-bottom px-2 text-center font-bold'>
                                                    {student.joinedYear}
                                                </span>
                                                <span className='ml-2 whitespace-nowrap font-bold'>To</span>
                                                <span className='flex-1 border-black border-bottom px-2 text-center font-bold'>
                                                    {student.academicYear}
                                                </span>
                                            </div>

                                            <div className='font-bold'>academic years.</div>

                                            <div className='flex items-end pt-2 leading-relaxed'>
                                                <span className='whitespace-nowrap font-bold'>
                                                    {student.gender?.toLowerCase() === 'female' ? 'She' : 'He'} belongs to
                                                </span>
                                                <span className='flex-1 border-black border-bottom px-4 text-center font-bold'>
                                                    {student.caste?.toUpperCase()}
                                                </span>
                                                <span className='ml-2 whitespace-nowrap font-bold'>
                                                    Religion/Caste and mother tongue of the
                                                </span>
                                            </div>

                                            <div className='flex items-end leading-relaxed'>
                                                <span className='whitespace-nowrap font-bold'>Candidate is</span>
                                                <span className='w-[200px] border-black border-bottom px-4 text-center font-bold'>
                                                    {student.motherTongue?.toUpperCase()}
                                                </span>
                                                <span className='ml-2 whitespace-nowrap font-bold'>
                                                    as per the Admission register of the Institution.
                                                </span>
                                            </div>

                                            <div className='pt-6 font-bold'>
                                                The above details are true and correct to the best of my knowledge.
                                            </div>
                                        </div>

                                        <div className='mt-auto grid grid-cols-2 pt-16'>
                                            <div className='flex flex-col justify-end'>
                                                <div className='mb-10 font-bold text-lg'>Institution Seal</div>
                                                {(student.qrCode || qrCode) && (
                                                    <div className='mb-4'>
                                                        <img src={student.qrCode || qrCode} alt='QR Code' className='h-24 w-24' />
                                                    </div>
                                                )}
                                            </div>
                                            <div className='flex flex-col items-center text-center'>
                                                <div className='whitespace-nowrap font-bold text-lg leading-tight'>
                                                    Signature Head of the
                                                    <br />
                                                    Institution
                                                </div>
                                                <div className='mt-6 font-bold'>Name in block letters</div>
                                                <div className='mt-1 min-w-[180px] border-black border-bottom px-4 font-bold'>
                                                    ({student.area?.toUpperCase() || student.headName?.toUpperCase() || '__________'})
                                                </div>
                                            </div>
                                        </div>

                                        <div className='mt-12 border-black border-t-2 pt-4 text-center'>
                                            <div className='mb-1 font-bold text-lg uppercase tracking-widest'>COUNTER SIGNED BY ME</div>
                                            <div className='font-bold text-base'>Address, Seal & Office Telephone Number</div>
                                            <div className='font-bold text-base'>Of the Block Educational officer / DDPI</div>
                                        </div>
                                    </>
                                ) : (
                                    <div className='pt-10'>
                                        <div className='text-center'>
                                            <h2 className='mb-2 font-bold text-2xl underline'>CHARACTER CERTIFICATE</h2>
                                            <div className='font-bold text-lg'>TO WHOMSOEVER IT MAY CONCERN</div>
                                        </div>
                                        <div className='mt-6 flex justify-end'>
                                            <h4 className='font-bold text-lg'>Date : {formattedCurrentDate}</h4>
                                        </div>
                                        <div className='mt-12 space-y-8 text-xl leading-relaxed'>
                                            <p className='indent-12'>
                                                This is certified that {student.gender?.toLowerCase() === 'female' ? 'Kumari' : 'Kumar'}{' '}
                                                <span className='font-bold uppercase'>{student.studentName}</span>{' '}
                                                {student.gender?.toLowerCase() === 'female' ? 'daughter' : 'son'} of Sri.{' '}
                                                <span className='font-bold'>{student.fatherName}</span> is a bonafide student of class{' '}
                                                <span className='font-bold'>{student.className}</span> for the academic year{' '}
                                                <span className='font-bold'>{student.academicYear}</span>.{' '}
                                                {student.gender?.toLowerCase() === 'female' ? 'Her' : 'His'} admission number is{' '}
                                                <b>{student.admNo}.</b> {student.gender?.toLowerCase() === 'female' ? 'She' : 'He'} is good
                                                in studies, sports as well as in co-curricular activities.
                                            </p>
                                            <p className='mt-12'>
                                                {student.gender?.toLowerCase() === 'female' ? 'She' : 'He'} bears a good moral character.
                                            </p>
                                        </div>
                                        <div className='mt-24 flex flex-col items-end'>
                                            <div className='pt-2 font-bold text-lg'>Signature of Head of the School</div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }
);

StudyCertificateGMVPSPrint.displayName = 'StudyCertificateGMVPSPrint';
