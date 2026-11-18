'use client';

import { format } from 'date-fns';
import { forwardRef } from 'react';

interface TCReportViewProps {
    data: any;
    logo: string;
}

const Point = ({ num, label, value, full }: { num: string; label: string; value: string | number; full?: boolean }) => {
    const isLong = String(value || '').length > 60;
    return (
        <div className={`flex ${isLong ? 'flex-col items-start' : 'items-end'} gap-x-2 gap-y-1`}>
            <div className='flex items-end gap-2'>
                <span className='w-6 shrink-0'>{num}.</span>
                <span className='shrink-0'>{label}</span>
            </div>
            <span
                className={`border-black border-b px-2 ${isLong ? 'min-h-[20px] w-full text-justify leading-relaxed' : `h-5 ${full ? 'flex-1' : 'min-w-[150px]'}`}`}>
                {value || ''}
            </span>
        </div>
    );
};

const TCReportView = forwardRef<HTMLDivElement, TCReportViewProps>(({ data, logo }, ref) => {
    if (!data) return null;

    const { studentTCList, studenttcdetails, getadm_m_student_details, getnextclass, classnamejoin } = data;

    const student = studentTCList?.[0] || {};
    const details = studenttcdetails?.[0] || {};
    const studentMaster = getadm_m_student_details?.[0] || {};
    const nextClass = getnextclass?.[0] || {};
    const joinClass = classnamejoin?.[0] || {};

    const formatDate = (date: any) => {
        if (!date) return '';
        try {
            return format(new Date(date), 'dd/MM/yyyy');
        } catch (e) {
            return date;
        }
    };

    const romanToWord = (roman: string) => {
        if (!roman) return '';
        const map: { [key: string]: string } = {
            I: 'FIRST',
            II: 'SECOND',
            III: 'THIRD',
            IV: 'FOURTH',
            V: 'FIFTH',
            VI: 'SIXTH',
            VII: 'SEVENTH',
            VIII: 'EIGHTH',
            IX: 'NINTH',
            X: 'TENTH',
            XI: 'ELEVENTH',
            XII: 'TWELTH'
        };
        return map[roman.toUpperCase()] || roman;
    };

    // Helper to get value regardless of case
    const getVal = (obj: any, ...keys: string[]) => {
        for (const key of keys) {
            if (obj[key] !== undefined && obj[key] !== null) return obj[key];
            const lowerKey = key.toLowerCase();
            if (obj[lowerKey] !== undefined && obj[lowerKey] !== null) return obj[lowerKey];
        }
        return '';
    };

    const studentName = getVal(student, 'studentname');
    const motherName = getVal(studentMaster, 'amsT_MotherName') || getVal(student, 'amst_mothername');
    const fatherName = getVal(studentMaster, 'amsT_FatherName') || getVal(student, 'amst_fathername');
    const dob = getVal(studentMaster, 'amsT_DOB') || getVal(student, 'amst_dob');
    const dobWords = getVal(studentMaster, 'amsT_DOB_Words') || getVal(student, 'amst_dob_words');
    const registrationNo = getVal(student, 'amst_registrationno', 'amsT_RegistrationNo');
    const tcNo = getVal(student, 'astc_tcno', 'astC_TCNO');
    const admDate = getVal(studentMaster, 'amsT_Date') || getVal(student, 'amst_date');
    const leftClass = getVal(student, 'last_class_studied', 'leftclass', 'classname');
    const promotedClass = getVal(nextClass, 'asmcL_ClassName') || getVal(student, 'promotedclass');
    const joinedClass = getVal(joinClass, 'classjoinname') || getVal(student, 'joinedclass');

    const promoInWords = promotedClass ? romanToWord(promotedClass) : 'NA';
    const leftInWords = leftClass ? romanToWord(leftClass) : 'NA';

    return (
        <div
            ref={ref}
            className='mx-auto max-w-[210mm] border bg-white p-8 font-serif text-[14px] text-black leading-relaxed shadow-sm print:m-0 print:w-full print:max-w-none print:border-0 print:p-0 print:text-[12px] print:shadow-none'>
            <style
                type='text/css'
                dangerouslySetInnerHTML={{
                    __html: `
                @media print {
                    @page { size: A4 portrait; margin: 15mm; }
                    .BBKVTC { 
                        display: block !important; 
                        visibility: visible !important;
                        opacity: 1 !important;
                        transform: none !important;
                        width: 100% !important; 
                        height: auto !important; 
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                        font-size: 11px !important;
                        line-height: 1.2 !important;
                    }
                    .print-full-width { max-width: none !important; width: 100% !important; border: none !important; padding: 0 !important; }
                    .BBKVTC.space-y-4 { gap: 0.5rem !important; }
                    .print-compact { padding-top: 0.5rem !important; margin-top: 0 !important; }
                    .print-logo { height: 70px !important; }
                    .print-sigs { padding-top: 1.5rem !important; }
                    .BBKVTC [class*="space-y-1.5"] { gap: 0.125rem !important; }
                }
                .dotted-underline { border-bottom: 1px solid black; display: inline-block; min-width: 50px; padding: 0 4px; }
            `
                }}
            />

            <div className='BBKVTC print-full-width space-y-4'>
                {/* Header Logo */}
                <div className='flex justify-center'>
                    {logo && <img src={logo} alt='School Logo' className='print-logo h-28 object-contain' />}
                </div>

                <div className='text-center'>
                    <h2 className='inline-block border-blue-800 border-b-2 pb-1 font-bold text-2xl text-blue-800 uppercase tracking-widest'>
                        TRANSFER CERTIFICATE
                    </h2>
                </div>

                {/* Book Info */}
                <div className='grid grid-cols-3 gap-4 font-bold text-sm'>
                    <div className='flex items-end'>
                        <span>Book No.</span>
                        <span className='ml-2 h-5 flex-1 border-black border-b px-2'>{tcNo || 'NA'}</span>
                    </div>
                    <div className='flex items-end'>
                        <span>S.No.</span>
                        <span className='ml-2 h-5 flex-1 border-black border-b px-2'>
                            {getVal(studentMaster, 'amsT_BPLCardNo') || getVal(student, 'govtno') || 'NA'}
                        </span>
                    </div>
                    <div className='flex items-end'>
                        <span>Admission No.</span>
                        <span className='ml-2 h-5 flex-1 border-black border-b px-2'>{registrationNo || 'NA'}</span>
                    </div>
                </div>

                {/* Numbered Points */}
                <div className='print-compact space-y-1.5 pt-4'>
                    <Point num='1' label='Name of Pupil' value={studentName} full />
                    <Point num='2' label="Mother's Name" value={motherName} full />
                    <Point num='3' label="Name of Father's / Guardian's Name" value={fatherName} full />

                    <div className='flex items-start gap-2'>
                        <span className='w-6 shrink-0'>4.</span>
                        <div className='flex-1'>
                            <div className='flex items-end'>
                                <span className='shrink-0'>
                                    Date of Birth(In Christian Era) according to Admission Register (in figures)
                                </span>
                                <span className='ml-2 h-5 flex-1 border-black border-b px-2'>{formatDate(dob)}</span>
                            </div>
                            <div className={`flex ${String(dobWords || '').length > 50 ? 'flex-col items-start' : 'items-end'} mt-1`}>
                                <span className='shrink-0 pl-8'>(in words)</span>
                                <span
                                    className={`ml-2 border-black border-b px-2 font-bold text-[11px] uppercase ${String(dobWords || '').length > 50 ? 'mt-1 min-h-[20px] w-full leading-tight' : 'h-5 flex-1'}`}>
                                    {dobWords || 'NA'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <Point num='5' label='Nationality' value={getVal(student, 'nationality')} full />

                    <div className='flex items-end gap-2'>
                        <span className='w-6 shrink-0'>6.</span>
                        <div className='flex flex-1 items-end'>
                            <span className='shrink-0'>Whether the Candidate belongs to Scheduled Caste or Scheduled Tribe or OBC</span>
                            <span className='ml-2 h-5 flex-1 border-black border-b px-2'>{getVal(student, 'caste') || 'NA'}</span>
                        </div>
                    </div>

                    <Point
                        num='7'
                        label='Date of First admission in the school with class'
                        value={`${formatDate(admDate)} in class ${joinedClass}`}
                        full
                    />

                    <div className='flex items-start gap-2'>
                        <span className='w-6 shrink-0'>8.</span>
                        <div className='flex flex-1 items-end'>
                            <span className='shrink-0'>Class in which the pupil last studied (in figures)</span>
                            <span className='mx-2 h-5 min-w-[60px] border-black border-b px-4 text-center'>{leftClass}</span>
                            <span className='shrink-0'>(in words)</span>
                            <span className='ml-2 h-5 flex-1 border-black border-b px-2'>{leftInWords}</span>
                        </div>
                    </div>

                    <Point
                        num='9'
                        label='School/Board Annual Examination last taken with result'
                        value={getVal(details, 'astC_Result') || getVal(student, 'astc_result') || 'NA'}
                        full
                    />
                    <Point num='10' label='Whether failed, if so once/twice in the same class' value='NA' full />
                    <Point num='11' label='Subjects Studied' value={getVal(student, 'subjectstudied')} full />

                    <div className='flex items-start gap-2'>
                        <span className='w-6 shrink-0'>12.</span>
                        <div className='flex-1'>
                            <div className='flex items-end'>
                                <span className='shrink-0'>Whether qualified for promotion to the higher class</span>
                                <span className='ml-2 h-5 flex-1 border-black border-b px-2'>
                                    {getVal(student, 'astc_qual_promotionflag', 'promotionflag') || 'NA'}
                                </span>
                            </div>
                            <div className='mt-1 flex items-end'>
                                <span className='shrink-0 pl-8'>if so, to which class (in fig.)</span>
                                <span className='mx-2 h-5 min-w-[100px] border-black border-b px-4 text-center'>
                                    {promotedClass || 'NA'}
                                </span>
                                <span className='shrink-0'>(in words)</span>
                                <span className='ml-2 h-5 flex-1 border-black border-b px-2'>{promoInWords}</span>
                            </div>
                        </div>
                    </div>

                    <Point
                        num='13'
                        label='Month upto which the pupil has paid school dues'
                        value={getVal(student, 'astC_FeePaid', 'astc_feepaid') || 'NA'}
                        full
                    />
                    <Point
                        num='14'
                        label='Any fee concession availed of, if so, the nature of such concession'
                        value={getVal(student, 'fee_concesion') || 'NA'}
                        full
                    />
                    <Point
                        num='15'
                        label='Total No.of working days in the academic session'
                        value={getVal(student, 'noof_schooldays', 'Total_AttendedDays')}
                        full
                    />
                    <Point
                        num='16'
                        label='Total No.of working days pupil present in the school'
                        value={getVal(student, 'noof_daysattended', 'AttendedDays')}
                        full
                    />
                    <Point
                        num='17'
                        label='Whether NCC cadet/boy Scout/girl guide(details may be given)'
                        value={getVal(student, 'ncc') || 'NA'}
                        full
                    />

                    <div className='flex items-start gap-2'>
                        <span className='w-6 shrink-0'>18.</span>
                        <div className='flex-1'>
                            <div className='flex flex-wrap items-end'>
                                <span className='shrink-0'>
                                    Games played or extra-curricular activities in which the pupils usually took part (Mention achievement
                                    level therein)
                                </span>
                                <span className='ml-2 min-h-[20px] flex-1 border-black border-b px-2'>
                                    {getVal(student, 'extra') || 'NA'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <Point num='19' label='General conduct' value={getVal(student, 'astC_Conduct', 'astc_conduct') || 'NA'} full />
                    <Point
                        num='20'
                        label='Date of application for certificate'
                        value={formatDate(getVal(student, 'astC_TCIssueDate', 'astc_tcapplicationdate'))}
                        full
                    />
                    <Point
                        num='21'
                        label='Date of issue for certificate'
                        value={formatDate(getVal(student, 'lbldate', 'astc_tcissuedate', 'tcdatess'))}
                        full
                    />
                    <Point
                        num='22'
                        label='Reason for leaving the school'
                        value={getVal(student, 'astC_LeavingReason', 'astc_leavingreason')}
                        full
                    />
                    <Point num='23' label='Any other remarks' value={getVal(student, 'astC_Remarks', 'astc_remarks') || 'NA'} full />
                </div>

                {/* Signatures */}
                <div className='print-sigs grid grid-cols-3 gap-8 pt-16 text-center font-bold text-[12px]'>
                    <div className='space-y-4'>
                        <div className='flex h-12 items-center justify-center'></div>
                        <div>Signature of Class Teacher</div>
                    </div>
                    <div className='space-y-4'>
                        <div className='flex h-12 items-center justify-center'></div>
                        <div>
                            Checked By
                            <br />
                            <span className='font-normal text-[10px]'>(With full name and designation)</span>
                        </div>
                    </div>
                    <div className='space-y-4'>
                        <div className='flex h-12 items-center justify-center'>SCHOOL SEAL</div>
                        <div>
                            Signature of the <b>Headmistress</b> with date
                        </div>
                    </div>
                </div>

                {/* QR Code */}
                {data.qrcode && (
                    <div className='flex justify-end pt-4'>
                        <img src={data.qrcode} alt='QR Code' className='h-24 w-24 border p-1' />
                    </div>
                )}
            </div>
        </div>
    );
});

TCReportView.displayName = 'TCReportView';

export default TCReportView;
