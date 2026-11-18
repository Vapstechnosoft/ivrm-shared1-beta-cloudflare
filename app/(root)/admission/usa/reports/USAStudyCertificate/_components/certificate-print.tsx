'use client';

import { format } from 'date-fns';
import { forwardRef } from 'react';
import { UniversalLogo } from './universal-logo';

interface StudentCertificateData {
    amcsT_Id?: number;
    AMCST_Id?: number;
    studentname?: string;
    studentName?: string;
    admno?: string;
    amsT_AdmNo?: string;
    registrationno?: string;
    RegistrationNo?: string;
    fathername?: string;
    fatherName?: string;
    mothername?: string;
    gender?: string;
    coursename?: string;
    CourseName?: string;
    branchname?: string;
    semestername?: string;
    sectionname?: string;
    acadamicyear?: string;
    yearname?: string;
    studyPeriod?: string;
    [key: string]: any;
}

interface CertificatePrintProps {
    students: StudentCertificateData[];
    certificateType: 'STUDY' | 'BONAFIED';
    reportDate: Date;
    logoUrl?: string;
}

export const CertificatePrint = forwardRef<HTMLDivElement, CertificatePrintProps>(
    ({ students, certificateType, reportDate, logoUrl }, ref) => {
        if (!students || students.length === 0) return null;

        return (
            <div ref={ref} className='certificate-print-root w-full'>
                <style jsx global>{`
                    @media print {
                        @page {
                            size: A4 portrait;
                            margin: 15mm 15mm 15mm 15mm;
                        }
                        body {
                            background: white !important;
                            color: black !important;
                            -webkit-print-color-adjust: exact !important;
                            print-color-adjust: exact !important;
                        }
                        .certificate-print-root {
                            width: 100% !important;
                            padding: 0 !important;
                            background: transparent !important;
                        }
                        .certificate-single-page {
                            box-shadow: none !important;
                            border: none !important;
                            padding: 10mm 5mm !important;
                            width: 100% !important;
                            min-height: auto !important;
                            page-break-after: always !important;
                            break-after: page !important;
                        }
                        .certificate-single-page:last-child {
                            page-break-after: avoid !important;
                            break-after: avoid !important;
                        }
                    }
                `}</style>

                <div className='flex flex-col gap-10 print:gap-0'>
                    {students.map((student, idx) => {
                        const studentName = (
                            student.studentnam ||
                            student.studentname ||
                            student.studentName ||
                            student.amsT_FirstName ||
                            student.student_name ||
                            'Student Name'
                        ).toUpperCase();

                        const isFemale =
                            student.gender?.toLowerCase() === 'female' ||
                            student.gender?.toLowerCase() === 'f' ||
                            student.gender === 'F' ||
                            student.amsT_Sex?.toLowerCase() === 'female';

                        const titlePrefix = isFemale ? 'Ms' : 'Mr';
                        const relationPrefix = isFemale ? 'D/o' : 'S/o';
                        const fatherName = student.fatherName || student.fathername || student.amsT_FatherName || '';

                        const regNo =
                            student.registrationno ||
                            student.RegistrationNo ||
                            student.regNo ||
                            student.admno ||
                            student.amsT_AdmNo ||
                            student.amsT_RegistrationNo ||
                            'U03MY24A0002';

                        const course =
                            student.coursename ||
                            student.CourseName ||
                            student.course ||
                            student.className ||
                            student.asmcL_ClassName ||
                            'BA';

                        const academicYear =
                            student.acadamicyear || student.yearname || student.asmaY_Year || student.studyPeriod || '-2022-2027';

                        const refNo = regNo;

                        return (
                            <div
                                key={student.amcsT_Id ?? student.AMCST_Id ?? idx}
                                className='certificate-single-page mx-auto flex w-full max-w-[850px] flex-col rounded-lg border border-slate-200 bg-white p-8 font-serif shadow-xl print:m-0 print:border-none print:p-4 print:shadow-none'
                                style={{ fontFamily: "'Times New Roman', Times, serif" }}>
                                {/* Institution Header */}
                                <div className='flex items-center gap-6 border-transparent border-b pb-4'>
                                    {/* Logo */}
                                    <div className='flex shrink-0 items-center justify-center'>
                                        <UniversalLogo logoUrl={logoUrl} size={135} />
                                    </div>

                                    {/* Institution Text Details */}
                                    <div className='flex flex-1 flex-col text-center'>
                                        <h1 className='font-bold text-[#c51f2a] text-[26px] leading-snug tracking-tight sm:text-[30px]'>
                                            Universal School of Administration
                                        </h1>
                                        <h2 className='font-normal font-serif text-[#2b6cb0] text-[17px] italic leading-normal sm:text-[19px]'>
                                            Affiliated to Bangalore University
                                        </h2>

                                        {/* Orange divider line */}
                                        <hr className='my-2 border-[#ea580c] border-t-[1.5px]' />

                                        <p className='font-sans text-[13px] text-slate-800 leading-tight'>
                                            Gururayanapura, Ramaholli Post, Tavarekare Hobli, Bangalore South, Bangalore-560074
                                        </p>
                                        <p className='font-sans text-[13px] text-slate-800 leading-tight'>
                                            Ph: +91 9945940112 / 6374148822 / 6366155654
                                        </p>
                                        <p className='font-sans text-[13px] text-slate-800 leading-tight'>
                                            Mail: info@universalinstitutions.com, Website: www.universalschoolofadministration.edu.in
                                        </p>
                                    </div>
                                </div>

                                {/* Reference and Date Row */}
                                <div className='mt-8 mb-6 flex items-center justify-between px-2 font-serif text-[15px] sm:text-[16px]'>
                                    <div
                                        contentEditable
                                        suppressContentEditableWarning
                                        className='rounded p-1 hover:bg-slate-50 focus:bg-amber-50 focus:outline-none'>
                                        Ref: <span className='font-medium'>{refNo}</span>
                                    </div>
                                    <div
                                        contentEditable
                                        suppressContentEditableWarning
                                        className='rounded p-1 hover:bg-slate-50 focus:bg-amber-50 focus:outline-none'>
                                        Date: <span className='font-medium'>{format(reportDate, 'dd/MM/yyyy')}</span>
                                    </div>
                                </div>

                                {/* Certificate Title */}
                                <div className='my-6 text-center'>
                                    <h3 className='font-bold text-[#1e3a8a] text-[18px] uppercase tracking-wider underline decoration-1 underline-offset-4 sm:text-[20px]'>
                                        {certificateType === 'STUDY' ? 'STUDY CERTIFICATE' : 'BONAFIED CERTIFICATE'}
                                    </h3>
                                </div>

                                {/* Certificate Body Content */}
                                <div className='my-6 space-y-6 px-4 text-justify font-serif text-[16px] leading-[2.2] sm:text-[17px]'>
                                    <p
                                        contentEditable
                                        suppressContentEditableWarning
                                        className='rounded p-2 transition-colors hover:bg-slate-50 focus:bg-amber-50 focus:outline-none'>
                                        {certificateType === 'STUDY' ? (
                                            <>
                                                This is to certify that{' '}
                                                <strong className='font-bold'>
                                                    {titlePrefix} {studentName}
                                                </strong>{' '}
                                                {relationPrefix} {fatherName ? <strong className='font-bold'>{fatherName}</strong> : ''},{' '}
                                                bearing Registration Number <strong className='font-bold'>{regNo}</strong> Course{' '}
                                                <strong className='font-bold'>{course}</strong> studied in Our institution during the
                                                academic year <strong className='font-bold'>{academicYear}</strong>.
                                            </>
                                        ) : (
                                            <>
                                                This is to certify that{' '}
                                                <strong className='font-bold'>
                                                    {titlePrefix} {studentName}
                                                </strong>{' '}
                                                {relationPrefix} {fatherName ? <strong className='font-bold'>{fatherName}</strong> : ''},{' '}
                                                bearing Registration Number <strong className='font-bold'>{regNo}</strong> Course{' '}
                                                <strong className='font-bold'>{course}</strong> is a bonafide student of Our institution
                                                during the academic year <strong className='font-bold'>{academicYear}</strong>.
                                            </>
                                        )}
                                    </p>

                                    <p
                                        contentEditable
                                        suppressContentEditableWarning
                                        className='rounded p-2 transition-colors hover:bg-slate-50 focus:bg-amber-50 focus:outline-none'>
                                        This certificate is issued upon the request of Student only.
                                    </p>
                                </div>

                                {/* Principal Signature Footer */}
                                <div className='mt-24 mb-8 flex justify-end pr-6'>
                                    <div className='flex flex-col items-center text-center'>
                                        <div className='h-12 w-32'>{/* Signature/Seal area */}</div>
                                        <span className='font-bold font-serif text-[15px] text-slate-900 uppercase tracking-wider'>
                                            PRINCIPAL
                                        </span>
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

CertificatePrint.displayName = 'CertificatePrint';
