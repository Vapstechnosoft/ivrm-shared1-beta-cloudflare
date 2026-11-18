'use client';

import { format } from 'date-fns';
import React from 'react';

type TcPrintProps = {
    reportData: any;
};

export const TcCustomReportNagarjunaPrint = React.forwardRef<HTMLDivElement, TcPrintProps>(({ reportData }, ref) => {
    // Robust data extraction for both snake_case and camelCase
    const tcObj = reportData?.studentTCList?.[0] ?? {};
    const company = reportData?.masterCompany?.[0] ?? {};
    const academic = reportData?.academicList1?.[0] ?? {};

    // Normalize fields (preferring the ones found in the user's backend JSON)
    const tc = {
        amsT_Id: tcObj.amsT_Id || tcObj.amst_id,
        astC_TCNO: tcObj.astC_TCNO || tcObj.astc_tcno,
        amsT_AdmNo: tcObj.amsT_AdmNo || tcObj.amst_admno,
        amsT_RegistrationNo: tcObj.amsT_RegistrationNo || tcObj.amst_registrationno,
        studentname: tcObj.studentname,
        amsT_FatherName: tcObj.amsT_FatherName || tcObj.amst_fathername,
        amsT_MotherName: tcObj.amsT_MotherName || tcObj.amst_mothername,
        amsT_BirthPlace: tcObj.amsT_BirthPlace || tcObj.amst_birthplace,
        amsT_DOB: tcObj.amsT_DOB || tcObj.amst_dob,
        amsT_DOB_Words: tcObj.amsT_DOB_Words || tcObj.amst_dob_words,
        religion: tcObj.religion,
        caste: tcObj.caste,
        amsT_Date: tcObj.amsT_Date || tcObj.amst_date,
        astC_LastAttendedDate: tcObj.astC_LastAttendedDate || tcObj.astc_lastattendeddate,
        last_Class_Studied: tcObj.last_Class_Studied || tcObj.last_class_studied,
        qualificlass: tcObj.qualificlass,
        astC_Conduct: tcObj.astC_Conduct || tcObj.astc_conduct,
        amsT_Sex: tcObj.amsT_Sex || tcObj.amst_sex,
        nationality: tcObj.nationality,
        mediumOfInstruction: tcObj.mediumOfInstruction || tcObj.mediumofinstruction,
        langustudies: tcObj.langustudies || tcObj.languagename || tcObj.subjectstudied,
        electivestudies: tcObj.electivestudies || tcObj.electivestudied,
        amsT_Taluk: tcObj.amsT_Taluk || tcObj.amst_taluk || '',
        District: tcObj.District || tcObj.district || '',
        states: tcObj.states || tcObj.statename || tcObj.amc_name || '',
        astC_TCIssueDate: tcObj.astC_TCIssueDate || tcObj.astc_tcissuedate || tcObj.tcdatess,
        noof_schooldays: tcObj.noof_schooldays || tcObj.working_days,
        noof_daysattended: tcObj.noof_daysattended || tcObj.attended_days,
        govtno: tcObj.govtno,
        AMST_PENNo: tcObj.AMST_PENNo || tcObj.amst_penno,
        promotionflag: tcObj.promotionflag,
        ASTC_Scholarship: tcObj.ASTC_Scholarship || tcObj.astc_scholarship,
        institutionName: tcObj.institutionName || tcObj.institutionname,
        Logo_Path: tcObj.asC_Logo_Path || tcObj.logo || reportData?.Logo_Path || ''
    };

    const mI_Id = Number.parseInt(company.mI_Id);

    // Visibility Flags (Matches mI_Id logic)
    const VCISadmin = mI_Id === 6;
    const BCESAdmin = mI_Id === 8;
    const BCPCAdmin = mI_Id === 7;
    const BCPSCAdmin = mI_Id === 9;
    const Nagarjuna = !VCISadmin && !BCESAdmin && !BCPCAdmin && !BCPSCAdmin;

    // Derived Data
    const getMonthName = (dateStr: string) => {
        if (!dateStr) return '';
        try {
            return format(new Date(dateStr), 'MMMM').toUpperCase();
        } catch {
            return '';
        }
    };

    const formatDate = (date: any, fmt = 'dd MMMM, yyyy') => {
        if (!date) return '';
        try {
            return format(new Date(date), fmt);
        } catch {
            return date;
        }
    };

    const studentFullName = tc.studentname || '';

    return (
        <div ref={ref} className='BBKVTC m-0 min-h-screen w-full bg-white p-0 text-black'>
            <style>
                {`
                @media print {
                    @page {
                        size: portrait;
                        margin: 10mm;
                    }
                    .BBKVTC {
                        width: 100% !important;
                        height: auto !important;
                        display: block !important;
                        opacity: 1 !important;
                        visibility: visible !important;
                        background: white !important;
                        color: black !important;
                        print-color-adjust: exact;
                        -webkit-print-color-adjust: exact;
                    }
                    .BBKVTC *, .BBKVTC table, .BBKVTC td, .BBKVTC th {
                        visibility: visible !important;
                        opacity: 1 !important;
                    }
                    .col-sm-1 {
                        margin-bottom: 20px !important;
                        display: block !important;
                    }
                    table {
                        border-collapse: collapse !important;
                        width: 100% !important;
                    }
                    td, th {
                        padding: 8px !important;
                        border: 1px solid black !important;
                    }
                }
                .BBKVTC {
                    background-color: white;
                    color: black;
                }
                .BBKVTC table {
                    width: 100%;
                    border-collapse: collapse;
                }
                .BBKVTC .table-bordered td, .BBKVTC .table-bordered th {
                    border: 1px solid black;
                    padding: 8px;
                }
                .dotted-underline {
                    border-bottom: 1px dotted black;
                    display: inline-block;
                    padding: 0 10px;
                }
                `}
            </style>

            {/* VCIS Admin Template (mI_Id === 6) */}
            {VCISadmin && (
                <div className='BBKVTC p-6' id='BBKVTC111'>
                    <table className='table text-center'>
                        <tbody>
                            <tr>
                                <td>
                                    <img src={tc.Logo_Path} className='mx-auto' style={{ width: '95%' }} alt='Logo' />
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <hr style={{ border: '1px solid black' }} />
                    <table className='table' style={{ marginTop: '-5px' }}>
                        <tbody>
                            <tr>
                                <td style={{ textAlign: 'center', width: '33%', border: 'none' }}></td>
                                <td
                                    style={{
                                        textAlign: 'center',
                                        width: '34%',
                                        border: '1px solid black',
                                        marginTop: '10px',
                                        paddingTop: '15px',
                                        borderRadius: '20px'
                                    }}>
                                    <h4 className='font-bold underline'>TRANSFER CERTIFICATE</h4>
                                </td>
                                <td style={{ textAlign: 'center', width: '33%', border: 'none' }}></td>
                            </tr>
                        </tbody>
                    </table>
                    <br />
                    <table className='table' style={{ padding: '15px' }}>
                        <tbody>
                            <tr>
                                <td style={{ textAlign: 'left', width: '3%' }}></td>
                                <td style={{ textAlign: 'left', width: '30%' }}>
                                    <b>
                                        TC Serial No : <span className='dotted-underline'>{tc.astC_TCNO}</span>
                                    </b>
                                </td>
                                <td style={{ textAlign: 'center', width: '30%' }}></td>
                                <td style={{ textAlign: 'right', width: '30%' }}>
                                    <b>
                                        Admission No: <span className='dotted-underline'>{tc.amsT_AdmNo}</span>
                                    </b>
                                </td>
                                <td style={{ textAlign: 'left', width: '3%' }}></td>
                            </tr>
                        </tbody>
                    </table>
                    <br />
                    <table className='table-bordered w-full text-left'>
                        <tbody>
                            <tr style={{ lineHeight: '2' }}>
                                <td width='50%'>SATS Number</td>
                                <td>{tc.amsT_AdmNo}</td>
                            </tr>
                            <tr style={{ lineHeight: '2' }}>
                                <td width='50%'>Name of pupil in full</td>
                                <td>{studentFullName}</td>
                            </tr>
                            <tr style={{ lineHeight: '2' }}>
                                <td width='50%'>Father's Name</td>
                                <td>{tc.amsT_FatherName}</td>
                            </tr>
                            <tr style={{ lineHeight: '2' }}>
                                <td width='50%'>Mother's Name</td>
                                <td>{tc.amsT_MotherName}</td>
                            </tr>
                            <tr style={{ lineHeight: '2' }}>
                                <td width='50%'>Place of birth</td>
                                <td>{tc.amsT_BirthPlace}</td>
                            </tr>
                            <tr style={{ lineHeight: '2' }}>
                                <td width='50%'>
                                    Date of birth <br /> In words and figures
                                </td>
                                <td>
                                    {' '}
                                    {formatDate(tc.amsT_DOB)} <br />
                                    {tc.amsT_DOB_Words}
                                </td>
                            </tr>
                            <tr style={{ lineHeight: '2' }}>
                                <td width='50%'>Religion & Caste (with sub caste)</td>
                                <td>{tc.religion}</td>
                            </tr>
                            <tr style={{ lineHeight: '2' }}>
                                <td width='50%'>Date of Admission</td>
                                <td>{formatDate(tc.amsT_Date)}</td>
                            </tr>
                            <tr style={{ lineHeight: '2' }}>
                                <td width='50%'>Date of Leaving School</td>
                                <td>{formatDate(tc.astC_LastAttendedDate)}</td>
                            </tr>
                            <tr style={{ lineHeight: '2' }}>
                                <td width='50%'>Class on leaving</td>
                                <td>{tc.last_Class_Studied}</td>
                            </tr>
                            <tr style={{ lineHeight: '2' }}>
                                <td width='50%'>Promotion</td>
                                <td>{tc.qualificlass}</td>
                            </tr>
                            <tr style={{ lineHeight: '2' }}>
                                <td width='50%'>Character & Conduct</td>
                                <td>{tc.astC_Conduct}</td>
                            </tr>
                        </tbody>
                    </table>
                    <div className='mt-12 flex justify-between px-4'>
                        <div className='space-y-4 text-left'>
                            <b>
                                Date : <span className='dotted-underline'>{formatDate(new Date(), 'dd/MM/yyyy')}</span>
                            </b>
                            <br />
                            <br />
                            <b>School Rubber Stamp</b>
                        </div>
                        <div className='space-y-4 text-center'>
                            <b>
                                Signature :{' '}
                                <span className='dotted-underline'>
                                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                </span>
                            </b>
                            <br />
                            <b className='mt-4 block'>( Head of the School )</b>
                        </div>
                    </div>
                </div>
            )}

            {/* BCES Admin Template (mI_Id === 8) */}
            {BCESAdmin && (
                <div className='BBKVTC p-6' id='BBKVTC333'>
                    <table className='table-bordered w-full'>
                        <tbody>
                            <tr>
                                <td colSpan={2}>
                                    <div className='flex flex-col items-center'>
                                        <img src={tc.Logo_Path} style={{ width: '95%' }} alt='Logo' />
                                        <p className='mt-4 text-center font-bold text-2xl'>SCHOOL TRANSFER CERTIFICATE</p>
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td width='50%'>
                                    <div className='flex'>
                                        <span className='w-8'>1.</span>
                                        <div>
                                            Admission No : <b>{tc.amsT_AdmNo}</b>
                                        </div>
                                    </div>
                                </td>
                                <td width='50%'>
                                    <div className='flex'>
                                        <span className='w-8'>14.</span>
                                        <div>
                                            Standard in which the student is studying at the time of leaving the School :{' '}
                                            <b>{tc.last_Class_Studied}</b>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td width='50%'>
                                    <div className='flex'>
                                        <span className='w-8'>2.</span>
                                        <div>
                                            Cumulative Record No. / Enrollment No : <b>{tc.amsT_RegistrationNo}</b>
                                        </div>
                                    </div>
                                </td>
                                <td width='50%' rowSpan={2}>
                                    <div className='flex'>
                                        <span className='w-8'>15.</span>
                                        <div>
                                            Student opted Subject's / <br />
                                            a) Languages Studied / {tc.langustudies} <br />
                                            b) Elective Studied / {tc.electivestudies}
                                        </div>
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td width='50%'>
                                    <div className='flex'>
                                        <span className='w-8'>3.</span>
                                        <div>
                                            Date of Admission to School : <b>{formatDate(tc.amsT_Date, 'dd/MM/yyyy')}</b>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td width='50%'>
                                    <div className='flex'>
                                        <span className='w-8'>4.</span>
                                        <div>
                                            Name of the Student full : <b>{studentFullName}</b>
                                        </div>
                                    </div>
                                </td>
                                <td width='50%'>
                                    <div className='flex'>
                                        <span className='w-8'>16.</span>
                                        <div>
                                            Medium of instruction : <b>{tc.mediumOfInstruction || 'English'}</b>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td width='50%'>
                                    <div className='flex'>
                                        <span className='w-8'>5.</span>
                                        <div>
                                            Gender : <b>{tc.amsT_Sex}</b>
                                        </div>
                                    </div>
                                </td>
                                <td width='50%'>
                                    <div className='flex'>
                                        <span className='w-8'>17.</span>
                                        <div>
                                            whether the student has paid all the fees due to school ? <b>Yes</b>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td width='50%'>
                                    <div className='flex'>
                                        <span className='w-8'>6.</span>
                                        <div>
                                            Nationality : <b>{tc.nationality}</b>
                                        </div>
                                    </div>
                                </td>
                                <td width='50%'>
                                    <div className='flex'>
                                        <span className='w-8'>18.</span>
                                        <div>
                                            Fee Concession, if any (nature and period to be specified ) : <b>No</b>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td width='50%'>
                                    <div className='flex'>
                                        <span className='w-8'>7.</span>
                                        <div>
                                            Religion / Caste :{' '}
                                            <b>
                                                {tc.religion} / {tc.caste}
                                            </b>
                                        </div>
                                    </div>
                                </td>
                                <td width='50%'>
                                    <div className='flex'>
                                        <span className='w-8'>19.</span>
                                        <div>
                                            Scholarship if any (nature and period to be specified ) : <b>{tc.ASTC_Scholarship || 'No'}</b>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td width='50%'>
                                    <div className='flex'>
                                        <span className='w-8'>8.</span>
                                        <div>
                                            Name of the father : <b>{tc.amsT_FatherName}</b>
                                        </div>
                                    </div>
                                </td>
                                <td width='50%'>
                                    <div className='flex'>
                                        <span className='w-8'>20.</span>
                                        <div>
                                            Whether Medically Examined or not : <b>No</b>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td width='50%'>
                                    <div className='flex'>
                                        <span className='w-8'>9.</span>
                                        <div>
                                            Name of the Mother : <b>{tc.amsT_MotherName}</b>
                                        </div>
                                    </div>
                                </td>
                                <td width='50%'>
                                    <div className='flex'>
                                        <span className='w-8'>21.</span>
                                        <div>
                                            Month of student last attendance at the school :{' '}
                                            <b>{formatDate(tc.astC_LastAttendedDate, 'MMMM yyyy')}</b>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td width='50%'>
                                    <div className='flex'>
                                        <span className='w-8'>10.</span>
                                        <div>
                                            Whether the Candidate belongs to schedule Caste or schedule Tribe : <b>{tc.caste}</b>
                                        </div>
                                    </div>
                                </td>
                                <td width='50%'>
                                    <div className='flex'>
                                        <span className='w-8'>22.</span>
                                        <div>
                                            Date on which the application for the Transfer Certificate was received :{' '}
                                            <b>{formatDate(tc.astC_TCIssueDate)}</b>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td width='50%'>
                                    <div className='flex'>
                                        <span className='w-8'>11.</span>
                                        <div>
                                            Whether qualified for promotion to a higher Standard :{' '}
                                            <b>{tc.qualificlass === 'Transfer' ? 'Yes' : tc.qualificlass}</b>
                                        </div>
                                    </div>
                                </td>
                                <td width='50%'>
                                    <div className='flex'>
                                        <span className='w-8'>23.</span>
                                        <div>
                                            Number of School Days to the date of leaving in academic year : <b>{tc.noof_schooldays}</b>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td width='50%'>
                                    <div className='flex'>
                                        <span className='w-8'>12.</span>
                                        <div>
                                            Student Date of birth : <b>{formatDate(tc.amsT_DOB, 'dd/MM/yyyy')}</b>
                                        </div>
                                    </div>
                                </td>
                                <td width='50%'>
                                    <div className='flex'>
                                        <span className='w-8'>24.</span>
                                        <div>
                                            Number of School Days to the date of leaving in academic year : <b>{tc.noof_daysattended}</b>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td width='50%'>
                                    <div className='flex'>
                                        <span className='w-8'>13.</span>
                                        <div>
                                            Place : {tc.amsT_BirthPlace} <br /> Taluka : {tc.amsT_Taluk} <br /> District : {tc.District}
                                        </div>
                                    </div>
                                </td>
                                <td width='50%'>
                                    <div className='flex'>
                                        <span className='w-8'>25.</span>
                                        <div>
                                            Character and Conduct : <b>{tc.astC_Conduct}</b>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <div className='mt-12 flex justify-between px-4'>
                        <div>Date of Entry: </div>
                        <div>
                            Date of Issue: <u> {formatDate(tc.astC_TCIssueDate)} </u>
                        </div>
                    </div>
                </div>
            )}

            {/* BCPC Admin Template (mI_Id === 7) / BCPSC Admin (mI_Id === 9) */}
            {(BCPCAdmin || BCPSCAdmin) && (
                <div className='BBKVTC p-6' id='BBKVTC222'>
                    <table className='table-bordered w-full text-sm'>
                        <tbody>
                            <tr>
                                <td colSpan={2}>
                                    <div className='flex flex-col items-center'>
                                        <img src={tc.Logo_Path} style={{ width: '95%' }} alt='Logo' />
                                        <p className='mt-4 text-center font-bold text-xl'>TRANSFER CERTIFICATE</p>
                                        <p className='font-bold'>TC NO - {tc.astC_TCNO}</p>
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td width='50%'>
                                    <div className='flex'>
                                        <span className='w-8'>1.</span> Name of the College :
                                    </div>
                                </td>
                                <td width='50%'>
                                    <b>{tc.institutionName}</b>
                                </td>
                            </tr>
                            <tr>
                                <td width='50%'>
                                    <div className='flex'>
                                        <span className='w-8'>2.</span> Admission No :
                                    </div>
                                </td>
                                <td width='50%'>
                                    <b>{tc.amsT_AdmNo}</b>
                                </td>
                            </tr>
                            <tr>
                                <td width='50%'>
                                    <div className='flex'>
                                        <span className='w-8'>3.</span> Name of the Student in full :
                                    </div>
                                </td>
                                <td width='50%'>
                                    <b>{studentFullName}</b>
                                </td>
                            </tr>
                            <tr>
                                <td width='50%'>
                                    <div className='flex'>
                                        <span className='w-8'>4.</span> Place of birth : {tc.amsT_BirthPlace}
                                    </div>
                                    <div className='mt-2 ml-8 flex'>
                                        <span className='w-8'>5.</span> Taluku : {tc.amsT_Taluk}
                                    </div>
                                </td>
                                <td width='50%'>
                                    <div className='flex'>
                                        <span className='w-8'>6.</span> District : {tc.District}
                                    </div>
                                    <div className='mt-2 ml-8 flex'>
                                        <span className='w-8'>7.</span> State : {tc.states}
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td width='50%'>
                                    <div className='flex'>
                                        <span className='w-8'>8.</span> Gender : {tc.amsT_Sex}
                                    </div>
                                    <div className='mt-2 ml-8 flex'>
                                        <span className='w-8'>10.</span> Caste : {tc.caste}
                                    </div>
                                </td>
                                <td width='50%'>
                                    <div className='flex'>
                                        <span className='w-8'>11.</span> Religion : {tc.religion}
                                    </div>
                                    <div className='mt-2 ml-8 flex'>
                                        <span className='w-8'>12.</span> Sub Caste :{' '}
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td width='50%'>
                                    <div className='flex'>
                                        <span className='w-8'>13.</span> Name of the Father :
                                    </div>
                                </td>
                                <td width='50%'>
                                    <b>{tc.amsT_FatherName}</b>
                                </td>
                            </tr>
                            <tr>
                                <td width='50%'>
                                    <div className='flex'>
                                        <span className='w-8'>14.</span> Name of the Mother :
                                    </div>
                                </td>
                                <td width='50%'>
                                    <b>{tc.amsT_MotherName}</b>
                                </td>
                            </tr>
                            <tr>
                                <td width='50%'>
                                    <div className='flex'>
                                        <span className='w-8'>15.</span> Whether the student belongs to SC/ST :
                                    </div>
                                </td>
                                <td width='50%'>
                                    <b>NO</b>
                                </td>
                            </tr>
                            <tr>
                                <td width='50%'>
                                    <div className='flex'>
                                        <span className='w-8'>16.</span> Whether qualified for promotion :
                                    </div>
                                </td>
                                <td width='50%'>
                                    <b>Yes</b>
                                </td>
                            </tr>
                            <tr>
                                <td width='50%'>
                                    <div className='flex'>
                                        <span className='w-8'>17.</span> Date of birth :
                                    </div>
                                </td>
                                <td width='50%'>
                                    <b>{formatDate(tc.amsT_DOB, 'dd/MM/yyyy')}</b>
                                    <br />
                                    {tc.amsT_DOB_Words}
                                </td>
                            </tr>
                            <tr>
                                <td width='50%'>
                                    <div className='flex'>
                                        <span className='w-8'>18.</span> Standard on leaving college :
                                    </div>
                                </td>
                                <td width='50%'>
                                    <b>{tc.last_Class_Studied}</b>
                                </td>
                            </tr>
                            <tr>
                                <td width='50%'>
                                    <div className='flex'>
                                        <span className='w-8'>19.</span> Details of subjects studied in I/II PUC
                                    </div>
                                    <div className='ml-8 italic'>Part I: {tc.langustudies}</div>
                                    <div className='ml-8 italic'>Part II: {tc.states}</div>
                                </td>
                                <td width='50%'>
                                    <div className='flex'>
                                        <span className='w-8'>25.</span> Last attendance date :{' '}
                                        <b>{formatDate(tc.astC_LastAttendedDate, 'dd/MM/yyyy')}</b>
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td width='50%'>
                                    <div className='flex'>
                                        <span className='w-8'>20.</span> Medium of instruction :
                                    </div>
                                </td>
                                <td width='50%'>
                                    <b>{tc.mediumOfInstruction || 'English'}</b>
                                </td>
                            </tr>
                            <tr>
                                <td width='50%'>
                                    <div className='flex'>
                                        <span className='w-8'>26.</span> No of College Days :
                                    </div>
                                </td>
                                <td width='50%'>
                                    <b>{tc.noof_schooldays}</b>
                                </td>
                            </tr>
                            <tr>
                                <td width='50%'>
                                    <div className='flex'>
                                        <span className='w-8'>21.</span> Date of admission/promotion :
                                    </div>
                                </td>
                                <td width='50%'>
                                    <b>{formatDate(tc.amsT_Date, 'dd/MM/yyyy')}</b>
                                </td>
                            </tr>
                            <tr>
                                <td width='50%'>
                                    <div className='flex'>
                                        <span className='w-8'>27.</span> Total days student attended :
                                    </div>
                                </td>
                                <td width='50%'>
                                    <b>{tc.noof_daysattended}</b>
                                </td>
                            </tr>
                            <tr>
                                <td width='50%'>
                                    <div className='flex'>
                                        <span className='w-8'>22.</span> All fees paid :
                                    </div>
                                </td>
                                <td width='50%'>
                                    <b>Yes</b>
                                </td>
                            </tr>
                            <tr>
                                <td width='50%'>
                                    <div className='flex'>
                                        <span className='w-8'>28.</span> Date of application for TC :
                                    </div>
                                </td>
                                <td width='50%'>
                                    <b>{formatDate(tc.astC_TCIssueDate, 'dd/MM/yyyy')}</b>
                                </td>
                            </tr>
                            <tr>
                                <td width='50%'>
                                    <div className='flex'>
                                        <span className='w-8'>23.</span> Fee concessions if any :
                                    </div>
                                </td>
                                <td width='50%'>
                                    <b>NO</b>
                                </td>
                            </tr>
                            <tr>
                                <td width='50%'>
                                    <div className='flex'>
                                        <span className='w-8'>29.</span> Date of issue of TC :
                                    </div>
                                </td>
                                <td width='50%'>
                                    <b>{formatDate(tc.astC_TCIssueDate, 'dd/MM/yyyy')}</b>
                                </td>
                            </tr>
                            <tr>
                                <td width='50%'>
                                    <div className='flex'>
                                        <span className='w-8'>24.</span> Scholarship if any :
                                    </div>
                                </td>
                                <td width='50%'>
                                    <b>{tc.ASTC_Scholarship || 'NO'}</b>
                                </td>
                            </tr>
                            <tr>
                                <td width='50%'>
                                    <div className='flex'>
                                        <span className='w-8'>30.</span> Character and Conduct :
                                    </div>
                                </td>
                                <td width='50%'>
                                    <b>{tc.astC_Conduct}</b>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <div className='mt-8 flex justify-between px-4'>
                        <div>
                            <p>SATS NO : {tc.govtno}</p>
                            <p>STUDENT NO : </p>
                        </div>
                        <div className='mt-10 text-right'>
                            <p className='font-bold underline'>Signature of Principal</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Nagarjuna Template (Default) */}
            {Nagarjuna && (
                <div className='BBKVTC p-6' id='BBKVTC222222'>
                    <table className='table-bordered w-full text-base'>
                        <tbody>
                            <tr>
                                <td colSpan={2}>
                                    <div className='flex items-center justify-center p-4'>
                                        <img src={tc.Logo_Path} className='mx-auto' style={{ maxHeight: '150px' }} alt='Header' />
                                    </div>
                                    <p className='p-2 font-bold'>TC NO - {tc.astC_TCNO}</p>
                                </td>
                            </tr>
                            <tr>
                                <td width='50%'>
                                    <div className='flex'>
                                        <span className='w-8'>1.</span>{' '}
                                        <div>
                                            Name of the College :<br />
                                            ಕಾಲೇಜಿನ ಹೆಸರು :
                                        </div>
                                    </div>
                                </td>
                                <td width='50%'>
                                    <b>{tc.institutionName}</b>
                                </td>
                            </tr>
                            <tr>
                                <td width='50%'>
                                    <div className='flex'>
                                        <span className='w-8'>2.</span>{' '}
                                        <div>
                                            Admission No :<br />
                                            ಪ್ರವೇಶ ಸಂಖ್ಯೆ :
                                        </div>
                                    </div>
                                </td>
                                <td width='50%'>
                                    <b>{tc.amsT_AdmNo}</b>
                                </td>
                            </tr>
                            <tr>
                                <td width='50%'>
                                    <div className='flex'>
                                        <span className='w-8'>3.</span>{' '}
                                        <div>
                                            Name of the Student in full :<br />
                                            ವಿದ್ಯಾರ್ಥಿಯ ಪೂರ್ಣ ಹೆಸರು :
                                        </div>
                                    </div>
                                </td>
                                <td width='50%'>
                                    <b>{studentFullName}</b>
                                </td>
                            </tr>
                            <tr>
                                <td width='50%'>
                                    <div className='flex'>
                                        <span className='w-8'>4.</span> <div>SATS NO :</div>
                                    </div>
                                    <div className='mt-4 flex'>
                                        <span className='w-8'></span> <div>STUDENT PEN [UDISE+] :</div>
                                    </div>
                                </td>
                                <td width='50%'>
                                    <b>{tc.govtno}</b>
                                    <br />
                                    <b>{tc.AMST_PENNo}</b>
                                </td>
                            </tr>
                            <tr>
                                <td width='50%'>
                                    <div className='flex'>
                                        <span className='w-8'>5.</span>{' '}
                                        <div>
                                            Place of birth ಹುಟ್ಟಿದ ಸ್ಥಳ : <b>{tc.amsT_BirthPlace}</b>
                                        </div>
                                    </div>
                                    <div className='mt-4 flex'>
                                        <span className='w-8'>6.</span>{' '}
                                        <div>
                                            Taluk ತಾಲ್ಲೂಕು : <b>{tc.amsT_Taluk}</b>
                                        </div>
                                    </div>
                                </td>
                                <td width='50%'>
                                    <div className='flex'>
                                        <span className='w-8'>7.</span>{' '}
                                        <div>
                                            District ಜಿಲ್ಲೆ : <b>{tc.District}</b>
                                        </div>
                                    </div>
                                    <div className='mt-4 flex'>
                                        <span className='w-8'>8.</span>{' '}
                                        <div>
                                            State ರಾಜ್ಯ : <b>{tc.states}</b>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td width='50%'>
                                    <div className='flex'>
                                        <span className='w-8'>9.</span>{' '}
                                        <div>
                                            Gender ಲಿಂಗ : <b>{tc.amsT_Sex}</b>
                                        </div>
                                    </div>
                                    <div className='mt-2 flex'>
                                        <span className='w-8'>10.</span>{' '}
                                        <div>
                                            Nationality ರಾಷ್ಟ್ರೀಯತೆ : <b>{tc.nationality}</b>
                                        </div>
                                    </div>
                                    <div className='mt-2 flex'>
                                        <span className='w-8'>11.</span>{' '}
                                        <div>
                                            Caste ಜಾತಿ : <b>{tc.caste}</b>
                                        </div>
                                    </div>
                                </td>
                                <td width='50%'>
                                    <div className='flex'>
                                        <span className='w-8'>12.</span>{' '}
                                        <div>
                                            Religion ಧರ್ಮ : <b>{tc.religion}</b>
                                        </div>
                                    </div>
                                    <div className='mt-4 flex'>
                                        <span className='w-8'>13.</span> <div>Sub Caste ಉಪ ಜಾತಿ : </div>
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td width='50%'>
                                    <div className='flex'>
                                        <span className='w-8'>14.</span> <div>Name of the Father ತಂದೆಯ ಹೆಸರು :</div>
                                    </div>
                                </td>
                                <td width='50%'>
                                    <b>{tc.amsT_FatherName}</b>
                                </td>
                            </tr>
                            <tr>
                                <td width='50%'>
                                    <div className='flex'>
                                        <span className='w-8'>15.</span> <div>Name of the Mother ತಾಯಿಯ ಹೆಸರು :</div>
                                    </div>
                                </td>
                                <td width='50%'>
                                    <b>{tc.amsT_MotherName}</b>
                                </td>
                            </tr>
                            <tr>
                                <td width='50%'>
                                    <div className='flex'>
                                        <span className='w-8'>16.</span>{' '}
                                        <div>
                                            Whether the Student belongs to SC/ST ?<br />
                                            ವಿದ್ಯಾರ್ಥಿಯು ಪರಿಶಿಷ್ಟ ಜಾತಿ/ಪರಿಶಿಷ್ಟ ವರ್ಗಕ್ಕೆ ಸೇರಿದವನೇ?
                                            <br />
                                            <b>{tc.caste?.includes('SC') || tc.caste?.includes('ST') ? 'Yes' : 'No'}</b>
                                        </div>
                                    </div>
                                </td>
                                <td width='50%' style={{ verticalAlign: 'baseline' }}>
                                    <div className='flex'>
                                        <span className='w-8'>17.</span>{' '}
                                        <div>
                                            Whether qualified for promotion to next standard ?<br />
                                            ಮುಂದಿನ ತರಗತಿಗೆ ಉತ್ತೀರ್ಣಗೊಳಿಸಲು ಅರ್ಹನೇ?
                                            <br />
                                            <b>{tc.promotionflag || 'No'}</b>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td width='50%'>
                                    <div className='flex'>
                                        <span className='w-8'>18.</span>{' '}
                                        <div>
                                            Date of Birth (in figures and words) :<br />
                                            ಹುಟ್ಟಿದ ದಿನಾಂಕ (ಅಂಕಿಗಳಲ್ಲಿ ಮತ್ತು ಅಕ್ಷರಗಳಲ್ಲಿ) :
                                        </div>
                                    </div>
                                </td>
                                <td width='50%'>
                                    <b>{formatDate(tc.amsT_DOB, 'dd/MM/yyyy')}</b>
                                    <br />
                                    <b>{tc.amsT_DOB_Words}</b>
                                </td>
                            </tr>
                            <tr>
                                <td width='50%'>
                                    <div className='flex'>
                                        <span className='w-8'>19.</span>{' '}
                                        <div>
                                            Standard on leaving college (in words) :<br />
                                            ಕಾಲೇಜು ಬಿಡುವಾಗ ಓದುತ್ತಿದ್ದ ತರಗತಿ (ಅಕ್ಷರಗಳಲ್ಲಿ)
                                        </div>
                                    </div>
                                </td>
                                <td width='50%'>
                                    <b>{tc.last_Class_Studied}</b>
                                </td>
                            </tr>
                            <tr>
                                <td width='50%'>
                                    <div className='flex'>
                                        <span className='w-8'>20.</span>
                                        <div>
                                            Details of subjects studied in I/II PUC
                                            <br />
                                            ಪ್ರಥಮ/ದ್ವಿತೀಯ ಪಿಯುಸಿಯಲ್ಲಿ ವ್ಯಾಸಂಗ ಮಾಡಿದ ವಿಷಯಗಳು :<br />
                                            Part I ಭಾಷೆಗಳು : <b>{tc.langustudies}</b>
                                            <br />
                                            Part II ಐಚ್ಛಿಕ ವಿಷಯಗಳು : <b>{tc.langustudies}</b>
                                        </div>
                                    </div>
                                </td>
                                <td width='50%' style={{ verticalAlign: 'baseline' }}>
                                    <div className='flex'>
                                        <span className='w-8'>26.</span>{' '}
                                        <div>
                                            Last attendance date : <br />
                                            <b>{formatDate(tc.astC_LastAttendedDate, 'dd/MM/yyyy')}</b>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td width='50%'>
                                    <div className='flex'>
                                        <span className='w-8'>21.</span>{' '}
                                        <div>
                                            Medium of Instruction ಬೋಧನಾ ಮಾಧ್ಯಮ : <b>{tc.mediumOfInstruction || 'English'}</b>
                                        </div>
                                    </div>
                                </td>
                                <td width='50%'>
                                    <div className='flex'>
                                        <span className='w-8'>27.</span>{' '}
                                        <div>
                                            No of College Days : <br />
                                            <b>{tc.noof_schooldays}</b>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td width='70%'>
                                    <div className='flex'>
                                        <span className='w-8'>22.</span>{' '}
                                        <div>
                                            Date of admission to college : <br />
                                            <b>{formatDate(tc.amsT_Date, 'dd/MM/yyyy')}</b>
                                        </div>
                                    </div>
                                </td>
                                <td width='50%'>
                                    <div className='flex'>
                                        <span className='w-8'>28.</span>{' '}
                                        <div>
                                            Total number of days attended : <br />
                                            <b>{tc.noof_daysattended}</b>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td width='50%'>
                                    <div className='flex'>
                                        <span className='w-8'>23.</span>{' '}
                                        <div>
                                            All Balance of fees paid or not : <b>Yes</b>
                                        </div>
                                    </div>
                                </td>
                                <td width='50%'>
                                    <div className='flex'>
                                        <span className='w-8'>29.</span>{' '}
                                        <div>
                                            Date of TC Application : <br />
                                            <b>{formatDate(tc.astC_TCIssueDate, 'dd/MM/yyyy')}</b>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td width='50%'>
                                    <div className='flex'>
                                        <span className='w-8'>24.</span>{' '}
                                        <div>
                                            Fee concessions if any : <b>NO</b>
                                        </div>
                                    </div>
                                </td>
                                <td width='50%'>
                                    <div className='flex'>
                                        <span className='w-8'>30.</span>{' '}
                                        <div>
                                            Date of issue of TC : <br />
                                            <b>{formatDate(tc.astC_TCIssueDate, 'dd/MM/yyyy')}</b>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td width='50%'>
                                    <div className='flex'>
                                        <span className='w-8'>25.</span>{' '}
                                        <div>
                                            Scholarship if any : <b>{tc.ASTC_Scholarship || 'NO'}</b>
                                        </div>
                                    </div>
                                </td>
                                <td width='50%'>
                                    <div className='flex'>
                                        <span className='w-8'>31.</span>{' '}
                                        <div>
                                            Character and Conduct : <b>{tc.astC_Conduct}</b>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <div className='mt-8 flex flex-col items-end px-4 font-bold'>
                        <p>Signature of the Principal / ಪ್ರಾಂಶುಪಾಲರ ಸಹಿ</p>
                        <p>With Seal / ಮೊಹರು</p>
                    </div>
                </div>
            )}
        </div>
    );
});

TcCustomReportNagarjunaPrint.displayName = 'TcCustomReportNagarjunaPrint';
