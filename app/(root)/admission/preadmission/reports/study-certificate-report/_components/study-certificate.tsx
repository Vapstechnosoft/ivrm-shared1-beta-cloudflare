'use client';

import type { StudyCertificateResponse } from '@/types/admission/preadmission/reports';
import { format } from 'date-fns';
import React from 'react';

type CertificateProps = {
    data: StudyCertificateResponse | null;
    selectedDate: Date | null;
    addressType?: 'address_per' | 'address_con';
    parentType?: '0' | '1' | '2';
    qrCode?: string;
    academicYearData?: any;
};

const getMonthName = (date: Date) => {
    return format(date, 'MMMM').toUpperCase();
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

const getOrdinalSuffix = (i: number) => {
    const j = i % 10,
        k = i % 100;
    if (j === 1 && k !== 11) {
        return 'st';
    }
    if (j === 2 && k !== 12) {
        return 'nd';
    }
    if (j === 3 && k !== 13) {
        return 'rd';
    }
    return 'th';
};

const StudyCertificate = React.forwardRef<HTMLDivElement, CertificateProps>(
    ({ data, selectedDate, addressType = 'address_per', parentType = '0', qrCode, academicYearData }, ref) => {
        if (!data || !data.studentList || data.studentList.length === 0) {
            return (
                <div ref={ref} className='bg-white p-10 text-center text-gray-400'>
                    No student data available for Study Certificate.
                </div>
            );
        }

        const students = data.studentList;
        const principalSign = data.principalSign?.[0]?.ivrmgC_PrincipalSign || data.principalSign?.[0]?.IVRMSIG_Signature || '';
        const mI_Id = data.masterCompany?.[0]?.mI_Id;

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
                            .study-a4-page {
                                page-break-after: always;
                                width: 210mm;
                                min-height: 297mm;
                                margin: 0 auto;
                                position: relative;
                            }
                            .study-a4-page:last-child {
                                page-break-after: auto;
                            }
                        }

                        .study-a4-container {
                            width: 100%;
                            min-height: 297mm;
                            padding: 15mm;
                            margin: 0 auto;
                            position: relative;
                            overflow: hidden;
                            background: white;
                            display: flex;
                            flex-direction: column;
                            font-family: 'Times New Roman', Times, serif;
                        }

                        .study-content-wrapper {
                            position: relative;
                            z-index: 1;
                            height: 100%;
                            display: flex;
                            flex-direction: column;
                        }

                        .text-justify {
                            text-align: justify;
                        }
                    `
                    }}
                />
                <div className='print-component-wrapper flex flex-col items-center gap-8 bg-gray-100 py-8 print:gap-0 print:bg-white print:py-0'>
                    {students.map((student, index) => {
                        const logoBase64 = student.MI_Logo || '';

                        // Address Logic
                        const perAddr =
                            `${student.street || ''} ${student.area || ''} ${student.city || ''} ${student.pincode || ''}`.trim() ||
                            student.addressd1;
                        const conAddr =
                            `${student.constreet || ''} ${student.conarea || ''} ${student.concity || ''}`.trim() || student.addressd13;
                        const fullAddress = addressType === 'address_per' ? perAddr : conAddr;
                        const countryName = addressType === 'address_per' ? student.addressd1 : student.addressd13;

                        const fatherName = student.fathername || '';
                        const motherName = student.mothername || '';
                        let parentDisplay = fatherName;
                        if (parentType === '1') parentDisplay = motherName;
                        if (parentType === '2') parentDisplay = `Mr. ${fatherName} and Mrs. ${motherName}`;

                        const formattedDate = selectedDate ? format(selectedDate, 'dd/MM/yyyy') : format(new Date(), 'dd/MM/yyyy');
                        const formattedDateLong = selectedDate
                            ? format(selectedDate, 'dd MMMM, yyyy')
                            : format(new Date(), 'dd MMMM, yyyy');

                        const dateObj = selectedDate || new Date();
                        const day = dateObj.getDate();
                        const month = format(dateObj, 'MMMM');
                        const year = dateObj.getFullYear();
                        const suffix = getOrdinalSuffix(day);

                        const dobObj = student.dob ? new Date(student.dob) : null;
                        const dobDay = dobObj ? dobObj.getDate() : '';
                        const dobMonth = dobObj ? format(dobObj, 'MMMM') : '';
                        const dobYear = dobObj ? dobObj.getFullYear() : '';
                        const dobSuffix = dobObj ? getOrdinalSuffix(dobObj.getDate()) : '';

                        // Academic Year Logic for Baldwin
                        let fromMonth = '';
                        let fromYear = '';
                        let toMonth = '';
                        let toYear = '';

                        if (academicYearData) {
                            const fromDate = new Date(academicYearData.asmaY_From_Date);
                            const toDate = new Date(academicYearData.asmaY_To_Date);
                            fromMonth = getMonthName(fromDate);
                            fromYear = fromDate.getFullYear().toString();
                            toMonth = getMonthName(toDate);
                            toYear = toDate.getFullYear().toString();
                        }
                        const baldwinAcademicYear = `${fromMonth}-${fromYear} to ${toMonth}-${toYear}`;

                        // Baldwin Co-Education (MI_Id = 5)
                        if (mI_Id === 5) {
                            return (
                                <div key={`${student.AMST_Id || 's'}-${index}`} className='study-a4-page bg-white print:shadow-none'>
                                    <div className='study-a4-container'>
                                        <div className='study-content-wrapper mx-[40px] mt-[160px]'>
                                            <div className='mb-12 text-center'>
                                                <h2 className='font-bold text-[36px] tracking-wider underline'>STUDY CERTIFICATE</h2>
                                            </div>

                                            <table className='w-full text-[20px] leading-[3rem]'>
                                                <tbody>
                                                    <tr>
                                                        <td className='w-[160px] border-none uppercase'>ADMN NO.</td>
                                                        <td className='border-none font-bold uppercase'>: {student.admno}</td>
                                                        <td className='border-none text-right font-bold'>Date : {formattedDate}</td>
                                                    </tr>
                                                </tbody>
                                            </table>

                                            <div className='mt-16 space-y-4 text-[22px] leading-[3.2rem]'>
                                                <p>
                                                    This is to certify that{' '}
                                                    <span className='font-bold uppercase'>{student.studentnam}</span>
                                                </p>
                                                <p>
                                                    son / daughter of{' '}
                                                    <span className='font-bold uppercase'>
                                                        MR. {fatherName} and MRS. {motherName}
                                                    </span>
                                                </p>
                                                <p>
                                                    is bonafide student of this school studying in{' '}
                                                    <span className='font-bold uppercase'>
                                                        {student.class} {student.section}
                                                    </span>
                                                </p>
                                                <p>
                                                    of the school year being <span className='font-bold'>{baldwinAcademicYear}</span>
                                                </p>
                                                <p>
                                                    residing at <span className='font-bold uppercase'>{countryName || fullAddress}</span>
                                                </p>
                                                <p>
                                                    His / Her date of birth, as per our records is (in figures){' '}
                                                    <span className='font-bold underline'>
                                                        {student.dob ? format(new Date(student.dob), 'dd/MM/yyyy') : ''}
                                                    </span>
                                                </p>
                                                <p>
                                                    (in words) <span className='font-bold uppercase underline'>{student.dobwords}</span>
                                                </p>
                                            </div>

                                            <div className='mt-auto mb-16 flex flex-col items-end'>
                                                {principalSign && (
                                                    <img
                                                        src={principalSign}
                                                        className='mb-2 h-auto w-[220px] object-contain mix-blend-multiply'
                                                        alt='Principal Sign'
                                                    />
                                                )}
                                                <p className='border-black border-t-2 pt-2 font-bold text-[20px]'>
                                                    Signature of Head of the School
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        }

                        // Baldwin Girls (MI_Id = 4)
                        if (mI_Id === 4) {
                            return (
                                <div key={`${student.AMST_Id || 's'}-${index}`} className='study-a4-page bg-white print:shadow-none'>
                                    <div className='study-a4-container'>
                                        <div className='study-content-wrapper mx-[20px] mt-[200px]'>
                                            <div className='mb-8 text-center'>
                                                <h2 className='font-bold text-[32px] underline decoration-2'>STUDY CERTIFICATE</h2>
                                            </div>
                                            <div className='mb-20 flex justify-end'>
                                                <h5 className='font-medium text-[20px]'>{formattedDateLong}</h5>
                                            </div>
                                            <div className='space-y-12'>
                                                <h4 className='mb-8 font-bold text-[24px] underline'>TO WHOMSOEVER IT MAY CONCERN</h4>
                                                <div className='text-justify text-[21px] leading-[2.5]'>
                                                    <p>
                                                        This is to certify that{' '}
                                                        <span className='font-bold uppercase underline'>{student.studentnam}</span> son /
                                                        daughter of
                                                        <br />
                                                        Mr. {fatherName} & Mrs. {motherName} <br />
                                                        is a bonafide student of this Institution. She is studying
                                                        <br />
                                                        in Std.{' '}
                                                        <span className='font-bold uppercase underline'>
                                                            {student.class}'{student.section}'
                                                        </span>{' '}
                                                        during the academic year{' '}
                                                        <span className='font-bold underline'>{student.acadamicyear}</span>.
                                                    </p>
                                                    <p className='mt-8'>
                                                        Her date of birth according to our Admission register
                                                        <br />
                                                        is{' '}
                                                        <span className='font-bold underline'>
                                                            {student.dob ? format(new Date(student.dob), 'dd/MM/yyyy') : ''}
                                                        </span>
                                                        . Her address is as follows:
                                                    </p>
                                                    <div className='mt-10 border-gray-100 border-l-4 pl-6 font-bold text-[20px] uppercase tracking-wide'>
                                                        Mr. {fatherName}
                                                        <br />
                                                        {student.street} <br />
                                                        {student.area} <br />
                                                        {student.city} {student.pincode ? `- ${student.pincode}` : ''}.
                                                    </div>
                                                </div>
                                                <div className='mt-auto flex justify-end pt-24 pb-12'>
                                                    <div className='text-right'>
                                                        {principalSign && (
                                                            <img
                                                                src={principalSign}
                                                                className='mb-2 ml-auto h-auto w-[200px] object-contain mix-blend-multiply'
                                                                alt='Principal Sign'
                                                            />
                                                        )}
                                                        <div className='border-black border-t-2 pt-2'>
                                                            <p className='font-bold text-[20px] leading-tight'>
                                                                Mrs. Indira Williams
                                                                <br />
                                                                <span className='font-normal text-[18px]'>Principal</span>
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        }

                        // Baldwin Boys (MI_Id = 6)
                        if (mI_Id === 6) {
                            return (
                                <div key={`${student.AMST_Id || 's'}-${index}`} className='study-a4-page bg-white print:shadow-none'>
                                    <div className='study-a4-container'>
                                        <div className='study-content-wrapper mx-[20px] mt-[180px]'>
                                            <div className='mb-12 flex justify-end'>
                                                <h5 className='border-black border-b font-medium text-[20px]'>
                                                    {day}
                                                    <sup>{suffix}</sup> {month} {year}
                                                </h5>
                                            </div>
                                            <div className='mb-16 text-center'>
                                                <h4 className='font-extrabold text-[32px] uppercase tracking-[0.2em] underline decoration-4 underline-offset-8'>
                                                    STUDY CERTIFICATE
                                                </h4>
                                            </div>
                                            <div className='text-justify font-serif text-[22px] leading-[2.8]'>
                                                <p className='indent-20'>
                                                    This is to certify that Master{' '}
                                                    <span className='font-bold uppercase underline'>{student.studentnam}</span>, son of
                                                    <span className='font-bold'> {parentDisplay}</span> is a bonafide student of this
                                                    institution and is studying in{' '}
                                                    <span className='font-bold uppercase'>
                                                        {student.class} {student.section}
                                                    </span>{' '}
                                                    for the academic year <span className='font-bold underline'>{baldwinAcademicYear}</span>
                                                    . His admission no. is <span className='font-bold underline'>{student.admno}</span> and
                                                    date of birth is{' '}
                                                    <span className='font-bold underline'>
                                                        {dobDay}
                                                        <sup>{dobSuffix}</sup> {dobMonth} {dobYear}
                                                    </span>
                                                    as per the school records. He resides at the address mentioned below.
                                                </p>
                                            </div>
                                            <div className='mt-16'>
                                                <h5 className='mb-4 font-bold font-serif text-[20px] underline'>ADDRESS:</h5>
                                                <div className='ml-10 border-gray-100 border-l-4 pl-6 font-bold text-[20px] uppercase leading-relaxed tracking-wider'>
                                                    <div>{student.street}</div>
                                                    <div>{student.area}</div>
                                                    <div>
                                                        {student.city} {student.pincode ? `- ${student.pincode}` : ''}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className='mt-auto mb-16 flex flex-col items-end'>
                                                {principalSign && (
                                                    <img
                                                        src={principalSign}
                                                        className='mb-2 h-auto w-[200px] object-contain mix-blend-multiply'
                                                        alt='Principal Sign'
                                                    />
                                                )}
                                                <p className='border-black border-t-2 px-8 pt-2 font-bold text-[22px]'>Principal</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        }

                        // Common Layout
                        return (
                            <div key={`${student.AMST_Id || 's'}-${index}`} className='study-a4-page bg-white print:shadow-none'>
                                <div className='study-a4-container'>
                                    <div className='study-content-wrapper h-full p-10 font-serif text-[16px]'>
                                        {/* Header */}
                                        <div className='mb-4 flex items-center justify-between gap-4 border-black border-b-2 pb-4'>
                                            <div className='w-50'>
                                                {logoBase64 && <img src={logoBase64} className='h-auto w-full object-contain' alt='Logo' />}
                                            </div>
                                            <div className='w-28'></div> {/* Empty div to balance logo */}
                                        </div>

                                        {/* Certificate Title */}
                                        <div className='my-10 text-center'>
                                            <h3 className='font-bold text-xl uppercase tracking-wider'>STUDY CERTIFICATE</h3>
                                        </div>

                                        {/* Body Content */}
                                        <div className='mx-auto mt-6 flex w-full max-w-[90%] flex-col gap-8 px-4'>
                                            <div className='flex items-end gap-2'>
                                                <span className='w-[220px] whitespace-nowrap font-bold italic'>
                                                    This is to certify that
                                                </span>
                                                <span className='flex-1 border-black border-b pb-1 text-center font-bold uppercase'>
                                                    {student.studentnam}
                                                </span>
                                            </div>

                                            <div className='flex items-end gap-2'>
                                                <span className='w-[220px] whitespace-nowrap font-bold italic'>Address</span>
                                                <span className='flex-1 border-black border-b pb-1 text-center font-bold uppercase'>
                                                    {fullAddress}
                                                </span>
                                            </div>

                                            <div className='mt-2 flex flex-wrap items-end gap-2'>
                                                <span className='w-[220px] whitespace-nowrap font-bold italic'>Is studying in</span>
                                                <div className='flex w-full flex-1 gap-2'>
                                                    <span className='w-32 border-black border-b pb-1 text-center font-bold uppercase'>
                                                        {student.class}
                                                    </span>
                                                    <span className='whitespace-nowrap font-bold italic'>Standard during the year</span>
                                                    <span className='flex-1 border-black border-b pb-1 text-center font-bold uppercase'>
                                                        {student.acadamicyear}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className='mt-2 flex items-end gap-2'>
                                                <span className='w-[220px] whitespace-nowrap font-bold italic leading-tight'>
                                                    His/her Date of
                                                    <br />
                                                    birth is
                                                </span>
                                                <span className='flex-1 border-black border-b pb-1 text-center font-bold uppercase leading-snug'>
                                                    {student.dob ? format(new Date(student.dob), 'dd MMMM, yyyy') : ''}
                                                </span>
                                            </div>

                                            <div className='flex items-end gap-2'>
                                                <span className='w-[220px] whitespace-nowrap font-bold italic'>In words:</span>
                                                <span className='flex-1 border-black border-b pb-1 text-center font-bold text-[15px] uppercase'>
                                                    {student.dobwords}
                                                </span>
                                            </div>

                                            <div className='flex items-end gap-2'>
                                                <span className='w-[220px] whitespace-nowrap font-bold italic'>Caste :</span>
                                                <span className='flex-1 border-black border-b pb-1 text-center font-bold uppercase'>
                                                    {student.caste_name}
                                                </span>
                                            </div>

                                            <div className='flex items-end gap-2'>
                                                <span className='w-[220px] whitespace-nowrap font-bold italic leading-tight'>
                                                    And his/her Admission
                                                    <br />
                                                    No. is
                                                </span>
                                                <span className='flex-1 border-black border-b pb-1 text-center font-bold uppercase leading-snug'>
                                                    {student.admno}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Declaration */}
                                        <div className='mt-16 px-16 text-center'>
                                            <p className='font-bold text-[17px] italic'>
                                                I do hereby declare that the above particulars are correct as mentioned in the relevant
                                                school records.
                                            </p>
                                        </div>

                                        {/* Footer */}
                                        <div className='mt-auto grid grid-cols-2 items-end gap-8 px-8 pt-16'>
                                            <div className='space-y-4 font-bold text-[16px] italic'>
                                                {/* <div>Place : <span className='font-normal uppercase'>{student.IVRMMCT_Name || 'Udupi'}</span></div> */}
                                                <div>
                                                    Date : <span className='font-normal'>{formattedDateLong}</span>
                                                </div>
                                            </div>
                                            <div className='flex flex-col items-end text-right'>
                                                {principalSign && (
                                                    <img
                                                        src={principalSign}
                                                        className='mb-2 h-16 object-contain mix-blend-multiply'
                                                        alt='Principal Sign'
                                                    />
                                                )}
                                                <div className='w-56 border-black border-t pt-2 text-center'>
                                                    <p className='font-bold italic'>Principal Signature</p>
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
    }
);

StudyCertificate.displayName = 'StudyCertificate';

export default StudyCertificate;
