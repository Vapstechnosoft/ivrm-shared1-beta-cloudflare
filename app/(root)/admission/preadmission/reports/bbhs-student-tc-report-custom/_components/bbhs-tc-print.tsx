'use client';

import { format } from 'date-fns';
import { forwardRef } from 'react';

interface TcPrintProps {
    data: any;
}

export const BbhsTcPrint = forwardRef<HTMLDivElement, TcPrintProps>(({ data }, ref) => {
    if (!data) return null;

    const {
        studentTCList = [],
        masterCompany = [],
        academicList1 = [],
        getdate = new Date(),
        stuschoolname,
        joinclass,
        nextclass,
        nextclassname,
        stuDobwords,
        frommonth1,
        tomonth1,
        fromyear,
        toyear,
        std1,
        std
    } = data;

    const student = studentTCList[0] || {};
    const company = masterCompany[0] || {};

    const formatDate = (dateString: string | null) => {
        if (!dateString) return '';
        try {
            return format(new Date(dateString), 'dd/MM/yyyy');
        } catch (e) {
            return dateString;
        }
    };

    const studentFullName =
        data.studentFullName ||
        student.studentname ||
        `${student.amsT_FirstName || student.AMST_FirstName || ''} ${student.amsT_MiddleName || student.AMST_MiddleName || ''} ${student.amsT_LastName || student.AMST_LastName || ''}`.trim();

    const tcNo = student.astc_tcno || student.astC_TCNO || student.ASTC_TCNO || '---';
    const admNo = student.amst_admno || student.amsT_AdmNo || student.AMST_AdmNo || '---';
    const fatherName = student.amst_fathername || student.amsT_FatherName || student.AMST_FatherName || '---';
    const motherName = student.amst_mothername || student.amsT_MotherName || student.AMST_MotherName || '---';
    const dob = student.amst_dob || student.amsT_DOB || student.AMST_DOB || null;
    const admissionDate = student.amst_date || student.amsT_Date || student.AMST_Date || student.amst_admissiondate || null;
    const lastAttendedDate = student.astc_lastattendeddate || student.astC_LastAttendedDate || student.ASTC_LastAttendedDate || null;
    const conduct = student.astc_conduct || student.astC_Conduct || student.ASTC_Conduct || '---';
    const lastClassStudied = student.last_class_studied || student.last_Class_Studied || student.ASMCL_ClassName || '---';
    const stsNo = data.govtno || student.amst_sol || student.AMST_SOL || '---';

    return (
        <div ref={ref} className='print-main-container'>
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
                    .print-main-container {
                        visibility: visible !important;
                        display: block !important;
                        width: 210mm !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        background: white !important;
                    }
                    .print-page {
                        visibility: visible !important;
                        display: block !important;
                        width: 210mm !important;
                        min-height: 297mm !important;
                        margin: 0 !important;
                        padding: 15mm !important; /* Professional margin */
                        position: relative !important;
                        background: white !important;
                        box-sizing: border-box !important;
                    }
                    .print-main-container * {
                        visibility: visible !important;
                    }
                }
                .print-page {
                    width: 210mm;
                    min-height: 297mm;
                    margin: 0 auto;
                    padding: 15mm;
                    background: white;
                    color: black;
                    font-family: serif;
                    box-sizing: border-box;
                    box-shadow: 0 0 10px rgba(0,0,0,0.1);
                }
                @media screen {
                    .print-page {
                        box-shadow: 0 0 20px rgba(0,0,0,0.15);
                        border: 1px solid #e2e8f0;
                    }
                }
                .dotted-line {
                    border-bottom: 2px dotted #000;
                    padding: 0 8px;
                    display: inline-block;
                    font-weight: bold;
                    font-style: italic;
                }
            `
                }}
            />

            <div className='print-page'>
                {/* Header / DISE NO Section */}
                <div className='mt-4 space-y-8'>
                    <div className='flex items-end justify-between border-b-0 pb-1'>
                        <div className='flex items-baseline gap-2'>
                            <span className='min-w-max font-medium text-[12pt] uppercase tracking-tight'>School DISE NO :</span>
                            <span className='min-w-[120px] border-black border-b-2 px-2 text-center font-bold text-[13pt]'>
                                29200909303
                            </span>
                        </div>
                        <div className='flex max-w-xs flex-grow items-baseline justify-end gap-2'>
                            <span className='min-w-max font-medium text-[12pt] uppercase tracking-tight'>STS.No :</span>
                            <span className='dotted-line flex-grow text-center text-[13pt]'>{stsNo}</span>
                        </div>
                    </div>

                    <div className='flex items-end justify-between border-b-0'>
                        <div className='flex max-w-[280px] flex-grow items-baseline gap-2'>
                            <span className='min-w-max font-medium text-[12pt] uppercase tracking-tight'>TC Serial No.:</span>
                            <span className='dotted-line flex-grow text-center text-[13pt]'>{tcNo}</span>
                        </div>
                        <div className='flex max-w-[280px] flex-grow items-baseline justify-end gap-2'>
                            <span className='min-w-max font-medium text-[12pt] uppercase tracking-tight'>Admission No :</span>
                            <span className='dotted-line flex-grow text-center text-[13pt]'>{admNo}</span>
                        </div>
                    </div>
                </div>

                {/* Formal Body Text */}
                <div className='mt-10 space-y-5 text-[14pt] leading-[1.6]'>
                    <div className='flex items-baseline gap-3'>
                        <span className='min-w-max whitespace-nowrap'>This is to certify that</span>
                        <div className='dotted-line flex-grow text-center text-[16pt] uppercase not-italic'>{studentFullName}</div>
                    </div>

                    <div className='flex items-baseline gap-3'>
                        <span className='min-w-max whitespace-nowrap'>son of</span>
                        <div className='dotted-line flex-grow text-center text-[13pt]'>
                            (Father) &nbsp; <span className='font-bold uppercase not-italic'>{fatherName}</span> &nbsp;&nbsp;&nbsp; (Mother)
                            &nbsp; <span className='font-bold uppercase not-italic'>{motherName}</span>
                        </div>
                    </div>

                    <div className='flex items-baseline gap-3'>
                        <span className='min-w-max whitespace-nowrap'>was admitted into this school on the</span>
                        <div className='dotted-line flex-grow text-center text-[13pt]'>
                            <span className='font-bold not-italic'>{formatDate(admissionDate)}</span> For{' '}
                            <span className='font-bold not-italic'>{joinclass}</span>
                        </div>
                    </div>

                    <div className='flex items-baseline gap-3'>
                        <span className='min-w-max whitespace-nowrap'>on a transfer certificate from</span>
                        <div className='dotted-line flex-grow text-center text-[13pt]'>{stuschoolname || '---'}</div>
                        <span className='min-w-max whitespace-nowrap'>School</span>
                    </div>

                    <div className='flex flex-wrap items-baseline gap-x-3 gap-y-4'>
                        <span className='whitespace-nowrap'>and left on the</span>
                        <div className='dotted-line min-w-[160px] text-center text-[13pt]'>{formatDate(lastAttendedDate)}</div>
                        <span className='whitespace-nowrap px-2'>with a</span>
                        <div className='dotted-line min-w-[140px] text-center text-[13pt] uppercase'>{conduct}</div>
                        <span className='whitespace-nowrap'>character.</span>
                    </div>

                    <div className='flex flex-wrap items-baseline gap-x-2 gap-y-4'>
                        <span className='whitespace-nowrap'>He belongs to the</span>
                        <div className='dotted-line min-w-[120px] text-center text-[13pt]'>
                            {student.religion || student.AMST_Religion || '---'}
                        </div>
                        <span className='whitespace-nowrap px-1'>religion</span>
                        <div className='dotted-line min-w-[120px] text-center text-[13pt]'>
                            {student.caste || student.AMST_Caste || '---'}
                        </div>
                        <span className='flex-grow whitespace-nowrap text-right'>caste as per the school records.</span>
                    </div>

                    <div className='flex flex-wrap items-baseline gap-x-2 gap-y-4'>
                        <span className='whitespace-nowrap'>He was then studying in</span>
                        <div className='dotted-line min-w-[160px] text-center text-[14pt] uppercase'>
                            {std1} {lastClassStudied}
                        </div>
                        <span className='whitespace-nowrap px-4 font-normal italic opacity-80'>of the</span>
                        <div className='dotted-line min-w-[120px] text-center text-[13pt] not-italic tracking-[0.2em]'>ICSE</div>
                        <span className='whitespace-nowrap'>stream,</span>
                    </div>

                    <div className='flex items-baseline gap-3'>
                        <span className='min-w-max whitespace-nowrap'>the school year being from</span>
                        <div className='dotted-line flex-grow text-center text-[13pt] uppercase tracking-wider'>
                            JUNE {fromyear} TO APRIL {toyear}
                        </div>
                    </div>
                </div>

                {/* Sums Due Section */}
                <div className='mt-8 mb-6'>
                    <div className='flex items-start gap-12'>
                        <div className='w-[45%] font-semibold text-[11pt] uppercase leading-snug tracking-tight'>
                            All sums due to this School
                            <br />
                            On his account have been
                        </div>

                        <div className='mt-[-10px] origin-top scale-y-[1.8] transform select-none font-thin text-[40pt] text-slate-400 italic leading-[0.5]'>
                            {'}'}
                        </div>

                        <div className='w-[45%] space-y-1 font-bold text-[11pt] text-slate-800 italic'>
                            <div className='flex items-center gap-2'>
                                <span className='text-[14pt] leading-none'>-</span> PAID
                            </div>
                            <div className='flex items-center gap-2'>
                                <span className='text-[14pt] leading-none'>-</span> REMITTED
                            </div>
                            <div className='flex items-center gap-2 whitespace-nowrap'>
                                <span className='text-[14pt] leading-none'>-</span> SATISFACTORILY ARRANGED FOR
                            </div>
                        </div>
                    </div>
                </div>

                {/* DOB Section */}
                <div className='mt-8 space-y-6 text-[13pt]'>
                    <div className='flex items-baseline gap-3'>
                        <span className='whitespace-nowrap'>His date of birth, according to the Admission Register, is (in figures)</span>
                        <div className='dotted-line flex-grow text-center text-[14pt]'>{formatDate(dob)}</div>
                    </div>

                    <div className='flex items-baseline gap-3'>
                        <span className='min-w-max whitespace-nowrap px-4 text-slate-600 italic'>(in words)</span>
                        <div className='dotted-line flex-grow text-center text-[12pt] uppercase tracking-tight'>{stuDobwords || '---'}</div>
                    </div>

                    <div className='flex items-baseline gap-3 border-t-0 pt-2'>
                        <span className='min-w-max whitespace-nowrap'>Promotion</span>
                        <div className='dotted-line flex-grow text-center text-[13pt] uppercase'>
                            {std} {nextclass} &nbsp;&nbsp; {nextclassname}
                        </div>
                    </div>
                </div>

                {/* Signatures Section */}
                <div className='mt-16 flex items-end justify-between pb-4'>
                    <div className='flex items-baseline gap-2'>
                        <span className='font-semibold text-[12pt] uppercase'>Date :</span>
                        <div className='dotted-line min-w-[200px] text-center text-[13pt]'>{formatDate(getdate)}</div>
                    </div>

                    <div className='px-4 text-center'>
                        <div className='border-black border-t-2 px-8 pt-2 font-bold text-[14pt] uppercase tracking-widest'>
                            ( Principal )
                        </div>
                    </div>
                </div>

                <div className='absolute right-0 bottom-6 left-0 mx-12 border-t pt-3 text-center font-medium text-[10pt] text-slate-500 uppercase tracking-tighter'>
                    [Final Class Standard X - Indian Certificate of Secondary Education (ICSE)]
                </div>
            </div>
        </div>
    );
});

BbhsTcPrint.displayName = 'BbhsTcPrint';
