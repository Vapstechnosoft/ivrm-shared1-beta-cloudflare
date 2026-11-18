'use client';

import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface PrintComponentProps {
    data: any;
    certType: '0' | '1'; // 0: Conduct, 1: Study
    logo?: string;
    extraFields?: {
        exmname?: string;
        exmmonth?: string;
        stdreg?: string;
    };
}

export const PrintComponent = forwardRef<HTMLDivElement, PrintComponentProps>(({ data, certType, logo, extraFields }, ref) => {
    if (!data || data.length === 0) return null;

    const student = data[0];
    const today = new Date();

    const renderStudyCertificate = () => (
        <div className="study-certificate-container p-[40px] font-['Times_New_Roman',_Times,_serif] text-[#1a1a1a] shadow-2xl bg-white border border-slate-200">
            {/* Contact Info Header */}
            <div className="flex justify-between text-[14px] leading-relaxed mb-6 border-b border-slate-100 pb-4">
                <div className="flex flex-col">
                    <span>E-mail: <strong className="font-bold">sms_college@yahoo.com</strong></span>
                    <span>Website: <strong className="font-bold">www.smscollegebrahmavar.com</strong></span>
                </div>
                <div className="flex flex-col text-right">
                    <span>Ph: <strong className="font-bold">8951615968 (Principal)</strong></span>
                    <span className="flex items-center justify-end gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                        <strong className="font-bold">6366415968 (Office)</strong>
                    </span>
                </div>
            </div>

            {/* Logo and Institution Header */}
            <div className="text-center mb-10">
                {logo && <img src={logo} alt="Logo" className="mx-auto max-h-[120px] mb-4 hover:scale-105 transition-transform duration-500" />}
                <div className="flex items-start justify-between min-h-[60px]">
                    <div className="text-left w-[20%] text-[13px] leading-tight italic text-slate-500 pt-2">
                        Towards Moulding<br />
                        &nbsp;&nbsp;&nbsp;&nbsp;Sublime Lives
                    </div>
                    <div className="w-[60%] flex flex-col gap-1">
                        <span className="text-[12px] text-slate-600">(Managed by O.S.C Educational Society/Obtained minority status vide No. 919/2014 dt. 18.09.2014)</span>
                        <div className="text-[14px] font-bold">
                            (Affiliated to Mangalore University)(NAAC Accredited A Grade <span className="text-blue-600">(CGPA: 3.20</span>))
                        </div>
                    </div>
                    <div className="w-[20%]"></div>
                </div>
                <hr className="mt-4 border-slate-300" />
            </div>

            {/* Reference and Date */}
            <div className="flex justify-between text-[18px] mb-12 px-2">
                <div contentEditable suppressContentEditableWarning className="hover:bg-slate-50 p-1 rounded-md transition-colors border border-transparent hover:border-slate-200 min-w-[200px]">
                    Ref: SMSC/S.Cer/{student.acadamicyear || student.yearname}
                </div>
                <div contentEditable suppressContentEditableWarning className="hover:bg-slate-50 p-1 rounded-md transition-colors border border-transparent hover:border-slate-200">
                    Date: {format(today, 'dd/MM/yyyy')}
                </div>
            </div>

            {/* Title */}
            <div className="text-center mb-16">
                <h1 className="text-[28px] font-black tracking-[0.1em] underline decoration-2 underline-offset-8">STUDY CERTIFICATE</h1>
            </div>

            {/* Content Body */}
            <div className="certificate-body text-[20px] leading-[1.8] text-justify px-[30px] mb-32 italic">
                <p contentEditable suppressContentEditableWarning className="p-4 rounded-xl border-2 border-transparent hover:border-blue-100 hover:bg-blue-50/30 transition-all outline-none">
                    This is to certify that {student.gender === 'FEMALE' ? 'kumari' : 'kumar'} <strong className="font-bold not-italic">{student.studentname}</strong>, {student.gender === 'FEMALE' ? 'D/o' : 'S/o'} {student.gender === 'FEMALE' ? 'kumari' : 'kumar'} <strong className="font-bold not-italic">{student.fathername}</strong>,
                    student of our college is studying in <strong className="font-bold not-italic">{student.coursename} {student.semestername || student.classstudying}</strong> during the Academic year <strong className="font-bold not-italic">{student.acadamicyear || student.yearname}</strong>.
                </p>
            </div>

            {/* Signature */}
            <div className="flex justify-end pr-8">
                <div className="text-right flex flex-col items-center">
                    <div className="h-[60px]"></div> {/* Placeholder for signature seal */}
                    <span className="text-[22px] font-bold tracking-wider uppercase border-t-2 border-slate-800 pt-2 min-w-[150px] text-center">Principal</span>
                </div>
            </div>
        </div>
    );

    const renderConductCertificate = (copyType: 'Original' | 'Carbon') => (
        <section className="conduct-copy relative p-8 mb-8 border-2 border-slate-900 rounded-[10px] bg-white font-['Times_New_Roman',_serif] overflow-hidden">
            {/* Watermark/Copy Indicator */}
            <div className="absolute top-5 right-5 text-[100px] font-black opacity-[0.03] select-none pointer-events-none -rotate-12 z-0">
                {copyType.toUpperCase()}
            </div>

            <div className="relative z-10">
                {/* Header */}
                <div className="flex justify-between text-[14px] font-bold mb-4">
                    <div className="flex flex-col">
                        <span>E-mail: <b>sms_college@yahoo.com</b></span>
                        <span>Website: <b>www.smscollegebrahmavar.com</b></span>
                    </div>
                    <div className="flex flex-col text-right">
                        <span><b className="text-blue-600">CC:</b> <b>{student.admno}</b></span>
                        <span><svg className="inline w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 005.47 5.47l.773-1.548a1 1 0 011.06-.539l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"></path></svg> <b>6366415968</b></span>
                    </div>
                </div>

                {/* Main Branding - Replicating legacy layout with stacked images */}
                <div className="text-center mb-8 pb-4 border-b border-slate-100">
                    <img src="https://dcampusstrg.blob.core.windows.net/files/17/ISM_Attachments/7ce3a963-7d4b-4165-80ef-193eccfa41fe.png" alt="Branch Logo" className="mx-auto max-h-[120px]" />
                    {/* The legacy code had a second image positioned relative, we'll try to balance it */}
                </div>

                {/* Ref and Date */}
                <div className="flex justify-between px-6 text-[18px] mb-8">
                    <div contentEditable suppressContentEditableWarning className="hover:bg-slate-50 p-1 min-w-[200px]">
                        <strong>Ref. No:</strong> SMSC/C.Cer/{student.acadamicyear || student.yearname}
                    </div>
                    <div contentEditable suppressContentEditableWarning className="hover:bg-slate-50 p-1">
                        <strong>Date:</strong> {format(today, 'dd/MM/yyyy')}
                    </div>
                </div>

                {/* Titles */}
                <div className="text-center space-y-2 mb-10">
                    <div className="text-[24px] font-bold uppercase tracking-widest text-slate-400">{copyType} Copy</div>
                    <div className="text-[28px] font-black underline decoration-double underline-offset-[10px] uppercase">CONDUCT CERTIFICATE</div>
                </div>

                {/* Body Text */}
                <div className="text-[21px] leading-[1.8] text-justify px-4 italic mb-20">
                    <p contentEditable suppressContentEditableWarning className="hover:bg-yellow-50/50 p-4 rounded-lg border border-transparent hover:border-slate-100 transition-all outline-none">
                        This &nbsp; is &nbsp; to &nbsp; certify &nbsp; that &nbsp; {student.gender === 'FEMALE' ? 'Ms' : 'Mr'}&nbsp; <strong className="font-bold not-italic uppercase tracking-wider">{student.studentname}</strong> &nbsp; {student.gender === 'FEMALE' ? 'D/o' : 'S/o'}&nbsp; {student.gender === 'FEMALE' ? 'kumari' : 'kumar'}.&nbsp; <strong className="font-bold not-italic"> {student.fathername}</strong>,
                        &nbsp; was &nbsp; studying &nbsp; in &nbsp; this &nbsp; institution &nbsp; from &nbsp; <strong className="font-bold not-italic underline underline-offset-2">{student.ACAYCBS_SemStartDate ? format(new Date(student.ACAYCBS_SemStartDate), 'dd/MM/yyyy') : 'DD/MM/YYYY'}</strong> &nbsp; to &nbsp;<strong className="font-bold not-italic underline underline-offset-2">{student.ACAYCBS_SemEndDate ? format(new Date(student.ACAYCBS_SemEndDate), 'dd/MM/yyyy') : 'DD/MM/YYYY'}</strong>
                        &nbsp; in &nbsp; <strong className="font-bold not-italic"> I &nbsp; year {student.coursename}</strong> &nbsp; to &nbsp; <strong className="font-bold not-italic"> III &nbsp; year &nbsp; {student.coursename} </strong>&nbsp; and &nbsp; {student.gender === 'FEMALE' ? 'her' : 'his'} &nbsp; conduct &nbsp; and &nbsp; character &nbsp; were &nbsp; <strong className="font-bold not-italic text-blue-800">Good</strong>.
                    </p>
                </div>

                {/* Exam Details - Optional for Conduct */}
                {extraFields?.exmname && (
                   <div className="mt-[-60px] mb-20 px-4 text-[18px] flex flex-wrap gap-8 font-medium italic border-t border-slate-100 pt-6">
                        <div>Exam: <span className="font-bold not-italic">{extraFields.exmname}</span></div>
                        {extraFields.exmmonth && <div>Month/Year: <span className="font-bold not-italic">{extraFields.exmmonth}</span></div>}
                        {extraFields.stdreg && <div>Reg.No: <span className="font-bold not-italic">{extraFields.stdreg}</span></div>}
                   </div>
                )}

                {/* Footer Signature */}
                <div className="flex justify-between items-end px-10 mb-6">
                    <div className="flex flex-col items-center">
                        <div className="w-[100px] h-[100px] border-2 border-slate-200 rounded-full flex items-center justify-center italic text-[10px] text-slate-300">
                            Institution Seal
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="h-[50px]"></div>
                        <div className="text-[20px] font-bold border-t border-slate-900 pt-1 uppercase w-[180px] text-center">Principal</div>
                    </div>
                </div>
            </div>
        </section>
    );

    return (
        <div ref={ref} className="print-wrapper max-w-[900px] mx-auto bg-slate-100/30 p-8 rounded-[40px]">
            <style jsx global>{`
                @media print {
                    .print-wrapper {
                        padding: 0 !important;
                        background: none !important;
                        max-width: none !important;
                    }
                    .study-certificate-container {
                        box-shadow: none !important;
                        border: none !important;
                        padding: 2cm !important;
                    }
                    .conduct-copy {
                        margin-bottom: 2cm !important;
                        page-break-inside: avoid !important;
                    }
                }
            `}</style>
            
            {certType === '1' ? renderStudyCertificate() : (
                <div className="space-y-12">
                    {renderConductCertificate('Original')}
                    <div className="border-t-2 border-dashed border-slate-300 my-8 py-8 relative">
                        <span className="absolute top-[-14px] left-1/2 -translate-x-1/2 bg-white px-4 text-slate-400 text-xs tracking-widest uppercase font-black">Cut here</span>
                    </div>
                    {renderConductCertificate('Carbon')}
                </div>
            )}
        </div>
    );
});

PrintComponent.displayName = 'PrintComponent';
