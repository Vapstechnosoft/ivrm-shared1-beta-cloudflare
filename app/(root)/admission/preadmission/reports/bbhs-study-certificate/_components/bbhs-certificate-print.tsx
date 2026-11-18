'use client';

import { forwardRef } from 'react';

interface BbhsCertificatePrintProps {
    data: any;
    mode: '0' | '1'; // 0: Study, 1: Character
}

export const BbhsCertificatePrint = forwardRef<HTMLDivElement, BbhsCertificatePrintProps>(({ data, mode }, ref) => {
    if (!data || !data.studentList || data.studentList.length === 0) return null;

    const student = data.studentList[0];
    const { currentDate, principalsign } = data;

    const getOrdinalSuffix = (day: number) => {
        const j = day % 10,
            k = day % 100;
        if (j === 1 && k !== 11) return 'st';
        if (j === 2 && k !== 12) return 'nd';
        if (j === 3 && k !== 13) return 'rd';
        return 'th';
    };

    const formatDateWithSuffix = (dateStr: any) => {
        if (!dateStr) return { day: '', suffix: '', month: '', year: '' };
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return { day: '', suffix: '', month: '', year: '' };

        const monthNames = [
            'JANUARY',
            'FEBRUARY',
            'MARCH',
            'APRIL',
            'MAY',
            'JUNE',
            'JULY',
            'AUGUST',
            'SEPTEMBER',
            'OCTOBER',
            'NOVEMBER',
            'DECEMBER'
        ];

        const day = date.getDate();
        return {
            day: day,
            suffix: getOrdinalSuffix(day),
            month: monthNames[date.getMonth()],
            year: date.getFullYear()
        };
    };

    const currentFormatted = formatDateWithSuffix(currentDate);
    const dobFormatted = formatDateWithSuffix(student.dob);

    const getClassNameInWords = (className: string) => {
        if (!className) return '';
        const romanToWords: { [key: string]: string } = {
            I: 'FIRST',
            II: 'SECOND',
            III: 'THIRD',
            IV: 'FOURTH',
            V: 'FIFTH',
            VI: 'SIXTH',
            VII: 'SEVENTH',
            VIII: 'EIGHTH',
            IX: 'NINTH',
            X: 'TENTH'
        };
        return romanToWords[className.toString().toUpperCase()] || '';
    };

    const classInWords = getClassNameInWords(student.className);

    const StudyCert = () => (
        <div className='relative min-h-[297mm] w-[210mm] p-[20mm] font-serif text-[#333] leading-relaxed'>
            {/* Header Padding for Letterhead */}
            <div className='h-[40mm]'></div>

            {/* Date */}
            <div className='mb-12 text-right'>
                <span className='font-semibold text-base'>
                    {currentFormatted.day}
                    <sup>{currentFormatted.suffix}</sup> {currentFormatted.month} {currentFormatted.year}
                </span>
            </div>

            {/* Title */}
            <div className='mb-10 text-center'>
                <h2 className='inline-block border-black border-b-2 pb-1 font-bold text-2xl'>STUDY CERTIFICATE</h2>
            </div>

            {/* Content */}
            <div className='mb-12 space-y-6 text-justify text-lg'>
                <p>
                    This is to certify that Master <b className='uppercase'>{student.studentname}</b>, son of {student.parentNameText} is a
                    bonafide student of this institution and is studying in{' '}
                    <b>
                        STD {classInWords} [{student.className}]
                    </b>{' '}
                    for the academic year {student.fromYear} to {student.toYear}. His admission no. is {student.admNo} and date of birth is{' '}
                    {dobFormatted.day}
                    <sup>{dobFormatted.suffix}</sup> {dobFormatted.month} {dobFormatted.year} as per the school records. He resides at the
                    address mentioned below.
                </p>
            </div>

            {/* Address Section */}
            <div className='mt-16 space-y-2'>
                <h4 className='font-bold uppercase underline'>Address:</h4>
                <div className='pl-2 text-lg'>
                    <p>{student.street}</p>
                    <p>{student.area}</p>
                    <p>
                        {student.city}
                        {student.pincode ? ` - ${student.pincode}` : ''}
                    </p>
                </div>
            </div>

            {/* Footer Signature */}
            <div className='mt-24 flex justify-end pr-[20mm]'>
                <div className='flex flex-col items-center'>
                    {principalsign?.ivrmgC_PrincipalSign && (
                        <img src={principalsign.ivrmgC_PrincipalSign} alt='Principal Signature' className='mb-2 h-16 object-contain' />
                    )}
                    <p className='mt-4 font-bold text-xl'>Principal</p>
                </div>
            </div>
        </div>
    );

    const CharacterCert = () => (
        <div className='relative min-h-[297mm] w-[210mm] p-[20mm] font-serif text-[#333] leading-relaxed'>
            {/* Header Padding */}
            <div className='h-[40mm]'></div>

            {/* Title */}
            <div className='mb-10 space-y-2 text-center'>
                <h2 className='font-bold text-2xl uppercase underline'>Character Certificate</h2>
                <p className='font-medium text-lg'>TO WHOMSOEVER IT MAY CONCERN</p>
            </div>

            {/* Date */}
            <div className='mb-8 text-right'>
                <p className='text-lg'>Date : {new Date(currentDate).toLocaleDateString('en-GB')}</p>
            </div>

            {/* Content */}
            <div className='mt-10 space-y-10 text-justify text-xl'>
                <p className='leading-loose'>
                    &nbsp;&nbsp;&nbsp;&nbsp;This is certified that Kumar/Kumari{' '}
                    <span className='font-semibold uppercase'>{student.studentname}</span> child of Sri. {student.fathername} is a bonafide
                    student of class {student.className} for the academic year {student.acadamicyear}. Her admission number is{' '}
                    <b>{student.admNo}.</b>
                </p>
                <p>&nbsp;&nbsp;&nbsp;&nbsp;He/She is good in studies, sports as well as in co-curricular activities.</p>
                <p className='mt-12'>He/She bears a good moral character.</p>
            </div>

            {/* Footer */}
            <div className='mt-24 flex justify-end pr-[20mm]'>
                <div className='flex flex-col items-end'>
                    {principalsign?.ivrmgC_PrincipalSign && (
                        <img src={principalsign.ivrmgC_PrincipalSign} alt='Principal Signature' className='mb-4 h-20 object-contain' />
                    )}
                    <p className='font-bold text-lg'>Signature of Head of the School</p>
                </div>
            </div>
        </div>
    );

    return (
        <div ref={ref} className='print-container bg-white text-black'>
            <style
                dangerouslySetInnerHTML={{
                    __html: `
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
                            margin: 0 !important;
                            padding: 0 !important;
                            overflow: hidden !important;
                            background: white !important;
                        }
                        .page-container {
                            visibility: visible !important;
                            display: block !important;
                            width: 210mm !important;
                            height: 297mm !important;
                            margin: 0 !important;
                            padding: 0 !important;
                            position: relative !important;
                            overflow: hidden !important;
                            background: white !important;
                            page-break-after: always !important;
                        }
                        .print-container * {
                            visibility: visible !important;
                        }
                    }
                    .page-container {
                        width: 210mm;
                        height: 297mm;
                        margin: 0 auto;
                        box-sizing: border-box;
                        background: white;
                        color: black !important;
                    }
                `
                }}
            />
            <div className='page-container'>{mode === '1' ? <CharacterCert /> : <StudyCert />}</div>
        </div>
    );
});

BbhsCertificatePrint.displayName = 'BbhsCertificatePrint';
