'use client';

import { format } from 'date-fns';
import type React from 'react';

interface ApplicationPrintViewProps {
    data: any;
    printRef?: React.RefObject<HTMLDivElement>;
}

export default function ApplicationPrintView({ data, printRef }: ApplicationPrintViewProps) {
    if (!data) return null;

    const rawDetails = data.studentReg_DTObj?.[0] || data.result?.student_details || data.details?.[0] || data.details || {};

    if (Object.keys(rawDetails).length === 0) {
        return (
            <div className="flex h-full items-center justify-center p-10 text-muted-foreground">
                <p>No application details found for this student.</p>
            </div>
        );
    }

    // Create a case-insensitive proxy for details to handle API response variations
    const details = new Proxy(rawDetails, {
        get(target, prop) {
            if (typeof prop !== 'string') return target[prop as keyof typeof target];
            if (target[prop] !== undefined) return target[prop];
            const lowerProp = prop.toLowerCase();
            const key = Object.keys(target).find((k) => k.toLowerCase() === lowerProp);
            return key ? target[key] : undefined;
        }
    });

    const academicYear = data.academic_year || data.academicdrp?.[0]?.asmaY_Year || details.asmaY_Year || '';
    const className = data.asmcL_ClassName || data.studentClass?.[0]?.asmcL_ClassName || details.asmcL_ClassName || '';
    const schoolLogo = data.masterCompany?.[0]?.logo || '';
    const religion = data.studentReligion?.[0]?.ivrmmR_Name || data.studentReligion?.[0]?.IVRMMR_Name || details.PASR_Religion || '';
    const caste = data.studentcaste?.[0]?.imC_CasteName || data.studentcaste?.[0]?.IMC_CasteName || details.PASR_Caste || '';
    const nationality = data.studentnationalitys?.[0]?.studentnationality || data.studentnationalitys?.[0]?.STUDENTNATIONALITY || details.PASR_Nationality || '';

    const residentialAddress = [
        details.PASR_ConStreet,
        details.PASR_ConArea,
        details.PASR_ConCity,
        data.studentconstate?.[0]?.pasR_ConStaten || details.PASR_ConState,
        data.studentconcountry?.[0]?.pasR_ConCountryn || details.PASR_ConCountry,
        details.PASR_ConPincode ? `PIN: ${details.PASR_ConPincode}` : ''
    ].filter(val => val && val !== '0' && val !== 0).join(', ');



    // Helper to format date
    const formatDate = (dateStr: string) => {
        if (!dateStr) return '';
        try {
            return format(new Date(dateStr), 'dd/MM/yyyy');
        } catch (e) {
            return dateStr;
        }
    };

    // Extract DOB parts
    const dob = details.PASR_DOB ? new Date(details.PASR_DOB) : null;
    const dobDay = dob ? format(dob, 'dd') : '';
    const dobMonth = dob ? format(dob, 'MM') : '';
    const dobYear = dob ? format(dob, 'yyyy') : '';

    return (
        <div className='max-h-[80vh] overflow-auto'>
            <div ref={printRef} className='printable-content bg-white p-4 text-black'>
                <style
                    dangerouslySetInnerHTML={{
                        __html: `
                .img-style {
                    width: 110px;
                    height: 100px;
                    border: 1px solid #ddd;
                    float: right;
                }
                .office-use-box {
                    width: 400px;
                    margin: auto;
                    border: 1px solid #000;
                    padding: 10px;
                }
                .inlineTable1 {
                    display: inline-block;
                    float: left;
                    width: 30% !important;
                    padding-top: 15px !important;
                }
                .inlineTable2 {
                    display: inline-block;
                    float: left;
                    width: 48% !important;
                    padding-top: 10px !important;
                }
                .inlineTable3 {
                    display: inline-block;
                    float: right;
                    width: 20% !important;
                }
                .border-bottom {
                    border-bottom: 1px solid #000;
                    display: inline-block;
                    min-width: 50px;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                }
                td {
                    padding: 5px;
                }
                .text-center { text-align: center; }
                .text-right { text-align: right; }
                .font-bold { font-weight: bold; }
                .uppercase { text-transform: uppercase; }
                
                @media print {
                    #printSectionId td {
                        padding: 3px 6px !important;
                        font-size: 13px !important;
                    }
                    #printSectionId h3 {
                        font-size: 16px !important;
                        margin-top: 0 !important;
                    }
                    #printSectionId p, #printSectionId span, #printSectionId div {
                        font-size: 13px !important;
                    }
                    #printSectionId .img-style {
                        width: 90px !important;
                        height: 90px !important;
                    }
                    #printSectionId .mt-16 {
                        margin-top: 25px !important;
                    }
                    .office-use-box {
                        margin-top: 15px !important;
                        padding: 5px !important;
                    }
                    .mb-6 { margin-bottom: 12px !important; }
                    .mt-4 { margin-top: 8px !important; }
                }
            `
                    }}
                />

            <div id='printSectionId'>
                {/* Header Section */}
                <div className='mb-6 flex items-start justify-between'>
                    <div className='inlineTable1'>
                        <table className='w-full'>
                            <tbody>
                                <tr>
                                    <td className='w-32'>Registration No.</td>
                                    <td className='border-bottom'>{details.PASR_RegistrationNo}</td>
                                </tr>
                                <tr>
                                    <td>Date:</td>
                                    <td className='border-bottom'>{formatDate(details.PASR_Date)}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div className='inlineTable2 text-center'>
                        {schoolLogo && (
                            <img src={schoolLogo} alt='Institution Logo' style={{ height: '80px', margin: '0 auto', display: 'block' }} />
                        )}
                        <h3 className='mt-2 font-bold text-lg'>PRE-ADMISSION REGISTRATION FORM</h3>
                        <p className='font-bold'>Academic Year {academicYear}</p>
                    </div>

                    <div className='inlineTable3'>
                        <img src={details.PASR_Student_Pic_Path || '/placeholder-user.png'} className='img-style' alt='Student' />
                    </div>
                </div>

                <div className='clear-both'></div>

                {/* Form Content */}
                <div className='mt-4'>
                    <table className='w-full border-black border-t border-r border-b border-l'>
                        <tbody>
                            <tr>
                                <td className='w-1/4 border-black border-r border-b font-bold'>Name of the Candidate</td>
                                <td className='border-black border-b uppercase'>
                                    {details.PASR_FirstName} {details.PASR_MiddleName} {details.PASR_LastName}
                                </td>
                            </tr>
                            <tr>
                                <td className='border-black border-r border-b font-bold'>Date of Birth</td>
                                <td className='border-black border-b'>
                                    <span className='mr-4'>
                                        Day: <span className='border-bottom px-2'>{dobDay}</span>
                                    </span>
                                    <span className='mr-4'>
                                        Month: <span className='border-bottom px-2'>{dobMonth}</span>
                                    </span>
                                    <span>
                                        Year: <span className='border-bottom px-4'>{dobYear}</span>
                                    </span>
                                </td>
                            </tr>
                            <tr>
                                <td className='border-black border-r border-b font-bold'>Place of Birth</td>
                                <td className='border-black border-b'>{details.PASR_BirthPlace}</td>
                            </tr>
                            <tr>
                                <td className='border-black border-r border-b font-bold'>Nationality</td>
                                <td className='border-black border-b'>{nationality}</td>
                            </tr>
                            <tr>
                                <td className='border-black border-r border-b font-bold'>Religion & Caste</td>
                                <td className='border-black border-b'>
                                    {religion} / {caste}
                                </td>
                            </tr>
                            <tr>
                                <td className='border-black border-r border-b font-bold'>Residential Address</td>
                                <td className='border-black border-b'>
                                    {residentialAddress || `${details.PASR_PerStreet || ''} ${details.PASR_PerCity || ''} ${details.PASR_PerState || ''} ${details.PASR_PerPincode || ''}`}
                                </td>
                            </tr>
                            <tr>
                                <td className='border-black border-r border-b font-bold'>Mobile No.</td>
                                <td className='border-black border-b'>{details.PASR_MobileNo}</td>
                            </tr>
                            <tr>
                                <td className='border-black border-r border-b font-bold'>Email ID</td>
                                <td className='border-black border-b'>{details.PASR_EmailId}</td>
                            </tr>
                        </tbody>
                    </table>

                    <h4 className='mt-4 mb-2 font-bold underline'>Parent Details</h4>
                    <table className='w-full border border-black'>
                        <thead>
                            <tr className='border-black border-b'>
                                <th className='border-black border-r p-2'>Particulars</th>
                                <th className='border-black border-r p-2'>Father</th>
                                <th className='p-2'>Mother</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className='border-black border-b'>
                                <td className='border-black border-r font-bold'>Name</td>
                                <td className='border-black border-r'>{details.PASR_FatherName}</td>
                                <td>{details.PASR_MotherName}</td>
                            </tr>
                            <tr className='border-black border-b'>
                                <td className='border-black border-r font-bold'>Qualification</td>
                                <td className='border-black border-r'>{details.PASR_FatherEducation}</td>
                                <td>{details.PASR_MotherEducation}</td>
                            </tr>
                            <tr className='border-black border-b'>
                                <td className='border-black border-r font-bold'>Occupation</td>
                                <td className='border-black border-r'>{details.PASR_FatherOccupation}</td>
                                <td>{details.PASR_MotherOccupation}</td>
                            </tr>
                            <tr className='border-black border-b'>
                                <td className='border-black border-r font-bold'>Designation</td>
                                <td className='border-black border-r'>{details.PASR_FatherDesignation}</td>
                                <td>{details.PASR_MotherDesignation}</td>
                            </tr>
                            <tr>
                                <td className='border-black border-r font-bold'>Mobile No.</td>
                                <td className='border-black border-r'>{details.PASR_FatherMobleNo}</td>
                                <td>{details.PASR_MotherMobleNo}</td>
                            </tr>
                        </tbody>
                    </table>

                    <div className='mt-16 flex justify-between'>
                        <div className='w-40 border-black border-t pt-2 text-center'>Parent Signature</div>
                        <div className='w-40 border-black border-t pt-2 text-center'>Principal Signature</div>
                    </div>
                </div>

                {/* Office Use Box */}
                <div className='office-use-box mt-30'>
                    <p className='text-center font-bold underline'>FOR OFFICE USE ONLY</p>
                    <div className='mt-4 space-y-2 px-4 text-left'>
                        <p>
                            Admitted to Class: <span className='ml-2 w-48 border-bottom text-center'>{className}</span>
                        </p>
                        <p>
                            Date of Admission: <span className='ml-2 w-48 border-bottom text-center'>{formatDate(details.PASR_Date)}</span>
                        </p>
                        <p>
                            Admission No: <span className='ml-4 w-48 border-bottom text-center'>{details.PASR_RegistrationNo}</span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
        </div>
    );
}
