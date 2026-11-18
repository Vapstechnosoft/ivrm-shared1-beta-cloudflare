'use client';

import { format } from 'date-fns';
import type React from 'react';

interface ApplicationPrintViewProps {
    data: any;
    printRef?: React.RefObject<HTMLDivElement>;
}

export default function ApplicationPrintView({ data, printRef }: ApplicationPrintViewProps) {
    if (!data) return null;

    const rawDetails =
        data.studentReg_DTObj?.[0] ||
        data.StudentReg_DTObj?.[0] ||
        data.result?.student_details ||
        data.details?.[0] ||
        data.details ||
        {};

    if (Object.keys(rawDetails).length === 0) {
        return (
            <div className='flex h-full items-center justify-center p-10 text-muted-foreground'>
                <p>No application details found for this student.</p>
            </div>
        );
    }

    // Create a case-insensitive proxy for details to handle API response variations
    const details = new Proxy(rawDetails, {
        get(target, prop) {
            if (typeof prop !== 'string') return target[prop as keyof typeof target];
            if (target[prop] !== undefined && target[prop] !== null) return target[prop];
            const lowerProp = prop.toLowerCase();
            const key = Object.keys(target).find((k) => k.toLowerCase() === lowerProp);
            return key ? target[key] : undefined;
        }
    });

    // Helper to format date
    const formatDate = (dateStr: string | null | undefined) => {
        if (!dateStr) return '';
        try {
            return format(new Date(dateStr), 'dd/MM/yyyy');
        } catch {
            return dateStr;
        }
    };

    const academicYear =
        data.academic_year ||
        data.academicdrp?.[0]?.asmaY_Year ||
        details.asmaY_Year ||
        details.ASMAY_Year ||
        '';

    const className =
        data.asmcL_ClassName ||
        data.studentClass?.[0]?.asmcL_ClassName ||
        details.asmcL_ClassName ||
        details.ASMCL_ClassName ||
        'Nursery';

    const formNo =
        details.pasr_id ||
        details.PASR_Id ||
        details.PASR_RegistrationNo ||
        details.pasR_RegistrationNo ||
        data.pasr_id ||
        '';

    const religion =
        data.studentReligion?.[0]?.ivrmmR_Name ||
        data.studentReligion?.[0]?.IVRMMR_Name ||
        details.PASR_Religion ||
        details.religionname ||
        '';

    const caste =
        data.studentcaste?.[0]?.imC_CasteName ||
        data.studentcaste?.[0]?.IMC_CasteName ||
        details.PASR_Caste ||
        details.IMC_CasteName ||
        '';

    const nationality =
        data.studentnationalitys?.[0]?.studentnationality ||
        data.studentnationalitys?.[0]?.STUDENTNATIONALITY ||
        details.PASR_Nationality ||
        details.studentnationality ||
        'Indian';

    const fatherNationality =
        data.fathernationalitys?.[0]?.fathernationality ||
        details.PASR_FatherNationality ||
        details.fathernationality ||
        nationality ||
        'Indian';

    const motherNationality =
        data.mothernationalitys?.[0]?.mothernationality ||
        details.PASR_MotherNationality ||
        details.mothernationality ||
        nationality ||
        'Indian';

    const conState =
        data.studentconstate?.[0]?.pasR_ConStaten ||
        data.studentconstate?.[0]?.PASR_ConStaten ||
        details.PASR_ConStaten ||
        details.PASR_ConState ||
        '';

    const conCountry =
        data.studentconcountry?.[0]?.pasR_ConCountryn ||
        data.studentconcountry?.[0]?.PASR_ConCountryn ||
        details.PASR_ConCountryn ||
        details.PASR_ConCountry ||
        '';

    const photo =
        details.PASR_Student_Pic_Path ||
        details.pasR_Student_Pic_Path ||
        details.studentphoto ||
        data.student_photo ||
        '';

    // Format address into 3 clean lines
    const street = (details.PASR_ConStreet || details.PASR_PerStreet || '').trim();
    const area = (details.PASR_ConArea || details.PASR_PerArea || '').trim();
    const city = (details.PASR_ConCity || details.PASR_PerCity || '').trim();
    const stateStr = (conState || '').trim();
    const countryStr = (conCountry || '').trim();
    const pincode = details.PASR_ConPincode || details.PASR_PerPincode || '';
    const pinStr = pincode && pincode !== '0' && pincode !== 0 ? `PIN: ${pincode}` : '';

    const addressLine1 = [street, area].filter((v) => v && v !== '0').join(', ');
    const addressLine2 = [city, stateStr].filter((v) => v && v !== '0').join(', ');
    const addressLine3 = [countryStr, pinStr].filter((v) => v && v !== '0').join(', ');

    // Siblings
    const rawSiblings =
        data.StudentSbling_DTObj ||
        data.studentSbling_DTObj ||
        data.studentSiblings ||
        data.siblingsprint ||
        data.studentSbling ||
        [];

    const siblingsList = Array.isArray(rawSiblings) ? rawSiblings : rawSiblings?.$values || [];
    const validSiblings = siblingsList.filter((sib: any) => {
        const name = sib.pasrS_SiblingsName || sib.PASRS_SiblingsName;
        return name && !['na', 'nan', 'no', 'null', 'none'].includes(String(name).trim().toLowerCase());
    });

    const fatherName = [details.PASR_FatherName, details.PASR_FatherSurname]
        .filter((v) => v && v !== '0')
        .join(' ')
        .trim();

    const motherName = [details.PASR_MotherName, details.PASR_MotherSurname]
        .filter((v) => v && v !== '0')
        .join(' ')
        .trim();

    return (
        <div className='max-h-[80vh] overflow-y-auto bg-neutral-100 p-2 sm:p-4'>
            <div ref={printRef} className='page-container printable-content text-black'>
                <style
                    dangerouslySetInnerHTML={{
                        __html: `
                        @page {
                            size: A4 portrait;
                            margin: 0 !important;
                        }
                        @media print {
                            *, *::before, *::after {
                                box-sizing: border-box !important;
                            }
                            html, body {
                                margin: 0 !important;
                                padding: 0 !important;
                                background: #fff !important;
                                -webkit-print-color-adjust: exact !important;
                                print-color-adjust: exact !important;
                                width: 100% !important;
                            }
                            .page-container {
                                padding: 0 !important;
                                margin: 0 !important;
                                background: transparent !important;
                            }
                            .page-sheet {
                                box-shadow: none !important;
                                border: none !important;
                                margin: 0 !important;
                                width: 100% !important;
                                max-width: 100% !important;
                                box-sizing: border-box !important;
                            }
                            .page-1 {
                                height: 297mm !important;
                                max-height: 297mm !important;
                                padding: 8mm 14mm 6mm 14mm !important;
                                page-break-after: always !important;
                                break-after: page !important;
                                overflow: hidden !important;
                            }
                            .page-2 {
                                height: 297mm !important;
                                max-height: 297mm !important;
                                padding: 10mm 14mm 8mm 14mm !important;
                                page-break-before: always !important;
                                break-before: page !important;
                                overflow: hidden !important;
                            }
                            .no-print {
                                display: none !important;
                            }
                        }
                        .hhs-heading {
                            font-family: 'Times New Roman', Georgia, Garamond, serif;
                            color: #274279;
                        }
                        .hhs-blue {
                            color: #274279;
                        }
                    `
                    }}
                />

                {/* ===================== PAGE 1 ===================== */}
                <div className='page-sheet page-1 mx-auto max-w-[780px] rounded-sm border bg-white p-6 shadow-md sm:p-7'>
                    {/* Header */}
                    <div className='text-center'>
                        <h2 className='hhs-heading font-bold text-xl tracking-wide italic sm:text-2xl'>
                            Hutchings High School &amp; Junior College
                        </h2>
                        <p className='hhs-blue mt-0.5 font-semibold text-[10.5px] leading-tight'>
                            7, Phayre Road, Pune - 411040. Tel: - 020-26363892.
                        </p>
                        <p className='hhs-blue font-semibold text-[10.5px] leading-tight'>
                            (Affiliated to The Council for the Indian School Certificate Examinations, New Delhi)
                        </p>
                    </div>

                    {/* Sub-header row: Form No, Title/Class/Year, Photo Box */}
                    <div className='mt-1 flex items-start justify-between'>
                        <div className='w-1/3 pt-1'>
                            <h4 className='hhs-blue font-bold text-xs sm:text-sm'>
                                Form No : {formNo}
                            </h4>
                        </div>

                        <div className='w-1/3 text-center'>
                            <h4 className='hhs-blue font-bold text-xs leading-tight sm:text-sm'>
                                ADMISSION FORM <br />
                                <span>{className}</span> <br />
                                <span>[{academicYear}]</span>
                            </h4>
                        </div>

                        <div className='flex w-1/3 justify-end'>
                            <div className='flex h-[110px] w-[95px] items-center justify-center overflow-hidden border border-gray-300 bg-white shadow-sm'>
                                {photo ? (
                                    <img
                                        src={photo}
                                        alt='Student'
                                        className='h-full w-full object-cover'
                                        onError={(e) => {
                                            (e.target as HTMLElement).style.display = 'none';
                                        }}
                                    />
                                ) : (
                                    <div className='text-center text-[9px] text-gray-400'>
                                        Affix Recent
                                        <br />
                                        Passport Size
                                        <br />
                                        Photo
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Form Fields Section */}
                    <div className='mt-1 space-y-[2px] text-[10.5px] leading-tight'>
                        {/* 1. Name of the Child */}
                        <div className='flex items-start'>
                            <span className='whitespace-nowrap font-semibold pt-0.5'>1. Name of the Child</span>
                            <span className='mx-1 pt-0.5'>:</span>
                            <div className='grid flex-1 grid-cols-3 gap-2 sm:gap-3'>
                                <div className='flex flex-col items-center'>
                                    <div className='min-h-[16px] w-full border-b border-black text-center font-medium uppercase'>
                                        {details.PASR_FirstName || ''}
                                    </div>
                                    <span className='text-[9px] text-gray-600'>First Name</span>
                                </div>
                                <div className='flex flex-col items-center'>
                                    <div className='min-h-[16px] w-full border-b border-black text-center font-medium uppercase'>
                                        {details.PASR_MiddleName || ''}
                                    </div>
                                    <span className='text-[9px] text-gray-600'>Middle Name</span>
                                </div>
                                <div className='flex flex-col items-center'>
                                    <div className='min-h-[16px] w-full border-b border-black text-center font-medium uppercase'>
                                        {details.PASR_LastName || details.PASR_Surname || ''}
                                    </div>
                                    <span className='text-[9px] text-gray-600'>Surname</span>
                                </div>
                            </div>
                        </div>

                        {/* 2 & 3: Date of Birth & Place of Birth */}
                        <div className='grid grid-cols-2 gap-3 sm:gap-4'>
                            <div className='flex items-end'>
                                <span className='whitespace-nowrap font-semibold'>2. Date of Birth</span>
                                <span className='mx-1'>:</span>
                                <span className='min-h-[16px] flex-1 border-b border-black px-1 font-medium'>
                                    {formatDate(details.PASR_DOB)}
                                </span>
                            </div>
                            <div className='flex items-end'>
                                <span className='whitespace-nowrap font-semibold'>3. Place of Birth</span>
                                <span className='mx-1'>:</span>
                                <span className='min-h-[16px] flex-1 border-b border-black px-1 font-medium'>
                                    {details.PASR_BirthPlace || ''}
                                </span>
                            </div>
                        </div>

                        {/* 4 & 5: Nationality & Religion */}
                        <div className='grid grid-cols-2 gap-3 sm:gap-4'>
                            <div className='flex items-end'>
                                <span className='whitespace-nowrap font-semibold'>4. Nationality</span>
                                <span className='mx-1'>:</span>
                                <span className='min-h-[16px] flex-1 border-b border-black px-1 font-medium'>
                                    {nationality}
                                </span>
                            </div>
                            <div className='flex items-end'>
                                <span className='whitespace-nowrap font-semibold'>5. Religion</span>
                                <span className='mx-1'>:</span>
                                <span className='min-h-[16px] flex-1 border-b border-black px-1 font-medium'>
                                    {religion}
                                </span>
                            </div>
                        </div>

                        {/* 6 & 7: Caste & Gender */}
                        <div className='grid grid-cols-2 gap-3 sm:gap-4'>
                            <div className='flex items-end'>
                                <span className='whitespace-nowrap font-semibold'>6. Caste</span>
                                <span className='mx-1'>:</span>
                                <span className='min-h-[16px] flex-1 border-b border-black px-1 font-medium'>
                                    {caste}
                                </span>
                            </div>
                            <div className='flex items-end'>
                                <span className='whitespace-nowrap font-semibold'>7. Gender : M/F</span>
                                <span className='mx-1'>:</span>
                                <span className='min-h-[16px] flex-1 border-b border-black px-1 font-medium'>
                                    {details.PASR_Sex || ''}
                                </span>
                            </div>
                        </div>

                        {/* 8. Name of the play group last attended */}
                        <div className='flex items-end'>
                            <span className='whitespace-nowrap font-semibold'>8. Name of the play group last attended</span>
                            <span className='mx-1'>:</span>
                            <span className='min-h-[16px] flex-1 border-b border-black px-1 font-medium'>
                                {details.PASR_LastPlayGrndAttnd || details.pasR_LastPlayGrndAttnd || ''}
                            </span>
                        </div>

                        {/* 9. Participation in extra - curricular activities if any */}
                        <div className='flex items-end'>
                            <span className='whitespace-nowrap font-semibold'>9. Participation in extra - curricular activities if any</span>
                            <span className='mx-1'>:</span>
                            <span className='min-h-[16px] flex-1 border-b border-black px-1 font-medium'>
                                {details.PASR_ExtraActivity || details.pasR_ExtraActivity || ''}
                            </span>
                        </div>

                        {/* 10. Aadhaar Card No. */}
                        <div className='flex items-end'>
                            <span className='whitespace-nowrap font-semibold'>10. Aadhaar Card No.</span>
                            <span className='mx-1'>:</span>
                            <span className='min-h-[16px] flex-1 border-b border-black px-1 font-medium'>
                                {details.PASR_AadharNo || details.pasR_AadharNo || ''}
                            </span>
                        </div>

                        {/* 11. Father's Details */}
                        <div className='pt-0.5'>
                            <h4 className='hhs-blue font-bold text-[11px]'>11. Father&apos;s Details</h4>
                            <div className='space-y-[1px]'>
                                <div className='flex items-end'>
                                    <span className='w-44 whitespace-nowrap'>a. Father&apos;s name in full</span>
                                    <span className='mx-1'>:</span>
                                    <span className='min-h-[16px] flex-1 border-b border-black px-1 font-medium'>
                                        {fatherName}
                                    </span>
                                </div>
                                <div className='flex items-end'>
                                    <span className='w-44 whitespace-nowrap'>b. Father&apos;s Qualification</span>
                                    <span className='mx-1'>:</span>
                                    <span className='min-h-[16px] flex-1 border-b border-black px-1 font-medium'>
                                        {details.PASR_FatherEducation || details.pasR_FatherEducation || ''}
                                    </span>
                                </div>
                                <div className='flex items-end'>
                                    <span className='w-44 whitespace-nowrap'>c. Type of Service / Business</span>
                                    <span className='mx-1'>:</span>
                                    <span className='min-h-[16px] flex-1 border-b border-black px-1 font-medium'>
                                        {details.PASR_FatherOccupation || details.pasR_FatherOccupation || ''}
                                    </span>
                                </div>
                                <div className='flex items-end'>
                                    <span className='w-44 whitespace-nowrap'>c. PAN Number</span>
                                    <span className='mx-1'>:</span>
                                    <span className='min-h-[16px] flex-1 border-b border-black px-1 font-medium uppercase'>
                                        {details.PASR_FatherPanno || details.PASR_FatherPan || details.PASR_FatherPANCardNo || ''}
                                    </span>
                                </div>
                                <div className='flex items-end'>
                                    <span className='w-44 whitespace-nowrap'>d. Designation</span>
                                    <span className='mx-1'>:</span>
                                    <span className='min-h-[16px] flex-1 border-b border-black px-1 font-medium'>
                                        {details.PASR_FatherDesignation || details.pasR_FatherDesignation || ''}
                                    </span>
                                </div>
                                <div className='flex items-end'>
                                    <span className='w-44 whitespace-nowrap'>e. Nationality</span>
                                    <span className='mx-1'>:</span>
                                    <span className='min-h-[16px] flex-1 border-b border-black px-1 font-medium'>
                                        {fatherNationality}
                                    </span>
                                </div>
                                <div className='flex items-end'>
                                    <span className='w-44 whitespace-nowrap'>f. Office address</span>
                                    <span className='mx-1'>:</span>
                                    <span className='min-h-[16px] flex-1 border-b border-black px-1 font-medium'>
                                        {details.PASR_FatherOfficeAddr || details.PASR_FatherOfficeAddress || ''}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* 12. Mother's Details */}
                        <div className='pt-0.5'>
                            <h4 className='hhs-blue font-bold text-[11px]'>12. Mother&apos;s Details</h4>
                            <div className='space-y-[1px]'>
                                <div className='flex items-end'>
                                    <span className='w-44 whitespace-nowrap'>a. Mother&apos;s name in full</span>
                                    <span className='mx-1'>:</span>
                                    <span className='min-h-[16px] flex-1 border-b border-black px-1 font-medium'>
                                        {motherName}
                                    </span>
                                </div>
                                <div className='flex items-end'>
                                    <span className='w-44 whitespace-nowrap'>b. Mother&apos;s Qualification</span>
                                    <span className='mx-1'>:</span>
                                    <span className='min-h-[16px] flex-1 border-b border-black px-1 font-medium'>
                                        {details.PASR_MotherEducation || details.pasR_MotherEducation || ''}
                                    </span>
                                </div>
                                <div className='flex items-end'>
                                    <span className='w-44 whitespace-nowrap'>c. Type of Service / Business</span>
                                    <span className='mx-1'>:</span>
                                    <span className='min-h-[16px] flex-1 border-b border-black px-1 font-medium'>
                                        {details.PASR_MotherOccupation || details.pasR_MotherOccupation || ''}
                                    </span>
                                </div>
                                <div className='flex items-end'>
                                    <span className='w-44 whitespace-nowrap'>c. PAN Number</span>
                                    <span className='mx-1'>:</span>
                                    <span className='min-h-[16px] flex-1 border-b border-black px-1 font-medium uppercase'>
                                        {details.PASR_MotherPanno || details.PASR_MotherPan || details.PASR_MotherPANCardNo || ''}
                                    </span>
                                </div>
                                <div className='flex items-end'>
                                    <span className='w-44 whitespace-nowrap'>d. Designation</span>
                                    <span className='mx-1'>:</span>
                                    <span className='min-h-[16px] flex-1 border-b border-black px-1 font-medium'>
                                        {details.PASR_MotherDesignation || details.pasR_MotherDesignation || ''}
                                    </span>
                                </div>
                                <div className='flex items-end'>
                                    <span className='w-44 whitespace-nowrap'>e. Nationality</span>
                                    <span className='mx-1'>:</span>
                                    <span className='min-h-[16px] flex-1 border-b border-black px-1 font-medium'>
                                        {motherNationality}
                                    </span>
                                </div>
                                <div className='flex items-end'>
                                    <span className='w-44 whitespace-nowrap'>f. Office address</span>
                                    <span className='mx-1'>:</span>
                                    <span className='min-h-[16px] flex-1 border-b border-black px-1 font-medium'>
                                        {details.PASR_MotherOfficeAddr || details.PASR_MotherOfficeAddress || ''}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* 13. Monthly Income */}
                        <div className='flex items-end pt-0.5'>
                            <span className='whitespace-nowrap font-semibold'>13. Monthly Income</span>
                            <span className='mx-1'>:</span>
                            <span className='whitespace-nowrap'>Father&apos;s :</span>
                            <span className='min-h-[16px] flex-1 border-b border-black px-1 font-medium'>
                                {details.PASR_FatherIncome ?? '0'}
                            </span>
                            <span className='ml-3 whitespace-nowrap'>Mother&apos;s :</span>
                            <span className='min-h-[16px] flex-1 border-b border-black px-1 font-medium'>
                                {details.PASR_MotherIncome ?? '0'}
                            </span>
                        </div>

                        {/* 14. Mother Tongue */}
                        <div className='flex items-end'>
                            <span className='whitespace-nowrap font-semibold'>14. Mother Tounge</span>
                            <span className='mx-1'>:</span>
                            <span className='min-h-[16px] flex-1 border-b border-black px-1 font-medium'>
                                {details.PASR_MotherTongue || details.IVRMMT_Name || ''}
                            </span>
                        </div>

                        {/* 15. Language spoken at home */}
                        <div className='flex items-end'>
                            <span className='whitespace-nowrap font-semibold'>15. Language spoken at home</span>
                            <span className='mx-1'>:</span>
                            <span className='min-h-[16px] flex-1 border-b border-black px-1 font-medium'>
                                {details.PASR_Languagespeaking || details.pasR_Languagespeaking || ''}
                            </span>
                        </div>

                        {/* 16. Residential address in full (3 rows) */}
                        <div className='flex items-end'>
                            <span className='whitespace-nowrap font-semibold'>16. Residential address in full</span>
                            <span className='mx-1'>:</span>
                            <span className='min-h-[16px] flex-1 border-b border-black px-1 font-medium'>
                                {addressLine1}
                            </span>
                        </div>
                        <div className='flex items-end'>
                            <span className='w-[155px] whitespace-nowrap font-semibold'></span>
                            <span className='mx-1'>:</span>
                            <span className='min-h-[16px] flex-1 border-b border-black px-1 font-medium'>
                                {addressLine2}
                            </span>
                        </div>
                        <div className='flex items-end'>
                            <span className='w-[155px] whitespace-nowrap font-semibold'></span>
                            <span className='mx-1'>:</span>
                            <span className='min-h-[16px] flex-1 border-b border-black px-1 font-medium'>
                                {addressLine3}
                            </span>
                        </div>

                        {/* 17. Sibling Details */}
                        <div className='pt-0.5'>
                            <p className='font-semibold'>
                                17. Any Brother/Sister <span className='font-bold'>(not cousin)</span> of the candidate in Hutchings High School and Junior College,mention clearly:
                            </p>
                            {validSiblings && validSiblings.length > 0 ? (
                                <div className='mt-0.5'>
                                    <table className='w-full border-collapse border border-black text-[10px]'>
                                        <thead>
                                            <tr className='border-b border-black bg-gray-50'>
                                                <th className='border-r border-black p-0.5 text-center font-bold'>Name</th>
                                                <th className='border-r border-black p-0.5 text-center font-bold'>Class</th>
                                                <th className='p-0.5 text-center font-bold'>Admission Number</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {validSiblings.map((sib: any, idx: number) => (
                                                <tr key={idx} className='border-b border-black'>
                                                    <td className='border-r border-black p-0.5 text-center'>
                                                        {sib.pasrS_SiblingsName || sib.PASRS_SiblingsName || ''}
                                                    </td>
                                                    <td className='border-r border-black p-0.5 text-center'>
                                                        {sib.pasrS_SiblingsClass || sib.PASRS_SiblingsClass || ''}
                                                    </td>
                                                    <td className='p-0.5 text-center'>
                                                        {sib.pasrS_SiblingsAdmissionNo || sib.PASRS_SiblingsAdmissionNo || ''}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className='mt-0.5 min-h-[16px] w-full border-b border-black'></div>
                            )}
                        </div>

                        {/* 18. Undertaking by the Parents / Guardian */}
                        <div className='pt-0.5'>
                            <p className='font-bold'>18. Undertaking by the Parents / Guardian:-</p>
                            <p className='mt-0.5 text-justify text-[9.5px] leading-tight'>
                                I have read all the rules of the School and declare that they are acceptable to me and my ward I shall pay all the School fees quarterly or annually. I am willing to pay all other dues as necessary. I have no objection to my child participating in any extra curricular activities run by the school
                            </p>
                            <div className='mt-0.5 flex items-end'>
                                <span className='whitespace-nowrap font-semibold'>Yes / No</span>
                                <span className='mx-1'>:</span>
                                <span className='min-h-[16px] w-20 border-b border-black px-2 text-center font-medium'>
                                    {details.PASR_UndertakingFlag || details.pasR_UndertakingFlag || 'Yes'}
                                </span>
                            </div>
                        </div>

                        {/* 19. Sibling Admission rule */}
                        <div className='pt-0.5'>
                            <p className='font-semibold'>
                                19. Sibling Admission is subject to availability of seats and cannot be considered as a right.
                            </p>
                        </div>
                    </div>
                </div>

                {/* ===================== PAGE 2 ===================== */}
                <div className='page-sheet page-2 mx-auto mt-6 max-w-[780px] rounded-sm border bg-white p-6 shadow-md sm:p-7'>
                    <div className='space-y-2.5 text-[11px] leading-relaxed'>
                        {/* Note 1 */}
                        <div>
                            <p className='font-bold'>
                                Note:- 1. <span className='font-normal'>Kindly carry a print of this application form duly signed by parent and photocopy of below uploaded documents during the verification process which will be informed in due course of time.</span>
                            </p>
                            <div className='mt-1 space-y-0.5 pl-4 text-[10.5px] leading-tight'>
                                <p>a. Birth Certificate</p>
                                <p>b. Medical Certificate of Candidate(Original Copy)</p>
                                <p>c. Passport size photograph of Candidate</p>
                                <p>d. Address Proof</p>
                                <p>e. Aadhaar Card</p>
                                <p>f. Previous School Leaving Certificate (Class I to X) OR Bonafide Certificate (Class Junior KG &amp; Senior KG) (Original Copy)</p>
                                <p>g. If Religion is selected as &apos;Christian&apos;, then Baptism Certificate is mandatory</p>
                                <p>h. If Religion is selected as &apos;SC&apos; / &apos;ST&apos;, then Certificate claiming it is mandatory</p>
                                <p>i. Previous Class Marks Sheet.</p>
                                <p className='pt-0.5 font-bold'>[All documents uploaded should be self attested by parents in JPEG Format only.]</p>
                            </div>
                        </div>

                        {/* Note 2 & 3 */}
                        <div className='space-y-0.5 text-[11px]'>
                            <p className='font-bold'>
                                Note:- 2. <span className='ml-2 font-bold'>An Incomplete form will be rejected. Form fee is not refundable.</span>
                            </p>
                            <p className='font-bold'>
                                Note:- 3. <span className='ml-2 font-bold'>This is a computer generated admission form for reference for parents.</span>
                            </p>
                        </div>

                        {/* Email Address */}
                        <div className='pt-1'>
                            <div className='flex items-end'>
                                <span className='w-32 whitespace-nowrap font-semibold'>Email Address</span>
                                <span className='mx-1'>:</span>
                                <span className='min-h-[16px] flex-1 border-b border-black px-1 font-medium'>
                                    {details.PASR_EmailId || details.PASR_emailId || details.pasR_emailId || ''}
                                </span>
                            </div>
                        </div>

                        {/* Contact Details */}
                        <div>
                            <div className='flex items-end'>
                                <span className='w-32 whitespace-nowrap font-semibold'>Contact Details</span>
                                <span className='mx-1'>:</span>
                                <span className='whitespace-nowrap'>Father :</span>
                                <span className='min-h-[16px] flex-1 border-b border-black px-1 font-medium'>
                                    {details.PASR_FatherMobleNo || details.PASR_FatherMobileNo || ''}
                                </span>
                                <span className='ml-4 whitespace-nowrap'>Mother :</span>
                                <span className='min-h-[16px] flex-1 border-b border-black px-1 font-medium'>
                                    {details.PASR_MotherMobleNo || details.PASR_MotherMobileNo || ''}
                                </span>
                            </div>
                        </div>

                        {/* Signature of Parent / Guardian */}
                        <div>
                            <div className='flex items-end'>
                                <span className='w-44 whitespace-nowrap font-semibold'>Signature of Parent / Guardian</span>
                                <span className='mx-1'>:</span>
                                <span className='min-h-[16px] flex-1 border-b border-black'></span>
                            </div>
                        </div>

                        {/* Final Note */}
                        <div className='pt-2'>
                            <p className='font-bold text-[11px] leading-normal'>
                                NOTE : <span className='font-bold text-red-600'>*</span> The Printed admission form along with the above-attached self-attested documents is to be submitted in the school office between 8:30am - 10:30am.(Only on Working days) from 14<sup>th</sup> January to 16<sup>th</sup> January 2026.
                            </p>
                        </div>

                        {/* For Office Use Only Box */}
                        <div className='flex flex-col items-center pt-6'>
                            <h4 className='hhs-blue mb-1.5 text-center font-bold text-xs sm:text-sm'>For Office Use Only</h4>
                            <div className='w-full max-w-xl space-y-3.5 border border-black p-3.5'>
                                <div className='flex items-end'>
                                    <span className='w-36 whitespace-nowrap font-semibold text-[10.5px]'>Admitted to Class</span>
                                    <span className='mx-1'>:</span>
                                    <span className='min-h-[16px] flex-1 border-b border-black'></span>
                                </div>
                                <div className='flex items-end'>
                                    <span className='w-36 whitespace-nowrap font-semibold text-[10.5px]'>Date of Admission</span>
                                    <span className='mx-1'>:</span>
                                    <span className='min-h-[16px] flex-1 border-b border-black'></span>
                                </div>
                                <div className='flex items-end'>
                                    <span className='w-36 whitespace-nowrap font-semibold text-[10.5px]'>Registration No.</span>
                                    <span className='mx-1'>:</span>
                                    <span className='min-h-[16px] flex-1 border-b border-black'></span>
                                </div>
                                <div className='flex items-end'>
                                    <span className='w-36 whitespace-nowrap font-semibold text-[10.5px]'>Principal&apos;s Signature</span>
                                    <span className='mx-1'>:</span>
                                    <span className='min-h-[16px] flex-1 border-b border-black'></span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
