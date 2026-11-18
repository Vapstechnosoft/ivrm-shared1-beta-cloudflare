'use client';

import { format } from 'date-fns';
import React from 'react';

interface TcReportPrintProps {
    data: any;
}

const TcReportPrint = React.forwardRef<HTMLDivElement, TcReportPrintProps>(({ data }, ref) => {
    // Robust data checks
    if (!data) return <div ref={ref}>No data available</div>;

    const studentTCList = (data.studentTCList && data.studentTCList[0]) || (data.data?.studentTCList && data.data.studentTCList[0]) || {};
    const studentDetails =
        (data.getadm_m_student_details && data.getadm_m_student_details[0]) ||
        (data.data?.getadm_m_student_details && data.data.getadm_m_student_details[0]) ||
        {};
    const tcDetails =
        (data.studenttcdetails && data.studenttcdetails[0]) || (data.data?.studenttcdetails && data.data.studenttcdetails[0]) || {};
    const classJoin = (data.classnamejoin && data.classnamejoin[0]) || (data.data?.classnamejoin && data.data.classnamejoin[0]) || {};
    const subjects = data.getsubjectsdetails || data.data?.getsubjectsdetails || [];
    const lastPaid =
        (data.getlastpaidfeedetails && data.getlastpaidfeedetails[0]) ||
        (data.data?.getlastpaidfeedetails && data.data.getlastpaidfeedetails[0]) ||
        {};

    const subjectsName = subjects
        .map((s: any) => s.isms_subjectname || s.ISMS_SUBJECTNAME)
        .filter(Boolean)
        .join(', ');

    const formatDate = (date: any) => {
        if (!date) return '';
        try {
            return format(new Date(date), 'dd/MM/yyyy');
        } catch (e) {
            return '';
        }
    };

    const getRomanToWord = (roman: string) => {
        switch (roman?.toUpperCase()) {
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
            case 'XI':
                return 'ELEVENTH';
            default:
                return roman || '';
        }
    };

    const categoryCode = studentTCList.fee_concesion || studentTCList.feeconcession;
    const isCategory = ['OBC', 'SC', 'ST'].some((c) => categoryCode?.toUpperCase()?.includes(c)) ? 'Yes' : 'No';

    return (
        <div ref={ref} id='BBKVTC' className='NDSTC-Report mx-auto box-border min-h-[297mm] w-[210mm] bg-white p-[40px] text-black'>
            <style
                dangerouslySetInnerHTML={{
                    __html: `
                .NDSTC-Report { 
                    font-family: 'Times New Roman', serif; 
                    line-height: 1.7; 
                    color: #000; 
                    background-color: white;
                }
                .NDSTC-Report table { width: 100%; border-collapse: collapse; margin-bottom: 5px; }
                .NDSTC-Report td { padding: 2px 5px; vertical-align: top; }
                .NDSTC-Report .field-row { display: flex; align-items: baseline; margin-bottom: 8px; width: 100%; }
                .NDSTC-Report .field-label { white-space: nowrap; margin-right: 8px; font-size: 14px; }
                .NDSTC-Report .field-value { flex: 1; border-bottom: 1px dotted #000; font-weight: bold; text-transform: uppercase; padding-left: 10px; min-height: 20px; font-size: 14px; }
                .NDSTC-Report .border-bottom { border-bottom: 1px dotted #000; min-width: 80px; display: inline-block; padding: 0 5px; }
                .NDSTC-Report .text-center { text-align: center; }
                .NDSTC-Report .text-right { text-align: right; }
                .NDSTC-Report .text-left { text-align: left; }
                .NDSTC-Report h3 { margin: 10px 0; font-weight: bold; }
                .NDSTC-Report b { font-weight: bold; }
                .NDSTC-Report .img-responsive { max-width: 100%; height: auto; }
                @media print {
                    @page { size: A4 portrait; margin: 0; }
                    .NDSTC-Report { 
                        display: block !important; 
                        visibility: visible !important; 
                        padding: 40px !important; 
                        margin: 0 !important; 
                        width: 210mm !important; 
                        height: 297mm !important;
                        background: white !important;
                        -webkit-print-color-adjust: exact !important;
                    }
                    .NDSTC-Report * {
                        visibility: visible !important;
                        -webkit-print-color-adjust: exact !important;
                    }
                }
            `
                }}
            />

            <table className='table text-center' style={{ marginTop: '-5px' }}>
                <tbody>
                    <tr>
                        <td>
                            <img
                                src={studentTCList.logo || '/images/NDSTC.jpg'}
                                style={{ width: '100%', marginTop: '-1%' }}
                                className='img-responsive'
                                alt='School Header'
                            />
                        </td>
                    </tr>
                </tbody>
            </table>

            <table className='table' style={{ marginTop: '-10px' }}>
                <tbody>
                    <tr>
                        <td className='text-center'>
                            <h3 style={{ textDecoration: 'underline' }}>TRANSFER/SCHOOL LEAVING CERTIFICATE</h3>
                        </td>
                    </tr>
                </tbody>
            </table>

            <div className='row flex justify-between' style={{ marginTop: '-16px' }}>
                <div className='w-1/3'>
                    <table>
                        <tbody>
                            <tr>
                                <td width='40'>No:</td>
                                <td className='border-bottom'>{studentTCList.astc_tcno || tcDetails.astC_TCNO}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div className='w-1/3'></div>
                <div className='w-1/3 text-right'>
                    <table>
                        <tbody>
                            <tr>
                                <td width='120'>Admission No.:</td>
                                <td className='border-bottom'>{studentTCList.amst_registrationno || studentTCList.amsT_RegistrationNo}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <div className='row flex justify-between'>
                <div className='w-1/3'>
                    <table>
                        <tbody>
                            <tr>
                                <td width='100'>UDISE NO :</td>
                                <td className='border-bottom'>27361710002</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div className='w-1/3'></div>
                <div className='w-1/3 text-right'>
                    <table>
                        <tbody>
                            <tr>
                                <td width='100'>Student Id :</td>
                                <td className='border-bottom'>{studentTCList.govtno || studentDetails.amsT_BPLCardNo}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <div className='field-row'>
                <span className='field-label w-8 text-center'>1.</span>
                <span className='field-label'>Name of Pupil :</span>
                <div className='field-value'>{studentTCList.studentname}</div>
            </div>

            <div className='field-row'>
                <span className='field-label w-8 text-center'>2.</span>
                <span className='field-label'>Name of Father&apos;s / Guardian&apos;s Name :</span>
                <div className='field-value'>{studentTCList.amst_fathername || studentTCList.amsT_FatherName}</div>
            </div>

            <div className='field-row'>
                <span className='field-label w-8 text-center'>3.</span>
                <span className='field-label'>Mother&apos;s Name :</span>
                <div className='field-value'>{studentTCList.amst_mothername || studentTCList.amsT_MotherName}</div>
            </div>

            <div className='field-row'>
                <span className='field-label w-8 text-center'>4.</span>
                <span className='field-label'>Nationality :</span>
                <div className='field-value'>{studentTCList.nationality}</div>
            </div>

            <div className='field-row'>
                <span className='field-label w-8 text-center'>5.</span>
                <span className='field-label'>Religion and Caste :</span>
                <div className='field-value'>
                    {studentTCList.religion} and {studentTCList.caste}
                </div>
            </div>

            <div className='field-row'>
                <span className='field-label w-8 text-center'>6.</span>
                <span className='field-label'>Whether the candidate belongs to Schedule Caste or Schedule Tribe or OBC :</span>
                <div className='field-value'>{isCategory}</div>
            </div>

            <div className='field-row'>
                <span className='field-label w-8 text-center'>7.</span>
                <span className='field-label'>Place of Birth :</span>
                <div className='field-value'>{studentTCList.amst_birthplace || studentTCList.amsT_BirthPlace}</div>
            </div>

            <div className='field-row'>
                <span className='field-label w-8 text-center'>8.</span>
                <span className='field-label'>Date of First admission in the School with class :</span>
                <div className='field-value'>
                    {formatDate(studentTCList.amst_date || studentTCList.amsT_Date)} &nbsp;&nbsp;-&nbsp;&nbsp;{classJoin.classjoinname}
                </div>
            </div>

            <div className='field-row'>
                <span className='field-label w-8 text-center'>9.</span>
                <span className='field-label'>Date of Birth(in Christian Era)according to Admission Register (in figures) :</span>
                <div className='field-value'>{formatDate(studentTCList.amst_dob || studentTCList.amsT_DOB)}</div>
            </div>

            <div className='field-row'>
                <span className='field-label w-8 text-center'></span>
                <span className='field-label pl-8'>in words :</span>
                <div className='field-value px-4 text-center'>{studentTCList.amst_dob_words || studentTCList.amsT_DOB_Words}</div>
            </div>

            <div className='field-row'>
                <span className='field-label w-8 text-center'>10.</span>
                <span className='field-label'>Proof for Date of Birth submitted at the time of admission :</span>
                <div className='field-value'>{studentTCList.govtno || studentDetails.amsT_BirthCertNO}</div>
            </div>

            <div className='field-row'>
                <span className='field-label w-8 text-center'>11.</span>
                <span className='field-label'>Class in which the pupil last studied (in figures) STD :</span>
                <span className='min-w-[50px] border-bottom text-center font-bold uppercase'>
                    {studentTCList.last_class_studied || studentTCList.last_Class_Studied}
                </span>
                <span className='field-label pl-4'>SEC :</span>
                <span className='min-w-[50px] border-bottom text-center font-bold uppercase'>
                    {studentTCList.asmc_sectionname || studentTCList.asmC_SectionName}
                </span>
                <span className='field-label pl-4'>in words :</span>
                <div className='field-value'>
                    {getRomanToWord(studentTCList.last_class_studied || studentTCList.last_Class_Studied)} -{' '}
                    {studentTCList.asmc_sectionname || studentTCList.asmC_SectionName}
                </div>
            </div>

            <div className='field-row'>
                <span className='field-label w-8 text-center'>12.</span>
                <span className='field-label'>School/Board Annual Examination last taken with result :</span>
                <div className='field-value'>
                    {tcDetails.astC_LastExamDetails} - {tcDetails.astC_Result}
                </div>
            </div>

            <div className='field-row'>
                <span className='field-label w-8 text-center'>13.</span>
                <span className='field-label'>Whether failed (Give Reason) :</span>
                <div className='field-value'>{tcDetails.astC_ResultDetails}</div>
            </div>

            <div className='field-row'>
                <span className='field-label w-8 text-center'>14.</span>
                <span className='field-label'>Subjects Studied/ Studying :</span>
                <div className='field-value'>{subjectsName}</div>
            </div>

            <div className='field-row'>
                <span className='field-label w-8 text-center'>15.</span>
                <span className='field-label'>Whether qualified for promotion to the higher class :</span>
                <div className='field-value'>{studentTCList.promotionflag || studentTCList.promotedflag}</div>
            </div>

            <div className='field-row'>
                <span className='field-label w-8 text-center'></span>
                <span className='field-label pl-8'>if so, to which class (in fig.)</span>
                <span className='min-w-[80px] border-bottom text-center font-bold uppercase'>{studentTCList.qualificlass}</span>
                <span className='field-label pl-4'>(in words)</span>
                <div className='field-value'>{getRomanToWord(studentTCList.qualificlass)}</div>
            </div>

            <div className='field-row'>
                <span className='field-label w-8 text-center'>16.</span>
                <span className='field-label'>Month upto which the pupil has paid School dues :</span>
                <div className='field-value'>{lastPaid.fmtfhdd_todate || lastPaid.FMTFHDD_ToDate}</div>
            </div>

            <div className='field-row'>
                <span className='field-label w-8 text-center'>17.</span>
                <span className='field-label'>Any fee concession availed of, if so, the nature of such concession :</span>
                <div className='field-value'>{studentTCList.fee_concesion || studentTCList.feeconcession}</div>
            </div>

            <div className='field-row'>
                <span className='field-label w-8 text-center'>18.</span>
                <span className='field-label'>Total No.of working days :</span>
                <div className='field-value'>{studentTCList.noof_schooldays || studentTCList.totalworkingdays}</div>
            </div>

            <div className='field-row'>
                <span className='field-label w-8 text-center'>19.</span>
                <span className='field-label'>Total No.of working days present :</span>
                <div className='field-value'>{studentTCList.noof_daysattended || studentTCList.noworkingdays}</div>
            </div>

            <div className='field-row'>
                <span className='field-label w-8 text-center'>20.</span>
                <span className='field-label'>Whether NCC cadet/boy scout/girl guide(details may be given) :</span>
                <div className='field-value'>{tcDetails.astC_NCCDetails}</div>
            </div>

            <div className='field-row print:mt-[50px]'>
                <span className='field-label w-8 text-center'>21.</span>
                <span className='field-label'>Whether school is under Govt/Minority/Independent category :</span>
                <div className='field-value text-center'>Minority</div>
            </div>

            <div className='field-row'>
                <span className='field-label w-8 text-center'>22.</span>
                <span className='field-label'>Games played or extra-curricular activities in which the pupils usually took part :</span>
                <div className='field-value'>{tcDetails.astC_ExtraActivities}</div>
            </div>

            <div className='field-row'>
                <span className='field-label w-8 text-center'>23.</span>
                <span className='field-label'>General conduct :</span>
                <div className='field-value'>{studentTCList.astc_conduct || studentTCList.astC_Conduct}</div>
            </div>

            <div className='field-row'>
                <span className='field-label w-8 text-center'>24.</span>
                <span className='field-label'>Date of application for certificate :</span>
                <div className='field-value'>{formatDate(studentTCList.astc_tcapplicationdate || tcDetails.astC_TCApplicationDate)}</div>
            </div>

            <div className='field-row'>
                <span className='field-label w-8 text-center'>25.</span>
                <span className='field-label'>Date of issue for certificate :</span>
                <div className='field-value'>{formatDate(studentTCList.astc_tcissuedate || studentTCList.astC_TCIssueDate)}</div>
            </div>

            <div className='field-row'>
                <span className='field-label w-8 text-center'>26.</span>
                <span className='field-label'>Date on which pupil name was struck off the roll of the School :</span>
                <div className='field-value'>{formatDate(studentTCList.astc_tcissuedate || studentTCList.astC_TCIssueDate)}</div>
            </div>

            <div className='field-row'>
                <span className='field-label w-8 text-center'>27.</span>
                <span className='field-label'>Reason for leaving the School :</span>
                <div className='field-value'>{studentTCList.astc_leavingreason || studentTCList.astC_LeavingReason}</div>
            </div>

            <div className='field-row'>
                <span className='field-label w-8 text-center'>28.</span>
                <span className='field-label'>Any other remarks :</span>
                <div className='field-value'>{studentTCList.astc_remarks || studentTCList.astC_Remarks}</div>
            </div>

            <table className='mt-4'>
                <tbody>
                    <tr>
                        <td className='font-bold text-sm'>
                            I hereby declare that the above information including Name of the Candidate, Father&apos;s Name, Mother&apos;s
                            Name, and Date of Birth furnished above is correct as per school records.
                        </td>
                    </tr>
                </tbody>
            </table>

            <div className='mt-12 mb-8 flex justify-between px-4'>
                <div className='font-bold'>Signature of the Principal</div>
                <div className='font-bold'>Signature of the Parent</div>
            </div>

            <hr className='my-4 border-black border-dashed' />

            <table>
                <tbody>
                    <tr>
                        <td className='text-center font-bold text-xs italic'>
                            (No Changes in any entry is to be made except by the authority issuing the Certificate. Certified that the above
                            information is in accordance with the School Register.)
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
});

TcReportPrint.displayName = 'TcReportPrint';

export default TcReportPrint;
