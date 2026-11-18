'use client';

import { format } from 'date-fns';
import { forwardRef } from 'react';

interface StudentTcPrintProps {
    data: any;
}

export const StudentTcPrint = forwardRef<HTMLDivElement, StudentTcPrintProps>(({ data }, ref) => {
    const miid = data?.masterCompany?.[0]?.miid || data?.masterCompany?.[0]?.mI_Id || 0;
    const isBoys = Number.parseInt(miid) === 6;
    const isGirls = Number.parseInt(miid) === 4;
    const isCoEdu = !isBoys && !isGirls;

    if (!data) return null;

    return (
        <div ref={ref} className='printable-content bg-white print:p-0'>
            <style
                dangerouslySetInnerHTML={{
                    __html: `
                @media print {
                    @page {
                        size: portrait;
                        margin: 0;
                    }
                    body {
                        margin: 0;
                        padding: 0;
                        -webkit-print-color-adjust: exact;
                    }
                    .printable-content {
                        visibility: visible !important;
                        display: block !important;
                    }
                    .pdf-page {
                        margin: 0 !important;
                        box-shadow: none !important;
                        border: none !important;
                        height: auto !important;
                        min-height: 290mm;
                    }
                }
                .pdf-page {
                    background: white;
                    position: relative;
                    box-sizing: border-box;
                    page-break-after: always;
                }
                .size-a4 {
                    width: 210mm;
                    min-height: 297mm;
                }
            `
                }}
            />
            {isBoys && <BoysTemplate data={data} />}
            {isGirls && <GirlsTemplate data={data} />}
            {isCoEdu && <CoEduTemplate data={data} />}
        </div>
    );
});

StudentTcPrint.displayName = 'StudentTcPrint';

// --- Boys Template (miid === 6) ---
const BoysTemplate = ({ data }: { data: any }) => {
    const student = data.studentTCList?.[0] || {};
    return (
        <div className='pdf-page size-a4 border-none p-8' style={{ width: '8.3in', margin: '0 auto', fontSize: '12px' }}>
            <div className='mb-6 flex items-center justify-between pt-20'>
                <div>
                    School Dise No: <b>29200909303</b>
                </div>
                <div>
                    TC No: <b>{student.astc_tcno || student.astC_TCNO || '---'}</b>
                </div>
                <div>
                    Academic Year:{' '}
                    <b>
                        {data.fromyear}-{data.toyear}
                    </b>
                </div>
            </div>

            <table className='w-full border-collapse border border-black text-sm'>
                <tbody>
                    <tr>
                        <td className='w-1/2 border border-black p-2'>
                            <span className='inline-block w-6'>1.</span> Admission No:{' '}
                            <b>{student.amst_admno || student.amsT_AdmNo || '---'}</b>
                        </td>
                        <td className='w-1/2 border border-black p-2 font-semibold'>
                            <span className='inline-block w-6'>14.</span> Standard in which student was studying:{' '}
                            <b>{(student.last_class_studied || student.Last_Class_Studied || student.classname || '').toUpperCase()}</b>
                        </td>
                    </tr>
                    <tr>
                        <td className='border border-black p-2'>
                            <span className='inline-block w-6'>2.</span> Enrollment No: <b>{student.govtno || '---'}</b>
                        </td>
                        <td className='border border-black p-2' rowSpan={2}>
                            <span className='inline-block w-6'>15.</span> Student opted Subjects:
                            <div className='mt-1 ml-6'>
                                a) Languages: <b>{(data.language_studied || student.subjectstudied || '').toUpperCase()}</b>
                            </div>
                            <div className='ml-6'>
                                b) Elective: <b>{(data.electivestudied || '').toUpperCase()}</b>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td className='border border-black p-2'>
                            <span className='inline-block w-6'>3.</span> Date of Admission:{' '}
                            <b>
                                {student.amst_date
                                    ? format(new Date(student.amst_date), 'dd/MM/yyyy')
                                    : student.amsT_Date
                                      ? format(new Date(student.amsT_Date), 'dd/MM/yyyy')
                                      : '---'}
                            </b>
                        </td>
                    </tr>
                    <tr>
                        <td className='border border-black p-2'>
                            <span className='inline-block w-6'>4.</span> Full Name of Student:{' '}
                            <b>{(data.studentname || '').toUpperCase()}</b>
                        </td>
                        <td className='border border-black p-2'>
                            <span className='inline-block w-6'>16.</span> Medium of Instruction:{' '}
                            <b>{(data.mediumofinstruction || data.mediumOfInstruction || 'ENGLISH').toUpperCase()}</b>
                        </td>
                    </tr>
                    <tr>
                        <td className='border border-black p-2'>
                            <span className='inline-block w-6'>5.</span> Gender:{' '}
                            <b>{(student.amst_sex || student.amsT_Sex || '').toUpperCase()}</b>
                        </td>
                        <td className='border border-black p-2'>
                            <span className='inline-block w-6'>17.</span> Fees paid all dues:{' '}
                            <b>{(student.astc_feepaid || student.ASTC_FeePaid || '---').toUpperCase()}</b>
                        </td>
                    </tr>
                    <tr>
                        <td className='border border-black p-2'>
                            <span className='inline-block w-6'>6.</span> Nationality: <b>{(student.nationality || '---').toUpperCase()}</b>
                        </td>
                        <td className='border border-black p-2'>
                            <span className='inline-block w-6'>18.</span> Fee Concession: <b>{student.fee_concesion || '---'}</b>
                        </td>
                    </tr>
                    <tr>
                        <td className='border border-black p-2'>
                            <span className='inline-block w-6'>7.</span> Religion / Caste:{' '}
                            <b>
                                {(student.religion || '').toUpperCase()} / {(student.caste || '').toUpperCase()}
                            </b>
                        </td>
                        <td className='border border-black p-2'>
                            <span className='inline-block w-6'>19.</span> Scholarship: <b>{student.astc_scholarship || '---'}</b>
                        </td>
                    </tr>
                    <tr>
                        <td className='border border-black p-2'>
                            <span className='inline-block w-6'>8.</span> Name of Father:{' '}
                            <b>{(student.amst_fathername || student.amsT_FatherName || '').toUpperCase()}</b>
                        </td>
                        <td className='border border-black p-2'>
                            <span className='inline-block w-6'>20.</span> Medically Examined: <b>{student.medicallyexamined || 'YES'}</b>
                        </td>
                    </tr>
                    <tr>
                        <td className='border border-black p-2'>
                            <span className='inline-block w-6'>9.</span> Name of Mother:{' '}
                            <b>{(student.amst_mothername || student.amsT_MotherName || '').toUpperCase()}</b>
                        </td>
                        <td className='border border-black p-2 font-semibold'>
                            <span className='inline-block w-6'>21.</span> Last Attendance Date:{' '}
                            <b>
                                {student.astc_lastattendeddate
                                    ? format(new Date(student.astc_lastattendeddate), 'dd/MM/yyyy')
                                    : student.astC_LastAttendedDate
                                      ? format(new Date(student.astC_LastAttendedDate), 'dd/MM/yyyy')
                                      : '---'}
                            </b>
                        </td>
                    </tr>
                    <tr>
                        <td className='border border-black p-2'>
                            <span className='inline-block w-7'>10.</span> SC / ST: <b>{data.studcastecategory || '---'}</b>
                        </td>
                        <td className='border border-black p-2'>
                            <span className='inline-block w-7'>22.</span> Application Date for TC:{' '}
                            <b>
                                {student.astc_tcissuedate
                                    ? format(new Date(student.astc_tcissuedate), 'dd/MM/yyyy')
                                    : student.astC_TCIssueDate
                                      ? format(new Date(student.astC_TCIssueDate), 'dd/MM/yyyy')
                                      : '---'}
                            </b>
                        </td>
                    </tr>
                    <tr>
                        <td className='border border-black p-2 font-semibold'>
                            <span className='inline-block w-7'>11.</span> Qualified for Promotion:{' '}
                            <b>{(data.nextclass || '').toUpperCase()}</b>
                        </td>
                        <td className='border border-black p-2'>
                            <span className='inline-block w-7'>23.</span> School Days: <b>{student.noof_schooldays || '---'}</b>
                        </td>
                    </tr>
                    <tr>
                        <td className='border border-black p-2'>
                            <span className='inline-block w-7'>12.</span> Date of Birth:{' '}
                            <b>
                                {student.amst_dob
                                    ? format(new Date(student.amst_dob), 'dd/MM/yyyy')
                                    : student.amsT_DOB
                                      ? format(new Date(student.amsT_DOB), 'dd/MM/yyyy')
                                      : '---'}
                            </b>
                        </td>
                        <td className='border border-black p-2'>
                            <span className='inline-block w-7'>24.</span> Days Attended:{' '}
                            <b>{(student.noof_daysattended || '---').toString().toUpperCase()}</b>
                        </td>
                    </tr>
                    <tr>
                        <td className='border border-black p-2'>
                            <span className='inline-block w-7'>13.</span> Place of Birth:{' '}
                            <b>{(student.amst_percity || student.amsT_PerCity || '---').toUpperCase()}</b>
                        </td>
                        <td className='border border-black p-2'>
                            <span className='inline-block w-7'>25.</span> Conduct:{' '}
                            <b>{(student.astc_conduct || student.astC_Conduct || '---').toUpperCase()}</b>
                        </td>
                    </tr>
                </tbody>
            </table>

            <div className='mt-16 flex justify-between px-4 font-semibold'>
                <div>
                    Date of Issue: <u> {format(new Date(), 'dd/MM/yyyy')}</u>
                </div>
                <div>Principal Sign: .................................</div>
            </div>

            <div className='mt-8 pr-12 text-right leading-relaxed'>
                <div className='font-bold text-base'>PRINCIPAL</div>
                <div>{student.institutionname || "Baldwin Boys' High School"}</div>
                <div>BANGALORE</div>
            </div>

            <div className='mt-12 flex justify-center'>
                <div className='-rotate-12 flex h-24 w-24 items-center justify-center rounded-full border-2 border-black font-bold text-xs'>
                    SCHOOL SEAL
                </div>
            </div>
        </div>
    );
};

// --- Girls Template (miid === 4) ---
const GirlsTemplate = ({ data }: { data: any }) => {
    const student = data.studentTCList?.[0] || {};
    return (
        <div
            className='pdf-page size-a4 space-y-6 px-12 pt-32 pb-20 font-serif text-[15px] leading-relaxed'
            style={{ width: '8.3in', margin: '0 auto' }}>
            <h2 className='mb-8 border-black border-b-2 pb-2 text-center font-bold text-2xl'>STUDENT TRANSFER CERTIFICATE</h2>

            <div className='flex justify-between font-bold'>
                <div className='flex gap-2'>
                    TC Serial No: <span className='border-black border-b px-4'>{student.astc_tcno || student.astC_TCNO || '---'}</span>
                </div>
                <div className='flex gap-2 text-right'>
                    Admission / Reg No:{' '}
                    <span className='border-black border-b px-4'>{student.amst_admno || student.amsT_AdmNo || '---'}</span>
                </div>
            </div>

            <p className='flex flex-wrap gap-2'>
                This is to certify that{' '}
                <span className='flex-1 border-black border-b px-2 text-center font-bold'>{data.studentname?.toUpperCase() || '---'}</span>
            </p>

            <div className='flex items-center justify-between'>
                <p className='flex flex-1 gap-2'>
                    Daughter of{' '}
                    <span className='flex-1 border-black border-b px-2 text-center font-bold'>
                        {student.amst_fathername?.toUpperCase() || student.amsT_FatherName?.toUpperCase() || '---'}
                    </span>
                </p>
                <p className='flex w-1/3 gap-2 pl-4'>
                    PEN No:{' '}
                    <span className='flex-1 border-black border-b text-center font-bold'>
                        {student.amst_penno || student.amsT_PENNo || '---'}
                    </span>
                </p>
            </div>

            <p className='flex flex-wrap gap-4'>
                was admitted into this school on{' '}
                <span className='border-black border-b px-4 font-bold'>
                    {student.amst_date
                        ? format(new Date(student.amst_date), 'dd-MM-yyyy')
                        : student.amsT_Date
                          ? format(new Date(student.amsT_Date), 'dd-MM-yyyy')
                          : '---'}
                </span>
                in standard{' '}
                <span className='flex-1 border-black border-b px-8 text-center font-bold'>{data.joinclass?.toUpperCase() || '---'}</span>
            </p>

            <p className='flex flex-wrap gap-2'>
                on a transfer from{' '}
                <span className='flex-1 border-black border-b px-2 text-center font-bold'>
                    {data.stuschoolname?.toUpperCase() || '---'}
                </span>
            </p>

            <div className='flex flex-wrap items-center gap-4'>
                <span>and left on</span>
                <span className='border-black border-b px-4 font-bold'>
                    {student.astc_lastattendeddate
                        ? format(new Date(student.astc_lastattendeddate), 'dd-MM-yyyy')
                        : data.last_date_attended
                          ? format(new Date(data.last_date_attended), 'dd-MM-yyyy')
                          : '---'}
                </span>
                <span>with a</span>
                <span className='border-black border-b px-4 font-bold'>
                    {(student.astc_conduct || student.astC_Conduct || 'GOOD').toUpperCase()}
                </span>
                <span>character.</span>
            </div>

            <div className='flex flex-wrap items-center gap-2'>
                <span>She was then studying in (@)</span>
                <span className='flex-1 border-black border-b text-center font-bold'>
                    {(student.last_class_studied || student.Last_Class_Studied || data.data2girls || '---').toUpperCase()}
                </span>
                <span>standard of the (+)</span>
                <span className='border-black border-b px-6 font-bold'>ICSE</span>
                <span>stream.</span>
            </div>

            <div className='flex flex-wrap items-center gap-4'>
                <span>The school year being from (*)</span>
                <span className='border-black border-b px-4 font-bold'>
                    {data.frommonth1} {data.fromyear}
                </span>
                <span>to (*)</span>
                <span className='border-black border-b px-4 font-bold'>
                    {data.tomonth1} {data.toyear}
                </span>
            </div>

            <p className='pt-2 font-bold'>All sums due to the school (%) on her account has been remitted.</p>

            <p className='flex flex-wrap items-center gap-2'>
                Her date of birth, according to the Admission register, is{' '}
                <span className='border-black border-b px-4 font-bold'>
                    (in figures){' '}
                    {student.amst_dob
                        ? format(new Date(student.amst_dob), 'dd-MM-yyyy')
                        : student.amsT_DOB
                          ? format(new Date(student.amsT_DOB), 'dd-MM-yyyy')
                          : '---'}
                </span>
            </p>

            <p className='flex flex-wrap gap-2'>
                (Date in words){' '}
                <span className='flex-1 border-black border-b px-2 font-medium italic'>{data.stuDobwords?.toUpperCase() || '---'}</span>
            </p>

            <p className='flex items-center gap-4'>
                Promotion ($){' '}
                <span className='flex-1 border-black border-b px-4 font-bold'>
                    {(student.astc_qual_promotionflag || data.promotiontype || '---').toUpperCase()}
                </span>
            </p>

            <div className='mt-12 flex justify-between border-slate-100 border-t px-4 pt-20 pt-8 font-bold italic'>
                <div className='flex gap-2'>
                    Date: <span className='w-32 border-black border-b text-center'>{format(new Date(), 'dd-MM-yyyy')}</span>
                </div>
                <div>Signature: ............................................</div>
            </div>

            <div className='flex items-start justify-between pt-12 text-slate-600 text-sm italic'>
                <div className='w-1/2'>Countersigned</div>
                <div className='w-1/2 text-center leading-relaxed'>
                    School Seal / Rubber Stamp
                    <div className='h-10'></div>
                </div>
            </div>

            <div className='border-slate-100 border-t pt-8 font-medium text-[11px] italic leading-tight opacity-80'>
                <div>(@) - To be given in words</div>
                <div>(+) - Mention Whether ICSE/ISC Stream</div>
                <div>(*) - Write Month and year</div>
                <div>
                    (%) - includes payments for which provision is made in the rules supplied to the parent when the student was admitted
                    into the school
                </div>
                <div>($) - Granted/Refused/Not Applicable/Passed ICSE/ISC.</div>
            </div>
        </div>
    );
};

// --- Co-Edu Template (Default) ---
const CoEduTemplate = ({ data }: { data: any }) => {
    const student = data.studentTCList?.[0] || {};
    return (
        <div
            className='pdf-page flex size-a4 flex-col space-y-0 p-10 pt-36 font-serif'
            style={{ width: '8.3in', margin: '0 auto', fontSize: '10.5px' }}>
            {/* Import Google Font for cursive styling */}
            <style
                dangerouslySetInnerHTML={{
                    __html: `
                @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;700&family=Great+Vibes&display=swap');
                .cursive-font { font-family: 'Dancing Script', cursive; font-size: 1.1rem; color: #1a1a1a; }
                .heading-cursive { font-family: 'Great Vibes', cursive; color: #000; letter-spacing: 1px; }
            `
                }}
            />

            <h1 className='mb-6 text-center'>
                <span className='border-black border-b-2 px-10 py-0.5 font-bold text-xl tracking-wider'>TRANSFER CERTIFICATE</span>
            </h1>

            <div className='space-y-0'>
                <div className='flex items-center justify-between gap-10'>
                    <div className='flex flex-1 gap-2 font-bold'>
                        School Dise No : <span className='cursive-font flex-1 border-black border-b text-center'>29200111538</span>
                    </div>
                    <div className='flex flex-1 gap-2 font-bold'>
                        Medium of Instruction :{' '}
                        <span className='cursive-font flex-1 border-black border-b text-center'>
                            {(student.mediumofinstruction || student.mediumOfInstruction || 'ENGLISH').toUpperCase()}
                        </span>
                    </div>
                </div>

                <div className='flex items-center justify-between gap-2'>
                    <div className='flex gap-2 font-bold'>
                        TC No :{' '}
                        <span className='cursive-font min-w-[150px] border-black border-b px-6 text-center'>
                            {student.astc_tcno || student.astC_TCNO || '---'}
                        </span>
                    </div>
                    <div className='flex flex-1 gap-2 pl-4 font-bold'>
                        STS No : <span className='cursive-font flex-1 border-black border-b text-center'>{student.govtno || '---'}</span>
                    </div>
                    <div className='flex flex-1 gap-2 pl-4 font-bold'>
                        PEN No :{' '}
                        <span className='cursive-font flex-1 border-black border-b text-center'>
                            {student.amst_penno || student.amsT_PENNo || '---'}
                        </span>
                    </div>
                </div>

                <div className='flex items-center gap-4'>
                    <div className='shrink-0 font-bold'>01. Name of the Student in full :</div>
                    <div className='cursive-font min-h-[22px] flex-1 border-black border-b px-2 text-center font-bold'>
                        {data.studentname?.toUpperCase() || data.studentFullName?.toUpperCase() || '---'}
                    </div>
                </div>

                <div className='flex items-center justify-between gap-2'>
                    <div className='flex shrink-0 gap-2 font-bold'>
                        02. Admission No :{' '}
                        <span className='cursive-font min-h-[20px] min-w-[120px] border-black border-b px-4 text-center'>
                            {student.amst_admno || student.amsT_AdmNo || '---'}
                        </span>
                    </div>
                    <div className='flex flex-1 gap-2 pl-4 text-center font-bold'>
                        Admn Date :{' '}
                        <span className='cursive-font min-h-[20px] flex-1 border-black border-b px-4 text-center'>
                            {student.amst_date
                                ? format(new Date(student.amst_date), 'dd/MM/yyyy')
                                : student.amsT_Date
                                  ? format(new Date(student.amsT_Date), 'dd/MM/yyyy')
                                  : '---'}
                        </span>
                    </div>
                    <div className='flex flex-1 gap-2 pl-4 font-bold'>
                        Admitted to :{' '}
                        <span className='cursive-font min-h-[20px] flex-1 border-black border-b text-center'>
                            {data.joinclass?.toUpperCase() || '---'}
                        </span>
                    </div>
                </div>

                <div className='flex items-center justify-between gap-4'>
                    <div className='flex shrink-0 grow gap-2 font-bold'>
                        03. Place of Birth :{' '}
                        <span className='cursive-font min-h-[20px] min-w-[200px] flex-1 border-black border-b text-center uppercase'>
                            {student.amst_percity || student.amsT_PerCity || '---'}
                        </span>
                    </div>
                    <div className='flex grow gap-2 font-bold'>
                        State :{' '}
                        <span className='cursive-font min-h-[20px] flex-1 border-black border-b text-center uppercase'>
                            {student.statename || data.statename || 'KARNATAKA'}
                        </span>
                    </div>
                </div>

                <div className='space-y-0'>
                    <div className='font-bold'>04. Date of birth [in figure & word]</div>
                    <div className='flex items-center gap-4 pl-10'>
                        <div className='flex shrink-0 gap-2 font-bold'>
                            In figures :{' '}
                            <span className='cursive-font min-h-[20px] border-black border-b px-6 text-center'>
                                {student.amst_dob
                                    ? format(new Date(student.amst_dob), 'dd/MM/yyyy')
                                    : student.amsT_DOB
                                      ? format(new Date(student.amsT_DOB), 'dd/MM/yyyy')
                                      : '---'}
                            </span>
                        </div>
                        <div className='flex flex-1 gap-2 overflow-hidden font-bold'>
                            In words :{' '}
                            <span className='cursive-font min-h-[20px] flex-1 truncate border-black border-b px-4 text-center leading-normal'>
                                {data.stuDobwords?.toUpperCase() || '---'}
                            </span>
                        </div>
                    </div>
                </div>

                <div className='flex items-center justify-between gap-10'>
                    <div className='flex flex-1 gap-2 font-bold'>
                        05. Gender :{' '}
                        <span className='cursive-font min-h-[20px] flex-1 border-black border-b text-center'>
                            {(student.amst_sex || student.amsT_Sex || '---').toUpperCase()}
                        </span>
                    </div>
                    <div className='flex flex-1 gap-2 pl-6 font-bold'>
                        Nationality :{' '}
                        <span className='cursive-font min-h-[20px] flex-1 border-black border-b text-center'>
                            {(student.nationality || 'INDIAN').toUpperCase()}
                        </span>
                    </div>
                </div>

                <div className='flex items-center gap-4'>
                    <div className='shrink-0 font-bold'>
                        06. Religion :{' '}
                        <span className='cursive-font min-h-[20px] border-black border-b px-6 text-center'>
                            {(student.religion || '---').toUpperCase()}
                        </span>
                    </div>
                    <div className='flex shrink-0 gap-2 pl-4 font-bold'>
                        Caste :{' '}
                        <span className='cursive-font min-h-[20px] border-black border-b px-6 text-center'>
                            {(student.caste || '---').toUpperCase()}
                        </span>
                    </div>
                    <div className='flex flex-1 gap-2 pl-4 font-bold'>
                        Sub Caste :{' '}
                        <span className='cursive-font min-h-[20px] flex-1 border-black border-b text-center'>
                            {student.amst_subcasteimc_id || student.AMST_SubCasteIMC_Id || '---'}
                        </span>
                    </div>
                </div>

                <div className='flex items-center gap-2'>
                    <div className='shrink-0 font-bold text-[9.5px]'>
                        07. Whether the candidate belongs to Scheduled Caste / Scheduled Tribe / OBC / General ? :
                    </div>
                    <div className='cursive-font min-h-[20px] flex-1 border-black border-b text-center font-bold'>
                        {(student.castecat || student.castecategory || 'GENERAL').toUpperCase()}
                    </div>
                </div>

                <div className='flex items-center gap-4'>
                    <div className='shrink-0 font-bold'>08. Name of the Father :</div>
                    <div className='cursive-font min-h-[20px] flex-1 border-black border-b text-center font-bold uppercase'>
                        {student.amst_fathername || student.amsT_FatherName || '---'}
                    </div>
                </div>

                <div className='flex items-center gap-4'>
                    <div className='shrink-0 font-bold'>09. Name of the Mother :</div>
                    <div className='cursive-font min-h-[20px] flex-1 border-black border-b text-center font-bold uppercase'>
                        {student.amst_mothername || student.amsT_MotherName || '---'}
                    </div>
                </div>

                <div className='space-y-0 pt-0.5'>
                    <div className='flex items-center gap-2'>
                        <div className='font-bold text-[9.5px]'>
                            10. Whether the candidate has qualified for promotion to a higher standard :
                        </div>
                        <div className='cursive-font min-h-[20px] flex-1 border-black border-b text-center font-bold uppercase'>
                            {(data.promotiontype || student.astc_qual_promotionflag || 'YES').toUpperCase()}
                        </div>
                    </div>
                    <div className='flex items-center gap-2 pl-10'>
                        <div className='shrink-0 font-bold'>If yes to which class :</div>
                        <div className='cursive-font min-h-[20px] flex-1 border-black border-b text-center font-bold uppercase'>
                            {data.qualificlass || student.qualificlass || '---'}
                        </div>
                    </div>
                </div>

                <div className='flex items-center gap-4'>
                    <div className='shrink-0 font-bold text-[10px]'>
                        11. Standard in which the student was studying at the time of leaving :
                    </div>
                    <div className='cursive-font min-h-[20px] flex-1 border-black border-b text-center font-bold'>
                        {(student.last_class_studied || student.Last_Class_Studied || student.classname || '---').toUpperCase()}
                    </div>
                </div>

                <div className='flex items-center gap-4'>
                    <div className='shrink-0 font-bold text-[9.5px]'>12. Subjects opted by the student :</div>
                    <div className='cursive-font min-h-[20px] flex-1 border-black border-b px-1 text-center font-bold text-[8.5px] uppercase leading-tight'>
                        I LANGUAGE - ENGLISH, {student.subjectstudied || data.language_studied || '---'}
                    </div>
                </div>

                <div className='flex items-center gap-4'>
                    <div className='shrink-0 font-bold text-[10px]'>13. Whether medically examined or not ? :</div>
                    <div className='cursive-font min-h-[20px] flex-1 border-black border-b text-center font-bold uppercase'>
                        {student.medicallyexamined || 'YES'}
                    </div>
                </div>

                <div className='flex items-center gap-4'>
                    <div className='shrink-0 font-bold text-[10px]'>14. Number of School Days in the academic year :</div>
                    <div className='cursive-font min-h-[20px] flex-1 border-black border-b text-center font-bold'>
                        {student.noof_schooldays || '---'}
                    </div>
                </div>

                <div className='flex items-center gap-4'>
                    <div className='shrink-0 font-bold text-[10px]'>
                        15. Total Number of Days attended by the student in the academic year :
                    </div>
                    <div className='cursive-font min-h-[20px] flex-1 border-black border-b text-center font-bold'>
                        {student.noof_daysattended || '---'}
                    </div>
                </div>

                <div className='flex items-center gap-4'>
                    <div className='shrink-0 font-bold text-[10px]'>16. Month of Student's last attendance at the school :</div>
                    <div className='cursive-font min-h-[20px] flex-1 border-black border-b text-center font-bold uppercase'>
                        {student.astc_lastattendeddate
                            ? format(new Date(student.astc_lastattendeddate), 'dd/MM/yyyy')
                            : student.astC_LastAttendedDate
                              ? format(new Date(student.astC_LastAttendedDate), 'dd/MM/yyyy')
                              : '---'}
                    </div>
                </div>

                <div className='flex items-center gap-4'>
                    <div className='shrink-0 font-bold text-[10px]'>17. Date on which the application for TC was received :</div>
                    <div className='cursive-font min-h-[20px] flex-1 border-black border-b text-center font-bold'>
                        {student.astc_tcapplicationdate
                            ? format(new Date(student.astc_tcapplicationdate), 'dd/MM/yyyy')
                            : student.astC_TCApplicationDate
                              ? format(new Date(student.astC_TCApplicationDate), 'dd/MM/yyyy')
                              : '---'}
                    </div>
                </div>

                <div className='flex items-center gap-4'>
                    <div className='shrink-0 font-bold text-[10px]'>18. Reason for leaving School :</div>
                    <div className='cursive-font min-h-[20px] flex-1 border-black border-b text-center font-bold text-[8.5px] uppercase leading-tight'>
                        {student.astc_leavingreason || student.astC_LeavingReason || '---'}
                    </div>
                </div>

                <div className='flex items-center gap-4'>
                    <div className='shrink-0 font-bold text-[10px]'>19. Character and Conduct :</div>
                    <div className='cursive-font min-h-[20px] flex-1 border-black border-b text-center font-bold uppercase'>
                        {student.astc_conduct || student.astC_Conduct || 'GOOD'}
                    </div>
                </div>

                <div className='flex items-center gap-4'>
                    <div className='shrink-0 font-bold text-[10px]'>20. Whether the student has paid all the fee due of the school? :</div>
                    <div className='cursive-font min-h-[20px] flex-1 border-black border-b text-center font-bold uppercase'>
                        {student.astc_feepaid || student.ASTC_FeePaid || 'YES'}
                    </div>
                </div>
            </div>

            <div className='mt-0.5 flex gap-2 pt-0.5 font-bold text-[9.5px]'>
                Date of Issue : <span className='cursive-font border-black border-b px-6'>{format(new Date(), 'dd/MM/yyyy')}</span>
            </div>

            <div className='mt-4 flex items-end justify-between px-4'>
                <div className='w-[200px] space-y-0 text-center text-[10px]'>
                    <div className='cursive-font h-10'></div>
                    <div className='border-black border-t pt-1 font-bold'>Signature of Office Staff</div>
                </div>
                <div className='w-[200px] space-y-0 text-center text-[10px]'>
                    <div className='cursive-font h-10'></div>
                    <div className='border-black border-t pt-1 font-bold'>Signature of the Principal</div>
                </div>
            </div>
        </div>
    );
};
