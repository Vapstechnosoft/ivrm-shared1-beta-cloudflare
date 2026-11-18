'use client';

import { format } from 'date-fns';
import { forwardRef } from 'react';

interface TcReportProps {
    data: any;
}

const TcReport = forwardRef<HTMLDivElement, TcReportProps>(({ data }, ref) => {
    if (!data) return null;

    // Mapping based on legacy JS logic provided by user
    const studentTC = data.result?.[0] || data.studentTCList?.[0] || {};
    const academicYear = data.academicList1?.[0] || {};

    const todayDate =
        studentTC.astc_tcissuedate || studentTC.astC_TCIssueDate
            ? new Date(studentTC.astc_tcissuedate || studentTC.astC_TCIssueDate)
            : new Date();
    const dob = studentTC.amst_dob || studentTC.amsT_DOB ? new Date(studentTC.amst_dob || studentTC.amsT_DOB) : null;
    const doa = studentTC.amst_date || studentTC.amsT_Date ? new Date(studentTC.amst_date || studentTC.amsT_Date) : null;
    const leftDate =
        studentTC.astc_lastattendeddate || studentTC.astC_LastAttendedDate
            ? new Date(studentTC.astc_lastattendeddate || studentTC.astC_LastAttendedDate)
            : null;

    const fromDate = academicYear.asmaY_From_Date ? new Date(academicYear.asmaY_From_Date) : null;
    const toDate = academicYear.asmaY_To_Date ? new Date(academicYear.asmaY_To_Date) : null;

    const getMonthName = (date: Date | null) => {
        if (!date) return '';
        return format(date, 'MMMM').toUpperCase();
    };

    const getYear = (date: Date | null) => {
        if (!date) return '';
        return format(date, 'yyyy');
    };

    const feePaidRaw = studentTC.astc_feepaid || studentTC.astC_FeePaid;
    const feePaidStatus = feePaidRaw === 'No' ? 'Not UptoDate' : 'Uptodate';

    const lastStudied = studentTC.last_class_studied || studentTC.Last_Class_Studied;
    const promotion = studentTC.qualificlass || studentTC.lblPromotion;

    return (
        <div ref={ref} className='st-anns-report-wrapper'>
            <style jsx>{`
                .st-anns-report-wrapper {
                    background-color: white;
                    color: black;
                    padding: 20px;
                    width: 210mm;
                    min-height: 296mm; /* Slightly less than 297 to avoid spillover */
                    margin: 0 auto;
                    font-family: 'Times New Roman', Times, serif;
                    box-shadow: 0 0 10px rgba(0,0,0,0.1);
                    box-sizing: border-box;
                }
                
                @media print {
                    * {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    .st-anns-report-wrapper {
                        width: 210mm !important;
                        height: 297mm !important;
                        min-height: auto !important;
                        margin: 0 !important;
                        padding: 10mm !important;
                        box-shadow: none !important;
                        border: none !important;
                        outline: none !important;
                        box-sizing: border-box;
                        background-color: white !important;
                        color: black !important;
                        visibility: visible !important;
                    }
                    @page {
                        size: A4 portrait;
                        margin: 0;
                    }
                }

                .main-table {
                    width: 100%;
                    border-collapse: collapse;
                }

                .border-bottom-dotted {
                    background-image: linear-gradient(to right, #000 33%, rgba(255, 255, 255, 0) 0%);
                    background-position: bottom;
                    background-size: 2px 1px;
                    background-repeat: repeat-x;
                    display: inline-flex;
                    justify-content: center;
                    min-width: 50px;
                    padding: 0 5px;
                    line-height: 1.1;
                }

                .dots-full-line {
                    background-image: linear-gradient(to right, #000 33%, rgba(255, 255, 255, 0) 0%);
                    background-position: bottom;
                    background-size: 2px 1px;
                    background-repeat: repeat-x;
                    height: 25px;
                    width: 100%;
                    margin-bottom: 5px;
                }

                .counterfoil-border {
                    border-right: 2px dotted #000 !important;
                }

                .school-header {
                    text-align: center;
                    margin-bottom: 10px;
                }

                .school-name {
                    font-size: 20px;
                    font-weight: 900;
                    color: #000;
                    margin: 0;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .school-address {
                    font-size: 10px;
                    margin: 1px 0;
                    font-weight: bold;
                    color: #000;
                }

                .school-contact {
                    font-size: 9px;
                    margin: 1px 0;
                    font-weight: bold;
                    color: #000;
                }

                .tc-title-box {
                    text-align: center;
                    margin: 10px 0;
                }

                .tc-title {
                    font-size: 16px;
                    font-weight: bold;
                    color: #003366;
                    border-bottom: 2px solid #003366;
                    display: inline-block;
                    padding: 0 15px;
                    text-transform: uppercase;
                    letter-spacing: 1.5px;
                }

                .field-label {
                    font-size: 13px;
                    font-weight: bold;
                }

                .field-value {
                    font-size: 13px;
                    font-weight: bold;
                    text-transform: uppercase;
                }

                .editable-field {
                    color: #475569;
                    font-style: italic;
                    font-weight: normal;
                    min-width: 100px;
                    display: inline-block;
                    border-bottom: 1px solid #e2e8f0;
                }
            `}</style>

            <table className='main-table'>
                <tbody>
                    <tr>
                        {/* LEFT SIDE - COUNTERFOIL (approx 1/3) */}
                        <td className='counterfoil-border pr-6 align-top' style={{ width: '33%' }}>
                            <div className='flex flex-col'>
                                <div className='mb-2 flex items-center justify-center gap-4'>
                                    <img
                                        src={studentTC.logo}
                                        style={{ width: '200px', height: '60px', objectFit: 'contain' }}
                                        alt='School Logo'
                                    />
                                </div>

                                <div className='tc-title-box'>
                                    <h3 className='tc-title' style={{ fontSize: '14px' }}>
                                        TRANSFER CERTIFICATE
                                    </h3>
                                </div>

                                <div className='mb-4 flex justify-between font-bold text-[11px]'>
                                    <div>
                                        TC No: <span className='border-bottom-dotted'>{studentTC.astc_tcno || studentTC.astC_TCNO}</span>
                                    </div>
                                    <div className='text-right'>
                                        ID No:{' '}
                                        <span className='border-bottom-dotted'>
                                            {studentTC.amst_registrationno || studentTC.amsT_RegistrationNo}
                                        </span>
                                    </div>
                                </div>

                                <div className='space-y-4'>
                                    <div className='flex flex-col'>
                                        <span className='field-label text-xs'>Given to</span>
                                        <span className='field-value border-bottom-dotted pt-1 text-center'>{studentTC.studentname}</span>
                                    </div>

                                    <div className='dots-full-line'></div>
                                    <div className='dots-full-line'></div>

                                    <div className='flex flex-col'>
                                        <span className='field-label text-xs'>Son/Daughter of</span>
                                        <span className='field-value border-bottom-dotted pt-1 text-center'>
                                            {studentTC.amst_fathername || studentTC.amsT_FatherName}
                                        </span>
                                    </div>

                                    <div className='flex items-baseline gap-1'>
                                        <span className='field-label whitespace-nowrap text-xs'>On account of</span>
                                        <span className='flex-1 border-bottom-dotted'></span>
                                    </div>

                                    <div className='flex items-baseline gap-1'>
                                        <span className='field-label whitespace-nowrap text-xs'>Left</span>
                                        <span className='field-value flex-1 border-bottom-dotted text-center'>
                                            {leftDate ? format(leftDate, 'dd/MM/yyyy') : ''}
                                        </span>
                                    </div>

                                    <div className='flex items-baseline gap-1'>
                                        <span className='field-label whitespace-nowrap text-xs'>Character</span>
                                        <span className='field-value flex-1 border-bottom-dotted text-center'>
                                            {studentTC.astc_conduct || studentTC.astC_Conduct}
                                        </span>
                                    </div>

                                    <div className='flex items-baseline gap-1'>
                                        <span className='field-label whitespace-nowrap text-xs'>Fees</span>
                                        <span className='field-value flex-1 border-bottom-dotted text-center'>{feePaidStatus}</span>
                                    </div>

                                    <div className='flex flex-col'>
                                        <span className='field-label text-xs'>Studying in Class</span>
                                        <span className='field-value border-bottom-dotted pt-1 text-center uppercase'>{lastStudied}</span>
                                    </div>

                                    <div className='flex flex-col'>
                                        <span className='field-label text-xs'>Promotion</span>
                                        <span className='field-value border-bottom-dotted pt-1 text-center uppercase'>{promotion}</span>
                                    </div>

                                    <div className='flex flex-col'>
                                        <span className='field-label text-xs'>Date of Birth</span>
                                        <span className='field-value border-bottom-dotted pt-1 text-center'>
                                            {dob ? format(dob, 'dd/MM/yyyy') : ''}
                                        </span>
                                    </div>

                                    <div className='flex items-baseline gap-1 pt-4'>
                                        <span className='field-label whitespace-nowrap text-xs'>Dated:</span>
                                        <span className='field-value flex-1 border-bottom-dotted text-center'>
                                            {format(todayDate, 'dd/MM/yyyy')}
                                        </span>
                                    </div>

                                    <div className='flex items-baseline gap-1'>
                                        <span className='field-label whitespace-nowrap text-xs'>Prepared By:</span>
                                        <span
                                            className='flex-1 border-bottom-dotted text-center'
                                            contentEditable
                                            suppressContentEditableWarning>
                                            enter here
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </td>

                        {/* RIGHT SIDE - MAIN CERTIFICATE (approx 2/3) */}
                        <td className='pl-8 align-top'>
                            <div className='mb-4 flex items-center justify-center gap-6'>
                                <img
                                    src={studentTC.logo}
                                    style={{ width: '400px', height: '90px', objectFit: 'contain' }}
                                    alt='School Logo'
                                />
                            </div>

                            <div className='tc-title-box'>
                                <h2 className='tc-title'>TRANSFER CERTIFICATE</h2>
                            </div>

                            <div className='mb-6 flex justify-between px-4 font-bold text-base'>
                                <div>
                                    TC No:{' '}
                                    <span className='min-w-[100px] border-bottom-dotted'>{studentTC.astc_tcno || studentTC.astC_TCNO}</span>
                                </div>
                                <div className='text-right'>
                                    ID No:{' '}
                                    <span className='min-w-[100px] border-bottom-dotted'>
                                        {studentTC.amst_registrationno || studentTC.amsT_RegistrationNo}
                                    </span>
                                </div>
                            </div>

                            <div className='space-y-4 text-base'>
                                <div className='flex items-baseline gap-2'>
                                    <span className='field-label whitespace-nowrap font-normal'>This is to certify that</span>
                                    <span className='field-value flex-1 border-bottom-dotted text-center'>{studentTC.studentname}</span>
                                </div>

                                <div className='flex items-baseline gap-2'>
                                    <span className='field-label whitespace-nowrap font-normal'>Son/Daughter of</span>
                                    <span className='field-value flex-1 border-bottom-dotted text-center'>
                                        {studentTC.amst_fathername || studentTC.amsT_FatherName}
                                    </span>
                                </div>

                                <div className='flex items-baseline gap-2'>
                                    <span className='field-label whitespace-nowrap font-normal'>
                                        was admitted into this school on the (date)
                                    </span>
                                    <span className='field-value w-56 border-bottom-dotted text-center'>
                                        {doa ? format(doa, 'dd/MM/yyyy') : ''}
                                    </span>
                                </div>

                                <div className='flex items-baseline gap-2'>
                                    <span className='field-label whitespace-nowrap font-normal'>on a transfer certificate from</span>
                                    <span
                                        className='flex-1 border-bottom-dotted text-center italic'
                                        contentEditable
                                        suppressContentEditableWarning>
                                        enter here
                                    </span>
                                </div>

                                <div className='flex flex-wrap items-baseline gap-2'>
                                    <span className='field-label whitespace-nowrap font-normal'>and left on the</span>
                                    <span className='field-value w-48 border-bottom-dotted text-center'>
                                        {leftDate ? format(leftDate, 'dd/MM/yyyy') : ''}
                                    </span>
                                    <span className='field-label whitespace-nowrap font-normal'>with a</span>
                                    <span className='field-value w-48 border-bottom-dotted text-center'>
                                        {studentTC.astc_conduct || studentTC.astC_Conduct}
                                    </span>
                                    <span className='field-label whitespace-nowrap font-normal'>character</span>
                                </div>

                                <div className='flex items-baseline gap-2'>
                                    <span className='field-label whitespace-nowrap font-normal'>He/She was then studying in Class</span>
                                    <span
                                        className='field-value flex-1 border-bottom-dotted text-center'
                                        contentEditable
                                        suppressContentEditableWarning>
                                        {lastStudied}
                                    </span>
                                </div>

                                <div className='flex items-baseline gap-2'>
                                    <span className='field-label whitespace-nowrap font-normal'>Class of the</span>
                                    <span className='field-value w-40 border-bottom-dotted text-center'>ISC</span>
                                    <span className='field-label whitespace-nowrap font-normal'>stream, the school year</span>
                                </div>

                                <div className='flex items-baseline gap-2'>
                                    <span className='field-label whitespace-nowrap font-normal'>being from</span>
                                    <span className='field-value w-56 border-bottom-dotted text-center'>
                                        {getMonthName(fromDate)} {getYear(fromDate)}
                                    </span>
                                    <span className='field-label whitespace-nowrap font-normal'>to</span>
                                    <span className='field-value w-56 border-bottom-dotted text-center'>
                                        {getMonthName(toDate)} {getYear(toDate)}
                                    </span>
                                </div>

                                <div className='flex flex-wrap items-baseline gap-2'>
                                    <span className='field-label whitespace-nowrap font-normal'>All sum due</span>
                                    <span className='field-value w-40 border-bottom-dotted text-center'>{feePaidStatus}</span>
                                    <span className='field-label whitespace-nowrap font-normal'>
                                        to this school on his/her account have been remitted or
                                    </span>
                                </div>
                                <div className='pl-4 text-base leading-none'>satisfactorily arrange for.</div>

                                <div className='flex flex-wrap items-baseline gap-2 pt-2'>
                                    <span className='field-label whitespace-nowrap font-normal'>
                                        His/Her date of birth, according to the Admission Register is (in figures)
                                    </span>
                                    <span className='field-value w-56 border-bottom-dotted text-center'>
                                        {dob ? format(dob, 'dd/MM/yyyy') : ''}
                                    </span>
                                </div>

                                <div className='flex items-baseline gap-2'>
                                    <span className='field-value flex-1 border-bottom-dotted text-center italic'>
                                        ({studentTC.amst_dob_words || studentTC.amsT_DOB_Words})
                                    </span>
                                    <span className='field-label whitespace-nowrap font-normal'>(in words)</span>
                                </div>

                                <div className='pt-6 text-sm italic leading-tight opacity-80'>
                                    (The following additional information must be supplied if the scholar left at the end of the School
                                    year)
                                </div>

                                <div className='flex items-baseline gap-2'>
                                    <span className='field-label whitespace-nowrap font-normal'>Promotion has been</span>
                                    <span className='field-value flex-1 border-bottom-dotted text-center'>{promotion}</span>
                                </div>

                                <div className='flex items-end justify-between pt-16'>
                                    <div className='flex flex-col gap-10'>
                                        <div className='flex items-baseline gap-2'>
                                            <span className='field-label'>Date :</span>
                                            <span className='field-value w-48 border-bottom-dotted text-center'>
                                                {format(todayDate, 'dd/MM/yyyy')}
                                            </span>
                                        </div>
                                    </div>
                                    <div className='flex flex-col items-center'>
                                        <div className='mb-2 w-72 border-black border-b-2'></div>
                                        <div className='field-label text-xl uppercase'>(PRINCIPAL)</div>
                                        <div className='mt-1 text-xs'>School Rubber Stamp</div>
                                    </div>
                                </div>

                                <div className='space-y-1 pt-8' style={{ fontSize: '10px', fontWeight: 'normal' }}>
                                    <div>1. To be given in words.</div>
                                    <div>2. Mention whether ICSE/ISC /Any other examination stream.</div>
                                    <div>3. Insert month.</div>
                                    <div>4. Sums due to the School include payments for which provision was admitted into the school.</div>
                                    <div>5. Granted / Granted on Trial / Refused.</div>
                                </div>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
});

TcReport.displayName = 'TcReport';

export default TcReport;
